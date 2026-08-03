"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { purchaseRequestReviewSchema } from "@/lib/validations/purchase-request.schema";

export interface ActionState {
  error?: string;
  success?: string;
}

// Single-artwork submission has been superseded by the cart checkout flow
// (see lib/actions/cart.ts: addToCartAction + checkoutCartAction), which
// groups one or more artworks into a single purchase_requests batch via
// checkout_group_id. This file keeps the parts of the lifecycle that still
// apply per-request regardless of how it was created: cancelling your own,
// and admin review.

export async function cancelPurchaseRequestAction(requestId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase
    .from("purchase_requests")
    .update({ status: "annulee" })
    .eq("id", requestId)
    .eq("user_id", user.id)
    .eq("status", "en_attente");

  revalidatePath("/compte");
}

export async function reviewPurchaseRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = purchaseRequestReviewSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    adminResponse: formData.get("adminResponse"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_requests")
    .update({ status: parsed.data.status, admin_response: parsed.data.adminResponse || null })
    .eq("id", parsed.data.requestId);

  if (error) {
    return { error: "Impossible de mettre a jour la demande." };
  }

  revalidatePath("/admin/demandes");
  return { success: "Demande mise a jour." };
}
