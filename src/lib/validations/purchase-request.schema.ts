import { z } from "zod";

export const checkoutSchema = z.object({
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const purchaseRequestReviewSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["acceptee", "refusee"]),
  adminResponse: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type PurchaseRequestReviewInput = z.infer<typeof purchaseRequestReviewSchema>;
