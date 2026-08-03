import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CurrentUser, RoleName } from "@/types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_active, role_id, roles(name)")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const roleRelation = profile.roles as unknown as { name: RoleName } | { name: RoleName }[] | null;
  const resolvedRole: RoleName = Array.isArray(roleRelation)
    ? (roleRelation[0]?.name ?? "visiteur")
    : (roleRelation?.name ?? "visiteur");

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    roleName: resolvedRole,
    isAdmin: resolvedRole === "admin",
    isActive: profile.is_active,
  };
}

// Admin routes/actions require BOTH role=admin and is_active — deactivating
// an account (including an admin's) must fully revoke access, not just
// suspend the "purchase" capability that is_active also gates for visitors.
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin || !user.isActive) {
    throw new Error("Acces reserve aux administrateurs");
  }
  return user;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentification requise");
  }
  return user;
}

export async function requireActiveUser(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isActive) {
    throw new Error(
      "Votre compte doit d'abord etre active par un administrateur pour effectuer cette action.",
    );
  }
  return user;
}
