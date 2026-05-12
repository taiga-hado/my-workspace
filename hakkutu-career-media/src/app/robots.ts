import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/column/",
    },
    sitemap: "https://hakkutu-career.com/column/sitemap.xml",
  };
}
