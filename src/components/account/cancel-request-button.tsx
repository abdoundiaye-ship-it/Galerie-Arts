"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cancelPurchaseRequestAction } from "@/lib/actions/purchase-requests";
import { useToast } from "@/hooks/use-toast";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelPurchaseRequestAction(requestId);
          toast({ description: "Demande annulee." });
        })
      }
    >
      Annuler
    </Button>
  );
}
