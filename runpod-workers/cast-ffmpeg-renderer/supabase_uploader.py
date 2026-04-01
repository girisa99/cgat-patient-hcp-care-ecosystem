"""
Upload final rendered video + thumbnail to Supabase Storage.
Uses TUS resumable upload for large files (>50MB) and direct HTTP POST for small files.
"""

import os
import time
import base64
import subprocess
import httpx


# ── Threshold: files above this use TUS resumable upload ──
TUS_THRESHOLD_MB = 50
TUS_CHUNK_SIZE = 6 * 1024 * 1024  # 6MB per chunk


def generate_thumbnail(video_path: str, output_path: str, time_sec: float = 2.0):
    """Extract a single frame from the video as a JPEG thumbnail."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(time_sec),
        "-i", video_path,
        "-frames:v", "1",
        "-q:v", "2",
        output_path,
    ]
    subprocess.run(cmd, capture_output=True, timeout=30)
    return output_path if os.path.exists(output_path) else None


def _upload_tus(
    file_path: str,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str,
) -> str | None:
    """Upload via TUS resumable protocol. Dynamic chunk sizing + connection reuse."""
    file_size = os.path.getsize(file_path)
    file_size_mb = file_size / (1024 * 1024)

    # Dynamic chunk size: fewer chunks for large files = fewer failure points
    # For a 600MB file: 50MB chunks = 12 requests vs 25MB = 24 requests
    if file_size > 400 * 1024 * 1024:       # >400MB: 50MB chunks
        chunk_size = 50 * 1024 * 1024
    elif file_size > 200 * 1024 * 1024:     # >200MB: 25MB chunks
        chunk_size = 25 * 1024 * 1024
    elif file_size > 100 * 1024 * 1024:     # >100MB: 12MB chunks
        chunk_size = 12 * 1024 * 1024
    else:
        chunk_size = TUS_CHUNK_SIZE          # default 6MB

    total_chunks = (file_size + chunk_size - 1) // chunk_size
    print(f"  [upload-tus] Starting TUS upload: {file_size_mb:.1f}MB in ~{total_chunks} chunks "
          f"({chunk_size // (1024*1024)}MB each)", flush=True)

    # Step 1: Create TUS upload session (with retry)
    metadata = (
        f"bucketName {base64.b64encode(bucket.encode()).decode()},"
        f"objectName {base64.b64encode(storage_path.encode()).decode()},"
        f"contentType {base64.b64encode(content_type.encode()).decode()}"
    )

    upload_url = None
    for session_attempt in range(3):
        try:
            with httpx.Client(timeout=httpx.Timeout(30.0)) as hc:
                resp = hc.post(
                    f"{supabase_url}/storage/v1/upload/resumable",
                    headers={
                        "Authorization": f"Bearer {supabase_key}",
                        "x-upsert": "true",
                        "Upload-Length": str(file_size),
                        "Tus-Resumable": "1.0.0",
                        "Upload-Metadata": metadata,
                    },
                    content=b"",
                )
            print(f"  [upload-tus] Create session attempt {session_attempt+1}: HTTP {resp.status_code}", flush=True)
            if resp.status_code in (200, 201):
                upload_url = resp.headers.get("Location")
                if upload_url:
                    break
                print(f"  [upload-tus] No Location header in response", flush=True)
            else:
                print(f"  [upload-tus] Create FAILED: {resp.text[:300]}", flush=True)
        except Exception as e:
            print(f"  [upload-tus] Create session attempt {session_attempt+1} ERROR: {type(e).__name__}: {e}", flush=True)
        if session_attempt < 2:
            time.sleep(3 * (session_attempt + 1))

    if not upload_url:
        print(f"  [upload-tus] All session create attempts failed", flush=True)
        return None

    print(f"  [upload-tus] Session created, uploading {total_chunks} chunks...", flush=True)

    # Step 2: Upload file in chunks via PATCH — reuse single HTTP client
    offset = 0
    t0 = time.time()
    # Per-chunk timeout scales with chunk size: at least 120s, up to 300s for 25MB chunks
    per_chunk_timeout = max(120.0, chunk_size / (1024 * 1024) * 12.0)

    with open(file_path, "rb") as f, \
         httpx.Client(timeout=httpx.Timeout(per_chunk_timeout, connect=30.0)) as hc:
        chunk_num = 0
        while offset < file_size:
            chunk = f.read(chunk_size)
            chunk_len = len(chunk)
            chunk_num += 1

            for retry in range(5):  # 5 retries per chunk (up from 3)
                try:
                    patch_resp = hc.patch(
                        upload_url,
                        headers={
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/offset+octet-stream",
                            "Upload-Offset": str(offset),
                            "Tus-Resumable": "1.0.0",
                        },
                        content=chunk,
                    )

                    if patch_resp.status_code in (200, 204):
                        offset += chunk_len
                        pct = int(offset / file_size * 100)
                        elapsed = time.time() - t0
                        speed = (offset / (1024 * 1024)) / elapsed if elapsed > 0 else 0
                        # Log every chunk for small uploads, every 5th for large
                        if total_chunks <= 30 or chunk_num % 5 == 0 or pct >= 100:
                            print(f"  [upload-tus] Chunk {chunk_num}/{total_chunks}: "
                                  f"{pct}% ({speed:.1f} MB/s)", flush=True)
                        break
                    else:
                        print(f"  [upload-tus] Chunk {chunk_num} retry {retry+1}: "
                              f"HTTP {patch_resp.status_code} — {patch_resp.text[:200]}", flush=True)
                        if retry < 4:
                            time.sleep(2 * (retry + 1))  # Exponential: 2s, 4s, 6s, 8s
                except Exception as e:
                    print(f"  [upload-tus] Chunk {chunk_num} retry {retry+1} ERROR: "
                          f"{type(e).__name__}: {e}", flush=True)
                    if retry < 4:
                        time.sleep(2 * (retry + 1))
            else:
                # All 5 retries failed for this chunk
                print(f"  [upload-tus] FAILED at chunk {chunk_num}/{total_chunks} "
                      f"(offset {offset})", flush=True)
                return None

    elapsed = time.time() - t0
    speed = file_size_mb / elapsed if elapsed > 0 else 0
    print(f"  [upload-tus] COMPLETE in {elapsed:.1f}s ({speed:.1f} MB/s)", flush=True)

    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"

    # Verify upload with retry
    for v in range(3):
        try:
            with httpx.Client(timeout=httpx.Timeout(15.0)) as hc:
                head = hc.head(public_url)
            cl = head.headers.get("content-length", "?")
            print(f"  [upload-tus] VERIFIED: HTTP {head.status_code}, size={cl}", flush=True)
            break
        except Exception as ve:
            print(f"  [upload-tus] Verify attempt {v+1}: {ve}", flush=True)
            if v < 2:
                time.sleep(2)

    return public_url


def _upload_direct(
    file_path: str,
    data: bytes,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str,
) -> str | None:
    """Upload via direct HTTP POST (for small files <50MB)."""
    file_size_mb = len(data) / (1024 * 1024)
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"

    timeout_secs = max(120, 60 + int(file_size_mb * 3))
    print(f"  [upload] Direct POST: {file_size_mb:.1f}MB, timeout={timeout_secs}s", flush=True)

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            if attempt > 1:
                try:
                    with httpx.Client(timeout=httpx.Timeout(10.0)) as hc:
                        hc.delete(
                            f"{supabase_url}/storage/v1/object/{bucket}",
                            headers={
                                "Authorization": f"Bearer {supabase_key}",
                                "Content-Type": "application/json",
                            },
                            json={"prefixes": [storage_path]},
                        )
                    print(f"  [upload] Removed existing file before retry", flush=True)
                except Exception:
                    pass
                time.sleep(3)

            print(f"  [upload] Attempt {attempt}/{max_retries}: POST {file_size_mb:.0f}MB...", flush=True)
            t0 = time.time()

            with httpx.Client(timeout=httpx.Timeout(timeout_secs, connect=30.0)) as hc:
                resp = hc.post(
                    upload_url,
                    content=data,
                    headers={
                        "Authorization": f"Bearer {supabase_key}",
                        "Content-Type": content_type,
                        "x-upsert": "true",
                    },
                )

            elapsed = time.time() - t0
            body_preview = resp.text[:300] if resp.text else ""
            print(f"  [upload] HTTP {resp.status_code} in {elapsed:.1f}s — {body_preview}", flush=True)

            if resp.status_code in (200, 201):
                speed = file_size_mb / elapsed if elapsed > 0 else 0
                print(f"  [upload] OK in {elapsed:.1f}s ({speed:.1f} MB/s)", flush=True)

                try:
                    with httpx.Client(timeout=httpx.Timeout(10.0)) as hc:
                        head = hc.head(public_url)
                    cl = head.headers.get("content-length", "?")
                    print(f"  [upload] VERIFIED: HTTP {head.status_code}, size={cl}", flush=True)
                except Exception as ve:
                    print(f"  [upload] Verify skipped: {ve}", flush=True)

                return public_url

            # If 413, suggest TUS
            if resp.status_code == 400 and "413" in resp.text:
                print(f"  [upload] 413 Payload too large — will fall back to TUS", flush=True)
                return None

            print(f"  [upload] FAILED: HTTP {resp.status_code}", flush=True)

        except httpx.TimeoutException as te:
            elapsed = time.time() - t0
            print(f"  [upload] TIMEOUT after {elapsed:.1f}s: {te}", flush=True)
        except Exception as e:
            elapsed = time.time() - t0 if 't0' in dir() else 0
            print(f"  [upload] ERROR after {elapsed:.1f}s: {type(e).__name__}: {e}", flush=True)

    print(f"  [upload] ALL {max_retries} attempts FAILED for {storage_path}", flush=True)
    return None


def upload_to_supabase(
    file_path: str,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str = "video/mp4",
) -> str | None:
    """Upload a file to Supabase Storage. Uses TUS for large files, direct POST for small."""
    file_size = os.path.getsize(file_path)
    file_size_mb = file_size / (1024 * 1024)
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}", flush=True)

    # Large files: use TUS resumable upload (bypasses single-request size limits)
    if file_size_mb >= TUS_THRESHOLD_MB:
        print(f"  [upload] File >= {TUS_THRESHOLD_MB}MB — using TUS resumable upload", flush=True)
        url = _upload_tus(file_path, supabase_url, supabase_key, bucket, storage_path, content_type)
        if url:
            return url
        print(f"  [upload] TUS failed — trying direct POST as fallback", flush=True)

    # Small files or TUS fallback: direct POST
    with open(file_path, "rb") as f:
        data = f.read()
    url = _upload_direct(file_path, data, supabase_url, supabase_key, bucket, storage_path, content_type)
    if url:
        return url

    # Last resort for small files that hit 413: try TUS
    if file_size_mb < TUS_THRESHOLD_MB:
        print(f"  [upload] Direct POST failed — trying TUS as last resort", flush=True)
        url = _upload_tus(file_path, supabase_url, supabase_key, bucket, storage_path, content_type)
        if url:
            return url

    print(f"  [upload] ALL methods FAILED for {storage_path}", flush=True)
    return None


def upload_clip(
    file_path: str,
    cast_project_id: str,
    clip_id: str,
    supabase_url: str,
    supabase_key: str,
    content_type: str = "video/mp4",
) -> str | None:
    """
    Upload a clip/artifact with a friendly, human-readable storage path.
    URL pattern: cast-assets/{projectId}/clips/{clip_id}.ext
    Display in UI: just '{clip_id}.ext' (truncate base URL)
    """
    bucket = "cast-assets"
    # Determine extension from content type
    ext_map = {
        "video/mp4": "mp4",
        "image/jpeg": "jpg",
        "image/gif": "gif",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "image/png": "png",
    }
    ext = ext_map.get(content_type, "mp4")
    storage_path = f"{cast_project_id}/clips/{clip_id}.{ext}"

    return upload_to_supabase(
        file_path, supabase_url, supabase_key,
        bucket, storage_path, content_type,
    )


def upload_final_video(
    video_path: str,
    cast_project_id: str,
    supabase_url: str,
    supabase_key: str,
    part_number: int | None = None,
) -> dict:
    """
    Upload the final video + thumbnail to Supabase Storage.
    Returns { videoUrl, thumbnailUrl }.
    """
    bucket = "cast-assets"
    # Use part-specific path to avoid overwriting other parts
    suffix = f"part{part_number}" if part_number else "final"
    video_storage_path = f"{cast_project_id}/{suffix}.mp4"
    thumb_storage_path = f"{cast_project_id}/{suffix}_thumb.jpg"

    # Upload video
    video_url = upload_to_supabase(
        video_path, supabase_url, supabase_key,
        bucket, video_storage_path, "video/mp4",
    )

    if not video_url:
        print("  [upload] ERROR: Video upload FAILED!", flush=True)

    # Generate + upload thumbnail — pick a representative frame (15% into video)
    # Default 2s grabs chapter headers; 15% gets actual content
    thumb_path = "/tmp/cast_overlays/thumbnail.jpg"
    os.makedirs("/tmp/cast_overlays", exist_ok=True)
    thumb_url = None
    try:
        from ffmpeg_builder import get_video_duration
        vid_dur = get_video_duration(video_path)
        thumb_time = max(5.0, min(60.0, vid_dur * 0.15))
    except Exception:
        thumb_time = 10.0
    print(f"  [thumbnail] Extracting frame at t={thumb_time:.1f}s", flush=True)
    if generate_thumbnail(video_path, thumb_path, time_sec=thumb_time):
        thumb_url = upload_to_supabase(
            thumb_path, supabase_url, supabase_key,
            bucket, thumb_storage_path, "image/jpeg",
        )

    return {
        "videoUrl": video_url,
        "thumbnailUrl": thumb_url,
    }
