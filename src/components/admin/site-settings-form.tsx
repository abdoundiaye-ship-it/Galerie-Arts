"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { updateSiteSettingsAction, type ActionState } from "@/lib/actions/site-settings";
import type { SiteSettingsRow } from "@/types";

const initialState: ActionState = {};

export function SiteSettingsForm({ settings }: { settings: SiteSettingsRow }) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="siteName">Nom du site</Label>
        <Input id="siteName" name="siteName" defaultValue={settings.site_name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tagline">Accroche</Label>
        <Input id="tagline" name="tagline" defaultValue={settings.tagline ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Email de contact public</Label>
        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contact_email ?? ""} />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold">Enregistrer</SubmitButton>
    </form>
  );
}
