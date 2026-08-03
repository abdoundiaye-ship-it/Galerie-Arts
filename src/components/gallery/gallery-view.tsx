"use client";

import * as React from "react";
import { LayoutGrid, GalleryVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtworkGrid } from "@/components/gallery/artwork-grid";
import { ArtworkWall } from "@/components/gallery/artwork-wall";
import type { Artwork } from "@/types";

export function GalleryView({ artworks }: { artworks: Artwork[] }) {
  const [mode, setMode] = React.useState<"grid" | "wall">("grid");

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-1 rounded-md border border-border/60 bg-card p-1 sm:w-fit sm:self-end">
        <Button
          type="button"
          size="sm"
          variant={mode === "grid" ? "secondary" : "ghost"}
          className="gap-2"
          onClick={() => setMode("grid")}
          aria-pressed={mode === "grid"}
        >
          <LayoutGrid className="h-4 w-4" /> Grille
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "wall" ? "secondary" : "ghost"}
          className="gap-2"
          onClick={() => setMode("wall")}
          aria-pressed={mode === "wall"}
        >
          <GalleryVertical className="h-4 w-4" /> Mur
        </Button>
      </div>

      {mode === "grid" ? <ArtworkGrid artworks={artworks} /> : <ArtworkWall artworks={artworks} />}
    </div>
  );
}
