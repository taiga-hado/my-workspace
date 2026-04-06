"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";
import VideoCard from "@/components/VideoCard";

interface Section {
  sectionNumber: number;
  title: string;
  scriptText: string;
  description: string;
  recommendedVideoIds: string[];
  reasoning: string;
  videos: Video[];
}

interface AnalysisResult {
  sections: Section[];
  summary: string;
}

export default function ScriptPage() {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!script.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/script-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">台本分析</h1>
        <p className="text-sm text-gray-500 mt-1">
          広告台本を入力すると、各シーンに最適な動画素材を提案します
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          広告台本を貼り付けてください
        </label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder={"例:\n【シーン1: オープニング】\n朝の光が差し込むカフェ。主人公がコーヒーを飲みながら微笑む。\n\n【シーン2: 商品紹介】\n新作スキンケアアイテムを手に取り、テクスチャーを見せる。\n\n【シーン3: CTA】\n「今すぐチェック」のテロップとともに、商品のクローズアップ。"}
          className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">
            {script.length > 0 ? `${script.length} 文字` : ""}
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading || !script.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                分析中...
              </>
            ) : (
              "分析する"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="font-semibold text-blue-900 text-sm mb-1">分析サマリー</h2>
            <p className="text-sm text-blue-800">{result.summary}</p>
          </div>

          {/* Sections */}
          {result.sections.map((section) => (
            <div
              key={section.sectionNumber}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Section header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {section.sectionNumber}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Script text */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border-l-4 border-blue-400">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.scriptText}</p>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-gray-500 mb-4">
                  <span className="font-medium">提案理由:</span> {section.reasoning}
                </p>

                {/* Recommended videos */}
                {section.videos && section.videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">該当する動画素材が見つかりませんでした</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
