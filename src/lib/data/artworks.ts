import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ARTWORKS_PAGE_SIZE } from "@/lib/constants";
import type { Artwork, ArtworkSearchParams } from "@/types";

const ARTWORK_SELECT = `
  *,
  category:categories(id, name, slug),
  collection:collections(id, name, slug),
  images:artwork_images(*)
`;

export interface ArtworkListResult {
  artworks: Artwork[];
  total: number;
  page: number;
  pageSize: number;
}

export async function searchArtworks(params: ArtworkSearchParams): Promise<ArtworkListResult> {
  const supabase = await createClient();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = ARTWORKS_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Resolve slug filters to ids first: filtering on an embedded resource's
  // column via PostgREST needs an inner-join hint and behaves inconsistently
  // combined with count: "exact", so a direct id lookup is simpler and fast
  // (categories/collections are tiny, indexed-by-slug tables).
  let categoryId: string | undefined;
  if (params.category) {
    const { data } = await supabase.from("categories").select("id").eq("slug", params.category).maybeSingle();
    categoryId = data?.id;
  }
  let collectionId: string | undefined;
  if (params.collection) {
    const { data } = await supabase.from("collections").select("id").eq("slug", params.collection).maybeSingle();
    collectionId = data?.id;
  }

  let query = supabase.from("artworks").select(ARTWORK_SELECT, { count: "exact" });

  if (params.q) {
    const term = params.q.trim();
    query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%,technique.ilike.%${term}%`);
  }
  if (params.author) query = query.ilike("author", `%${params.author}%`);
  if (params.technique) query = query.ilike("technique", `%${params.technique}%`);
  if (params.year) query = query.eq("year", Number(params.year));
  if (params.availability) query = query.eq("availability", params.availability);
  if (params.category) query = query.eq("category_id", categoryId ?? "00000000-0000-0000-0000-000000000000");
  if (params.collection) query = query.eq("collection_id", collectionId ?? "00000000-0000-0000-0000-000000000000");

  switch (params.sort) {
    case "prix_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "prix_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "annee_asc":
      query = query.order("year", { ascending: true, nullsFirst: false });
      break;
    case "annee_desc":
      query = query.order("year", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    artworks: (data ?? []) as unknown as Artwork[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getFeaturedArtworks(limit = 6): Promise<Artwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Artwork[];
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("artworks").select(ARTWORK_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as unknown as Artwork | null;
}

export async function getArtworkByReference(reference: string): Promise<Artwork | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_SELECT)
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Artwork | null;
}

export async function getAllArtworksForAdmin(): Promise<Artwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Artwork[];
}

export async function getDistinctYears(): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("year")
    .eq("is_published", true)
    .not("year", "is", null);

  if (error) throw error;
  const years = Array.from(new Set((data ?? []).map((row) => row.year as number)));
  return years.sort((a, b) => b - a);
}
