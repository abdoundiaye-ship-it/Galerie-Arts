import type { Metadata } from "next";
import Link from "next/link";
import { getAllPurchaseRequestsForAdmin } from "@/lib/data/purchase-requests";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewRequestDialog } from "@/components/admin/review-request-dialog";
import { PURCHASE_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice, groupByCheckout } from "@/lib/utils";

export const metadata: Metadata = { title: "Demandes d'achat" };

const STATUS_VARIANT: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  en_attente: "secondary",
  acceptee: "success",
  refusee: "destructive",
  annulee: "outline",
};

export default async function AdminRequestsPage() {
  const requests = await getAllPurchaseRequestsForAdmin();
  const orders = groupByCheckout(requests);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Demandes d&apos;achat ({orders.length})</h1>

      <div className="space-y-4">
        {orders.length === 0 && <p className="text-muted-foreground">Aucune demande pour le moment.</p>}
        {orders.map((order) => {
          // groupByCheckout never produces an empty items array (see its
          // implementation: a group only exists because something was
          // pushed into it), so this index access is always defined.
          const first = order.items[0]!;
          return (
            <Card key={order.key}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {first.userFullName ?? first.userEmail ?? "Client"} — {order.items.length} oeuvre
                  {order.items.length > 1 ? "s" : ""} — {formatDate(first.created_at)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((request) => (
                  <div
                    key={request.id}
                    className="space-y-2 border-t border-border/60 pt-3 text-sm first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Link href={`/galerie/${request.artwork?.reference}`} className="font-medium hover:underline">
                        {request.artwork?.title} — {request.artwork?.author}
                      </Link>
                      <Badge variant={STATUS_VARIANT[request.status]}>
                        {PURCHASE_REQUEST_STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                    {request.proposed_price && <p>Prix propose : {formatPrice(request.proposed_price)}</p>}
                    {request.message && <p className="text-muted-foreground">Message : {request.message}</p>}
                    {request.admin_response && (
                      <p className="rounded-md bg-secondary/50 p-2">Reponse envoyee : {request.admin_response}</p>
                    )}
                    {request.status === "en_attente" && (
                      <ReviewRequestDialog requestId={request.id} artworkTitle={request.artwork?.title ?? ""} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
