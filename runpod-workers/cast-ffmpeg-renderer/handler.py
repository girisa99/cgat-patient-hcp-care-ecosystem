"""
RunPod Serverless Handler — Cast FFmpeg Renderer

Receives a castTimelineEngine timeline JSON, renders each scene with FFmpeg
(using NVENC hardware encoding on L4 GPU), concatenates with xfade transitions,
and uploads the final MP4 to Supabase Storage.

Input:
  {
    "timeline": { ... },           # castTimelineEngine output (J2V-compatible)
    "supabaseUrl": "https://...",
    "supabaseServiceKey": "...",
    "castProjectId": "uuid"
  }

Output:
  {
    "videoUrl": "https://...",
    "thumbnailUrl": "https://...",
    "duration": 123.4
  }
"""

import os
import time
import shutil
import runpod
from asset_downloader import collect_asset_urls, download_all
from timeline_parser import parse_timeline
from ffmpeg_builder import render_scene, concatenate_scenes, get_video_duration
from supabase_uploader import upload_final_video


def handler(job: dict) -> dict:
    """RunPod serverless handler entry point."""
    job_input = job.get("input", {})
    timeline = job_input.get("timeline")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")
    cast_project_id = job_input.get("castProjectId", "unknown")

    if not timeline or not timeline.get("scenes"):
        return {"error": "Missing or empty timeline"}

    scene_count = len(timeline["scenes"])
    total_dur = sum(s.get("duration", 0) for s in timeline["scenes"])
    print(f"[CastRenderer] Starting: {scene_count} scenes, {total_dur:.0f}s, project={cast_project_id}")
    t0 = time.time()

    try:
        # ── 1. Download assets ──
        print("[CastRenderer] Phase 1: Downloading assets...")
        urls = collect_asset_urls(timeline)
        print(f"  Found {len(urls)} remote URLs to download")
        url_map = download_all(urls)
        print(f"  Downloaded {len(url_map)}/{len(urls)} assets in {time.time() - t0:.1f}s")

        # ── 2. Parse timeline into scene instructions ──
        print("[CastRenderer] Phase 2: Parsing timeline...")
        scenes = parse_timeline(timeline, url_map)

        # Determine resolution from timeline
        res = timeline.get("resolution", "full-hd")
        if res == "full-hd":
            width, height = 1920, 1080
        elif res == "hd":
            width, height = 1280, 720
        elif res == "4k":
            width, height = 3840, 2160
        else:
            width, height = 1920, 1080

        # ── 3. Render each scene ──
        print(f"[CastRenderer] Phase 3: Rendering {len(scenes)} scenes at {width}x{height}...")
        scene_paths: list[str] = []
        for scene in scenes:
            t_scene = time.time()
            path = render_scene(scene, width, height)
            elapsed = time.time() - t_scene
            if path:
                scene_paths.append(path)
                print(f"  Scene {scene.index} rendered in {elapsed:.1f}s")
            else:
                print(f"  Scene {scene.index} FAILED after {elapsed:.1f}s — skipping")

        if not scene_paths:
            return {"error": "All scenes failed to render"}

        print(f"  {len(scene_paths)}/{len(scenes)} scenes rendered in {time.time() - t0:.1f}s")

        # ── 4. Concatenate with transitions ──
        print("[CastRenderer] Phase 4: Concatenating scenes...")
        t_concat = time.time()
        final_path = concatenate_scenes(scene_paths, scenes, width, height)
        if not final_path:
            return {"error": "Failed to concatenate scenes"}
        print(f"  Concatenation done in {time.time() - t_concat:.1f}s")

        duration = get_video_duration(final_path)
        file_size_mb = os.path.getsize(final_path) / (1024 * 1024)
        print(f"  Final video: {duration:.1f}s, {file_size_mb:.1f}MB")

        # ── 5. Upload to Supabase Storage ──
        print("[CastRenderer] Phase 5: Uploading to Supabase Storage...")
        t_upload = time.time()
        result = upload_final_video(final_path, cast_project_id, supabase_url, supabase_key)
        print(f"  Upload done in {time.time() - t_upload:.1f}s")

        total_time = time.time() - t0
        print(f"[CastRenderer] DONE in {total_time:.1f}s — {result.get('videoUrl', 'NO URL')}")

        # ── Cleanup temp files ──
        _cleanup()

        return {
            "videoUrl": result.get("videoUrl"),
            "thumbnailUrl": result.get("thumbnailUrl"),
            "duration": duration,
            "renderTime": round(total_time, 1),
            "scenesRendered": len(scene_paths),
            "scenesTotal": len(scenes),
        }

    except Exception as e:
        print(f"[CastRenderer] ERROR: {e}")
        _cleanup()
        return {"error": str(e)}


def _cleanup():
    """Remove temp files to free disk space between jobs."""
    for d in ["/tmp/cast_assets", "/tmp/cast_render"]:
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)


# Register with RunPod
runpod.serverless.start({"handler": handler})
