/**
 * Réception des évaluations de performance (ZS Djidja-Abomey-Agbangnizoun)
 * Deux onglets sont créés automatiquement :
 *  - "Evaluations" : une ligne par évaluation (note, %, décision)
 *  - "Details"     : une ligne par critère (pour les analyses futures)
 */
const SHEET_ID = '13a2OaVoepnyXtCvPw7-cEK1C1cAxE_d8xz4tEL9lt8k';

// Mot de passe de la page administrateur (reste ici, côté serveur Google : ne JAMAIS le mettre sur GitHub).
const ADMIN_PASSWORD = 'admin123';

// Code d'accès optionnel pour les agents. Laissez '' pour ne rien exiger.
// Si vous le renseignez, le formulaire demandera ce code une seule fois à chaque téléphone.
const ACCESS_CODE = '';

// Anti-devinette du mot de passe : blocage après N échecs, pendant X secondes
const MAX_ECHECS = 5;
const BLOCAGE_SEC = 900;

const ENTETE_EVAL = ['Reçu le (serveur)', 'ID', 'Date évaluation', 'Période', 'Corps', 'Centre de santé',
  'Nom et prénom', 'Qualification', 'Évaluateur', 'Note', 'Maximum', 'Performance', 'Décision'];
const ENTETE_DETAIL = ['ID', 'Date évaluation', 'Corps', 'Centre de santé', 'Nom et prénom',
  'Section', 'Code critère', 'Critère', 'Note', 'Maximum', 'Non applicable'];

function decision_(p) {
  if (p >= 80) return 'Très bon – reconduire';
  if (p >= 60) return 'Reconduire avec réserve – contrat de 3 mois';
  return 'Blâme – contrat non renouvelé';
}

function feuille_(ss, nom, entete) {
  let sh = ss.getSheetByName(nom);
  if (!sh) {
    sh = ss.insertSheet(nom);
    sh.appendRow(entete);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, entete.length).setFontWeight('bold').setBackground('#e6f2ec');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, message: 'Serveur d’évaluation actif' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.action === 'admin') return admin_(d);
    if (ACCESS_CODE && String(d.code || '') !== ACCESS_CODE) return json_({ ok: false, error: 'ACCES' });
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const shE = feuille_(ss, 'Evaluations', ENTETE_EVAL);
    const shD = feuille_(ss, 'Details', ENTETE_DETAIL);

    // Anti-doublon : un même ID n'est enregistré qu'une fois (renvois automatiques)
    const n = shE.getLastRow();
    if (n > 1) {
      const ids = shE.getRange(2, 2, n - 1, 1).getValues().flat();
      if (ids.indexOf(d.id) !== -1) return json_({ ok: true, doublon: true });
    }

    const pct = Number(d.pourcentage) || 0;
    shE.appendRow([new Date(), d.id, d.date, d.periode, d.corps_libelle, d.centre, d.nom,
      d.qualification, d.evaluateur, Number(d.note), Number(d.maximum), pct / 100, decision_(pct)]);
    shE.getRange(shE.getLastRow(), 12).setNumberFormat('0.0%');

    const lignes = (d.details || []).map(x => [d.id, d.date, d.corps_libelle, d.centre, d.nom,
      x.section, x.code, x.item, Number(x.note), Number(x.max), x.na ? 'oui' : '']);
    if (lignes.length) {
      shD.getRange(shD.getLastRow() + 1, 1, lignes.length, ENTETE_DETAIL.length).setValues(lignes);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lecture des données pour la page administrateur (protégée par mot de passe) */
function admin_(d) {
  if (ADMIN_PASSWORD === 'CHANGER_MOT_DE_PASSE') {
    return json_({ ok: false, error: 'Mot de passe administrateur non configuré dans Code.gs.' });
  }
  const cache = CacheService.getScriptCache();
  const echecs = Number(cache.get('adm_echecs') || 0);
  if (echecs >= MAX_ECHECS) {
    return json_({ ok: false, error: 'Trop de tentatives. Réessayez dans ' + Math.round(BLOCAGE_SEC / 60) + ' minutes.' });
  }
  if (String(d.password || '') !== ADMIN_PASSWORD) {
    cache.put('adm_echecs', String(echecs + 1), BLOCAGE_SEC);
    return json_({ ok: false, error: 'Mot de passe incorrect.' });
  }
  cache.remove('adm_echecs');
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const tz = ss.getSpreadsheetTimeZone();
  const txt = v => (v instanceof Date) ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v == null ? '' : v);

  const shE = ss.getSheetByName('Evaluations');
  const shD = ss.getSheetByName('Details');
  const evals = [], details = [];

  if (shE && shE.getLastRow() > 1) {
    shE.getRange(2, 1, shE.getLastRow() - 1, ENTETE_EVAL.length).getValues().forEach(r => {
      evals.push({
        recu: (r[0] instanceof Date) ? Utilities.formatDate(r[0], tz, 'yyyy-MM-dd HH:mm') : txt(r[0]),
        id: txt(r[1]), date: txt(r[2]), periode: txt(r[3]), corps: txt(r[4]), centre: txt(r[5]),
        nom: txt(r[6]), qualification: txt(r[7]), evaluateur: txt(r[8]),
        note: Number(r[9]), maximum: Number(r[10]), pct: Math.round(Number(r[11]) * 1000) / 10
      });
    });
  }
  if (shD && shD.getLastRow() > 1) {
    shD.getRange(2, 1, shD.getLastRow() - 1, ENTETE_DETAIL.length).getValues().forEach(r => {
      details.push({ id: txt(r[0]), section: txt(r[5]), code: txt(r[6]), item: txt(r[7]),
        note: Number(r[8]), max: Number(r[9]), na: r[10] === 'oui' });
    });
  }
  return json_({ ok: true, evals: evals, details: details });
}
