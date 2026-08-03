"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { siteSettingsSchema } from "@/lib/validations/site-settings.schema";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function updateSiteSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: parsed.data.siteName,
      tagline: parsed.data.tagline || null,
      contact_email: parsed.data.contactEmail || null,
    })
    .eq("id", true);

  if (error) {
    return { error: "Impossible d'enregistrer les parametres." };
  }

  revalidatePath("/", "layout");
  return { success: "Parametres enregistres." };
}
