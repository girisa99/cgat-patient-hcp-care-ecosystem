"""
RunPod Serverless Handler — Cast FFmpeg Renderer

Receives a castTimelineEngine timeline JSON, renders each scene with FFmpeg
(using NVENC hardware encoding on L4 GPU), concatenates with xfade transitions,
and uploads the final MP4 to Supabase Storage.

Pipeline phases:
  0. Pre-render: Pillow generates text/component overlays as transparent PNGs
  1. Download: Parallel asset fetching from Supabase Storage URLs
  2. Parse: Timeline JSON -> SceneInstructions (with corrected zoom/pan/settings)
  3. Render: Each scene -> MP4 with Ken Burns, PiP, overlays, cinematic grading
  4. Concatenate: xfade transitions between scenes (using probed durations)
  5. Upload: Final MP4 + thumbnail -> Supabase Storage

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
import sys
import time
import shutil

print("[CastRenderer] Starting handler.py — importing modules...", flush=True)

try:
    import runpod
    print(f"[CastRenderer] runpod {runpod.__version__} loaded", flush=True)
except Exception as e:
    print(f"[CastRenderer] FATAL: Failed to import runpod: {e}", flush=True)
    sys.exit(1)

try:
    from asset_downloader import collect_asset_urls, download_all
    print("[CastRenderer] asset_downloader loaded", flush=True)
except Exception as e:
    print(f"[CastRenderer] FATAL: Failed to import asset_downloader: {e}", flush=True)
    sys.exit(1)

try:
    from timeline_parser import parse_timeline
    print("[CastRenderer] timeline_parser loaded", flush=True)
except Exception as e:
    print(f"[CastRenderer] FATAL: Failed to import timeline_parser: {e}", flush=True)
    sys.exit(1)

try:
    from ffmpeg_builder import render_scene, concatenate_scenes, get_video_duration
    print("[CastRenderer] ffmpeg_builder loaded", flush=True)
except Exception as e:
    print(f"[CastRenderer] FATAL: Failed to import ffmpeg_builder: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("[CastRenderer] All modules loaded successfully", flush=True)


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

        # ── 3. Render each scene (Phase 0 overlay pre-render happens inside) ──
        print(f"[CastRenderer] Phase 3: Rendering {len(scenes)} scenes at {width}x{height}...")
        scene_paths: list[str] = []
        failed_scenes: list[int] = []
        for scene in scenes:
            t_scene = time.time()
            path = render_scene(scene, width, height)
            elapsed = time.time() - t_scene
            if path:
                scene_paths.append(path)
                actual_dur = get_video_duration(path)
                print(f"  Scene {scene.index} rendered in {elapsed:.1f}s "
                      f"(actual: {actual_dur:.1f}s, expected: {scene.duration:.1f}s)")
            else:
                print(f"  Scene {scene.index} FAILED after {elapsed:.1f}s — skipping")
                failed_scenes.append(scene.index)

        if not scene_paths:
            return {"error": "All scenes failed to render"}

        if failed_scenes:
            print(f"  WARNING: {len(failed_scenes)} scenes failed: {failed_scenes}")

        total_rendered = sum(get_video_duration(p) for p in scene_paths)
        print(f"  {len(scene_paths)}/{len(scenes)} scenes rendered in {time.time() - t0:.1f}s "
              f"(total rendered: {total_rendered:.1f}s)")

        # ── 4. Concatenate with transitions ──
        print("[CastRenderer] Phase 4: Concatenating scenes...")
        t_concat = time.time()

        # Only pass scenes that successfully rendered
        rendered_scenes = [s for s in scenes if s.index not in failed_scenes]
        final_path = concatenate_scenes(scene_paths, rendered_scenes, width, height)
        if not final_path:
            return {"error": "Failed to concatenate scenes"}
        print(f"  Concatenation done in {time.time() - t_concat:.1f}s")

        duration = get_video_duration(final_path)
        file_size_mb = os.path.getsize(final_path) / (1024 * 1024)
        print(f"  Final video: {duration:.1f}s, {file_size_mb:.1f}MB")

        # Sanity check: final video should be at least 50% of expected duration
        if duration < total_dur * 0.3:
            print(f"  WARNING: Final video ({duration:.1f}s) is much shorter than "
                  f"expected ({total_dur:.1f}s) — possible render issues")

        # ── 5. Upload to Supabase Storage ──
        print("[CastRenderer] Phase 5: Uploading to Supabase Storage...")
        t_upload = time.time()

        from supabase_uploader import upload_final_video
        result = upload_final_video(final_path, cast_project_id, supabase_url, supabase_key)
        print(f"  Upload done in {time.time() - t_upload:.1f}s")

        total_time = time.time() - t0
        video_url = result.get("videoUrl")
        print(f"[CastRenderer] DONE in {total_time:.1f}s — {video_url or 'NO URL'}")

        if not video_url:
            print("  ERROR: No video URL from upload — check Supabase bucket 'cast-assets' is public")

        # ── Cleanup temp files ──
        _cleanup()

        return {
            "videoUrl": video_url,
            "thumbnailUrl": result.get("thumbnailUrl"),
            "duration": duration,
            "renderTime": round(total_time, 1),
            "scenesRendered": len(scene_paths),
            "scenesTotal": len(scenes),
            "scenesFailed": len(failed_scenes),
            "fileSizeMB": round(file_size_mb, 1),
        }

    except Exception as e:
        import traceback
        print(f"[CastRenderer] ERROR: {e}")
        print(traceback.format_exc())
        _cleanup()
        return {"error": str(e)}


def _cleanup():
    """Remove temp files to free disk space between jobs."""
    for d in ["/tmp/cast_assets", "/tmp/cast_render", "/tmp/cast_overlays"]:
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)


# Register with RunPod
runpod.serverless.start({"handler": handler})
