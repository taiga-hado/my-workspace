"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";
import EditModal from "./EditModal";

interface VideoCardProps {
  video: Video;
  onUpdate?: (updated: Video) => void;
}

export default function VideoCard({ video: initialVideo, onUpdate }: VideoCardProps) {
  const [video, setVideo] = useState(initialVideo);
  const thumbnailSrc = video.thumbnailUrl || "/thumbnails/placeholder.svg";
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleSave = (updated: Video) => {
    setVideo(updated);
    onUpdate?.(updated);
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Thumbnail — clicks through to Google Drive */}
        <a href={video.driveUrl} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer">
            <img
              src={thumbnailSrc}
              alt={video.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/thumbnails/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </a>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
            {video.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {video.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{video.tags.length - 3}
              </span>
            )}
          </div>

          {/* Transcript toggle */}
          {video.transcript && video.transcript !== "（音声なし）" && (
            <>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2 hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {showTranscript ? "字幕を隠す" : "字幕を表示"}
              </button>
              {showTranscript && (
                <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-2 mb-2 max-h-20 overflow-y-auto leading-relaxed">
                  {video.transcript}
                </div>
              )}
            </>
          )}

          {/* Model + Category + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {video.model && (
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {video.model}
                </span>
              )}
              {video.category && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {video.category}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {/* Edit button */}
              <button
                onClick={() => setShowEdit(true)}
                className="text-xs text-gray-500 hover:text-amber-600 transition-colors"
                title="編集"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <a
                href={video.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                title="Google Driveで開く"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href={`/api/download?id=${video.id}`}
                className="text-xs text-gray-500 hover:text-green-600 transition-colors"
                title="ダウンロード"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditModal
          video={video}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
