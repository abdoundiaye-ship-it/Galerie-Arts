import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Artwork } from "@/types";

const ARTWORK_SELECT = `
  *,
  category:categories(id, name, slug),
  collection:collections(id, name, slug),
  images:artwork_images(*)
`;

export interface CartLine {
  artwork: Artwork;
  addedAt: string;
}

export async function getCartLines(userId: string): Promise<CartLine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select(`added_at, artwork:artworks(${ARTWORK_SELECT})`)
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.artwork)
    .map((row) => ({ artwork: row.artwork as unknown as Artwork, addedAt: row.added_at }));
}

export async function getCartCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("cart_items")
    .select("artwork_id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
