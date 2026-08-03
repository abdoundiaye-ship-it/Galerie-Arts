import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/collections";
import { searchArtworks } from "@/lib/data/artworks";
import { ArtworkGrid } from "@/components/gallery/artwork-grid";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return { title: collection?.name ?? "Collection introuvable" };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const { artworks, total } = await searchArtworks({ collection: slug });

  return (
    <div className="container space-y-8 py-12">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{collection.name}</h1>
        {collection.description && <p className="mt-2 max-w-2xl text-muted-foreground">{collection.description}</p>}
        <p className="mt-1 text-sm text-muted-foreground">{total} oeuvre(s)</p>
      </div>
      <ArtworkGrid artworks={artworks} />
    </div>
  );
}
