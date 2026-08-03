"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { submitPurchaseRequestAction, type ActionState } from "@/lib/actions/purchase-requests";

interface PurchaseRequestDialogProps {
  artworkId: string;
  artworkTitle: string;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  path: string;
}

const initialState: ActionState = {};

export function PurchaseRequestDialog({
  artworkId,
  artworkTitle,
  isAuthenticated,
  isAuthorized,
  path,
}: PurchaseRequestDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(submitPurchaseRequestAction, initialState);

  React.useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  function handleTriggerClick(event: React.MouseEvent) {
    if (!isAuthenticated) {
      event.preventDefault();
      router.push(`/connexion?next=${encodeURIComponent(path)}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" onClick={handleTriggerClick}>
          Demander l&apos;achat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demande d&apos;achat — {artworkTitle}</DialogTitle>
        </DialogHeader>
        {!isAuthorized ? (
          <p className="text-sm text-muted-foreground">
            Votre compte est en attente de validation par un administrateur. Vous pourrez envoyer
            une demande d&apos;achat des que votre acces sera confirme.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="artworkId" value={artworkId} />
            <div className="space-y-2">
              <Label htmlFor="proposedPrice">Prix propose (FCFA, optionnel)</Label>
              <Input id="proposedPrice" name="proposedPrice" type="number" min={0} step="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea id="message" name="message" rows={4} placeholder="Precisions, delais, questions..." />
            </div>
            <FormMessage error={state.error} success={state.success} />
            <SubmitButton variant="gold" className="w-full">
              Envoyer la demande
            </SubmitButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
