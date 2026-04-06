import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Video, ScriptAnalysisResult } from "./types";
import { VALID_CATEGORIES } from "./types";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

const CATEGORY_LIST = VALID_CATEGORIES.join("\n- ");

// ─── Video Thumbnail Analysis ───

interface AnalysisResult {
  name: string;
  description: string;
  tags: string[];
  category: string;
}

export async function analyzeVideoThumbnail(
  thumbnailBase64: string,
  originalFileName: string
): Promise<AnalysisResult> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "image/png",
        data: thumbnailBase64,
      },
    },
    {
      text: `この動画のサムネイルを分析して、以下のJSON形式で返してください。
元のファイル名: ${originalFileName}

{
  "name": "日本語での簡潔なファイル名（拡張子なし、20文字以内）",
  "description": "動画の内容を日本語で詳しく説明（50文字程度）",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "category": "カテゴリ名"
}

カテゴリは以下から必ず1つ選んでください（「その他」は使用禁止）:
- ${CATEGORY_LIST}

JSONのみ返してください。`,
    },
  ]);

  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    // Ensure category is valid
    if (!VALID_CATEGORIES.includes(parsed.category)) {
      parsed.category = "ライフスタイル";
    }
    return parsed;
  } catch {
    return {
      name: originalFileName.replace(/\.[^.]+$/, ""),
      description: "AI分析に失敗しました",
      tags: [],
      category: "ライフスタイル",
    };
  }
}

// ─── Category Reclassification ───

export async function reclassifyCategory(
  video: Pick<Video, "name" | "description" | "tags" | "originalName" | "model">
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    {
      text: `以下の動画情報から、最も適切なカテゴリを1つだけ選んでください。

動画名: ${video.name}
元ファイル名: ${video.originalName}
説明: ${video.description}
タグ: ${video.tags.join(", ")}
モデル: ${video.model || "不明"}

カテゴリ一覧:
- ${CATEGORY_LIST}

カテゴリ名のみを返してください。余計な説明は不要です。`,
    },
  ]);

  const text = result.response.text().trim();
  const found = VALID_CATEGORIES.find((c) => text.includes(c));
  return found || "ライフスタイル";
}

// ─── Chat Search ───

export async function chatSearch(
  userMessage: string,
  videos: Video[]
): Promise<{ message: string; matchedVideoIds: string[] }> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const videoContext = videos
    .map(
      (v) =>
        `ID:${v.id} | 名前:${v.name} | モデル:${v.model || "不明"} | 説明:${v.description} | タグ:${v.tags.join(",")} | カテゴリ:${v.category}`
    )
    .join("\n");

  const result = await model.generateContent([
    {
      text: `あなたは動画素材の検索アシスタントです。ユーザーが欲しい素材のニュアンスを伝えてきたら、
以下の動画リストから該当する素材を見つけて提案してください。

## 動画リスト
${videoContext}

## ユーザーのリクエスト
${userMessage}

回答は以下のJSON形式で返してください:
{
  "message": "ユーザーへの返答メッセージ（日本語）",
  "matchedVideoIds": ["id1", "id2", ...]
}

該当する動画がない場合はmatchedVideoIdsを空配列にして、その旨を伝えてください。
JSONのみ返してください。`,
    },
  ]);

  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      message: "申し訳ございません、検索中にエラーが発生しました。",
      matchedVideoIds: [],
    };
  }
}

// ─── Video Transcription ───

export async function transcribeVideo(
  videoBase64: string,
  mimeType: string
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: videoBase64,
      },
    },
    {
      text: "この動画の音声を日本語で文字起こししてください。セリフやナレーションがある場合はそのまま書き起こしてください。音声がない場合は「（音声なし）」とだけ返してください。テキストのみ返してください。",
    },
  ]);

  return result.response.text().trim();
}

// ─── Ad Script Analysis ───

export async function analyzeAdScript(
  script: string,
  videos: Video[]
): Promise<ScriptAnalysisResult> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const videoContext = videos
    .map(
      (v) =>
        `ID:${v.id} | 名前:${v.name} | モデル:${v.model || "不明"} | 説明:${v.description} | タグ:${v.tags.join(",")} | カテゴリ:${v.category}`
    )
    .join("\n");

  const result = await model.generateContent([
    {
      text: `あなたは広告動画の制作アシスタントです。
ユーザーが広告の台本を入力しました。この台本をシーン/セクションに分解し、
各セクションに最適な動画素材を以下のライブラリから提案してください。

## 広告台本
${script}

## 動画素材ライブラリ
${videoContext}

以下のJSON形式で返してください:
{
  "sections": [
    {
      "sectionNumber": 1,
      "title": "セクションタイトル（例: オープニング、商品紹介、CTA等）",
      "scriptText": "台本の該当部分のテキスト",
      "description": "このセクションで必要な映像の説明",
      "recommendedVideoIds": ["id1", "id2", "id3"],
      "reasoning": "この素材を選んだ理由（日本語）"
    }
  ],
  "summary": "台本全体の構成と素材提案のまとめ（日本語）"
}

各セクションには1〜5個の動画素材を提案してください。
JSONのみ返してください。`,
    },
  ]);

  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      sections: [],
      summary: "台本の分析に失敗しました。もう一度お試しください。",
    };
  }
}
