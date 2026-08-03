# Securite

## Row Level Security (RLS)

Toutes les tables ont RLS **active** (`enable row level security`) avec des politiques explicites (`supabase/migrations/00000000000006_rls_policies.sql`) — jamais de `disable row level security`. Points cles :

- Lecture publique des oeuvres/categories/collections limitee a `is_published = true` (ou admin).
- `favorites`/`purchase_requests` : un utilisateur ne peut lire/ecrire que ses propres lignes ; seul un admin peut faire evoluer le statut d'une demande.
- `activity_logs` : aucune politique INSERT pour `anon`/`authenticated` — l'ecriture passe exclusivement par le client service-role cote serveur.
- Escalade de privileges bloquee a deux niveaux : la policy `profiles_update_own` restreint aux lignes propres, **et** un trigger (`profiles_prevent_self_role_escalation`) refuse toute modification de `role_id`/`status` par un non-admin, y compris via un appel API direct qui contournerait la couche applicative.
- Buckets Storage : `artworks-original` et `artworks-display` sont **prives** — le second n'a meme pas de politique de lecture pour les roles authentifies ; seul le client service-role (dans la route `/api/images/[reference]`) peut y acceder, apres avoir revalide server-side que l'oeuvre est publiee.

## Validation

- **Client** : `react-hook-form` + retours d'erreur immediats sur les formulaires (auth, admin).
- **Serveur** : chaque Server Action revalide les entrees avec les memes schemas **zod** (`src/lib/validations/*.schema.ts`) — jamais de confiance dans les donnees venant du client.
- **Base de donnees** : contraintes SQL (`check`, `unique`, cles etrangeres, enums Postgres) comme derniere ligne de defense.

## Protection XSS / injection SQL / CSRF

- Aucune requete SQL n'est construite par concatenation de chaines dans le code applicatif : tout passe par le query builder Supabase (PostgREST), qui parametre les valeurs.
- React echappe par defaut tout contenu texte (pas de `dangerouslySetInnerHTML` hors du JSON-LD SEO, dont le contenu est genere server-side a partir de donnees deja validees, pas de saisie utilisateur libre non echappee).
- Les Server Actions Next.js utilisent un jeton d'action signe automatiquement par le framework (protection CSRF integree) — aucune action sensible n'est exposee via une route GET.

## Limitation de requetes (rate limiting)

La route `/api/images/[reference]` applique une limite glissante par IP/utilisateur (`src/lib/rate-limit.ts`, 60 requetes/minute par defaut). Implementation en memoire : suffisante pour un deploiement Vercel mono-region ; a remplacer par un store partage (Redis/Upstash) si le trafic grandit sur plusieurs regions.

## Journalisation

`activity_logs` enregistre les consultations d'oeuvres (vue image) et certaines actions (creation de demande d'achat). Ecrit uniquement via le client service-role, jamais depuis le navigateur.

## Limites connues de la protection des images

Les mesures mises en oeuvre (filigrane dynamique, URLs signees a duree de vie courte, resolution reduite pour les visiteurs anonymes, desactivation du clic droit/glisser-deposer/impression, rendu en `background-image` plutot qu'un `<img src>` direct) **reduisent la facilite de copie** mais ne peuvent pas empecher :

- une capture d'ecran (logicielle ou photo de l'ecran) ;
- l'enregistrement video de l'ecran ;
- l'extraction via les outils de developpement du navigateur par un utilisateur determine.

Ces limites sont inherentes a toute application web affichant des images a un navigateur ; elles sont documentees ici explicitement plutot que implicitement supposees.
