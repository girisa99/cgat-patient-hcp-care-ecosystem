"""
Parallel asset downloader — fetches images/videos/audio from Supabase Storage URLs.
"""

import os
import hashlib
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

DOWNLOAD_DIR = "/tmp/cast_assets"


def _ensure_dir():
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def _url_to_path(url: str, ext: str = "") -> str:
    """Deterministic local path for a URL (hash-based to avoid collisions)."""
    h = hashlib.md5(url.encode()).hexdigest()[:12]
    if not ext:
        # Infer extension from URL
        path_part = url.split("?")[0]
        ext = os.path.splitext(path_part)[1] or ".bin"
    return os.path.join(DOWNLOAD_DIR, f"{h}{ext}")


def download_one(url: str, ext: str = "") -> str:
    """Download a single URL to a local file. Returns local path."""
    local_path = _url_to_path(url, ext)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
        return local_path  # already downloaded (idempotent)

    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    with open(local_path, "wb") as f:
        f.write(resp.content)
    return local_path


def download_all(urls: list[str]) -> dict[str, str]:
    """
    Download all URLs in parallel.
    Returns dict mapping original URL -> local file path.
    """
    _ensure_dir()
    if not urls:
        return {}

    url_map: dict[str, str] = {}
    unique_urls = list(set(urls))

    max_workers = min(8, len(unique_urls))
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        future_to_url = {pool.submit(download_one, u): u for u in unique_urls}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                local_path = future.result()
                url_map[url] = local_path
                print(f"  [download] {os.path.basename(local_path)} <- {url[:80]}...")
            except Exception as e:
                print(f"  [download] FAILED {url[:80]}: {e}")
                # Don't fail the whole job — scene will render without this asset

    return url_map


def collect_asset_urls(timeline: dict) -> list[str]:
    """Extract all remote URLs from a timeline JSON that need downloading."""
    urls = []
    for scene in timeline.get("scenes", []):
        for el in scene.get("elements", []):
            src = el.get("src", "")
            if src and src.startswith("http"):
                urls.append(src)
    return urls
