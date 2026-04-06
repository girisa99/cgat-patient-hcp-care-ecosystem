"""
Upload final rendered video + thumbnail to Supabase Storage.

Strategy (in order):
1. curl streaming upload (most reliable for large files on Linux/RunPod)
2. TUS resumable upload (fallback if curl unavailable)
3. Direct HTTP POST (for small files <50MB only)
"""

import os
import json
import time
import base64
import shutil
import subprocess
import httpx


# ── Storage bucket names (configurable via env vars) ──
BUCKET_PARTS = os.environ.get("CAST_BUCKET_PARTS", "cast-assets")
BUCKET_RENDERS = os.environ.get("CAST_BUCKET_RENDERS", "cast-renders")

# ── Threshold: files above this use TUS/curl instead of direct POST ──
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


# ═══════════════════════════════════════════════════════════════════════════════
# METHOD 1: curl streaming upload (PRIMARY for large files)
# ═══════════════════════════════════════════════════════════════════════════════

def _upload_curl(
    file_path: str,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str,
) -> str | None:
    """Upload via curl subprocess — streams file from disk, no memory buffering.
    Most reliable method for large files (500MB+) on Linux/RunPod."""
    file_size = os.path.getsize(file_path)
    file_size_mb = file_size / (1024 * 1024)
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"

    # Check curl is available
    if not shutil.which("curl"):
        print("  [upload-curl] curl not found, skipping", flush=True)
        return None

    # Timeout: ~2 MB/s minimum upload speed as baseline
    timeout_secs = max(300, int(file_size_mb / 2) + 120)
    print(f"  [upload-curl] Uploading {file_size_mb:.1f}MB via curl "
          f"(timeout={timeout_secs}s)", flush=True)

    for attempt in range(3):
        if attempt > 0:
            delay = 5 * (attempt + 1)
            print(f"  [upload-curl] Retry {attempt + 1}/3 after {delay}s...", flush=True)
            time.sleep(delay)

        t0 = time.time()
        cmd = [
            "curl", "-s", "-S",  # silent but show errors
            "-X", "POST",
            upload_url,
            "-H", f"Authorization: Bearer {supabase_key}",
            "-H", f"Content-Type: {content_type}",
            "-H", "x-upsert: true",
            "--data-binary", f"@{file_path}",
            "--max-time", str(timeout_secs),
            "--connect-timeout", "30",
            "--retry", "2",
            "--retry-delay", "5",
            "--retry-max-time", str(timeout_secs + 60),
            "-w", "\n%{http_code}",  # append HTTP status code
        ]

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                timeout=timeout_secs + 120,  # subprocess timeout > curl timeout
            )
            elapsed = time.time() - t0
            output = result.stdout.strip()

            # Parse HTTP status from last line (added by -w)
            lines = output.rsplit("\n", 1)
            body = lines[0] if len(lines) > 1 else ""
            http_code = lines[-1].strip() if lines else "0"

            print(f"  [upload-curl] Attempt {attempt + 1}: HTTP {http_code} "
                  f"in {elapsed:.1f}s — {body[:300]}", flush=True)

            if result.stderr:
                print(f"  [upload-curl] stderr: {result.stderr[:300]}", flush=True)

            if http_code in ("200", "201"):
                speed = file_size_mb / elapsed if elapsed > 0 else 0
                print(f"  [upload-curl] SUCCESS: {file_size_mb:.1f}MB in {elapsed:.1f}s "
                      f"({speed:.1f} MB/s)", flush=True)

                # Verify upload accessible
                _verify_upload(public_url)
                return public_url

            # 413 = too large for direct POST, try TUS
            if http_code == "413":
                print(f"  [upload-curl] 413 Payload Too Large — "
                      f"bucket may have size limit", flush=True)
                return None

            # 404 = bucket doesn't exist
            if http_code == "404":
                print(f"  [upload-curl] 404 — bucket '{bucket}' may not exist. "
                      f"Trying fallback bucket...", flush=True)
                return None

        except subprocess.TimeoutExpired:
            elapsed = time.time() - t0
            print(f"  [upload-curl] TIMEOUT after {elapsed:.1f}s", flush=True)
        except Exception as e:
            elapsed = time.time() - t0
            print(f"  [upload-curl] ERROR: {type(e).__name__}: {e}", flush=True)

    print(f"  [upload-curl] ALL 3 attempts FAILED", flush=True)
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# METHOD 2: TUS resumable upload (fallback for large files)
# ═══════════════════════════════════════════════════════════════════════════════

def _upload_tus(
    file_path: str,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str,
) -> str | None:
    """Upload via TUS resumable protocol. Dynamic chunk sizing."""
    file_size = os.path.getsize(file_path)
    file_size_mb = file_size / (1024 * 1024)

    # Dynamic chunk size
    if file_size > 1024 * 1024 * 1024:
        chunk_size = 100 * 1024 * 1024
    elif file_size > 400 * 1024 * 1024:
        chunk_size = 50 * 1024 * 1024
    elif file_size > 200 * 1024 * 1024:
        chunk_size = 25 * 1024 * 1024
    elif file_size > 100 * 1024 * 1024:
        chunk_size = 12 * 1024 * 1024
    else:
        chunk_size = TUS_CHUNK_SIZE

    total_chunks = (file_size + chunk_size - 1) // chunk_size
    print(f"  [upload-tus] Starting TUS upload: {file_size_mb:.1f}MB in ~{total_chunks} chunks "
          f"({chunk_size // (1024*1024)}MB each)", flush=True)

    # Step 1: Create TUS upload session
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
            print(f"  [upload-tus] Create session attempt {session_attempt+1}: "
                  f"HTTP {resp.status_code}", flush=True)
            if resp.status_code in (200, 201):
                upload_url = resp.headers.get("Location")
                if upload_url:
                    break
                print(f"  [upload-tus] No Location header in response", flush=True)
            else:
                print(f"  [upload-tus] Create FAILED: {resp.text[:300]}", flush=True)
        except Exception as e:
            print(f"  [upload-tus] Create session attempt {session_attempt+1} ERROR: "
                  f"{type(e).__name__}: {e}", flush=True)
        if session_attempt < 2:
            time.sleep(3 * (session_attempt + 1))

    if not upload_url:
        print(f"  [upload-tus] All session create attempts failed", flush=True)
        return None

    print(f"  [upload-tus] Session created, uploading {total_chunks} chunks...", flush=True)

    # Step 2: Upload chunks — create fresh client per chunk to avoid stale connections
    offset = 0
    t0 = time.time()
    per_chunk_timeout = max(120.0, chunk_size / (1024 * 1024) * 12.0)

    with open(file_path, "rb") as f:
        chunk_num = 0
        while offset < file_size:
            chunk = f.read(chunk_size)
            chunk_len = len(chunk)
            chunk_num += 1

            for retry in range(5):
                try:
                    # Fresh client per retry to avoid stale connection issues
                    with httpx.Client(timeout=httpx.Timeout(per_chunk_timeout, connect=30.0)) as hc:
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
                        if total_chunks <= 30 or chunk_num % 5 == 0 or pct >= 100:
                            print(f"  [upload-tus] Chunk {chunk_num}/{total_chunks}: "
                                  f"{pct}% ({speed:.1f} MB/s)", flush=True)
                        break
                    else:
                        print(f"  [upload-tus] Chunk {chunk_num} retry {retry+1}: "
                              f"HTTP {patch_resp.status_code} — {patch_resp.text[:200]}", flush=True)
                        if retry < 4:
                            time.sleep(2 * (retry + 1))
                except Exception as e:
                    print(f"  [upload-tus] Chunk {chunk_num} retry {retry+1} ERROR: "
                          f"{type(e).__name__}: {e}", flush=True)
                    if retry < 4:
                        time.sleep(2 * (retry + 1))
            else:
                print(f"  [upload-tus] FAILED at chunk {chunk_num}/{total_chunks} "
                      f"(offset {offset})", flush=True)
                return None

    elapsed = time.time() - t0
    speed = file_size_mb / elapsed if elapsed > 0 else 0
    print(f"  [upload-tus] COMPLETE in {elapsed:.1f}s ({speed:.1f} MB/s)", flush=True)

    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
    _verify_upload(public_url)
    return public_url


# ═══════════════════════════════════════════════════════════════════════════════
# METHOD 3: Direct HTTP POST (for small files only)
# ═══════════════════════════════════════════════════════════════════════════════

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

            print(f"  [upload] Attempt {attempt}/{max_retries}: POST {file_size_mb:.0f}MB...",
                  flush=True)
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
            print(f"  [upload] HTTP {resp.status_code} in {elapsed:.1f}s — {body_preview}",
                  flush=True)

            if resp.status_code in (200, 201):
                speed = file_size_mb / elapsed if elapsed > 0 else 0
                print(f"  [upload] OK in {elapsed:.1f}s ({speed:.1f} MB/s)", flush=True)
                _verify_upload(public_url)
                return public_url

            if resp.status_code == 400 and "413" in resp.text:
                print(f"  [upload] 413 Payload too large — will fall back to TUS",
                      flush=True)
                return None

            print(f"  [upload] FAILED: HTTP {resp.status_code}", flush=True)

        except httpx.TimeoutException as te:
            elapsed = time.time() - t0
            print(f"  [upload] TIMEOUT after {elapsed:.1f}s: {te}", flush=True)
        except Exception as e:
            elapsed = time.time() - t0 if 't0' in dir() else 0
            print(f"  [upload] ERROR after {elapsed:.1f}s: {type(e).__name__}: {e}",
                  flush=True)

    print(f"  [upload] ALL {max_retries} attempts FAILED for {storage_path}", flush=True)
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════════════

def _verify_upload(public_url: str):
    """Quick HEAD check to verify the file is accessible."""
    for v in range(3):
        try:
            with httpx.Client(timeout=httpx.Timeout(15.0)) as hc:
                head = hc.head(public_url)
            cl = head.headers.get("content-length", "?")
            print(f"  [verify] HTTP {head.status_code}, size={cl}", flush=True)
            return
        except Exception as ve:
            print(f"  [verify] Attempt {v+1}: {ve}", flush=True)
            if v < 2:
                time.sleep(2)


# ═══════════════════════════════════════════════════════════════════════════════
# Main upload orchestrator
# ═══════════════════════════════════════════════════════════════════════════════

def upload_to_supabase(
    file_path: str,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str = "video/mp4",
) -> str | None:
    """Upload a file to Supabase Storage.

    Strategy for large files (>=50MB):
      1. curl streaming upload (most reliable)
      2. TUS resumable upload (fallback)
      3. Try alternate bucket if primary fails (cast-assets as backup)

    Strategy for small files (<50MB):
      1. Direct HTTP POST
      2. TUS if POST fails (413)
    """
    file_size = os.path.getsize(file_path)
    file_size_mb = file_size / (1024 * 1024)
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}", flush=True)

    if file_size_mb >= TUS_THRESHOLD_MB:
        # ── Large file path ──

        # Method 1: curl (primary — most reliable for large files)
        url = _upload_curl(file_path, supabase_url, supabase_key,
                           bucket, storage_path, content_type)
        if url:
            return url

        # Method 2: TUS resumable (fallback)
        for tus_attempt in range(2):
            if tus_attempt > 0:
                print(f"  [upload] TUS retry after 10s delay...", flush=True)
                time.sleep(10)
            url = _upload_tus(file_path, supabase_url, supabase_key,
                              bucket, storage_path, content_type)
            if url:
                return url

        # Method 3: Try alternate bucket (cast-assets) if cast-renders fails
        alt_bucket = BUCKET_PARTS if bucket == BUCKET_RENDERS else BUCKET_RENDERS
        if alt_bucket != bucket:
            print(f"  [upload] Primary bucket '{bucket}' failed — "
                  f"trying alternate bucket '{alt_bucket}'", flush=True)
            url = _upload_curl(file_path, supabase_url, supabase_key,
                               alt_bucket, storage_path, content_type)
            if url:
                return url
            url = _upload_tus(file_path, supabase_url, supabase_key,
                              alt_bucket, storage_path, content_type)
            if url:
                return url

        print(f"  [upload] ALL methods FAILED for {file_size_mb:.0f}MB file", flush=True)
        return None

    # ── Small file path (<50MB) ──
    with open(file_path, "rb") as f:
        data = f.read()
    url = _upload_direct(file_path, data, supabase_url, supabase_key,
                         bucket, storage_path, content_type)
    if url:
        return url

    # Fallback to TUS for small files that hit 413
    url = _upload_tus(file_path, supabase_url, supabase_key,
                      bucket, storage_path, content_type)
    if url:
        return url

    print(f"  [upload] ALL methods FAILED for {storage_path}", flush=True)
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# Public API
# ═══════════════════════════════════════════════════════════════════════════════

def upload_clip(
    file_path: str,
    cast_project_id: str,
    clip_id: str,
    supabase_url: str,
    supabase_key: str,
    content_type: str = "video/mp4",
) -> str | None:
    """Upload a clip/artifact to cast-assets bucket."""
    bucket = BUCKET_PARTS
    ext_map = {
        "video/mp4": "mp4", "image/jpeg": "jpg", "image/gif": "gif",
        "audio/mpeg": "mp3", "audio/wav": "wav", "image/png": "png",
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
    """Upload the final video + thumbnail to Supabase Storage.
    Returns { videoUrl, thumbnailUrl }."""
    # Individual parts → cast-assets; final stitch → cast-renders
    bucket = BUCKET_PARTS if part_number is not None else BUCKET_RENDERS
    suffix = f"part{part_number}" if part_number else "final"
    video_storage_path = f"{cast_project_id}/{suffix}.mp4"
    thumb_storage_path = f"{cast_project_id}/{suffix}_thumb.jpg"

    # Upload video
    video_url = upload_to_supabase(
        video_path, supabase_url, supabase_key,
        bucket, video_storage_path, "video/mp4",
    )

    if not video_url:
        print("  [upload] ERROR: Video upload FAILED after all methods!", flush=True)

    # Generate + upload thumbnail
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
