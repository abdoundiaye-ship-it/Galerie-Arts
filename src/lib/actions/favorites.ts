"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function toggleFavoriteAction(artworkId: string, path: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("favorites")
    .select("artwork_id")
    .eq("user_id", user.id)
    .eq("artwork_id", artworkId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("artwork_id", artworkId);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, artwork_id: artworkId });
  }

  revalidatePath(path);
  revalidatePath("/compte");
  return { favorited: !existing };
}

export async function isFavorited(artworkId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("artwork_id")
    .eq("user_id", user.id)
    .eq("artwork_id", artworkId)
    .maybeSingle();

  return Boolean(data);
}
