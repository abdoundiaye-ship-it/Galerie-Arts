import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/data/admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Tableau de bord admin" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Oeuvres publiees", value: `${stats.publishedArtworks} / ${stats.totalArtworks}` },
    { label: "Vues cumulees", value: stats.totalViews },
    { label: "Comptes en attente", value: stats.pendingUsers, href: "/admin/utilisateurs" },
    { label: "Demandes en attente", value: stats.pendingRequests, href: "/admin/demandes" },
    { label: "Demandes acceptees", value: stats.acceptedRequests },
    { label: "Demandes refusees", value: stats.refusedRequests },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <Card key={card.label} className="transition-colors hover:border-gold-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oeuvres les plus consultees</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topViewed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune consultation enregistree pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topViewed.map((artwork) => (
                <li key={artwork.reference} className="flex items-center justify-between text-sm">
                  <Link href={`/galerie/${artwork.reference}`} className="hover:underline">
                    {artwork.title} — {artwork.author}
                  </Link>
                  <span className="font-medium text-muted-foreground">{artwork.view_count} vues</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
