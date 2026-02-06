#!/usr/bin/env python3
"""
Remove background from mockup image and save as WebP
"""
import sys
from pathlib import Path

def remove_background_rembg(input_path, output_path):
    """Use rembg library for automatic background removal"""
    try:
        from rembg import remove
        from PIL import Image

        print("Using rembg for background removal...")
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path, 'WEBP', quality=90)
        print(f"[OK] Background removed successfully using rembg: {output_path}")
        return True
    except ImportError:
        print("rembg not installed. Install with: pip install rembg")
        return False
    except Exception as e:
        print(f"Error with rembg: {e}")
        return False

def remove_background_manual(input_path, output_path):
    """Manual background removal by detecting and removing similar colors"""
    try:
        from PIL import Image
        import numpy as np

        print("Using manual color-based background removal...")
        img = Image.open(input_path).convert('RGBA')
        data = np.array(img)

        # Get the color from corners (assuming background)
        h, w = data.shape[:2]
        corner_colors = [
            data[0, 0],      # top-left
            data[0, w-1],    # top-right
            data[h-1, 0],    # bottom-left
            data[h-1, w-1]   # bottom-right
        ]

        # Use the most common corner color as background
        bg_color = corner_colors[0][:3]
        print(f"Detected background color: RGB{tuple(bg_color)}")

        # Create mask for pixels similar to background color
        rgb = data[:, :, :3]
        diff = np.abs(rgb.astype(int) - bg_color.astype(int))

        # Pixels are background if all RGB values are within threshold
        threshold = 40  # Adjust this value for more/less aggressive removal
        mask = np.all(diff < threshold, axis=2)

        # Set alpha to 0 for background pixels
        data[:, :, 3] = np.where(mask, 0, data[:, :, 3])

        # Create image from modified array
        result = Image.fromarray(data, 'RGBA')
        result.save(output_path, 'WEBP', quality=90)
        print(f"[OK] Background removed successfully: {output_path}")
        return True
    except ImportError as e:
        print(f"Missing required library: {e}")
        print("Install with: pip install pillow numpy")
        return False
    except Exception as e:
        print(f"Error during manual removal: {e}")
        return False

def main():
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        input_file = "src/img/new_images/mockup.png"

    input_path = Path(input_file)

    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    # Create output filename
    output_path = input_path.with_name(f"{input_path.stem}_no_bg.webp")

    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    print()

    # Try rembg first, fall back to manual method
    if not remove_background_rembg(input_path, output_path):
        print("\nTrying manual method...")
        if not remove_background_manual(input_path, output_path):
            print("\n[ERROR] Failed to remove background")
            sys.exit(1)

    print(f"\n[OK] Done! Transparent image saved to: {output_path}")

if __name__ == "__main__":
    main()
