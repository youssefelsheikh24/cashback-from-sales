# Deploying CashBack Sales to Railway

**Architecture:** Next.js (App Router) → Railway Node.js runtime → Prisma →
**MongoDB Atlas** (direct). **Supabase Storage** holds uploaded reference files.
Email via **Resend**. No Cloudflare, no Prisma Accelerate, no edge runtime.

```
Railway  →  npm install  →  prisma generate  →  next build  →  next start  →  MongoDB Atlas
```

---

## 1. MongoDB Atlas

1. **New database user + password** (Atlas → Database Access). Do NOT reuse any
   previously shared password — treat the old one as compromised.
2. Connection string: Atlas → **Connect → Drivers** → copy the `mongodb+srv://…`
   string, then insert the isolated database name **`/cashback_sales`** before
   the `?`. That becomes `DATABASE_URL`.
3. **Network Access** (Atlas → Network Access → IP Access List):
   - **Initial test (simplest):** add `0.0.0.0/0` (allow from anywhere) — Railway
     egress IPs are dynamic, so this is the quickest way to confirm it works.
   - **Tighten after confirming:** replace `0.0.0.0/0` with Railway's static
     egress IPs once you enable them (Railway → service → Settings → Networking
     → Static Outbound IPs), or connect via a private peering setup.

Isolation: Prisma only reads/writes the `cashback_sales` database named in the
URI — the rest of the cluster is untouched. `db push` is non-destructive (creates
collections/indexes; never drops).

## 2. Supabase Storage (files only)

1. Supabase → **Storage → New bucket** → `cashback-sales-refs`, **Private**.
2. **Project Settings → API** → copy **Project URL** (`SUPABASE_URL`) and the
   **`service_role`** key (`SUPABASE_SERVICE_ROLE_KEY`) — server-only.

## 3. Resend (email) — optional

Create an API key (`RESEND_API_KEY`) + verified sender (`RESEND_FROM`). Leave the
key blank to run in dev mode (logs the notification, `emailSent:false`).

## 4. Local: push schema + seed (once)

```bash
cp .env.example .env      # fill DATABASE_URL (Atlas), SUPABASE_*, JWT_SECRET, admin…
npm install
npx prisma generate
npx prisma db push        # creates cashback_sales collections + indexes (non-destructive)
npm run db:seed           # creates the sales login from ADMIN_* in .env
```

## 5. Deploy on Railway

1. **New Project → Deploy from GitHub repo** (point at this app's directory).
2. **Variables** — add every key from `.env.example`:
   `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SUPABASE_STORAGE_BUCKET`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `ADMIN_NAME`, `RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_NOTIFICATION_EMAIL`,
   `NEXT_PUBLIC_APP_URL` (= your Railway public URL). **Do NOT set `PORT`** —
   Railway injects it and `next start` binds to it automatically.
3. Railway auto-detects Next.js (Nixpacks) and runs:
   - Build: `npm run build`  (→ `prisma generate && next build`)
   - Start: `npm run start`   (→ `next start -H 0.0.0.0`)
   If you set commands manually, use exactly those.
4. First deploy: run `npx prisma db push` + `npm run db:seed` once (locally
   against Atlas, or via `railway run`).

## Node version
`package.json` → `engines.node >= 18.18.0` (Next 14 minimum). Railway honors it.

## Security
- Credentials live ONLY in local `.env` (gitignored) and Railway Variables.
  Never in source, the Prisma schema, or committed files.
- The Atlas password previously pasted in chat is compromised — do not reuse it.
