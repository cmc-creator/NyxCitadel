# Private Beta Go-Live Runbook

Copy-paste runbook to take NyxCitadel live for **invited founding / pilot facilities** (Stage A).

Related:
- Stage gates: `docs/GO_LIVE_PUNCHLIST.md`
- Full deploy notes: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Smoke script: `scripts/smoke-prod.sh`

Replace `https://YOUR_DOMAIN` with your production URL (example: `https://nyxcitadel.com` or your Vercel URL).

---

## 0) Generate secrets (local machine)

```bash
echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)"
echo "CRON_SECRET=$(openssl rand -hex 32)"
echo "ICAL_SECRET=$(openssl rand -hex 32)"
```

Store these only in Vercel / your secret manager. Never commit them.

---

## 1) Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, set at least **Production**.

### Required for private beta

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` **or** `POSTGRES_PRISMA_URL` / `POSTGRES_URL` | Postgres connection string | Use the pooled URL for runtime |
| `POSTGRES_URL_NON_POOLING` | Direct Postgres URL | Needed for migrations / `db push` |
| `NEXTAUTH_SECRET` | from step 0 | Also accepted as `AUTH_SECRET` |
| `NEXTAUTH_URL` | `https://YOUR_DOMAIN` | Must match the public URL |
| `APP_URL` | `https://YOUR_DOMAIN` | Used in emails / redirects |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_DOMAIN` | Client-visible app URL |
| `NEXT_PUBLIC_APP_NAME` | `NyxCitadel` | Optional branding |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Required for Sentry AI |
| `CRON_SECRET` | from step 0 | Protects `/api/cron/*` |
| `SMTP_HOST` | e.g. `smtp.sendgrid.net` | Required for alerts / onboarding mail |
| `SMTP_PORT` | `587` | Use `465` only if your provider requires it |
| `SMTP_USER` | provider username | SendGrid often uses `apikey` |
| `SMTP_PASSWORD` | provider password/API key | `SMTP_PASS` also accepted by code |
| `SMTP_FROM` | `NyxCitadel <noreply@YOUR_DOMAIN>` | Must be allowed by your ESP |

### Must be OFF in production

| Variable | Value |
| :--- | :--- |
| `ENABLE_DEMO_TOOLS` | unset or `false` |

### Optional for private beta (skip until public paid launch)

| Variable | When needed |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | Live checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks |
| `STRIPE_PRICE_ID` | Subscription price |
| `TWILIO_*` | SMS alerts |
| `ICAL_SECRET` | Calendar feed URLs |

### Seed overrides (use when running clean seed against prod)

| Variable | Example |
| :--- | :--- |
| `SEED_FACILITY_NAME` | `Destiny Springs Healthcare` |
| `SEED_ADMIN_EMAIL` | `admin@yourfacility.com` |
| `SEED_ADMIN_PASSWORD` | strong unique password |
| `SEED_ADMIN_NAME` | `Site Administrator` |

---

## 2) Deploy

1. Merge latest `main` (includes CI + TypeScript gate).
2. Deploy Production from Vercel (Git integration or `vercel --prod`).
3. Confirm the deployment is Ready and assigned to `YOUR_DOMAIN`.

---

## 3) Database schema + admin bootstrap

Pull production env locally, then apply schema and seed **once**:

```bash
npx vercel env pull .env.production.local

# Schema
npx dotenv -e .env.production.local -- npx prisma migrate deploy
# If you are still on db push for this project:
# npx dotenv -e .env.production.local -- npx prisma db push

# Clean seed (creates facility + admin)
npx dotenv -e .env.production.local -- npm run db:seed:clean
```

If the seed already ran with defaults, rotate the admin password immediately:

```bash
# Example for a known admin email — edit scripts/reset-admin-password.mjs email if needed
node --env-file=.env.production.local scripts/reset-admin-password.mjs 'YourNewStrongPassword!'
```

Then sign in and enable 2FA at `/settings/security`.

---

## 4) Automated smoke checks

```bash
chmod +x scripts/smoke-prod.sh

BASE_URL=https://YOUR_DOMAIN \
CRON_SECRET='paste-from-vercel' \
./scripts/smoke-prod.sh
```

Or via npm:

```bash
BASE_URL=https://YOUR_DOMAIN CRON_SECRET='paste-from-vercel' npm run smoke:prod
```

### What the script verifies

- Public pages return `200` (`/`, `/login`, `/signup`, `/privacy`, `/terms`, `/contact`)
- `/dashboard` requires authentication
- Security headers are present (warns if missing)
- Cron routes return `401` without bearer token and `200` with `CRON_SECRET`
- Demo reset endpoint is not openly usable

Manual curl equivalents:

```bash
# Unauthorized cron (expect 401)
curl -i https://YOUR_DOMAIN/api/cron/scrape
curl -i https://YOUR_DOMAIN/api/cron/compliance-alerts
curl -i https://YOUR_DOMAIN/api/cron/export-summaries

# Authorized cron (expect 200)
curl -i -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/cron/scrape
curl -i -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/cron/compliance-alerts
curl -i -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/cron/export-summaries
```

---

## 5) Manual product smoke (10–15 minutes)

Sign in as the founding admin, then:

1. **Sentry AI** — open the assistant; ask: `What are Joint Commission HVA requirements?`
2. **Calendar** — open `/calendar`; confirm it loads without error
3. **Incident → CAP** — create one incident, attach/create a CAP
4. **Users** — add one non-admin user; confirm they cannot open `/admin`
5. **Export** — download one CSV / report from Export Center
6. **Email** — trigger a password reset or notification and confirm delivery
7. **Onboarding** — run Genius Tour once; confirm no dead links
8. **Admin** — confirm **Reset Demo Data** is **not** visible

---

## 6) Pilot go / no-go

Ship private beta invites only if all are true:

- [ ] Production deploy is live on `YOUR_DOMAIN`
- [ ] Required env vars set; `ENABLE_DEMO_TOOLS` off
- [ ] Admin password is not the seed default; 2FA enabled
- [ ] `npm run smoke:prod` passes
- [ ] Manual product smoke completed
- [ ] Landing page still says private beta / founding customers
- [ ] You have a named support escalation contact for pilots

If any box fails → fix before inviting customers.

---

## 7) First pilot invite checklist

For each founding facility:

1. Create / confirm facility tenant + admin user
2. Send login URL + temporary password out-of-band
3. Require password change + 2FA on first session
4. Agree on pilot success metrics (see `docs/PROCUREMENT_BAA_PACK.md`)
5. Confirm whether a BAA is required before PHI-adjacent workflows

---

## 8) After beta is stable (do not block invites)

These are Stage B / public launch items:

- Wire live Stripe (`STRIPE_*`) and test checkout end-to-end
- Turn on full ESLint CI gate
- Remove private-beta marketing copy
- Only then open self-serve paid signup
