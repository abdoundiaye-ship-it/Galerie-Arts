import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/lib/data/artworks";
import { getCategories } from "@/lib/data/categories";
import { getCollections } from "@/lib/data/collections";
import { updateArtworkAction } from "@/lib/actions/artworks";
import { ArtworkForm } from "@/components/admin/artwork-form";
import { ArtworkImageManager } from "@/components/admin/artwork-image-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Modifier une oeuvre" };

interface EditArtworkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArtworkPage({ params }: EditArtworkPageProps) {
  const { id } = await params;
  const [artwork, categories, collections] = await Promise.all([
    getArtworkById(id),
    getCategories(),
    getCollections(),
  ]);

  if (!artwork) notFound();

  const boundAction = updateArtworkAction.bind(null, artwork.id);

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-serif text-2xl font-semibold">Modifier — {artwork.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtworkImageManager artworkId={artwork.id} images={artwork.images} />
        </CardContent>
      </Card>

      <ArtworkForm action={boundAction} categories={categories} collections={collections} artwork={artwork} />
    </div>
  );
}
