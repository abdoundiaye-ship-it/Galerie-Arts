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
import { PURCHASE_REQUEST_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatDate, formatPrice, groupByCheckout } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/compte");

  const [favorites, requests] = await Promise.all([
    getUserFavoriteArtworks(user.id),
    getUserPurchaseRequests(user.id),
  ]);

  const orders = groupByCheckout(requests);

  return (
    <div className="container space-y-8 py-12">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Mon compte</h1>
        <p className="mt-1 text-muted-foreground">{user.fullName ?? user.email}</p>
        <div className="mt-2 flex gap-2">
          <Badge variant="secondary">{ROLE_LABELS[user.roleName] ?? user.roleName}</Badge>
          <Badge variant={user.isActive ? "success" : "outline"}>
            {user.isActive ? "Actif" : "En attente d'activation"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="favoris">
        <TabsList>
          <TabsTrigger value="favoris">Mes favoris ({favorites.length})</TabsTrigger>
          <TabsTrigger value="demandes">Mes commandes ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="favoris" className="pt-6">
          <ArtworkGrid artworks={favorites} />
        </TabsContent>

        <TabsContent value="demandes" className="space-y-4 pt-6">
          {orders.length === 0 && (
            <p className="text-muted-foreground">Vous n&apos;avez envoye aucune demande d&apos;achat.</p>
          )}
          {orders.map((order) => (
            <Card key={order.key}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  Commande du {formatDate(order.items[0]!.created_at)} ({order.items.length} oeuvre
                  {order.items.length > 1 ? "s" : ""})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((request) => (
                  <div key={request.id} className="flex items-start justify-between gap-4 border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
                    <div className="space-y-1 text-sm">
                      <Link href={`/galerie/${request.artwork?.reference}`} className="font-medium hover:underline">
                        {request.artwork?.title} — {request.artwork?.author}
                      </Link>
                      <p className="text-muted-foreground">{formatPrice(request.artwork?.price ?? null, request.artwork?.currency)}</p>
                      {request.message && <p className="text-muted-foreground">Message : {request.message}</p>}
                      {request.admin_response && (
                        <p className="rounded-md bg-secondary/50 p-2 text-muted-foreground">
                          Reponse : {request.admin_response}
                        </p>
                      )}
                      {request.status === "en_attente" && <CancelRequestButton requestId={request.id} />}
                    </div>
                    <Badge>{PURCHASE_REQUEST_STATUS_LABELS[request.status]}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
