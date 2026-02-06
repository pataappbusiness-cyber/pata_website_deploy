#!/bin/bash
# ============================================
# build-css.sh — Combinar e minificar CSS
# Corre este script sempre que alterares um CSS original
# ============================================

SRC_DIR="./src/css/new"
DIST_DIR="./src/css/dist"

# Criar pasta dist se não existe
mkdir -p "$DIST_DIR"

# Ordem de concatenação (importa para cascading)
CSS_FILES=(
  "$SRC_DIR/global.css"
  "$SRC_DIR/sections.css"
  "$SRC_DIR/animated-gradient.css"
  "$SRC_DIR/problem1.css"
  "$SRC_DIR/problem2.css"
  "$SRC_DIR/problem3.css"
  "$SRC_DIR/problem4.css"
  "$SRC_DIR/problem5.css"
  "$SRC_DIR/solution1.css"
  "$SRC_DIR/solution2.css"
  "$SRC_DIR/solution3.css"
  "$SRC_DIR/solution4.css"
  "$SRC_DIR/joinus1.css"
  "$SRC_DIR/joinus2.css"
  "$SRC_DIR/joinus3.css"
  "$SRC_DIR/faq.css"
  "$SRC_DIR/reservar.css"
  "$SRC_DIR/footer.css"
  "$SRC_DIR/scroll-to-top.css"
)

echo "🔨 A combinar ${#CSS_FILES[@]} ficheiros CSS..."

# Combinar todos num ficheiro temporário
COMBINED="$DIST_DIR/styles.combined.css"
> "$COMBINED"

for file in "${CSS_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "/* === $(basename $file) === */" >> "$COMBINED"
    cat "$file" >> "$COMBINED"
    echo "" >> "$COMBINED"
  else
    echo "⚠️  Ficheiro não encontrado: $file"
  fi
done

echo "📦 Ficheiro combinado: $(wc -c < "$COMBINED") bytes"

# Minificar
# Opção 1: Se tiver csso instalado (npm install -g csso-cli)
if command -v csso &> /dev/null; then
  csso "$COMBINED" -o "$DIST_DIR/styles.min.css"
  echo "✅ Minificado com csso: $(wc -c < "$DIST_DIR/styles.min.css") bytes"

# Opção 2: Se tiver clean-css instalado (npm install -g clean-css-cli)
elif command -v cleancss &> /dev/null; then
  cleancss -o "$DIST_DIR/styles.min.css" "$COMBINED"
  echo "✅ Minificado com clean-css: $(wc -c < "$DIST_DIR/styles.min.css") bytes"

# Opção 3: Minificação básica com sed (fallback sem dependências)
else
  echo "⚠️  csso/clean-css não encontrado. A usar minificação básica..."
  cat "$COMBINED" | \
    sed 's/\/\*.*?\*\///g' | \
    sed '/^[[:space:]]*\/\*/,/\*\//d' | \
    tr -d '\n' | \
    sed 's/  */ /g' | \
    sed 's/ *{ */{/g' | \
    sed 's/ *} */}/g' | \
    sed 's/ *: */:/g' | \
    sed 's/ *; */;/g' | \
    sed 's/;}/}/g' \
    > "$DIST_DIR/styles.min.css"
  echo "✅ Minificação básica: $(wc -c < "$DIST_DIR/styles.min.css") bytes"
fi

# Limpar ficheiro temporário combinado
rm -f "$COMBINED"

# Mostrar resultado
ORIGINAL_SIZE=0
for file in "${CSS_FILES[@]}"; do
  if [ -f "$file" ]; then
    ORIGINAL_SIZE=$((ORIGINAL_SIZE + $(wc -c < "$file")))
  fi
done
MIN_SIZE=$(wc -c < "$DIST_DIR/styles.min.css")
SAVING=$((ORIGINAL_SIZE - MIN_SIZE))
PERCENT=$((SAVING * 100 / ORIGINAL_SIZE))

echo ""
echo "=========================================="
echo "  CSS Build Report"
echo "=========================================="
echo "  Ficheiros originais: ${#CSS_FILES[@]}"
echo "  Tamanho original:    ${ORIGINAL_SIZE} bytes"
echo "  Tamanho minificado:  ${MIN_SIZE} bytes"
echo "  Redução:             ${SAVING} bytes (-${PERCENT}%)"
echo "  HTTP requests:       18 → 1"
echo "=========================================="
