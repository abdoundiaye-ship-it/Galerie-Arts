import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Creer un compte" };

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold">Creer un compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre acces complet (demandes d&apos;achat) sera active apres validation par un administrateur.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
