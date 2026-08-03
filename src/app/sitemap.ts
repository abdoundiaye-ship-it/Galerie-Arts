import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: artworks } = await supabase
    .from("artworks")
    .select("reference, updated_at")
    .eq("is_published", true);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/galerie`, changeFrequency: "daily", priority: 0.9 },
  ];

  const artworkRoutes: MetadataRoute.Sitemap = (artworks ?? []).map((artwork) => ({
    url: `${SITE_URL}/galerie/${artwork.reference}`,
    lastModified: artwork.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...artworkRoutes];
}
