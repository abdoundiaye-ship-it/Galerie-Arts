import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

// Server-only: Server Components, Server Actions, Route Handlers. Runs with
// the anon key + the caller's session cookies, so every query it makes is
// still subject to RLS as that specific user — this is NOT a privilege
// escalation path, unlike lib/supabase/admin.ts.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component (not a Server Action/Route
            // Handler) — the middleware refreshes the session instead, so
            // this is safe to ignore.
          }
        },
      },
    },
  );
}
