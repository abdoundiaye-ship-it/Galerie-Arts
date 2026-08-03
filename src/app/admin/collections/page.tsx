import type { Metadata } from "next";
import { getCollections } from "@/lib/data/collections";
import { createCollectionAction, deleteCollectionAction } from "@/lib/actions/artworks";
import { SimpleTaxonomyForm } from "@/components/admin/simple-taxonomy-form";
import { DeleteTaxonomyButton } from "@/components/admin/delete-taxonomy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-semibold">Collections ({collections.length})</h1>
        <div className="space-y-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between rounded-md border border-border/60 p-3"
            >
              <div>
                <p className="font-medium">{collection.name}</p>
                {collection.description && (
                  <p className="text-sm text-muted-foreground">{collection.description}</p>
                )}
              </div>
              <DeleteTaxonomyButton id={collection.id} name={collection.name} action={deleteCollectionAction} />
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle collection</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTaxonomyForm action={createCollectionAction} submitLabel="Creer la collection" />
        </CardContent>
      </Card>
    </div>
  );
}
