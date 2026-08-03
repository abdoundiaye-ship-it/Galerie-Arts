# Makhete Wade — Galerie d'Art Virtuelle

Application web de galerie d'art (Next.js 15 App Router + Supabase) : exposition d'oeuvres, recherche/filtres, comptes utilisateurs avec validation manuelle, demandes d'achat, back-office admin, protection des visuels.

## Stack

- **Frontend** : Next.js (App Router), TypeScript, Tailwind CSS, composants "ShadCN" (Radix + CVA, code source dans `src/components/ui`), Framer Motion.
- **Backend** : Supabase (Auth, Postgres, Storage, Row Level Security).
- **Hébergement** : Vercel, connecté nativement au dépôt GitHub (déploiement automatique à chaque push sur `main`, previews sur chaque PR).
- **Tests** : Vitest (unitaires + RLS), Playwright (e2e smoke).

## Prérequis

- Node.js ≥ 20
- Un compte [Supabase](https://supabase.com) (projet cloud) — ou [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker pour le développement local.
- Un compte [Vercel](https://vercel.com) et un dépôt GitHub pour le déploiement continu.

## Installation

```bash
npm install
cp .env.example .env.local
# renseignez NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY dans .env.local
```

### Base de données Supabase

**Option A — projet cloud Supabase :**

```bash
npx supabase login
npx supabase link --project-ref <votre-project-ref>
npx supabase db push          # applique les migrations
npx supabase db execute -f supabase/seed.sql   # categories/collections de base
```

**Option B — développement local (Docker requis) :**

```bash
npx supabase start            # demarre Postgres/Auth/Storage en local
npx supabase db reset         # applique migrations + seed.sql automatiquement
```

`supabase status` affiche les URL/clés locales à copier dans `.env.local`.

### Premier compte administrateur

Un declencheur SQL (`profiles_prevent_self_role_escalation`) empeche toute modification de role/statut par un utilisateur qui n'est pas deja admin — y compris via une requete SQL directe. C'est volontaire (voir `docs/SECURITY.md`), mais ca veut dire que **le tout premier admin doit etre cree en desactivant temporairement ce declencheur** :

1. Créez un compte via `/inscription` (ou faites-le creer par le script ci-dessous).
2. Dans le SQL Editor du dashboard Supabase (ou via `supabase db query --linked`), remplacez l'email et executez, dans l'ordre :

```sql
alter table public.profiles disable trigger profiles_prevent_self_role_escalation;

update public.profiles
set role_id = (select id from public.roles where name = 'admin'),
    is_active = true
where id = (select id from auth.users where email = 'admin@example.com');

alter table public.profiles enable trigger profiles_prevent_self_role_escalation;
```

Une fois qu'un premier admin existe, tous les administrateurs suivants se creent normalement depuis `/admin/utilisateurs` (bouton "Creer un utilisateur", avec mot de passe temporaire affiche une seule fois) — plus besoin de toucher au declencheur.

### Ingestion des 8 oeuvres réelles fournies

Les scans originaux (`.tif`) vivent hors du dépôt Git (voir `.gitignore` — trop volumineux, et les originaux ne doivent pas être publics) dans `assets-source/originals/`. Une fois `.env.local` renseigné :

```bash
npm run convert:artworks
```

Le script convertit chaque `.tif` en dérivés WebP (affichage ~1600px, vignette ~480px), les téléverse dans Supabase Storage, et crée les fiches `artworks` correspondantes **en brouillon** (`is_published = false`). Complétez le prix/disponibilité puis publiez-les depuis `/admin/oeuvres`.

## Développement

```bash
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:rls` | Tests d'intégration RLS (nécessite `supabase start`) |
| `npm run test:e2e` | Tests Playwright (smoke) |
| `npm run convert:artworks` | Ingestion des 8 oeuvres réelles |
| `npm run supabase:types` | Régénère `src/types/database.types.ts` depuis le schéma réel |

## Déploiement (intégration Git native Vercel)

**Statut actuel : déployé sur https://galerie-arts.vercel.app** (domaine `vercel.app` temporaire — un domaine personnalisé sera branché plus tard ; voir la mise à jour à faire ci-dessous le jour venu).

1. Sur [vercel.com/new](https://vercel.com/new), importez le dépôt GitHub `abdoundiaye-ship-it/Galerie-Arts`. Vercel détecte automatiquement Next.js — laissez les réglages de build par défaut.
2. Avant le premier déploiement, ajoutez les variables d'environnement du projet (Vercel > Settings > Environment Variables), pour les environnements **Production** et **Preview** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret — ne jamais préfixer `NEXT_PUBLIC_`)
   - `NEXT_PUBLIC_SITE_URL` (l'URL Vercel de production, ou votre domaine personnalisé une fois branché)
3. Chaque push sur `main` déclenche un déploiement de production ; chaque pull request obtient une URL de preview isolée automatiquement — aucun workflow GitHub Actions supplémentaire n'est nécessaire pour ça (`.github/workflows/ci.yml` continue de faire tourner lint/typecheck/test/build sur chaque PR en parallèle).
4. `supabase/config.toml` (`[auth] site_url` / `additional_redirect_urls`) est déjà synchronisé avec `https://galerie-arts.vercel.app` sur le projet Supabase live (via `supabase config push`), pour que les liens de confirmation email et de réinitialisation de mot de passe pointent au bon endroit.

### Quand le domaine personnalisé sera branché

1. Ajoutez le domaine dans Vercel (Project > Settings > Domains).
2. Mettez à jour `NEXT_PUBLIC_SITE_URL` dans les variables d'environnement Vercel.
3. Mettez à jour `site_url`/`additional_redirect_urls` dans `supabase/config.toml`, puis `supabase config push` (ou faites-le faire).

## Documentation complémentaire

- [Architecture](docs/ARCHITECTURE.md)
- [Guide utilisateur](docs/GUIDE_UTILISATEUR.md)
- [Guide administrateur](docs/GUIDE_ADMINISTRATEUR.md)
- [Sécurité](docs/SECURITY.md)
- [Feuille de route](docs/ROADMAP.md)

## Commandes Git utiles

```bash
git status
git add <fichiers>
git commit -m "message"
git push -u origin main
```

Ce dépôt (`Galerie-Arts/`) est un dépôt Git **indépendant** du dossier parent `Application/` (qui héberge d'autres projets sans rapport).
