import "server-only";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import type { SiteSettingsRow } from "@/types";

export async function getSiteSettings(): Promise<SiteSettingsRow> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).single();

  // Falls back to the build-time constants if the row is somehow missing
  // (it's seeded by migration 00000000000010, so this is a safety net, not
  // the expected path).
  return (
    data ?? {
      id: true,
      site_name: SITE_NAME,
      tagline: SITE_TAGLINE,
      contact_email: null,
      updated_at: new Date().toISOString(),
    }
  );
}
