import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PurchaseRequestRow } from "@/types";

export interface AdminPurchaseRequestRow extends PurchaseRequestRow {
  artwork: { id: string; reference: string; title: string; author: string } | null;
  userEmail: string | null;
  userFullName: string | null;
}

export async function getAllPurchaseRequestsForAdmin(): Promise<AdminPurchaseRequestRow[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data, error }, { data: authUsers }] = await Promise.all([
    supabase
      .from("purchase_requests")
      .select("*, artwork:artworks(id, reference, title, author), profile:profiles(full_name)")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (error) throw error;

  const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email ?? null]) ?? []);

  return (data ?? []).map((row) => {
    const profile = row.profile as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const fullName = Array.isArray(profile) ? (profile[0]?.full_name ?? null) : (profile?.full_name ?? null);

    return {
      ...row,
      userEmail: emailById.get(row.user_id) ?? null,
      userFullName: fullName,
    } as unknown as AdminPurchaseRequestRow;
  });
}
