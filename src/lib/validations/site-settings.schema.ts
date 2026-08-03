import { z } from "zod";

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Le nom du site est requis").max(200),
  tagline: z.string().trim().max(300).optional().or(z.literal("")),
  contactEmail: z.string().trim().email("Adresse email invalide").optional().or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
