# NyxCitadel - Hospital Compliance & Risk Management Platform

> White-label compliance, risk management, and emergency management platform for healthcare facilities.
>
> Currently configured for: Destiny Springs Healthcare - Acute Psychiatric Inpatient, Peoria, AZ

---

## Table of Contents

1. [Features](#features)
1. [Tech Stack](#tech-stack)
1. [Prerequisites](#prerequisites)
1. [Local Development Setup](#local-development-setup)
1. [Environment Variables](#environment-variables)
1. [Database Setup](#database-setup)
1. [Running the App](#running-the-app)
1. [Initial Admin Account](#initial-admin-account)
1. [GitHub Repository Setup](#github-repository-setup)
1. [Deployment (Vercel)](#deployment-vercel)
1. [Project Structure](#project-structure)
1. [White-Label Configuration](#white-label-configuration)
1. [Arizona Compliance Modules](#arizona-compliance-modules)
1. [Optional Demo Tooling](#optional-demo-tooling)
1. [Enterprise Readiness Kit](#enterprise-readiness-kit)
1. [Available Scripts](#available-scripts)

---

## Features

| Module | Description |
| :-- | :-- |
| **Compliance Calendar** | Auto-generated calendar for JC, CMS, AZ ADHS, NFPA, and OSHA requirements with suggested dates. |
| **Compliance Tracker** | Track compliance items, statuses, owners, and due dates. |
| **Policy Tracker** | Policy review cycles, expiration alerts, and version control. |
| **Training Tracker** | Staff training records, expiry warnings, and mandatory education. |
| **Incident Reports** | File incident reports with AZ ADHS sentinel event flagging. |
| **Corrective Action Plans (CAPs)** | Link incidents and findings to CAPs with accountability tracking. |
| **Emergency Management** | HVA assessments, drill scheduling/tracking, and emergency plan library. |
| **Surveys & Inspections** | Track regulatory surveys, mock surveys, and fire inspections. |
| **Document Library** | Central policy, procedure, and form repository. |
| **White-Label Branding** | Per-facility name, colors, logo, and regulatory identifiers. |

---

## Tech Stack

- **Frontend/Backend:** [Next.js 14](https://nextjs.org) with App Router and TypeScript
- **Styling:** Tailwind CSS 3 with CSS-variable-based theming
- **Database:** PostgreSQL via [Prisma ORM](https://www.prisma.io)
- **Auth:** [NextAuth v5](https://authjs.dev) with credentials login and JWT sessions
- **Icons:** [Lucide React](https://lucide.dev)
- **Date utilities:** `date-fns` 4

---

## Prerequisites

### Step 1 - Install Node.js

NyxCitadel requires **Node.js 20 LTS** or newer.

1. Go to <https://nodejs.org>.
1. Download and install the **LTS** version for Windows.
1. Verify the install:

```text
node --version
npm --version
```

### Step 2 - Install PostgreSQL

1. Download PostgreSQL from <https://www.postgresql.org/download/windows/>.
1. During install, note the password for the `postgres` user and the configured port.
1. Create a database for NyxCitadel:

```sql
CREATE DATABASE nyxcitadel;
```

---

## Local Development Setup

```powershell
# 1. Navigate to the project folder
cd "\\192.168.168.182\Folder Redirection\Ccooper\Documents\GitHub\NyxCitadel"

# 2. Install dependencies
npm install

# 3. Copy the environment template
copy .env.example .env.local
```

---

## Environment Variables

Edit `.env.local` with your actual values:

```env
POSTGRES_PRISMA_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nyxcitadel"
POSTGRES_URL_NON_POOLING="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nyxcitadel"

NEXTAUTH_SECRET="REPLACE_WITH_RANDOM_64_CHAR_HEX_STRING"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="smtp-user"
SMTP_PASS="smtp-password"
SMTP_FROM="NyxCitadel <alerts@example.com>"

CRON_SECRET="replace-with-random-string"
```

> Never commit `.env.local` to Git. It should remain local or be managed by a secrets platform in production.

---

## Database Setup

```powershell
# Push schema to the database
npm run db:push

# Seed production-safe starter data
npm run db:seed
```

`db:push` is appropriate for development. Use `npm run db:migrate` or `npm run db:migrate:prod` for tracked production migrations.

---

## Running the App

```powershell
npm run dev
```

Open <http://localhost:3000> in your browser.

---

## Initial Admin Account

After running the clean seed, one admin account is created by default:

| Role | Email | Password |
| :-- | :-- | :-- |
| Admin | `admin@example.com` | `ChangeMe123!` |

Override these values during seed with environment variables:

- `SEED_FACILITY_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`

---

## GitHub Repository Setup

### Step 1 - Create the Repository

1. Go to <https://github.com/new>.
1. Create a private repository named `NyxCitadel` or similar.
1. Do not initialize it with a README or `.gitignore`.

### Step 2 - Initialize Git and Push

```powershell
cd "\\192.168.168.182\Folder Redirection\Ccooper\Documents\GitHub\NyxCitadel"

git init
git add .
git commit -m "feat: initial NyxCitadel compliance platform"
git remote add origin https://github.com/YOUR_USERNAME/NyxCitadel.git
git branch -M main
git push -u origin main
```

### Step 3 - Protect `main`

In GitHub branch protection rules, enable:

- Require pull request reviews before merging
- Require status checks to pass

---

## Deployment (Vercel)

Vercel is the recommended deployment platform for Next.js.

### Step 1 - Create a Vercel Account

Create or sign in to a Vercel account at <https://vercel.com>.

### Step 2 - Import the Project

1. In Vercel, choose **Add New → Project**.
1. Import the `NyxCitadel` GitHub repository.
1. Confirm the detected framework is **Next.js**.

### Step 3 - Provision Postgres

1. In the Vercel project, open **Storage**.
1. Create a Postgres database.
1. Vercel will inject database connection variables automatically.

### Step 4 - Configure Remaining Environment Variables

Add the following in Vercel project settings:

| Variable | Value |
| :-- | :-- |
| `NEXTAUTH_SECRET` | Random 32-byte hex string |
| `NEXTAUTH_URL` | Production base URL, for example <https://nyxcitadel.vercel.app> |
| `APP_URL` | Same as production base URL |
| `ANTHROPIC_API_KEY` | Required for the AI assistant |
| `CRON_SECRET` | Random secret used to protect cron routes |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP settings for signup, alerts, and export email delivery |
| `SMTP_FROM` | Branded sender identity |

### Step 5 - Deploy

Deploy from the Vercel dashboard, then run production schema setup locally with the pulled production env file:

```powershell
npx vercel env pull .env.production.local
npx dotenv -e .env.production.local -- npx prisma db push
```

Use demo seed only if you intentionally need sample data:

```powershell
npx dotenv -e .env.production.local -- npx tsx prisma/seed.ts
```

### Production Automation Checklist

1. Sign up a new user and confirm welcome email delivery.
1. Save notification and export preferences.
1. Save at least one external export delivery address.
1. Trigger alert automation manually and confirm history updates.
1. Trigger weekly exports and confirm email delivery plus history.
1. Download the board PDF and confirm the trend page renders.
1. Verify protected cron routes return `200 OK` with the correct bearer token.

```powershell
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_APP_URL/api/cron/compliance-alerts
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_APP_URL/api/cron/export-summaries
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_APP_URL/api/cron/scrape
```

### Smoke Test Routine

1. Run `npm run build`.
1. Log in as an admin account.
1. Confirm the admin automation card shows the latest history.
1. Confirm the Export Center can download a CSV and a saved packet.
1. Confirm bell notifications do not show hidden `SYSTEM` metadata records.

### Windows Build Note

If Next.js fails on stale `.next` cleanup with an `EINVAL` readlink error, clear `.next` and rerun the build:

```powershell
Remove-Item -Recurse -Force .next
npm run build
```

---

## Project Structure

```text
NyxCitadel/
├── prisma/
│   ├── schema.prisma
│   ├── seed-clean.ts
│   └── seed.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── middleware.ts
├── docs/
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## White-Label Configuration

Each facility has its own row in the `Facility` table with:

- `name` and `shortName` for UI naming
- `primaryColor` and `secondaryColor` for branding
- facility identity used for tenant-specific configuration

To add a new facility:

1. Insert a new `Facility` record, or use Prisma Studio.
1. Add CSS overrides in `globals.css` if custom branding is needed.
1. Create users linked to the new facility.

```css
[data-facility="your-facility-slug"] {
  --primary: 220 90% 50%;
  --primary-foreground: 0 0% 100%;
}
```

---

## Arizona Compliance Modules

`src/lib/compliance/arizona.ts` contains the Arizona compliance rule set that powers the generated calendar.

| Standard Set | Requirements Covered |
| :-- | :-- |
| **JC / CAMH EM.01.01.01** | EM committee meetings, HVA cadence, drill scheduling, and after-action reviews |
| **JC Life Safety / NFPA 101** | Generator tests, fire alarm review, sprinkler review, extinguishers, and fire watch evidence |
| **JC Quality / CAMH** | Mock survey cadence, PI committee review, restraint/seclusion review, leadership meetings |
| **AZ ADHS A.A.C. R9-10** | Annual ADHS survey, patient rights review, and adverse event reporting |
| **CMS CoPs 42 CFR 482** | Conditions of Participation review, discharge planning, and grievance reporting |
| **Infection Control** | IC committee meetings, ICRA cadence, and hand hygiene audits |
| **Staff & Policy** | Mandatory education, policy review cycles, BLS recertification, and CPI recertification |

---

## Optional Demo Tooling

Demo tooling is disabled by default.

If you need demo workflows later, explicitly enable them with `ENABLE_DEMO_TOOLS=true` and use:

- `npm run db:seed:demo` for full sample data
- `docs/DEMO_PLAYBOOK.md` for scripted demos
- Admin **Reset Demo Data**, which is only visible when `ENABLE_DEMO_TOOLS=true`

---

## Enterprise Readiness Kit

Use these assets during hospital security and procurement cycles:

- `docs/SECURITY_HARDENING_CHECKLIST.md`
- `docs/PROCUREMENT_BAA_PACK.md`
- `/admin/pilot-kpis`

---

## Available Scripts

| Command | Description |
| :-- | :-- |
| `npm run dev` | Start development server at <http://localhost:3000> |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run db:push` | Sync schema to database for development |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:migrate:prod` | Apply production migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed clean starter data |
| `npm run db:seed:demo` | Seed full demo data |
| `npm run db:seed:clean` | Seed clean starter data explicitly |

---

NyxCitadel is designed to be white-labeled and adapted for different healthcare facility types. The Arizona-specific compliance engine is the first implementation, and additional state modules can be added under `src/lib/compliance/`.
