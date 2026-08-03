"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/lib/actions/cart";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  artworkId: string;
  isAuthenticated: boolean;
  isActive: boolean;
  path: string;
}

export function AddToCartButton({ artworkId, isAuthenticated, isActive, path }: AddToCartButtonProps) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/connexion?next=${encodeURIComponent(path)}`);
      return;
    }

    if (!isActive) {
      toast({
        description:
          "Votre compte doit d'abord etre active par un administrateur avant de pouvoir acheter.",
      });
      return;
    }

    startTransition(async () => {
      const result = await addToCartAction(artworkId);
      toast({ description: result.success ?? result.error, variant: result.error ? "destructive" : "default" });
      if (result.success) router.refresh();
    });
  }

  return (
    <Button variant="gold" onClick={handleClick} disabled={pending} className="gap-2">
      <ShoppingBag className="h-4 w-4" />
      Ajouter au panier
    </Button>
  );
}
