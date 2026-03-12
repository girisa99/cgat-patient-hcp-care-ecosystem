"""
Timeline Parser — converts castTimelineEngine JSON into per-scene render instructions.

Input: JSON2Video-compatible timeline format (as produced by castTimelineEngine.ts)
Output: list of SceneInstruction dicts ready for ffmpeg_builder.py

Handles:
  - Ken Burns: zoom (number 3-5 = percentage) + pan ("left"/"right"/"up"/"down")
  - Text settings: nested { settings: { font-family, font-size, font-color } }
  - Position: "center-center", "bottom-left", "bottom-right", "top-center", etc.
  - Components: lower-thirds with settings.headline.text, settings.lead.text
"""

import re
from dataclasses import dataclass, field


@dataclass
class ElementInstruction:
    """A single element within a scene (image, video, text, audio, component)."""
    type: str                   # 'image', 'video', 'text', 'audio', 'component'
    local_path: str = ""       # local file path (after download)
    src: str = ""              # original URL
    start: float = 0           # start time within scene (seconds)
    duration: float = 0        # element duration
    x: int = 0
    y: int = 0
    width: int = 1920
    height: int = 1080
    resize: str = "cover"      # cover, contain, stretch, none
    volume: float = 1.0        # audio volume (0-1)
    # Text-specific
    text: str = ""
    font_family: str = "Inter"
    font_size: int = 48
    font_color: str = "#FFFFFF"
    font_weight: str = "bold"
    text_align: str = "center"
    background_color: str = ""  # text box background
    position: str = ""         # "center-center", "bottom-left", etc.
    letter_spacing: float = 0
    text_shadow: str = ""      # e.g. "2px 2px 4px #000000"
    # Ken Burns
    zoom_direction: str = ""    # in, out, none
    zoom_amount: float = 0.03  # default subtle zoom
    pan_direction: str = ""     # left, right, up, down
    pan_distance: float = 0.1
    # Fade
    fade_in: float = 0
    fade_out: float = 0
    # Seek (for audio continuation across split scenes)
    seek: float = 0
    loop: bool = False
    # Text animation style
    style: str = ""             # '002' = appear, '003' = word-by-word, '005' = jumping
    # Component (lower-third)
    component_type: str = ""    # e.g. "basic/050"
    component_settings: dict = field(default_factory=dict)


@dataclass
class SceneInstruction:
    """A single scene to render."""
    index: int
    comment: str = ""
    duration: float = 5.0
    background_color: str = "#0f0a1a"
    elements: list[ElementInstruction] = field(default_factory=list)
    transition_style: str = ""       # e.g., 'fade', 'dissolve', 'wipeleft'
    transition_duration: float = 1.0


def _parse_font_size(val) -> int:
    """Parse font size from various formats: 72, "72px", "72pt", "2em"."""
    if isinstance(val, (int, float)):
        return int(val)
    if isinstance(val, str):
        # Strip px/pt suffix
        m = re.match(r'([\d.]+)', val)
        if m:
            return int(float(m.group(1)))
    return 48  # default


def _get_setting(el: dict, key: str, camel_key: str = "", default=""):
    """Get a value from settings dict first, then flat keys, then camelCase."""
    settings = el.get("settings", {}) or {}
    # Try settings dict first
    val = settings.get(key)
    if val is not None:
        return val
    if camel_key:
        val = settings.get(camel_key)
        if val is not None:
            return val
    # Fall back to flat keys
    val = el.get(key)
    if val is not None:
        return val
    if camel_key:
        val = el.get(camel_key)
        if val is not None:
            return val
    return default


def _parse_element(el: dict, url_map: dict[str, str]) -> ElementInstruction:
    """Convert a J2V element dict into an ElementInstruction."""
    el_type = el.get("type", "image")

    # ── Ken Burns: parse ACTUAL fields from castTimelineEngine ──
    # castTimelineEngine sends: zoom (number 3-5 = percentage), pan ("left"/"right"/etc.)
    # NOT zoom-direction / pan-direction
    raw_zoom = el.get("zoom", el.get("zoom-direction", el.get("zoomDirection", 0)))
    if isinstance(raw_zoom, str) and raw_zoom in ("in", "out", "none", ""):
        # Old format: zoom-direction string
        zoom_direction = raw_zoom
        zoom_amount = float(el.get("zoom-amount", el.get("zoomAmount", 0.03)))
    else:
        # New format: zoom is a number (percentage)
        zoom_val = float(raw_zoom or 0)
        if zoom_val > 0:
            zoom_direction = "in"
            zoom_amount = zoom_val / 100.0  # 3 -> 0.03, 5 -> 0.05
        elif zoom_val < 0:
            zoom_direction = "out"
            zoom_amount = abs(zoom_val) / 100.0
        else:
            zoom_direction = "in"
            zoom_amount = 0.03  # default subtle zoom for images

    raw_pan = el.get("pan", el.get("pan-direction", el.get("panDirection", "")))
    pan_direction = str(raw_pan) if raw_pan else ""
    pan_distance = float(el.get("pan-distance", el.get("panDistance", 0.1)))

    # ── Text settings: read from nested settings first, then flat ──
    font_family = _get_setting(el, "font-family", "fontFamily", "Inter")
    raw_font_size = _get_setting(el, "font-size", "fontSize", 48)
    font_size = _parse_font_size(raw_font_size)
    font_color = _get_setting(el, "font-color", "fontColor",
                              _get_setting(el, "color", "", "#FFFFFF"))
    font_weight = _get_setting(el, "font-weight", "fontWeight", "bold")
    text_align = _get_setting(el, "text-align", "textAlign", "center")
    bg_color = _get_setting(el, "background-color", "backgroundColor", "")
    position = _get_setting(el, "position", "", "")
    letter_spacing = float(_get_setting(el, "letter-spacing", "letterSpacing", 0) or 0)
    text_shadow = _get_setting(el, "text-shadow", "textShadow", "")

    # ── Component parsing ──
    component_type = ""
    component_settings = {}
    if el_type == "component":
        component_type = el.get("component", el.get("component_type", "basic"))
        settings = el.get("settings", {}) or {}
        component_settings = settings
        # Extract text from component settings for fallback rendering
        headline = settings.get("headline", {})
        lead = settings.get("lead", {})
        if isinstance(headline, dict) and headline.get("text"):
            # Use headline as primary text for the component
            pass  # stored in component_settings, extracted by ffmpeg_builder

    # ── Text animation style ──
    style = el.get("style", "")

    # ── Position: also applies to video elements (PiP) ──
    # For video elements, position is used to compute x,y in ffmpeg_builder
    if not position:
        position = el.get("position", "")

    elem = ElementInstruction(
        type=el_type,
        src=el.get("src", ""),
        start=float(el.get("start", 0)),
        duration=float(el.get("duration", 0)),
        x=int(el.get("x", 0)),
        y=int(el.get("y", 0)),
        width=int(el.get("width", 1920)),
        height=int(el.get("height", 1080)),
        resize=el.get("resize", "cover"),
        volume=float(el.get("volume", 1.0)),
        # Text
        text=el.get("text", ""),
        font_family=font_family,
        font_size=font_size,
        font_color=font_color,
        font_weight=font_weight,
        text_align=text_align,
        background_color=bg_color,
        position=position,
        letter_spacing=letter_spacing,
        text_shadow=text_shadow,
        # Ken Burns
        zoom_direction=zoom_direction,
        zoom_amount=zoom_amount,
        pan_direction=pan_direction,
        pan_distance=pan_distance,
        # Fade
        fade_in=float(el.get("fade-in", el.get("fadeIn", 0))),
        fade_out=float(el.get("fade-out", el.get("fadeOut", 0))),
        # Audio
        seek=float(el.get("seek", 0)),
        loop=bool(el.get("loop", False)),
        # Style
        style=style,
        # Component
        component_type=component_type,
        component_settings=component_settings,
    )

    # Resolve URL to local path
    if elem.src and elem.src in url_map:
        elem.local_path = url_map[elem.src]
    elif elem.src and elem.src.startswith("/"):
        elem.local_path = elem.src  # already local

    return elem


def _parse_transition(scene: dict) -> tuple[str, float]:
    """Extract transition info from a scene dict."""
    trans = scene.get("transition", {})
    if not trans:
        return "", 1.0
    style = trans.get("style", "fade")
    duration = float(trans.get("duration", 1.0))
    # Map J2V transition names to FFmpeg xfade names
    style_map = {
        "fade": "fade",
        "dissolve": "dissolve",
        "wipeleft": "wipeleft",
        "wiperight": "wiperight",
        "wipeup": "wipeup",
        "wipedown": "wipedown",
        "slideleft": "slideleft",
        "slideright": "slideright",
        "slideup": "slideup",
        "slidedown": "slidedown",
        "circlecrop": "circlecrop",
        "circleopen": "circleopen",
        "circleclose": "circleclose",
        "radial": "radial",
        "smoothleft": "smoothleft",
        "smoothright": "smoothright",
        "smoothup": "smoothup",
        "smoothdown": "smoothdown",
        "pixelize": "pixelize",
        "diagtl": "diagtl",
        "diagtr": "diagtr",
        "diagbl": "diagbl",
        "diagbr": "diagbr",
        "hlslice": "hlslice",
        "hrslice": "hrslice",
        "vuslice": "vuslice",
        "vdslice": "vdslice",
    }
    return style_map.get(style, "fade"), duration


def parse_timeline(timeline: dict, url_map: dict[str, str]) -> list[SceneInstruction]:
    """
    Parse a full timeline JSON into a list of SceneInstructions.

    Args:
        timeline: castTimelineEngine output (J2V-compatible format)
        url_map: mapping of remote URL -> local file path (from asset_downloader)

    Returns:
        List of SceneInstruction objects ready for ffmpeg_builder
    """
    scenes_data = timeline.get("scenes", [])
    instructions: list[SceneInstruction] = []

    for i, scene_data in enumerate(scenes_data):
        trans_style, trans_dur = _parse_transition(scene_data)
        scene = SceneInstruction(
            index=i,
            comment=scene_data.get("comment", f"scene-{i}"),
            duration=float(scene_data.get("duration", 5)),
            background_color=scene_data.get("background-color", "#0f0a1a"),
            transition_style=trans_style if i > 0 else "",
            transition_duration=trans_dur if i > 0 else 0,
        )

        for el_data in scene_data.get("elements", []):
            elem = _parse_element(el_data, url_map)
            scene.elements.append(elem)

        instructions.append(scene)

    print(f"  [parser] Parsed {len(instructions)} scenes, "
          f"total duration {sum(s.duration for s in instructions):.1f}s")
    for s in instructions:
        imgs = sum(1 for e in s.elements if e.type == 'image')
        vids = sum(1 for e in s.elements if e.type == 'video')
        txts = sum(1 for e in s.elements if e.type == 'text')
        comps = sum(1 for e in s.elements if e.type == 'component')
        kb = [e for e in s.elements if e.type == 'image' and e.zoom_direction]
        print(f"    Scene {s.index} ({s.comment[:40]}): {s.duration:.1f}s, "
              f"{imgs}img {vids}vid {txts}txt {comps}comp"
              f"{f', KB={kb[0].zoom_direction}/{kb[0].zoom_amount:.3f}' if kb else ''}"
              f"{f', trans={s.transition_style}' if s.transition_style else ''}")

    return instructions
