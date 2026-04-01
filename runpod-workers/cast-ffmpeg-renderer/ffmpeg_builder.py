"""
FFmpeg Builder — constructs filter_complex strings and runs FFmpeg for each scene.

Translates castTimelineEngine elements into FFmpeg filters:
  - image + Ken Burns -> zoompan (with correct zoom/pan from parser)
  - video (PiP) -> scale + overlay + glow border
  - text -> Pillow pre-rendered PNG overlay (shadows, fonts, positioning)
  - component (lower-third) -> Pillow pre-rendered banner
  - audio -> amix with volume/adelay
  - transitions -> xfade between scene clips (using probed durations)
  - Post-processing: vignette, color grading, subtle contrast boost
"""

import os
import subprocess
from timeline_parser import SceneInstruction, ElementInstruction

# Lazy imports for Pillow renderer (may not be available during testing)
try:
    from pillow_renderer import (
        render_text_overlay,
        render_lower_third,
        render_pip_glow_border,
        render_storybook_frame,
        render_kinetic_text_frames,
    )
    PILLOW_AVAILABLE = True
except Exception as e:
    PILLOW_AVAILABLE = False
    print(f"  [ffmpeg] WARNING: pillow_renderer not available ({e}), falling back to drawtext")

OUTPUT_DIR = "/tmp/cast_render"
HWACCEL_AVAILABLE = None  # lazy-detect


def _ensure_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def _detect_nvenc() -> bool:
    """Check if h264_nvenc encoder actually works with a real scene encode.
    Disabled by default — RunPod serverless GPUs often list NVENC but can't use it.
    """
    global HWACCEL_AVAILABLE
    if HWACCEL_AVAILABLE is not None:
        return HWACCEL_AVAILABLE
    # Force libx264 — NVENC is unreliable on RunPod serverless workers
    # (encoder listed but fails with 'No capable devices found')
    HWACCEL_AVAILABLE = False
    print("  [ffmpeg] Using libx264 (NVENC disabled — unreliable on serverless GPUs)")
    return HWACCEL_AVAILABLE


def _encoder_args(crf: int = 23) -> list[str]:
    """Return encoder flags — always libx264 for reliability.
    CRF 23 with maxrate 6M: ~40% smaller than CRF 20, visually transparent.
    The adaptive re-encode safety net still handles files >80MB."""
    if _detect_nvenc():
        return ["-c:v", "h264_nvenc", "-preset", "p4", "-b:v", "4M", "-maxrate", "6M", "-bufsize", "8M"]
    return ["-c:v", "libx264", "-preset", "fast", "-crf", str(crf),
            "-maxrate", "6M", "-bufsize", "10M"]


def _stitch_encoder_args() -> list[str]:
    """Encoder flags optimized for stitching: same CRF quality but 'medium' preset
    for better compression efficiency. Medium preset produces ~15-20% smaller files
    at the same CRF compared to 'fast', with no quality loss — just slower encoding."""
    if _detect_nvenc():
        return ["-c:v", "h264_nvenc", "-preset", "p4", "-b:v", "4M", "-maxrate", "6M", "-bufsize", "8M"]
    return ["-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-maxrate", "6M", "-bufsize", "10M"]


def _hex_to_ffmpeg_color(hex_color: str) -> str:
    """Convert #RRGGBB to FFmpeg color format."""
    c = hex_color.lstrip("#")
    return f"0x{c}"


def _escape_drawtext(text: str) -> str:
    """Escape text for FFmpeg drawtext filter."""
    return text.replace("\\", "\\\\").replace("'", "'\\''").replace(":", "\\:").replace("%", "%%")


def _find_font() -> str:
    """Find a suitable font file on the system."""
    candidates = [
        "/usr/share/fonts/truetype/inter/Inter-Bold.ttf",
        "/usr/share/fonts/truetype/inter/Inter-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for f in candidates:
        if os.path.exists(f):
            return f
    return "DejaVuSans"


def _position_to_xy(position: str, text_w_expr: str, text_h_expr: str,
                    width: int, height: int) -> tuple[str, str]:
    """Map position string to FFmpeg drawtext x/y expressions."""
    margin = 60
    pos = (position or "").lower().strip()

    xy_map = {
        "center-center": (f"(w-{text_w_expr})/2", f"(h-{text_h_expr})/2"),
        "center": (f"(w-{text_w_expr})/2", f"(h-{text_h_expr})/2"),
        "bottom-center": (f"(w-{text_w_expr})/2", f"h-{text_h_expr}-{margin*2}"),
        "center-bottom": (f"(w-{text_w_expr})/2", f"h-{text_h_expr}-{margin*2}"),
        "bottom-left": (f"{margin}", f"h-{text_h_expr}-{margin*2}"),
        "left-bottom": (f"{margin}", f"h-{text_h_expr}-{margin*2}"),
        "bottom-right": (f"w-{text_w_expr}-{margin}", f"h-{text_h_expr}-{margin*2}"),
        "right-bottom": (f"w-{text_w_expr}-{margin}", f"h-{text_h_expr}-{margin*2}"),
        "top-center": (f"(w-{text_w_expr})/2", f"{margin}"),
        "center-top": (f"(w-{text_w_expr})/2", f"{margin}"),
        "top-left": (f"{margin}", f"{margin}"),
        "top-right": (f"w-{text_w_expr}-{margin}", f"{margin}"),
    }

    if pos in xy_map:
        return xy_map[pos]
    # Default: center-center
    return (f"(w-{text_w_expr})/2", f"(h-{text_h_expr})/2")


def _build_zoompan_filter(elem: ElementInstruction, img_dur: float,
                          width: int, height: int) -> str:
    """Build zoompan filter string for Ken Burns effect on a still image.
    img_dur = duration for THIS image (not the full scene duration)."""
    fps = 30
    # Guard: ensure positive duration
    img_dur = max(0.5, img_dur)
    total_frames = int(fps * img_dur)

    # Safety: ensure at least 1 second of frames
    if total_frames < 30:
        total_frames = int(30 * img_dur) if img_dur > 0 else 150
    if total_frames < 30:
        total_frames = 150  # absolute minimum ~5 seconds

    # Guard: ensure zoom_amount is positive and sensible
    # Professional Ken Burns: 15-25% zoom. Values 3-5 were too subtle.
    zoom_amount = max(0.05, min(0.5, elem.zoom_amount or 0.18))
    zoom_rate = zoom_amount / total_frames  # per-frame zoom rate
    # Clamp zoom rate — allow up to 0.005 for dramatic motion on short clips
    zoom_rate = max(0.0002, min(0.005, zoom_rate))

    # Determine zoom expression
    if elem.zoom_direction == "out":
        max_zoom = 1.0 + zoom_amount
        z_expr = f"if(eq(on,1),{max_zoom:.4f},max(1.0001,zoom-{zoom_rate:.6f}))"
    else:
        # Default: zoom in
        max_zoom = 1.0 + zoom_amount
        z_expr = f"if(eq(on,1),1.0001,min({max_zoom:.4f},zoom+{zoom_rate:.6f}))"

    # Center the zoom by default
    x_expr = "(iw-iw/zoom)/2"
    y_expr = "(ih-ih/zoom)/2"

    # Pan direction — distribute pan evenly across all frames for smooth motion
    # With higher zoom (18-25%), there's more headroom for visible panning
    pan_dist = max(0, min(1.0, elem.pan_distance or 0.18))
    pan_px = max(1, min(15, int(pan_dist * width / total_frames)))
    pan = (elem.pan_direction or "").lower().strip()

    # Parse compound direction into horizontal + vertical components
    has_left = "left" in pan
    has_right = "right" in pan
    has_up = "up" in pan or "top" in pan
    has_down = "down" in pan or "bottom" in pan

    if has_left:
        x_expr = f"if(eq(on,1),iw/zoom/4,x+{pan_px})"
    elif has_right:
        x_expr = f"if(eq(on,1),iw-iw/zoom-iw/zoom/4,x-{pan_px})"

    if has_up:
        y_expr = f"if(eq(on,1),ih/zoom/4,y+{pan_px})"
    elif has_down:
        y_expr = f"if(eq(on,1),ih-ih/zoom-ih/zoom/4,y-{pan_px})"

    return (
        f"zoompan=z='{z_expr}'"
        f":x='{x_expr}'"
        f":y='{y_expr}'"
        f":d={total_frames}"
        f":s={width}x{height}"
        f":fps={fps}"
    )


def _build_drawtext_filter(elem: ElementInstruction, width: int, height: int) -> str:
    """Build drawtext filter for text overlay (fallback when Pillow not available)."""
    font = _find_font()
    text = _escape_drawtext(elem.text)
    color = _hex_to_ffmpeg_color(elem.font_color)
    size = elem.font_size

    # Position from position field
    if elem.position:
        x_expr, y_expr = _position_to_xy(elem.position, "text_w", "text_h", width, height)
    elif elem.text_align == "center":
        x_expr = "(w-text_w)/2"
        y_expr = "(h-text_h)/2"
    elif elem.text_align == "right":
        x_expr = "w-text_w-60"
        y_expr = "(h-text_h)/2"
    else:
        x_expr = "60"
        y_expr = "(h-text_h)/2"

    # Override if explicit y position set
    if elem.y > 0:
        y_expr = str(elem.y)

    # Enable time window
    enable = ""
    if elem.duration > 0:
        end_time = elem.start + elem.duration
        enable = f":enable='between(t,{elem.start:.2f},{end_time:.2f})'"

    # Background box
    box = ""
    if elem.background_color:
        bg = _hex_to_ffmpeg_color(elem.background_color)
        box = f":box=1:boxcolor={bg}@0.7:boxborderw=16"

    # Shadow (drawtext shadowx/shadowy)
    shadow = f":shadowcolor=black@0.6:shadowx=2:shadowy=2"

    return (
        f"drawtext=text='{text}'"
        f":fontfile='{font}'"
        f":fontsize={size}"
        f":fontcolor={color}"
        f":x={x_expr}:y={y_expr}"
        f"{shadow}{box}{enable}"
    )


def _classify_scene(comment: str) -> str:
    """Classify scene type from comment for mood-aware grading."""
    c = (comment or "").lower()
    if ("opening" in c or "bookend" in c) and "closing" not in c:
        return "opening"
    if "closing" in c:
        return "closing"
    if "transition" in c:
        return "transition"
    if "kinetic" in c:
        return "kinetic"
    return "narration"


def _build_cinematic_filter(scene_index: int, comment: str = "") -> str:
    """Build per-scene cinematic post-processing with mood-aware grading + vignette."""
    scene_type = _classify_scene(comment)

    # Per-scene color grading — each type feels visually distinct
    grading = {
        "opening": {
            # Dramatic, high-contrast, cool blue undertone
            "eq": "eq=contrast=1.12:saturation=1.15:brightness=0.005",
            "cb": "colorbalance=rs=-0.02:gs=-0.02:bs=0.04:rh=-0.01:gh=-0.01:bh=0.03",
        },
        "narration": {
            # Warm, natural, amber tones — inviting for storytelling
            "eq": "eq=contrast=1.06:saturation=1.10:brightness=0.01",
            "cb": "colorbalance=rs=0.03:gs=0.01:bs=-0.02:rh=0.02:gh=0.01:bh=-0.01",
        },
        "transition": {
            # Cool teal, slightly desaturated — visual breath between chapters
            "eq": "eq=contrast=1.08:saturation=1.05:brightness=0.005",
            "cb": "colorbalance=rs=-0.01:gs=0.02:bs=0.03:rh=-0.01:gh=0.01:bh=0.02",
        },
        "kinetic": {
            # Vivid, punchy, high saturation — attention-grabbing title card
            "eq": "eq=contrast=1.10:saturation=1.20:brightness=0.01",
            "cb": "colorbalance=rs=0.02:gs=0.01:bs=0.01",
        },
        "closing": {
            # Warm golden, emotional — leave a lasting impression
            "eq": "eq=contrast=1.08:saturation=1.12:brightness=0.01",
            "cb": "colorbalance=rs=0.04:gs=0.02:bs=-0.03:rh=0.03:gh=0.02:bh=-0.02",
        },
    }
    g = grading.get(scene_type, grading["narration"])

    filters = [
        g["eq"],
        g["cb"],
        "vignette=PI/5",  # cinematic dark edges
    ]
    return ",".join(filters)


def _pre_render_overlays(scene: SceneInstruction, width: int, height: int) -> dict:
    """
    Phase 0: Pre-render text and component overlays using Pillow.
    Returns dict mapping element index -> overlay PNG path.
    """
    overlays = {}
    if not PILLOW_AVAILABLE:
        return overlays

    # ── Compute vertical stacking for center-center texts ──
    # Multiple texts at center-center would overlap; distribute them vertically
    center_texts = [
        (ei, elem) for ei, elem in enumerate(scene.elements)
        if elem.type == "text" and elem.text
        and (elem.position or "").lower().strip() in ("center-center", "center", "")
    ]
    y_overrides: dict[int, int] = {}
    if len(center_texts) > 1:
        # Stack: calculate total height of all center texts, then distribute
        total_h = sum(int(elem.font_size * 1.6) for _, elem in center_texts)
        start_y = max(60, (height - total_h) // 2)
        cur_y = start_y
        for ei, elem in center_texts:
            y_overrides[ei] = cur_y
            cur_y += int(elem.font_size * 1.6)  # line height ~1.6x font size

    for ei, elem in enumerate(scene.elements):
        if elem.type == "text" and elem.text:
            path = None
            # Route to kinetic renderer for animated text styles (word-by-word, jumping)
            if elem.style in ("003", "005"):
                path = render_kinetic_text_frames(
                    text=elem.text,
                    width=width,
                    height=height,
                    font_family=elem.font_family,
                    font_size=elem.font_size,
                    font_color=elem.font_color,
                    font_weight=elem.font_weight,
                    position=elem.position,
                    style=elem.style,
                    duration=max(elem.duration, 3.0),
                    scene_index=scene.index,
                    element_index=ei,
                )
            # Fallback to static overlay (default for non-kinetic styles or if kinetic failed)
            if not path:
                path = render_text_overlay(
                    text=elem.text,
                    width=width,
                    height=height,
                    font_family=elem.font_family,
                    font_size=elem.font_size,
                    font_color=elem.font_color,
                    font_weight=elem.font_weight,
                    position=elem.position,
                    text_align=elem.text_align,
                    background_color=elem.background_color,
                    letter_spacing=elem.letter_spacing,
                    text_shadow=elem.text_shadow,
                    scene_index=scene.index,
                    element_index=ei,
                    y_override=y_overrides.get(ei, -1),
                )
            if path:
                overlays[ei] = path

        elif elem.type == "component":
            settings = elem.component_settings
            headline = ""
            lead = ""
            if isinstance(settings, dict):
                hl = settings.get("headline", {})
                ld = settings.get("lead", {})
                if isinstance(hl, dict):
                    headline = hl.get("text", "")
                elif isinstance(hl, str):
                    headline = hl
                if isinstance(ld, dict):
                    lead = ld.get("text", "")
                elif isinstance(ld, str):
                    lead = ld

            if headline:
                path = render_lower_third(
                    headline=headline,
                    lead=lead,
                    width=width,
                    height=height,
                    accent_color="#f5d77a",
                    bg_color="#0f0a1a",
                    scene_index=scene.index,
                    element_index=ei,
                )
                if path:
                    overlays[ei] = path

    # Storybook frame — decorative gilded border overlay on every scene
    comment = (scene.comment or "").lower()
    if True:  # render on all scenes for consistent cinematic branding
        frame_path = render_storybook_frame(
            width=width, height=height,
            scene_index=scene.index,
        )
        if frame_path:
            overlays["storybook_frame"] = frame_path

    return overlays


def render_scene(scene: SceneInstruction, width: int = 1920, height: int = 1080) -> str | None:
    """
    Render a single scene to an MP4 file.
    Returns the output file path, or None on failure.
    """
    _ensure_dir()
    output_path = os.path.join(OUTPUT_DIR, f"scene_{scene.index:03d}.mp4")

    # ── Defense-in-depth: extend scene duration to fit audio/lipsync elements ──
    # Even if castTimelineEngine calculates wrong durations, we protect against
    # truncated TTS audio and clipped lipsync on the server side.
    for elem in scene.elements:
        elem_end = elem.start + elem.duration
        # TTS audio (volume >= 0.9 = narration, not music/SFX)
        if elem.type == "audio" and elem.volume >= 0.9 and elem_end > scene.duration + 0.3:
            print(f"  [render] Extending scene {scene.index}: "
                  f"{scene.duration:.1f}s → {elem_end + 0.5:.1f}s (TTS audio protection)")
            scene.duration = elem_end + 0.5
        # Lipsync video (muted video overlay — volume=0, any size)
        elif elem.type == "video" and elem.volume == 0 and elem_end > scene.duration + 0.3:
            print(f"  [render] Extending scene {scene.index}: "
                  f"{scene.duration:.1f}s → {elem_end + 0.5:.1f}s (lipsync protection)")
            scene.duration = elem_end + 0.5

    # After duration extension, stretch background image to fill the new duration
    # so Ken Burns doesn't freeze before the scene ends (showing dark base color).
    # ONLY for single-image scenes — multi-image scenes use xfade slideshow
    # where each image must keep its individual duration for correct cycling.
    image_count = sum(1 for e in scene.elements if e.type == "image")
    if image_count <= 1:
        for elem in scene.elements:
            if elem.type == "image" and elem.start == 0 and elem.duration < scene.duration:
                elem.duration = scene.duration
    else:
        print(f"  [render] Scene {scene.index}: {image_count} images — keeping individual durations for slideshow")

    # ── Phase 0: Pre-render overlays ──
    overlays = _pre_render_overlays(scene, width, height)

    # Classify elements (with logging for skipped assets)
    all_images = [e for e in scene.elements if e.type == "image"]
    all_videos = [e for e in scene.elements if e.type == "video"]
    all_audios = [e for e in scene.elements if e.type == "audio"]
    images = [e for e in all_images if e.local_path]
    videos = sorted([e for e in all_videos if e.local_path], key=lambda v: v.z_index)
    audios = [e for e in all_audios if e.local_path]
    texts = [(i, e) for i, e in enumerate(scene.elements) if e.type == "text" and e.text]
    components = [(i, e) for i, e in enumerate(scene.elements) if e.type == "component"]

    # ── DIAGNOSTIC: Log skipped elements (missing local_path = download failed) ──
    skipped_images = [e for e in all_images if not e.local_path]
    skipped_videos = [e for e in all_videos if not e.local_path]
    skipped_audios = [e for e in all_audios if not e.local_path]
    if skipped_images or skipped_videos or skipped_audios:
        print(f"  [render] ⚠️ Scene {scene.index} SKIPPED ELEMENTS (download failed):")
        for e in skipped_images:
            print(f"    SKIPPED image: src={e.src[:80]}... (no local_path)")
        for e in skipped_videos:
            print(f"    SKIPPED video: src={e.src[:80]}... (no local_path)")
        for e in skipped_audios:
            print(f"    SKIPPED audio: src={e.src[:80]}... (no local_path)")
    if not images and not videos:
        print(f"  [render] ⚠️ Scene {scene.index} has NO visual assets! "
              f"(had {len(all_images)} images + {len(all_videos)} videos but ALL skipped)")
    else:
        print(f"  [render] Scene {scene.index}: {len(images)}/{len(all_images)} images, "
              f"{len(videos)}/{len(all_videos)} videos, {len(audios)}/{len(all_audios)} audio, "
              f"{len(texts)} text, {len(components)} components")

    # Build FFmpeg command
    inputs: list[str] = []
    filter_parts: list[str] = []
    input_idx = 0

    # ── Background color base ──
    bg_color = _hex_to_ffmpeg_color(scene.background_color)
    inputs.extend([
        "-f", "lavfi", "-i",
        f"color=c={bg_color}:s={width}x{height}:d={scene.duration:.2f}:r=30",
    ])
    base_label = f"[{input_idx}:v]"
    current_video = f"base{scene.index}"
    filter_parts.append(f"{base_label}setpts=PTS-STARTPTS[{current_video}]")
    input_idx += 1

    # ── Image layers with Ken Burns ──
    # Strategy: zoompan each image for its duration, then xfade-chain into a
    # single slideshow stream, and overlay that once on the base.
    # (Previous overlay+enable approach failed because zoompan frames are
    #  consumed while the overlay is disabled, leaving no frames when it enables.)
    if images:
        # Add all images as inputs and build zoompan for each
        img_kb_labels: list[str] = []
        img_durations: list[float] = []
        for ii, img in enumerate(images):
            inputs.extend(["-i", img.local_path])
            img_dur = img.duration if img.duration > 0 else (
                scene.duration if len(images) == 1 else scene.duration / len(images)
            )
            img_durations.append(img_dur)
            zp = _build_zoompan_filter(img, img_dur, width, height)
            kb_label = f"kb{scene.index}_{ii}"
            filter_parts.append(f"[{input_idx}:v]{zp},format=yuv420p[{kb_label}]")
            img_kb_labels.append(kb_label)
            input_idx += 1

        if len(images) == 1:
            # Single image: apply fade-in/fade-out, then overlay on base
            img0 = images[0]
            src_label = img_kb_labels[0]
            if img0.fade_in > 0 or img0.fade_out > 0:
                fade_label = f"imgf{scene.index}"
                fades = []
                if img0.fade_in > 0:
                    fades.append(f"fade=t=in:st=0:d={img0.fade_in:.2f}")
                if img0.fade_out > 0:
                    out_st = max(0, img_durations[0] - img0.fade_out)
                    fades.append(f"fade=t=out:st={out_st:.2f}:d={img0.fade_out:.2f}")
                filter_parts.append(f"[{src_label}]{','.join(fades)}[{fade_label}]")
                src_label = fade_label

            prev = current_video
            current_video = f"img{scene.index}"
            filter_parts.append(
                f"[{prev}][{src_label}]overlay=0:0[{current_video}]"
            )
        else:
            # Multiple images: xfade chain into a slideshow with varied transitions
            CROSSFADE = 0.5  # seconds between images
            # Cycle through cinematic xfade styles for visual variety
            XFADE_STYLES = [
                "fade", "dissolve", "wipeleft", "wiperight",
                "slideright", "slideleft", "circleopen",
                "fadeblack", "smoothleft", "smoothright",
            ]
            current_label = f"[{img_kb_labels[0]}]"
            cumulative_dur = img_durations[0]

            for ii in range(1, len(images)):
                next_dur = img_durations[ii]
                # Clamp crossfade to 40% of shorter adjacent clip
                cf = min(CROSSFADE, cumulative_dur * 0.4, next_dur * 0.4)
                cf = max(0.2, cf)
                offset = cumulative_dur - cf
                if offset < 0.1:
                    offset = 0.1

                # Cycle through transition styles based on scene+image index
                xfade_style = XFADE_STYLES[(scene.index + ii) % len(XFADE_STYLES)]

                is_last = ii == len(images) - 1
                out_label = f"[imgs{scene.index}]" if is_last else f"[xfi{scene.index}_{ii}]"
                filter_parts.append(
                    f"{current_label}[{img_kb_labels[ii]}]"
                    f"xfade=transition={xfade_style}:duration={cf:.2f}:offset={offset:.2f}{out_label}"
                )
                current_label = out_label
                cumulative_dur = offset + next_dur

            # Overlay slideshow on base (eof_action=pass shows base if slideshow ends early)
            prev = current_video
            current_video = f"img{scene.index}"
            filter_parts.append(
                f"[{prev}][imgs{scene.index}]overlay=0:0:eof_action=pass[{current_video}]"
            )

    # ── Cinematic post-processing on background ──
    prev = current_video
    current_video = f"cin{scene.index}"
    cine_filter = _build_cinematic_filter(scene.index, scene.comment)
    filter_parts.append(f"[{prev}]{cine_filter}[{current_video}]")

    # ── Video overlays: FULL-SCREEN B-roll + PiP lipsync ──
    # Distinguish: B-roll (width >= scene*0.5 = full-screen) vs lipsync (width < scene*0.5 = PiP)
    for vi, vid in enumerate(videos):
        # Apply seek for split-scene video continuation
        if vid.seek > 0:
            inputs.extend(["-ss", f"{vid.seek:.2f}", "-i", vid.local_path])
        else:
            inputs.extend(["-i", vid.local_path])
        pip_label = f"pip{scene.index}_{vi}"

        # ── Determine: full-screen B-roll vs PiP lipsync ──
        is_fullscreen = vid.width >= width * 0.5 and vid.height >= height * 0.5
        print(f"    [video] Scene {scene.index} vid {vi}: {vid.width}x{vid.height} "
              f"→ {'FULL-SCREEN' if is_fullscreen else 'PiP'}, pos={vid.position or 'none'}")

        if is_fullscreen:
            # ── FULL-SCREEN B-roll: scale to fill entire frame ──
            # Ensure even dimensions
            fw = width + (width % 2)
            fh = height + (height % 2)
            scale = (f"scale={fw}:{fh}:force_original_aspect_ratio=decrease,"
                     f"pad={fw}:{fh}:(ow-iw)/2:(oh-ih)/2:color=black")
            pip_x, pip_y = 0, 0
            pip_w, pip_h = fw, fh

            enable = ""
            if vid.duration > 0:
                end_t = vid.start + vid.duration
                enable = f":enable='between(t,{vid.start:.2f},{end_t:.2f})'"

            # Build full-screen chain with fade-in/fade-out
            vid_chain = f"{scale},format=yuva420p"
            if vid.fade_in > 0:
                vid_chain += f",fade=t=in:st=0:d={vid.fade_in:.2f}:alpha=1"
            if vid.fade_out > 0:
                vid_dur = vid.duration if vid.duration > 0 else scene.duration
                out_st = max(0, vid_dur - vid.fade_out)
                vid_chain += f",fade=t=out:st={out_st:.2f}:d={vid.fade_out:.2f}:alpha=1"

            filter_parts.append(f"[{input_idx}:v]{vid_chain}[{pip_label}]")

            # Overlay full-screen at 0,0 (no glow for full-screen)
            prev = current_video
            current_video = f"v{scene.index}_{vi}"
            filter_parts.append(
                f"[{prev}][{pip_label}]overlay=0:0{enable}[{current_video}]"
            )
            input_idx += 1

        else:
            # ── PiP lipsync/small video: keep small, position in corner ──
            pip_w = vid.width if vid.width > 0 else width // 3
            pip_h = vid.height if vid.height > 0 else height // 3
            # Ensure dimensions are even for FFmpeg
            pip_w = pip_w + (pip_w % 2)
            pip_h = pip_h + (pip_h % 2)

            scale = f"scale={pip_w}:{pip_h}:force_original_aspect_ratio=decrease"

            # Resolve position field to pixel x,y
            margin = 30
            pos = (vid.position or "").lower().strip()
            if pos in ("bottom-right", "right-bottom"):
                pip_x = width - pip_w - margin
                pip_y = height - pip_h - margin
            elif pos in ("bottom-left", "left-bottom"):
                pip_x = margin
                pip_y = height - pip_h - margin
            elif pos in ("top-right", "right-top"):
                pip_x = width - pip_w - margin
                pip_y = margin
            elif pos in ("top-left", "left-top"):
                pip_x = margin
                pip_y = margin
            elif pos in ("center-center", "center"):
                pip_x = (width - pip_w) // 2
                pip_y = (height - pip_h) // 2
            elif vid.x > 0 or vid.y > 0:
                pip_x = vid.x
                pip_y = vid.y
            else:
                # Default: bottom-right (standard PiP position)
                pip_x = width - pip_w - margin
                pip_y = height - pip_h - margin

            # Clamp to frame bounds
            pip_x = max(margin, min(pip_x, width - pip_w - margin))
            pip_y = max(margin, min(pip_y, height - pip_h - margin))

            enable = ""
            if vid.duration > 0:
                end_t = vid.start + vid.duration
                enable = f":enable='between(t,{vid.start:.2f},{end_t:.2f})'"

            # Build scale chain with fade-in/fade-out
            vid_chain = f"{scale},format=yuva420p"
            if vid.fade_in > 0:
                vid_chain += f",fade=t=in:st=0:d={vid.fade_in:.2f}:alpha=1"
            if vid.fade_out > 0:
                vid_dur = vid.duration if vid.duration > 0 else scene.duration
                out_st = max(0, vid_dur - vid.fade_out)
                vid_chain += f",fade=t=out:st={out_st:.2f}:alpha=1"

            filter_parts.append(f"[{input_idx}:v]{vid_chain}[{pip_label}]")

            # PiP glow border (pre-render with Pillow, overlay behind PiP)
            if PILLOW_AVAILABLE:
                glow_path = render_pip_glow_border(
                    pip_width=pip_w, pip_height=pip_h,
                    glow_color="#c4b5fd", glow_size=6,
                    scene_index=scene.index, element_index=vi,
                )
                if glow_path:
                    inputs.extend(["-i", glow_path])
                    glow_label = f"glow{scene.index}_{vi}"
                    glow_pad = 6 * 3  # must match glow_size * 3 in pillow_renderer
                    glow_x = pip_x - glow_pad
                    glow_y = pip_y - glow_pad
                    filter_parts.append(f"[{input_idx + 1}:v]format=rgba[{glow_label}]")
                    prev = current_video
                    current_video = f"gv{scene.index}_{vi}"
                    filter_parts.append(
                        f"[{prev}][{glow_label}]overlay={glow_x}:{glow_y}{enable}[{current_video}]"
                    )
                    input_idx += 1  # extra input for glow PNG

            prev = current_video
            current_video = f"v{scene.index}_{vi}"
            filter_parts.append(
                f"[{prev}][{pip_label}]overlay={pip_x}:{pip_y}{enable}[{current_video}]"
            )
            input_idx += 1

    # ── Storybook frame overlay (for transition scenes) ──
    if "storybook_frame" in overlays:
        frame_path = overlays["storybook_frame"]
        inputs.extend(["-i", frame_path])
        frame_label = f"frame{scene.index}"
        filter_parts.append(f"[{input_idx}:v]format=rgba[{frame_label}]")
        prev = current_video
        current_video = f"fr{scene.index}"
        filter_parts.append(
            f"[{prev}][{frame_label}]overlay=0:0[{current_video}]"
        )
        input_idx += 1

    # ── Text overlays (kinetic .mov, Pillow PNG, or fallback drawtext) ──
    for ti, (ei, txt) in enumerate(texts):
        if ei in overlays:
            overlay_path = overlays[ei]
            is_kinetic = overlay_path.endswith('.mov')
            txt_dur = txt.duration if txt.duration > 0.1 else 5.0
            fade_d = 0.3

            if is_kinetic:
                # Kinetic text video overlay (ProRes 4444 with alpha channel)
                inputs.extend(["-i", overlay_path])
                txt_label = f"tkin{scene.index}_{ti}"
                fade_out_st = max(0, txt_dur - fade_d)
                filter_parts.append(
                    f"[{input_idx}:v]format=rgba,"
                    f"fade=t=in:d={fade_d}:alpha=1,"
                    f"fade=t=out:st={fade_out_st:.2f}:d={fade_d}:alpha=1,"
                    f"setpts=PTS-STARTPTS+{txt.start:.2f}/TB[{txt_label}]"
                )
                prev = current_video
                current_video = f"t{scene.index}_{ti}"
                filter_parts.append(
                    f"[{prev}][{txt_label}]overlay=0:0:eof_action=pass[{current_video}]"
                )
                input_idx += 1
            else:
                # Static PNG overlay
                inputs.extend(["-i", overlay_path])
                txt_label = f"tpng{scene.index}_{ti}"
                filter_parts.append(f"[{input_idx}:v]format=rgba[{txt_label}]")

                enable = ""
                if txt.duration > 0.1:
                    end_t = txt.start + txt.duration
                    enable = f":enable='between(t,{txt.start:.2f},{end_t:.2f})'"

                prev = current_video
                current_video = f"t{scene.index}_{ti}"
                filter_parts.append(
                    f"[{prev}][{txt_label}]overlay=0:0{enable}[{current_video}]"
                )
                input_idx += 1
        else:
            # Fallback: drawtext filter
            dt = _build_drawtext_filter(txt, width, height)
            prev = current_video
            current_video = f"t{scene.index}_{ti}"
            filter_parts.append(f"[{prev}]{dt}[{current_video}]")

    # ── Component overlays (lower-thirds) ──
    for ci, (ei, comp) in enumerate(components):
        if ei in overlays:
            # Use pre-rendered lower-third PNG
            png_path = overlays[ei]
            inputs.extend(["-i", png_path])
            comp_label = f"cpng{scene.index}_{ci}"
            filter_parts.append(f"[{input_idx}:v]format=rgba[{comp_label}]")

            enable = ""
            if comp.duration > 0.1:
                end_t = comp.start + comp.duration
                enable = f":enable='between(t,{comp.start:.2f},{end_t:.2f})'"

            prev = current_video
            current_video = f"c{scene.index}_{ci}"
            filter_parts.append(
                f"[{prev}][{comp_label}]overlay=0:0{enable}[{current_video}]"
            )
            input_idx += 1
        else:
            # Fallback: drawtext with box
            settings = comp.component_settings or {}
            headline = ""
            if isinstance(settings, dict):
                hl = settings.get("headline", {})
                if isinstance(hl, dict):
                    headline = hl.get("text", "")
                elif isinstance(hl, str):
                    headline = hl
            comp_text = headline or comp.text or comp.src or ""
            if comp_text:
                comp_elem = ElementInstruction(
                    type="text", text=comp_text,
                    font_size=32,
                    font_color="#FFFFFF",
                    background_color="#0f0a1a",
                    start=comp.start, duration=comp.duration,
                    position="bottom-left",
                )
                dt = _build_drawtext_filter(comp_elem, width, height)
                prev = current_video
                current_video = f"c{scene.index}_{ci}"
                filter_parts.append(f"[{prev}]{dt}[{current_video}]")

    # ── Audio tracks ──
    audio_inputs: list[str] = []
    audio_labels: list[str] = []
    for ai, aud in enumerate(audios):
        inputs.extend(["-i", aud.local_path])
        a_label = f"a{scene.index}_{ai}"
        a_filters = []

        if aud.seek > 0:
            a_filters.append(f"atrim=start={aud.seek:.2f}")
            a_filters.append("asetpts=PTS-STARTPTS")
        if aud.start > 0:
            delay_ms = int(aud.start * 1000)
            a_filters.append(f"adelay={delay_ms}|{delay_ms}")
        if aud.volume != 1.0:
            a_filters.append(f"volume={aud.volume:.2f}")
        if aud.loop:
            # Loop audio to fill scene duration (skip per-element duration trim)
            a_filters.append("aloop=loop=-1:size=2e+09")
            a_filters.append(f"atrim=duration={scene.duration:.2f}")
        elif aud.duration > 0:
            # Trim to element duration (seek already handled by earlier atrim)
            a_filters.append(f"atrim=duration={aud.duration:.2f}")
        # Audio fade-in/fade-out
        if aud.fade_in > 0:
            a_filters.append(f"afade=t=in:st=0:d={aud.fade_in:.2f}")
        if aud.fade_out > 0:
            aud_dur = aud.duration if aud.duration > 0 else scene.duration
            fade_start = max(0, aud_dur - aud.fade_out)
            a_filters.append(f"afade=t=out:st={fade_start:.2f}:d={aud.fade_out:.2f}")

        filter_str = ",".join(a_filters) if a_filters else "anull"
        filter_parts.append(f"[{input_idx}:a]{filter_str}[{a_label}]")
        audio_labels.append(f"[{a_label}]")
        input_idx += 1

    # ── Silent audio source (must be added as input BEFORE filter_complex) ──
    silent_audio_idx = None
    if not audio_labels:
        # No audio tracks — add anullsrc as an input so FFmpeg has audio to map
        # Note: anullsrc generates infinite silence; duration is controlled by atrim filter
        inputs.extend(["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"])
        silent_audio_idx = input_idx
        # Trim it to scene duration via filter
        silent_label = f"sil{scene.index}"
        filter_parts.append(
            f"[{input_idx}:a]atrim=duration={scene.duration:.2f},asetpts=PTS-STARTPTS[{silent_label}]"
        )
        input_idx += 1

    # ── Final audio mix ──
    final_audio = None
    if len(audio_labels) > 1:
        final_audio = f"amix{scene.index}"
        filter_parts.append(
            f"{''.join(audio_labels)}amix=inputs={len(audio_labels)}:duration=longest:normalize=0[{final_audio}]"
        )
    elif len(audio_labels) == 1:
        final_audio = audio_labels[0].strip("[]")
    elif silent_audio_idx is not None:
        final_audio = f"sil{scene.index}"

    # ── Build final command ──
    filter_complex = ";\n".join(filter_parts)

    cmd = ["ffmpeg", "-y"]
    cmd.extend(inputs)
    cmd.extend(["-filter_complex", filter_complex])

    # Map video output
    cmd.extend(["-map", f"[{current_video}]"])

    # Map audio output
    if final_audio:
        cmd.extend(["-map", f"[{final_audio}]"])

    # Encoding
    cmd.extend(_encoder_args())
    cmd.extend(["-c:a", "aac", "-b:a", "192k", "-ar", "48000"])
    cmd.extend(["-t", f"{scene.duration:.2f}"])
    cmd.extend(["-pix_fmt", "yuv420p"])
    cmd.append(output_path)

    fullscreen_vids = sum(1 for v in videos if v.width >= width * 0.5 and v.height >= height * 0.5)
    pip_vids = len(videos) - fullscreen_vids
    print(f"  [render] Scene {scene.index} ({scene.comment}): {scene.duration:.1f}s, "
          f"{len(images)} imgs, {fullscreen_vids} fullscreen-vids, {pip_vids} pip-vids, "
          f"{len(texts)} texts, {len(components)} comps, {len(audios)} audio, "
          f"{len(overlays)} pillow overlays")
    # Log filter_complex for debugging (truncated)
    fc_preview = filter_complex[:500] + "..." if len(filter_complex) > 500 else filter_complex
    print(f"  [render] filter_complex:\n{fc_preview}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            print(f"  [render] Scene {scene.index} FAILED (exit {result.returncode}):")
            print(f"  [render] stderr:\n{result.stderr[-2000:]}")
            return None

        # Verify rendered duration
        actual_dur = get_video_duration(output_path)
        if actual_dur < 1.0 and scene.duration > 1.0:
            print(f"  [render] WARNING: Scene {scene.index} rendered to {actual_dur:.2f}s "
                  f"(expected {scene.duration:.1f}s)")

        print(f"  [render] Scene {scene.index} OK -> {output_path} ({actual_dur:.1f}s)")
        return output_path
    except subprocess.TimeoutExpired:
        print(f"  [render] Scene {scene.index} TIMED OUT (300s)")
        return None


def concatenate_scenes(
    scene_paths: list[str],
    scenes: list[SceneInstruction],
    width: int = 1920,
    height: int = 1080,
) -> str | None:
    """
    Concatenate scene clips with xfade transitions.
    Uses probed actual durations (not instruction durations) for correct offsets.
    Returns path to final concatenated video.
    """
    if not scene_paths:
        return None

    if len(scene_paths) == 1:
        return scene_paths[0]

    _ensure_dir()
    output_path = os.path.join(OUTPUT_DIR, "final_video.mp4")

    # ── Probe actual clip durations (critical for correct xfade offsets) ──
    actual_durations: list[float] = []
    for i, p in enumerate(scene_paths):
        dur = get_video_duration(p)
        expected = scenes[i].duration if i < len(scenes) else 5.0
        if dur <= 0:
            dur = expected  # fallback to expected if probe fails
            print(f"  [concat] WARNING: Could not probe scene {i}, using expected {expected:.1f}s")
        actual_durations.append(dur)
        if abs(dur - expected) > 1.0:
            print(f"  [concat] Scene {i}: actual={dur:.2f}s vs expected={expected:.1f}s")

    print(f"  [concat] Actual durations: {[f'{d:.1f}' for d in actual_durations]}")

    # Build xfade chain
    inputs: list[str] = []
    for p in scene_paths:
        inputs.extend(["-i", p])

    filter_parts = []
    current_label = "[0:v]"
    current_audio = "[0:a]"
    cumulative_dur = actual_durations[0]

    for i in range(1, len(scene_paths)):
        scene = scenes[i] if i < len(scenes) else None
        trans_style = scene.transition_style if scene and scene.transition_style else "fade"
        trans_dur = scene.transition_duration if scene and scene.transition_duration else 1.0

        # Clamp transition duration to at most half of shorter adjacent clip
        max_trans = min(cumulative_dur, actual_durations[i]) * 0.45
        if trans_dur > max_trans:
            trans_dur = max(0.5, max_trans)

        # xfade offset = cumulative duration of all previous output - transition overlap
        offset = cumulative_dur - trans_dur
        if offset < 0.1:
            offset = 0.1

        out_label = f"[xf{i}]" if i < len(scene_paths) - 1 else "[vout]"
        filter_parts.append(
            f"{current_label}[{i}:v]xfade=transition={trans_style}"
            f":duration={trans_dur:.2f}:offset={offset:.2f}{out_label}"
        )
        current_label = out_label

        # Audio crossfade
        a_out = f"[af{i}]" if i < len(scene_paths) - 1 else "[aout]"
        filter_parts.append(
            f"{current_audio}[{i}:a]acrossfade=d={trans_dur:.2f}:c1=tri:c2=tri{a_out}"
        )
        current_audio = a_out

        # After xfade, the combined clip duration = offset + duration_of_current_clip
        cumulative_dur = offset + actual_durations[i]

    filter_complex = ";\n".join(filter_parts)

    cmd = ["ffmpeg", "-y"]
    cmd.extend(inputs)
    cmd.extend(["-filter_complex", filter_complex])
    cmd.extend(["-map", "[vout]", "-map", "[aout]"])
    cmd.extend(_encoder_args())
    cmd.extend(["-c:a", "aac", "-b:a", "192k", "-ar", "48000"])
    cmd.extend(["-pix_fmt", "yuv420p"])
    cmd.append(output_path)

    print(f"  [concat] Joining {len(scene_paths)} scenes with xfade transitions...")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            print(f"  [concat] xfade FAILED:\n{result.stderr[-1500:]}")
            # Fallback: fast concat (no transitions, no re-encoding)
            return _fallback_concat(scene_paths, output_path)
        final_dur = get_video_duration(output_path)
        print(f"  [concat] OK -> {output_path} ({final_dur:.1f}s)")
        return output_path
    except subprocess.TimeoutExpired:
        print(f"  [concat] xfade TIMED OUT — falling back to fast concat")
        return _fallback_concat(scene_paths, output_path)


def _fallback_concat(scene_paths: list[str], output_path: str) -> str | None:
    """Fallback: use concat demuxer with stream copy (no re-encoding = near-instant).
    All scenes are already encoded with same codec/resolution, so -c copy is safe."""
    print("  [concat] Using fast concat (stream copy, no re-encoding)...")
    concat_file = os.path.join(OUTPUT_DIR, "concat.txt")
    with open(concat_file, "w") as f:
        for p in scene_paths:
            f.write(f"file '{p}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_file,
        "-c", "copy",  # stream copy = no re-encoding = instant
    ]
    cmd.append(output_path)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"  [fast concat] stream copy FAILED — retrying with re-encode...")
            # If stream copy fails (codec mismatch), re-encode as last resort
            cmd2 = [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0", "-i", concat_file,
            ]
            cmd2.extend(_encoder_args())
            cmd2.extend(["-c:a", "aac", "-b:a", "192k"])
            cmd2.append(output_path)
            result = subprocess.run(cmd2, capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                print(f"  [fallback concat] FAILED:\n{result.stderr[-1000:]}")
                return None
        final_dur = get_video_duration(output_path)
        print(f"  [concat] OK -> {output_path} ({final_dur:.1f}s)")
        return output_path
    except subprocess.TimeoutExpired:
        return None


def get_video_duration(path: str) -> float:
    """Get duration of a video file in seconds."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", path],
            capture_output=True, text=True, timeout=10,
        )
        return float(result.stdout.strip())
    except Exception:
        return 0.0


# ── Broadcast-Quality Part Stitching ──────────────────────────────────────────

import re


def validate_part(path: str) -> dict:
    """Probe a part video for resolution, duration, codec, and detect black frames
    at boundaries (first/last 3s only — avoids scanning full video)."""
    info = {
        "valid": False, "width": 0, "height": 0, "duration": 0.0,
        "codec": "", "black_trim_start": 0.0, "black_trim_end": 0.0, "error": None,
    }

    # ── Probe basic info ──
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-select_streams", "v:0",
             "-show_entries", "stream=width,height,codec_name,duration",
             "-show_entries", "format=duration",
             "-of", "json", path],
            capture_output=True, text=True, timeout=15,
        )
        import json as _json
        data = _json.loads(probe.stdout)
        stream = data.get("streams", [{}])[0]
        fmt = data.get("format", {})

        info["width"] = int(stream.get("width", 0))
        info["height"] = int(stream.get("height", 0))
        info["codec"] = stream.get("codec_name", "")
        # Duration: prefer format-level (more reliable), then stream-level
        dur = float(fmt.get("duration", 0) or stream.get("duration", 0) or 0)
        info["duration"] = dur
    except Exception as e:
        info["error"] = f"Probe failed: {e}"
        return info

    if info["duration"] <= 0 or info["width"] == 0:
        info["error"] = f"Invalid: duration={info['duration']}, width={info['width']}"
        return info

    if info["codec"] not in ("h264", "hevc", "vp9", "av1"):
        info["error"] = f"Unsupported codec: {info['codec']}"
        return info

    # ── Black frame detection on first 3s ──
    try:
        cmd_start = [
            "ffmpeg", "-y", "-i", path,
            "-t", "3",
            "-vf", "blackdetect=d=0.04:pix_th=0.10",
            "-an", "-f", "null", "-",
        ]
        res = subprocess.run(cmd_start, capture_output=True, text=True, timeout=15)
        # Parse: [blackdetect @ ...] black_start:0 black_end:0.12 black_duration:0.12
        for m in re.finditer(r"black_start:([\d.]+)\s+black_end:([\d.]+)", res.stderr):
            bs, be = float(m.group(1)), float(m.group(2))
            if bs < 0.1:  # only care about black frames starting at/near 0
                info["black_trim_start"] = max(info["black_trim_start"], be)
    except Exception:
        pass  # non-fatal

    # ── Black frame detection on last 3s ──
    try:
        tail_start = max(0, info["duration"] - 3)
        cmd_end = [
            "ffmpeg", "-y", "-ss", f"{tail_start:.2f}", "-i", path,
            "-vf", "blackdetect=d=0.04:pix_th=0.10",
            "-an", "-f", "null", "-",
        ]
        res = subprocess.run(cmd_end, capture_output=True, text=True, timeout=15)
        for m in re.finditer(r"black_start:([\d.]+)\s+black_end:([\d.]+)", res.stderr):
            bs_rel, be_rel = float(m.group(1)), float(m.group(2))
            abs_end = tail_start + be_rel
            # If black extends to end of video (within 0.1s tolerance)
            if abs(abs_end - info["duration"]) < 0.15:
                trim_from = tail_start + bs_rel
                info["black_trim_end"] = info["duration"] - trim_from
    except Exception:
        pass  # non-fatal

    info["valid"] = True
    return info


def normalize_part_resolution(path: str, target_w: int, target_h: int) -> str:
    """Re-encode a part to match target resolution if it differs. Replaces file in-place."""
    # Quick probe to check current resolution
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-select_streams", "v:0",
             "-show_entries", "stream=width,height",
             "-of", "csv=p=0", path],
            capture_output=True, text=True, timeout=10,
        )
        w, h = [int(x) for x in probe.stdout.strip().split(",")]
        if w == target_w and h == target_h:
            return path  # already correct — no-op
    except Exception:
        return path  # can't probe → skip normalization

    print(f"  [normalize] {os.path.basename(path)}: {w}x{h} → {target_w}x{target_h}")
    out_path = path + ".norm.mp4"
    cmd = ["ffmpeg", "-y", "-i", path]
    cmd.extend([
        "-vf", f"scale={target_w}:{target_h}:force_original_aspect_ratio=decrease,"
               f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=black",
    ])
    cmd.extend(_encoder_args())
    cmd.extend(["-c:a", "copy", "-pix_fmt", "yuv420p", out_path])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode == 0:
            os.replace(out_path, path)
            return path
        print(f"  [normalize] FAILED: {result.stderr[-300:]}")
    except subprocess.TimeoutExpired:
        print(f"  [normalize] TIMED OUT")
    # cleanup temp on failure
    if os.path.exists(out_path):
        os.remove(out_path)
    return path


def trim_black_frames(path: str, trim_start: float, trim_end: float, duration: float) -> str:
    """Stream-copy trim of black frames from part boundaries. Replaces in-place.
    Only trims if > 0.05s to avoid unnecessary work."""
    if trim_start < 0.05 and trim_end < 0.05:
        return path  # nothing to trim

    new_start = trim_start if trim_start >= 0.05 else 0.0
    new_dur = duration - new_start - (trim_end if trim_end >= 0.05 else 0.0)
    if new_dur < 0.5:
        return path  # would trim too much

    print(f"  [trim] {os.path.basename(path)}: start={new_start:.2f}s, "
          f"end_trim={trim_end:.2f}s → {new_dur:.1f}s")

    out_path = path + ".trim.mp4"
    cmd = ["ffmpeg", "-y"]
    if new_start > 0:
        cmd.extend(["-ss", f"{new_start:.3f}"])
    cmd.extend(["-i", path, "-t", f"{new_dur:.3f}", "-c", "copy", out_path])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            os.replace(out_path, path)
            return path
        print(f"  [trim] stream copy failed: {result.stderr[-200:]}")
    except subprocess.TimeoutExpired:
        print(f"  [trim] TIMED OUT")
    if os.path.exists(out_path):
        os.remove(out_path)
    return path


def stitch_parts_xfade(
    part_paths: list[str],
    transition_dur: float = 0.75,
    loudnorm: bool = True,
    output_path: str = "/tmp/cast_stitch/stitched_final.mp4",
) -> str | None:
    """Stitch parts with xfade dissolve transitions and audio crossfade.
    Follows the same pattern as concatenate_scenes() (lines 884-984).
    Appends single-pass loudnorm on the final audio stream."""
    if not part_paths:
        return None
    if len(part_paths) == 1:
        import shutil as _shutil
        _shutil.copy2(part_paths[0], output_path)
        return output_path

    # ── Probe actual durations ──
    durations: list[float] = []
    for p in part_paths:
        d = get_video_duration(p)
        if d <= 0:
            print(f"  [xfade] WARNING: cannot probe {os.path.basename(p)}, skipping")
            return None  # can't build xfade without known durations
        durations.append(d)

    total_input = sum(durations)
    print(f"  [xfade] {len(part_paths)} parts, total input: {total_input:.1f}s, "
          f"transition: {transition_dur:.2f}s")

    # ── Build inputs ──
    inputs: list[str] = []
    for p in part_paths:
        inputs.extend(["-i", p])

    # ── Build xfade + acrossfade filter chains ──
    filter_parts = []
    current_v = "[0:v]"
    current_a = "[0:a]"
    cumulative_dur = durations[0]

    for i in range(1, len(part_paths)):
        # Clamp transition to 45% of shorter adjacent segment
        max_trans = min(cumulative_dur, durations[i]) * 0.45
        td = min(transition_dur, max_trans)
        td = max(0.3, td)  # floor at 0.3s

        offset = cumulative_dur - td
        if offset < 0.1:
            offset = 0.1

        is_last = (i == len(part_paths) - 1)
        v_out = "[vout]" if is_last else f"[xf{i}]"
        a_out_label = f"[af{i}]"  # always intermediate for audio

        filter_parts.append(
            f"{current_v}[{i}:v]xfade=transition=fade"
            f":duration={td:.2f}:offset={offset:.2f}{v_out}"
        )
        current_v = v_out

        filter_parts.append(
            f"{current_a}[{i}:a]acrossfade=d={td:.2f}:c1=tri:c2=tri{a_out_label}"
        )
        current_a = a_out_label

        cumulative_dur = offset + durations[i]

    # ── Loudnorm on final audio ──
    if loudnorm:
        filter_parts.append(
            f"{current_a}loudnorm=I=-16:TP=-1.5:LRA=11[aout]"
        )
        audio_map = "[aout]"
    else:
        # Rename last audio label to [aout]
        last_a = filter_parts[-1]
        filter_parts[-1] = last_a.rsplit("]", 1)[0] + "][aout]" if not last_a.endswith("[aout]") else last_a
        # Actually let's just map current_a directly
        audio_map = current_a

    filter_complex = ";\n".join(filter_parts)

    cmd = ["ffmpeg", "-y"]
    cmd.extend(inputs)
    cmd.extend(["-filter_complex", filter_complex])
    cmd.extend(["-map", "[vout]", "-map", audio_map])
    cmd.extend(_stitch_encoder_args())
    cmd.extend(["-c:a", "aac", "-b:a", "192k", "-ar", "48000"])
    cmd.extend(["-pix_fmt", "yuv420p"])
    cmd.append(output_path)

    # Medium preset needs ~1.5-2x realtime; add 300s buffer for filter graph setup
    timeout = min(5400, int(total_input * 2 + 300))
    print(f"  [xfade] Running FFmpeg (timeout={timeout}s, preset=medium)...")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if result.returncode != 0:
            print(f"  [xfade] FAILED:\n{result.stderr[-1500:]}")
            return None
        final_dur = get_video_duration(output_path)
        print(f"  [xfade] OK: {final_dur:.1f}s output")
        return output_path
    except subprocess.TimeoutExpired:
        print(f"  [xfade] TIMED OUT ({timeout}s)")
        return None


def stitch_parts_batched(
    part_paths: list[str],
    transition_dur: float = 0.75,
    loudnorm: bool = True,
    output_path: str = "/tmp/cast_stitch/stitched_final.mp4",
    batch_size: int = 12,
) -> str | None:
    """For >batch_size parts: split into groups, xfade each batch, then xfade the batch outputs.
    Avoids FFmpeg filter graph complexity limits with 25+ inputs."""
    if len(part_paths) <= batch_size:
        return stitch_parts_xfade(part_paths, transition_dur, loudnorm, output_path)

    print(f"  [batched] {len(part_paths)} parts → batches of {batch_size}")
    batch_dir = os.path.join(os.path.dirname(output_path), "batches")
    os.makedirs(batch_dir, exist_ok=True)

    batch_outputs = []
    for batch_idx in range(0, len(part_paths), batch_size):
        batch = part_paths[batch_idx:batch_idx + batch_size]
        batch_label = f"batch_{batch_idx // batch_size}"
        batch_out = os.path.join(batch_dir, f"{batch_label}.mp4")
        print(f"  [batched] {batch_label}: {len(batch)} parts")

        # Don't apply loudnorm on intermediate batches — only on final
        result = stitch_parts_xfade(batch, transition_dur, loudnorm=False, output_path=batch_out)
        if not result:
            print(f"  [batched] {batch_label} FAILED")
            return None
        batch_outputs.append(result)

    # ── Final stitch of batch outputs ──
    print(f"  [batched] Final stitch of {len(batch_outputs)} batch outputs...")
    return stitch_parts_xfade(batch_outputs, transition_dur, loudnorm, output_path)
