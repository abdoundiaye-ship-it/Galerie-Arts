"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser, requireUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/purchase-request.schema";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function addToCartAction(artworkId: string): Promise<ActionState> {
  const user = await requireActiveUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("cart_items")
    .upsert({ user_id: user.id, artwork_id: artworkId }, { onConflict: "user_id,artwork_id", ignoreDuplicates: true });

  if (error) return { error: "Impossible d'ajouter au panier." };

  revalidatePath("/panier");
  return { success: "Ajoute au panier." };
}

export async function removeFromCartAction(artworkId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("user_id", user.id).eq("artwork_id", artworkId);
  revalidatePath("/panier");
}

export async function checkoutCartAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireActiveUser();
  const supabase = await createClient();

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("artwork_id")
    .eq("user_id", user.id);

  if (cartError) return { error: "Impossible de lire le panier." };
  if (!cartItems || cartItems.length === 0) return { error: "Votre panier est vide." };

  const parsed = checkoutSchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const message = parsed.data.message || null;
  const checkoutGroupId = crypto.randomUUID();

  const { error: insertError } = await supabase.from("purchase_requests").insert(
    cartItems.map((item) => ({
      artwork_id: item.artwork_id,
      user_id: user.id,
      message,
      checkout_group_id: checkoutGroupId,
    })),
  );

  if (insertError) {
    return { error: "Impossible d'envoyer la demande. Reessayez." };
  }

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  const admin = createAdminClient();
  admin
    .from("activity_logs")
    .insert({
      user_id: user.id,
      action: "cart.checkout",
      entity_type: "purchase_request_group",
      entity_id: null,
      metadata: { checkout_group_id: checkoutGroupId, artwork_count: cartItems.length },
    })
    .then(undefined, () => undefined);

  revalidatePath("/compte");
  revalidatePath("/panier");
  return { success: "Votre demande a bien ete envoyee. Un administrateur vous recontactera." };
}
