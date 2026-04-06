export const VALID_CATEGORIES = [
  "お出かけ・散歩",
  "お酒・バー",
  "アウトドア・キャンプ",
  "インテリア・暮らし",
  "カフェ",
  "カフェ・グルメ",
  "ガジェット・家電",
  "コスメ・メイク",
  "スイーツ・デザート",
  "スキンケア",
  "ドライブ・車",
  "ファッション・コーデ",
  "ファッション・美容",
  "フィットネス・健康",
  "ヘア・ネイル",
  "ペット・動物",
  "ライフスタイル",
  "ルーティン・Vlog",
  "レストラン・外食",
  "仕事・ビジネス",
  "勉強・スキルアップ",
  "商品レビュー",
  "国内旅行",
  "季節イベント",
  "推し活・エンタメ",
  "料理・自炊",
  "海外旅行",
  "購入品紹介",
  "音楽・ダンス",
  "トラベル・お出かけ",
] as const;

export interface Video {
  id: string;
  originalName: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  model: string;
  source: "model" | "category";
  thumbnailUrl: string;
  driveUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
  processedAt: string;
  transcript?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  videos?: Video[];
}

export interface SyncResult {
  processed: number;
  skipped: number;
  errors: string[];
}

export interface FolderInfo {
  id: string;
  name: string;
}

export interface ScriptSection {
  sectionNumber: number;
  title: string;
  scriptText: string;
  description: string;
  recommendedVideoIds: string[];
  reasoning: string;
}

export interface ScriptAnalysisResult {
  sections: ScriptSection[];
  summary: string;
}
