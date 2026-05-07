# 日次SEO記事自動投稿タスク（求職者送客の窓口）

このタスクは「求職者送客の窓口」（https://kyusyokusyasokyaku-no-madoguchi.com/）のコラム（`/column/`）に、毎日1本ずつSEO記事を自動投稿することを目的としています。

## サービスの前提知識

- **サービス名**：求職者送客の窓口（株式会社HADO運営）
- **モデル**：B2B、面談着座成果報酬型の求職者送客サービス
- **ターゲット読者**：人材紹介エージェント企業の経営者・マーケ責任者
- **強み**：SNSでの独自集客、第二新卒・若手未経験・新卒層に特化、面談着座率80〜90%、初期費用・月額費用0円
- **記事のCTA遷移先**：LP トップ（`https://kyusyokusyasokyaku-no-madoguchi.com/`）

## 手順（毎日のフロー）

### 1. キュー読み込み

`/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/scripts/column/queue.json` を読み込み、配列の **先頭1件** を取り出してください。各エントリは以下の構造：

```json
{
  "slug": "...",
  "title": "...",
  "description": "...",
  "keywords": "...",
  "category": "...",
  "image_prompt": "...",
  "key_points": ["...", "..."]
}
```

### 2. 本文（body_html）を執筆

取り出したエントリの `key_points` を元に、以下の構造で **約3,500〜4,500字** の本文を執筆してください：

```html
<div class="art-lead">
  <p>[リード1段落目：トピックの重要性・読者の課題]</p>
  <p>[リード2段落目：本記事で解説する範囲]</p>
</div>

<nav class="art-toc">
  <h3>目次</h3>
  <ol>
    <li><a href="#xxx">[H2タイトル1]</a></li>
    <li><a href="#yyy">[H2タイトル2]</a></li>
    <li><a href="#zzz">[H2タイトル3]</a></li>
    <li><a href="#summary">まとめ</a></li>
  </ol>
</nav>

<h2 id="xxx">[H2見出し1]</h2>
<p>[段落]</p>
<h3>[H3見出し]</h3>
<p>[段落、要点は<strong>で強調]</p>
<ul>
  <li><strong>[ポイント名]</strong>：[説明]</li>
  ...
</ul>

<h2 id="yyy">[H2見出し2]</h2>
... (繰り返し、合計3〜5個のH2セクション)

<div class="art-callout">
  <p><strong>[強調点]</strong>：[補足説明]</p>
</div>
```

### 3. ファイルとして書き出し

以下の構造でJSON配列を `/tmp/today_article.json` に書き出してください：

```json
[
  {
    "slug": "[キューから取得したslug]",
    "title": "[キューから取得したtitle]",
    "description": "[キューから取得したdescription]",
    "keywords": "[キューから取得したkeywords]",
    "category": "[キューから取得したcategory]",
    "read_time": "[X分]",
    "image_prompt": "[キューから取得したimage_prompt]",
    "summary": [
      "[まとめポイント1：50〜100字]",
      "[まとめポイント2：50〜100字]",
      "[まとめポイント3：50〜100字]",
      "[まとめポイント4：50〜100字]"
    ],
    "bridge_title": "[ソフト遷移文の見出し（〜25字）]",
    "bridge": [
      "[1段落目：本記事の学びを受けた問題提起。サービスの一般論として整理]",
      "[2段落目：『求職者送客の窓口』の具体的な特徴と本記事のテーマとの接続。<strong>初期費用0円・月額費用0円</strong> や面談着座率80〜90%など、強みを自然に織り込む]"
    ],
    "body_html": "[ステップ2で書いた本文HTML]"
  }
]
```

### 4. ビルド実行

```bash
python3 "/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/scripts/column/build_article.py" /tmp/today_article.json
```

このスクリプトが画像生成（gpt-image-2）、HTML書き出し、`column/index.html` の更新、`sitemap.xml` への追加、`_metadata.json` の更新を実行します。

### 5. queue.jsonの自動更新を確認

`build_article.py` は `process_articles` 内で `auto_pop_queue` を呼び、処理済みのslugを自動的に `queue.json` から削除します。同時に `column/_kw_index.json`（社内ダッシュボード用）も自動更新されます。手動でpopする必要はありません。スクリプト出力に `[queue OK] removed 1 item(s)` が表示されていることを確認してください。

### 6. デプロイ

```bash
"/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/scripts/column/deploy.sh" "[今回のslug]"
```

このスクリプトがgit add → commit → push → vercel deploy --prod を実行します。

## 品質基準（重要）

- **文体**：B2B硬め、データ・実務観点を多用。砕けすぎない／敬体で統一
- **トーン参考**：`/Users/taiga/Desktop/Documents-My Vault/.claude/worktrees/amazing-clarke-640732/scripts/column/articles_initial.py` の `ARTICLE_2`〜`ARTICLE_10` を必ず参照
- **避けること**：
  - 抽象的な精神論（「諦めずに頑張りましょう」など）
  - 個人ブログ的な体験談調
  - 求職者向け（B2C）視点の記述
- **必ず入れること**：
  - 具体的な数字（CPA相場、業界平均、％など）
  - 実務で使えるアクションリスト
  - 失敗パターン or 落とし穴
- **bridgeのCTA設計**：
  - 1段落目で「本記事のテーマの究極的な解決策」をサービス類型として一般化
  - 2段落目で具体的に「求職者送客の窓口」の特徴を紹介、`<strong>` で強み（初期費用0円、面談着座率80〜90%、第二新卒・若手未経験・新卒に特化等）を強調

## エラー時の対応

- **queue.json が空**：「キューが空です。新しいトピックを追加してください」と報告して終了
- **画像生成失敗**：build_article.py がリトライ3回を内蔵。3回失敗したら警告ログのみで処理続行（HTML側はimg srcが404になるが、後で差し替え可能）
- **gitコンフリクト**：作業を中止し、状況を報告
- **vercel deploy 失敗**：原因をログから特定。多くは認証切れなのでその旨を報告

完了後、何の記事を投稿したか・URL・残りキュー件数 を1〜2文で報告してください。
