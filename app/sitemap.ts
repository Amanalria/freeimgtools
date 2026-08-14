import { MetadataRoute } from "next";
import { TOOLS_DATA } from "@/data/tools";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pixelforge.tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic Tool Pages
  const toolPages: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${BASE_URL}/tool/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: (tool as any).isFeatured ? 0.9 : 0.7,
  }));

  return [...staticPages, ...toolPages];
}
