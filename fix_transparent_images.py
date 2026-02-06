#!/usr/bin/env python3
"""
Re-convert specific images to WebP while PRESERVING transparency.
"""

from pathlib import Path
from PIL import Image

def convert_to_webp_with_transparency(image_path, quality=80):
    """Convert an image to WebP format while preserving transparency."""
    try:
        img = Image.open(image_path)

        # Generate WebP filename
        webp_path = image_path.with_suffix('.webp')

        # Save as WebP, preserving the original mode (RGBA if present)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Preserve transparency
            img.save(webp_path, 'WEBP', quality=quality, method=6, lossless=False)
        else:
            # No transparency to preserve
            img.save(webp_path, 'WEBP', quality=quality, method=6)

        original_size = image_path.stat().st_size
        webp_size = webp_path.stat().st_size
        savings = ((original_size - webp_size) / original_size) * 100

        print(f"[OK] {image_path.name}")
        print(f"  Mode: {img.mode}")
        print(f"  {original_size:,} bytes -> {webp_size:,} bytes ({savings:.1f}% reduction)")

        return True
    except Exception as e:
        print(f"[ERROR] {image_path.name}: {e}")
        return False

def main():
    base_dir = Path(__file__).parent
    img_dir = base_dir / "src" / "img"

    # Images that need transparent backgrounds preserved
    images_to_fix = [
        img_dir / "images" / "PATA_APP.png",
        img_dir / "new_images" / "clinica_pata.png",
        img_dir / "new_images" / "receita_digital.png",
        img_dir / "new_images" / "loja_pata.png",
    ]

    print("=" * 60)
    print("Fixing Transparent Images - Re-converting to WebP")
    print("=" * 60)
    print()

    for img_path in images_to_fix:
        if not img_path.exists():
            print(f"[SKIP] {img_path.name} - File not found")
            continue

        convert_to_webp_with_transparency(img_path, quality=85)
        print()

    print("=" * 60)
    print("DONE - Transparent WebP images created")
    print("=" * 60)
    print()
    print("These images now have transparent backgrounds:")
    for img_path in images_to_fix:
        webp_path = img_path.with_suffix('.webp')
        if webp_path.exists():
            print(f"  - {webp_path.relative_to(base_dir)}")

if __name__ == "__main__":
    main()
