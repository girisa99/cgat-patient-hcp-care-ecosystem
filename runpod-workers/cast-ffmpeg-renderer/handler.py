"""
RunPod Serverless Handler — Cast FFmpeg Renderer  (v3.0 — Multi-Action)

Supports two modes:
  action: "render"  (default) → Full timeline rendering pipeline
  action: "extract_clips" | "platform_resize" | "burn_captions" |
          "add_watermark" | "extract_audio" | "generate_gif" |
          "generate_thumbnails" | "inject_metadata"
          → Post-production operations on rendered videos

Render pipeline phases:
  0. Pre-render: Pillow generates text/component overlays as transparent PNGs
  1. Download: Parallel asset fetching from Supabase Storage URLs
  2. Parse: Timeline JSON -> SceneInstructions (with corrected zoom/pan/settings)
  3. Render: Each scene -> MP4 with Ken Burns, PiP, overlays, cinematic grading
  4. Concatenate: xfade transitions between scenes (using probed durations)
  5. Upload: Final MP4 + thumbnail -> Supabase Storage

Post-production pipeline:
  1. Download source video from Supabase
  2. Run FFmpeg operation (clip/resize/caption/watermark/etc.)
  3. Upload result(s) to Supabase Storage
  4. Return URL(s)
"""

import os
import sys
import time
import json
import shutil
import subprocess
import urllib.request
import urllib.error

WORKER_VERSION = "3.0"
MAX_FILE_SIZE_MB = 80  # Re-encode if output exceeds this

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
    from ffmpeg_builder import (
        render_scene, concatenate_scenes, get_video_duration,
        validate_part, normalize_part_resolution, trim_black_frames,
        stitch_parts_batched, stitch_parts_xfade,
    )
    print("[CastRenderer] ffmpeg_builder loaded", flush=True)
except Exception as e:
    print(f"[CastRenderer] FATAL: Failed to import ffmpeg_builder: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from post_production import (
        extract_clips, platform_resize, burn_captions,
        add_watermark, extract_audio, generate_gif,
        generate_thumbnails, inject_metadata,
        probe_audio_duration, probe_video_info,
    )
    print("[CastRenderer] post_production loaded", flush=True)
except Exception as e:
    print(f"[CastRenderer] WARNING: post_production import failed: {e}", flush=True)
    # Non-fatal — render action still works without post_production

print("[CastRenderer] All modules loaded successfully", flush=True)


# ── Progress Update ───────────────────────────────────────────────────────────

def _update_progress(cast_job_id: str | None, percent: int, status_text: str,
                     supabase_url: str, supabase_key: str):
    """Update progress directly in cast_generation_jobs via Supabase REST API."""
    if not cast_job_id or not supabase_url or not supabase_key:
        return
    try:
        url = f"{supabase_url}/rest/v1/cast_generation_jobs?id=eq.{cast_job_id}"
        body = json.dumps({
            "progress_percent": percent,
            "output_metadata": {"status_text": status_text},
        }).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="PATCH")
        req.add_header("Content-Type", "application/json")
        req.add_header("apikey", supabase_key)
        req.add_header("Authorization", f"Bearer {supabase_key}")
        req.add_header("Prefer", "return=minimal")
        urllib.request.urlopen(req, timeout=5)
        print(f"  [progress] {percent}% — {status_text}", flush=True)
    except Exception as e:
        print(f"  [progress] Failed to update ({percent}%): {e}", flush=True)


# ── Adaptive Re-encode ────────────────────────────────────────────────────────

def _adaptive_reencode(video_path: str, duration: float) -> str:
    """Re-encode video if it exceeds MAX_FILE_SIZE_MB."""
    file_size_mb = os.path.getsize(video_path) / (1024 * 1024)
    if file_size_mb <= MAX_FILE_SIZE_MB:
        return video_path

    target_mb = MAX_FILE_SIZE_MB * 0.93
    target_bitrate_kbps = int(target_mb * 8 * 1024 / max(1, duration))
    target_bitrate_kbps = max(500, target_bitrate_kbps)

    reencoded_path = video_path.replace(".mp4", "_reenc.mp4")
    print(f"  [reencode] {file_size_mb:.0f}MB exceeds {MAX_FILE_SIZE_MB}MB → "
          f"re-encoding at {target_bitrate_kbps}kbps (target: {target_mb:.0f}MB)")

    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-c:v", "libx264", "-preset", "medium",
        "-b:v", f"{target_bitrate_kbps}k",
        "-maxrate", f"{int(target_bitrate_kbps * 1.5)}k",
        "-bufsize", f"{target_bitrate_kbps * 2}k",
        "-c:a", "aac", "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        reencoded_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            print(f"  [reencode] FAILED — keeping original: {result.stderr[-500:]}")
            return video_path
        new_size_mb = os.path.getsize(reencoded_path) / (1024 * 1024)
        print(f"  [reencode] OK: {file_size_mb:.0f}MB → {new_size_mb:.0f}MB")
        os.replace(reencoded_path, video_path)
        return video_path
    except subprocess.TimeoutExpired:
        print(f"  [reencode] TIMED OUT — keeping original")
        return video_path


def _write_file_size_to_db(cast_job_id: str, file_size_bytes: int,
                           supabase_url: str, supabase_key: str):
    """Write file size to DB BEFORE upload attempt (for 413 diagnosis)."""
    if not cast_job_id or not supabase_url or not supabase_key:
        return
    try:
        url = f"{supabase_url}/rest/v1/cast_generation_jobs?id=eq.{cast_job_id}"
        body = json.dumps({
            "output_metadata": {
                "status_text": "Uploading...",
                "output_file_size_bytes": file_size_bytes,
                "worker_version": WORKER_VERSION,
            },
        }).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="PATCH")
        req.add_header("Content-Type", "application/json")
        req.add_header("apikey", supabase_key)
        req.add_header("Authorization", f"Bearer {supabase_key}")
        req.add_header("Prefer", "return=minimal")
        urllib.request.urlopen(req, timeout=5)
        print(f"  [pre-upload] File size {file_size_bytes} bytes written to DB")
    except Exception as e:
        print(f"  [pre-upload] Failed to write file size: {e}")


# ── Source Video Download ─────────────────────────────────────────────────────

def _download_source_video(url: str, work_dir: str) -> str | None:
    """Download source video from URL to work directory."""
    os.makedirs(work_dir, exist_ok=True)
    local_path = os.path.join(work_dir, "source.mp4")
    print(f"  [download] Fetching source video...", flush=True)
    t0 = time.time()
    try:
        import httpx
        with httpx.Client(timeout=httpx.Timeout(300.0, connect=30.0)) as client:
            with client.stream("GET", url) as resp:
                resp.raise_for_status()
                with open(local_path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=8192):
                        f.write(chunk)
        size_mb = os.path.getsize(local_path) / (1024 * 1024)
        print(f"  [download] OK: {size_mb:.1f}MB in {time.time() - t0:.1f}s", flush=True)
        return local_path
    except Exception as e:
        print(f"  [download] FAILED: {type(e).__name__}: {e}", flush=True)
        return None


def _download_file(url: str, local_path: str) -> str | None:
    """Download any file from URL."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        import httpx
        with httpx.Client(timeout=httpx.Timeout(60.0)) as client:
            resp = client.get(url)
            resp.raise_for_status()
            with open(local_path, "wb") as f:
                f.write(resp.content)
        return local_path
    except Exception as e:
        print(f"  [download] FAILED: {e}", flush=True)
        return None


# ── Post-Production Action Handlers ──────────────────────────────────────────

def handle_extract_clips(job_input: dict) -> dict:
    """Extract clips from source video."""
    source_url = job_input.get("sourceVideoUrl")
    clips = job_input.get("clips", [])
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url or not clips:
        return {"error": "Missing sourceVideoUrl or clips"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    results = extract_clips(video_path, clips, os.path.join(work_dir, "clips"))

    # Upload each clip + thumbnail to Supabase
    from supabase_uploader import upload_clip
    uploaded = []
    for r in results:
        clip_url = upload_clip(
            r["clipPath"], cast_project_id, r["id"],
            supabase_url, supabase_key, "video/mp4",
        )
        thumb_url = None
        if r.get("thumbnailPath"):
            thumb_url = upload_clip(
                r["thumbnailPath"], cast_project_id, f"{r['id']}_thumb",
                supabase_url, supabase_key, "image/jpeg",
            )
        uploaded.append({
            "id": r["id"],
            "label": r.get("label", r["id"]),
            "clipUrl": clip_url,
            "thumbnailUrl": thumb_url,
            "duration": r["duration"],
            "fileSizeMB": r["fileSizeMB"],
        })

    _cleanup()
    return {"clips": uploaded, "totalClips": len(uploaded)}


def handle_platform_resize(job_input: dict) -> dict:
    """Resize video for a social platform."""
    source_url = job_input.get("sourceVideoUrl")
    platform = job_input.get("platform", "tiktok")
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")
    width = job_input.get("width")
    height = job_input.get("height")

    if not source_url:
        return {"error": "Missing sourceVideoUrl"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    result = platform_resize(video_path, platform, os.path.join(work_dir, "resize"),
                              width=width, height=height)
    if not result:
        _cleanup()
        return {"error": f"Failed to resize for {platform}"}

    from supabase_uploader import upload_clip
    output_url = upload_clip(
        result["outputPath"], cast_project_id, f"{platform}_{result['width']}x{result['height']}",
        supabase_url, supabase_key, "video/mp4",
    )

    _cleanup()
    return {
        "outputUrl": output_url,
        "platform": platform,
        "width": result["width"],
        "height": result["height"],
        "fileSizeMB": result["fileSizeMB"],
    }


def handle_burn_captions(job_input: dict) -> dict:
    """Burn captions into video."""
    source_url = job_input.get("sourceVideoUrl")
    captions = job_input.get("captions", "")
    style = job_input.get("style", "modern")
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url or not captions:
        return {"error": "Missing sourceVideoUrl or captions"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    output_path = burn_captions(video_path, captions, os.path.join(work_dir, "captions"), style)
    if not output_path:
        _cleanup()
        return {"error": "Failed to burn captions"}

    from supabase_uploader import upload_clip
    output_url = upload_clip(
        output_path, cast_project_id, f"captioned_{style}",
        supabase_url, supabase_key, "video/mp4",
    )

    _cleanup()
    return {"outputUrl": output_url, "style": style}


def handle_add_watermark(job_input: dict) -> dict:
    """Add watermark to video."""
    source_url = job_input.get("sourceVideoUrl")
    logo_url = job_input.get("logoUrl")
    position = job_input.get("position", "bottom-right")
    opacity = job_input.get("opacity", 0.7)
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url or not logo_url:
        return {"error": "Missing sourceVideoUrl or logoUrl"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    logo_path = _download_file(logo_url, os.path.join(work_dir, "logo.png"))
    if not logo_path:
        _cleanup()
        return {"error": "Failed to download logo"}

    output_path = add_watermark(video_path, logo_path, os.path.join(work_dir, "watermark"),
                                 position=position, opacity=opacity)
    if not output_path:
        _cleanup()
        return {"error": "Failed to add watermark"}

    from supabase_uploader import upload_clip
    output_url = upload_clip(
        output_path, cast_project_id, "watermarked",
        supabase_url, supabase_key, "video/mp4",
    )

    _cleanup()
    return {"outputUrl": output_url, "position": position}


def handle_extract_audio(job_input: dict) -> dict:
    """Extract audio from video."""
    source_url = job_input.get("sourceVideoUrl")
    fmt = job_input.get("format", "mp3")
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url:
        return {"error": "Missing sourceVideoUrl"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    output_path = extract_audio(video_path, os.path.join(work_dir, "audio"), fmt=fmt)
    if not output_path:
        _cleanup()
        return {"error": f"Failed to extract audio as {fmt}"}

    content_type = "audio/mpeg" if fmt == "mp3" else "audio/wav"
    from supabase_uploader import upload_clip
    output_url = upload_clip(
        output_path, cast_project_id, f"audio",
        supabase_url, supabase_key, content_type,
    )

    _cleanup()
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024) if os.path.exists(output_path) else 0
    return {"outputUrl": output_url, "format": fmt, "fileSizeMB": round(file_size_mb, 2)}


def handle_generate_gif(job_input: dict) -> dict:
    """Generate GIF preview."""
    source_url = job_input.get("sourceVideoUrl")
    start = job_input.get("start", 0)
    duration = job_input.get("duration", 5)
    width = job_input.get("width", 480)
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url:
        return {"error": "Missing sourceVideoUrl"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    output_path = generate_gif(video_path, os.path.join(work_dir, "gif"),
                                start=start, duration=duration, width=width)
    if not output_path:
        _cleanup()
        return {"error": "Failed to generate GIF"}

    from supabase_uploader import upload_clip
    output_url = upload_clip(
        output_path, cast_project_id, "preview",
        supabase_url, supabase_key, "image/gif",
    )

    _cleanup()
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024) if os.path.exists(output_path) else 0
    return {"outputUrl": output_url, "fileSizeMB": round(file_size_mb, 2)}


def handle_generate_thumbnails(job_input: dict) -> dict:
    """Generate thumbnails at specific timestamps."""
    source_url = job_input.get("sourceVideoUrl")
    timestamps = job_input.get("timestamps", [])
    sizes = job_input.get("sizes", [{"label": "youtube", "w": 1280, "h": 720}])
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url or not timestamps:
        return {"error": "Missing sourceVideoUrl or timestamps"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    results = generate_thumbnails(video_path, timestamps, sizes,
                                   os.path.join(work_dir, "thumbs"))

    from supabase_uploader import upload_clip
    uploaded = []
    for r in results:
        thumb_id = f"thumb_{r['timestamp']:.0f}s_{r['label']}"
        thumb_url = upload_clip(
            r["thumbnailPath"], cast_project_id, thumb_id,
            supabase_url, supabase_key, "image/jpeg",
        )
        uploaded.append({
            "timestamp": r["timestamp"],
            "label": r["label"],
            "thumbnailUrl": thumb_url,
            "w": r["w"],
            "h": r["h"],
        })

    _cleanup()
    return {"thumbnails": uploaded, "totalThumbnails": len(uploaded)}


def handle_inject_metadata(job_input: dict) -> dict:
    """Inject metadata into video."""
    source_url = job_input.get("sourceVideoUrl")
    metadata = job_input.get("metadata", {})
    cast_project_id = job_input.get("castProjectId", "unknown")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")

    if not source_url:
        return {"error": "Missing sourceVideoUrl"}

    work_dir = "/tmp/cast_postprod"
    video_path = _download_source_video(source_url, work_dir)
    if not video_path:
        return {"error": "Failed to download source video"}

    output_path = inject_metadata(video_path, metadata, os.path.join(work_dir, "metadata"))
    if not output_path:
        _cleanup()
        return {"error": "Failed to inject metadata"}

    from supabase_uploader import upload_clip
    output_url = upload_clip(
        output_path, cast_project_id, "final_meta",
        supabase_url, supabase_key, "video/mp4",
    )

    _cleanup()
    return {"outputUrl": output_url, "metadata": metadata}


# ── Main Render Handler (existing logic) ──────────────────────────────────────

def handle_render(job_input: dict) -> dict:
    """Full timeline rendering pipeline — the existing v2.4 logic."""
    timeline = job_input.get("timeline")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")
    cast_project_id = job_input.get("castProjectId", "unknown")
    cast_job_id = job_input.get("castJobId")
    part_number = job_input.get("partNumber")

    if not timeline or not timeline.get("scenes"):
        return {"error": "Missing or empty timeline"}

    scene_count = len(timeline["scenes"])
    total_dur = sum(s.get("duration", 0) for s in timeline["scenes"])
    part_label = f", part={part_number}" if part_number else ""
    print(f"[CastRenderer] Starting render: {scene_count} scenes, {total_dur:.0f}s, project={cast_project_id}{part_label}")
    t0 = time.time()

    def progress(pct: int, text: str):
        _update_progress(cast_job_id, pct, text, supabase_url, supabase_key)

    try:
        # ── 1. Download assets ──
        progress(5, f"Downloading {len(timeline.get('scenes', []))} scenes worth of assets...")
        print("[CastRenderer] Phase 1: Downloading assets...")
        urls = collect_asset_urls(timeline)
        print(f"  Found {len(urls)} remote URLs to download")
        url_map = download_all(urls)
        print(f"  Downloaded {len(url_map)}/{len(urls)} assets in {time.time() - t0:.1f}s")
        progress(10, f"Downloaded {len(url_map)}/{len(urls)} assets")

        # ── 2. Parse timeline into scene instructions ──
        progress(12, "Parsing timeline into render instructions...")
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
        progress(15, f"Rendering {len(scenes)} scenes at {width}x{height}...")
        print(f"[CastRenderer] Phase 3: Rendering {len(scenes)} scenes at {width}x{height}...")
        scene_paths: list[str] = []
        failed_scenes: list[int] = []
        for si, scene in enumerate(scenes):
            scene_pct = 15 + int((si / len(scenes)) * 65)
            comment = scene.comment or f"Scene {scene.index}"
            progress(scene_pct, f"Rendering scene {si + 1}/{len(scenes)}: {comment[:50]}...")
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

        # ── RENDER MANIFEST ──
        print(f"  ═══ RENDER MANIFEST ({len(scenes)} scenes) ═══")
        render_manifest = []
        rendered_idx = 0
        for si, scene in enumerate(scenes):
            if scene.index in failed_scenes:
                actual = 0
            else:
                actual = get_video_duration(scene_paths[rendered_idx]) if rendered_idx < len(scene_paths) else 0
                rendered_idx += 1
            delta = actual - scene.duration if actual > 0 else 0
            status = "FAILED" if scene.index in failed_scenes else ("OK" if abs(delta) < 1.0 else ("SHORT" if delta < 0 else "LONG"))
            entry = {
                "index": scene.index,
                "expected": round(scene.duration, 1),
                "actual": round(actual, 1),
                "delta": round(delta, 1),
                "status": status,
                "comment": (scene.comment or "")[:60],
            }
            render_manifest.append(entry)
            flag = " ⚠️" if status != "OK" else ""
            print(f"    scene {scene.index}: expected={scene.duration:.1f}s actual={actual:.1f}s "
                  f"Δ={delta:+.1f}s [{status}]{flag} | {scene.comment or ''}")

        # ── 4. Concatenate with transitions ──
        progress(82, f"Concatenating {len(scene_paths)} scenes with transitions...")
        print("[CastRenderer] Phase 4: Concatenating scenes...")
        t_concat = time.time()

        rendered_scenes = [s for s in scenes if s.index not in failed_scenes]
        final_path = concatenate_scenes(scene_paths, rendered_scenes, width, height)
        if not final_path:
            return {"error": "Failed to concatenate scenes"}
        print(f"  Concatenation done in {time.time() - t_concat:.1f}s")

        duration = get_video_duration(final_path)
        file_size_mb = os.path.getsize(final_path) / (1024 * 1024)
        print(f"  Final video: {duration:.1f}s, {file_size_mb:.1f}MB")

        if duration < total_dur * 0.3:
            print(f"  WARNING: Final video ({duration:.1f}s) is much shorter than "
                  f"expected ({total_dur:.1f}s) — possible render issues")

        # ── 4b. Adaptive re-encode if too large ──
        final_path = _adaptive_reencode(final_path, duration)
        file_size_mb = os.path.getsize(final_path) / (1024 * 1024)
        duration = get_video_duration(final_path)

        # ── 4c. Write file size to DB ──
        file_size_bytes = os.path.getsize(final_path)
        _write_file_size_to_db(cast_job_id, file_size_bytes, supabase_url, supabase_key)

        # ── 5. Upload to Supabase Storage ──
        progress(90, f"Uploading {file_size_mb:.0f}MB video to storage...")
        print("[CastRenderer] Phase 5: Uploading to Supabase Storage...")
        t_upload = time.time()

        from supabase_uploader import upload_final_video
        result = upload_final_video(final_path, cast_project_id, supabase_url, supabase_key, part_number=part_number)
        print(f"  Upload done in {time.time() - t_upload:.1f}s")

        total_time = time.time() - t0
        video_url = result.get("videoUrl")
        progress(98, f"Upload complete — finalizing ({total_time:.0f}s total)")
        print(f"[CastRenderer] DONE in {total_time:.1f}s — {video_url or 'NO URL'}")

        if not video_url:
            print("  ERROR: No video URL from upload — check Supabase bucket 'cast-assets' is public")

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
            "fileSizeBytes": file_size_bytes,
            "workerVersion": WORKER_VERSION,
            "renderManifest": render_manifest,
        }

    except Exception as e:
        import traceback
        print(f"[CastRenderer] ERROR: {e}")
        print(traceback.format_exc())
        _cleanup()
        return {"error": str(e)}


# ── Stitch Parts — Fast Concat of Pre-Rendered Part Videos ────────────────────

def handle_stitch_parts(job_input: dict) -> dict:
    """
    Broadcast-quality part stitching pipeline — 8 stages.
    Produces smooth dissolve transitions, audio crossfade, loudnorm,
    black-frame trimming, and resolution normalization.

    Input:
      videoUrls: list[str]          — Ordered Supabase Storage URLs of rendered parts
      castProjectId: str            — Project ID for upload path
      castJobId: str | None         — Job ID for progress updates
      supabaseUrl: str              — Supabase URL for upload
      supabaseServiceKey: str       — Supabase service key
      transitionDuration: float     — Dissolve duration (default 0.75s)
      enableLoudnorm: bool          — Audio normalization (default true)
    """
    import traceback
    from collections import Counter
    from concurrent.futures import ThreadPoolExecutor, as_completed

    video_urls = job_input.get("videoUrls", [])
    cast_project_id = job_input.get("castProjectId", "unknown")
    cast_job_id = job_input.get("castJobId")
    supabase_url = job_input.get("supabaseUrl", "")
    supabase_key = job_input.get("supabaseServiceKey", "")
    transition_dur = float(job_input.get("transitionDuration", 0.75))
    enable_loudnorm = bool(job_input.get("enableLoudnorm", True))

    if len(video_urls) < 2:
        return {"error": f"stitch_parts requires at least 2 video URLs, got {len(video_urls)}"}

    def progress(pct, msg):
        _update_progress(cast_job_id, pct, msg, supabase_url, supabase_key)

    t0 = time.time()
    stitch_dir = "/tmp/cast_stitch"
    os.makedirs(stitch_dir, exist_ok=True)

    # Diagnostics
    validation_report = []
    parts_skipped = 0
    resolution_normalized = False
    black_frames_trimmed = 0
    stitch_method = "xfade"

    try:
        # ═══ Stage 1 (5%): Disk space check ═══
        progress(5, "Checking disk space...")
        free_mb = shutil.disk_usage("/tmp").free / (1024 * 1024)
        needed_mb = len(video_urls) * 60 * 2.5  # avg 60MB/part × 2.5 headroom
        print(f"[StitchParts] Disk check: {free_mb:.0f}MB free, need {needed_mb:.0f}MB")
        if free_mb < needed_mb:
            return {"error": f"Insufficient disk: {free_mb:.0f}MB free, need {needed_mb:.0f}MB "
                    f"for {len(video_urls)} parts"}

        # ═══ Stage 2 (8%): URL pre-flight validation ═══
        progress(8, f"Validating {len(video_urls)} part URLs...")
        print(f"[StitchParts] Pre-checking {len(video_urls)} URLs...")
        bad_urls = []
        for i, url in enumerate(video_urls):
            try:
                req = urllib.request.Request(url, method="HEAD",
                                            headers={"User-Agent": "CastRenderer/3.0"})
                resp = urllib.request.urlopen(req, timeout=10)
                if resp.status not in (200, 206):
                    bad_urls.append((i, f"HTTP {resp.status}"))
            except Exception as e:
                bad_urls.append((i, str(e)[:80]))
        if bad_urls:
            details = "; ".join([f"part {i}: {err}" for i, err in bad_urls])
            return {"error": f"URL pre-check failed for {len(bad_urls)} parts: {details}"}
        print(f"  [precheck] All {len(video_urls)} URLs accessible")

        # ═══ Stage 3 (10-30%): Download parts (parallel) ═══
        progress(10, f"Downloading {len(video_urls)} parts...")
        print(f"[StitchParts] Downloading {len(video_urls)} part videos...")

        def download_part(idx_url):
            idx, url = idx_url
            local_path = os.path.join(stitch_dir, f"part_{idx:03d}.mp4")
            for attempt in range(3):
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": "CastRenderer/3.0"})
                    with urllib.request.urlopen(req, timeout=120) as resp:
                        with open(local_path, "wb") as f:
                            while True:
                                chunk = resp.read(1024 * 1024)  # 1MB chunks
                                if not chunk:
                                    break
                                f.write(chunk)
                    size_mb = os.path.getsize(local_path) / (1024 * 1024)
                    print(f"  [download] Part {idx}: {size_mb:.1f}MB")
                    return idx, local_path
                except Exception as e:
                    print(f"  [download] Part {idx} attempt {attempt + 1} failed: {e}")
                    if attempt == 2:
                        raise
                    time.sleep(2 ** attempt)
            return idx, None

        part_paths = {}
        with ThreadPoolExecutor(max_workers=4) as pool:
            futures = {pool.submit(download_part, (i, url)): i for i, url in enumerate(video_urls)}
            for future in as_completed(futures):
                idx, path = future.result()
                if path:
                    part_paths[idx] = path

        if len(part_paths) != len(video_urls):
            missing = [i for i in range(len(video_urls)) if i not in part_paths]
            return {"error": f"Failed to download parts: {missing}"}

        ordered_paths = [part_paths[i] for i in range(len(video_urls))]
        dl_time = time.time() - t0
        print(f"  [download] All {len(ordered_paths)} parts downloaded in {dl_time:.1f}s")
        progress(30, f"Downloaded {len(ordered_paths)} parts in {dl_time:.0f}s")

        # ═══ Stage 4 (32-38%): Validate parts ═══
        progress(32, "Validating parts (resolution, codec, black frames)...")
        print("[StitchParts] Validating parts...")

        part_infos = []
        valid_paths = []
        for i, path in enumerate(ordered_paths):
            info = validate_part(path)
            info["index"] = i
            part_infos.append(info)
            validation_report.append({
                "part": i,
                "valid": info["valid"],
                "width": info["width"],
                "height": info["height"],
                "duration": round(info["duration"], 1),
                "codec": info["codec"],
                "blackStart": round(info["black_trim_start"], 2),
                "blackEnd": round(info["black_trim_end"], 2),
                "error": info.get("error"),
            })
            if info["valid"]:
                valid_paths.append(path)
                print(f"  [validate] Part {i}: {info['width']}x{info['height']} "
                      f"{info['codec']} {info['duration']:.1f}s "
                      f"black=[{info['black_trim_start']:.2f}s, {info['black_trim_end']:.2f}s]")
            else:
                parts_skipped += 1
                print(f"  [validate] Part {i}: INVALID — {info.get('error', 'unknown')}")

        progress(38, f"Validated {len(valid_paths)}/{len(ordered_paths)} parts")

        if len(valid_paths) < 2:
            return {"error": f"Only {len(valid_paths)} valid parts — need at least 2 to stitch"}

        valid_infos = [info for info in part_infos if info["valid"]]

        # ═══ Stage 5 (40-45%): Normalize resolution ═══
        progress(40, "Normalizing resolution...")
        resolutions = Counter((info["width"], info["height"]) for info in valid_infos)
        target_w, target_h = resolutions.most_common(1)[0][0]
        needs_normalize = any(
            (info["width"], info["height"]) != (target_w, target_h) for info in valid_infos
        )

        if needs_normalize:
            resolution_normalized = True
            print(f"  [normalize] Target: {target_w}x{target_h} "
                  f"(majority {resolutions.most_common(1)[0][1]}/{len(valid_infos)})")
            for info in valid_infos:
                if (info["width"], info["height"]) != (target_w, target_h):
                    idx = info["index"]
                    normalize_part_resolution(valid_paths[valid_infos.index(info)],
                                              target_w, target_h)
            progress(45, "Resolution normalized")
        else:
            print(f"  [normalize] All parts already {target_w}x{target_h} — skipping")

        # ═══ Stage 6 (48-52%): Trim black frames ═══
        progress(48, "Trimming black frames from boundaries...")
        for info in valid_infos:
            if info["black_trim_start"] >= 0.05 or info["black_trim_end"] >= 0.05:
                idx_in_valid = valid_infos.index(info)
                trim_black_frames(
                    valid_paths[idx_in_valid],
                    info["black_trim_start"],
                    info["black_trim_end"],
                    info["duration"],
                )
                black_frames_trimmed += 1
        progress(52, f"Trimmed {black_frames_trimmed} parts")
        if black_frames_trimmed:
            print(f"  [trim] Trimmed black frames from {black_frames_trimmed} parts")
        else:
            print(f"  [trim] No black frames detected — skipping")

        # ═══ Stage 7 (55-82%): Xfade stitch with fallback chain ═══
        progress(55, f"Stitching {len(valid_paths)} parts with dissolve transitions...")
        print(f"[StitchParts] Stitching {len(valid_paths)} parts "
              f"(transition={transition_dur:.2f}s, loudnorm={enable_loudnorm})...")
        t_stitch = time.time()

        output_path = os.path.join(stitch_dir, "stitched_final.mp4")

        # Level 1: xfade with loudnorm (best quality)
        stitch_result = stitch_parts_batched(
            valid_paths, transition_dur, enable_loudnorm, output_path,
        )

        if not stitch_result:
            # Level 2: Re-encode concat without transitions (consistent codec)
            stitch_method = "re_encode_fallback"
            progress(65, "Xfade failed — falling back to re-encode concat...")
            print("  [stitch] xfade failed — trying re-encode concat fallback")

            concat_file = os.path.join(stitch_dir, "concat.txt")
            with open(concat_file, "w") as f:
                for p in valid_paths:
                    f.write(f"file '{p}'\n")

            from ffmpeg_builder import _stitch_encoder_args
            cmd_reencode = [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0", "-i", concat_file,
            ]
            cmd_reencode.extend(_stitch_encoder_args())
            cmd_reencode.extend(["-c:a", "aac", "-b:a", "192k", "-ar", "48000"])
            cmd_reencode.extend(["-pix_fmt", "yuv420p"])
            cmd_reencode.append(output_path)

            result = subprocess.run(cmd_reencode, capture_output=True, text=True, timeout=3600)

            if result.returncode != 0:
                # Level 3: Stream-copy concat (last resort)
                stitch_method = "stream_copy_fallback"
                progress(72, "Re-encode failed — falling back to stream copy...")
                print("  [stitch] re-encode failed — trying stream copy as last resort")

                cmd_copy = [
                    "ffmpeg", "-y",
                    "-f", "concat", "-safe", "0", "-i", concat_file,
                    "-c", "copy", output_path,
                ]
                result = subprocess.run(cmd_copy, capture_output=True, text=True, timeout=300)
                if result.returncode != 0:
                    return {"error": f"All stitch methods failed. "
                            f"Last error: {result.stderr[-500:]}"}

        stitch_time = time.time() - t_stitch
        progress(82, f"Stitch done in {stitch_time:.0f}s")
        print(f"  [stitch] Done in {stitch_time:.1f}s (method: {stitch_method})")

        # ═══ Stage 8 (84-86%): Verify output — NO adaptive re-encode ═══
        progress(84, "Verifying stitched video...")
        duration = get_video_duration(output_path)
        file_size_bytes = os.path.getsize(output_path)
        file_size_mb = file_size_bytes / (1024 * 1024)
        print(f"  [verify] Final: {duration:.1f}s, {file_size_mb:.1f}MB")

        if duration < 1.0:
            return {"error": f"Stitched video too short: {duration:.1f}s"}

        # Compress stitched video if large (>250MB) to improve upload reliability.
        # Uses two-pass encoding to hit target size WITHOUT quality loss —
        # pass 1 analyzes complexity, pass 2 distributes bits optimally.
        STITCH_COMPRESS_THRESHOLD_MB = 250
        if file_size_mb > STITCH_COMPRESS_THRESHOLD_MB:
            # Target: 90% of threshold to leave headroom (225MB)
            target_size_mb = STITCH_COMPRESS_THRESHOLD_MB * 0.90
            target_bitrate_kbps = int(target_size_mb * 8 * 1024 / max(1, duration))
            # Floor at 800kbps — still good quality at 720p for web delivery
            target_bitrate_kbps = max(800, target_bitrate_kbps)
            compressed_path = output_path.replace(".mp4", "_comp.mp4")
            passlog_path = os.path.join(stitch_dir, "ffmpeg2pass")
            progress(85, f"Compressing {file_size_mb:.0f}MB via two-pass for upload...")
            print(f"  [compress] {file_size_mb:.0f}MB > {STITCH_COMPRESS_THRESHOLD_MB}MB — "
                  f"two-pass at {target_bitrate_kbps}kbps (target ~{target_size_mb:.0f}MB)")

            try:
                # Pass 1: Analyze — writes stats to passlog, output discarded
                cmd_pass1 = [
                    "ffmpeg", "-y", "-i", output_path,
                    "-c:v", "libx264", "-preset", "medium",
                    "-b:v", f"{target_bitrate_kbps}k",
                    "-maxrate", f"{int(target_bitrate_kbps * 1.5)}k",
                    "-bufsize", f"{target_bitrate_kbps * 2}k",
                    "-pass", "1", "-passlogfile", passlog_path,
                    "-an", "-pix_fmt", "yuv420p",
                    "-f", "null", "/dev/null",
                ]
                progress(86, "Two-pass: analyzing (pass 1/2)...")
                print(f"  [compress] Pass 1: analyzing...", flush=True)
                result1 = subprocess.run(cmd_pass1, capture_output=True, text=True, timeout=1800)
                if result1.returncode != 0:
                    raise RuntimeError(f"Pass 1 failed: {result1.stderr[-500:]}")

                # Pass 2: Encode using pass 1 stats for optimal bit distribution
                cmd_pass2 = [
                    "ffmpeg", "-y", "-i", output_path,
                    "-c:v", "libx264", "-preset", "medium",
                    "-b:v", f"{target_bitrate_kbps}k",
                    "-maxrate", f"{int(target_bitrate_kbps * 1.5)}k",
                    "-bufsize", f"{target_bitrate_kbps * 2}k",
                    "-pass", "2", "-passlogfile", passlog_path,
                    "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-pix_fmt", "yuv420p",
                    compressed_path,
                ]
                progress(87, "Two-pass: encoding (pass 2/2)...")
                print(f"  [compress] Pass 2: encoding...", flush=True)
                result2 = subprocess.run(cmd_pass2, capture_output=True, text=True, timeout=2400)

                if result2.returncode == 0 and os.path.exists(compressed_path):
                    new_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
                    saving_pct = (1 - new_size_mb / file_size_mb) * 100
                    print(f"  [compress] OK: {file_size_mb:.0f}MB → {new_size_mb:.0f}MB "
                          f"({saving_pct:.0f}% smaller, two-pass)")
                    os.replace(compressed_path, output_path)
                    file_size_bytes = os.path.getsize(output_path)
                    file_size_mb = file_size_bytes / (1024 * 1024)
                else:
                    print(f"  [compress] Pass 2 FAILED — trying CRF fallback. "
                          f"stderr: {result2.stderr[-500:] if result2.stderr else 'none'}")
                    raise RuntimeError("two-pass failed, try CRF fallback")
            except subprocess.TimeoutExpired:
                print(f"  [compress] Two-pass TIMED OUT — trying CRF fallback")
                # Fall through to CRF fallback below
            except Exception as ce:
                print(f"  [compress] Two-pass error: {ce}")

            # CRF fallback: if two-pass failed OR file still too big, use aggressive CRF
            if not os.path.exists(compressed_path) or \
               os.path.getsize(output_path) / (1024 * 1024) > STITCH_COMPRESS_THRESHOLD_MB:
                crf_path = output_path.replace(".mp4", "_crf.mp4")
                print(f"  [compress] CRF fallback: encoding at CRF 30 preset medium...", flush=True)
                progress(87, "CRF fallback compression...")
                cmd_crf = [
                    "ffmpeg", "-y", "-i", output_path,
                    "-c:v", "libx264", "-preset", "medium", "-crf", "30",
                    "-maxrate", f"{max(800, target_bitrate_kbps)}k",
                    "-bufsize", f"{max(800, target_bitrate_kbps) * 2}k",
                    "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
                    "-pix_fmt", "yuv420p",
                    crf_path,
                ]
                try:
                    crf_result = subprocess.run(cmd_crf, capture_output=True, text=True, timeout=1800)
                    if crf_result.returncode == 0 and os.path.exists(crf_path):
                        new_size_mb = os.path.getsize(crf_path) / (1024 * 1024)
                        print(f"  [compress] CRF fallback OK: {file_size_mb:.0f}MB → {new_size_mb:.0f}MB")
                        os.replace(crf_path, output_path)
                        file_size_bytes = os.path.getsize(output_path)
                        file_size_mb = file_size_bytes / (1024 * 1024)
                    else:
                        print(f"  [compress] CRF fallback FAILED — uploading as-is")
                except Exception as crf_err:
                    print(f"  [compress] CRF fallback error: {crf_err} — uploading as-is")

        # Write file size to DB before upload
        _write_file_size_to_db(cast_job_id, file_size_bytes, supabase_url, supabase_key)
        progress(86, f"Verified: {duration:.0f}s, {file_size_mb:.0f}MB")

        # ═══ Stage 9 (88-98%): Upload to Supabase Storage (with retry) ═══
        progress(88, f"Uploading {file_size_mb:.0f}MB stitched video...")
        print(f"[StitchParts] Uploading {file_size_mb:.1f}MB...")
        t_upload = time.time()

        from supabase_uploader import upload_final_video
        upload_result = upload_final_video(
            output_path, cast_project_id, supabase_url, supabase_key,
            part_number=None,  # None = "final" path
        )

        # Retry upload once if first attempt failed (transient network issues)
        if not upload_result.get("videoUrl"):
            progress(93, f"Upload failed — retrying in 5s...")
            print(f"  [upload] First attempt failed — retrying after 5s...", flush=True)
            time.sleep(5)
            upload_result = upload_final_video(
                output_path, cast_project_id, supabase_url, supabase_key,
                part_number=None,
            )

        upload_time = time.time() - t_upload
        print(f"  [upload] Done in {upload_time:.1f}s")

        # ═══ Done ═══
        total_time = time.time() - t0
        video_url = upload_result.get("videoUrl")
        progress(98, f"Stitch complete — {total_time:.0f}s total")
        print(f"[StitchParts] DONE in {total_time:.1f}s — {video_url or 'NO URL'}")

        return {
            "videoUrl": video_url,
            "thumbnailUrl": upload_result.get("thumbnailUrl"),
            "duration": duration,
            "renderTime": round(total_time, 1),
            "fileSizeMB": round(file_size_mb, 1),
            "fileSizeBytes": file_size_bytes,
            "partsStitched": len(video_urls),
            "partsValidated": len(valid_paths),
            "partsSkipped": parts_skipped,
            "resolutionNormalized": resolution_normalized,
            "blackFramesTrimmed": black_frames_trimmed,
            "audioNormalized": enable_loudnorm and stitch_method == "xfade",
            "concatTime": round(stitch_time, 1),
            "downloadTime": round(dl_time, 1),
            "uploadTime": round(upload_time, 1),
            "workerVersion": WORKER_VERSION,
            "method": stitch_method,
            "validationReport": validation_report,
        }

    except subprocess.TimeoutExpired:
        return {"error": "Stitch operation timed out"}
    except Exception as e:
        print(f"[StitchParts] ERROR: {e}")
        print(traceback.format_exc())
        return {"error": str(e)}
    finally:
        shutil.rmtree(stitch_dir, ignore_errors=True)


# ── Main Handler — Action Dispatcher ──────────────────────────────────────────

def handler(job: dict) -> dict:
    """RunPod serverless handler entry point — dispatches by action."""
    job_input = job.get("input", {})
    action = job_input.get("action", "render")

    print(f"[CastRenderer v{WORKER_VERSION}] Action: {action}", flush=True)

    if action == "render":
        return handle_render(job_input)
    elif action == "extract_clips":
        return handle_extract_clips(job_input)
    elif action == "platform_resize":
        return handle_platform_resize(job_input)
    elif action == "burn_captions":
        return handle_burn_captions(job_input)
    elif action == "add_watermark":
        return handle_add_watermark(job_input)
    elif action == "extract_audio":
        return handle_extract_audio(job_input)
    elif action == "generate_gif":
        return handle_generate_gif(job_input)
    elif action == "generate_thumbnails":
        return handle_generate_thumbnails(job_input)
    elif action == "inject_metadata":
        return handle_inject_metadata(job_input)
    elif action == "stitch_parts":
        return handle_stitch_parts(job_input)
    else:
        return {"error": f"Unknown action: {action}"}


def _cleanup():
    """Remove temp files to free disk space between jobs."""
    for d in ["/tmp/cast_assets", "/tmp/cast_render", "/tmp/cast_overlays", "/tmp/cast_postprod"]:
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)


# Register with RunPod
runpod.serverless.start({"handler": handler})
