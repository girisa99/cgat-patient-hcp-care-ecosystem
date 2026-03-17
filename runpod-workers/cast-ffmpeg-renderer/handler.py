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
    from ffmpeg_builder import render_scene, concatenate_scenes, get_video_duration
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
    else:
        return {"error": f"Unknown action: {action}"}


def _cleanup():
    """Remove temp files to free disk space between jobs."""
    for d in ["/tmp/cast_assets", "/tmp/cast_render", "/tmp/cast_overlays", "/tmp/cast_postprod"]:
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)


# Register with RunPod
runpod.serverless.start({"handler": handler})
