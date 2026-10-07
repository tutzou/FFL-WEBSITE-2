# FFL — version Supabase Realtime

Cette version supprime le rafraîchissement automatique de la page. Les données globales passent par Supabase et les navigateurs écoutent Supabase Realtime.

## 1. Supabase

Dans **Supabase → SQL Editor**, exécute entièrement le fichier `supabase.sql`.

Il crée/complète :
- `ffl_admin_state` — maintenance, breaking news, annonce globale
- `ffl_admin_logs` — journal admin
- `ffl_standings` — classement A à F
- `ffl_matches` — résultats de matchs
- `fyfl_stats` — buteurs et passeurs

Realtime est activé pour ces 5 tables.

## 2. Vercel

Dans **Project → Settings → Environment Variables**, ajoute :

- `SUPABASE_URL` = URL de ton projet Supabase
- `SUPABASE_PUBLISHABLE_KEY` = clé Publishable/anon de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = clé service_role de Supabase
- `ADMIN_PASSWORD` = `93240`

**Ne mets jamais `SUPABASE_SERVICE_ROLE_KEY` dans `script.js` ou dans GitHub.**

Après les variables, fais un nouveau déploiement Vercel.

## 3. Ce qui est maintenant en direct

- classement
- résultats de matchs
- breaking news
- annonce globale
- maintenance globale
- journal admin
- STATS buteurs/passeurs
- compteur de personnes connectées avec Supabase Presence

Une action admin écrit dans Supabase. Supabase Realtime prévient ensuite les navigateurs concernés. Le site ne recharge pas la page toutes les secondes.

## 4. Connexion Supabase côté navigateur

Le navigateur récupère uniquement `SUPABASE_URL` et la clé publique via `/api/config`.
La clé service_role reste uniquement dans `/api/admin.js` côté serveur.
