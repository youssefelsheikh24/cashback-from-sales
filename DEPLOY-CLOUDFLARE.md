# Deploying CashBack Sales to Cloudflare Pages

This app was refactored to run on **Cloudflare Pages (Edge Runtime)** with
**Supabase** (Database + Storage), **Prisma Accelerate** (edge DB access),
**Resend** (email), and **polling** (realtime). Every API route is
`export const runtime = "edge"`.

> **Why Prisma Accelerate and not a direct Supabase connection?**
> Cloudflare's edge runtime has no Node TCP stack, so Prisma's `pg` driver
> cannot be bundled (verified: `next build` fails with `Can't resolve 'fs'` from
> `pgpass`). Accelerate exposes the **same Supabase database** over HTTPS, which
> is the supported way to run Prisma on the edge. Supabase is still the database
> of record. If you prefer zero Accelerate, the alternative is to replace all
> `prisma.*` calls with `@supabase/supabase-js` (PostgREST) — more rewrite.

---

## 0. Database safety

Prisma is scoped to an **isolated schema** `cashback_sales` (`@@schema(...)` on
every model + `schemas = ["cashback_sales"]` in the datasource). `prisma db push`
only creates objects inside that schema. Supabase's `public` schema and any
existing data are never touched.

## 1. Supabase setup (once)

1. Create (or pick) a Supabase project.
2. **Database → Connection string → "Direct connection" (port 5432)** → this is
   your `DIRECT_URL`.
3. **Storage → New bucket** → name it `cashback-sales-refs`, keep it **Private**.
4. **Project Settings → API** → copy the **Project URL** (`SUPABASE_URL`) and the
   **`service_role`** key (`SUPABASE_SERVICE_ROLE_KEY`) — server-only, never public.

## 2. Prisma Accelerate (once)

1. Go to the Prisma Data Platform → create a project → **Accelerate → Enable**.
2. Paste your Supabase **`DIRECT_URL`** as the underlying database connection.
3. Copy the generated **`prisma://accelerate.prisma-data.net/?api_key=...`** URL →
   this is your `DATABASE_URL`.

## 3. Push the schema + seed (locally, one time)

```bash
cp .env.example .env      # fill DATABASE_URL, DIRECT_URL, SUPABASE_*, JWT_SECRET…
npm install
npm run db:push           # uses DIRECT_URL → creates the cashback_sales schema
npm run db:seed           # writes the sales login via Accelerate (DATABASE_URL)
```

## 4. Resend (email)

1. Create a Resend account + API key → `RESEND_API_KEY`.
2. Verify a sending domain, set `RESEND_FROM` (until then use `onboarding@resend.dev`).
   Leave `RESEND_API_KEY` blank to run in dev mode (logs instead of sending).

## 5. Deploy to Cloudflare Pages

Connect the repo in the Cloudflare dashboard (**Workers & Pages → Create → Pages
→ Connect to Git**), then set:

- **Build command:** `npx @cloudflare/next-on-pages@1`
- **Build output directory:** `.vercel/output/static`
- **Environment variables:** add every var from `.env.example`
  (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_STORAGE_BUCKET`, `JWT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`,
  `ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_APP_URL` = your Pages URL).

Cloudflare builds on Linux, where `@cloudflare/next-on-pages` runs cleanly.

> **Local `next-on-pages` on Windows:** the Vercel CLI it wraps is unreliable on
> Windows (it prints this warning itself). Use **WSL** or rely on Cloudflare's CI.
> The edge build itself is verified by `npm run build` (all routes compile to the
> edge runtime). To preview locally on WSL/Linux: `npm run pages:preview`.

## What changed vs the Node version

| Concern | Before (Node server) | After (Cloudflare edge) |
|---|---|---|
| DB driver | Prisma + SQLite file | Prisma + **Accelerate** → Supabase Postgres |
| Schema isolation | single sqlite file | **`cashback_sales`** Postgres schema (`multiSchema`) |
| File storage | local disk `storage/uploads` + `fs` | **Supabase Storage** (private bucket) |
| File download | `fs.readFile` stream | **signed URL** redirect (auth-gated) |
| Email | nodemailer SMTP sockets | **Resend** HTTP API |
| Realtime | in-process `EventEmitter` + SSE | **15s polling** of `/api/notifications` |
| Passwords | bcrypt (cost 12) | **PBKDF2** via Web Crypto (edge-native) |
| Routes | `runtime = "nodejs"` | `runtime = "edge"` |
