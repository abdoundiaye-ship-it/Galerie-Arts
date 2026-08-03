import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-wide text-gold-600 dark:text-gold-400">
            <Image src="/logo.png" alt="" width={32} height={32} className="rounded-full" priority />
            MAKHETE WADE
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/galerie" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
            Galerie
          </Link>
          <Link
            href="/galerie?collection=maitres-senegalais"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Collections
          </Link>
          <Link href="/#a-propos" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
            A propos
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
