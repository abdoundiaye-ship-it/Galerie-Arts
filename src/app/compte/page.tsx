import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserFavoriteArtworks, getUserPurchaseRequests } from "@/lib/data/account";
import { ArtworkGrid } from "@/components/gallery/artwork-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelRequestButton } from "@/components/account/cancel-request-button";
import { PROFILE_STATUS_LABELS, PURCHASE_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/compte");

  const [favorites, requests] = await Promise.all([
    getUserFavoriteArtworks(user.id),
    getUserPurchaseRequests(user.id),
  ]);

  return (
    <div className="container space-y-8 py-12">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Mon compte</h1>
        <p className="mt-1 text-muted-foreground">{user.fullName ?? user.email}</p>
        <Badge variant="secondary" className="mt-2">
          {PROFILE_STATUS_LABELS[user.status]}
        </Badge>
      </div>

      <Tabs defaultValue="favoris">
        <TabsList>
          <TabsTrigger value="favoris">Mes favoris ({favorites.length})</TabsTrigger>
          <TabsTrigger value="demandes">Mes demandes ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="favoris" className="pt-6">
          <ArtworkGrid artworks={favorites} />
        </TabsContent>

        <TabsContent value="demandes" className="space-y-4 pt-6">
          {requests.length === 0 && (
            <p className="text-muted-foreground">Vous n&apos;avez envoye aucune demande d&apos;achat.</p>
          )}
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  <Link href={`/galerie/${request.artwork?.reference}`} className="hover:underline">
                    {request.artwork?.title} — {request.artwork?.author}
                  </Link>
                </CardTitle>
                <Badge>{PURCHASE_REQUEST_STATUS_LABELS[request.status]}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Envoyee le {formatDate(request.created_at)}</p>
                {request.proposed_price && (
                  <p>Prix propose : {formatPrice(request.proposed_price, request.artwork?.currency)}</p>
                )}
                {request.message && <p>Message : {request.message}</p>}
                {request.admin_response && (
                  <p className="rounded-md bg-secondary/50 p-2">Reponse : {request.admin_response}</p>
                )}
                {request.status === "en_attente" && <CancelRequestButton requestId={request.id} />}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
