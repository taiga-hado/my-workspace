# HADO資料デザインスキル（hado-deck）

Claude Code に「HADOの資料を作って」と頼むと、会社標準デザイン（紺／青／橙・HTML→PDF）でスライドを作ってくれるスキルです。
自分のMacに一度入れれば、どのフォルダで作業していても使えます。

## 入れ方（1回だけ・1分）

Claude Code を開いて、次の文をそのまま貼ってください。

```
次のコマンドを実行して、HADO資料デザインのスキルを入れて。終わったら結果を教えて。
curl -fsSL https://raw.githubusercontent.com/taiga-hado/my-workspace/main/hado-deck-skill/install.sh | bash
```

ターミナルが使える人は、そのコマンドだけを実行しても同じです。
入れたあと、Claude Code を開き直してください。

必要なもの（無ければ Claude が案内します）：Google Chrome、python3。

## 使い方

Claude Code で、作業したいフォルダを開いて頼むだけです。

```
HADOの資料デザインで、◯◯向けの提案資料を作って。内容は…
```

```
/hado-deck 10月の締め会スライド。話す内容は…
```

Claude が「構成案 → HTMLで制作 → PDF化 → 全ページを自分で目視して修正」まで行い、`<資料名>-deck/<資料名>.pdf` を出します。
直したいときは「◯枚目の見出しを△△にして」のように枚数と内容を伝えてください。

## 中身

| ファイル | 役割 |
|---|---|
| `SKILL.md` | Claude への指示書（デザインルール・手順・崩れやすい箇所の対処） |
| `template.html` | CSS一式と見本スライド6枚 |
| `build.sh` | HTML → PDF → プレビュー画像 |
| `assets/` | HADOロゴ（黒・白） |
| `examples/` | 完成した資料のHTML（構成の参考。画像は同梱していません） |
| `install.sh` | 上記を `~/.claude/skills/hado-deck/` に配置し、必要ツールを確認 |

## ルールを変えたいとき

`SKILL.md` が正本です。ここを直して main に push すると、各自が `install.sh` を再実行した時点で反映されます。
