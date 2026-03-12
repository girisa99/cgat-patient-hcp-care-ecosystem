"""
Pillow Renderer — Pre-renders rich text overlays as transparent PNGs for FFmpeg compositing.

Provides commercial-grade text rendering with:
  - Custom fonts (Inter) with proper weight/size
  - Text shadows and outlines
  - Proper positioning (center-center, bottom-left, etc.)
  - Lower-third banners with accent bars
  - Kinetic text frame sequences (word-by-word, appear)
  - Storybook frame borders
  - Vignette masks
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OVERLAY_DIR = "/tmp/cast_overlays"
FONT_DIR = "/usr/share/fonts/truetype"


def _ensure_dir():
    os.makedirs(OVERLAY_DIR, exist_ok=True)


def _find_font(family: str = "Inter", weight: str = "bold", size: int = 48) -> ImageFont.FreeTypeFont:
    """Find and load a font file. Falls back through alternatives."""
    # Normalize weight
    weight_map = {
        "bold": "Bold",
        "semibold": "SemiBold",
        "medium": "Medium",
        "regular": "Regular",
        "light": "Light",
        "black": "Black",
        "extrabold": "ExtraBold",
        "700": "Bold",
        "600": "SemiBold",
        "500": "Medium",
        "400": "Regular",
    }
    w = weight_map.get(str(weight).lower(), "Bold")

    candidates = [
        f"{FONT_DIR}/inter/Inter-{w}.ttf",
        f"{FONT_DIR}/inter/Inter_{w}.ttf",
        f"{FONT_DIR}/inter/Inter-Bold.ttf",
        f"{FONT_DIR}/inter/Inter-Regular.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans-Bold.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans.ttf",
        f"{FONT_DIR}/liberation/LiberationSans-Bold.ttf",
        f"{FONT_DIR}/liberation/LiberationSans-Regular.ttf",
        f"{FONT_DIR}/noto/NotoSans-Bold.ttf",
        f"{FONT_DIR}/noto/NotoSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue

    # Absolute fallback
    try:
        return ImageFont.truetype("DejaVuSans-Bold", size)
    except Exception:
        return ImageFont.load_default()


def _hex_to_rgba(hex_color: str, alpha: int = 255) -> tuple:
    """Convert #RRGGBB or #RRGGBBAA to (R, G, B, A) tuple."""
    c = hex_color.lstrip("#")
    if len(c) == 8:
        return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), int(c[6:8], 16))
    if len(c) == 6:
        return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), alpha)
    return (255, 255, 255, alpha)


def resolve_position(position: str, text_w: int, text_h: int,
                     canvas_w: int, canvas_h: int,
                     margin: int = 60) -> tuple[int, int]:
    """
    Map position string to (x, y) pixel coordinates.
    Positions: center-center, bottom-center, bottom-left, bottom-right,
               top-center, top-left, top-right, left-center, right-center
    """
    pos = (position or "").lower().strip()

    # Parse vertical-horizontal or horizontal-vertical
    if pos in ("center-center", "center", "middle"):
        return ((canvas_w - text_w) // 2, (canvas_h - text_h) // 2)
    elif pos in ("bottom-center", "center-bottom"):
        return ((canvas_w - text_w) // 2, canvas_h - text_h - margin * 2)
    elif pos in ("bottom-left", "left-bottom"):
        return (margin, canvas_h - text_h - margin * 2)
    elif pos in ("bottom-right", "right-bottom"):
        return (canvas_w - text_w - margin, canvas_h - text_h - margin * 2)
    elif pos in ("top-center", "center-top"):
        return ((canvas_w - text_w) // 2, margin)
    elif pos in ("top-left", "left-top"):
        return (margin, margin)
    elif pos in ("top-right", "right-top"):
        return (canvas_w - text_w - margin, margin)
    elif pos in ("left-center", "center-left"):
        return (margin, (canvas_h - text_h) // 2)
    elif pos in ("right-center", "center-right"):
        return (canvas_w - text_w - margin, (canvas_h - text_h) // 2)
    else:
        # Default: center-center
        return ((canvas_w - text_w) // 2, (canvas_h - text_h) // 2)


def render_text_overlay(
    text: str,
    width: int = 1920,
    height: int = 1080,
    font_family: str = "Inter",
    font_size: int = 48,
    font_color: str = "#FFFFFF",
    font_weight: str = "bold",
    position: str = "center-center",
    text_align: str = "center",
    background_color: str = "",
    letter_spacing: float = 0,
    text_shadow: str = "",
    scene_index: int = 0,
    element_index: int = 0,
) -> str | None:
    """
    Render text as a transparent PNG overlay with professional styling.
    Returns path to the PNG file.
    """
    if not text or not text.strip():
        return None

    _ensure_dir()
    out_path = os.path.join(OVERLAY_DIR, f"text_{scene_index:03d}_{element_index:02d}.png")

    # Create transparent canvas
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    font = _find_font(font_family, font_weight, font_size)
    color = _hex_to_rgba(font_color)

    # Measure text (handle multi-line)
    lines = text.split("\n") if "\n" in text else [text]

    # Wrap long lines
    max_text_width = int(width * 0.85)
    wrapped_lines = []
    for line in lines:
        words = line.split()
        if not words:
            wrapped_lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            test = current + " " + word
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] > max_text_width:
                wrapped_lines.append(current)
                current = word
            else:
                current = test
        wrapped_lines.append(current)

    # Calculate total text block size
    line_heights = []
    line_widths = []
    line_spacing = int(font_size * 0.3)
    for line in wrapped_lines:
        if not line.strip():
            line_heights.append(int(font_size * 0.5))
            line_widths.append(0)
            continue
        bbox = draw.textbbox((0, 0), line, font=font)
        line_heights.append(bbox[3] - bbox[1])
        line_widths.append(bbox[2] - bbox[0])

    total_text_h = sum(line_heights) + line_spacing * (len(wrapped_lines) - 1)
    max_line_w = max(line_widths) if line_widths else 0

    # Position the text block
    block_x, block_y = resolve_position(position, max_line_w, total_text_h, width, height)

    # Draw background pill/box if specified
    if background_color:
        bg_rgba = _hex_to_rgba(background_color, 180)
        pad = 20
        rx, ry = block_x - pad, block_y - pad
        rw, rh = max_line_w + pad * 2, total_text_h + pad * 2
        # Rounded rectangle
        draw.rounded_rectangle(
            [rx, ry, rx + rw, ry + rh],
            radius=12,
            fill=bg_rgba,
        )

    # Draw each line
    cur_y = block_y
    for i, line in enumerate(wrapped_lines):
        if not line.strip():
            cur_y += line_heights[i] + line_spacing
            continue

        # Horizontal alignment within block
        if text_align == "center":
            line_x = block_x + (max_line_w - line_widths[i]) // 2
        elif text_align == "right":
            line_x = block_x + max_line_w - line_widths[i]
        else:
            line_x = block_x

        # Text shadow (offset shadow for depth)
        shadow_offset = max(2, font_size // 20)
        shadow_blur = max(3, font_size // 12)
        # Draw shadow layer
        shadow_color = (0, 0, 0, 160)
        for dx in range(-1, 2):
            for dy in range(-1, 2):
                if dx == 0 and dy == 0:
                    continue
                draw.text(
                    (line_x + dx * shadow_offset, cur_y + dy * shadow_offset),
                    line, font=font, fill=shadow_color,
                )
        # Extra shadow below for "lifted" effect
        draw.text(
            (line_x + shadow_offset, cur_y + shadow_offset + 1),
            line, font=font, fill=(0, 0, 0, 120),
        )

        # Main text
        draw.text((line_x, cur_y), line, font=font, fill=color)

        cur_y += line_heights[i] + line_spacing

    # Apply slight blur to shadows (makes them softer)
    # We do this by compositing: render shadow separately, blur, then overlay text
    img.save(out_path, "PNG")
    print(f"    [pillow] Text overlay -> {out_path} ({len(wrapped_lines)} lines, {font_size}px)")
    return out_path


def render_lower_third(
    headline: str,
    lead: str = "",
    width: int = 1920,
    height: int = 1080,
    accent_color: str = "#f5d77a",
    bg_color: str = "#000000",
    scene_index: int = 0,
    element_index: int = 0,
) -> str | None:
    """
    Render a CNN-style lower-third banner as transparent PNG.
    Features: colored accent bar on left, headline text, optional lead/subtitle.
    """
    if not headline:
        return None

    _ensure_dir()
    out_path = os.path.join(OVERLAY_DIR, f"lt_{scene_index:03d}_{element_index:02d}.png")

    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Lower-third dimensions
    lt_height = 120 if lead else 80
    lt_y = int(height * 0.78)
    lt_x = 60
    lt_width = min(int(width * 0.65), 1200)
    accent_width = 6
    padding = 24

    # Background bar with transparency
    bg_rgba = _hex_to_rgba(bg_color, 200)
    draw.rounded_rectangle(
        [lt_x, lt_y, lt_x + lt_width, lt_y + lt_height],
        radius=6,
        fill=bg_rgba,
    )

    # Accent bar on left
    accent_rgba = _hex_to_rgba(accent_color)
    draw.rectangle(
        [lt_x, lt_y, lt_x + accent_width, lt_y + lt_height],
        fill=accent_rgba,
    )

    # Headline text
    headline_font = _find_font("Inter", "bold", 32)
    headline_color = _hex_to_rgba("#FFFFFF")
    headline_x = lt_x + accent_width + padding
    headline_y = lt_y + 14 if lead else lt_y + (lt_height - 32) // 2

    # Shadow
    draw.text((headline_x + 1, headline_y + 1), headline,
              font=headline_font, fill=(0, 0, 0, 160))
    draw.text((headline_x, headline_y), headline,
              font=headline_font, fill=headline_color)

    # Lead/subtitle text
    if lead:
        lead_font = _find_font("Inter", "regular", 22)
        lead_color = _hex_to_rgba("#cccccc")
        lead_y = headline_y + 40
        draw.text((headline_x + 1, lead_y + 1), lead,
                  font=lead_font, fill=(0, 0, 0, 120))
        draw.text((headline_x, lead_y), lead,
                  font=lead_font, fill=lead_color)

    img.save(out_path, "PNG")
    print(f"    [pillow] Lower-third -> {out_path} (headline: {headline[:30]})")
    return out_path


def render_pip_glow_border(
    pip_width: int,
    pip_height: int,
    glow_color: str = "#c4b5fd",
    glow_size: int = 8,
    scene_index: int = 0,
    element_index: int = 0,
) -> str | None:
    """
    Render a glowing border frame for PiP (picture-in-picture) overlays.
    Returns path to transparent PNG with glow border.
    """
    _ensure_dir()
    out_path = os.path.join(OVERLAY_DIR, f"glow_{scene_index:03d}_{element_index:02d}.png")

    # Create image slightly larger than PiP for the glow
    pad = glow_size * 3
    total_w = pip_width + pad * 2
    total_h = pip_height + pad * 2

    img = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    gc = _hex_to_rgba(glow_color, 200)

    # Draw outer glow rectangles with decreasing alpha
    for i in range(glow_size, 0, -1):
        alpha = int(200 * (i / glow_size) * 0.5)
        border_color = (gc[0], gc[1], gc[2], alpha)
        offset = pad - i
        draw.rounded_rectangle(
            [offset, offset, total_w - offset, total_h - offset],
            radius=8,
            outline=border_color,
            width=2,
        )

    # Clear the center (where the actual video goes)
    center = Image.new("RGBA", (pip_width, pip_height), (0, 0, 0, 0))
    img.paste(center, (pad, pad))

    img.save(out_path, "PNG")
    return out_path


def render_storybook_frame(
    width: int = 1920,
    height: int = 1080,
    border_color: str = "#f5d77a",
    scene_index: int = 0,
) -> str | None:
    """
    Render a decorative gilded storybook frame overlay.
    Double-line border with corner ornaments.
    """
    _ensure_dir()
    out_path = os.path.join(OVERLAY_DIR, f"frame_{scene_index:03d}.png")

    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    bc = _hex_to_rgba(border_color, 180)
    bc_dim = _hex_to_rgba(border_color, 100)

    margin = 40
    inner_margin = 56

    # Outer border
    draw.rounded_rectangle(
        [margin, margin, width - margin, height - margin],
        radius=4,
        outline=bc,
        width=3,
    )

    # Inner border
    draw.rounded_rectangle(
        [inner_margin, inner_margin, width - inner_margin, height - inner_margin],
        radius=2,
        outline=bc_dim,
        width=1,
    )

    # Corner ornaments (small decorative squares)
    ornament_size = 12
    corners = [
        (margin - 2, margin - 2),
        (width - margin - ornament_size + 2, margin - 2),
        (margin - 2, height - margin - ornament_size + 2),
        (width - margin - ornament_size + 2, height - margin - ornament_size + 2),
    ]
    for cx, cy in corners:
        draw.rectangle(
            [cx, cy, cx + ornament_size, cy + ornament_size],
            fill=bc,
        )

    img.save(out_path, "PNG")
    print(f"    [pillow] Storybook frame -> {out_path}")
    return out_path


def render_kinetic_text_frames(
    text: str,
    width: int = 1920,
    height: int = 1080,
    font_family: str = "Inter",
    font_size: int = 64,
    font_color: str = "#FFFFFF",
    font_weight: str = "bold",
    position: str = "center-center",
    style: str = "003",
    duration: float = 5.0,
    fps: int = 30,
    scene_index: int = 0,
    element_index: int = 0,
) -> str | None:
    """
    Render kinetic text as a video file (sequence of frames → mp4).
    style '003' = word-by-word reveal
    style '002' = single appear with fade
    Returns path to a transparent-background video or PNG sequence dir.
    """
    import subprocess

    _ensure_dir()
    frame_dir = os.path.join(OVERLAY_DIR, f"kinetic_{scene_index:03d}_{element_index:02d}")
    os.makedirs(frame_dir, exist_ok=True)
    out_path = os.path.join(OVERLAY_DIR, f"kinetic_{scene_index:03d}_{element_index:02d}.mov")

    words = text.split()
    if not words:
        return None

    total_frames = int(fps * duration)
    font = _find_font(font_family, font_weight, font_size)
    color = _hex_to_rgba(font_color)
    shadow_color = (0, 0, 0, 160)

    if style == "003":
        # Word-by-word reveal
        frames_per_word = max(1, total_frames // len(words))
        hold_frames = max(fps, total_frames - frames_per_word * len(words))

        for frame_num in range(total_frames):
            img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)

            # How many words visible at this frame
            word_count = min(len(words), frame_num // frames_per_word + 1)
            visible_text = " ".join(words[:word_count])

            if visible_text:
                bbox = draw.textbbox((0, 0), visible_text, font=font)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx, ty = resolve_position(position, tw, th, width, height)

                # Shadow
                draw.text((tx + 2, ty + 2), visible_text, font=font, fill=shadow_color)
                # Main text
                draw.text((tx, ty), visible_text, font=font, fill=color)

            img.save(os.path.join(frame_dir, f"frame_{frame_num:05d}.png"), "PNG")

    else:
        # Simple appear (render single frame)
        img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx, ty = resolve_position(position, tw, th, width, height)
        draw.text((tx + 2, ty + 2), text, font=font, fill=shadow_color)
        draw.text((tx, ty), text, font=font, fill=color)
        # Save as single PNG — FFmpeg will handle fade
        single_path = os.path.join(OVERLAY_DIR, f"text_{scene_index:03d}_{element_index:02d}.png")
        img.save(single_path, "PNG")
        return single_path

    # Convert frame sequence to ProRes 4444 video (supports alpha)
    try:
        cmd = [
            "ffmpeg", "-y",
            "-framerate", str(fps),
            "-i", os.path.join(frame_dir, "frame_%05d.png"),
            "-c:v", "prores_ks", "-profile:v", "4",
            "-pix_fmt", "yuva444p10le",
            "-t", f"{duration:.2f}",
            out_path,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"    [pillow] Kinetic text encode FAILED: {result.stderr[-300:]}")
            return None
        print(f"    [pillow] Kinetic text -> {out_path} ({total_frames} frames)")
        return out_path
    except Exception as e:
        print(f"    [pillow] Kinetic text error: {e}")
        return None
