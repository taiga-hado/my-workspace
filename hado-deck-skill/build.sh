#!/bin/zsh
# deck.html -> <名前>.pdf (Chrome headless) -> preview/slide_NN.png (PyMuPDF)
# 使い方: ./build.sh [deck.html] [出力名.pdf]
set -e
cd "$(dirname "$0")"
SRC="${1:-deck.html}"; OUT="${2:-deck.pdf}"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/$OUT" "file://$PWD/$SRC" 2>/dev/null
python3 - "$OUT" <<'PY'
import fitz, os, sys
os.makedirs('preview', exist_ok=True)
doc = fitz.open(sys.argv[1]); print('pages', len(doc))
for i, p in enumerate(doc, 1): p.get_pixmap(dpi=96).save(f'preview/slide_{i:02d}.png')
PY
