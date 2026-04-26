# ダッシュボード共有化セットアップ手順（Google Forms + Sheets）

フォーム送信を **Google フォーム** に同時送信し、受信内容を **Google スプレッドシート** に蓄積。ダッシュボードは Sheets から CSV を取得して表示します。
所要時間: 約 15 分。

---

## 1. Google フォームを作成

1. [Google フォーム](https://forms.google.com/) を開き、新規フォームを作成
2. 質問を以下の順序・タイプで作成（**必須**列は Google フォーム側の必須設定）

| # | 質問タイトル | タイプ | 必須 | 選択肢 |
|---|------------|-------|------|-------|
| 1 | 会社名 | 記述式 | ✓ | — |
| 2 | 部署名・役職 | 記述式 |  | — |
| 3 | 姓 | 記述式 | ✓ | — |
| 4 | 名 | 記述式 | ✓ | — |
| 5 | メールアドレス | 記述式 | ✓ | — |
| 6 | ご興味のあるサービス | ラジオ | ✓ | 第二新卒・未経験領域 / 新卒領域 / 両方 / 相談して決めたい |
| 7 | 月間希望送客数 | ラジオ |  | 月10〜30件 / 月30〜50件 / 月50〜100件 / 月100件以上 / 未定 |
| 8 | ご要望・ご質問 | 段落 |  | — |

3. **[回答]タブ** → 緑のアイコン → **[スプレッドシートにリンク]** → Sheet を作成

---

## 2. 各フィールドの entry ID を取得

1. フォームの右上メニューから **[事前入力したリンクを取得]** を選択
2. 全フィールドに適当な文字列（例: `A`, `B`, `C`…）を入力 → **[リンクを取得]** → **[リンクをコピー]**
3. コピーした URL をメモ帳等に貼り付け、`entry.XXXXXX=A` の部分を各フィールドから拾う
   - `entry.111111=A` → 会社名
   - `entry.222222=B` → 部署名・役職
   - …

---

## 3. フォーム送信先 URL を取得

フォーム右上 **[送信]** → リンクタブ → **URL をコピー**。取得した URL の末尾が `/viewform` になっているので、これを **`/formResponse`** に書き換える。

例:
```
https://docs.google.com/forms/d/e/1FAIpQLSd......./viewform?usp=pp_url
→
https://docs.google.com/forms/d/e/1FAIpQLSd......./formResponse
```

---

## 4. スプレッドシートを CSV 公開

1. Sheet を開き **[ファイル]** → **[共有]** → **[ウェブに公開]**
2. 「リンク」タブで以下を設定
   - 範囲: 該当シート
   - 形式: **カンマ区切り形式（.csv）**
3. **[公開]** をクリック → 出力された CSV URL をコピー
   - 形式: `https://docs.google.com/spreadsheets/d/e/XXXXXXXX/pub?output=csv`

---

## 5. 設定ファイルに反映

`soukyaku-madoguchi/assets/form-config.js` を編集:

```js
window.MADOGUCHI_CONFIG = {
  GOOGLE_FORM_ACTION: 'https://docs.google.com/forms/d/e/XXX/formResponse',
  FIELD_ENTRIES: {
    company:    'entry.111111',
    department: 'entry.222222',
    lastName:   'entry.333333',
    firstName:  'entry.444444',
    email:      'entry.555555',
    service:    'entry.666666',
    monthly:    'entry.777777',
    message:    'entry.888888'
  },
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/YYY/pub?output=csv'
};
```

---

## 6. Vercel に再デプロイ

```bash
cd soukyaku-madoguchi
vercel --prod
```

デプロイ完了後、以下を確認:

- **フォーム送信** → `https://soukyaku-madoguchi.vercel.app/contact/`
  - 送信後、Sheet に行が追加される
  - Slack にもメールが届く（既存の mailto 経由）
  - localStorage にも保存される（ローカル履歴）
- **ダッシュボード** → `https://soukyaku-madoguchi.vercel.app/dashboard/`
  - 「✓ Google Sheets と連携中」と表示される
  - Sheet のレコードが全件表示される
  - 60 秒ごとに自動再取得

---

## 備考

- Sheet の列ヘッダー（日本語）は自動マッピングされます。順序や列名を変えた場合は `dashboard/index.html` の `mapSheetRow()` を調整してください。
- `SHEET_CSV_URL` が未設定の場合、ダッシュボードは従来通り `localStorage` のブラウザ内履歴を表示します。
- フォームを no-cors で POST しているため、送信成功/失敗のステータスは取得できません（Google フォーム側に届いても取得できない制約）。確実性のため Slack メール + Sheet の二重で受け取れるようにしています。

---

## 7. リスティング広告のUTM計測（任意）

広告経由のコンバージョンを判別するため、フォーム送信時に以下のフィールドを自動付与します（`assets/site.js` で実装済み）。

| フィールド | 内容 | 例 |
|------------|------|-----|
| `utm_source` | 流入元 | `google` / `yahoo` |
| `utm_medium` | メディア | `cpc` / `display` |
| `utm_campaign` | キャンペーン名 | `brand-2026q2` |
| `utm_term` | キーワード（検索広告） | `求職者集客` |
| `utm_content` | 広告クリエイティブ識別 | `banner-a` |
| `gclid` | Google Ads クリックID | 自動付与 |
| `yclid` | Yahoo広告 クリックID | 自動付与 |
| `landing_page` | 広告流入時の着地ページ | `/` |

### 動作仕様

- ユーザーが広告URL（例: `https://kyusyokusyasokyaku-no-madoguchi.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand`）でアクセスすると、UTMパラメータが localStorage に保存される
- **last-touch attribution**: 後から別のUTM付きURLでアクセスした場合は上書き
- **有効期間**: 30日間。期限切れは自動破棄
- フォーム送信時に上記フィールドを送信ペイロードに自動付与

### Google フォーム側の対応

Google フォームに以下の質問を追加してください（タイプ「記述式」、必須なし）:

| # | 質問タイトル | タイプ | 必須 |
|---|------------|-------|------|
| 9 | utm_source | 記述式 | — |
| 10 | utm_medium | 記述式 | — |
| 11 | utm_campaign | 記述式 | — |
| 12 | utm_term | 記述式 | — |
| 13 | utm_content | 記述式 | — |
| 14 | gclid | 記述式 | — |
| 15 | yclid | 記述式 | — |
| 16 | landing_page | 記述式 | — |

追加後、`assets/form-config.js` の `FIELD_ENTRIES` にも対応する `entry.XXXX` を追加します（手順2と同じ要領で取得）。

```js
FIELD_ENTRIES: {
  // ...既存のフィールド
  utm_source:   'entry.999991',
  utm_medium:   'entry.999992',
  utm_campaign: 'entry.999993',
  utm_term:     'entry.999994',
  utm_content:  'entry.999995',
  gclid:        'entry.999996',
  yclid:        'entry.999997',
  landing_page: 'entry.999998'
}
```

### 動作確認方法

1. ブラウザで `?utm_source=test&utm_medium=cpc&utm_campaign=qa` 付きのURLでサイトにアクセス
2. DevTools → Application → Local Storage → `madoguchi_attribution` に値が入っていることを確認
3. その状態でフォーム送信 → Sheet の該当列にUTM値が入っていればOK
