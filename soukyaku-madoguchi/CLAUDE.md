# soukyaku-madoguchi (求職者送客の窓口) - Site Spec

## Critical site structure (DO NOT regress)

### Top-level pages (HTTP 200 required)
- `/` - top page
- `/contact/` - contact form (posts to GAS Web App)
- `/daini-shinsotsu/` - SERVICE 01 詳細
- `/shinsotsu/` - SERVICE 02 詳細
- `/lite/` - 求職者送客の窓口 ライト（応募課金型プラン、added 2026-07-29）
- `/column/` - SEO blog hub (37+ articles, auto-published daily)
- `/thanks/` - form submission landing
- `/interview/*` - case study pages (Nexil, ReWave, SmartForce)

### Top page must contain 2 service cards
In the 「領域別の送客プラン」 section, both must be present with these EXACT h3 strings:
1. `第二新卒・未経験層特化パッケージ` (SERVICE 01, links to `daini-shinsotsu/`)
2. `新卒特化パッケージ` (SERVICE 02, links to `shinsotsu/`)

The legacy 「向け」 naming (e.g. 「第二新卒・未経験層向け」) was deprecated 2026-05-28 — do NOT revert.
The 保育特化パッケージ card (SERVICE 03 → `/hoiku/`) was REMOVED 2026-06-22 — do NOT re-add unless the 保育 offering is relaunched.

### Top page PLANS section (added 2026-07-29)
Below the service cards, a `#plans` section presents the 2 pricing plans:
- 通常プラン（着座成果報酬型・面談着座1件 25,000円〜）
- ライトプラン（応募課金型・1応募 10,000円）→ links to `/lite/`
Keep both cards. ライトプラン is also linked from header nav, footer Services, and a top-page FAQ item.

### /lite/ pricing facts (from 【DP】求職者送客の窓口ライト サービス説明資料, 2026-07)
- 1応募 10,000円（税別）固定単価、リリース記念で初回お申込み分は10%OFF（9,000円）
- 45万円〜/月 × 契約3ヶ月〜（月次分割払いのみ・途中解約不可）、枠数50応募〜
- 運用代行費・動画制作費 0円／架電・面談は導入エージェント側CAが実施
- 対象外ルール: 35歳以上・1ヶ月以内再応募・外国籍・不通番号／通電後発覚（障がい者手帳・外国籍・在学中）→ 毎月20日までにGoogle Form申請で追加送客

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
