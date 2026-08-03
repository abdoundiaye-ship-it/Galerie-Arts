import type { Metadata } from "next";
import Link from "next/link";
import { getAllArtworksForAdmin } from "@/lib/data/artworks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArtworkRowActions } from "@/components/admin/artwork-row-actions";
import { AVAILABILITY_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Oeuvres" };

export default async function AdminArtworksPage() {
  const artworks = await getAllArtworksForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Oeuvres ({artworks.length})</h1>
        <Button asChild variant="gold">
          <Link href="/admin/oeuvres/nouveau">Ajouter une oeuvre</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Disponibilite</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Vues</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks.map((artwork) => (
              <TableRow key={artwork.id}>
                <TableCell className="font-medium">{artwork.title}</TableCell>
                <TableCell>{artwork.author}</TableCell>
                <TableCell>{formatPrice(artwork.price, artwork.currency)}</TableCell>
                <TableCell>{AVAILABILITY_LABELS[artwork.availability]}</TableCell>
                <TableCell>
                  <Badge variant={artwork.is_published ? "success" : "secondary"}>
                    {artwork.is_published ? "Publiee" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell>{artwork.view_count}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/oeuvres/${artwork.id}`}>Modifier</Link>
                  </Button>
                  <ArtworkRowActions artworkId={artwork.id} title={artwork.title} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
