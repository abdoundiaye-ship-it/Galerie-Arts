"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import type { ActionState } from "@/lib/actions/artworks";

interface SimpleTaxonomyFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

const initialState: ActionState = {};

export function SimpleTaxonomyForm({ action, submitLabel }: SimpleTaxonomyFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold">{submitLabel}</SubmitButton>
    </form>
  );
}
