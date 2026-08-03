# Feuille de route

Le schema de base de donnees et l'architecture anticipent deja les evolutions ci-dessous (tables `orders`, `favorites`, `purchase_requests` deja en place) — seule l'interface/l'integration reste a construire.

## Court terme

- **Paiement en ligne** : integrer Stripe (ou un PSP local supportant le FCFA/Mobile Money) sur la table `orders` deja preparee (`stripe_payment_intent_id`). Flux : demande d'achat acceptee -> generation d'un lien de paiement -> webhook -> passage `orders.status` a `paid`. Le panier (`cart_items`) et le regroupement par `checkout_group_id` existent deja ; il ne manque que le paiement effectif a la fin du flux.
- **Ecran de statistiques dedie** : exposer `activity_logs` dans une page admin avec filtres par date/action (actuellement uniquement agrege sur le tableau de bord).

## Moyen terme

- **Negociation de prix** : `purchase_requests.proposed_price` existe deja ; ajouter un fil de contre-propositions (nouvelle table `purchase_request_offers` ou champ JSON d'historique).
- **Devis PDF** : generation d'un document a partir d'une demande acceptee.
- **Gestion fine des permissions** : l'UI actuelle gere 2 roles (visiteur/admin) + un statut actif/inactif ; la table `role_permissions` permet deja d'assigner des permissions granulaires (`artworks.manage`, `stats.view`, etc.) a de nouveaux roles (Curateur, Artiste, Responsable des ventes...) sans migration lourde.

## Long terme

- **Multi-langue** (FR/EN) via `next-intl`.
- **Recherche full-text avancee** (actuellement `ilike`/trigram — envisager `pg_bm25` ou un service dedie si le catalogue grossit fortement).
- **Notifications email** automatiques (nouvelle demande, demande traitee) via une fonction Supabase Edge ou un webhook vers un service transactionnel.
