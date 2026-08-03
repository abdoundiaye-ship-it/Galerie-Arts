import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CollectionRow } from "@/types";

export async function getCollections(): Promise<CollectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("collections").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCollectionBySlug(slug: string): Promise<CollectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("collections").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}
