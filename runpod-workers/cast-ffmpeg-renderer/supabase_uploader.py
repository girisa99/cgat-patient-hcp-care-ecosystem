"""
Upload final rendered video + thumbnail to Supabase Storage.
Uses direct HTTP with generous timeout (5 min) for large files.
Verifies upload by HEAD request after each attempt.
"""

import os
import time
import subprocess
import httpx


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


def upload_to_supabase(
    file_path: str,
    supabase_url: str,
    supabase_key: str,
    bucket: str,
    storage_path: str,
    content_type: str = "video/mp4",
) -> str | None:
    """Upload a file to Supabase Storage via direct HTTP (bypasses SDK timeout)."""
    with open(file_path, "rb") as f:
        data = f.read()

    file_size_mb = len(data) / (1024 * 1024)
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}", flush=True)

    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    # 5-minute timeout — plenty for 100MB+ over decent bandwidth
    timeout = httpx.Timeout(300.0, connect=30.0)
    max_retries = 3
    upload_ok = False

    for attempt in range(1, max_retries + 1):
        try:
            print(f"  [upload] Attempt {attempt}/{max_retries}: POST {upload_url[-60:]} ({file_size_mb:.1f}MB)", flush=True)
            t0 = time.time()
            with httpx.Client(timeout=timeout) as client:
                resp = client.post(upload_url, content=data, headers=headers)

            elapsed = time.time() - t0
            print(f"  [upload] Response: HTTP {resp.status_code} in {elapsed:.1f}s, body={resp.text[:300]}", flush=True)

            if resp.status_code in (200, 201):
                speed = file_size_mb / elapsed if elapsed > 0 else 0
                print(f"  [upload] OK ({resp.status_code}) in {elapsed:.1f}s ({speed:.1f} MB/s)", flush=True)
                upload_ok = True
                break
            else:
                print(f"  [upload] FAILED HTTP {resp.status_code}: {resp.text[:300]} (attempt {attempt})", flush=True)
                if attempt < max_retries:
                    time.sleep(3 * attempt)
        except Exception as e:
            print(f"  [upload] Attempt {attempt} EXCEPTION: {type(e).__name__}: {e}", flush=True)
            if attempt < max_retries:
                time.sleep(3 * attempt)

    if not upload_ok:
        print(f"  [upload] ALL {max_retries} attempts FAILED for {storage_path}", flush=True)
        # Try one last time with the Supabase SDK as a completely different approach
        try:
            print(f"  [upload] Fallback: trying Supabase SDK upload...", flush=True)
            from supabase import create_client
            sb = create_client(supabase_url, supabase_key)
            # Remove existing file first, then upload
            try:
                sb.storage.from_(bucket).remove([storage_path])
            except Exception:
                pass
            sb.storage.from_(bucket).upload(
                path=storage_path,
                file=data,
                file_options={"content-type": content_type, "upsert": "true"},
            )
            print(f"  [upload] SDK fallback succeeded!", flush=True)
            upload_ok = True
        except Exception as sdk_err:
            print(f"  [upload] SDK fallback ALSO failed: {sdk_err}", flush=True)

    if not upload_ok:
        print(f"  [upload] GIVING UP on {storage_path} — returning None", flush=True)
        return None

    # Verify upload by HEAD request
    try:
        with httpx.Client(timeout=httpx.Timeout(10.0)) as client:
            head_resp = client.head(public_url)
        if head_resp.status_code == 200:
            content_len = head_resp.headers.get("content-length", "?")
            print(f"  [upload] VERIFIED: {public_url[-80:]} exists ({content_len} bytes)", flush=True)
        else:
            print(f"  [upload] WARNING: HEAD {public_url[-80:]} returned {head_resp.status_code}", flush=True)
    except Exception as e:
        print(f"  [upload] WARNING: HEAD verification failed: {e}", flush=True)

    return public_url


def upload_final_video(
    video_path: str,
    cast_project_id: str,
    supabase_url: str,
    supabase_key: str,
) -> dict:
    """
    Upload the final video + thumbnail to Supabase Storage.
    Returns { videoUrl, thumbnailUrl }.
    """
    bucket = "cast-assets"
    video_storage_path = f"{cast_project_id}/final.mp4"
    thumb_storage_path = f"{cast_project_id}/thumbnail.jpg"

    # Upload video
    video_url = upload_to_supabase(
        video_path, supabase_url, supabase_key,
        bucket, video_storage_path, "video/mp4",
    )
    print(f"  [upload] Video URL: {video_url}", flush=True)

    if not video_url:
        print("  [upload] ERROR: Video upload failed — no URL!", flush=True)

    # Generate + upload thumbnail
    thumb_path = "/tmp/cast_overlays/thumbnail.jpg"
    os.makedirs("/tmp/cast_overlays", exist_ok=True)
    thumb_url = None
    if generate_thumbnail(video_path, thumb_path):
        thumb_url = upload_to_supabase(
            thumb_path, supabase_url, supabase_key,
            bucket, thumb_storage_path, "image/jpeg",
        )
        print(f"  [upload] Thumbnail URL: {thumb_url}", flush=True)

    return {
        "videoUrl": video_url,
        "thumbnailUrl": thumb_url,
    }
