"""
Upload final rendered video + thumbnail to Supabase Storage.
Returns public URL (or signed URL if bucket is not public).
"""

import os
import subprocess
from supabase import create_client


def generate_thumbnail(video_path: str, output_path: str, time: float = 2.0):
    """Extract a single frame from the video as a JPEG thumbnail."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(time),
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
    """Upload a file to Supabase Storage and return its URL."""
    client = create_client(supabase_url, supabase_key)

    with open(file_path, "rb") as f:
        data = f.read()

    file_size_mb = len(data) / (1024 * 1024)
    print(f"  [upload] Uploading {file_size_mb:.1f}MB to {bucket}/{storage_path}")

    # Upload (upsert to overwrite if exists)
    try:
        client.storage.from_(bucket).upload(
            path=storage_path,
            file=data,
            file_options={"content-type": content_type, "upsert": "true"},
        )
    except Exception as e:
        print(f"  [upload] Upload error: {e}")
        # Try removing first then uploading (some versions don't support upsert)
        try:
            client.storage.from_(bucket).remove([storage_path])
        except Exception:
            pass
        client.storage.from_(bucket).upload(
            path=storage_path,
            file=data,
            file_options={"content-type": content_type},
        )

    # Try public URL first (works if bucket has public access enabled)
    try:
        public_url = client.storage.from_(bucket).get_public_url(storage_path)
        if public_url and isinstance(public_url, str) and public_url.startswith("http"):
            print(f"  [upload] Public URL: {public_url[:100]}")
            return public_url
    except Exception as e:
        print(f"  [upload] get_public_url failed: {e}")

    # Fallback: signed URL with 7-day expiry
    try:
        signed = client.storage.from_(bucket).create_signed_url(storage_path, 604800)  # 7 days
        if signed and isinstance(signed, dict):
            url = signed.get("signedURL") or signed.get("signedUrl") or signed.get("signed_url")
            if url:
                print(f"  [upload] Signed URL: {url[:100]}")
                return url
        elif isinstance(signed, str) and signed.startswith("http"):
            return signed
    except Exception as e:
        print(f"  [upload] create_signed_url failed: {e}")

    # Last resort: construct URL manually
    url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
    print(f"  [upload] Constructed URL: {url}")
    return url


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
