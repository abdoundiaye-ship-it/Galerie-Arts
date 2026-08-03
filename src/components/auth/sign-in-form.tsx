"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, type ActionState } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

const initialState: ActionState = {};

export function SignInForm() {
  const [state, formAction] = useActionState(signInAction, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton variant="gold" className="w-full">
        Se connecter
      </SubmitButton>
      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/mot-de-passe-oublie" className="hover:text-foreground">
          Mot de passe oublie ?
        </Link>
        <Link href="/inscription" className="hover:text-foreground">
          Creer un compte
        </Link>
      </div>
    </form>
  );
}
