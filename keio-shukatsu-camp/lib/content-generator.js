import { chat } from './openai.js';

const SYSTEM_PROMPT = `あなたは Instagram「慶應就活CAMP」(@keioshukatsucamp) の編集者です。
慶應大学2-3年生（早期就活組）に向けた、保存価値の高いカルーセル投稿を企画します。

トンマナ：
- 親しみやすく、現役大学生に寄り添う
- 数字・固有名詞を多用してリアル感を出す
- 「慶應」「三田会」「塾生」などの慶應生特有の文脈を活用
- 業界用語（ガクチカ、ES、OB訪問、ウィンターインターン等）はそのまま使用
- カルーセル全体は「フック→具体例→構造化解説→まとめCTA」の構造

カバー1枚目：
- インパクト最重視
- 数字（ランキング・倍率・年収・サンプル数）を含める
- 【保存必須】【保存推奨】系のフラグ
- 28卒・29卒の学年指定

中身（2-9枚目）：
- 番号→タイトル→説明の構造
- 各スライドは独立して完結する情報
- 1枚に詰め込みすぎない

最終スライド（10枚目）：
- 保存・フォローのCTA
- 次回投稿予告`;

function buildUserPrompt(theme, exampleTitle, nextPreview) {
  return `今日の投稿を企画してください。

【柱】${theme.pillar}
【タイトル候補】${exampleTitle}
【次回予告】${nextPreview.date} - ${nextPreview.title}

以下のJSON形式で、10枚のカルーセル投稿を生成してください。
各フィールドは厳守。

{
  "title": "カバーメインタイトル(20文字以内、インパクト重視・数字必須)",
  "subtitle": "カバーサブタイトル(25文字程度・タイトルを補強)",
  "hook": "プリタイトル(◆で始まる短文・25文字以内・誰のためか/根拠の数字を入れる)",
  "badges": ["バッジ1(8文字以内・例: 28卒必見)", "バッジ2(8文字以内・例: 保存必須)"],
  "preview_card_label": "プレビューカードのラベル。テーマ内容に合わせて自然に。例: ランキング先出し(1〜3位) / 重要ステップ3選 / 押さえるべき3点 / 注目ポイント3つ など。preview_itemsの中身と整合性を取る",
  "preview_items": [
    { "rank": "1", "main": "項目名(8-12文字)", "category": "補足情報(8-15文字)" },
    { "rank": "2", "main": "...", "category": "..." },
    { "rank": "3", "main": "...", "category": "..." }
  ],
  "preview_card_more": "続きへの誘導文。テーマに応じて自然に書く。例: 詳細は次のスライドで深掘り → / さらにポイント7つはスワイプで → / 各項目の解説は本文で → など。'4位〜は'のような固定表現は避ける(preview_itemsはランキングとは限らない)",
  "slides": [
    {
      "id": 2,
      "section_label": "短いセクションラベル(10文字以内)",
      "title": "スライドメインタイトル(20文字程度)",
      "subtitle": "サブタイトル(任意・30文字以内)",
      "type": "list",
      "items": [
        { "id": "01", "title": "項目名", "description": "1行解説" }
      ]
    }
  ],
  "caption": "Instagram投稿のキャプション全文。【MUST: 800文字以上1100文字以下】。次の構成: (1)【保存必須】や強い見出し (2)問いかけ・共感 (3)この投稿でわかること(✅で4-5項目) (4)本文の要点・導入 (5)CTA(保存・フォロー誘導) (6)空行 (7)ハッシュタグ12-15個。改行を多めに使い視認性高く構成。"
}

slidesのtypeは以下のいずれか：
- "list": 番号付きリスト(5-7項目)。ランキング・要素列挙・ステップ等
- "feature": 大型ブロック(3-4項目、各々タイトル+引用)。理由・特徴の深堀り
- "actions": ACTION 1/2/3 形式(3項目)。具体的な行動指針
- "warnings": ×印付き失敗例(3項目)。落とし穴・注意点
- "summary": 最終まとめ・CTA。最後のスライドのみ

slidesは合計9枚(id 2〜10)生成。
最終slide(id:10, type:summary)は次回予告(${nextPreview.date} - ${nextPreview.title})を必ず含めること。

慶應大学2-3年生(早期就活)に特化。三田会・塾生・慶應OB等の文脈を活用。
JSONのみを返してください(前後の説明文・コードブロック禁止)。`;
}

export async function generateCarouselContent({ theme, exampleTitle, nextPreview }) {
  const userPrompt = buildUserPrompt(theme, exampleTitle, nextPreview);
  const response = await chat({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    responseFormat: { type: 'json_object' },
    temperature: 0.85,
  });
  return JSON.parse(response);
}
