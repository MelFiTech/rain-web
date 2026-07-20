# Rain — Risk Analysis & Intelligence Network

Frontend for verified fintechs and banks to report suspicious users and check whether other institutions have reported them.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- HTTP service layer via `NEXT_PUBLIC_API_URL`

## Getting started

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your Rain backend

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route       | Description                                      |
| ----------- | ------------------------------------------------ |
| `/login`    | Institution login                                |
| `/dashboard`| Overview, quick verify, recent activity          |
| `/verify`   | Full verification flow + results                 |
| `/report`   | Report a user (form → review → success)          |
| `/history`  | Verification history with filters + CSV export   |
| `/reports`  | My reports with detail modal                     |
| `/wallet`   | Balance, Monnify funding, transactions           |
| `/earnings` | Available / pending / lifetime rewards           |
| `/team`     | Invite, change role, deactivate members          |
| `/settings` | Profile, password, notifications, sessions       |
| `/docs`     | Developer API documentation (verify & reports)   |

## Developer documentation

Integration guides for verifying users and submitting reports over the API live at **[`/docs`](/docs)** when running locally. API keys and webhooks are managed under **Settings → API & webhooks** in the app.

## API integration

All data access goes through `src/services/`. The shared client is `src/lib/api-client.ts` (Bearer token from login session).

Without `NEXT_PUBLIC_API_URL`, reads return empty state and writes show a configuration error. Wire your backend to the paths used in each service file (for example `POST /auth/login`, `GET /dashboard`, `POST /verifications/verify`, `GET /wallet`, `POST /wallet/fund/sessions`).

```
src/lib/
  api-client.ts
  session.ts
  empty-states.ts
src/services/
  auth.ts
  dashboard.ts
  verification.ts
  reports.ts
  wallet.ts
  earnings.ts
  team.ts
  settings.ts
```

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # serve production build
npm run lint   # eslint
```

## Scope notes

This repository is the **Rain web app**. Authentication, payments (Monnify), confidence scoring, and developer APIs are implemented on the backend this app calls.
