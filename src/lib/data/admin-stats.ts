import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalArtworks: number;
  publishedArtworks: number;
  totalViews: number;
  pendingUsers: number;
  pendingRequests: number;
  acceptedRequests: number;
  refusedRequests: number;
  topViewed: { reference: string; title: string; author: string; view_count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    { count: totalArtworks },
    { count: publishedArtworks },
    { data: viewRows },
    { count: pendingUsers },
    { count: pendingRequests },
    { count: acceptedRequests },
    { count: refusedRequests },
    { data: topViewed },
  ] = await Promise.all([
    supabase.from("artworks").select("id", { count: "exact", head: true }),
    supabase.from("artworks").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("artworks").select("view_count"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("purchase_requests").select("id", { count: "exact", head: true }).eq("status", "en_attente"),
    supabase.from("purchase_requests").select("id", { count: "exact", head: true }).eq("status", "acceptee"),
    supabase.from("purchase_requests").select("id", { count: "exact", head: true }).eq("status", "refusee"),
    supabase
      .from("artworks")
      .select("reference, title, author, view_count")
      .order("view_count", { ascending: false })
      .limit(5),
  ]);

  const totalViews = (viewRows ?? []).reduce((sum, row) => sum + (row.view_count ?? 0), 0);

  return {
    totalArtworks: totalArtworks ?? 0,
    publishedArtworks: publishedArtworks ?? 0,
    totalViews,
    pendingUsers: pendingUsers ?? 0,
    pendingRequests: pendingRequests ?? 0,
    acceptedRequests: acceptedRequests ?? 0,
    refusedRequests: refusedRequests ?? 0,
    topViewed: topViewed ?? [],
  };
}
