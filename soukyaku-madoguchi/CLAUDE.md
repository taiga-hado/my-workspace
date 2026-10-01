# soukyaku-madoguchi (求職者送客の窓口) - Site Spec

## Critical site structure (DO NOT regress)

### Top-level pages (HTTP 200 required)
- `/` - top page
- `/contact/` - contact form (posts to GAS Web App)
- `/daini-shinsotsu/` - SERVICE 01 詳細
- `/shinsotsu/` - SERVICE 02 詳細
- `/lite/` - 求職者送客の窓口 ライト（応募課金型プラン、added 2026-07-29）
- `/column/` - SEO blog hub (37+ articles, auto-published daily)
- `/thanks/` - form submission landing ＝ **資料ページ**（2026-10-01〜。PDFダウンロード＋スライド閲覧＋面談予約URL。広告CVのURLなので変えない）
- `/document/` - `/thanks/` と同内容の資料ページ（メールから案内する用。CVを二重計上しないため分けている。**thanks を直したら document へ cp する**）
- `/dl/madoguchi-chuto.pdf` `/dl/madoguchi-shinsotsu.pdf` - ご紹介資料PDF（ソース＝ワークスペース直下 `madoguchi-doc-deck/`、スライド画像は `images/doc/{chuto,shinsotsu}/sNN.webp`）
- `/interview/*` - case study pages (Nexil, ReWave, SmartForce)

### Top page must contain 2 service cards
In the 「領域別の送客プラン」 section, both must be present with these EXACT h3 strings:
1. `第二新卒・未経験層特化パッケージ` (SERVICE 01, links to `daini-shinsotsu/`)
2. `新卒特化パッケージ` (SERVICE 02, links to `shinsotsu/`)

The legacy 「向け」 naming (e.g. 「第二新卒・未経験層向け」) was deprecated 2026-05-28 — do NOT revert.
The 保育特化パッケージ card (SERVICE 03 → `/hoiku/`) was REMOVED 2026-06-22 — do NOT re-add unless the 保育 offering is relaunched.

### Top page PLANS section (added 2026-07-29, **2026-10-01〜 template に退避中**)
Below the service cards, a `#plans` section presents the 2 pricing plans（現在は `<template>` 内で非表示。ライト復活時に戻す）:
- 通常プラン（着座成果報酬型・面談着座1件 25,000円〜）
- ライトプラン（応募課金型・1応募 10,000円）→ links to `/lite/`
Keep both cards. ライトプラン is also linked from header nav, footer Services, and a top-page FAQ item.

### /lite/ policy: NO prices or billing-exclusion details on the public page (2026-07-29〜)
料金プラン（単価・月額・契約期間・キャンペーン）と請求対象外ルールの詳細は**面談で案内する方針**のため、/lite/ とトップの表記は「1応募ごとの固定単価」「詳細は面談にてご案内」に統一。金額（10,000円/9,000円/45万円等）・10%OFF・50応募〜/3ヶ月〜・対象外の定義を**サイトに再掲しないこと**。試算セクションも金額系（売上・面談単価・ROAS）は削除済みで、人数・率のみ掲載。「ご利用にあたってのルール」セクションも削除済み（ユーザー指示）。内部向けの正式条件は `soukyaku/salesdocuments/【DP】求職者送客の窓口ライト　サービス説明資料.pdf` を参照。
- /lite/ のフロー帯は `.flow-bands { grid-template-columns: 3fr 2fr; }` で上書き（site.css既定は通常フロー用の4:1。窓口=STEP01〜03/エージェント=STEP04〜05のため）。
- トップの背景交互リズム: services(soft)→plans(白)→cases(soft)→pricing-model(白)。PRICING MODELセクションには「※通常プランのご説明です」の注記＋/lite/リンクあり。

### Lite = サイトから一時撤去（2026-10-01〜）
ライトプランは未リリースのため、**サイト上の露出を全部止めた**（ユーザー指示）。復活時にすぐ戻せるよう、削除ではなく退避にしてある：
- `index.html`：PLANSセクションは `<template id="lite-plans-section">` の中に丸ごと退避（描画されない）。ナビ／フッター／PRICING MODELの注記／FAQ項目は `<!-- LITE: … -->` コメント。背景リズムは services(soft)→cases(白)→pricing-model(soft) に変えてある（復活時は cases=soft・pricing-model=白に戻す）。
- `contact/index.html`：ライトの checkbox を `<!-- LITE: … -->` コメント。
- `sitemap.xml`：/lite/ の `<url>` をコメント。
- `.vercelignore`：`lite/` を追加して非公開（ファイルは repo に残る）。
- `scripts/column/smoke_test.sh`：ライト checkbox の検査を外した。
- GAS（buildBody_ のライト案内文）と `/lite/index.html` はそのまま。
**復活手順**：上の各所の `LITE:` コメント／template を外す → .vercelignore から `lite/` を消す → smoke_test に checkbox 検査を戻す → push。

### （参考・撤去前）Lite = pre-registration until launch (2026-07-29〜)
ライトプランは**未リリース**のため、/lite/・トップ・/contact/ は「現在リリース準備中につき事前登録受付中」の打ち出しで統一（CTA=事前登録する）。正式リリース時にこの表記を外す。

### 資料ダウンロード導線（2026-10-01〜、求職者送客クラウドの導線を踏襲）
- トップの最終CTA（`#contact`）と `/contact/` は**資料ダウンロード型**：紺パネル＋資料の扇＋フォーム（会社名・会社メール・姓名・**ご希望のセグメント checkbox＝必須・1つ以上**。必須バッジは出さず「任意」「複数可」だけ表示。部署名欄は廃止）。CVは「フォーム送信」1点。トップから面談予約URLは出さない。
- フォーム共通ロジック＝`assets/inquiry.js`（POST先GASは従来と同じ、フリーメール拒否、attribution同梱、localStorage保存、送信後 `/thanks/?area=chuto|shinsotsu|both` へ遷移）。スタイル＝`assets/inquiry.css`（`.dl-*` `.iq-*` `.doc-*`）。
- セグメントは必須なので未選択では送信できない（inquiry.js で検証）。GAS側の「領域不明なら両領域」フォールバックは手動リード等のために残している。`/contact/` のライトプラン checkbox は 2026-10-01 にコメントアウト（上記 Lite 撤去を参照）。
- 資料ページ `/thanks/`・`/document/`：ご紹介資料は**商談につなげる用**（料金表・今後の流れ・注意事項は載せない。面談で案内）。面談予約URL＝Googleカレンダー予約ページ `https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I3OA0rCgTVGeRd0dgFnZX4-qzPcwhYerfWLX4yPs40cETVoq51xu1UGucxzUNu7TgWf9gfldD`（GASの SCHEDULE_URL と同じ）。
- 資料を直すとき：`madoguchi-doc-deck/{chuto,shinsotsu}.html` を編集 → `./build.sh chuto` → PDFを `dl/` へ、`out/` の webp を `images/doc/` へコピー（`madoguchi-doc-deck/README.md`）。
- GAS v16 (2026-10-01): 返信メールを説明動画からご紹介資料（PDF URL＋/document/）＋面談予約URLに変更。動画URL定数は削除。

### Contact form + GAS (v10, 2026-07-29)
- /contact/ の「ご興味のあるサービス」checkbox に `ライトプラン（応募課金型）` を追加（value はこの文字列。表示ラベルには「※リリース前・事前登録受付中」付き）。
- 受信GAS（apps-script/form-handler.gs ミラー、v10）: buildBody_ に「ライトプラン」部分一致でライト案内文（「事前登録として承りました」＋面談誘導。動画なし）。Slack通知・submissions・シート1ダッシュボードは p.service に値が流れるだけで変更不要。手動リード追加ダイアログ（本番は dashboard.gs 側が有効）にも同オプションあり。本番はバージョン16として既存デプロイに反映済み。
- GAS v13 (2026-08-21, 本番バージョン20): 領域未選択（「相談して決めたい」等）でも**両領域の説明動画をフォールバック掲載**（ライトのみ選択時は除く）。旧仕様は本文がほぼ空のメールになる実害があった。
- GAS v14 (2026-08-31, 本番バージョン21): 海外出張対応（v11-v12の`onTrip`日付判定＝8/10〜9/4メール一本化）を帰国前倒しで終了・コードごと削除し、通常の面談案内（メール返信＋日程調整URLの2択）に復帰。

### Logos for service cards
- `images/logo-daini.png` (91KB)
- `images/logo-shinsotsu.png` (74KB)

`images/logo-hoiku.png` was removed 2026-06-22 with the 保育 card. If 保育 is ever relaunched, the composite-style logo lives in git history at commit **`007f844`** (NOT `06d333e`, the deprecated AI-generated version).

### Analytics & tracking
- **GTM container**: `GTM-T4VBNNNN` (account: 求職者送客の窓口, owner: t.tanaka@hadoinc.com)
  - Legacy GTM-PSZ9PPQ9 was retired 2026-06-01. Do NOT re-introduce.
- **GA4 measurement ID**: `G-1YK0LEBEX9` (linked from GTM-T4VBNNNN)
- **Search Console**: URL-prefix property `https://kyusyokusyasokyaku-no-madoguchi.com/`

### Deployment
- Vercel project: `taiga-hados-projects/soukyaku-madoguchi`
- Production URL: `https://kyusyokusyasokyaku-no-madoguchi.com/`
- **Deploy = push to `main`.** The Vercel project is Git-connected (repo `taiga-hado/my-workspace`, Production Branch `main`, Root Directory `soukyaku-madoguchi`); pushing to `main` auto-builds and aliases the production domain. The old manual `vercel --prod` / worktree-filesystem deploy was retired 2026-06 — do NOT reintroduce it.
- Auto-publish runs daily at 09:40 JST via macOS launchd (`~/Library/LaunchAgents/com.hado.soukyaku-column-daily.plist`). `scripts/column/deploy.sh` now just commits the built article and runs `git push origin HEAD:main` → Vercel auto-deploys.
- `*.md` files are excluded from the public site via `soukyaku-madoguchi/.vercelignore`.
- After every deploy, `scripts/column/smoke_test.sh` MUST pass. It checks that:
  - All critical pages return 200
  - All 2 service cards exist on top page
  - `GTM-T4VBNNNN` is present
  - sitemap.xml lists the required URLs

## Workflow rules (re-applies the lessons of past regressions)

### Before running `git checkout <commit> -- <path>` to restore a file
1. **Run `git log --all --oneline -- <path> | head -10`** to see if there are MORE RECENT commits that touched the same file. Picking an old commit can re-introduce a deprecated version.
2. The hoiku logo regression (2026-06-01) happened because `git checkout 06d333e -- logo-hoiku.png` was used while a newer `007f844` had already replaced it with the composite version.

### Before `sed -i` over many HTML files
1. **Check what other historical changes might be in those files** — `sed` operates on disk content, not on git history. Earlier worktree state can leak through if the worktree base is older than the latest service commits.
2. The保育士 SERVICE 03 regression (2026-06-01) happened because a GTM-swap commit was authored against a worktree state that predated the保育士 card addition.
3. Prefer `git apply` of a targeted diff, or per-file `Edit` calls, over wide `sed` sweeps when the repo has had many recent content changes.

### Service pricing facts (keep articles consistent)
- 面談単価: **2.5万円〜** (値下げ後、2026-06-01〜)
- 成約率: **15%** (業界平均8〜12%を上回る水準)
- 決定単価: **16.7万円〜** (業界最安水準)
- 面談着座率: **80〜90%**
- 初期費用・月額費用: 0円
- 契約: 月単位、最低発注数なし
- 対応領域: 第二新卒・若手未経験・新卒（**保育士は2026-06-22にサービスサイトから削除**）

If any column article (under `/column/`) still references old prices (e.g. 「3.5万円」), update or note it.
- tl;dv録画URL自動ひも付けGAS（apps-script/tldv-sync.gs ミラー、2026-09-16）: 1時間トリガーで tl;dv API→submissions の tldvURL/商談日/ステータス(→商談済)を自動更新し、文字起こしを Claude（claude-opus-5）で分析して 先方要約/温度感(S-C)/理由 を書く（シート1 M〜O列に転記）。詳細は apps-script/README.md。
- 契約書フォルダ同期GAS（apps-script/contract-sync.gs ミラー、2026-09-16）: 共有ドライブ「エージェント」フォルダ（1社1サブフォルダ）を3日ごとに走査し、契約書があるクライアントを submissions と突合してステータス→契約・契約日・契約書フォルダURLを書く。詳細は apps-script/README.md。
- tl;dv Webhook 受け口（2026-09-16）: Web App exec URL `?src=tldv&token=…` → コード.gs doPost が tldv-sync.gs に委譲。受け口はキュー投入のみ、処理は毎分トリガー。詳細は apps-script/README.md。
