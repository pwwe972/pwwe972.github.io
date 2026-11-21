/**
 * Stand PWWE — collecte des mots du nuage et des inscriptions aux ateliers.
 *
 * Ce script est attaché à un Google Sheet (Extensions > Apps Script).
 * Il est publié comme « application web » :
 *   - POST : enregistre un mot (onglet « Mots ») ou une inscription (onglet « Inscriptions ») ;
 *   - GET  : renvoie la liste des mots, et rien d'autre. Les coordonnées ne sortent jamais du Sheet.
 *
 * Modération : supprimer une ligne de l'onglet « Mots » retire le mot de l'écran en quelques secondes.
 * Les mots listés dans l'onglet « Mots bloqués » ne sont jamais enregistrés.
 */

var ONGLET_MOTS = 'Mots';
var ONGLET_INSCRIPTIONS = 'Inscriptions';
var ONGLET_BLOQUES = 'Mots bloqués';
var DUREE_CACHE = 8;          // secondes pendant lesquelles la liste des mots est gardée en mémoire
var LONGUEUR_MAX_MOT = 30;

/* ------------------------------------------------------------------ */
/* Menu et installation                                                */
/* ------------------------------------------------------------------ */

function onOpen() {
  var menu = SpreadsheetApp.getUi().createMenu('PWWE')
    .addItem('Préparer les onglets', 'installer')
    .addItem('Vider le nuage de mots…', 'viderLeNuage');
  // Liste complémentaire de mots bloqués : présente seulement si le fichier MotsBloques.gs accompagne ce script.
  var complement = typeof completerMotsBloques === 'function';
  if (complement) menu.addItem('Compléter les mots bloqués', 'completerMotsBloques');
  menu.addToUi();
  if (complement) { try { completerMotsBloquesUneFois_(); } catch (e) { /* sans gravité : le menu permet de le refaire */ } }
}

/** À lancer une fois : crée les trois onglets et leurs en-têtes. */
function installer() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  preparerOnglet_(classeur, ONGLET_MOTS, ['Date', 'Mot', 'Source']);
  preparerOnglet_(classeur, ONGLET_INSCRIPTIONS,
    ['Date', 'Prénom', 'Nom', 'Téléphone', 'E-mail', 'Inscription au prochain atelier', 'Mot déposé', 'Source']);
  var bloques = preparerOnglet_(classeur, ONGLET_BLOQUES, ['Mot à bloquer (un par ligne)']);
  if (bloques.getLastRow() < 2) {
    var exemples = ['merde', 'putain', 'pute', 'con', 'connard', 'connasse', 'salope', 'salaud', 'encule',
                    'bite', 'couille', 'nique', 'ntm', 'fdp', 'pd', 'batard', 'cul', 'chier', 'fuck', 'shit',
                    'bitch', 'kounia', 'kouni manman', 'makoume', 'isalop'];
    bloques.getRange(2, 1, exemples.length, 1).setValues(exemples.map(function (m) { return [m]; }));
  }
  var defaut = classeur.getSheetByName('Feuille 1') || classeur.getSheetByName('Sheet1');
  if (defaut && defaut.getLastRow() === 0 && classeur.getSheets().length > 1) classeur.deleteSheet(defaut);
  CacheService.getScriptCache().removeAll(['mots', 'bloques']);
}

function preparerOnglet_(classeur, nom, entetes) {
  var feuille = classeur.getSheetByName(nom) || classeur.insertSheet(nom);
  if (feuille.getLastRow() === 0) {
    feuille.getRange(1, 1, 1, entetes.length).setValues([entetes]).setFontWeight('bold');
    feuille.setFrozenRows(1);
    // Tout en texte brut, sauf la date : un numéro « 0696… » garde son zéro, et rien n'est lu comme une formule.
    feuille.getRange(1, 2, feuille.getMaxRows(), Math.max(entetes.length - 1, 1)).setNumberFormat('@');
    if (entetes[0] === 'Date') feuille.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    else feuille.getRange('A:A').setNumberFormat('@');
  }
  return feuille;
}

/** Menu : efface tous les mots (après les essais de la veille, par exemple). */
function viderLeNuage() {
  var ui = SpreadsheetApp.getUi();
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_MOTS);
  if (!feuille || feuille.getLastRow() < 2) { ui.alert('Le nuage est déjà vide.'); return; }
  var n = feuille.getLastRow() - 1;
  var reponse = ui.alert('Vider le nuage', 'Supprimer définitivement les ' + n + ' mot(s) enregistré(s) ?', ui.ButtonSet.OK_CANCEL);
  if (reponse !== ui.Button.OK) return;
  feuille.deleteRows(2, n);
  CacheService.getScriptCache().remove('mots');
}

/* ------------------------------------------------------------------ */
/* Application web                                                     */
/* ------------------------------------------------------------------ */

/** Lecture : la liste des mots, dans l'ordre d'arrivée. */
function doGet() {
  var cache = CacheService.getScriptCache();
  var json = cache.get('mots');
  if (!json) {
    json = JSON.stringify({ ok: true, mots: lireMots_() });
    try { cache.put('mots', json, DUREE_CACHE); } catch (e) { /* liste trop longue pour le cache : on s'en passe */ }
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/** Écriture : un mot ou une inscription. */
function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return repondre_({ ok: false, erreur: 'format' }); }
  if (!d || typeof d !== 'object') return repondre_({ ok: false, erreur: 'format' });

  var verrou = LockService.getScriptLock();
  try { verrou.waitLock(25000); } catch (err) { return repondre_({ ok: false, erreur: 'occupé' }); }
  try {
    // Un même envoi peut arriver deux fois (réseau instable, nouvelle tentative) : on ne l'enregistre qu'une fois.
    var cache = CacheService.getScriptCache();
    var id = propre_(d.id, 64);
    if (id && cache.get('id:' + id)) return repondre_({ ok: true, doublon: true });

    var resultat;
    if (d.type === 'mot') resultat = enregistrerMot_(d);
    else if (d.type === 'inscription') resultat = enregistrerInscription_(d);
    else resultat = { ok: false, erreur: 'type' };

    if (id && resultat.ok) cache.put('id:' + id, '1', 21600);
    return repondre_(resultat);
  } catch (err) {
    return repondre_({ ok: false, erreur: String(err && err.message || err) });
  } finally {
    verrou.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/* Enregistrements                                                     */
/* ------------------------------------------------------------------ */

function enregistrerMot_(d) {
  var mot = propre_(d.mot, LONGUEUR_MAX_MOT);
  if (!mot || !cle_(mot)) return { ok: false, erreur: 'mot vide' };
  if (estBloque_(mot)) return { ok: true, masque: true };   // réponse identique côté visiteur, mais rien n'est écrit
  feuille_(ONGLET_MOTS).appendRow([new Date(), texte_(mot), texte_(propre_(d.source, 20))]);
  CacheService.getScriptCache().remove('mots');
  return { ok: true };
}

function enregistrerInscription_(d) {
  var prenom = propre_(d.prenom, 60), nom = propre_(d.nom, 60);
  var telephone = propre_(d.telephone, 25), email = propre_(d.email, 120);
  if (!prenom || !nom) return { ok: false, erreur: 'nom et prénom requis' };
  if (!telephone && !email) return { ok: false, erreur: 'téléphone ou e-mail requis' };
  feuille_(ONGLET_INSCRIPTIONS).appendRow([
    new Date(), texte_(prenom), texte_(nom), texte_(telephone), texte_(email),
    d.atelier === 'Non' ? 'Non' : 'Oui', texte_(propre_(d.mot, LONGUEUR_MAX_MOT)), texte_(propre_(d.source, 20))
  ]);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

function feuille_(nom) {
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
  if (!feuille) { installer(); feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom); }
  return feuille;
}

function lireMots_() {
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_MOTS);
  if (!feuille || feuille.getLastRow() < 2) return [];
  return feuille.getRange(2, 2, feuille.getLastRow() - 1, 1).getDisplayValues()
    .map(function (ligne) { return String(ligne[0]).replace(/^'/, '').trim(); })
    .filter(function (mot) { return mot !== ''; });
}

function estBloque_(mot) {
  var cache = CacheService.getScriptCache();
  var json = cache.get('bloques');
  var liste;
  if (json) liste = JSON.parse(json);
  else {
    var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_BLOQUES);
    liste = (!feuille || feuille.getLastRow() < 2) ? [] :
      feuille.getRange(2, 1, feuille.getLastRow() - 1, 1).getDisplayValues()
        .map(function (l) { return cle_(String(l[0])); }).filter(String);
    try { cache.put('bloques', JSON.stringify(liste), 60); } catch (e) {}
  }
  var k = cle_(mot), morceaux = k.split(' ');
  return liste.some(function (b) { return b === k || morceaux.indexOf(b) !== -1; });
}

/** Forme de comparaison : sans accents, en minuscules, lettres et chiffres seulement. */
function cle_(texte) {
  return String(texte).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Nettoie une saisie : caractères de contrôle retirés, espaces réduits, longueur bornée. */
function propre_(valeur, max) {
  return String(valeur == null ? '' : valeur).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Force l'écriture en texte : l'apostrophe initiale empêche Sheets d'interpréter « =… », « +… » ou « 0696… ». */
function texte_(valeur) {
  return valeur === '' ? '' : "'" + valeur;
}

function repondre_(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON);
}
