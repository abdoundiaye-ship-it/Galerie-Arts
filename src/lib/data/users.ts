import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProfileStatus } from "@/types/database.types";

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  status: ProfileStatus;
  roleName: string;
  createdAt: string;
}

// Merges public.profiles (readable via RLS as the calling admin) with
// auth.users emails (only available through the service-role Admin API —
// there is no public.users table by design, per the schema's `profiles`
// table being the sole source of app-facing user data).
export async function getAllUsersForAdmin(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profiles, error }, { data: authUsers }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone, status, roles(name), created_at").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (error) throw error;

  const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email ?? null]) ?? []);

  return (profiles ?? []).map((profile) => {
    const roleRelation = profile.roles as unknown as { name: string } | { name: string }[] | null;
    const roleName = Array.isArray(roleRelation) ? (roleRelation[0]?.name ?? "visiteur") : (roleRelation?.name ?? "visiteur");

    return {
      id: profile.id,
      email: emailById.get(profile.id) ?? null,
      fullName: profile.full_name,
      phone: profile.phone,
      status: profile.status,
      roleName,
      createdAt: profile.created_at,
    };
  });
}
