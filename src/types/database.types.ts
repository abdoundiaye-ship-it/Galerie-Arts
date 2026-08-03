// Hand-authored to match supabase/migrations/*.sql. Once you have a live
// project linked, regenerate the authoritative version with:
//   npm run supabase:types
// and keep this file in sync — this is a scaffold, not a guarantee.
//
// `Relationships: []` on every table is required by @supabase/postgrest-js's
// GenericTable constraint (Row/Insert/Update/Relationships) — omitting it
// makes the whole Database type fail to structurally match, and every query
// builder method silently degrades to `never` with no type error at the
// call site. Left empty here since embedded-resource selects in this
// codebase are cast manually (see lib/data/*.ts) rather than relying on
// postgrest-js's relationship-based return-type inference.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProfileStatus = "en_attente_validation" | "client_autorise" | "rejete" | "admin";
export type ArtworkAvailability = "disponible" | "reserve" | "vendu";
export type PurchaseRequestStatus = "en_attente" | "acceptee" | "refusee" | "annulee";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: number; name: string; description: string | null };
        Insert: { id?: number; name: string; description?: string | null };
        Update: { id?: number; name?: string; description?: string | null };
        Relationships: [];
      };
      permissions: {
        Row: { id: number; code: string; description: string | null };
        Insert: { id?: number; code: string; description?: string | null };
        Update: { id?: number; code?: string; description?: string | null };
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: number; permission_id: number };
        Insert: { role_id: number; permission_id: number };
        Update: { role_id?: number; permission_id?: number };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role_id: number;
          status: ProfileStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role_id: number;
          status?: ProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          role_id?: number;
          status?: ProfileStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: { id: string; name: string; slug: string; description: string | null; created_at: string };
        Insert: { id?: string; name: string; slug: string; description?: string | null; created_at?: string };
        Update: { name?: string; slug?: string; description?: string | null };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          cover_image_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          cover_image_path?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          cover_image_path?: string | null;
        };
        Relationships: [];
      };
      artworks: {
        Row: {
          id: string;
          reference: string;
          title: string;
          author: string;
          technique: string | null;
          dimensions: string | null;
          year: number | null;
          description: string | null;
          price: number | null;
          currency: string;
          availability: ArtworkAvailability;
          category_id: string | null;
          collection_id: string | null;
          is_published: boolean;
          is_protected: boolean;
          view_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          title: string;
          author: string;
          technique?: string | null;
          dimensions?: string | null;
          year?: number | null;
          description?: string | null;
          price?: number | null;
          currency?: string;
          availability?: ArtworkAvailability;
          category_id?: string | null;
          collection_id?: string | null;
          is_published?: boolean;
          is_protected?: boolean;
          view_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["artworks"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "artworks_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artworks_collection_id_fkey";
            columns: ["collection_id"];
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      artwork_images: {
        Row: {
          id: string;
          artwork_id: string;
          storage_path: string;
          display_path: string;
          thumbnail_path: string;
          is_primary: boolean;
          sort_order: number;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          artwork_id: string;
          storage_path: string;
          display_path: string;
          thumbnail_path: string;
          is_primary?: boolean;
          sort_order?: number;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["artwork_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "artwork_images_artwork_id_fkey";
            columns: ["artwork_id"];
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: { user_id: string; artwork_id: string; created_at: string };
        Insert: { user_id: string; artwork_id: string; created_at?: string };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "favorites_artwork_id_fkey";
            columns: ["artwork_id"];
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_requests: {
        Row: {
          id: string;
          artwork_id: string;
          user_id: string;
          message: string | null;
          proposed_price: number | null;
          status: PurchaseRequestStatus;
          admin_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artwork_id: string;
          user_id: string;
          message?: string | null;
          proposed_price?: number | null;
          status?: PurchaseRequestStatus;
          admin_response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchase_requests"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "purchase_requests_artwork_id_fkey";
            columns: ["artwork_id"];
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_requests_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          purchase_request_id: string | null;
          artwork_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: OrderStatus;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_request_id?: string | null;
          artwork_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?: OrderStatus;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean };
      is_client_autorise: { Args: { uid: string }; Returns: boolean };
      increment_artwork_view: { Args: { artwork_reference: string }; Returns: undefined };
    };
    Enums: {
      profile_status: ProfileStatus;
      artwork_availability: ArtworkAvailability;
      purchase_request_status: PurchaseRequestStatus;
      order_status: OrderStatus;
    };
  };
}
