import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/site-settings";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="" width={44} height={44} className="rounded-full" />
          <div>
            <p className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400">{settings.site_name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{settings.tagline}</p>
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="mt-2 block text-sm text-muted-foreground hover:text-foreground"
              >
                {settings.contact_email}
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Navigation</span>
          <Link href="/galerie" className="text-muted-foreground hover:text-foreground">
            Galerie
          </Link>
          <Link href="/connexion" className="text-muted-foreground hover:text-foreground">
            Connexion
          </Link>
          <Link href="/inscription" className="text-muted-foreground hover:text-foreground">
            Creer un compte
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Protection des oeuvres</span>
          <p className="text-muted-foreground">
            Les visuels sont proteges (filigrane, resolution limitee). Aucune protection
            web ne peut empecher une capture d&apos;ecran.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings.site_name}. Tous droits reserves.
      </div>
    </footer>
  );
}
