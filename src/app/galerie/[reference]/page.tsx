import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtworkByReference } from "@/lib/data/artworks";
import { getCurrentUser } from "@/lib/auth";
import { isFavorited } from "@/lib/actions/favorites";
import { ProtectedImage } from "@/components/gallery/protected-image";
import { FavoriteButton } from "@/components/gallery/favorite-button";
import { AddToCartButton } from "@/components/gallery/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { AVAILABILITY_LABELS, SITE_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { getPublicThumbnailUrl, getPrimaryImage } from "@/lib/storage";

interface ArtworkPageProps {
  params: Promise<{ reference: string }>;
}

const AVAILABILITY_VARIANT: Record<string, "success" | "secondary" | "outline"> = {
  disponible: "success",
  reserve: "secondary",
  vendu: "outline",
};

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const { reference } = await params;
  const artwork = await getArtworkByReference(reference);
  if (!artwork) return { title: "Oeuvre introuvable" };

  const primaryImage = getPrimaryImage(artwork.images);
  const ogImage = primaryImage ? getPublicThumbnailUrl(primaryImage.thumbnail_path) : undefined;

  return {
    title: `${artwork.title} — ${artwork.author}`,
    description: artwork.description ?? `${artwork.title} par ${artwork.author}, ${artwork.technique ?? ""}`,
    openGraph: {
      title: `${artwork.title} — ${artwork.author}`,
      description: artwork.description ?? undefined,
      images: ogImage ? [ogImage] : undefined,
      url: `${SITE_URL}/galerie/${artwork.reference}`,
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { reference } = await params;
  const artwork = await getArtworkByReference(reference);

  if (!artwork || !artwork.is_published) {
    const user = await getCurrentUser();
    if (!artwork || !user?.isAdmin) notFound();
  }

  if (!artwork) notFound();

  const [user, favorited] = await Promise.all([getCurrentUser(), isFavorited(artwork.id)]);
  const path = `/galerie/${artwork.reference}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    creator: { "@type": "Person", name: artwork.author },
    artMedium: artwork.technique ?? undefined,
    dateCreated: artwork.year ? String(artwork.year) : undefined,
    description: artwork.description ?? undefined,
  };

  return (
    <div className="container grid gap-10 py-12 lg:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="protected-zone">
        <ProtectedImage
          reference={artwork.reference}
          alt={`${artwork.title} — ${artwork.author}`}
          className="aspect-[4/5] w-full rounded-lg border border-border/60"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Image protegee — clic droit, glisser-deposer et impression desactives.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Badge variant={AVAILABILITY_VARIANT[artwork.availability]}>
            {AVAILABILITY_LABELS[artwork.availability]}
          </Badge>
          <h1 className="mt-3 font-serif text-3xl font-semibold">{artwork.title}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{artwork.author}</p>
        </div>

        <p className="text-2xl font-semibold text-gold-600 dark:text-gold-400">
          {formatPrice(artwork.price, artwork.currency)}
        </p>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border/60 bg-secondary/30 p-4 text-sm">
          {artwork.technique && (
            <div>
              <dt className="text-muted-foreground">Technique</dt>
              <dd className="font-medium">{artwork.technique}</dd>
            </div>
          )}
          {artwork.dimensions && (
            <div>
              <dt className="text-muted-foreground">Dimensions</dt>
              <dd className="font-medium">{artwork.dimensions}</dd>
            </div>
          )}
          {artwork.year && (
            <div>
              <dt className="text-muted-foreground">Annee</dt>
              <dd className="font-medium">{artwork.year}</dd>
            </div>
          )}
          {artwork.category && (
            <div>
              <dt className="text-muted-foreground">Categorie</dt>
              <dd className="font-medium">{artwork.category.name}</dd>
            </div>
          )}
          {artwork.collection && (
            <div>
              <dt className="text-muted-foreground">Collection</dt>
              <dd className="font-medium">{artwork.collection.name}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Reference</dt>
            <dd className="font-medium">{artwork.reference}</dd>
          </div>
        </dl>

        {artwork.description && (
          <div>
            <h2 className="font-serif text-lg font-semibold">Commentaire</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{artwork.description}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {artwork.availability === "disponible" && (
            <AddToCartButton
              artworkId={artwork.id}
              isAuthenticated={Boolean(user)}
              isActive={user?.isActive ?? false}
              path={path}
            />
          )}
          <FavoriteButton
            artworkId={artwork.id}
            initialFavorited={favorited}
            isAuthenticated={Boolean(user)}
            path={path}
          />
        </div>
      </div>
    </div>
  );
}
