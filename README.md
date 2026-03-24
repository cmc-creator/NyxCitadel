# NyxCitadel — Hospital Compliance & Risk Management Platform

> White-label compliance, risk management, and emergency management platform for healthcare facilities.  
> **Currently configured for:** Destiny Springs Healthcare — Acute Psychiatric Inpatient, Peoria, AZ

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites — Install Node.js First](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Running the App](#running-the-app)
8. [Demo Login Credentials](#demo-login-credentials)
9. [GitHub Repository Setup](#github-repository-setup)
10. [Deployment (Vercel)](#deployment-vercel)
11. [Project Structure](#project-structure)
12. [White-Label Configuration](#white-label-configuration)
13. [Arizona Compliance Modules](#arizona-compliance-modules)

---

## Features

| Module | Description |
|--------|-------------|
| **Compliance Calendar** | Auto-generated calendar for all JC, CMS, AZ ADHS, NFPA, and OSHA requirements with suggested dates |
| **Compliance Tracker** | Track compliance items, statuses, owners, and due dates |
| **Policy Tracker** | Policy review cycles, expiration alerts, version control |
| **Training Tracker** | Staff training records, expiry warnings, mandatory education |
| **Incident Reports** | File incident reports with AZ ADHS sentinel event flagging |
| **Corrective Action Plans (CAPs)** | Link incidents/findings to CAPs with accountability tracking |
| **Emergency Management** | HVA assessments, drill scheduling/tracking, EM plan library |
| **Surveys & Inspections** | Track regulatory surveys, mock surveys, fire inspections |
| **Document Library** | Policy/procedure/form repository |
| **White-Label Branding** | Per-facility name, colors, logo, and regulatory identifiers |

---

## Tech Stack

- **Frontend/Backend:** [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- **Styling:** Tailwind CSS 3 with CSS variable white-label theming
- **Database:** PostgreSQL via [Prisma ORM](https://www.prisma.io)
- **Auth:** [NextAuth v5](https://authjs.dev) — email/password with JWT sessions
- **Icons:** [Lucide React](https://lucide.dev)
- **Date utilities:** date-fns 4

---

## Prerequisites

### Step 1 — Install Node.js

NyxCitadel requires **Node.js 20 LTS** or newer.

1. Go to <https://nodejs.org>
2. Download and install **"LTS" (Long Term Support)** version for Windows
3. After install, open a new **PowerShell** or **Command Prompt** and verify:
   ```
   node --version   # should print v20.x.x or higher
   npm --version    # should print 10.x.x or higher
   ```

### Step 2 — Install PostgreSQL

1. Download from <https://www.postgresql.org/download/windows/>
2. During install, note the **password** you set for the `postgres` user and the **port** (default: 5432)
3. After install, create a database for NyxCitadel:
   ```sql
   -- In pgAdmin or psql:
   CREATE DATABASE nyxcitadel;
   ```

---

## Local Development Setup

```powershell
# 1. Navigate to project folder
cd "\\192.168.168.182\Folder Redirection\Ccooper\Documents\GitHub\NyxCitadel"

# 2. Install all dependencies
npm install

# 3. Copy environment template
copy .env.example .env.local
```

---

## Environment Variables

Edit `.env.local` with your actual values:

```env
# Both vars can point to the same local Postgres URL — no pooler needed for local dev
POSTGRES_PRISMA_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nyxcitadel"
POSTGRES_URL_NON_POOLING="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nyxcitadel"

# NextAuth secret — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET="REPLACE_WITH_RANDOM_64_CHAR_HEX_STRING"

# Local development URL (leave as-is for local)
NEXTAUTH_URL="http://localhost:3000"
```

> **Never commit `.env.local` to Git.** It is already in `.gitignore`.

---

## Database Setup

```powershell
# Push schema to database (creates all tables)
npm run db:push

# Seed with Destiny Springs Healthcare demo data
npm run db:seed
```

> **db:push** is for development. Use `npm run db:migrate` for production-grade migration tracking.

---

## Running the App

```powershell
# Start development server
npm run dev
```

Open <http://localhost:3000> in your browser.

---

## Demo Login Credentials

After seeding, three accounts are available:

| Role | Email | Password |
|------|-------|----------|
| System Admin | `admin@destinysprings.com` | `Admin@DSH2026!` |
| Compliance Officer | `compliance@destinysprings.com` | `Compliance@DSH2026!` |
| EM Coordinator | `emc@destinysprings.com` | `Emergency@DSH2026!` |

---

## GitHub Repository Setup

### Step 1 — Create the GitHub Repository

1. Go to <https://github.com/new>
2. Repository name: `NyxCitadel` (or `destiny-springs-compliance`)
3. Set to **Private** (contains compliance-sensitive data structure)
4. **Do NOT** initialize with README or .gitignore (you already have these)
5. Click **Create repository**

### Step 2 — Initialize Git and Push

Open PowerShell in the project folder:

```powershell
cd "\\192.168.168.182\Folder Redirection\Ccooper\Documents\GitHub\NyxCitadel"

# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "feat: initial NyxCitadel compliance platform

- Next.js 14 + TypeScript + Tailwind + Prisma + PostgreSQL
- NextAuth v5 credentials authentication
- Full Arizona compliance rules engine (JC, CMS, AZ ADHS, NFPA)
- Compliance calendar with auto-generated suggested dates
- Trackers: compliance, policies, training, incidents, CAPs
- Emergency management: HVA, drills, plans
- Surveys & inspections tracker
- Document library
- White-label facility configuration
- Seed data: Destiny Springs Healthcare"

# Link to GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/NyxCitadel.git

# Push
git branch -M main
git push -u origin main
```

### Step 3 — Protect the main Branch (Recommended)

In GitHub → Settings → Branches → Add branch protection rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass

---

## Deployment (Vercel)

Vercel is the recommended deployment platform for Next.js.

### Step 1 — Create a Vercel Account
Go to <https://vercel.com> and sign up (can link your GitHub account).

### Step 2 — Import Project
1. Vercel Dashboard → **Add New → Project**
2. Import your `NyxCitadel` GitHub repository
3. Framework preset: **Next.js** (auto-detected)

### Step 3 — Add a Postgres Database (built into Vercel)
1. Vercel project dashboard → **Storage** tab → **Create Database** → **Postgres**
2. Done. Vercel automatically injects these environment variables into your project:
   - `POSTGRES_PRISMA_URL` — pooled connection (used by Prisma at runtime)
   - `POSTGRES_URL_NON_POOLING` — direct connection (used by Prisma for migrations)
   - Several others (`POSTGRES_URL`, `POSTGRES_USER`, etc.)

> No external database provider needed — it's included free in Vercel's Hobby plan (256 MB storage).

### Step 4 — Add Remaining Environment Variables in Vercel
In Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXTAUTH_SECRET` | Random 32-byte hex — run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | Your Vercel deployment URL, e.g. `https://nyxcitadel.vercel.app` |
| `ANTHROPIC_API_KEY` | **Required for AI Assistant** — get from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys). Uses `claude-3-5-haiku-20241022`. |
| `CRON_SECRET` | **Required for automated regulatory scraper** — any random string, e.g. `openssl rand -hex 32`. Vercel injects this automatically into scheduled cron calls. |

> **Important:** Without `ANTHROPIC_API_KEY` the AI compliance assistant (NyxAI) returns an error for every message.  
> Without `CRON_SECRET` the daily regulatory scraper cron job is unsecured — set this before going to production.

### Step 5 — Deploy
Click **Deploy**. Vercel builds and deploys automatically.

After first deployment, run the database setup from your local machine using the production connection strings Vercel provides:

```powershell
# Pull Vercel environment variables to a local file
npx vercel env pull .env.production.local

# Push the Prisma schema to production Postgres
npx dotenv -e .env.production.local -- npx prisma db push

# Seed production with Destiny Springs demo data (optional)
npx dotenv -e .env.production.local -- npx tsx prisma/seed.ts
```

---

## Project Structure

```
NyxCitadel/
├── prisma/
│   ├── schema.prisma          # All database models
│   └── seed.ts                # Destiny Springs demo data
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Authenticated app shell
│   │   │   ├── dashboard/     # Main compliance dashboard
│   │   │   ├── calendar/      # Compliance calendar + /new
│   │   │   ├── trackers/
│   │   │   │   ├── compliance/
│   │   │   │   ├── policies/
│   │   │   │   ├── training/
│   │   │   │   ├── incidents/ # + /new form
│   │   │   │   └── caps/      # + /new form
│   │   │   ├── emergency/
│   │   │   │   ├── page.tsx   # EM overview
│   │   │   │   ├── hva/       # HVA assessments
│   │   │   │   ├── drills/    # + /new form
│   │   │   │   └── plans/
│   │   │   ├── surveys/
│   │   │   ├── documents/
│   │   │   └── settings/      # + /facility white-label config
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth handler
│   │   │   ├── calendar/      # GET + POST
│   │   │   ├── compliance/    # Auto-generate calendar
│   │   │   ├── incidents/     # GET + POST
│   │   │   ├── caps/          # GET + POST
│   │   │   └── drills/        # GET + POST
│   │   ├── login/             # Login page
│   │   ├── globals.css        # White-label CSS variables
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── layout/            # Sidebar + TopBar
│   │   ├── providers/         # Auth session provider
│   │   └── ui/                # Toaster
│   ├── hooks/                 # useToast
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # Shared utilities
│   │   └── compliance/
│   │       └── arizona.ts     # AZ compliance rules engine
│   └── middleware.ts          # Route protection
├── .env.example               # Environment variable template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## White-Label Configuration

Each facility has its own row in the `Facility` table with:
- `name`, `shortName` — displayed in login page and sidebar
- `primaryColor`, `secondaryColor` — CSS hex values used for branding
- `facilityId` slug — used as `data-facility` on the HTML root for CSS variable overrides

To add a new facility:
1. Insert a new `Facility` record (or use `prisma studio`)
2. Add a CSS selector override in `globals.css`:
   ```css
   [data-facility="your-facility-slug"] {
     --primary: 220 90% 50%;
     --primary-foreground: 0 0% 100%;
   }
   ```
3. Create users linked to the new `facilityId`

---

## Arizona Compliance Modules

`src/lib/compliance/arizona.ts` contains all compliance rules with frequencies automatically used by the calendar generator:

| Standard Set | Requirements Covered |
|-------------|---------------------|
| **JC / CAMH EM.01.01.01** | Monthly EM committee meetings, Annual HVA, 2 fire drills/shift/yr, 1 tabletop, 1 functional, After-Action Reviews |
| **JC Life Safety / NFPA 101** | Quarterly generator tests, annual fire alarm, annual sprinkler, quarterly extinguisher, fire watch documentation |
| **JC Quality / CAMH** | Mock survey, PI committee, quarterly restraint/seclusion review, Leadership meetings |
| **AZ ADHS A.A.C. R9-10** | Annual ADHS survey, quarterly patient rights review, adverse event reporting (24-hr sentinel) |
| **CMS CoPs 42 CFR 482** | CoP review, discharge planning, grievance reporting |
| **Infection Control** | Monthly IC committee, annual ICRA, hand hygiene audits |
| **Staff & Policy** | Annual mandatory education, biennial P&P review, BLS recertification, CPI recertification |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Sync schema to database (dev) |
| `npm run db:migrate` | Create and run migration files (prod) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Seed Destiny Springs Healthcare demo data |

---

*NyxCitadel is designed to be white-labeled and adapted for any healthcare facility type. The Arizona-specific compliance engine is the first implementation. Additional state modules can be added to `src/lib/compliance/`.*
