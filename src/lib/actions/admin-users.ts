"use server";

import "server-only";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export interface ActionState {
  error?: string;
  success?: string;
  tempPassword?: string;
}

// Not meant to be memorable — shown once to the admin, who hands it to the
// user (or the user resets it themselves via "mot de passe oublie"
// afterwards). Avoids depending on Supabase's rate-limited default email
// sender for account provisioning.
function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(14);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function setRoleAndActive(userId: string, roleName: "admin" | "visiteur", isActive: boolean) {
  // Uses the request-scoped (cookie-bound) client, NOT the service-role
  // client: the profiles_prevent_self_role_escalation trigger checks
  // auth.uid() against is_admin(), which only resolves correctly when the
  // query runs as the signed-in admin's own session (see lib/auth.ts and
  // the migration 00000000000001 comment on that trigger).
  const supabase = await createClient();
  const { data: role } = await supabase.from("roles").select("id").eq("name", roleName).single();
  if (!role) throw new Error("Role introuvable");

  const { error } = await supabase
    .from("profiles")
    .update({ role_id: role.id, is_active: isActive })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/utilisateurs");
}

export async function createUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const roleName = formData.get("roleName") === "admin" ? "admin" : "visiteur";

  if (!email || !email.includes("@")) {
    return { error: "Adresse email invalide." };
  }

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  });

  if (error || !created.user) {
    return { error: error?.message ?? "Impossible de creer le compte." };
  }

  // handle_new_user already inserted a (visiteur, inactive) profile row;
  // admin-created accounts are active immediately (no approval step for
  // someone an admin is personally vouching for), and promoted if needed.
  await setRoleAndActive(created.user.id, roleName, true);

  revalidatePath("/admin/utilisateurs");
  return {
    success: `Compte cree pour ${email}.`,
    tempPassword,
  };
}

export async function resetUserPasswordAction(userId: string): Promise<ActionState> {
  await requireAdmin();

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { error } = await admin.auth.admin.updateUserById(userId, { password: tempPassword });
  if (error) return { error: error.message };

  return { success: "Mot de passe reinitialise.", tempPassword };
}

export async function activateUserAction(userId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("roles(name)").eq("id", userId).single();
  const roleRelation = profile?.roles as unknown as { name: string } | { name: string }[] | null;
  const roleName = (Array.isArray(roleRelation) ? roleRelation[0]?.name : roleRelation?.name) ?? "visiteur";
  await setRoleAndActive(userId, roleName === "admin" ? "admin" : "visiteur", true);
}

export async function deactivateUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("Vous ne pouvez pas desactiver votre propre compte.");
  }
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("roles(name)").eq("id", userId).single();
  const roleRelation = profile?.roles as unknown as { name: string } | { name: string }[] | null;
  const roleName = (Array.isArray(roleRelation) ? roleRelation[0]?.name : roleRelation?.name) ?? "visiteur";
  await setRoleAndActive(userId, roleName === "admin" ? "admin" : "visiteur", false);
}

export async function promoteToAdminAction(userId: string) {
  await requireAdmin();
  await setRoleAndActive(userId, "admin", true);
}

export async function demoteToVisitorAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("Vous ne pouvez pas retirer vos propres droits administrateur.");
  }
  await setRoleAndActive(userId, "visiteur", true);
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/admin/utilisateurs");
}
