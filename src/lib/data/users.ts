import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
  roleName: string;
  createdAt: string;
  /** Sourced from auth.users (Supabase Auth already tracks this reliably)
   *  rather than duplicated into profiles. */
  lastSignInAt: string | null;
}

// Merges public.profiles (readable via RLS as the calling admin) with
// auth.users emails/last-sign-in (only available through the service-role
// Admin API — there is no public.users table by design, per the schema's
// `profiles` table being the sole source of app-facing user data).
export async function getAllUsersForAdmin(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profiles, error }, { data: authUsers }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, is_active, roles(name), created_at")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (error) throw error;

  const authById = new Map(authUsers?.users.map((u) => [u.id, u]) ?? []);

  return (profiles ?? []).map((profile) => {
    const roleRelation = profile.roles as unknown as { name: string } | { name: string }[] | null;
    const roleName = Array.isArray(roleRelation) ? (roleRelation[0]?.name ?? "visiteur") : (roleRelation?.name ?? "visiteur");
    const authUser = authById.get(profile.id);

    return {
      id: profile.id,
      email: authUser?.email ?? null,
      fullName: profile.full_name,
      phone: profile.phone,
      isActive: profile.is_active,
      roleName,
      createdAt: profile.created_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
    };
  });
}
