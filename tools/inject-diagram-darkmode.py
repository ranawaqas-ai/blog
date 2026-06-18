#!/usr/bin/env python3
"""Make D2-compiled SVGs adapt to dark mode when embedded via <img>.

D2 `--theme 0` bakes a white background (.fill-N7) and near-black text/strokes
(.fill-N1 / .stroke-N1) into the SVG. Because the diagrams are embedded with
<img src>, the page's dark-mode CSS cannot reach inside them, so they stay a
bright white box on a dark page.

An SVG's own internal <style> IS honoured when the SVG is loaded as an image,
including @media (prefers-color-scheme: dark). So we append a style block that:
  - drops the baked-in background (transparent => blends in both light and dark)
  - in dark mode, flips text/strokes to light and the near-white box fills to
    dark surfaces, and lightens the blue accents for contrast.

Note: this follows the OS colour scheme (what Chirpy's default tracks), not
Chirpy's manual in-page toggle, which an <img>-embedded SVG cannot observe.

Idempotent: re-running on an already-processed file is a no-op. CI regenerates
the SVGs from .d2 on every build, so this runs fresh each time there.

Usage: python3 tools/inject-diagram-darkmode.py path/to/diagram.svg [more.svg ...]
"""
import sys

MARKER = "d2-darkmode-adapt"

STYLE = (
    '<style id="' + MARKER + '">'
    ".d2-svg>rect:first-of-type{fill:transparent}"
    "@media (prefers-color-scheme:dark){"
    ".fill-N1{fill:#e9e3d6}.fill-N2{fill:#aeb2be}.fill-N4{fill:#3a3a3a}"
    ".fill-N5{fill:#2c2c2c}.fill-N6{fill:#242424}"
    ".fill-B3{fill:#2a3550}.fill-B4{fill:#2a3550}"
    ".fill-B5{fill:#222a3a}.fill-B6{fill:#222a3a}"
    ".fill-AA4{fill:#2a3550}.fill-AA5{fill:#222a3a}"
    ".fill-AB4{fill:#2a3550}.fill-AB5{fill:#222a3a}"
    ".fill-B1{fill:#8aa2ff}.fill-B2{fill:#8aa2ff}"
    ".stroke-N1{stroke:#e9e3d6}.stroke-N2{stroke:#aeb2be}"
    ".stroke-B1{stroke:#6f8dff}.stroke-B2{stroke:#6f8dff}"
    "}"
    "</style>"
)


def inject(path):
    with open(path, encoding="utf-8") as fh:
        s = fh.read()
    if MARKER in s:
        return False
    i = s.rfind("</svg>")
    if i == -1:
        return False
    s = s[:i] + STYLE + s[i:]
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(s)
    return True


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(("injected " if inject(p) else "skipped  ") + p)
