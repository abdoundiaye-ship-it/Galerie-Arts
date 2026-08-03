# Guide administrateur

Toutes les pages ci-dessous sont sous `/admin` et necessitent le statut `admin` (voir README pour promouvoir le premier compte).

## Tableau de bord (`/admin`)

Oeuvres publiees / totales, vues cumulees, comptes en attente, demandes d'achat par statut, top des oeuvres les plus consultees.

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

## Demandes d'achat (`/admin/demandes`)

Chaque demande affiche l'oeuvre, le client, le prix propose (le cas echeant) et le message. Bouton "Traiter" pour accepter/refuser avec une reponse visible par le client.

## Utilisateurs (`/admin/utilisateurs`)

- **Compte en attente de validation** : boutons "Valider" (devient client autorise, peut envoyer des demandes d'achat) ou "Rejeter".
- **Client autorise** : peut etre promu administrateur.
- **Administrateur** : peut se voir retirer les droits admin (repasse client autorise).

Ces actions modifient `profiles.status`/`profiles.role_id` — un declencheur SQL (`profiles_prevent_self_role_escalation`) empeche tout utilisateur non-admin de s'auto-promouvoir, meme via un appel direct a l'API.

## Statistiques

Le tableau de bord agrege : nombre d'oeuvres publiees, vues cumulees (`artworks.view_count`, incremente a chaque consultation de la fiche detail via l'API image), demandes par statut. Les vues et actions sensibles sont egalement journalisees dans `activity_logs` (accessible uniquement en base pour l'instant — un ecran dedie pourra etre ajoute, voir la feuille de route).
