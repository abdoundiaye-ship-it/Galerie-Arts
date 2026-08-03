import type { Metadata } from "next";
import { searchArtworks, getDistinctYears } from "@/lib/data/artworks";
import { getCategories } from "@/lib/data/categories";
import { GalleryView } from "@/components/gallery/gallery-view";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { Pagination } from "@/components/gallery/pagination";
import type { ArtworkSearchParams } from "@/types";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Parcourez le catalogue complet des oeuvres disponibles a la galerie Makhete Wade.",
};

interface GaleriePageProps {
  searchParams: Promise<ArtworkSearchParams>;
}

export default async function GaleriePage({ searchParams }: GaleriePageProps) {
  const params = await searchParams;
  const [{ artworks, total, page, pageSize }, categories, years] = await Promise.all([
    searchArtworks(params),
    getCategories(),
    getDistinctYears(),
  ]);

  return (
    <div className="container space-y-8 py-12">
      <div>
        <h1 className="font-serif text-3xl font-semibold">La galerie</h1>
        <p className="mt-1 text-muted-foreground">{total} oeuvre(s) trouvee(s)</p>
      </div>

      <GalleryFilters categories={categories} years={years} />

      <GalleryView artworks={artworks} />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        searchParams={params as Record<string, string | undefined>}
      />
    </div>
  );
}
