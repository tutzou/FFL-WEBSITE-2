# FFL Website

## Ajouts
- Classement noir A à F avec les données des captures CopaFacil.
- 24 équipes avec logos issus des captures fournies.
- Rubrique Matchs retirée.
- Panneau admin protégé par ADMIN_PASSWORD (93240 à mettre dans Vercel).
- Résultats de match par poule : victoire 3 pts, nul 1 pt chacun, défaite 0. Scores optionnels mais utilisés pour BP/BC.
- Breaking news, annonces globales, maintenance globale, compteur Presence et journal admin.
- Musique douce avec bouton couper/réactiver.

## Supabase
1. Exécute `supabase.sql` dans SQL Editor.
2. Dans Vercel, ajoute `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD=93240`.
3. Dans `script.js`, remplace `YOUR_SUPABASE_URL` et `YOUR_SUPABASE_PUBLISHABLE_KEY`.
4. Déploie sur Vercel.

Le double-clic sur `index.html` permet de tester l'interface et le classement localement, mais les fonctions globales temps réel nécessitent Vercel + Supabase.
