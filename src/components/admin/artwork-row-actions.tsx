"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteArtworkAction } from "@/lib/actions/artworks";

export function ArtworkRowActions({ artworkId, title }: { artworkId: string; title: string }) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Supprimer definitivement "${title}" ?`)) return;
        startTransition(async () => {
          await deleteArtworkAction(artworkId);
          router.refresh();
        });
      }}
    >
      Supprimer
    </Button>
  );
}
