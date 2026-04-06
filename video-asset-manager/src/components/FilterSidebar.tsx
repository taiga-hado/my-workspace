"use client";

interface FilterSidebarProps {
  categories: string[];
  models: string[];
  allTags: string[];
  selectedCategory: string;
  selectedModel: string;
  selectedTags: string[];
  onCategoryChange: (category: string) => void;
  onModelChange: (model: string) => void;
  onTagToggle: (tag: string) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  categories,
  models,
  allTags,
  selectedCategory,
  selectedModel,
  selectedTags,
  onCategoryChange,
  onModelChange,
  onTagToggle,
  onClear,
}: FilterSidebarProps) {
  const hasFilters =
    selectedCategory || selectedModel || selectedTags.length > 0;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      {/* Filter Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">フィルター</h2>
          {hasFilters && (
            <button
              onClick={onClear}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              クリア
            </button>
          )}
        </div>

        {/* Model Filter */}
        {models.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              モデル
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => onModelChange("")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !selectedModel
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                すべて
              </button>
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => onModelChange(m)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedModel === m
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              カテゴリ
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => onCategoryChange("")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !selectedCategory
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                すべて
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
