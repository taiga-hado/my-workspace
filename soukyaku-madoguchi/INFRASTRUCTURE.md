# 求職者送客の窓口 — インフラ構成

## サイト概要

| 項目 | 内容 |
|------|------|
| サービス名 | 求職者送客の窓口 |
| URL | https://kyusyokusyasokyaku-no-madoguchi.com/ |
| 運営 | 株式会社HADO |
| 対象 | 人材紹介エージェント企業（B2B） |

---

## ホスティング

| 項目 | 内容 |
|------|------|
| プラットフォーム | **Vercel** |
| リージョン | hnd1（東京） |
| デプロイ方式 | GitHub連携（mainブランチpush時に自動デプロイ） |
| サイト種別 | 静的HTML（フレームワークなし） |

---

## ドメイン・DNS

| 項目 | 内容 |
|------|------|
| ドメイン | kyusyokusyasokyaku-no-madoguchi.com |
| レジストラ | お名前.com（GMO Internet Group） |
| DNS | VALUE DOMAIN（01〜04.dnsv.jp） |
| 取得日 | 2026-02-02 |
| 有効期限 | **2027-02-02**（年次更新） |
| SSL | Vercel自動発行（Let's Encrypt） |

---

## リポジトリ

| 項目 | 内容 |
|------|------|
| GitHub | https://github.com/taiga-hado/my-workspace |
| ディレクトリ | `soukyaku-madoguchi/` |
| ブランチ | main |

### ディレクトリ構成

```
soukyaku-madoguchi/
├── index.html              # トップページ
├── daini-shinsotsu/        # 第二新卒領域ページ
├── shinsotsu/              # 新卒領域ページ
├── contact/                # お問い合わせフォーム
├── thanks/                 # 送信完了ページ
├── interview/              # 導入事例（Nexil, ReWave, SmartForce）
├── blog/                   # 事例記事
├── column/                 # SEOコラム記事（25本）
├── column-dashboard/       # コラム管理ダッシュボード（社内用）
├── dashboard/              # 問い合わせ履歴ダッシュボード（社内用）
├── assets/
│   ├── site.css            # 共通CSS
│   └── site.js             # 共通JS
├── images/                 # 画像素材
├── sitemap.xml             # サイトマップ
├── robots.txt              # クロール制御
├── DASHBOARD_SETUP.md      # ダッシュボード設定手順
└── .gitignore
```

---

## 外部サービス連携

### アナリティクス
| 項目 | 内容 |
|------|------|
| GTM コンテナ | `GTM-PSZ9PPQ9` |
| 管理 | Google Tag Manager → https://tagmanager.google.com/ |

### お問い合わせフォーム
| 項目 | 内容 |
|------|------|
| 送信先 | Google Apps Script（GAS） |
| GAS URL | `https://script.google.com/macros/s/AKfycbx...QcR/exec` |
| データ保存 | Google スプレッドシート + localStorage（ダッシュボード用） |
| 詳細手順 | `DASHBOARD_SETUP.md` 参照 |

### 営業管理
| 項目 | 内容 |
|------|------|
| 営業管理シート | https://docs.google.com/spreadsheets/d/1Wdd4CDYxtD5sSsEBVaFSE0uR3AtDIXpoWF6yYTSfAaw/edit |

---

## デプロイ手順

1. `soukyaku-madoguchi/` 配下のファイルを編集
2. `main` ブランチにpush
3. Vercelが自動検知してデプロイ（通常30秒以内）
4. https://kyusyokusyasokyaku-no-madoguchi.com/ で反映を確認

---

## SEO・コラム自動公開

- コラム記事は `column/` 配下に格納（現在25本）
- 記事メタデータは `column/_metadata.json` で管理
- 自動公開パイプラインは launchd で実行（`99c4888` 参照）
- `robots.txt` で `/dashboard/` と `/column-dashboard/` をクロール除外

---

## 社内向けダッシュボード

| ダッシュボード | パス | 用途 |
|--------------|------|------|
| 問い合わせ履歴 | `/dashboard/` | フォーム送信の履歴確認 |
| コラム管理 | `/column-dashboard/` | コラム記事の公開管理 |

※ いずれもクロール除外済み、認証なし（URLを知っていればアクセス可能）

---

## 注意事項

- ドメイン更新: 2027-02-02までに更新が必要（お名前.com）
- GASのURL: フォーム送信先のGAS URLを変更する場合は `contact/index.html` を直接編集
- Vercelプロジェクト設定変更: Vercelダッシュボードから（https://vercel.com/）
