import { getAllArticles, getCategories } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";

export default function ColumnTop() {
  const articles = getAllArticles();
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">コラム一覧</h1>
      <p className="text-gray-500 mb-8">
        20代の転職・就職に役立つ情報をお届けします
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/"
          className="rounded-full bg-green-600 px-4 py-1.5 text-sm text-white"
        >
          すべて
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/?category=${cat}`}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:border-green-600 hover:text-green-600"
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-green-600 p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">
          未経験からホワイト企業への転職、始めませんか？
        </h2>
        <p className="mb-4 text-green-100">
          ハックツ就職なら、フリーター・未経験でも正社員への就職をサポート
        </p>
        <a
          href="https://hakkutu-career.com"
          className="inline-block rounded-full bg-white px-6 py-3 font-bold text-green-600 hover:bg-green-50"
        >
          無料相談してみる
        </a>
      </div>
    </div>
  );
}
