"""
Upload final rendered video + thumbnail to Supabase Storage.
Returns signed public URL.
"""

import os
import subprocess
from supabase import create_client


def generate_thumbnail(video_path: str, output_path: str, time: float = 2.0):
    """Extract a single frame from the video as a JPEG thumbnail."""
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
    """Upload a file to Supabase Storage and return its public URL."""
    client = create_client(supabase_url, supabase_key)

    with open(file_path, "rb") as f:
        data = f.read()

    # Upload (upsert to overwrite if exists)
    client.storage.from_(bucket).upload(
        path=storage_path,
        file=data,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    # Get public URL
    res = client.storage.from_(bucket).get_public_url(storage_path)
    return res


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
    print(f"  [upload] Video -> {video_url}")

    # Generate + upload thumbnail
    thumb_path = "/tmp/cast_assets/thumbnail.jpg"
    thumb_url = None
    if generate_thumbnail(video_path, thumb_path):
        thumb_url = upload_to_supabase(
            thumb_path, supabase_url, supabase_key,
            bucket, thumb_storage_path, "image/jpeg",
        )
        print(f"  [upload] Thumbnail -> {thumb_url}")

    return {
        "videoUrl": video_url,
        "thumbnailUrl": thumb_url,
    }
