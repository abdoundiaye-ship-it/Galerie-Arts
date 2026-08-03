import { describe, expect, it } from "vitest";
import { formatPrice, slugify, generateReference, formatDate } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats XOF amounts with the FCFA suffix and no decimals", () => {
    // fr-FR groups thousands with a narrow no-break space (U+202F), not a
    // plain space — match on digits/suffix rather than the exact separator.
    const formatted = formatPrice(1500000, "XOF");
    expect(formatted.replace(/\s/g, " ")).toBe("1 500 000 FCFA");
  });

  it("returns a fallback string for null prices", () => {
    expect(formatPrice(null)).toBe("Prix sur demande");
  });

  it("formats non-XOF currencies with Intl.NumberFormat", () => {
    expect(formatPrice(100, "EUR")).toContain("100");
  });
});

describe("slugify", () => {
  it("strips accents and lowercases", () => {
    expect(slugify("Café à la Galerie")).toBe("cafe-a-la-galerie");
  });

  it("collapses non-alphanumeric runs into single hyphens", () => {
    expect(slugify("  Maitres  Senegalais!! ")).toBe("maitres-senegalais");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("-- test --")).toBe("test");
  });
});

describe("generateReference", () => {
  it("pads the index to 3 digits and includes the year", () => {
    expect(generateReference(7, 2026)).toBe("MW-2026-007");
    expect(generateReference(123, 2026)).toBe("MW-2026-123");
  });
});

describe("formatDate", () => {
  it("formats an ISO string in long French style", () => {
    const formatted = formatDate("2026-01-15T00:00:00.000Z");
    expect(formatted).toMatch(/janvier/);
    expect(formatted).toMatch(/2026/);
  });
});
