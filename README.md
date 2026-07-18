# Rain — Risk Analysis & Intelligence Network

Frontend-only application for verified fintechs and banks to report suspicious users and check whether other institutions have reported them.

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- Mock service layer (swap later for real API)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `compliance@paynest.ng` |
| Password | `password123`           |

## Pages

| Route       | Description                                      |
| ----------- | ------------------------------------------------ |
| `/login`    | Institution login                                |
| `/dashboard`| Overview, quick verify, recent activity          |
| `/verify`   | Full verification flow + results                 |
| `/report`   | Report a user (form → review → success)          |
| `/history`  | Verification history with filters + CSV export   |
| `/reports`  | My reports with detail modal                     |
| `/wallet`   | Balance, mock Monnify funding, transactions      |
| `/earnings` | Available / pending / lifetime rewards           |
| `/team`     | Invite, change role, deactivate members          |
| `/settings` | Profile, password, notifications, sessions       |

## Mock architecture

Services live under `src/services/`. Pages call these functions only — no hardcoded fetch URLs. Replace implementations with real backend clients when APIs are ready.

```
src/services/
  auth.ts
  dashboard.ts
  verification.ts
  reports.ts
  wallet.ts
  earnings.ts
  team.ts
  settings.ts
  mock-data.ts
```

## Verification demo tips

- Identifiers ending in `9` return a **match**
- Use `fraud@test.ng` for a match
- Known triggers: `0123456789`, `08031234567`, `12345678901`

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # serve production build
npm run lint   # eslint
```

## Scope notes

This repository is **frontend only**. Authentication, payments (Monnify), confidence calculation, and developer APIs are mocked and will be provided by the backend.
