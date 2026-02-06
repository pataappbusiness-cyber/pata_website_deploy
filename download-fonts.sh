#!/bin/bash
# ============================================
# download-fonts.sh — Download Mona Sans fonts
# Mona Sans is an open-source font from GitHub
# ============================================

FONTS_DIR="./src/fonts"
mkdir -p "$FONTS_DIR"

echo "=========================================="
echo "  Downloading Mona Sans Variable Font"
echo "=========================================="
echo ""

# Mona Sans is available from GitHub
FONT_URL="https://github.com/github/mona-sans/raw/main/fonts/variable/Mona-Sans.woff2"

echo "Downloading Mona Sans Variable Font..."
curl -L "$FONT_URL" -o "$FONTS_DIR/Mona-Sans.woff2"

if [ -f "$FONTS_DIR/Mona-Sans.woff2" ]; then
  SIZE=$(wc -c < "$FONTS_DIR/Mona-Sans.woff2")
  echo "✅ Downloaded: Mona-Sans.woff2 (${SIZE} bytes)"
  echo ""
  echo "=========================================="
  echo "  Font Download Complete!"
  echo "=========================================="
  echo ""
  echo "Next steps:"
  echo "1. The @font-face declarations are already in the HTML"
  echo "2. The Google Fonts link will be removed"
  echo "3. Preload for the font will be added"
  echo ""
else
  echo "❌ Failed to download font"
  echo ""
  echo "Manual download instructions:"
  echo "1. Visit: https://github.com/github/mona-sans"
  echo "2. Download the variable font: fonts/variable/Mona-Sans.woff2"
  echo "3. Save it to: ./src/fonts/Mona-Sans.woff2"
  echo ""
fi
