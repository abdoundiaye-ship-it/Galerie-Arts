import type { Metadata } from "next";
import Link from "next/link";
import { getAllPurchaseRequestsForAdmin } from "@/lib/data/purchase-requests";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewRequestDialog } from "@/components/admin/review-request-dialog";
import { PURCHASE_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Demandes d'achat" };

const STATUS_VARIANT: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  en_attente: "secondary",
  acceptee: "success",
  refusee: "destructive",
  annulee: "outline",
};

export default async function AdminRequestsPage() {
  const requests = await getAllPurchaseRequestsForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Demandes d&apos;achat ({requests.length})</h1>

      <div className="space-y-4">
        {requests.length === 0 && <p className="text-muted-foreground">Aucune demande pour le moment.</p>}
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                <Link href={`/galerie/${request.artwork?.reference}`} className="hover:underline">
                  {request.artwork?.title} — {request.artwork?.author}
                </Link>
              </CardTitle>
              <Badge variant={STATUS_VARIANT[request.status]}>{PURCHASE_REQUEST_STATUS_LABELS[request.status]}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Demande par {request.userFullName ?? request.userEmail ?? "utilisateur"} le{" "}
                {formatDate(request.created_at)}
              </p>
              {request.proposed_price && <p>Prix propose : {formatPrice(request.proposed_price)}</p>}
              {request.message && <p>Message : {request.message}</p>}
              {request.admin_response && (
                <p className="rounded-md bg-secondary/50 p-2">Reponse envoyee : {request.admin_response}</p>
              )}
              {request.status === "en_attente" && (
                <ReviewRequestDialog requestId={request.id} artworkTitle={request.artwork?.title ?? ""} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
