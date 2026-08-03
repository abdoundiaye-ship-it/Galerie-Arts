"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TempPasswordReveal } from "@/components/admin/temp-password-reveal";
import { resetUserPasswordAction } from "@/lib/actions/admin-users";
import { useToast } from "@/hooks/use-toast";

export function ResetPasswordButton({ userId, email }: { userId: string; email: string | null }) {
  const [pending, startTransition] = React.useTransition();
  const [tempPassword, setTempPassword] = React.useState<string | null>(null);
  const { toast } = useToast();

  function handleClick() {
    if (!window.confirm(`Reinitialiser le mot de passe de ${email ?? "cet utilisateur"} ?`)) return;

    startTransition(async () => {
      const result = await resetUserPasswordAction(userId);
      if (result.error) {
        toast({ description: result.error, variant: "destructive" });
        return;
      }
      setTempPassword(result.tempPassword ?? null);
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" disabled={pending} onClick={handleClick}>
        Reinitialiser mot de passe
      </Button>

      <Dialog open={Boolean(tempPassword)} onOpenChange={(open) => !open && setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe reinitialise</DialogTitle>
          </DialogHeader>
          {tempPassword && <TempPasswordReveal password={tempPassword} />}
          <Button onClick={() => setTempPassword(null)}>Fermer</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
