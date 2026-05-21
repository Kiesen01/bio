from pathlib import Path

from PIL import Image


LOGOS = [
    Path("assets/vk.png"),
    Path("assets/kaspersky.png"),
    Path("assets/avito.png"),
    Path("assets/tbank.png"),
]


def remove_white_background_and_crop(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]

            if alpha == 0:
                continue

            # Treat white source backgrounds and their antialiased edges as transparency.
            whiteness = min(red, green, blue)
            if whiteness > 232:
                new_alpha = int(alpha * max(0, (255 - whiteness) / 23))
                pixels[x, y] = (red, green, blue, new_alpha)
                continue

            # Keep brand colors, but turn near-black wordmark pixels into a light variant.
            if red < 42 and green < 42 and blue < 42:
                pixels[x, y] = (245, 245, 240, alpha)

    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)

    image.save(path)


for logo_path in LOGOS:
    remove_white_background_and_crop(logo_path)
