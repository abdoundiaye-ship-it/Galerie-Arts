import { z } from "zod";

export const purchaseRequestSchema = z.object({
  artworkId: z.string().uuid(),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  proposedPrice: z.coerce.number().min(0).optional().nullable(),
});

export type PurchaseRequestInput = z.infer<typeof purchaseRequestSchema>;

export const purchaseRequestReviewSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["acceptee", "refusee"]),
  adminResponse: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type PurchaseRequestReviewInput = z.infer<typeof purchaseRequestReviewSchema>;
