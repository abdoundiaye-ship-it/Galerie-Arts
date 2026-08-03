"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/auth";
import {
  purchaseRequestSchema,
  purchaseRequestReviewSchema,
} from "@/lib/validations/purchase-request.schema";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function submitPurchaseRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  if (user.status !== "client_autorise" && user.status !== "admin") {
    return {
      error:
        "Votre compte doit d'abord etre valide par un administrateur avant de pouvoir envoyer une demande d'achat.",
    };
  }

  const parsed = purchaseRequestSchema.safeParse({
    artworkId: formData.get("artworkId"),
    message: formData.get("message"),
    proposedPrice: formData.get("proposedPrice") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("purchase_requests").insert({
    artwork_id: parsed.data.artworkId,
    user_id: user.id,
    message: parsed.data.message || null,
    proposed_price: parsed.data.proposedPrice ?? null,
  });

  if (error) {
    return { error: "Impossible d'envoyer la demande. Reessayez." };
  }

  const admin = createAdminClient();
  admin
    .from("activity_logs")
    .insert({
      user_id: user.id,
      action: "purchase_request.created",
      entity_type: "artwork",
      entity_id: parsed.data.artworkId,
      metadata: {},
    })
    .then(undefined, () => undefined);

  revalidatePath("/compte");
  return { success: "Votre demande a bien ete envoyee. Un administrateur vous recontactera." };
}

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
