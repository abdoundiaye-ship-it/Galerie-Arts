import type { Metadata } from "next";
import { getCategories } from "@/lib/data/categories";
import { getCollections } from "@/lib/data/collections";
import { createArtworkAction } from "@/lib/actions/artworks";
import { ArtworkForm } from "@/components/admin/artwork-form";

export const metadata: Metadata = { title: "Nouvelle oeuvre" };

export default async function NewArtworkPage() {
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Ajouter une oeuvre</h1>
      <ArtworkForm action={createArtworkAction} categories={categories} collections={collections} />
    </div>
  );
}
