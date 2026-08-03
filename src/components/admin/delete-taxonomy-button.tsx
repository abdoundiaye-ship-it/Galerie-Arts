"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteTaxonomyButton({
  id,
  name,
  action,
}: {
  id: string;
  name: string;
  action: (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Supprimer "${name}" ?`)) return;
        startTransition(async () => {
          await action(id);
          router.refresh();
        });
      }}
    >
      Supprimer
    </Button>
  );
}
