# Invitely — animated e-invitations with ABA PayWay

A self-serve e-invitation platform: customers pick a plan, pay with **ABA PayWay** (KHQR / ABA Mobile / cards), receive an access code, design their invitation in a live editor, and share a link — one for everyone or a personal link per guest.

- **Plans:** 💍 Wedding Premium · 💍 Standard · 🎂 Birthday Premium · 🏡 House Warming (`src/lib/plans.ts`)
- **Templates:** Garden Gate, Royal Gold, Modern Minimal, Birthday Pop, Home Sweet Home (`src/templates/index.ts`)
- **Bilingual:** Khmer & English on every invitation, Khmer numerals and dates
- **Animations:** cover reveal, curtain / envelope / fade openings, falling petals / sparkles / confetti, scroll reveals, music after tap
- **Guests:** personal links (`/i/{slug}?g={token}`), opened tracking, RSVP + wishes, CSV export
- **Admin:** `/admin` — orders, revenue, access codes, manual confirm, promo codes

Rename the brand in `src/config/site.ts` and the logo in `src/components/site/Logo.tsx`.

## How the dynamic templates work

```
Invitation row = { templateId, plan, data (JSON) }
                        │          │       │
src/templates ──────────┘          │       └── validated by invitationDataSchema (src/lib/invitation.ts)
  theme colours, fonts, cover art, │
  opening animation, particles,    └── src/lib/plans.ts → feature flags & limits
  section order
                        ▼
<InvitationRenderer> (src/components/invitation) renders sections from src/components/invitation/sections.tsx
— the same component powers the public page, the editor's live preview and the landing-page phone mockup.
```

**Add a template:** add an object to `TEMPLATES` in `src/templates/index.ts` (pick `cover`, `opening`, `particles`, `sections`, theme colours). For new cover art, add an SVG component in `src/components/invitation/art.tsx`.

**Add an event type / plan:** add it to `EventType` + `PLANS` in `src/lib/plans.ts`, to `EVENT_TYPES` and `emptyInvitation()` in `src/lib/invitation.ts`, and list it in a template's `eventTypes`.

## Payment flow (ABA PayWay)

1. `/create?plan=…` Step 1 → `POST /api/orders` — server validates, prices the plan (+ promo) and creates a `PENDING` order with a unique `tran_id`.
2. Step 2 → `POST /api/payway/purchase` returns fields signed with HMAC-SHA512 (`src/lib/payway.ts`); the browser posts them to PayWay's hosted checkout.
3. PayWay calls `POST /api/payway/callback` (`return_url`). The payload is **not trusted** — we call PayWay's `check-transaction-2` and compare the amount before marking the order `PAID` (idempotent).
4. `/create/status` polls `GET /api/orders/{id}/status` (which also re-checks PayWay), then shows the access code and signs the buyer into the editor.
5. A daily Vercel Cron (`/api/cron/expire-orders`) re-checks stale pending orders and expires the rest.

> ⚠️ Before going live, compare `PURCHASE_HASH_ORDER` in `src/lib/payway.ts` with the API docs PayWay sends you with your merchant account, and test end-to-end in the sandbox.

Without PayWay keys, local development uses a **simulated payment** (`PAYWAY_MOCK=1`); this is disabled in production.

## Run locally

```bash
pnpm install
docker run -d --name invitely-db -e POSTGRES_USER=invitely -e POSTGRES_PASSWORD=invitely -e POSTGRES_DB=invitely -p 5544:5432 postgres:16-alpine
cp .env.example .env        # then edit secrets
pnpm prisma migrate dev
pnpm db:seed                # 4 demo invitations + promo WELCOME10
pnpm dev                    # http://localhost:3000  ·  demo: /i/demo  ·  admin: /admin
pnpm test
```

To receive real PayWay sandbox callbacks locally, expose the app with a tunnel (`cloudflared tunnel --url http://localhost:3000`) and set `APP_URL` to the tunnel URL.

## Deploy to Vercel

1. **Database:** create a Postgres database (Vercel dashboard → Storage → Neon, or neon.tech). Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
2. **Photos/music:** Vercel dashboard → Storage → Blob → connect to the project (adds `BLOB_READ_WRITE_TOKEN`).
3. **Environment variables** (Project → Settings → Environment Variables): `APP_URL` (your https domain), `SESSION_SECRET`, `ADMIN_PASSWORD`, `CRON_SECRET`, `PAYWAY_BASE_URL`, `PAYWAY_MERCHANT_ID`, `PAYWAY_API_KEY`, optional `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`.
4. **Deploy:** `vercel link` then `vercel --prod` (or import the GitHub repo in Vercel).
5. **Migrate + seed** the production DB once: `DATABASE_URL=… DIRECT_URL=… pnpm prisma migrate deploy && pnpm db:seed`.
6. **PayWay:** send ABA your production domain (and Vercel IPs if they ask) to whitelist, then switch `PAYWAY_BASE_URL` to `https://checkout.payway.com.kh` with your production keys.

## Before launch checklist

- [ ] Your brand name, logo, contact links (`src/config/site.ts`)
- [ ] Real Terms & Privacy text (`src/app/terms`, `src/app/privacy`)
- [ ] PayWay sandbox test passes end-to-end, then production keys
- [ ] Cover art / photos you own or have a licence for (demo photos are from Unsplash)
- [ ] Strong `SESSION_SECRET`, `ADMIN_PASSWORD`, `CRON_SECRET`

## Updating the live site

The GitHub repo `Earbunsong/invitely` is connected to the Vercel project `invitely`:

- Push to `main` → Vercel builds and deploys to https://invitely-eta.vercel.app automatically (~1 min).
- Push any other branch → Vercel builds a preview URL to check before merging.
- Database schema changes: run `pnpm prisma migrate dev --name <change>` locally, then apply to Neon with
  `prisma migrate deploy` using the production URLs before (or right after) pushing.
