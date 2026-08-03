import { z } from "zod";

const currentYear = new Date().getFullYear();

export const artworkSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(3, "La reference est requise")
    .max(60)
    .regex(/^[A-Za-z0-9-]+$/, "Lettres, chiffres et tirets uniquement"),
  title: z.string().trim().min(1, "Le titre est requis").max(300),
  author: z.string().trim().min(1, "L'auteur est requis").max(200),
  technique: z.string().trim().max(200).optional().or(z.literal("")),
  dimensions: z.string().trim().max(100).optional().or(z.literal("")),
  year: z
    .coerce.number()
    .int()
    .min(1400)
    .max(currentYear + 1)
    .optional()
    .nullable(),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().trim().length(3).default("XOF"),
  availability: z.enum(["disponible", "reserve", "vendu"]).default("disponible"),
  categoryId: z.string().uuid().optional().nullable(),
  collectionId: z.string().uuid().optional().nullable(),
  isPublished: z.boolean().default(false),
  isProtected: z.boolean().default(true),
});

export type ArtworkInput = z.infer<typeof artworkSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
