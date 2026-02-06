#!/bin/bash
# ============================================
# build-js.sh — Combinar e minificar JS
# Corre este script sempre que alterares um JS original
# ============================================

DIST_DIR="./src/js/dist"
mkdir -p "$DIST_DIR"

# Ficheiros JS na ordem correta de execução
# IMPORTANTE: scroll-to-top.js e scroll-button-shader.js ANTES de main.js
# porque main.js usa a classe ScrollToTopButton
JS_FILES=(
  "./src/js/liquid-shader.js"
  "./src/js/new/scroll-to-top.js"
  "./src/js/new/scroll-button-shader.js"
  "./src/js/new/faq.js"
  "./src/js/new/reservar.js"
  "./src/js/new/main.js"
)

echo "🔨 A combinar ${#JS_FILES[@]} ficheiros JS..."

# Combinar com separadores IIFE para evitar conflitos de scope
COMBINED="$DIST_DIR/scripts.combined.js"
> "$COMBINED"

for file in "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "// === $(basename $file) ===" >> "$COMBINED"
    echo ";(function(){" >> "$COMBINED"
    cat "$file" >> "$COMBINED"
    echo "" >> "$COMBINED"
    echo "})();" >> "$COMBINED"
    echo "" >> "$COMBINED"
  else
    echo "⚠️  Ficheiro não encontrado: $file"
  fi
done

echo "📦 Ficheiro combinado: $(wc -c < "$COMBINED") bytes"

# Minificar
if command -v terser &> /dev/null; then
  terser "$COMBINED" -o "$DIST_DIR/scripts.min.js" --compress --mangle
  echo "✅ Minificado com terser: $(wc -c < "$DIST_DIR/scripts.min.js") bytes"
elif command -v uglifyjs &> /dev/null; then
  uglifyjs "$COMBINED" -o "$DIST_DIR/scripts.min.js" -c -m
  echo "✅ Minificado com uglifyjs: $(wc -c < "$DIST_DIR/scripts.min.js") bytes"
else
  echo "⚠️  terser/uglifyjs não encontrado. A copiar sem minificar..."
  cp "$COMBINED" "$DIST_DIR/scripts.min.js"
fi

# Mostrar resultado
ORIGINAL_SIZE=0
for file in "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    ORIGINAL_SIZE=$((ORIGINAL_SIZE + $(wc -c < "$file")))
  fi
done
MIN_SIZE=$(wc -c < "$DIST_DIR/scripts.min.js")
SAVING=$((ORIGINAL_SIZE - MIN_SIZE))
if [ $ORIGINAL_SIZE -gt 0 ]; then
  PERCENT=$((SAVING * 100 / ORIGINAL_SIZE))
else
  PERCENT=0
fi

rm -f "$COMBINED"

echo ""
echo "=========================================="
echo "  JS Build Report"
echo "=========================================="
echo "  Ficheiros originais: ${#JS_FILES[@]}"
echo "  Tamanho original:    ${ORIGINAL_SIZE} bytes"
echo "  Tamanho minificado:  ${MIN_SIZE} bytes"
echo "  Redução:             ${SAVING} bytes (-${PERCENT}%)"
echo "  HTTP requests:       6 → 1"
echo "=========================================="
echo ""
echo "✅ JS build completo"
