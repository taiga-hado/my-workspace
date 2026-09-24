# vercel-autofix（自動修復君）

Vercel のビルドが失敗したら Claude Code に直させて、結果を Slack `#通知_vercel` に流す。
失敗の「通知」は [vercel-slack-notify](../vercel-slack-notify/) が担当、こちらは「修復」担当。

## 2系統でカバーする

| | 担当 | 対象 | 出力 |
|---|---|---|---|
| GitHub Actions | `.github/workflows/vercel-autofix.yml` | Git 連携プロジェクト（soukyaku-madoguchi / hakkutu-career-media / my-workspace） | 修正 PR |
| Mac 常駐 | `com.hado.vercel-autofix.plist`（launchd・5分毎） | それ以外（sokureki など CLI デプロイ・未コミットのプロジェクト） | ローカルの作業ツリーに適用 |

Mac 側は Vercel 上で Git 連携されているプロジェクトを自動でスキップするので、二重に直すことはない
（`--all-projects` を付けると全部やる）。

## 動き

1. 失敗したデプロイを見つける（`poll`＝直近30分のERROR / `sha`＝そのコミットのデプロイを待つ）
2. `/v3/deployments/{id}/events` からビルドログを取り、原因行と末尾60行を抽出
3. `.vercel/project.json` の projectId からローカルのプロジェクトフォルダを特定
4. そのフォルダで `claude -p`（bypassPermissions）に修復させる。ビルドを実際に通すところまでやらせる
5. 変更ファイルの有無で成否を判定して Slack へ報告

## 運用

```bash
./run-poll.sh                      # 手動で1回まわす
./run-poll.sh --window 180         # 直近3時間まで遡る
launchctl kickstart gui/$UID/com.hado.vercel-autofix   # 常駐ジョブを即実行
launchctl bootout  gui/$UID/com.hado.vercel-autofix    # 止める
tail -f logs/poll.log
```

- 初回実行時は既存のデプロイを「処理済み」として記録するだけ（過去の失敗を掘り返さない）。状態は `~/.cache/vercel-autofix/seen.json`
- 秘密情報は `.env`（gitignore 済み）。`SLACK_BOT_TOKEN` / `SLACK_CHANNEL_ID` / `VERCEL_TEAM_ID` / `VERCEL_TOKEN` / `ANTHROPIC_API_KEY`
- GitHub Actions 側は同じ値を repo Secrets に登録済み
- Claude はサブスクではなく **ANTHROPIC_API_KEY（従量課金）** で動かす。1回の修復でだいたい $0.05〜0.3
- 親が Claude Code セッションだと `ANTHROPIC_BASE_URL` を継承して 401 になるため、子プロセスの環境変数から `CLAUDE*` と `ANTHROPIC_BASE_URL` を落としている

## 直したくないとき

launchd を止めるか、`.env` の `ANTHROPIC_API_KEY` を外す（通知だけは vercel-slack-notify 側で続く）。
