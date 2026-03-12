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
except ImportError:
    PILLOW_AVAILABLE = False
    print("  [ffmpeg] WARNING: pillow_renderer not available, falling back to drawtext")

OUTPUT_DIR = "/tmp/cast_render"
HWACCEL_AVAILABLE = None  # lazy-detect


def _ensure_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def _detect_nvenc() -> bool:
    """Check if h264_nvenc encoder is available."""
    global HWACCEL_AVAILABLE
    if HWACCEL_AVAILABLE is not None:
        return HWACCEL_AVAILABLE
    try:
        result = subprocess.run(
            ["ffmpeg", "-hide_banner", "-encoders"],
            capture_output=True, text=True, timeout=10,
        )
        HWACCEL_AVAILABLE = "h264_nvenc" in result.stdout
    except Exception:
        HWACCEL_AVAILABLE = False
    print(f"  [ffmpeg] NVENC available: {HWACCEL_AVAILABLE}")
    return HWACCEL_AVAILABLE


def _encoder_args() -> list[str]:
    """Return encoder flags — NVENC if available, else libx264."""
    if _detect_nvenc():
        return ["-c:v", "h264_nvenc", "-preset", "p4", "-b:v", "8M", "-maxrate", "12M", "-bufsize", "16M"]
    return ["-c:v", "libx264", "-preset", "medium", "-crf", "20"]


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


def _build_zoompan_filter(elem: ElementInstruction, scene_dur: float,
                          width: int, height: int) -> str:
    """Build zoompan filter string for Ken Burns effect on a still image."""
    fps = 30
    total_frames = int(fps * scene_dur)

    # Safety: ensure at least 1 second of frames
    if total_frames < 30:
        total_frames = int(30 * scene_dur) if scene_dur > 0 else 150
    if total_frames < 30:
        total_frames = 150  # absolute minimum ~5 seconds

    zoom_rate = elem.zoom_amount / total_frames  # per-frame zoom rate
    # Clamp zoom rate for smooth motion
    zoom_rate = max(0.00005, min(0.002, zoom_rate))

    # Determine zoom expression
    if elem.zoom_direction == "out":
        max_zoom = 1.0 + elem.zoom_amount
        z_expr = f"if(eq(on,1),{max_zoom:.4f},max(1.0001,zoom-{zoom_rate:.6f}))"
    else:
        # Default: zoom in
        max_zoom = 1.0 + elem.zoom_amount
        z_expr = f"if(eq(on,1),1.0001,min({max_zoom:.4f},zoom+{zoom_rate:.6f}))"

    # Center the zoom by default
    x_expr = "(iw-iw/zoom)/2"
    y_expr = "(ih-ih/zoom)/2"

    # Add pan direction — supports compound directions (top-left, bottom-right, etc.)
    pan_px = max(1, int(elem.pan_distance * width / total_frames))
    pan = elem.pan_direction.lower().strip()

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


def _build_cinematic_filter(scene_index: int) -> str:
    """Build cinematic post-processing filter chain."""
    filters = [
        "eq=contrast=1.05:saturation=1.08:brightness=0.01",
        "colorbalance=rs=0.02:gs=-0.01:bs=-0.02",
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

    for ei, elem in enumerate(scene.elements):
        if elem.type == "text" and elem.text:
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

    # Storybook frame for transition scenes
    comment = (scene.comment or "").lower()
    if "transition" in comment or "storybook" in comment:
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

    # ── Phase 0: Pre-render overlays ──
    overlays = _pre_render_overlays(scene, width, height)

    # Classify elements
    images = [e for e in scene.elements if e.type == "image" and e.local_path]
    videos = [e for e in scene.elements if e.type == "video" and e.local_path]
    texts = [(i, e) for i, e in enumerate(scene.elements) if e.type == "text" and e.text]
    audios = [e for e in scene.elements if e.type == "audio" and e.local_path]
    components = [(i, e) for i, e in enumerate(scene.elements) if e.type == "component"]

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

    # ── Primary background image with Ken Burns ──
    bg_image = None
    for img in images:
        if img.width >= width * 0.8 and img.height >= height * 0.8:
            bg_image = img
            break
    if not bg_image and images:
        bg_image = images[0]

    if bg_image:
        inputs.extend(["-i", bg_image.local_path])
        zp = _build_zoompan_filter(bg_image, scene.duration, width, height)
        kb_label = f"kb{scene.index}"
        filter_parts.append(f"[{input_idx}:v]{zp},format=yuva420p[{kb_label}]")
        # Overlay Ken Burns on base
        prev = current_video
        current_video = f"bg{scene.index}"
        filter_parts.append(f"[{prev}][{kb_label}]overlay=0:0:shortest=1[{current_video}]")
        input_idx += 1

        # Add fade-in/fade-out to the image
        if bg_image.fade_in > 0 or bg_image.fade_out > 0:
            prev = current_video
            current_video = f"bgf{scene.index}"
            fade_filters = []
            if bg_image.fade_in > 0:
                fade_filters.append(f"fade=t=in:st=0:d={bg_image.fade_in:.2f}")
            if bg_image.fade_out > 0:
                out_start = scene.duration - bg_image.fade_out
                fade_filters.append(f"fade=t=out:st={out_start:.2f}:d={bg_image.fade_out:.2f}")
            filter_parts.append(f"[{prev}]{','.join(fade_filters)}[{current_video}]")

    # ── Cinematic post-processing on background ──
    prev = current_video
    current_video = f"cin{scene.index}"
    cine_filter = _build_cinematic_filter(scene.index)
    filter_parts.append(f"[{prev}]{cine_filter}[{current_video}]")

    # ── PiP video overlays (lipsync, B-roll) with glow border ──
    for vi, vid in enumerate(videos):
        inputs.extend(["-i", vid.local_path])
        pip_label = f"pip{scene.index}_{vi}"

        # Scale PiP to specified size — ensure it fits within the frame
        pip_w = vid.width if vid.width < width else width // 3
        pip_h = vid.height if vid.height < height else height // 3
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
            # Use explicit x,y if provided
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

        filter_parts.append(f"[{input_idx}:v]{scale},format=yuva420p[{pip_label}]")
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
            f"[{prev}][{frame_label}]overlay=0:0:shortest=1[{current_video}]"
        )
        input_idx += 1

    # ── Text overlays (Pillow PNG or fallback drawtext) ──
    for ti, (ei, txt) in enumerate(texts):
        if ei in overlays:
            # Use pre-rendered Pillow PNG
            png_path = overlays[ei]
            inputs.extend(["-i", png_path])
            txt_label = f"tpng{scene.index}_{ti}"
            filter_parts.append(f"[{input_idx}:v]format=rgba[{txt_label}]")

            enable = ""
            if txt.duration > 0:
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
            if comp.duration > 0:
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
        if aud.duration > 0:
            a_filters.append(f"atrim=duration={aud.duration + aud.seek:.2f}")
        if aud.loop:
            a_filters.append("aloop=loop=-1:size=2e+09")
            a_filters.append(f"atrim=duration={scene.duration:.2f}")
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
        inputs.extend(["-f", "lavfi", "-i",
                       f"anullsrc=r=48000:cl=stereo:d={scene.duration:.2f}"])
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

    print(f"  [render] Scene {scene.index} ({scene.comment}): {scene.duration:.1f}s, "
          f"{len(images)} imgs, {len(videos)} vids, {len(texts)} texts, "
          f"{len(components)} comps, {len(audios)} audio, "
          f"{len(overlays)} pillow overlays")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"  [render] Scene {scene.index} FAILED:\n{result.stderr[-1500:]}")
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
            # Fallback: simple concat demuxer (no transitions)
            return _fallback_concat(scene_paths, output_path)
        final_dur = get_video_duration(output_path)
        print(f"  [concat] OK -> {output_path} ({final_dur:.1f}s)")
        return output_path
    except subprocess.TimeoutExpired:
        print(f"  [concat] TIMED OUT (600s)")
        return None


def _fallback_concat(scene_paths: list[str], output_path: str) -> str | None:
    """Fallback: use concat demuxer (no transitions) if xfade fails."""
    print("  [concat] Falling back to simple concat demuxer...")
    concat_file = os.path.join(OUTPUT_DIR, "concat.txt")
    with open(concat_file, "w") as f:
        for p in scene_paths:
            f.write(f"file '{p}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_file,
    ]
    cmd.extend(_encoder_args())
    cmd.extend(["-c:a", "aac", "-b:a", "192k"])
    cmd.append(output_path)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            print(f"  [fallback concat] FAILED:\n{result.stderr[-1000:]}")
            return None
        final_dur = get_video_duration(output_path)
        print(f"  [fallback concat] OK -> {output_path} ({final_dur:.1f}s)")
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
