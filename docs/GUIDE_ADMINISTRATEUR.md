# Guide administrateur

Toutes les pages ci-dessous sont sous `/admin` et necessitent le role `admin` **et** un compte actif (voir README pour promouvoir le premier compte). Les deux comptes administrateurs (abdou.ndiaye@gmail.com, makhet.wade@gmail.com) ont des privileges strictement identiques — l'admin n'est pas un compte special, c'est un role parmi ceux geres par la table `roles`.

## Tableau de bord (`/admin`)

Oeuvres publiees / totales, vues cumulees, comptes inactifs, demandes d'achat par statut, top des oeuvres les plus consultees.

## Oeuvres (`/admin/oeuvres`)

- **Liste** : titre, auteur, prix, disponibilite, statut (brouillon/publiee), vues, actions (modifier/supprimer).
- **Ajouter** (`/admin/oeuvres/nouveau`) : reference (unique), titre, auteur, technique, dimensions, annee, prix (FCFA), disponibilite, categorie, collection, commentaire, et les interrupteurs "Publiee" / "Protection renforcee".
- **Modifier** (`/admin/oeuvres/<id>`) : meme formulaire + gestion des images. Le tirage d'image :
  1. Selectionnez un fichier image (JPEG/PNG/TIFF...).
  2. Il est automatiquement decline en version affichage (WebP ~1600px) et vignette (WebP ~480px), televerse dans les buckets Storage correspondants.
  3. La premiere image ajoutee devient l'image principale (utilisee dans les grilles et la fiche detail).
- Une oeuvre n'apparait dans la galerie publique que si **"Publiee"** est active.

## Categories / Collections

CRUD simple (`/admin/categories`, `/admin/collections`) : nom + description optionnelle. Le slug est genere automatiquement.

## Panier et demandes d'achat (`/admin/demandes`)

Les visiteurs ajoutent des oeuvres a leur panier (`/panier`) puis envoient une seule demande groupee — chaque oeuvre du panier devient une ligne `purchase_requests`, toutes partageant un `checkout_group_id`. La page admin regroupe ces lignes par commande : un visiteur, N oeuvres, un message. Bouton "Traiter" **par oeuvre** pour accepter/refuser individuellement, avec une reponse visible par le client (une commande peut donc etre partiellement acceptee).

Il ne s'agit pas encore d'un vrai paiement en ligne : une demande acceptee doit etre finalisee manuellement (contact direct avec le client) — voir `docs/ROADMAP.md` pour l'integration paiement prevue.

## Utilisateurs (`/admin/utilisateurs`)

Modele de roles simplifie a deux niveaux :

- **Role** (`roles.name`) : `admin` ou `visiteur`. Extensible plus tard (Curateur, Artiste, Responsable des ventes...) sans migration lourde, grace aux tables `roles`/`permissions`/`role_permissions`.
- **Statut du compte** (`profiles.is_active`, booleen) : orthogonal au role. C'est le controle d'acces aux achats — un nouveau compte s'inscrit **inactif** (peut naviguer, pas acheter) jusqu'a ce qu'un admin l'active. Desactiver un compte (y compris un compte admin) revoque immediatement l'acces, sans le supprimer.

Actions disponibles par ligne utilisateur :

- **Activer / Desactiver** : bascule `is_active`. Un visiteur desactive garde son panier et ses favoris mais ne peut plus envoyer de demande d'achat tant qu'il n'est pas reactive.
- **Promouvoir admin / Retirer droits admin** : bascule `role_id`. Un admin ne peut ni se retirer ses propres droits, ni se desactiver lui-meme, ni se supprimer lui-meme (garde-fou pour eviter de se verrouiller hors du systeme).
- **Reinitialiser mot de passe** : genere un nouveau mot de passe temporaire, affiche une seule fois a l'ecran (a communiquer a l'utilisateur). N'envoie pas d'email — evite la limite de debit du service d'email par defaut de Supabase.
- **Supprimer** : suppression definitive du compte (auth + profil + favoris/demandes/panier associes, en cascade).
- **Creer un utilisateur** (bouton en haut de page) : nom, email, role. Le compte est cree **actif** immediatement (confirme, sans email de confirmation) avec un mot de passe temporaire affiche une seule fois — un admin qui cree un compte se porte garant, pas besoin de re-validation.

Ces actions modifient `profiles.role_id`/`profiles.is_active` via le client authentifie de l'admin (pas le client service-role) : un declencheur SQL (`profiles_prevent_self_role_escalation`) empeche tout utilisateur non-admin de modifier son propre role ou statut, meme via un appel direct a l'API — la meme protection est appliquee cote base de donnees, pas seulement dans l'interface.

## Parametres du site (`/admin/parametres`)

Nom du site, accroche, email de contact public — utilises dans le pied de page et les metadonnees SEO de toutes les pages.

## Statistiques

Le tableau de bord agrege : nombre d'oeuvres publiees, vues cumulees (`artworks.view_count`, incremente a chaque consultation de la fiche detail via l'API image), demandes par statut. Les vues et actions sensibles sont egalement journalisees dans `activity_logs` (accessible uniquement en base pour l'instant — un ecran dedie pourra etre ajoute, voir la feuille de route).
