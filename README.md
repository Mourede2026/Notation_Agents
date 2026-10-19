# Évaluation de la performance du personnel – ZS Djidja-Abomey-Agbangnizoun

- `index.html` : formulaire à remplir sur téléphone (4 grilles : sages-femmes, infirmiers, aides-soignants, commis).
- `admin.html` : page administrateur (statistiques par corps, centre et performance), protégée par mot de passe côté serveur Google.

Les données sont envoyées à un Google Sheets via un script Google Apps Script (URL dans la constante `APPS_SCRIPT_URL` des deux fichiers).

## Mise en ligne avec GitHub Pages
1. Créer un dépôt sur GitHub et y déposer `index.html`, `admin.html` et `README.md`.
2. Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)` → Save.
3. Après quelques minutes : formulaire sur `https://<compte>.github.io/<dépôt>/` et administration sur `https://<compte>.github.io/<dépôt>/admin.html`.

Ne jamais déposer le fichier `Code.gs` sur GitHub : il contient le mot de passe administrateur.
