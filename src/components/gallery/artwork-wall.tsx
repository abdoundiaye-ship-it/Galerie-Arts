import { ArtworkCard } from "@/components/gallery/artwork-card";
import type { Artwork } from "@/types";

// Salon-style "hang" — a CSS multi-column layout instead of a uniform
// grid, so frames read at slightly different heights like a real gallery
// wall. Pairs with ArtworkCard's own per-card tilt/hover lift.
export function ArtworkWall({ artworks }: { artworks: Artwork[] }) {
  return (
    <div className="columns-2 gap-6 sm:columns-3 lg:columns-4 [column-fill:_balance]">
      {artworks.map((artwork, index) => (
        <div
          key={artwork.id}
          className="mb-6 break-inside-avoid animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: "backwards" }}
        >
          <ArtworkCard artwork={artwork} variant="wall" />
        </div>
      ))}
    </div>
  );
}
