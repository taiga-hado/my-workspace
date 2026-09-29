# license-tool（人材紹介 免許申請書類 無料作成ツール）

有料職業紹介事業の許可申請書類を、ブラウザ内だけで作成する静的サイト。要件定義は `docs/license-tool-spec.md`。

## 構成

| パス | 内容 |
|---|---|
| `index.html` | LP |
| `check.html` + `js/check.js` | 要件診断（財産要件・事務所・責任者講習・欠格事由） |
| `form.html` + `js/form.js` | 書類入力ウィザード（6ステップ、localStorage に自動保存） |
| `done.html` + `js/done.js` | メール登録 → ダウンロード → 添付書類チェックリスト → 許可までのTODO → 「許可が出た」 |
| `js/docgen.js` | 公式Word様式への差し込みエンジン（ブラウザ／Node 両対応） |
| `js/app.js` | 共通の状態管理・リード送信・スコア |
| `templates/*.docx` | 差し込み元のWord（下記） |
| `apps-script/lead-handler.gs` | リード受信・Day0〜Day14 のナーチャリングメール・Slack通知（GAS） |
| `tools/` | 検証用スクリプト（Node で全書類を生成し、python-docx で配置を確認） |

### テンプレート

| ファイル | 元 |
|---|---|
| `form1.docx` | 様式第1号 職業紹介事業許可申請書（茨城労働局 r0305_shinsei1.docx、令和7年5月版） |
| `form2.docx` | 様式第2号 職業紹介事業計画書（同 r0301_keikaku2.docx） |
| `form3.docx` | 様式第3号 届出制手数料届出書（同 r0305_tesuuryou_todoke3.docx） |
| `fee.docx` | 様式例第3号 手数料表（同 r0301_tesuuryou_3hyou.docx。生成時に一般登録型のみ残す） |
| `rules.docx` | 様式例第1号 業務の運営に関する規程（東京労働局 001977310.docx） |
| `privacy.docx` | 個人情報適正管理規程（自作、`{{TOKEN}}` 方式） |
| `notice.docx` | 求人者・求職者への明示書面（自作、`{{TOKEN}}` 方式） |

`docgen.js` は `word/document.xml` の段落を出現順のインデックスで指定して値を書き込む。**様式を差し替えたら必ず `python3 tools/paramap.py templates/xxx.docx` でインデックスを取り直し、`fillFormN` の番号を更新する。**

## 動作確認

```bash
cd license-tool
npm install                      # jszip のみ
node tools/verify.js /tmp/out    # sample-data.json で7書類を生成
python3 tools/diffcheck.py templates/form1.docx /tmp/out/form1.docx   # 差し込み位置とXMLの妥当性
python3 -m http.server 8765      # ブラウザで http://127.0.0.1:8765/
```

`tools/diffcheck.py` は python-docx 不要（lxml があれば XML 検証も行う）。`tools/readback.py` は python-docx が必要。

## デプロイ

- 静的サイト。Vercel の新規プロジェクト（Root Directory: `license-tool`、Framework: Other、Build Command なし）で `main` push = デプロイ。
- 本番URLは `https://soukyaku-cloud.com/license/` に載せる方針。送客クラウド本体（別リポジトリの Next.js）の `next.config.js` に rewrite を追加する。

```js
// soukyaku-cloud.com 側 next.config.js
async rewrites() {
  return [
    { source: '/license', destination: 'https://<license-tool の vercel ドメイン>/index.html' },
    { source: '/license/:path*', destination: 'https://<license-tool の vercel ドメイン>/:path*' },
  ];
}
```

- HTML 内のリンクはすべて相対パスなので、`/license/` 配下でそのまま動く。`index.html` の canonical だけ本番URL固定。

## リード受付（GAS）

1. スプレッドシートを作成し、拡張機能 > Apps Script に `apps-script/lead-handler.gs` を貼る。
2. `SLACK_WEBHOOK_URL`、`REPLY_TO`、`SCHEDULE_URL`（無料相談の日程調整URL）を設定。
3. ウェブアプリとしてデプロイ（実行ユーザー: 自分、アクセス: 全員）。
4. 発行URLを `js/app.js` の `config.GAS_URL` に設定（未設定の間はリード送信をスキップし、ツール自体は動く）。
5. `sendNurture` を時間主導トリガー（毎日 午前9〜10時）で登録。

送信されるのはメール・会社名・診断項目・スコアと、`payload` 列に入る会社の数値（`js/app.js` の `CAPTURE_FIELDS` / `CHECK_FIELDS`）。代表者・役員・責任者の氏名・住所・ふりがなは送らない。個人事業主は住所を都道府県までに丸める。同意は登録画面の「利用規約・プライバシーポリシーに同意する」チェック（`terms.html`）で取る。登録時（register）、各ステップ通過時（progress）、書類完成時（lead）、許可時（licensed）に送信。

## 法務メモ

- 書類は「利用者自身が入力して生成」する形。個別の書き方相談は受けない（社労士法27条）。社労士との連携は当面行わない。
- 成果の期限を約束する表現（「3ヶ月で月商300万円」）は使わない（景表法）。
- 様式・要件は年1〜2回変わる。労働局のダウンロードページを定期確認し、`templates/` を差し替える。
