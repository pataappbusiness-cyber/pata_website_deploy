#!/usr/bin/env python3
"""
Convert PNG and JPG images to WebP format for better web performance.
Maintains original files as backup.
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow library not found.")
    print("Install it with: pip install Pillow")
    exit(1)

def convert_to_webp(image_path, quality=80):
    """Convert an image to WebP format."""
    try:
        img = Image.open(image_path)

        # Convert RGBA to RGB if necessary (WebP handles both, but better compression for RGB)
        if img.mode == 'RGBA':
            # Create white background for transparency
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Generate WebP filename
        webp_path = image_path.with_suffix('.webp')

        # Save as WebP
        img.save(webp_path, 'WEBP', quality=quality, method=6)

        original_size = image_path.stat().st_size
        webp_size = webp_path.stat().st_size
        savings = ((original_size - webp_size) / original_size) * 100

        print(f"[OK] {image_path.name}")
        print(f"  {original_size:,} bytes -> {webp_size:,} bytes ({savings:.1f}% reduction)")

        return True
    except Exception as e:
        print(f"[ERROR] {image_path.name}: {e}")
        return False

def main():
    base_dir = Path(__file__).parent
    img_dir = base_dir / "src" / "img"

    # Target directories
    target_dirs = [
        img_dir / "new_images",
        img_dir / "images"
    ]

    print("=" * 60)
    print("PATA.CARE - Image Conversion to WebP")
    print("=" * 60)
    print()

    total_original = 0
    total_webp = 0
    converted_count = 0

    for target_dir in target_dirs:
        if not target_dir.exists():
            continue

        print(f"\nProcessing: {target_dir.relative_to(base_dir)}")
        print("-" * 60)

        # Find all PNG and JPG files
        image_files = []
        image_files.extend(target_dir.glob("*.png"))
        image_files.extend(target_dir.glob("*.jpg"))
        image_files.extend(target_dir.glob("*.jpeg"))

        # Filter out files that already have WebP versions
        for img_path in image_files:
            webp_path = img_path.with_suffix('.webp')

            # Skip if WebP already exists and is newer
            if webp_path.exists():
                if webp_path.stat().st_mtime > img_path.stat().st_mtime:
                    print(f"[SKIP] {img_path.name} (WebP already exists)")
                    continue

            # Convert
            if convert_to_webp(img_path, quality=80):
                converted_count += 1
                total_original += img_path.stat().st_size
                total_webp += webp_path.stat().st_size

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Images converted: {converted_count}")
    if converted_count > 0:
        total_savings = ((total_original - total_webp) / total_original) * 100
        print(f"Total original size: {total_original:,} bytes ({total_original/1024/1024:.2f} MB)")
        print(f"Total WebP size: {total_webp:,} bytes ({total_webp/1024/1024:.2f} MB)")
        print(f"Total savings: {total_original - total_webp:,} bytes ({total_savings:.1f}%)")
    print()
    print("Next steps:")
    print("1. Update HTML to use <picture> elements with WebP + PNG fallback")
    print("2. Add width/height attributes to all images")
    print("3. Add loading='lazy' to images below the fold")
    print("=" * 60)

if __name__ == "__main__":
    main()
