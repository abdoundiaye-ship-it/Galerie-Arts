import { describe, expect, it } from "vitest";
import { artworkSchema } from "@/lib/validations/artwork.schema";
import { signUpSchema } from "@/lib/validations/auth.schema";
import { checkoutSchema } from "@/lib/validations/purchase-request.schema";

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

describe("checkoutSchema", () => {
  it("accepts an empty message", () => {
    const result = checkoutSchema.safeParse({ message: "" });
    expect(result.success).toBe(true);
  });

  it("accepts a message", () => {
    const result = checkoutSchema.safeParse({ message: "Livraison a Dakar si possible" });
    expect(result.success).toBe(true);
  });

  it("rejects a message over 2000 characters", () => {
    const result = checkoutSchema.safeParse({ message: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
