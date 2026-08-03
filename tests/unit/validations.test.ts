import { describe, expect, it } from "vitest";
import { artworkSchema } from "@/lib/validations/artwork.schema";
import { signUpSchema } from "@/lib/validations/auth.schema";
import { purchaseRequestSchema } from "@/lib/validations/purchase-request.schema";

describe("artworkSchema", () => {
  const base = {
    reference: "MW-0001",
    title: "Vase aux oiseaux",
    author: "Alpha Sow",
    currency: "XOF",
  };

  it("accepts a minimal valid artwork", () => {
    const result = artworkSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects a reference with invalid characters", () => {
    const result = artworkSchema.safeParse({ ...base, reference: "MW 0001!" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = artworkSchema.safeParse({ ...base, price: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects a year far in the future", () => {
    const result = artworkSchema.safeParse({ ...base, year: 3000 });
    expect(result.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("requires a mix of upper/lowercase and digits in the password", () => {
    const weak = signUpSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "alllowercase",
    });
    expect(weak.success).toBe(false);

    const strong = signUpSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "Str0ngPass",
    });
    expect(strong.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      fullName: "Test User",
      email: "not-an-email",
      password: "Str0ngPass",
    });
    expect(result.success).toBe(false);
  });
});

describe("purchaseRequestSchema", () => {
  it("accepts a request with only an artworkId", () => {
    const result = purchaseRequestSchema.safeParse({ artworkId: "00000000-0000-0000-0000-000000000000" });
    expect(result.success).toBe(true);
  });

  it("rejects a non-uuid artworkId", () => {
    const result = purchaseRequestSchema.safeParse({ artworkId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative proposed price", () => {
    const result = purchaseRequestSchema.safeParse({
      artworkId: "00000000-0000-0000-0000-000000000000",
      proposedPrice: -5,
    });
    expect(result.success).toBe(false);
  });
});
