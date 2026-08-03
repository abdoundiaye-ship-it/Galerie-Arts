"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicThumbnailUrl } from "@/lib/storage";
import { uploadArtworkImageAction, deleteArtworkImageAction } from "@/lib/actions/artworks";
import { useToast } from "@/hooks/use-toast";
import type { ArtworkImageRow } from "@/types";

export function ArtworkImageManager({ artworkId, images }: { artworkId: string; images: ArtworkImageRow[] }) {
  const [pending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadArtworkImageAction(artworkId, formData);
      toast({ description: result.success ?? result.error, variant: result.error ? "destructive" : "default" });
      router.refresh();
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(imageId: string) {
    if (!window.confirm("Supprimer cette image ?")) return;
    startTransition(async () => {
      await deleteArtworkImageAction(imageId, artworkId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="space-y-2">
            <div
              className={`relative aspect-square overflow-hidden rounded-md border ${
                image.is_primary ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-background" : ""
              }`}
            >
              <Image src={getPublicThumbnailUrl(image.thumbnail_path)} alt="" fill className="object-cover" />
            </div>
            {image.is_primary && <p className="text-center text-xs text-muted-foreground">Image principale</p>}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive"
              disabled={pending}
              onClick={() => handleDelete(image.id)}
            >
              Supprimer
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} disabled={pending} />
        <p className="mt-1 text-xs text-muted-foreground">
          L&apos;image est automatiquement declinee en versions affichage et vignette (WebP).
        </p>
      </div>
    </div>
  );
}
