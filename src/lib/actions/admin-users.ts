"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { ProfileStatus } from "@/types/database.types";

// Uses the request-scoped (cookie-bound) Supabase client, NOT the
// service-role client: the profiles_prevent_self_role_escalation trigger
// (migration 00000000000001) checks auth.uid() against public.is_admin(),
// which only resolves correctly when the query runs as the signed-in
// admin's own session.
async function updateProfileStatus(userId: string, status: ProfileStatus, roleName: "admin" | "client_autorise" | "visiteur") {
  await requireAdmin();
  const supabase = await createClient();

  const { data: role } = await supabase.from("roles").select("id").eq("name", roleName).single();
  if (!role) throw new Error("Role introuvable");

  const { error } = await supabase
    .from("profiles")
    .update({ status, role_id: role.id })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/admin/utilisateurs");
}

export async function approveUserAction(userId: string) {
  await updateProfileStatus(userId, "client_autorise", "client_autorise");
}

export async function rejectUserAction(userId: string) {
  await updateProfileStatus(userId, "rejete", "visiteur");
}

export async function promoteToAdminAction(userId: string) {
  await updateProfileStatus(userId, "admin", "admin");
}

export async function revokeAdminAction(userId: string) {
  await updateProfileStatus(userId, "client_autorise", "client_autorise");
}
