"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type ActionState } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

const initialState: ActionState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telephone (optionnel)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        <p className="text-xs text-muted-foreground">
          8 caracteres minimum, avec majuscule, minuscule et chiffre.
        </p>
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold" className="w-full">
        Creer mon compte
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Deja inscrit ?{" "}
        <Link href="/connexion" className="font-medium text-foreground hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
