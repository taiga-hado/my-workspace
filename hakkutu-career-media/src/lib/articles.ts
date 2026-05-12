import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  thumbnail?: string;
  content: string;
};

export type ArticleMeta = Omit<Article, "content">;

const articlesDir = path.join(process.cwd(), "content/articles");

export function getArticleSlugs(): string[] {
  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getArticle(slug: string): Article {
  const filePath = path.join(articlesDir, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;

  return {
    slug,
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags || [],
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    thumbnail: data.thumbnail,
    content: html,
  };
}

export function getAllArticles(): ArticleMeta[] {
  return getArticleSlugs()
    .map((slug) => {
      const filePath = path.join(articlesDir, `${slug}.md`);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags || [],
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt,
        thumbnail: data.thumbnail,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getCategories(): string[] {
  const articles = getAllArticles();
  return [...new Set(articles.map((a) => a.category))];
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.category === category);
}
