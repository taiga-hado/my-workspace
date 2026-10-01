# 求職者送客の窓口 ご紹介資料（商談につなげる用・料金表なし）

サイトの資料ダウンロード導線（トップ `#contact` → `/thanks/`）とGASの自動返信メールで配る資料のソース。
HADO資料デザインシステム（`~/.claude/skills/hado-deck/`）で作成。

| ファイル | 内容 |
|---|---|
| `chuto.html` | 第二新卒・未経験領域 ご紹介資料（11枚） |
| `shinsotsu.html` | 新卒領域（27卒〜28卒） ご紹介資料（11枚） |
| `common.css` | 共通スタイル（テンプレのCSS＋棒グラフ・ペルソナ・事例カード等の追加部品） |
| `img/` | 導入事例の画像（`soukyaku-madoguchi/images/case-*.png` のコピー） |
| `assets/` | HADOロゴ |

## ビルド

```bash
./build.sh chuto        # chuto.pdf と preview/chuto/slide_NN.png
./build.sh shinsotsu
```

Chrome headless + PyMuPDF。`python3 -c "import fitz"` が通る python3 で実行する。

## サイトへの反映

```bash
# PDF
cp chuto.pdf     ../soukyaku-madoguchi/dl/madoguchi-chuto.pdf
cp shinsotsu.pdf ../soukyaku-madoguchi/dl/madoguchi-shinsotsu.pdf
# スライド画像（資料ページのビューア用・1920x1080 webp）
python3 - <<'PY'
import fitz, io, os
from PIL import Image
for n in ['chuto','shinsotsu']:
    d=f'../soukyaku-madoguchi/images/doc/{n}'; os.makedirs(d, exist_ok=True)
    for i,p in enumerate(fitz.open(f'{n}.pdf'),1):
        Image.open(io.BytesIO(p.get_pixmap(dpi=144).tobytes('png'))).convert('RGB').save(f'{d}/s{i:02d}.webp','WEBP',quality=82)
PY
```

枚数を変えたら `soukyaku-madoguchi/thanks/index.html` と `document/index.html` の `DOCS[].pages` も直す（thanks を直したら document へ cp）。

## 方針
- 商談（15分のオンライン面談）につなげるための資料。**料金表・セグメント単価・今後の流れ・注意事項は載せない**（面談で案内）。営業資料の正本は `soukyaku/salesdocuments/`。
- 数字は既存の営業資料（2026-09-30版）の実データ。更新したらこちらも合わせる。
