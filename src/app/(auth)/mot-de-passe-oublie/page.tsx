import type { Metadata } from "next";
import { RequestResetForm } from "@/components/auth/request-reset-form";

export const metadata: Metadata = { title: "Mot de passe oublie" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold">Mot de passe oublie</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recevez un lien par email pour reinitialiser votre mot de passe.
        </p>
      </div>
      <RequestResetForm />
    </div>
  );
}
