import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCartLines } from "@/lib/data/cart";
import { getPrimaryImage, getPublicThumbnailUrl } from "@/lib/storage";
import { RemoveFromCartButton } from "@/components/gallery/remove-from-cart-button";
import { CheckoutForm } from "@/components/gallery/checkout-form";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon panier" };

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/panier");

  const lines = await getCartLines(user.id);

  return (
    <div className="container max-w-3xl space-y-8 py-12">
      <h1 className="font-serif text-3xl font-semibold">Mon panier</h1>

      {!user.isActive && (
        <p className="rounded-md border border-gold-500/40 bg-gold-500/10 p-3 text-sm">
          Votre compte est en attente d&apos;activation par un administrateur. Vous pouvez preparer
          votre panier des maintenant ; l&apos;envoi de la demande sera possible une fois votre compte
          active.
        </p>
      )}

      {lines.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
          Votre panier est vide.{" "}
          <Link href="/galerie" className="ml-1 underline">
            Parcourir la galerie
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {lines.map(({ artwork }) => {
              const primaryImage = getPrimaryImage(artwork.images);
              return (
                <li
                  key={artwork.id}
                  className="flex items-center gap-4 rounded-lg border border-border/60 bg-card p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {primaryImage && (
                      <Image
                        src={getPublicThumbnailUrl(primaryImage.thumbnail_path)}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/galerie/${artwork.reference}`} className="truncate font-medium hover:underline">
                      {artwork.title}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{artwork.author}</p>
                    <p className="text-sm font-medium text-gold-600 dark:text-gold-400">
                      {formatPrice(artwork.price, artwork.currency)}
                    </p>
                  </div>
                  <RemoveFromCartButton artworkId={artwork.id} />
                </li>
              );
            })}
          </ul>

          {user.isActive && <CheckoutForm />}
        </>
      )}
    </div>
  );
}
