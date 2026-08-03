import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

// Refreshes the Supabase auth session on every request and, for /admin
// routes, does a cheap role check as a first line of defense. RLS remains
// the real security boundary — this only avoids rendering the admin shell
// for obviously unauthorized visitors.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, roles(name)")
      .eq("id", user.id)
      .single();

    const roleRelation = profile?.roles as unknown as { name: string } | { name: string }[] | null;
    const roleName = Array.isArray(roleRelation) ? roleRelation[0]?.name : roleRelation?.name;

    // Deactivating an admin account must revoke access just as fully as
    // it revokes a visitor's purchase capability, not just block role
    // escalation — hence the is_active check here too.
    if (roleName !== "admin" || !profile?.is_active) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if ((request.nextUrl.pathname.startsWith("/compte") || request.nextUrl.pathname.startsWith("/panier")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
