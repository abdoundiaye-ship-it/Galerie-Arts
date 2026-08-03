"use client";

import { useActionState } from "react";
import { checkoutCartAction, type ActionState } from "@/lib/actions/cart";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

const initialState: ActionState = {};

export function CheckoutForm() {
  const [state, formAction] = useActionState(checkoutCartAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="message">Message pour l&apos;administrateur (optionnel)</Label>
        <Textarea id="message" name="message" rows={3} placeholder="Precisions, delais, questions..." />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold" className="w-full">
        Envoyer la demande d&apos;achat
      </SubmitButton>
    </form>
  );
}
