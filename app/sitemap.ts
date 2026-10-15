import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Single-page site: sections like #pricing are anchors, not separate URLs
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
