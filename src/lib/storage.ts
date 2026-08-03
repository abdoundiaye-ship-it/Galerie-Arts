const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export function getPublicThumbnailUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/artworks-thumbnail/${path}`;
}

export function getPublicBrandingUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/branding/${path}`;
}

export function getPrimaryImage<T extends { is_primary: boolean; sort_order: number }>(
  images: T[],
): T | undefined {
  return [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0];
}
