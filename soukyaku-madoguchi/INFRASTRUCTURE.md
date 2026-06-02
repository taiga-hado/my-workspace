# 求職者送客の窓口 — インフラ構成

> このファイルは `.vercelignore`（`*.md`）により本番サイトには公開されません（社内ドキュメント）。

## サイト
| 項目 | 内容 |
|------|------|
| 公開URL | https://kyusyokusyasokyaku-no-madoguchi.com/ |
| Vercelプロジェクト | `soukyaku-madoguchi`（team: taiga-hados-projects） |
| サイト種別 | 静的HTML（フレームワークなし） |
| GTMコンテナ | `GTM-T4VBNNNN`（旧 GTM-PSZ9PPQ9 は廃止） |

## デプロイ（2026-06 一本化済み：main = 唯一の正）
**`main` への push で Vercel が自動デプロイする。** これが唯一の本番反映経路。

| 設定 | 値 |
|------|-----|
| Git連携 | GitHub `taiga-hado/my-workspace` |
| Production Branch | `main` |
| Root Directory | `soukyaku-madoguchi` |

- 手順：`soukyaku-madoguchi/` 配下を編集 → `main` に push → 数十秒で本番反映 → カスタムドメインで確認。
- **旧方式（`vercel --prod` のCLI手動デプロイ／ワークツリーのローカルFS配信）は廃止。** もう単発CLIデプロイは不要・非推奨（mainに揃わず混乱の元）。
- `*.md` は `soukyaku-madoguchi/.vercelignore` で公開対象から除外（社内ドキュメントの漏洩防止）。

## 日次コラム自動公開
| 項目 | 内容 |
|------|------|
| ジョブ | launchd `com.hado.soukyaku-column-daily`（毎日 9:40 JST） |
| 実行物 | `<deploy worktree>/scripts/column/publish_today.sh` → `build_article.py` → `deploy.sh` |
| deploy worktree | `.claude/worktrees/amazing-clarke-640732`（branch を origin/main に整合させて運用） |
| 配信 | `deploy.sh` が生成記事を commit → `git push origin HEAD:main` → **Vercelが自動デプロイ** → `smoke_test.sh` で回帰チェック |

- `smoke_test.sh`：重要ページ200・トップの3サービスカード・GTM ID・sitemap を検証（消失/改変の検知）。
- 記事メタデータ：`scripts/column/`（queue.json / ready / published）。

## ドメイン・DNS
| 項目 | 内容 |
|------|------|
| ドメイン | kyusyokusyasokyaku-no-madoguchi.com |
| レジストラ | お名前.com / DNS: VALUE DOMAIN |
| SSL | Vercel自動（Let's Encrypt） |

## 注意
- 本番を変えたいときは **main に push** すればよい（CLIデプロイ不要）。
- `main` は他プロジェクト（my-workspace / hakkutu-career-media）とも連携しており、push で各々が自動デプロイされる。
