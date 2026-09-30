#!/bin/bash
# HADO資料デザインスキル（hado-deck）を自分のMacのClaude Codeに入れる。
# 使い方（ターミナル or Claude Code に貼るだけ）:
#   curl -fsSL https://raw.githubusercontent.com/taiga-hado/my-workspace/main/hado-deck-skill/install.sh | bash
set -e
REPO_RAW="https://raw.githubusercontent.com/taiga-hado/my-workspace/main/hado-deck-skill"
DEST="$HOME/.claude/skills/hado-deck"

echo "▶ hado-deck スキルを $DEST に入れます"
mkdir -p "$DEST/assets" "$DEST/examples"
for f in SKILL.md template.html build.sh; do
  curl -fsSL "$REPO_RAW/$f" -o "$DEST/$f"
done
for f in logo_black.png logo_white.png; do
  curl -fsSL "$REPO_RAW/assets/$f" -o "$DEST/assets/$f"
done
for f in tldv-session-deck.html internal-meeting-deck.html; do
  curl -fsSL "$REPO_RAW/examples/$f" -o "$DEST/examples/$f"
done
chmod +x "$DEST/build.sh"
echo "✔ スキル本体を配置しました"

# PDF化に必要なもの
if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  echo "✔ Google Chrome あり"
else
  echo "✖ Google Chrome が見つかりません。https://www.google.com/chrome/ からインストールしてください（PDF化に使います）"
fi
if python3 -c "import fitz" 2>/dev/null; then
  echo "✔ PyMuPDF あり"
else
  echo "▶ PyMuPDF を入れます（プレビュー画像の生成に使います）"
  pip3 install --user pymupdf >/dev/null 2>&1 || python3 -m pip install --user pymupdf >/dev/null 2>&1 || echo "✖ pip での導入に失敗。Claude に「pymupdf を入れて」と頼んでください"
  python3 -c "import fitz" 2>/dev/null && echo "✔ PyMuPDF を入れました"
fi

echo ""
echo "完了。Claude Code を開いて（起動中なら一度終了して開き直し）、次のように頼めば使えます："
echo "  「HADOの資料デザインで、◯◯の提案資料を作って」"
echo "  「/hado-deck ◯◯の締め会スライド」"
