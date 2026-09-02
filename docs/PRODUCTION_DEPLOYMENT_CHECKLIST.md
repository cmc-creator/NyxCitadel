# NyxCitadel - Production Deployment & Vercel Launch Checklist

This document provides a step-by-step guide for deploying **NyxCitadel** to production on **Vercel** with a PostgreSQL database.

For stage gates (private beta vs public launch vs enterprise), see `docs/GO_LIVE_PUNCHLIST.md`.

---

## 1. Prerequisites & Environment Setup

### Required Vercel Environment Variables
Configure the following in your Vercel Project Settings → **Environment Variables**:

| Environment Variable | Description | Example Value |
| :--- | :--- | :--- |
| `POSTGRES_PRISMA_URL` | Pooled Postgres connection URL | `postgresql://user:pass@host:5432/nyxcitadel?sslmode=require` |
| `POSTGRES_URL_NON_POOLING` | Direct connection URL for migrations | `postgresql://user:pass@host:5432/nyxcitadel?sslmode=require` |
| `NEXTAUTH_SECRET` | 64-character random hex string | `openssl rand -hex 32` |
| `NEXTAUTH_URL` | Production URL | `https://nyxcitadel.vercel.app` |
| `APP_URL` | Production URL | `https://nyxcitadel.vercel.app` |
| `ANTHROPIC_API_KEY` | Key for Sentry AI assistant | `sk-ant-api03-...` |
| `CRON_SECRET` | Secret token protecting cron endpoints | `openssl rand -hex 16` |
| `SMTP_HOST` | Email server host | `smtp.resend.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email server username | `resend` |
| `SMTP_PASSWORD` | Email server password / API key | `re_123456789` |
| `SMTP_FROM` | Branded email sender identity | `NyxCitadel Alerts <alerts@nyxcitadel.com>` |

### Optional / stage-gated variables

| Environment Variable | Description | Notes |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe secret key | Required for live paid checkout (Stage B) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Required with live Stripe |
| `STRIPE_PRICE_ID` | Default subscription price id | Required with live Stripe |
| `ENABLE_DEMO_TOOLS` | Demo admin tooling | Must be unset/`false` in production |

For private beta vs public vs enterprise stage gates, see `docs/GO_LIVE_PUNCHLIST.md`.

---

## 2. Database Schema Push & Seeding

Deploy your Prisma database schema to production using dotenv:

```powershell
# 1. Pull production environment variables locally
npx vercel env pull .env.production.local

# 2. Push Prisma schema to production PostgreSQL
npx dotenv -e .env.production.local -- npx prisma db push

# 3. Seed production starter data (Admin account & AZ ADHS rule set)
npx dotenv -e .env.production.local -- npx tsx prisma/seed-clean.ts
```

---

## 3. Automated Cron Endpoints Verification

Verify that Vercel Cron jobs or external schedulers can reach protected endpoints using your `CRON_SECRET`:

```powershell
# Compliance Alert Engine
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://nyxcitadel.vercel.app/api/cron/compliance-alerts

# Weekly Summary Exports
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://nyxcitadel.vercel.app/api/cron/export-summaries

# Regulatory Web Scraper
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://nyxcitadel.vercel.app/api/cron/scrape
```

---

## 4. Post-Deployment Smoke Test Routine

1. **Sign in as initial Admin**: `admin@example.com` (password configured during seed).
2. **Test Sentry AI**: Open floating Sentry AI co-pilot in bottom right corner; type "What are Joint Commission HVA requirements?".
3. **Launch Genius Tour**: Click **`Genius Tour`** in topbar; verify multi-page navigation from `/dashboard` to `/board-report`.
4. **Test Quick User Add**: Open Admin Control Panel (`/admin`); click `+ Add User & Temp Password`.
5. **Test Survey War Room**: Navigate to `/surveys/war-room`; test logger and surveyor evidence pack export.
