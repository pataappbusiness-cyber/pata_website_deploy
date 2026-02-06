#!/usr/bin/env python3
"""
Get dimensions of all images used in the website.
"""

import os
from pathlib import Path
from PIL import Image

def get_image_dimensions(base_dir):
    """Get dimensions of all images."""
    img_dir = base_dir / "src" / "img"

    dimensions = {}

    # Process all image files
    for img_path in img_dir.rglob("*"):
        if img_path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp']:
            try:
                with Image.open(img_path) as img:
                    rel_path = img_path.relative_to(base_dir)
                    dimensions[str(rel_path)] = {'width': img.width, 'height': img.height}
            except Exception as e:
                pass

    return dimensions

def main():
    base_dir = Path(__file__).parent

    print("Getting image dimensions...")
    dimensions = get_image_dimensions(base_dir)

    # Key images we need dimensions for (from HTML analysis)
    key_images = [
        'src/img/images/PATA_APP.png',
        'src/img/new_images/cao.png',
        'src/img/new_images/mockup.png',
        'src/img/new_images/border_collie.png',
        'src/img/new_images/rafeiro_alentejano.png',
        'src/img/new_images/gato_persa.png',
        'src/img/new_images/clinica_pata.png',
        'src/img/new_images/receita_digital.png',
        'src/img/new_images/loja_pata.png',
        'src/img/new_images/primeiros_500_1.png',
    ]

    print("\n" + "="*60)
    print("KEY IMAGE DIMENSIONS")
    print("="*60)
    for img in key_images:
        if img in dimensions:
            d = dimensions[img]
            print(f"{img}")
            print(f"  {d['width']}x{d['height']}")

    # Output all for reference
    print("\n" + "="*60)
    print("ALL IMAGES (for reference)")
    print("="*60)
    for img_path in sorted(dimensions.keys()):
        if 'new_images' in img_path or 'images/' in img_path:
            d = dimensions[img_path]
            print(f"{img_path}: {d['width']}x{d['height']}")

if __name__ == "__main__":
    main()
