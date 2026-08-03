"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  artworkId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  path: string;
}

export function FavoriteButton({ artworkId, initialFavorited, isAuthenticated, path }: FavoriteButtonProps) {
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/connexion?next=${encodeURIComponent(path)}`);
      return;
    }

    startTransition(async () => {
      const result = await toggleFavoriteAction(artworkId, path);
      setFavorited(result.favorited);
      toast({ description: result.favorited ? "Ajoute aux favoris." : "Retire des favoris." });
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending} className="gap-2">
      <Heart className={cn("h-4 w-4", favorited && "fill-destructive text-destructive")} />
      {favorited ? "Dans vos favoris" : "Ajouter aux favoris"}
    </Button>
  );
}
