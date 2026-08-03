# Makhete Wade — Galerie d'Art Virtuelle

Application web de galerie d'art (Next.js 15 App Router + Supabase) : exposition d'oeuvres, recherche/filtres, comptes utilisateurs avec validation manuelle, demandes d'achat, back-office admin, protection des visuels.

## Stack

- **Frontend** : Next.js (App Router), TypeScript, Tailwind CSS, composants "ShadCN" (Radix + CVA, code source dans `src/components/ui`), Framer Motion.
- **Backend** : Supabase (Auth, Postgres, Storage, Row Level Security).
- **Hébergement** : Vercel, déploiement continu via GitHub Actions.
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

1. Créez un compte via `/inscription`.
2. Promouvez-le en SQL (remplacez l'email) :

```sql
update public.profiles
set role_id = (select id from public.roles where name = 'admin'),
    status = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

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

## Déploiement (GitHub -> Vercel)

1. Poussez ce dépôt sur GitHub.
2. Créez un projet Vercel lié à ce dépôt (ou récupérez `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` via `vercel link`).
3. Dans les paramètres GitHub du dépôt (`Settings > Secrets and variables > Actions`), ajoutez :
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. Dans Vercel, configurez les variables d'environnement de production (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`).
5. Chaque push sur `main` déclenche `.github/workflows/deploy.yml`.

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
