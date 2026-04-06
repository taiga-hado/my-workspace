"use client";

import { useState, useEffect, useCallback } from "react";
import type { Video } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import VideoGrid from "@/components/VideoGrid";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));

    try {
      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();
      setVideos(data.videos || []);
      setCategories(data.categories || []);
      setModels(data.models || []);
      setAllTags(data.allTags || []);
    } catch {
      console.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedModel, selectedTags]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedModel("");
    setSelectedTags([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">動画素材ライブラリ</h1>
          <p className="text-sm text-gray-500 mt-1">
            {videos.length} 件の動画
          </p>
        </div>
        <SearchBar onSearch={setQuery} />
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <FilterSidebar
          categories={categories}
          models={models}
          allTags={allTags}
          selectedCategory={selectedCategory}
          selectedModel={selectedModel}
          selectedTags={selectedTags}
          onCategoryChange={setSelectedCategory}
          onModelChange={setSelectedModel}
          onTagToggle={handleTagToggle}
          onClear={handleClearFilters}
        />
        <div className="flex-1">
          <VideoGrid videos={videos} loading={loading} />
        </div>
      </div>
    </div>
  );
}
