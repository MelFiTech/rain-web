# Rain Web

Institution dashboard for **Rain** — the Risk Analysis & Intelligence Network.

Rain helps licensed fintechs, microfinance banks, and payment companies share fraud signals safely. When one member reports a suspicious identity, others can **verify** the same person at onboarding and see whether the network already flagged them — with confidence levels and clear **recommendations** (proceed, review, or decline).

## Problem

Fraudsters reuse the same phone numbers, BVNs, accounts, and emails across providers. A scam at one institution rarely stays visible to the next. Rain gives members a **shared intelligence layer**: structured reports, cross-institution matching, and wallet-based usage so contributing data and running checks fits existing ops.

## Who it’s for

- **Compliance and fraud teams** at MFIs, fintechs, and PSPs in Nigeria  
- **Operations staff** who run customer checks during onboarding or reviews  
- **Developers** at member institutions integrating Rain via API (docs ship in this app at `/docs`)

Rain is **not** a consumer app. End customers never log in here; only institution users do.

## What this repo is

**rain-web** is the Next.js frontend. It talks to the **Rain API** ([rain-api](https://github.com/MelFiTech/rain-api) — separate repository) over HTTPS. Set `NEXT_PUBLIC_API_URL` to your deployed API (or local `rain-api` while developing). Auth, verifications, reports, wallet (Monnify funding), earnings, team, and webhooks all live on the backend; payments and webhook URLs are configured there, not in this project.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Rain API base — local: `http://localhost:9090`; prod: `https://rain-api-production.up.railway.app` |
| `NEXT_PUBLIC_DOCS_API_BASE` | Developer API base for docs — local: `http://localhost:9090/v1`; prod: `https://rain-api-production.up.railway.app/v1` |
| `NEXT_PUBLIC_SESSION_INACTIVITY_MINUTES` | Auto logout when idle (default `10`) |

Run **rain-api** locally (or point at your deployed API) before using login, verify, wallet, or reports.

### Production API (Railway)

Deployed **rain-api** base URL:

`https://rain-api-production.up.railway.app`

Example `.env.local` for production frontend builds:

```env
NEXT_PUBLIC_API_URL=https://rain-api-production.up.railway.app
NEXT_PUBLIC_DOCS_API_BASE=https://rain-api-production.up.railway.app/v1
NEXT_PUBLIC_SESSION_INACTIVITY_MINUTES=10
```

Institution routes use `/platform/*`; the developer API and docs examples use `/v1/*` on the same host.

## Main routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview and recent activity |
| `/verify` | Check an identifier against the network |
| `/report` | Submit a fraud report |
| `/history` | Verification log and export |
| `/reports` | Your institution’s submitted reports |
| `/wallet` | Balance and Monnify wallet funding |
| `/earnings` | Rewards when your reports help others |
| `/team` | Members and invites |
| `/settings` | Profile, settlement bank, API keys, webhooks |
| `/docs` | Developer API documentation |

## Scripts

```bash
npm run dev     # local development
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

## Demo access

Use accounts created by **rain-api** seed data (see rain-api `README.md`). Typical demo institution: PayNest (`compliance@paynest.ng`).
