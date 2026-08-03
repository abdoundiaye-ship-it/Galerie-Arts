"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ActionState } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

const initialState: ActionState = {};

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold" className="w-full">
        Envoyer le lien de reinitialisation
      </SubmitButton>
    </form>
  );
}
