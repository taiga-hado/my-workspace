import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getArticleSlugs } from "@/lib/articles";
import Breadcrumb from "@/components/Breadcrumb";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = getArticle(slug);
    return {
      title: article.title,
      description: article.description,
      openGraph: {
        title: article.title,
        description: article.description,
        type: "article",
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = getArticle(slug);
  } catch {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: "ハックツ就職",
      url: "https://hakkutu-career.com",
    },
    publisher: {
      "@type": "Organization",
      name: "株式会社HADO",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "コラム", href: "/" },
            { label: article.category },
            { label: article.title },
          ]}
        />

        <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700 mb-4">
          {article.category}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
          {article.title}
        </h1>
        <div className="flex gap-4 text-sm text-gray-400 mb-8">
          <time>公開: {article.publishedAt}</time>
          {article.updatedAt && <time>更新: {article.updatedAt}</time>}
        </div>

        <div
          className="prose prose-green max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-12 rounded-lg bg-green-600 p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            転職のプロに無料相談してみませんか？
          </h2>
          <p className="mb-4 text-green-100">
            ハックツ就職では、未経験OKのホワイト企業求人を多数ご紹介しています
          </p>
          <a
            href="https://hakkutu-career.com"
            className="inline-block rounded-full bg-white px-6 py-3 font-bold text-green-600 hover:bg-green-50"
          >
            無料相談はこちら
          </a>
        </div>
      </article>
    </>
  );
}
