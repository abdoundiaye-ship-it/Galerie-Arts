import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const RLS_TEST_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
export const RLS_TEST_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const RLS_TEST_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasLocalSupabaseEnv = Boolean(RLS_TEST_ANON_KEY && RLS_TEST_SERVICE_ROLE_KEY);

export function createAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(RLS_TEST_URL, RLS_TEST_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createAnonClient(): SupabaseClient<Database> {
  return createClient<Database>(RLS_TEST_URL, RLS_TEST_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createSignedInClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const client = createAnonClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}
