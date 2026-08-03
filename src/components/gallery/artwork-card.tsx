"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

// Deterministic small tilt per artwork (not random on every render) so
// cards read like unevenly hung frames on a gallery wall — a subtle nod
// to a real salon hang rather than a sterile uniform grid.
function baseTilt(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ((hash % 300) / 100) - 1.5; // range: -1.5deg .. 1.5deg
}

interface ArtworkCardProps {
  artwork: Artwork;
  /** "wall" lets each frame keep its natural aspect ratio (varied heights,
   *  salon-style hang) instead of the uniform grid's fixed 4:5 crop. */
  variant?: "grid" | "wall";
}

export function ArtworkCard({ artwork, variant = "grid" }: ArtworkCardProps) {
  const primaryImage = getPrimaryImage(artwork.images);
  const tilt = baseTilt(artwork.id);
  const isWall = variant === "wall";

  return (
    <motion.div
      initial={{ rotate: tilt }}
      whileHover={{ rotate: 0, y: -8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="[perspective:1000px]"
    >
      <Link
        href={`/galerie/${artwork.reference}`}
        className="group block overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/20"
      >
        <div
          className={`relative w-full overflow-hidden bg-muted protected-zone ${isWall ? "" : "aspect-[4/5]"}`}
        >
          {primaryImage ? (
            isWall ? (
              <Image
                src={getPublicThumbnailUrl(primaryImage.thumbnail_path)}
                alt={`${artwork.title} — ${artwork.author}`}
                width={primaryImage.width ?? 800}
                height={primaryImage.height ?? 1000}
                draggable={false}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="protected-image h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                src={getPublicThumbnailUrl(primaryImage.thumbnail_path)}
                alt={`${artwork.title} — ${artwork.author}`}
                fill
                draggable={false}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="protected-image object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
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
    </motion.div>
  );
}
