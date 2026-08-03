"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import type { ActionState } from "@/lib/actions/artworks";
import type { ArtworkRow, CategoryRow, CollectionRow } from "@/types";

interface ArtworkFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: CategoryRow[];
  collections: CollectionRow[];
  artwork?: ArtworkRow;
}

const initialState: ActionState = {};

export function ArtworkForm({ action, categories, collections, artwork }: ArtworkFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" name="reference" defaultValue={artwork?.reference} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input id="title" name="title" defaultValue={artwork?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Auteur</Label>
          <Input id="author" name="author" defaultValue={artwork?.author} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="technique">Technique</Label>
          <Input id="technique" name="technique" defaultValue={artwork?.technique ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input id="dimensions" name="dimensions" defaultValue={artwork?.dimensions ?? ""} placeholder="ex: 96x72cm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Annee</Label>
          <Input id="year" name="year" type="number" defaultValue={artwork?.year ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input id="price" name="price" type="number" min={0} defaultValue={artwork?.price ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilite</Label>
          <Select name="availability" defaultValue={artwork?.availability ?? "disponible"}>
            <SelectTrigger id="availability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="reserve">Reserve</SelectItem>
              <SelectItem value="vendu">Vendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categorie</Label>
          <Select name="categoryId" defaultValue={artwork?.category_id ?? undefined}>
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Aucune" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="collectionId">Collection</Label>
          <Select name="collectionId" defaultValue={artwork?.collection_id ?? undefined}>
            <SelectTrigger id="collectionId">
              <SelectValue placeholder="Aucune" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Commentaire</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={artwork?.description ?? ""} />
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch name="isPublished" defaultChecked={artwork?.is_published ?? false} />
          Publiee (visible dans la galerie)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch name="isProtected" defaultChecked={artwork?.is_protected ?? true} />
          Protection renforcee
        </label>
      </div>

      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold">{artwork ? "Enregistrer" : "Creer l'oeuvre"}</SubmitButton>
    </form>
  );
}
