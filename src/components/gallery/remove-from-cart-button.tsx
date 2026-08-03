"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeFromCartAction } from "@/lib/actions/cart";

export function RemoveFromCartButton({ artworkId }: { artworkId: string }) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1 text-muted-foreground hover:text-destructive"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await removeFromCartAction(artworkId);
          router.refresh();
        })
      }
    >
      <X className="h-4 w-4" /> Retirer
    </Button>
  );
}
