"""
Upload final rendered video + thumbnail to Supabase Storage.
Uses Supabase Python SDK with retry logic for large files.
"""

import os
import time
import subprocess
from supabase import create_client


# Increase default httpx timeout for large uploads (SDK uses httpx internally)
_UPLOAD_TIMEOUT = 300  # 5 minutes


def _create_client_with_timeout(supabase_url: str, supabase_key: str):
    """Create Supabase client and increase storage upload timeout."""
    client = create_client(supabase_url, supabase_key)
    # Monkey-patch httpx timeout on the storage client's internal _client
    try:
        import httpx
        storage = client.storage.from_("cast-assets")
        # The storage bucket client uses ._client (SyncClient) which has ._client (httpx.Client)
        if hasattr(storage, '_client') and hasattr(storage._client, '_client'):
            old_client = storage._client._client
            storage._client._client = httpx.Client(
                base_url=old_client._base_url,
                headers=dict(old_client.headers),
                timeout=httpx.Timeout(_UPLOAD_TIMEOUT, connect=30.0),
            )
            print(f"  [upload] SDK timeout set to {_UPLOAD_TIMEOUT}s", flush=True)
    except Exception as e:
        print(f"  [upload] Could not set timeout (will use default): {e}", flush=True)
    return client


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
    """Upload a file to Supabase Storage with retry logic."""
    with open(file_path, "rb") as f:
        data = f.read()

    file_size_mb = len(data) / (1024 * 1024)
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}", flush=True)

    max_retries = 3
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            t0 = time.time()
            client = _create_client_with_timeout(supabase_url, supabase_key)
            print(f"  [upload] Attempt {attempt}/{max_retries} via SDK...", flush=True)

            client.storage.from_(bucket).upload(
                path=storage_path,
                file=data,
                file_options={"content-type": content_type, "upsert": "true"},
            )
            elapsed = time.time() - t0
            speed = file_size_mb / elapsed if elapsed > 0 else 0
            print(f"  [upload] SDK OK in {elapsed:.1f}s ({speed:.1f} MB/s)", flush=True)
            last_error = None
            break

        except Exception as e:
            last_error = e
            elapsed = time.time() - t0
            print(f"  [upload] Attempt {attempt} failed ({elapsed:.1f}s): {type(e).__name__}: {e}", flush=True)

            # Try removing existing file before retry (some errors are "already exists")
            if attempt < max_retries:
                try:
                    client.storage.from_(bucket).remove([storage_path])
                    print(f"  [upload] Removed existing file before retry", flush=True)
                except Exception:
                    pass
                time.sleep(3 * attempt)

    if last_error:
        print(f"  [upload] ALL {max_retries} SDK attempts FAILED: {last_error}", flush=True)
        # Last resort: direct HTTP upload
        try:
            import httpx
            url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
            headers = {
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": content_type,
                "x-upsert": "true",
            }
            print(f"  [upload] Fallback: direct HTTP POST...", flush=True)
            with httpx.Client(timeout=httpx.Timeout(300.0, connect=30.0)) as hc:
                resp = hc.post(url, content=data, headers=headers)
            print(f"  [upload] HTTP fallback: {resp.status_code} — {resp.text[:200]}", flush=True)
            if resp.status_code not in (200, 201):
                print(f"  [upload] HTTP fallback FAILED", flush=True)
                return None
        except Exception as http_err:
            print(f"  [upload] HTTP fallback EXCEPTION: {http_err}", flush=True)
            return None

    # Return public URL
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
    print(f"  [upload] Public URL: {public_url}", flush=True)

    # Verify the file exists
    try:
        import httpx
        with httpx.Client(timeout=httpx.Timeout(10.0)) as hc:
            head = hc.head(public_url)
        content_len = head.headers.get("content-length", "?")
        print(f"  [upload] VERIFIED: HTTP {head.status_code}, size={content_len} bytes", flush=True)
        if head.status_code != 200:
            print(f"  [upload] WARNING: File may not be accessible (HTTP {head.status_code})", flush=True)
    except Exception as ve:
        print(f"  [upload] Verify skipped: {ve}", flush=True)

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
        print("  [upload] ERROR: Video upload FAILED — no URL returned!", flush=True)

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
