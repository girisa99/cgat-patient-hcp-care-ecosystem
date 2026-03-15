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
import re
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


def _parse_text_shadow(css_shadow: str) -> tuple[int, int, int, tuple]:
    """Parse CSS text-shadow: '4px 4px 16px rgba(0,0,0,0.95)' -> (dx, dy, blur, color)."""
    if not css_shadow:
        return (3, 3, 8, (0, 0, 0, 180))  # sensible default
    # Extract px values
    px_vals = re.findall(r'([\d.]+)px', css_shadow)
    dx = int(float(px_vals[0])) if len(px_vals) > 0 else 3
    dy = int(float(px_vals[1])) if len(px_vals) > 1 else 3
    blur = int(float(px_vals[2])) if len(px_vals) > 2 else 8
    # Extract rgba color
    rgba_match = re.search(r'rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)', css_shadow)
    if rgba_match:
        r, g, b = int(float(rgba_match.group(1))), int(float(rgba_match.group(2))), int(float(rgba_match.group(3)))
        a = int(float(rgba_match.group(4) or 1.0) * 255)
        color = (r, g, b, a)
    else:
        color = (0, 0, 0, 180)
    return (dx, dy, blur, color)


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
    y_override: int = -1,
) -> str | None:
    """
    Render text as a transparent PNG overlay with professional styling.
    Returns path to the PNG file.
    y_override: explicit Y position (used for vertical stacking of center-center texts).
    """
    if not text or not text.strip():
        return None

    _ensure_dir()
    out_path = os.path.join(OVERLAY_DIR, f"text_{scene_index:03d}_{element_index:02d}.png")

    font = _find_font(font_family, font_weight, font_size)
    color = _hex_to_rgba(font_color)

    # Parse shadow from CSS or use font-size-based defaults
    sdx, sdy, sblur, scolor = _parse_text_shadow(text_shadow)
    # Scale shadow offset to at least be visible at video resolution
    sdx = max(sdx, font_size // 15)
    sdy = max(sdy, font_size // 15)
    sblur = max(sblur, font_size // 8)

    # ── Measure text (handle multi-line + word wrap) ──
    # Use a temp image for measurement
    tmp = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    tmp_draw = ImageDraw.Draw(tmp)

    lines = text.split("\n") if "\n" in text else [text]
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
            bbox = tmp_draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] > max_text_width:
                wrapped_lines.append(current)
                current = word
            else:
                current = test
        wrapped_lines.append(current)

    line_heights = []
    line_widths = []
    line_spacing = int(font_size * 0.3)
    for line in wrapped_lines:
        if not line.strip():
            line_heights.append(int(font_size * 0.5))
            line_widths.append(0)
            continue
        bbox = tmp_draw.textbbox((0, 0), line, font=font)
        line_heights.append(bbox[3] - bbox[1])
        line_widths.append(bbox[2] - bbox[0])

    total_text_h = sum(line_heights) + line_spacing * (len(wrapped_lines) - 1)
    max_line_w = max(line_widths) if line_widths else 0

    # Position the text block
    block_x, block_y = resolve_position(position, max_line_w, total_text_h, width, height)
    if y_override >= 0:
        block_y = y_override

    # ── Stroke/outline for crisp readability over any background ──
    stroke_w = max(2, font_size // 18)  # 2-4px depending on font size
    stroke_col = (0, 0, 0, 240)         # near-opaque black outline

    # ── Render 3-layer compositing: glow → shadow → outlined text ──

    # Layer 1: Colored glow halo (soft, wide, eye-catching)
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    # Gold glow for warm cinematic feel
    glow_col = (255, 220, 120, 90)

    # Layer 2: Dark shadow (sharper, closer)
    shadow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)

    # Layer 3: Main text with stroke outline
    text_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_layer)

    # Draw background pill/box if specified (on text layer)
    if background_color:
        bg_rgba = _hex_to_rgba(background_color, 180)
        pad = 20
        rx, ry = block_x - pad, block_y - pad
        rw, rh = max_line_w + pad * 2, total_text_h + pad * 2
        text_draw.rounded_rectangle(
            [rx, ry, rx + rw, ry + rh],
            radius=12,
            fill=bg_rgba,
        )

    # Draw each line across all 3 layers
    cur_y = block_y
    for i, line in enumerate(wrapped_lines):
        if not line.strip():
            cur_y += line_heights[i] + line_spacing
            continue

        if text_align == "center":
            line_x = block_x + (max_line_w - line_widths[i]) // 2
        elif text_align == "right":
            line_x = block_x + max_line_w - line_widths[i]
        else:
            line_x = block_x

        # Glow: thick stroke in accent color (will be blurred)
        glow_draw.text((line_x, cur_y), line, font=font, fill=glow_col,
                       stroke_width=stroke_w + 6, stroke_fill=glow_col)

        # Shadow: offset text for depth (will be blurred)
        shadow_draw.text((line_x + sdx, cur_y + sdy), line, font=font, fill=scolor,
                         stroke_width=stroke_w, stroke_fill=scolor)
        shadow_draw.text((line_x + sdx + 1, cur_y + sdy + 1), line, font=font, fill=scolor,
                         stroke_width=stroke_w, stroke_fill=scolor)

        # Main text: crisp with black outline stroke
        text_draw.text((line_x, cur_y), line, font=font, fill=color,
                       stroke_width=stroke_w, stroke_fill=stroke_col)

        cur_y += line_heights[i] + line_spacing

    # Blur glow (wide + soft) and shadow (tighter)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=max(16, sblur * 2)))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=sblur))

    # Composite: glow → shadow → outlined text
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    img = Image.alpha_composite(img, glow_layer)
    img = Image.alpha_composite(img, shadow_layer)
    img = Image.alpha_composite(img, text_layer)

    img.save(out_path, "PNG")
    print(f"    [pillow] Text overlay -> {out_path} ({len(wrapped_lines)} lines, "
          f"{font_size}px, shadow={sdx}/{sdy}/{sblur})")
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
    lt_height = 150 if lead else 100
    lt_y = int(height * 0.78)
    lt_x = 60
    lt_width = min(int(width * 0.65), 1200)
    accent_width = 10
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
    headline_font = _find_font("Inter", "bold", 44)
    headline_color = _hex_to_rgba("#FFFFFF")
    headline_x = lt_x + accent_width + padding
    headline_y = lt_y + 16 if lead else lt_y + (lt_height - 44) // 2

    # Shadow + outline for headline
    draw.text((headline_x + 2, headline_y + 2), headline,
              font=headline_font, fill=(0, 0, 0, 200),
              stroke_width=1, stroke_fill=(0, 0, 0, 200))
    draw.text((headline_x, headline_y), headline,
              font=headline_font, fill=headline_color,
              stroke_width=1, stroke_fill=(0, 0, 0, 180))

    # Lead/subtitle text
    if lead:
        lead_font = _find_font("Inter", "regular", 28)
        lead_color = _hex_to_rgba("#cccccc")
        lead_y = headline_y + 52
        draw.text((headline_x + 1, lead_y + 1), lead,
                  font=lead_font, fill=(0, 0, 0, 160),
                  stroke_width=1, stroke_fill=(0, 0, 0, 160))
        draw.text((headline_x, lead_y), lead,
                  font=lead_font, fill=lead_color,
                  stroke_width=1, stroke_fill=(0, 0, 0, 120))

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

    stroke_w = max(2, font_size // 18)
    stroke_col = (0, 0, 0, 240)
    glow_col = (255, 220, 120, 80)

    def _draw_styled_text(draw_obj, img_obj, tx, ty, txt):
        """Draw text with glow + shadow + outline on a single frame."""
        # Glow layer
        glow_lyr = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        glow_d = ImageDraw.Draw(glow_lyr)
        glow_d.text((tx, ty), txt, font=font, fill=glow_col,
                    stroke_width=stroke_w + 6, stroke_fill=glow_col)
        glow_lyr = glow_lyr.filter(ImageFilter.GaussianBlur(radius=14))

        # Shadow layer
        shd_lyr = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        shd_d = ImageDraw.Draw(shd_lyr)
        shd_d.text((tx + 3, ty + 3), txt, font=font, fill=shadow_color,
                   stroke_width=stroke_w, stroke_fill=shadow_color)
        shd_lyr = shd_lyr.filter(ImageFilter.GaussianBlur(radius=6))

        # Composite glow + shadow onto frame
        img_obj = Image.alpha_composite(img_obj, glow_lyr)
        img_obj = Image.alpha_composite(img_obj, shd_lyr)

        # Main text with outline
        txt_lyr = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        txt_d = ImageDraw.Draw(txt_lyr)
        txt_d.text((tx, ty), txt, font=font, fill=color,
                   stroke_width=stroke_w, stroke_fill=stroke_col)
        img_obj = Image.alpha_composite(img_obj, txt_lyr)
        return img_obj

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
                img = _draw_styled_text(draw, img, tx, ty, visible_text)

            img.save(os.path.join(frame_dir, f"frame_{frame_num:05d}.png"), "PNG")

    else:
        # Simple appear (render single frame)
        img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx, ty = resolve_position(position, tw, th, width, height)
        img = _draw_styled_text(draw, img, tx, ty, text)
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
