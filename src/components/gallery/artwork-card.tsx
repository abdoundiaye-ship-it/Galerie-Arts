import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AVAILABILITY_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { getPrimaryImage, getPublicThumbnailUrl } from "@/lib/storage";
import type { Artwork } from "@/types";

const AVAILABILITY_VARIANT: Record<string, "success" | "secondary" | "outline"> = {
  disponible: "success",
  reserve: "secondary",
  vendu: "outline",
};

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const primaryImage = getPrimaryImage(artwork.images);

  return (
    <Link
      href={`/galerie/${artwork.reference}`}
      className="group block overflow-hidden rounded-lg border border-border/60 bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted protected-zone">
        {primaryImage ? (
          <Image
            src={getPublicThumbnailUrl(primaryImage.thumbnail_path)}
            alt={`${artwork.title} — ${artwork.author}`}
            fill
            draggable={false}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="protected-image object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Image indisponible
          </div>
        )}
        <Badge
          variant={AVAILABILITY_VARIANT[artwork.availability]}
          className="absolute right-3 top-3"
        >
          {AVAILABILITY_LABELS[artwork.availability]}
        </Badge>
      </div>
      <div className="space-y-1 p-4">
        <p className="truncate font-serif text-base font-semibold">{artwork.title}</p>
        <p className="truncate text-sm text-muted-foreground">{artwork.author}</p>
        <p className="text-sm font-medium text-gold-600 dark:text-gold-400">
          {formatPrice(artwork.price, artwork.currency)}
        </p>
      </div>
    </Link>
  );
}
