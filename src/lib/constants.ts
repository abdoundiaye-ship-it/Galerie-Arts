export const SITE_NAME = "Makhete Wade — Galerie d'Art Virtuelle";
export const SITE_TAGLINE = "Presenter, Admirer, Acquerir";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const DEFAULT_CURRENCY = "XOF";

export const ARTWORKS_PAGE_SIZE = 12;

export const AVAILABILITY_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reserve: "Reserve",
  vendu: "Vendu",
};

export const PURCHASE_REQUEST_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptee",
  refusee: "Refusee",
  annulee: "Annulee",
};

export const PROFILE_STATUS_LABELS: Record<string, string> = {
  en_attente_validation: "En attente de validation",
  client_autorise: "Client autorise",
  rejete: "Rejete",
  admin: "Administrateur",
};

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "recent", label: "Plus recent" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix decroissant" },
  { value: "annee_asc", label: "Annee (ancien -> recent)" },
  { value: "annee_desc", label: "Annee (recent -> ancien)" },
];

// Signed URL TTL for the private "display" bucket — short enough that a
// leaked URL becomes useless within a minute.
export const DISPLAY_IMAGE_SIGNED_URL_TTL_SECONDS = 60;

export const IMAGE_ROUTE_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 60,
};
