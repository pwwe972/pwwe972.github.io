# Stand : nuage de mots, liste de contacts, Instagram

Un seul QR code, une seule page. Le visiteur tape son mot, choisit la suite (laisser ses coordonnées,
suivre le compte Instagram, ou rien), et le mot apparaît sur l'écran du stand en quelques secondes.

Le même site sert d'un événement à l'autre : on change les textes dans `config.js`, on vide le Google Sheet,
on ouvre le stand. L'adresse du site et le QR code restent les mêmes.

| Fichier | Rôle |
|---|---|
| `config.js` | Tous les réglages et tous les textes d'un événement. **Seul fichier à modifier.** |
| `index.html` | Page des visiteurs (QR code). Avec `?kiosque` : version tablette posée sur la table. Stand fermé : message de clôture. |
| `ecran.html` | Nuage de mots en direct, pour l'écran du stand. |
| `affiche.html` | Affiche A4 à imprimer pour le chevalet (QR code + adresse). |
| `assets/` | Logo, polices, couleurs (`style.css`). |
| `apps-script/Code.gs` | Script du Google Sheet qui reçoit les mots et les inscriptions. |

Tant que `config.js` ne contient pas l'adresse de l'API, les pages tournent en mode démo, sans rien enregistrer.

## Préparer un nouvel événement

1. **Récupérer puis vider les données du précédent.** Dans le Google Sheet, menu **Stand** :
   - **Bilan des mots** écrit, dans l'onglet du même nom, chaque mot et son nombre de citations (à télécharger si besoin) ;
   - copier ailleurs l'onglet `Inscriptions` si la liste doit être conservée ;
   - **Vider le nuage de mots…** puis **Vider les inscriptions…**.
2. **Adapter `config.js`** : la question, les textes de la liste de contacts (`LISTE`), de l'affiche (`AFFICHE`)
   et du message de clôture (`CLOTURE`). Les blocs `LISTE`, `LISTE.CASE` et les lignes Instagram sont facultatifs :
   supprimés, les boutons correspondants disparaissent.
3. **Passer `ETAT` à `"ouvert"`** dans `config.js`, puis mettre le site en ligne (voir plus bas).
4. Dans le Sheet, menu **Stand > Ouvrir le stand**.
5. **Imprimer l'affiche** : ouvrir `…/affiche.html`. Si l'adresse n'a pas changé, l'affiche précédente reste valable.
6. **Essayer** avec un téléphone, puis **Vider le nuage de mots…** avant l'ouverture au public.

## Le jour J

- **Écran** : ouvrir `…/ecran.html`, puis touche `F` (ou un clic) pour le plein écran.
  Il n'affiche volontairement ni QR code ni adresse : les visiteurs passent par le stand.
- **Tablette sur la table** (facultatif) : ouvrir `…/?kiosque`. Un seul bouton, retour automatique à la saisie.
- **Retirer un mot** : supprimer sa ligne dans l'onglet `Mots`. Il disparaît de l'écran en 10 secondes environ.
- **Bloquer un mot à l'avance** : l'ajouter dans l'onglet `Mots bloqués`.
- Les inscriptions arrivent dans l'onglet `Inscriptions`. Elles ne sont jamais renvoyées vers les pages web.

## Fermer le stand

- **Le soir même** : menu **Stand > Fermer le stand**. Plus aucun mot ni inscription n'est accepté, les visiteurs
  qui scannent le QR code voient le message de clôture, et le nuage reste visible sur l'écran. Rien à redéployer.
- **Durablement** : passer `ETAT` à `"ferme"` dans `config.js` et mettre le site à jour. Le message de clôture
  s'affiche alors tout de suite, sans interroger le Sheet.

Le stand est fermé dès que l'un des deux le dit. Pour rouvrir, il faut donc `ETAT: "ouvert"` **et** **Stand > Ouvrir le stand**.

## Première installation

### 1. Le Google Sheet et son script

1. Créez un Google Sheet, puis menu **Extensions > Apps Script**. Remplacez le contenu de `Code.gs` par celui de
   `apps-script/Code.gs` et enregistrez.
2. Choisissez la fonction `installer` et cliquez sur **Exécuter**. Acceptez l'autorisation demandée
   (« Paramètres avancés » puis « Accéder à… » si l'écran « application non validée » apparaît).
   Les onglets `Mots`, `Inscriptions` et `Mots bloqués` sont créés.
3. **Déployer > Nouveau déploiement**, type **Application web**, *Exécuter en tant que* : **Moi**,
   *Qui a accès* : **Tout le monde**. Copiez l'**URL de l'application web** (elle se termine par `/exec`).

Après une modification de `Code.gs` : **Déployer > Gérer les déploiements > crayon > Version : Nouvelle version**.
L'URL reste la même.

### 2. Brancher les pages

Collez l'URL dans `API` de `config.js`, et l'adresse publique du site dans `ADRESSE`. Vérification dans un terminal :

    curl -L "URL"
    # attendu : {"ok":true,"ouvert":true,"mots":[]}
    curl -L -H "Content-Type: text/plain" -d '{"type":"mot","id":"essai-1","mot":"essai","source":"test"}' "URL"
    # attendu : {"ok":true}, et une ligne dans l'onglet Mots

### 3. Mettre les pages en ligne (GitHub Pages, gratuit)

Créez un dépôt **public** nommé `VOTRE-COMPTE.github.io` et déposez-y le contenu de ce dossier.
Deux minutes plus tard, le site répond sur `https://VOTRE-COMPTE.github.io/`.

## Changer d'identité visuelle

- **Logo et nom** : `LOGO`, `ORGANISATION`, `NOM_COMPLET` et `SLOGAN` dans `config.js`.
- **Couleurs et polices** : les variables en tête de `assets/style.css`.
- **Teintes du nuage** : ajoutez `COULEURS: ["#…", "#…"]` dans `config.js` (sinon, la palette de la charte).

## Bon à savoir

- L'écran interroge le Sheet toutes les 3 secondes (`PERIODE` dans `ecran.html`).
- Un mot envoyé sans réseau est gardé sur le téléphone et repart tout seul au retour de la connexion.
- Colonne `Case cochée` de l'onglet `Inscriptions` : « Oui » ou « Non » si `LISTE.CASE` est défini, vide sinon.
- GitHub Pages garde les fichiers en cache une dizaine de minutes : après une modification, rechargez la page
  en forçant (Cmd + Maj + R).
- Essai sans rien installer : `python3 -m http.server` dans ce dossier, puis `http://localhost:8000/`.
  En mode démo, un mot tapé dans `index.html` apparaît dans `ecran.html` ouvert dans le même navigateur.
- « Connexion interrompue » sur l'écran : vérifier la connexion, puis que le déploiement est en accès
  « Tout le monde » et que l'URL de `config.js` se termine par `/exec`.
- La version utilisée à la Fête de la Canne 2026 est conservée sous l'étiquette git `stand-2026-11-21`.
