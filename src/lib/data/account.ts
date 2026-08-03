import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Artwork, PurchaseRequestRow } from "@/types";

const ARTWORK_SELECT = `
  *,
  category:categories(id, name, slug),
  collection:collections(id, name, slug),
  images:artwork_images(*)
`;

export async function getUserFavoriteArtworks(userId: string): Promise<Artwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(`artwork:artworks(${ARTWORK_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.artwork).filter(Boolean) as unknown as Artwork[];
}

export interface PurchaseRequestWithArtwork extends PurchaseRequestRow {
  artwork: Pick<Artwork, "id" | "reference" | "title" | "author" | "price" | "currency"> | null;
}

export async function getUserPurchaseRequests(userId: string): Promise<PurchaseRequestWithArtwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_requests")
    .select("*, artwork:artworks(id, reference, title, author, price, currency)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PurchaseRequestWithArtwork[];
}
