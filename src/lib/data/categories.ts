import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow } from "@/types";

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
