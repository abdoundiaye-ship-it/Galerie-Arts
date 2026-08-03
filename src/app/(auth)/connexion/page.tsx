import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Connexion" };

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accedez a votre espace client ou administrateur.</p>
      </div>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
