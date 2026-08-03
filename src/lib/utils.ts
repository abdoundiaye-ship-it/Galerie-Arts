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
