import type { Metadata } from "next";
import { getCategories } from "@/lib/data/categories";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/artworks";
import { SimpleTaxonomyForm } from "@/components/admin/simple-taxonomy-form";
import { DeleteTaxonomyButton } from "@/components/admin/delete-taxonomy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-semibold">Categories ({categories.length})</h1>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-md border border-border/60 p-3"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
              </div>
              <DeleteTaxonomyButton id={category.id} name={category.name} action={deleteCategoryAction} />
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle categorie</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTaxonomyForm action={createCategoryAction} submitLabel="Creer la categorie" />
        </CardContent>
      </Card>
    </div>
  );
}
