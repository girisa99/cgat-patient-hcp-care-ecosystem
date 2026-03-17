"""
Post-Production Module — FFmpeg-based video processing operations.

All post-production capabilities for the Cast pipeline:
  - Clip extraction (cut segments from rendered video)
  - Platform resize (9:16 TikTok, 1:1 Instagram, etc.)
  - Caption burning (SRT overlay with styled subtitles)
  - Watermark overlay (logo with position + opacity)
  - Audio extraction (demux to MP3/WAV)
  - GIF generation (palette-optimized looping preview)
  - Thumbnail generation (per-timestamp × per-size)
  - Metadata injection (MP4 title/artist/copyright)
  - Audio duration probing (ffprobe-based, replaces estimation)

Each function: downloads source → runs FFmpeg → returns output path.
Upload to Supabase is handled by the caller (handler.py).
"""

import os
import subprocess
import time
import json


# ── Platform Presets ──────────────────────────────────────────────────────────

PLATFORM_PRESETS = {
    "tiktok":     {"w": 1080, "h": 1920, "aspect": "9:16", "maxDur": 180},
    "reels":      {"w": 1080, "h": 1920, "aspect": "9:16", "maxDur": 90},
    "shorts":     {"w": 1080, "h": 1920, "aspect": "9:16", "maxDur": 60},
    "instagram":  {"w": 1080, "h": 1080, "aspect": "1:1",  "maxDur": 60},
    "linkedin":   {"w": 1920, "h": 1080, "aspect": "16:9", "maxDur": 600},
    "twitter":    {"w": 1280, "h": 720,  "aspect": "16:9", "maxDur": 140},
    "facebook":   {"w": 1080, "h": 1080, "aspect": "1:1",  "maxDur": 240},
}

# ── Caption Styles ────────────────────────────────────────────────────────────

CAPTION_STYLES = {
    "modern": {
        "font": "Inter",
        "size": 22,
        "primary_colour": "&H00FFFFFF",
        "outline_colour": "&H00000000",
        "outline": 2,
        "shadow": 1,
        "back_colour": "&H80000000",
        "border_style": 4,
        "margin_v": 40,
    },
    "classic": {
        "font": "Arial",
        "size": 20,
        "primary_colour": "&H00FFFFFF",
        "outline_colour": "&H00000000",
        "outline": 3,
        "shadow": 0,
        "back_colour": "&H00000000",
        "border_style": 1,
        "margin_v": 30,
    },
    "minimal": {
        "font": "Inter",
        "size": 18,
        "primary_colour": "&H00FFFFFF",
        "outline_colour": "&H00000000",
        "outline": 1,
        "shadow": 0,
        "back_colour": "&H00000000",
        "border_style": 1,
        "margin_v": 50,
    },
    "kinetic": {
        "font": "Inter",
        "size": 32,
        "primary_colour": "&H00FFFFFF",
        "outline_colour": "&H00000000",
        "outline": 3,
        "shadow": 2,
        "back_colour": "&H80000000",
        "border_style": 4,
        "margin_v": 20,
    },
}

# ── Watermark Positions ──────────────────────────────────────────────────────

WATERMARK_POSITIONS = {
    "bottom-right": "W-w-20:H-h-20",
    "bottom-left":  "20:H-h-20",
    "top-right":    "W-w-20:20",
    "top-left":     "20:20",
    "center":       "(W-w)/2:(H-h)/2",
}


# ── Utility Functions ─────────────────────────────────────────────────────────

def _ensure_dir(path: str):
    """Ensure parent directory exists."""
    os.makedirs(os.path.dirname(path), exist_ok=True)


def _run_ffmpeg(cmd: list, timeout: int = 300, label: str = "") -> bool:
    """Run an FFmpeg command with error handling."""
    t0 = time.time()
    prefix = f"[{label}] " if label else ""
    print(f"  {prefix}Running: {' '.join(cmd[:8])}...", flush=True)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        elapsed = time.time() - t0
        if result.returncode != 0:
            print(f"  {prefix}FAILED ({elapsed:.1f}s): {result.stderr[-500:]}", flush=True)
            return False
        print(f"  {prefix}OK ({elapsed:.1f}s)", flush=True)
        return True
    except subprocess.TimeoutExpired:
        print(f"  {prefix}TIMED OUT after {timeout}s", flush=True)
        return False
    except Exception as e:
        print(f"  {prefix}ERROR: {type(e).__name__}: {e}", flush=True)
        return False


def _run_ffprobe(cmd: list, timeout: int = 30) -> str:
    """Run an ffprobe command and return stdout."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.stdout.strip() if result.returncode == 0 else ""
    except Exception:
        return ""


def probe_audio_duration(audio_path: str) -> float:
    """
    Get ACTUAL audio duration via ffprobe instead of trusting estimates.
    This is the foundation fix for TTS timing — measure, don't guess.
    """
    output = _run_ffprobe([
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        audio_path,
    ])
    try:
        return float(output) if output else 0.0
    except ValueError:
        return 0.0


def probe_video_info(video_path: str) -> dict:
    """Get video dimensions, duration, and codec info via ffprobe."""
    output = _run_ffprobe([
        "ffprobe", "-v", "quiet",
        "-show_entries", "stream=width,height,duration,codec_name",
        "-show_entries", "format=duration",
        "-of", "json",
        video_path,
    ])
    try:
        data = json.loads(output) if output else {}
        streams = data.get("streams", [])
        video_stream = next((s for s in streams if "width" in s), {})
        fmt = data.get("format", {})
        return {
            "width": video_stream.get("width", 0),
            "height": video_stream.get("height", 0),
            "duration": float(fmt.get("duration", video_stream.get("duration", 0))),
            "codec": video_stream.get("codec_name", "unknown"),
        }
    except (json.JSONDecodeError, ValueError):
        return {"width": 0, "height": 0, "duration": 0, "codec": "unknown"}


# ── Core Post-Production Functions ────────────────────────────────────────────

def extract_clips(video_path: str, clips: list, work_dir: str) -> list:
    """
    Extract multiple clips from a source video.
    Uses stream copy (no re-encoding) for instant, lossless extraction.

    Args:
        video_path: Path to source video
        clips: List of { "id": str, "start": float, "end": float, "label": str }
        work_dir: Working directory for output files

    Returns:
        List of { "id": str, "clipPath": str, "thumbnailPath": str, "duration": float, "fileSizeMB": float }
    """
    os.makedirs(work_dir, exist_ok=True)
    results = []

    for clip in clips:
        clip_id = clip["id"]
        start = float(clip["start"])
        end = float(clip["end"])
        duration = end - start
        label = clip.get("label", clip_id)

        clip_path = os.path.join(work_dir, f"{clip_id}.mp4")
        thumb_path = os.path.join(work_dir, f"{clip_id}_thumb.jpg")

        print(f"  [extract] Clip '{clip_id}': {start:.1f}s → {end:.1f}s ({duration:.1f}s)", flush=True)

        # Extract clip — stream copy (no re-encoding = instant)
        ok = _run_ffmpeg([
            "ffmpeg", "-y",
            "-ss", f"{start:.3f}",
            "-i", video_path,
            "-t", f"{duration:.3f}",
            "-c", "copy",
            "-movflags", "+faststart",
            clip_path,
        ], timeout=60, label=f"clip-{clip_id}")

        if not ok or not os.path.exists(clip_path):
            print(f"  [extract] FAILED for '{clip_id}'", flush=True)
            continue

        # Generate thumbnail at 20% into the clip
        thumb_time = max(0.5, duration * 0.2)
        _run_ffmpeg([
            "ffmpeg", "-y",
            "-ss", f"{thumb_time:.2f}",
            "-i", clip_path,
            "-frames:v", "1",
            "-q:v", "2",
            thumb_path,
        ], timeout=15, label=f"thumb-{clip_id}")

        file_size_mb = os.path.getsize(clip_path) / (1024 * 1024)
        results.append({
            "id": clip_id,
            "label": label,
            "clipPath": clip_path,
            "thumbnailPath": thumb_path if os.path.exists(thumb_path) else None,
            "duration": duration,
            "fileSizeMB": round(file_size_mb, 2),
        })

    print(f"  [extract] {len(results)}/{len(clips)} clips extracted", flush=True)
    return results


def platform_resize(video_path: str, platform: str, work_dir: str,
                     width: int | None = None, height: int | None = None,
                     aspect: str | None = None) -> dict | None:
    """
    Resize/crop video for a specific social platform.
    Strategy: scale to fill + center crop (no black bars).

    Args:
        video_path: Path to source video
        platform: Platform key (tiktok, reels, shorts, instagram, linkedin, twitter, facebook)
        work_dir: Working directory
        width/height: Override dimensions (optional, uses platform preset if not provided)
        aspect: Override aspect ratio (optional)

    Returns:
        { "outputPath": str, "platform": str, "width": int, "height": int, "fileSizeMB": float }
    """
    preset = PLATFORM_PRESETS.get(platform, {})
    w = width or preset.get("w", 1080)
    h = height or preset.get("h", 1920)
    max_dur = preset.get("maxDur", 600)

    os.makedirs(work_dir, exist_ok=True)
    output_path = os.path.join(work_dir, f"{platform}_{w}x{h}.mp4")

    # Check source duration vs platform max
    info = probe_video_info(video_path)
    src_dur = info["duration"]
    if src_dur > max_dur:
        print(f"  [resize] WARNING: Source ({src_dur:.0f}s) exceeds {platform} max ({max_dur}s) — will be truncated", flush=True)

    # Build resize filter: scale to fill + center crop
    # Handles any source aspect ratio → target aspect ratio
    src_w, src_h = info["width"] or 1920, info["height"] or 1080
    src_ratio = src_w / src_h if src_h > 0 else 1.778
    target_ratio = w / h

    if abs(src_ratio - target_ratio) < 0.05:
        # Similar aspect — simple scale
        vf = f"scale={w}:{h}"
    elif src_ratio > target_ratio:
        # Source is wider — scale by height, crop width
        vf = f"scale=-1:{h},crop={w}:{h}"
    else:
        # Source is taller — scale by width, crop height
        vf = f"scale={w}:-1,crop={w}:{h}"

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
    ]

    # Truncate to platform max duration
    if src_dur > max_dur:
        cmd.extend(["-t", str(max_dur)])

    cmd.append(output_path)

    ok = _run_ffmpeg(cmd, timeout=300, label=f"resize-{platform}")
    if not ok or not os.path.exists(output_path):
        return None

    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    return {
        "outputPath": output_path,
        "platform": platform,
        "width": w,
        "height": h,
        "fileSizeMB": round(file_size_mb, 2),
    }


def burn_captions(video_path: str, srt_content: str, work_dir: str,
                   style: str = "modern") -> str | None:
    """
    Burn SRT captions into video using FFmpeg's subtitle filter.

    Args:
        video_path: Path to source video
        srt_content: SRT subtitle content string
        work_dir: Working directory
        style: Caption style key (modern, classic, minimal, kinetic)

    Returns:
        Path to captioned video, or None on failure
    """
    os.makedirs(work_dir, exist_ok=True)

    # Write SRT to temp file
    srt_path = os.path.join(work_dir, "captions.srt")
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt_content)

    output_path = os.path.join(work_dir, "captioned.mp4")
    style_config = CAPTION_STYLES.get(style, CAPTION_STYLES["modern"])

    # Build force_style string for ASS-styled subtitles
    force_style = (
        f"FontName={style_config['font']},"
        f"FontSize={style_config['size']},"
        f"PrimaryColour={style_config['primary_colour']},"
        f"OutlineColour={style_config['outline_colour']},"
        f"Outline={style_config['outline']},"
        f"Shadow={style_config['shadow']},"
        f"BackColour={style_config['back_colour']},"
        f"BorderStyle={style_config['border_style']},"
        f"MarginV={style_config['margin_v']}"
    )

    # Escape the SRT path for FFmpeg filter (replace backslashes, colons)
    srt_escaped = srt_path.replace("\\", "/").replace(":", "\\:")

    ok = _run_ffmpeg([
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"subtitles={srt_escaped}:force_style='{force_style}'",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "copy",
        "-movflags", "+faststart",
        output_path,
    ], timeout=600, label="burn-captions")

    return output_path if ok and os.path.exists(output_path) else None


def add_watermark(video_path: str, logo_path: str, work_dir: str,
                   position: str = "bottom-right", opacity: float = 0.7,
                   logo_width: int = 120) -> str | None:
    """
    Overlay a watermark/logo on the video.

    Args:
        video_path: Path to source video
        logo_path: Path to logo image (PNG with transparency)
        work_dir: Working directory
        position: Position key (bottom-right, bottom-left, top-right, top-left, center)
        opacity: Watermark opacity (0.0-1.0)
        logo_width: Width to scale logo to (height auto-calculated)

    Returns:
        Path to watermarked video, or None on failure
    """
    os.makedirs(work_dir, exist_ok=True)
    output_path = os.path.join(work_dir, "watermarked.mp4")
    pos = WATERMARK_POSITIONS.get(position, WATERMARK_POSITIONS["bottom-right"])

    filter_complex = (
        f"[1:v]scale={logo_width}:-1,format=rgba,"
        f"colorchannelmixer=aa={opacity:.2f}[wm];"
        f"[0:v][wm]overlay={pos}"
    )

    ok = _run_ffmpeg([
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", logo_path,
        "-filter_complex", filter_complex,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "copy",
        "-movflags", "+faststart",
        output_path,
    ], timeout=600, label="watermark")

    return output_path if ok and os.path.exists(output_path) else None


def extract_audio(video_path: str, work_dir: str,
                   fmt: str = "mp3", bitrate: str = "192k") -> str | None:
    """
    Extract audio track from video.

    Args:
        video_path: Path to source video
        work_dir: Working directory
        fmt: Output format ('mp3' or 'wav')
        bitrate: Audio bitrate for MP3

    Returns:
        Path to audio file, or None on failure
    """
    os.makedirs(work_dir, exist_ok=True)
    output_path = os.path.join(work_dir, f"audio.{fmt}")

    if fmt == "wav":
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn", "-acodec", "pcm_s16le",
            output_path,
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn", "-acodec", "libmp3lame",
            "-ab", bitrate, "-ar", "44100",
            output_path,
        ]

    ok = _run_ffmpeg(cmd, timeout=300, label=f"extract-audio-{fmt}")
    return output_path if ok and os.path.exists(output_path) else None


def generate_gif(video_path: str, work_dir: str,
                  start: float = 0, duration: float = 5,
                  width: int = 480, fps: int = 12,
                  max_colors: int = 128) -> str | None:
    """
    Generate a high-quality GIF preview with palette optimization.

    Args:
        video_path: Path to source video
        work_dir: Working directory
        start: Start time in seconds
        duration: Duration in seconds (3-5s recommended)
        width: Output width (height auto-calculated)
        fps: Frame rate (12 recommended for good quality/size balance)
        max_colors: Max colors in palette (128 default)

    Returns:
        Path to GIF file, or None on failure
    """
    os.makedirs(work_dir, exist_ok=True)
    output_path = os.path.join(work_dir, "preview.gif")

    # Two-pass GIF generation with palette optimization
    vf = (
        f"fps={fps},scale={width}:-1:flags=lanczos,"
        f"split[s0][s1];"
        f"[s0]palettegen=max_colors={max_colors}[p];"
        f"[s1][p]paletteuse=dither=bayer:bayer_scale=3"
    )

    ok = _run_ffmpeg([
        "ffmpeg", "-y",
        "-ss", f"{start:.2f}",
        "-t", f"{duration:.2f}",
        "-i", video_path,
        "-vf", vf,
        output_path,
    ], timeout=120, label="gif")

    return output_path if ok and os.path.exists(output_path) else None


def generate_thumbnails(video_path: str, timestamps: list, sizes: list,
                         work_dir: str) -> list:
    """
    Generate thumbnails at specific timestamps in multiple sizes.

    Args:
        video_path: Path to source video
        timestamps: List of timestamps in seconds [15.0, 45.0, 120.0]
        sizes: List of { "label": str, "w": int, "h": int }
        work_dir: Working directory

    Returns:
        List of { "timestamp": float, "label": str, "thumbnailPath": str, "w": int, "h": int }
    """
    os.makedirs(work_dir, exist_ok=True)
    results = []

    for t in timestamps:
        for size in sizes:
            label = size["label"]
            w = size["w"]
            h = size["h"]
            filename = f"thumb_{t:.0f}s_{label}_{w}x{h}.jpg"
            output_path = os.path.join(work_dir, filename)

            # Scale + pad to exact dimensions (no crop, letterbox if needed)
            vf = (
                f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
                f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black"
            )

            ok = _run_ffmpeg([
                "ffmpeg", "-y",
                "-ss", f"{t:.2f}",
                "-i", video_path,
                "-frames:v", "1",
                "-vf", vf,
                "-q:v", "2",
                output_path,
            ], timeout=15, label=f"thumb-{label}")

            if ok and os.path.exists(output_path):
                results.append({
                    "timestamp": t,
                    "label": label,
                    "thumbnailPath": output_path,
                    "w": w,
                    "h": h,
                })

    print(f"  [thumbnails] Generated {len(results)}/{len(timestamps) * len(sizes)} thumbnails", flush=True)
    return results


def inject_metadata(video_path: str, metadata: dict, work_dir: str) -> str | None:
    """
    Inject MP4 metadata (title, artist, copyright, etc.) into video.
    Uses stream copy — no re-encoding.

    Args:
        video_path: Path to source video
        metadata: Dict of metadata fields { "title": str, "artist": str, ... }
        work_dir: Working directory

    Returns:
        Path to video with metadata, or None on failure
    """
    os.makedirs(work_dir, exist_ok=True)
    output_path = os.path.join(work_dir, "with_metadata.mp4")

    cmd = ["ffmpeg", "-y", "-i", video_path, "-c", "copy"]

    for key, value in metadata.items():
        if value:
            cmd.extend(["-metadata", f"{key}={value}"])

    cmd.extend(["-movflags", "+faststart", output_path])

    ok = _run_ffmpeg(cmd, timeout=60, label="metadata")
    return output_path if ok and os.path.exists(output_path) else None


def get_adaptive_resize_filter(src_w: int, src_h: int, target_w: int, target_h: int,
                                strategy: str = "adaptive",
                                portrait_strategy: str = "blur-sides") -> str:
    """
    Build an FFmpeg video filter for adaptive image/video resizing.
    Replaces the old forced 'cover' crop that cut off portrait images.

    Strategies:
      - cover: Scale to fill + center crop (may cut off content)
      - contain-blur: Fit inside frame + blurred background fill (no content loss)
      - adaptive: Auto-choose based on source vs target aspect ratios

    Args:
        src_w, src_h: Source dimensions
        target_w, target_h: Target dimensions
        strategy: Resize strategy
        portrait_strategy: How to handle portrait → landscape conversion

    Returns:
        FFmpeg -vf filter string
    """
    src_ratio = src_w / src_h if src_h > 0 else 1.778
    target_ratio = target_w / target_h if target_h > 0 else 1.778
    ratio_diff = abs(src_ratio - target_ratio)

    if strategy == "cover" or (strategy == "adaptive" and ratio_diff < 0.3):
        # Similar aspect ratios — safe to scale + crop
        return (
            f"scale={target_w}:{target_h}:"
            f"force_original_aspect_ratio=increase,"
            f"crop={target_w}:{target_h}"
        )

    if strategy == "contain-blur" or (strategy == "adaptive" and src_ratio < 1.0):
        # Portrait source or very different ratios — use blurred background
        if portrait_strategy == "blur-sides":
            return (
                f"split[fg][bg];"
                f"[bg]scale={target_w}:{target_h}:"
                f"force_original_aspect_ratio=increase,"
                f"crop={target_w}:{target_h},boxblur=30[bg];"
                f"[fg]scale={target_w}:{target_h}:"
                f"force_original_aspect_ratio=decrease[fg];"
                f"[bg][fg]overlay=(W-w)/2:(H-h)/2"
            )
        else:
            # crop-center fallback
            return (
                f"scale={target_w}:{target_h}:"
                f"force_original_aspect_ratio=increase,"
                f"crop={target_w}:{target_h}"
            )

    # Default: contain with black bars
    return (
        f"scale={target_w}:{target_h}:"
        f"force_original_aspect_ratio=decrease,"
        f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=black"
    )
