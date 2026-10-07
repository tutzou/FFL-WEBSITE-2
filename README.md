# FFL — version finale Supabase Realtime

## IMPORTANT
1. Téléverse **tout le contenu** de ce ZIP dans le dépôt GitHub, en gardant le dossier `assets/` et le dossier `api/`.
2. Dans Supabase > SQL Editor, exécute **tout** `supabase.sql`.
3. Dans Vercel > Settings > Environment Variables, ajoute pour Production, Preview et Development :
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Fais ensuite un **nouveau déploiement** Vercel. Les nouvelles variables ne sont pas appliquées à un ancien déploiement.

Le navigateur ne reçoit jamais la service role key. Les écritures admin passent par `/api/admin` puis Supabase. Les visiteurs lisent Supabase avec la clé publique et écoutent Realtime.

### Temps réel
- classement
- résultats
- STATS buteurs/passeurs
- breaking news
- annonce globale
- maintenance
- journal admin
- compteur de connectés avec Supabase Presence

### Logos
Tous les logos FFL et les 24 logos d'équipes sont inclus dans `/assets/` et sont référencés avec des chemins absolus `/assets/...` pour fonctionner aussi après navigation sur le site.
