# Évaluation de la performance du personnel – ZS Djidja-Abomey-Agbangnizoun

- `index.html` : formulaire à remplir sur téléphone (4 grilles : sages-femmes, infirmiers, aides-soignants, commis).
- `admin.html` : page administrateur (statistiques par corps, centre et performance), protégée par mot de passe côté serveur Google.
- `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png` : permettent d’ouvrir le formulaire **sans connexion** et de l’installer sur l’écran d’accueil.

Les données sont envoyées à un Google Sheets via un script Google Apps Script (URL dans la constante `APPS_SCRIPT_URL` des deux fichiers HTML).

## Fonctionnement hors connexion
1. Ouvrir le lien **une première fois avec internet** : le formulaire se copie dans le téléphone.
2. Ensuite il s’ouvre sans connexion. Une évaluation commencée est sauvegardée automatiquement en brouillon.
3. Sans connexion, « Enregistrer » garde l’évaluation sur le téléphone ; elle est envoyée toute seule au retour du réseau.

## Mise en ligne avec GitHub Pages
1. Créer un dépôt sur GitHub et y déposer **tous** les fichiers de ce dossier (sauf `Code.gs`, qui ne va jamais sur GitHub).
2. Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)` → Save.
3. Après quelques minutes : formulaire sur `https://<compte>.github.io/<dépôt>/` et administration sur `https://<compte>.github.io/<dépôt>/admin.html`.

Ne jamais déposer le fichier `Code.gs` sur GitHub : il contient le mot de passe administrateur.
