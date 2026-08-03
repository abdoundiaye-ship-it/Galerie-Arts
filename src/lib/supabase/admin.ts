import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// DANGER: this client uses the service-role key and bypasses RLS entirely.
// Never import this file from a Client Component or expose its output to
// the browser. Reserved for: activity_logs writes, minting signed URLs /
// compositing watermarks for the display bucket, and the one-off ingestion
// script. Every other read/write should go through lib/supabase/server.ts
// so RLS stays the actual security boundary.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
