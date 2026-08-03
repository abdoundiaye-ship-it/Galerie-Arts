"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { reviewPurchaseRequestAction, type ActionState } from "@/lib/actions/purchase-requests";

const initialState: ActionState = {};

export function ReviewRequestDialog({ requestId, artworkTitle }: { requestId: string; artworkTitle: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(reviewPurchaseRequestAction, initialState);

  React.useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Traiter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Traiter la demande — {artworkTitle}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="requestId" value={requestId} />
          <div className="space-y-2">
            <Label htmlFor="adminResponse">Reponse (visible par le client)</Label>
            <Textarea id="adminResponse" name="adminResponse" rows={4} />
          </div>
          <FormMessage error={state.error} success={state.success} />
          <div className="flex gap-2">
            <SubmitButton name="status" value="acceptee" variant="gold" className="flex-1">
              Accepter
            </SubmitButton>
            <SubmitButton name="status" value="refusee" variant="outline" className="flex-1">
              Refuser
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
