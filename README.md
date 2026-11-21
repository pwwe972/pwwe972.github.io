# Stand PWWE — nuage de mots, inscription atelier, Instagram

Un seul QR code, une seule page. Le visiteur tape son mot, choisit un des deux boutons,
et le mot apparaît sur l'écran du stand en quelques secondes.

| Fichier | Rôle |
|---|---|
| `index.html` | Page des visiteurs (QR code). Avec `?kiosque` : version tablette posée sur la table. |
| `ecran.html` | Nuage de mots en direct, pour l'écran 2. |
| `affiche.html` | Affiche A4 à imprimer pour le chevalet (QR code + adresse). |
| `config.js` | Les réglages : adresse de l'API, Instagram, question. **Seul fichier à modifier.** |
| `apps-script/Code.gs` | Script à coller dans le Google Sheet qui reçoit les réponses. |

Tant que `config.js` ne contient pas l'adresse de l'API, les pages tournent en mode démo.

## 1. Le Google Sheet et son script (5 minutes)

1. Connecté au compte Google PWWE, créez un Google Sheet (par exemple « PWWE – Fête de la Canne 2026 »).
2. Menu **Extensions > Apps Script**. Remplacez tout le contenu de `Code.gs` par celui de
   `apps-script/Code.gs`, puis enregistrez.
3. Dans la barre du haut, choisissez la fonction `installer` et cliquez sur **Exécuter**.
   Google demande une autorisation : acceptez (« Paramètres avancés » puis « Accéder à… »
   si l'écran « application non validée » apparaît). Les onglets `Mots`, `Inscriptions`
   et `Mots bloqués` sont créés.
4. **Déployer > Nouveau déploiement**, type **Application web**,
   *Exécuter en tant que* : **Moi**, *Qui a accès* : **Tout le monde**. Validez.
5. Copiez l'**URL de l'application web** (elle se termine par `/exec`).

## 2. Brancher les pages

Ouvrez `config.js` et collez l'URL entre les guillemets de `API: ""`.

Vérification rapide dans un terminal (remplacez `URL`) :

    curl -L "URL"
    # attendu : {"ok":true,"mots":[]}
    curl -L -H "Content-Type: text/plain" -d '{"type":"mot","id":"essai-1","mot":"essai","source":"test"}' "URL"
    # attendu : {"ok":true}, et une ligne dans l'onglet Mots

## 3. Mettre les pages en ligne (GitHub Pages, gratuit)

Pour une adresse courte à taper : créez un compte GitHub nommé `pwwe972` (ou un autre nom libre),
puis un dépôt **public** nommé exactement `pwwe972.github.io`. Déposez-y tout le contenu de ce
dossier (bouton **Add file > Upload files**, glisser-déposer, dossiers `assets` et `apps-script`
compris). Deux minutes plus tard, le site répond sur `https://pwwe972.github.io/`.

Variante avec un compte existant : dépôt `pwwe`, puis **Settings > Pages > Deploy from a branch >
main / (root)**. L'adresse devient `https://VOTRE-COMPTE.github.io/pwwe/`.

Le QR code de l'écran et de l'affiche se calcule tout seul à partir de l'adresse d'hébergement.

## 4. Le jour J

- **Écran 2** : ouvrir `…/ecran.html`, puis touche `F` (ou un clic) pour le plein écran.
- **Chevalet** : ouvrir `…/affiche.html` et imprimer.
- **Tablette sur la table** (facultatif) : ouvrir `…/?kiosque`. Un seul bouton, retour automatique
  à la saisie après chaque mot.
- **Avant l'ouverture** : dans le Sheet, menu **PWWE > Vider le nuage de mots…** pour effacer les essais.
- **Retirer un mot** : supprimer sa ligne dans l'onglet `Mots`. Il disparaît de l'écran en 10 secondes environ.
- **Bloquer un mot à l'avance** : l'ajouter dans l'onglet `Mots bloqués`.
- Les inscriptions arrivent dans l'onglet `Inscriptions`. Elles ne sont jamais renvoyées vers les pages web.

## Bon à savoir

- L'écran interroge le Sheet toutes les 3 secondes (`PERIODE` dans `ecran.html`).
- Un mot envoyé sans réseau est gardé sur le téléphone et repart tout seul au retour de la connexion.
- Si vous modifiez `Code.gs` après coup : **Déployer > Gérer les déploiements > crayon > Version :
  Nouvelle version**. L'URL reste la même.
- GitHub Pages garde les fichiers en cache une dizaine de minutes : après une modification,
  rechargez la page en forçant (Cmd + Maj + R).
- Essai sans rien installer : `python3 -m http.server` dans ce dossier, puis `http://localhost:8000/`.
  En mode démo, un mot tapé dans `index.html` apparaît dans `ecran.html` ouvert dans le même navigateur.
- « Connexion interrompue » sur l'écran : vérifier le partage de connexion, puis que le déploiement
  est bien en accès « Tout le monde » et que l'URL de `config.js` se termine par `/exec`.
