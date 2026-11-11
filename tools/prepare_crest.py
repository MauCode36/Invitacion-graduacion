"""Prepara una aproximación dorada desde el escudo institucional oficial.

No sustituye una digitalización del grabado de la invitación física.
Requiere Pillow. Ejecutar desde la raíz: python tools/prepare_crest.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
source = Image.open(ROOT / "assets/logo-universidad-original.png").convert("RGB")
width, height = source.size
crest = source.crop((round(width * .016), 0, round(width * .258), height))
result = Image.new("RGBA", crest.size)
for y in range(crest.height):
    for x in range(crest.width):
        r, g, b = crest.getpixel((x, y))
        light_background = min(r, g, b) > 220
        yellow_background = r > 210 and g > 185 and b < 205
        luminance = .2126 * r + .7152 * g + .0722 * b
        alpha = 0 if light_background or yellow_background else min(255, int((255 - luminance) * 2.4))
        shade = max(0, min(1, luminance / 220))
        result.putpixel((x, y), (int(179 + 67 * shade), int(119 + 74 * shade), int(20 + 48 * shade), alpha))
result.save(ROOT / "assets/escudo-dorado.png")
