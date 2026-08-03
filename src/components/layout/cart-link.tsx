import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartLink({ count }: { count: number }) {
  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label="Mon panier">
      <Link href="/panier">
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold text-black">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}
