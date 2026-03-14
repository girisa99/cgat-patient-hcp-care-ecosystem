"""
Upload final rendered video + thumbnail to Supabase Storage.
Uses direct HTTP POST (not SDK) for reliable timeout control on large files.
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
    """Upload a file to Supabase Storage via direct HTTP POST."""
    with open(file_path, "rb") as f:
        data = f.read()

    file_size_mb = len(data) / (1024 * 1024)
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}", flush=True)

    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"

    # Scale timeout with file size: 60s base + 3s per MB (155MB → ~8 min)
    timeout_secs = max(120, 60 + int(file_size_mb * 3))
    print(f"  [upload] Timeout: {timeout_secs}s for {file_size_mb:.0f}MB", flush=True)

    max_retries = 3

    for attempt in range(1, max_retries + 1):
        try:
            # Remove existing file first (avoids "already exists" errors)
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

                # Verify upload
                try:
                    with httpx.Client(timeout=httpx.Timeout(10.0)) as hc:
                        head = hc.head(public_url)
                    cl = head.headers.get("content-length", "?")
                    print(f"  [upload] VERIFIED: HTTP {head.status_code}, size={cl}", flush=True)
                except Exception as ve:
                    print(f"  [upload] Verify skipped: {ve}", flush=True)

                return public_url

            print(f"  [upload] FAILED: HTTP {resp.status_code}", flush=True)

        except httpx.TimeoutException as te:
            elapsed = time.time() - t0
            print(f"  [upload] TIMEOUT after {elapsed:.1f}s: {te}", flush=True)
        except Exception as e:
            elapsed = time.time() - t0 if 't0' in dir() else 0
            print(f"  [upload] ERROR after {elapsed:.1f}s: {type(e).__name__}: {e}", flush=True)

    print(f"  [upload] ALL {max_retries} attempts FAILED for {storage_path}", flush=True)
    return None


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

    # Generate + upload thumbnail
    thumb_path = "/tmp/cast_overlays/thumbnail.jpg"
    os.makedirs("/tmp/cast_overlays", exist_ok=True)
    thumb_url = None
    if generate_thumbnail(video_path, thumb_path):
        thumb_url = upload_to_supabase(
            thumb_path, supabase_url, supabase_key,
            bucket, thumb_storage_path, "image/jpeg",
        )

    return {
        "videoUrl": video_url,
        "thumbnailUrl": thumb_url,
    }
