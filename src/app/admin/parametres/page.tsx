import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/site-settings";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata: Metadata = { title: "Parametres du site" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Parametres du site</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
