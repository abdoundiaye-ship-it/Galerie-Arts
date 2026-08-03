import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reinitialiser le mot de passe" };

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold">Nouveau mot de passe</h1>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
