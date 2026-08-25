# Stage Tracker

Site de veille automatisée pour la recherche de stage (janvier–juin 2027) dans
la finance quantitative, les banques d'investissement, l'asset/wealth
management et le conseil, sur Paris, Londres, New York et Tel Aviv.

Chaque jour, un cron Vercel interroge directement les APIs publiques des
plateformes de recrutement (Greenhouse, Lever, Workday, Comeet, TopMatch) de
~61 entreprises cibles, détecte les nouvelles offres de stage et notifie
l'utilisateur en push (PWA) — pas besoin de vérifier chaque site à la main.

**Production** : https://job-tracker-ashy-beta.vercel.app

## Stack

- **Next.js 16** (App Router, TypeScript) — noter que `middleware.ts`
  s'appelle désormais `proxy.ts` dans cette version.
- **Neon Postgres** via l'intégration Vercel, **Drizzle ORM**.
- **Web Push** natif (VAPID, `web-push`) — pas de Firebase.
- **TanStack Table** pour le tableau filtrable/triable.
- Déploiement et cron sur **Vercel** (plan Hobby).

## Fonctionnement du scraping

31 entreprises sont scrapées automatiquement via API JSON publique (pas de
scraping HTML fragile) :

| ATS | Entreprises (exemples) |
|---|---|
| Greenhouse | Jane Street, QRT, Point72, Optiver, Jump Trading, DRW, Hudson River Trading, Man Group, Pagaya... |
| Lever | Palantir |
| Workday | Morgan Stanley, Barclays, Deutsche Bank, BlackRock, PIMCO, Rothschild & Co, Oliver Wyman, Citi, WorldQuant |
| Comeet | Final, Israel Discount Bank, Plus500, eToro |
| TopMatch | Altshuler Shaham, Meitav |

### Comeet : le token public est obligatoire

L'API Comeet répond `400 "Token is missing"` si on ne lui passe pas le token
public de l'entreprise, et attend l'**uid** interne (`C0.009`) et non le slug
lisible de l'URL. Les deux se relisent dans le HTML de
`www.comeet.com/jobs/<slug>/<uid>` (champ `token`), ou dans le JS du
mini-site carrière quand l'entreprise l'héberge elle-même (Plus500).

### TopMatch (redmatch) : l'ATS des maisons d'investissement israéliennes

`careers.topmatch.co.il` expose une API candidat publique non documentée :
`POST /CandidateAPI/api/position/Search/<affiliateGUID>` avec un corps
`{ KeyWords, CategoryId, countryId: 2, cityId }`. L'`affiliateGUID` de chaque
tenant est lisible en clair dans
`careers.topmatch.co.il/<Tenant>/redmatch.settings.js`. Attention : l'API
répond `200` avec un `responseStatus` non nul en cas d'erreur métier, d'où la
vérification explicite dans [`lib/scrapers/topmatch.ts`](lib/scrapers/topmatch.ts).

La liste complète, avec les identifiants techniques (board token, tenant
Workday, etc.), est dans [`lib/companies.ts`](lib/companies.ts).

30 autres entreprises (McKinsey, BCG, Bain, Goldman Sachs, J.P. Morgan,
Citadel, D.E. Shaw, Two Sigma, BNP Paribas, Société Générale, Bank Leumi,
Bank Hapoalim, Bank of Israel, TASE...) n'ont pas d'API JSON publique fiable
(Taleo, Talentsoft, SPA maison JS-lourdes). Elles restent listées avec leur
lien direct mais hors du cron automatique — volontairement, pour ne pas
dépendre d'un service de scraping tiers payant. Leur `careersUrl` pointe vers
la vue la plus précise disponible, et directement sur les postes étudiants
quand le site accepte un filtre en paramètre d'URL (cas de la Bank of Israel,
qui tourne sur SuccessFactors).

### Détection des offres de stage

Plutôt qu'un simple filtre par mot-clé sur le titre (peu fiable — beaucoup
d'entreprises ne mettent ni "intern" ni la ville dans le titre), chaque
scraper extrait le signal le plus structuré disponible sur sa plateforme :

- **Workday** : facette `workerSubType` (valeur `Intern`), découverte
  dynamiquement par tenant.
- **Greenhouse** : champ `metadata` (`Employment Type`, `Duration`, ou
  `Workflow` selon l'entreprise).
- **Lever** : champ `categories.commitment`.
- **Comeet** : `employment_type` **et** `experience_level` concaténés — une
  offre `experience_level="Student"` mais `employment_type="Part-time"` est
  bien un job étudiant.
- **TopMatch** : aucun champ de type de contrat → repli sur le titre.

Le titre reste un filet de sécurité en repli.

#### Filtrage par niveau de poste

Deux pièges rendaient la liste inutilisable et sont désormais traités dans
[`lib/keywords.ts`](lib/keywords.ts) :

1. **Matching par mot entier.** En inclusion simple, `"intern"` matche
   `"INTERNational"` et `"INTERNal"` — d'où des offres comme *« Internal
   Audit – Business Audit Associate/Vice President »* (BlackRock) classées
   comme stages. Les termes latins sont donc comparés avec des frontières de
   mot ; les termes hébreux gardent l'inclusion simple, `\b` se basant sur
   `[A-Za-z0-9_]` et ne fonctionnant pas avec l'hébreu.
2. **Exclusion des postes séniors.** `classifySeniority()` écarte les
   intitulés d'encadrement (VP, Director, Head of, Senior, Principal,
   Managing Director, Team Lead, `בכיר`, `מנהל`...). La liste est
   volontairement conservatrice : pas de `lead` seul (« Lead Generation »
   est un poste marketing), pas de `md`, et pas d'`analyst` qui désigne le
   poste d'entrée en banque d'affaires. Les tournures où *senior* qualifie
   l'année d'études et non le poste (« Summer Analyst – Rising Seniors »)
   sont neutralisées au préalable.

Le résultat est stocké dans `job_postings.seniority_status`
(`junior` / `senior` / `unknown`) et pilotable depuis la case **« Masquer les
postes séniors »** du tableau, active par défaut.

Les offres déjà en base sont **reclassées automatiquement** : le cron
réévalue les annonces déjà connues au lieu de les ignorer, sinon une offre
mal classée par une version antérieure des règles le resterait
indéfiniment. Le compteur `totalReclassified` du résumé de scrape indique
combien de lignes ont changé de classement.

#### Offres israéliennes

Les offres israéliennes sont rédigées en hébreu et ne contiennent jamais
« intern » ni « stage » : [`lib/keywords.ts`](lib/keywords.ts) reconnaît donc
`סטודנט` (étudiant), `מתמחה` (stagiaire) et `התמחות` (stage). La racine
`סטודנט` couvre par sous-chaîne toutes les formes de l'écriture inclusive
israélienne (`סטודנט/ית`, `סטודנט/סטודנטית`...).

Côté villes, la finance israélienne déborde largement de Tel Aviv (Meitav à
Bnei Brak, ION à Herzliya, Discount à Rishon LeZion, la Bank of Israel à
Jérusalem) : l'agglomération entière est dans `CITY_TERMS`, en translittéré
et en hébreu. Les intitulés étant saisis à la main, la comparaison aplatit
au préalable les espaces multiples (vu chez Analyst IMS : `"תל  אביב"`). Voir
[`lib/keywords.ts`](lib/keywords.ts) et [`lib/scrapers/`](lib/scrapers/).

## Développement local

```bash
npm install
vercel env pull .env.local --yes   # récupère les secrets depuis Vercel
npm run dev
```

Migrations de schéma :

```bash
npx drizzle-kit generate   # génère une migration après modif de lib/db/schema.ts
npx drizzle-kit migrate    # l'applique sur la base Neon
```

Déclencher un scrape manuellement (nécessite `CRON_SECRET`) :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://job-tracker-ashy-beta.vercel.app/api/cron/scrape
```

## Variables d'environnement

Toutes posées via `vercel env add`, jamais commitées :

| Variable | Usage |
|---|---|
| `DATABASE_URL` | Connexion Neon (auto via intégration Vercel) |
| `VAPID_PUBLIC_KEY` / `NEXT_PUBLIC_VAPID_KEY` / `VAPID_PRIVATE_KEY` | Web Push |
| `SESSION_SECRET` | Signature JWT de session (`lib/session.ts`) |
| `SITE_PASSWORD_HASH` | Hash SHA-256 du mot de passe d'accès au site |
| `CRON_SECRET` | Vérifie que `/api/cron/scrape` est appelé par Vercel Cron |

## Structure

```
app/
  api/cron/scrape/     # déclenché 1x/jour par vercel.json
  api/push/subscribe/  # abonnement/désabonnement Web Push
  api/jobs/             # liste des offres + statut de candidature
  login/                # page de connexion par mot de passe
proxy.ts                # protège toutes les routes sauf /login et /api/cron
lib/
  companies.ts          # config des 61 entreprises cibles
  keywords.ts            # logique de matching stage/ville
  scrapers/               # un module par type d'ATS
  db/                      # schéma Drizzle + client Neon
  push.ts                  # envoi des notifications Web Push
components/
  JobsTable.tsx          # tableau principal (TanStack Table)
  PushToggle.tsx          # bouton d'abonnement aux notifications
public/
  sw.js                  # service worker (réception des push)
  manifest.json           # manifest PWA
```

## Limitations connues

- Les entreprises `ats: "manual"` dans `lib/companies.ts` ne sont pas
  scrapées automatiquement (voir plus haut).
- Les tokens Comeet et les `affiliateGUID` TopMatch sont publics mais figés
  en dur : si une entreprise régénère le sien, son scraper tombera en erreur
  (visible dans `scrape_runs`) et il faudra le relire sur sa page carrière.
