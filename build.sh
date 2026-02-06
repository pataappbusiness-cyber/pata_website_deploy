#!/bin/bash
# ============================================
# build.sh — Unified Build Script for PATA
# Combines CSS and JS, generates production files
# ============================================

echo "=========================================="
echo "  PATA Website Build Script"
echo "=========================================="
echo ""

# Run CSS build
if [ -f "./build-css.sh" ]; then
  echo "🎨 Building CSS..."
  bash ./build-css.sh
  echo ""
else
  echo "❌ build-css.sh not found"
fi

# Run JS build
if [ -f "./build-js.sh" ]; then
  echo "📜 Building JavaScript..."
  bash ./build-js.sh
  echo ""
else
  echo "❌ build-js.sh not found"
fi

echo "=========================================="
echo "  ✅ Build Complete!"
echo "=========================================="
echo ""
echo "Generated files:"
echo "  - ./src/css/dist/styles.min.css"
echo "  - ./src/js/dist/scripts.min.js"
echo ""
echo "Next steps:"
echo "  1. Test the website locally"
echo "  2. Check browser console for errors"
echo "  3. Run performance audit"
echo "  4. Commit changes: git add . && git commit"
echo ""
