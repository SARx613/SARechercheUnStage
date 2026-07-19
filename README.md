# Stage Tracker

Site de veille automatisée pour la recherche de stage (janvier–juin 2027) dans
la finance quantitative, les banques d'investissement, l'asset/wealth
management et le conseil, sur Paris, Londres, New York et Tel Aviv.

Chaque jour, un cron Vercel interroge directement les APIs publiques des
plateformes de recrutement (Greenhouse, Lever, Workday, Comeet) de ~25
entreprises cibles, détecte les nouvelles offres de stage et notifie
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

23 entreprises sont scrapées automatiquement via API JSON publique (pas de
scraping HTML fragile) :

| ATS | Entreprises (exemples) |
|---|---|
| Greenhouse | Jane Street, QRT, Point72, Optiver, Jump Trading, DRW, Hudson River Trading, Man Group... |
| Lever | Palantir |
| Workday | Morgan Stanley, Barclays, Deutsche Bank, BlackRock, PIMCO, Rothschild & Co, Oliver Wyman, Citi, WorldQuant |
| Comeet | eToro |

La liste complète, avec les identifiants techniques (board token, tenant
Workday, etc.), est dans [`lib/companies.ts`](lib/companies.ts).

22 autres entreprises (McKinsey, BCG, Bain, Goldman Sachs, J.P. Morgan,
Citadel, D.E. Shaw, Two Sigma, BNP Paribas, Société Générale...) n'ont pas
d'API JSON publique fiable (Taleo, Talentsoft, sites propriétaires JS-lourds).
Elles restent listées avec leur lien direct mais hors du cron automatique —
volontairement, pour ne pas dépendre d'un service de scraping tiers payant.

### Détection des offres de stage

Plutôt qu'un simple filtre par mot-clé sur le titre (peu fiable — beaucoup
d'entreprises ne mettent ni "intern" ni la ville dans le titre), chaque
scraper extrait le signal le plus structuré disponible sur sa plateforme :

- **Workday** : facette `workerSubType` (valeur `Intern`), découverte
  dynamiquement par tenant.
- **Greenhouse** : champ `metadata` (`Employment Type`, `Duration`, ou
  `Workflow` selon l'entreprise).
- **Lever** : champ `categories.commitment`.

Le titre reste un filet de sécurité en repli. Voir
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
  companies.ts          # config des ~45 entreprises cibles
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

- eToro (Comeet) renvoie actuellement une erreur 400 — l'endpoint a
  probablement changé de format.
- Les entreprises `ats: "manual"` dans `lib/companies.ts` ne sont pas
  scrapées automatiquement (voir plus haut).
