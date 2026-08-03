import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtworkGrid } from "@/components/gallery/artwork-grid";
import { FadeIn } from "@/components/motion/fade-in";
import { getFeaturedArtworks } from "@/lib/data/artworks";
import { SITE_TAGLINE } from "@/lib/constants";

export default async function HomePage() {
  const featured = await getFeaturedArtworks(8);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-secondary/60 to-background">
        <div className="container flex flex-col items-center gap-6 py-24 text-center">
          <FadeIn className="flex flex-col items-center gap-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold-600 dark:text-gold-400">
              Galerie d&apos;art virtuelle
            </p>
            <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Makhete Wade
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{SITE_TAGLINE}</p>
          </FadeIn>
          <FadeIn delay={0.15} className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="gold">
              <Link href="/galerie">
                Explorer la galerie <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/inscription">Devenir client autorise</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Oeuvres recentes</h2>
            <p className="mt-1 text-muted-foreground">Une selection des dernieres pieces publiees.</p>
          </div>
          <Button asChild variant="link">
            <Link href="/galerie">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ArtworkGrid artworks={featured} />
      </section>

      <section id="a-propos" className="border-t border-border/60 bg-secondary/30">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <FadeIn>
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">A propos de la galerie</h2>
            <p className="mt-4 text-muted-foreground">
              Makhete Wade presente une selection d&apos;oeuvres d&apos;artistes senegalais,
              accessible en ligne dans un espace pense comme une galerie de musee. Chaque
              piece est documentee (auteur, technique, dimensions, annee) et peut faire
              l&apos;objet d&apos;une demande d&apos;acquisition apres validation de votre compte.
            </p>
          </FadeIn>
          <FadeIn delay={0.15} className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-serif text-lg font-semibold">Comment acquerir une oeuvre</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Creez un compte et attendez la validation par un administrateur.</li>
              <li>Parcourez le catalogue et ouvrez la fiche d&apos;une oeuvre disponible.</li>
              <li>Envoyez une demande d&apos;achat, avec un prix propose si vous le souhaitez.</li>
              <li>Un administrateur vous recontacte pour finaliser la transaction.</li>
            </ol>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
