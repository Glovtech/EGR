import type { MetadataRoute } from "next";

// Single-page site: sections like #pricing are anchors, not separate URLs
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://www.evergreenremedyghana.com/", lastModified: new Date(), priority: 1 }];
}
