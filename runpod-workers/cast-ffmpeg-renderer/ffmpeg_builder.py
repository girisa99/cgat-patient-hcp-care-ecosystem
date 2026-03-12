"""
FFmpeg Builder — constructs filter_complex strings and runs FFmpeg for each scene.

Translates castTimelineEngine elements into FFmpeg filters:
  - image + Ken Burns → zoompan
  - video (PiP) → scale + overlay
  - text → drawtext
  - audio → amix with volume/adelay
  - transitions → xfade between scene clips
"""

import os
import subprocess
import shlex
from timeline_parser import SceneInstruction, ElementInstruction

OUTPUT_DIR = "/tmp/cast_render"
# Try NVENC first, fall back to libx264 if no GPU available
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
    if len(c) == 6:
        return f"0x{c}"
    return f"0x{c}"


def _escape_drawtext(text: str) -> str:
    """Escape text for FFmpeg drawtext filter."""
    return text.replace("\\", "\\\\").replace("'", "'\\''").replace(":", "\\:").replace("%", "%%")


def _find_font() -> str:
    """Find a suitable font file on the system."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for f in candidates:
        if os.path.exists(f):
            return f
    return "DejaVuSans"  # fallback to font name


def _build_zoompan_filter(elem: ElementInstruction, scene_dur: float, width: int, height: int) -> str:
    """Build zoompan filter string for Ken Burns effect on a still image."""
    fps = 30
    total_frames = int(fps * scene_dur)
    zoom_rate = elem.zoom_amount / fps  # per-frame zoom rate

    # Determine zoom expression
    if elem.zoom_direction == "out":
        z_expr = f"if(eq(on,1),1.5,max(1,zoom-{zoom_rate:.6f}))"
        # Start zoomed in, zoom out
        x_expr = f"(iw-iw/zoom)/2"
        y_expr = f"(ih-ih/zoom)/2"
    else:
        # Default: zoom in
        z_expr = f"min(1.5,zoom+{zoom_rate:.6f})"
        x_expr = f"(iw-iw/zoom)/2"
        y_expr = f"(ih-ih/zoom)/2"

    # Add pan direction
    if elem.pan_direction == "left":
        x_expr = f"if(eq(on,1),iw/zoom/4,x+1)"
    elif elem.pan_direction == "right":
        x_expr = f"if(eq(on,1),iw-iw/zoom-iw/zoom/4,x-1)"
    elif elem.pan_direction == "up":
        y_expr = f"if(eq(on,1),ih/zoom/4,y+1)"
    elif elem.pan_direction == "down":
        y_expr = f"if(eq(on,1),ih-ih/zoom-ih/zoom/4,y-1)"

    return (
        f"zoompan=z='{z_expr}'"
        f":x='{x_expr}'"
        f":y='{y_expr}'"
        f":d={total_frames}"
        f":s={width}x{height}"
        f":fps={fps}"
    )


def _build_drawtext_filter(elem: ElementInstruction, width: int, height: int) -> str:
    """Build drawtext filter for text overlay."""
    font = _find_font()
    text = _escape_drawtext(elem.text)
    color = _hex_to_ffmpeg_color(elem.font_color)
    size = elem.font_size

    # Position
    if elem.text_align == "center":
        x_expr = "(w-text_w)/2"
    elif elem.text_align == "right":
        x_expr = "w-text_w-40"
    else:
        x_expr = "40"

    # Default to lower third area
    if elem.y > 0:
        y_expr = str(elem.y)
    else:
        y_expr = "h-h/4"

    # Enable time window
    enable = ""
    if elem.duration > 0:
        end_time = elem.start + elem.duration
        enable = f":enable='between(t,{elem.start:.2f},{end_time:.2f})'"

    # Background box
    box = ""
    if elem.background_color:
        bg = _hex_to_ffmpeg_color(elem.background_color)
        box = f":box=1:boxcolor={bg}@0.7:boxborderw=12"

    return (
        f"drawtext=text='{text}'"
        f":fontfile='{font}'"
        f":fontsize={size}"
        f":fontcolor={color}"
        f":x={x_expr}:y={y_expr}"
        f"{box}{enable}"
    )


def render_scene(scene: SceneInstruction, width: int = 1920, height: int = 1080) -> str | None:
    """
    Render a single scene to an MP4 file.
    Returns the output file path, or None on failure.
    """
    _ensure_dir()
    output_path = os.path.join(OUTPUT_DIR, f"scene_{scene.index:03d}.mp4")

    # Classify elements
    images = [e for e in scene.elements if e.type == "image" and e.local_path]
    videos = [e for e in scene.elements if e.type == "video" and e.local_path]
    texts = [e for e in scene.elements if e.type == "text" and e.text]
    audios = [e for e in scene.elements if e.type == "audio" and e.local_path]
    components = [e for e in scene.elements if e.type == "component"]

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

    # ── PiP video overlays (lipsync, B-roll) ──
    for vi, vid in enumerate(videos):
        inputs.extend(["-i", vid.local_path])
        pip_label = f"pip{scene.index}_{vi}"
        # Scale PiP to specified size
        pip_w = vid.width if vid.width < width else width // 3
        pip_h = vid.height if vid.height < height else height // 3
        scale = f"scale={pip_w}:{pip_h}"

        enable = ""
        if vid.duration > 0:
            end_t = vid.start + vid.duration
            enable = f":enable='between(t,{vid.start:.2f},{end_t:.2f})'"

        filter_parts.append(f"[{input_idx}:v]{scale},format=yuva420p[{pip_label}]")
        prev = current_video
        current_video = f"v{scene.index}_{vi}"
        filter_parts.append(
            f"[{prev}][{pip_label}]overlay={vid.x}:{vid.y}{enable}[{current_video}]"
        )
        input_idx += 1

    # ── Text overlays ──
    for ti, txt in enumerate(texts):
        dt = _build_drawtext_filter(txt, width, height)
        prev = current_video
        current_video = f"t{scene.index}_{ti}"
        filter_parts.append(f"[{prev}]{dt}[{current_video}]")

    # ── Component overlays (lower-thirds) — render as drawtext with box ──
    for ci, comp in enumerate(components):
        # Components are treated as text with background box
        comp_text = comp.text or comp.src or ""
        if comp_text:
            comp_elem = ElementInstruction(
                type="text", text=comp_text,
                font_size=comp.font_size or 36,
                font_color=comp.font_color or "#FFFFFF",
                background_color=comp.background_color or "#000000",
                start=comp.start, duration=comp.duration,
                y=int(height * 0.78),
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
            a_filters.append(f"aloop=loop=-1:size=2e+09")
            a_filters.append(f"atrim=duration={scene.duration:.2f}")

        filter_str = ",".join(a_filters) if a_filters else "anull"
        filter_parts.append(f"[{input_idx}:a]{filter_str}[{a_label}]")
        audio_labels.append(f"[{a_label}]")
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
    else:
        # Generate silent audio track
        cmd.extend(["-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo:d={scene.duration}"])
        cmd.extend(["-map", f"{input_idx}:a"])

    # Encoding
    cmd.extend(_encoder_args())
    cmd.extend(["-c:a", "aac", "-b:a", "192k", "-ar", "48000"])
    cmd.extend(["-t", f"{scene.duration:.2f}"])
    cmd.extend(["-pix_fmt", "yuv420p"])
    cmd.append(output_path)

    print(f"  [render] Scene {scene.index} ({scene.comment}): {scene.duration:.1f}s, "
          f"{len(images)} imgs, {len(videos)} vids, {len(texts)} texts, {len(audios)} audio")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"  [render] Scene {scene.index} FAILED:\n{result.stderr[-1000:]}")
            return None
        print(f"  [render] Scene {scene.index} OK -> {output_path}")
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
    Returns path to final concatenated video.
    """
    if not scene_paths:
        return None

    if len(scene_paths) == 1:
        return scene_paths[0]

    _ensure_dir()
    output_path = os.path.join(OUTPUT_DIR, "final_video.mp4")

    # Build xfade chain
    inputs: list[str] = []
    for p in scene_paths:
        inputs.extend(["-i", p])

    # Calculate cumulative offsets for xfade
    filter_parts = []
    current_label = "[0:v]"
    current_audio = "[0:a]"
    cumulative_dur = scenes[0].duration if scenes else 5

    for i in range(1, len(scene_paths)):
        scene = scenes[i] if i < len(scenes) else None
        trans_style = scene.transition_style if scene and scene.transition_style else "fade"
        trans_dur = scene.transition_duration if scene and scene.transition_duration else 1.0

        # xfade offset = cumulative duration - transition overlap
        offset = cumulative_dur - trans_dur
        if offset < 0:
            offset = 0

        out_label = f"[xf{i}]" if i < len(scene_paths) - 1 else "[vout]"
        filter_parts.append(
            f"{current_label}[{i}:v]xfade=transition={trans_style}:duration={trans_dur:.2f}:offset={offset:.2f}{out_label}"
        )
        current_label = out_label

        # Audio crossfade
        a_out = f"[af{i}]" if i < len(scene_paths) - 1 else "[aout]"
        filter_parts.append(
            f"{current_audio}[{i}:a]acrossfade=d={trans_dur:.2f}:c1=tri:c2=tri{a_out}"
        )
        current_audio = a_out

        cumulative_dur = offset + (scenes[i].duration if i < len(scenes) else 5)

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
            print(f"  [concat] FAILED:\n{result.stderr[-1500:]}")
            # Fallback: simple concat demuxer (no transitions)
            return _fallback_concat(scene_paths, output_path)
        print(f"  [concat] OK -> {output_path}")
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
        print(f"  [fallback concat] OK -> {output_path}")
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
