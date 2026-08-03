import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null, currency = "XOF"): string {
  if (amount === null) return "Prix sur demande";
  if (currency === "XOF") {
    return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
  }
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function generateReference(index: number, year = new Date().getFullYear()): string {
  return `MW-${year}-${String(index).padStart(3, "0")}`;
}

export interface CheckoutGroup<T> {
  key: string;
  items: T[];
}

// Cart checkouts insert one purchase_requests row per artwork, sharing a
// checkout_group_id. This regroups a flat list back into "one order, N
// items" for display — rows without a group (shouldn't happen going
// forward, but tolerated for any pre-cart data) each become their own
// singleton group.
export function groupByCheckout<T extends { checkout_group_id: string | null; id: string }>(
  rows: T[],
): CheckoutGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = row.checkout_group_id ?? row.id;
    const existing = groups.get(key);
    if (existing) existing.push(row);
    else groups.set(key, [row]);
  }
  return Array.from(groups.entries()).map(([key, items]) => ({ key, items }));
}
