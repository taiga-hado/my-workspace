#!/bin/zsh
# <name>.html -> <name>.pdf (Chrome headless) -> preview/<name>/slide_NN.png
# 使い方: ./build.sh chuto   /  ./build.sh shinsotsu
set -e
cd "$(dirname "$0")"
N="${1:-chuto}"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/$N.pdf" "file://$PWD/$N.html" 2>/dev/null
python3 - "$N" <<'PY'
import fitz, os, sys
n=sys.argv[1]; os.makedirs(f'preview/{n}', exist_ok=True)
doc = fitz.open(f'{n}.pdf'); print('pages', len(doc))
for i, p in enumerate(doc, 1): p.get_pixmap(dpi=96).save(f'preview/{n}/slide_{i:02d}.png')
PY
