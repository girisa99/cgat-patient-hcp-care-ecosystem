"""
Timeline Parser — converts castTimelineEngine JSON into per-scene render instructions.

Input: JSON2Video-compatible timeline format (as produced by castTimelineEngine.ts)
Output: list of SceneInstruction dicts ready for ffmpeg_builder.py
"""

from dataclasses import dataclass, field


@dataclass
class ElementInstruction:
    """A single element within a scene (image, video, text, audio)."""
    type: str                   # 'image', 'video', 'text', 'audio'
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
    font_family: str = "DejaVu Sans"
    font_size: int = 48
    font_color: str = "#FFFFFF"
    text_align: str = "center"
    background_color: str = ""  # text box background
    # Ken Burns
    zoom_direction: str = ""    # in, out, none
    zoom_amount: float = 0.03  # default subtle zoom
    pan_direction: str = ""     # left, right, up, down
    # Fade
    fade_in: float = 0
    fade_out: float = 0
    # Seek (for audio continuation across split scenes)
    seek: float = 0
    loop: bool = False


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


def _parse_element(el: dict, url_map: dict[str, str]) -> ElementInstruction:
    """Convert a J2V element dict into an ElementInstruction."""
    elem = ElementInstruction(
        type=el.get("type", "image"),
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
        font_family=el.get("font-family", el.get("fontFamily", "DejaVu Sans")),
        font_size=int(el.get("font-size", el.get("fontSize", 48))),
        font_color=el.get("font-color", el.get("fontColor", el.get("color", "#FFFFFF"))),
        text_align=el.get("text-align", el.get("textAlign", "center")),
        background_color=el.get("background-color", el.get("backgroundColor", "")),
        # Ken Burns
        zoom_direction=el.get("zoom-direction", el.get("zoomDirection", "")),
        zoom_amount=float(el.get("zoom-amount", el.get("zoomAmount", 0.03))),
        pan_direction=el.get("pan-direction", el.get("panDirection", "")),
        # Fade
        fade_in=float(el.get("fade-in", el.get("fadeIn", 0))),
        fade_out=float(el.get("fade-out", el.get("fadeOut", 0))),
        # Audio
        seek=float(el.get("seek", 0)),
        loop=bool(el.get("loop", False)),
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

    return instructions
