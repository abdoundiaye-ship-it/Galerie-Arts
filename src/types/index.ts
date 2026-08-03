import type { ArtworkAvailability, Database } from "./database.types";

export type ArtworkRow = Database["public"]["Tables"]["artworks"]["Row"];
export type ArtworkImageRow = Database["public"]["Tables"]["artwork_images"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type PurchaseRequestRow = Database["public"]["Tables"]["purchase_requests"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type RoleRow = Database["public"]["Tables"]["roles"]["Row"];

export type RoleName = "admin" | "client_autorise" | "visiteur";

export interface Artwork extends ArtworkRow {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  collection: Pick<CollectionRow, "id" | "name" | "slug"> | null;
  images: ArtworkImageRow[];
}

export interface ArtworkSearchParams {
  q?: string;
  author?: string;
  year?: string;
  category?: string;
  technique?: string;
  availability?: ArtworkAvailability;
  collection?: string;
  sort?: "recent" | "prix_asc" | "prix_desc" | "annee_asc" | "annee_desc";
  page?: string;
}

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string | null;
  roleName: RoleName;
  status: ProfileRow["status"];
}
