import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles";

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[16/9] bg-green-50 flex items-center justify-center">
        <span className="text-4xl text-green-300">&#9998;</span>
      </div>
      <div className="p-4">
        <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700 mb-2">
          {article.category}
        </span>
        <h2 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
          {article.title}
        </h2>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {article.description}
        </p>
        <time className="mt-3 block text-xs text-gray-400">
          {article.publishedAt}
        </time>
      </div>
    </Link>
  );
}
