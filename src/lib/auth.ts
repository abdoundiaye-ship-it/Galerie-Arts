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
    .select("full_name, status, role_id, roles(name)")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const roleName = (
    profile.roles as unknown as { name: RoleName } | { name: RoleName }[] | null
  );
  const resolvedRole: RoleName = Array.isArray(roleName)
    ? (roleName[0]?.name ?? "visiteur")
    : (roleName?.name ?? "visiteur");

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    roleName: resolvedRole,
    status: profile.status,
  };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.status !== "admin") {
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
