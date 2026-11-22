/* Réglages du stand : le seul fichier à modifier pour préparer un événement. */
window.STAND = {
  /* ---------- Branchements ---------- */
  // Adresse de l'application web Google Apps Script (elle se termine par /exec).
  // Tant qu'elle est vide, les pages tournent en mode démo, sans rien enregistrer.
  API: "https://script.google.com/macros/s/AKfycbxaP9-33lhvzoA3pkPPEuAbAG3nhskGsM409sD5EN23R9fNppCvrs1zsWHK67jeXKLR/exec",

  // Adresse publique du site, encodée dans le QR code de l'affiche.
  ADRESSE: "https://pwwe972.github.io/",

  // "ouvert" pendant l'événement, "ferme" en dehors : la page des visiteurs affiche alors le message de clôture.
  // Pendant l'événement, le menu « Stand » du Google Sheet permet aussi d'ouvrir et de fermer sans toucher à ce fichier.
  ETAT: "ferme",

  /* ---------- Qui tient le stand ---------- */
  ORGANISATION: "PWWE",
  NOM_COMPLET: "Pa Wol Wonm Expérience",
  LOGO: "assets/logo-pwwe.png",
  SLOGAN: "L’excellence à la portée de vos sens",

  // Facultatif : sans ces deux lignes, les boutons Instagram disparaissent.
  INSTAGRAM: "https://www.instagram.com/pwwe972",
  COMPTE_INSTAGRAM: "@pwwe972",

  /* ---------- Le nuage de mots ---------- */
  // Question affichée sur le téléphone des visiteurs et sur l'écran du stand.
  QUESTION: "En un mot, quel souvenir ou quelle émotion le rhum évoque pour vous ?",
  AIDE_MOT: "Un mot, deux au plus : il s’affiche tout de suite sur l’écran du stand.",
  // Mots montrés par l'écran en mode démo (sans adresse API).
  EXEMPLES: ["vacances", "Mamie", "fête", "canne", "soleil", "ti-punch", "famille", "vacances", "enfance", "partage",
    "habitation", "soleil", "Noël", "vacances", "terroir", "amis", "fête", "chaleur", "mon père", "récolte", "partage", "soleil"],

  /* ---------- La liste de contacts proposée après le mot ---------- */
  // Facultatif : sans ce bloc, la page ne propose pas d'inscription.
  LISTE: {
    BOUTON: "Recevoir les dates des ateliers",
    TITRE: "Les ateliers PWWE",
    TEXTE: "Plusieurs formats, du rhum blanc au rhum vieux. En décembre : un atelier blanc et un atelier vieux, dates à venir. Sur cette liste, vous recevez les dates dès qu’elles sont fixées, avant leur annonce sur Instagram, et vous choisissez l’atelier qui vous tente.",
    // Case à cocher facultative (retirer le bloc CASE pour ne pas l'afficher).
    CASE: {
      QUESTION: "Et pour décembre ?",
      LIBELLE: "Comptez sur moi pour un atelier de décembre",
      AIDE: "Sans engagement : cela nous aide à prévoir le nombre de places."
    },
    ENVOYER: "Recevoir les dates",
    CONFIRMATION: "Vous êtes sur la liste : nous vous envoyons les dates de nos ateliers dès qu’elles sont fixées, à commencer par celles de décembre.",
    MENTION: "Vos coordonnées servent uniquement à PWWE pour vous informer de ses ateliers. Elles ne sont transmises à personne."
  },

  /* ---------- L'affiche du QR code (affiche.html) ---------- */
  AFFICHE: {
    TITRE: ["Votre mot sur", "l’écran du stand"],          // une ligne par élément
    ETAPES: [                                              // [début en gras, suite de la phrase]
      ["Scannez", " le QR code avec l’appareil photo de votre téléphone."],
      ["Tapez un mot", " : le souvenir ou l’émotion que le rhum évoque pour vous."],
      ["Choisissez la suite", " : recevoir les dates des ateliers, ou suivre PWWE sur Instagram."]
    ]
  },

  /* ---------- Le message de clôture (stand fermé) ---------- */
  CLOTURE: {
    TITRE: "Merci de votre visite",
    TEXTE: [                                               // un paragraphe par élément
      "Le stand PWWE de la Fête de la Canne 2026 est terminé : le nuage de mots et la liste des ateliers sont fermés.",
      "Les dates de nos prochains ateliers sont annoncées sur Instagram."
    ]
  }
};
