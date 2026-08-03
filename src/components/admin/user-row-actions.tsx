"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  approveUserAction,
  rejectUserAction,
  promoteToAdminAction,
  revokeAdminAction,
} from "@/lib/actions/admin-users";
import type { AdminUserRow } from "@/lib/data/users";

export function UserRowActions({ user }: { user: AdminUserRow }) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  function run(action: (id: string) => Promise<void>) {
    startTransition(async () => {
      await action(user.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {user.status === "en_attente_validation" && (
        <>
          <Button size="sm" variant="gold" disabled={pending} onClick={() => run(approveUserAction)}>
            Valider
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" disabled={pending} onClick={() => run(rejectUserAction)}>
            Rejeter
          </Button>
        </>
      )}
      {user.status === "client_autorise" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(promoteToAdminAction)}>
          Promouvoir admin
        </Button>
      )}
      {user.status === "admin" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(revokeAdminAction)}>
          Retirer les droits admin
        </Button>
      )}
      {user.status === "rejete" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(approveUserAction)}>
          Valider quand meme
        </Button>
      )}
    </div>
  );
}
