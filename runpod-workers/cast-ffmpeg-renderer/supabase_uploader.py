"""
Upload final rendered video + thumbnail to Supabase Storage.
Uses direct HTTP with generous timeout (5 min) for large files.
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
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}")

    url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    # 5-minute timeout — plenty for 100MB+ over decent bandwidth
    timeout = httpx.Timeout(300.0, connect=30.0)
    max_retries = 3

    for attempt in range(1, max_retries + 1):
        try:
            t0 = time.time()
            with httpx.Client(timeout=timeout) as client:
                resp = client.post(url, content=data, headers=headers)

            elapsed = time.time() - t0
            if resp.status_code in (200, 201):
                speed = file_size_mb / elapsed if elapsed > 0 else 0
                print(f"  [upload] OK ({resp.status_code}) in {elapsed:.1f}s ({speed:.1f} MB/s)")
                break
            else:
                print(f"  [upload] HTTP {resp.status_code}: {resp.text[:200]} (attempt {attempt})")
                if attempt < max_retries:
                    time.sleep(2 * attempt)
        except Exception as e:
            print(f"  [upload] Attempt {attempt} error: {e}")
            if attempt < max_retries:
                time.sleep(2 * attempt)
            else:
                print(f"  [upload] All {max_retries} attempts failed")
                # Fall through to URL construction anyway

    # Return public URL
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
    print(f"  [upload] URL: {public_url[:120]}")
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
    print(f"  [upload] Video URL: {video_url}")

    if not video_url:
        print("  [upload] WARNING: No video URL returned from upload!")

    # Generate + upload thumbnail
    thumb_path = "/tmp/cast_overlays/thumbnail.jpg"
    os.makedirs("/tmp/cast_overlays", exist_ok=True)
    thumb_url = None
    if generate_thumbnail(video_path, thumb_path):
        thumb_url = upload_to_supabase(
            thumb_path, supabase_url, supabase_key,
            bucket, thumb_storage_path, "image/jpeg",
        )
        print(f"  [upload] Thumbnail URL: {thumb_url}")

    return {
        "videoUrl": video_url,
        "thumbnailUrl": thumb_url,
    }
