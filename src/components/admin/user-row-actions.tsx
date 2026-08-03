"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  activateUserAction,
  deactivateUserAction,
  promoteToAdminAction,
  demoteToVisitorAction,
  deleteUserAction,
} from "@/lib/actions/admin-users";
import { ResetPasswordButton } from "@/components/admin/reset-password-button";
import { useToast } from "@/hooks/use-toast";
import type { AdminUserRow } from "@/lib/data/users";

export function UserRowActions({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function run(action: (id: string) => Promise<void>) {
    startTransition(async () => {
      try {
        await action(user.id);
        router.refresh();
      } catch (error) {
        toast({ description: error instanceof Error ? error.message : "Action impossible.", variant: "destructive" });
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Supprimer definitivement le compte de ${user.email ?? user.fullName} ?`)) return;
    run(deleteUserAction);
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {user.isActive ? (
        <Button size="sm" variant="ghost" disabled={pending || isSelf} onClick={() => run(deactivateUserAction)}>
          Desactiver
        </Button>
      ) : (
        <Button size="sm" variant="gold" disabled={pending} onClick={() => run(activateUserAction)}>
          Activer
        </Button>
      )}

      {user.roleName === "admin" ? (
        <Button size="sm" variant="ghost" disabled={pending || isSelf} onClick={() => run(demoteToVisitorAction)}>
          Retirer droits admin
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(promoteToAdminAction)}>
          Promouvoir admin
        </Button>
      )}

      <ResetPasswordButton userId={user.id} email={user.email} />

      <Button
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={pending || isSelf}
        onClick={handleDelete}
      >
        Supprimer
      </Button>
    </div>
  );
}
