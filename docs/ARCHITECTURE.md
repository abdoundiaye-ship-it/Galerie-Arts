# Architecture

## Vue d'ensemble

```
Navigateur ──▶ Next.js (Vercel, App Router)
                 ├─ Server Components / Server Actions ──▶ Supabase (Postgres via PostgREST, respecte RLS)
                 ├─ Route Handler /api/images/[reference] ──▶ Supabase Storage (service role) + filigrane (sharp)
                 └─ Middleware (rafraichissement session + garde /admin)
```

Le client **service-role** (`src/lib/supabase/admin.ts`) n'est utilisé que pour : la lecture du bucket privé `artworks-display` dans la route image, l'écriture de `activity_logs`, et le script d'ingestion. Toutes les autres opérations passent par le client lié à la session de l'utilisateur (`src/lib/supabase/server.ts` / `client.ts`), donc **RLS reste la véritable frontière de sécurité**, pas le code applicatif.

## Arborescence

```
src/
  app/            routes App Router (pages, layouts, route handlers, sitemap/robots)
  components/
    ui/           primitives "ShadCN" (Radix + CVA), ecrites a la main
    gallery/      grille, carte oeuvre, filtres, image protegee, favoris, demande d'achat
    admin/        formulaires et tableaux d'administration
    auth/         formulaires d'authentification
    layout/       header, footer, theme, navigation mobile
    motion/       wrapper Framer Motion
  lib/
    supabase/     client.ts (browser), server.ts (RSC/Server Actions), admin.ts (service role), middleware.ts
    actions/      Server Actions (auth, artworks, favorites, purchase-requests, admin-users)
    data/         fonctions de lecture (une par domaine), reutilisees par les pages
    validations/  schemas zod (cote serveur ET client)
    auth.ts       getCurrentUser / requireAdmin / requireUser
    watermark.ts  composition du filigrane dynamique (sharp)
    rate-limit.ts limiteur de requetes en memoire
  types/          database.types.ts (miroir du schema SQL) + types de domaine
supabase/
  migrations/     schema, RLS, buckets — SQL versionne, source de verite
  seed.sql        categories/collections de base
scripts/
  convert-artworks.mjs   ingestion des 8 oeuvres reelles (TIFF -> WebP, upload, upsert DB)
tests/
  unit/           Vitest (utils, schemas zod)
  rls/            Vitest + Supabase local (politiques RLS)
  e2e/            Playwright (parcours visiteur/admin)
```

## Rendu et rendu dynamique

Le `Header` (present dans le layout racine) lit la session via `cookies()` sur **chaque** page — l'application est donc rendue dynamiquement partout (pas de generation statique), ce qui est attendu pour une app avec sessions/roles. Les routes `sitemap.ts`/`robots.ts` restent des exceptions gerees par Next.js.

## Pourquoi ces choix

- **Vercel plutot que GitHub Pages** : Next.js a besoin de Server Components, Server Actions et d'un middleware — un export statique GitHub Pages ne le permet pas.
- **`roles`/`permissions`/`role_permissions` en tables plutot qu'un enum fige** : permet d'etendre les autorisations plus tard (ex: un role "conservateur" en lecture seule) sans migration destructive.
- **Trois buckets Storage** (original prive / display prive / thumbnail public) : separe la source haute resolution (jamais exposee), la version d'affichage (servie uniquement via la route API apres verification), et une vignette basse resolution (safe pour le SEO/les grilles).
- **Composants "ShadCN" ecrits a la main** : shadcn/ui n'est pas un package npm mais un generateur de code (Radix + Tailwind + CVA) — les fichiers sont directement dans le depot, sans dependance a un CLI interactif indisponible en environnement non-interactif.
