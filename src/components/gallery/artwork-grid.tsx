import { ArtworkCard } from "@/components/gallery/artwork-card";
import type { Artwork } from "@/types";

export function ArtworkGrid({ artworks }: { artworks: Artwork[] }) {
  if (artworks.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
        Aucune oeuvre ne correspond a votre recherche.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {artworks.map((artwork, index) => (
        <div
          key={artwork.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: "backwards" }}
        >
          <ArtworkCard artwork={artwork} />
        </div>
      ))}
    </div>
  );
}
