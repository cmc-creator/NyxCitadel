# NyxCitadel Go-Live Punch List

Concrete launch checklist ordered by stage. Use this to decide what can ship now versus what must wait.

Related docs:
- `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` — Vercel/DB/cron deploy steps
- `docs/SECURITY_HARDENING_CHECKLIST.md` — enterprise security gates
- `docs/PROCUREMENT_BAA_PACK.md` — buyer legal/security packet outline
- `docs/DEMO_PLAYBOOK.md` — scripted demos (only if `ENABLE_DEMO_TOOLS=true`)

---

## Stage definitions

| Stage | Goal | Who can use it |
| :--- | :--- | :--- |
| **A. Private beta** | Founding / pilot facilities under white-glove onboarding | Invited customers only |
| **B. Public launch** | Self-serve signup + paid conversion from the marketing site | Anyone on the internet |
| **C. Enterprise rollout** | Hospital procurement, security review, multi-facility contracts | Health-system buyers |

The landing page currently markets **private beta / founding customers**. Stay in Stage A until Stage B items are complete.

---

## Stage A — Private beta (do this week)

Goal: safely onboard a small set of invited facilities. No public paid conversion required.

### A1. Production environment

- [ ] Confirm Vercel project is linked to the correct GitHub repo and production domain
- [ ] Set required env vars in Vercel (Production + Preview as needed):
  - [ ] `POSTGRES_PRISMA_URL` / `POSTGRES_URL` (or `DATABASE_URL`) and non-pooling URL for migrations
  - [ ] `NEXTAUTH_SECRET` (`openssl rand -hex 32`)
  - [ ] `NEXTAUTH_URL` = production URL
  - [ ] `APP_URL` / `NEXT_PUBLIC_APP_URL` = production URL
  - [ ] `ANTHROPIC_API_KEY` (Sentry AI)
  - [ ] `CRON_SECRET` (`openssl rand -hex 32`)
  - [ ] SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- [ ] Confirm `ENABLE_DEMO_TOOLS` is **unset/false** in production
- [ ] Deploy production build from `main`

### A2. Database & admin bootstrap

- [ ] Apply schema (`prisma migrate deploy` or documented `db push` path)
- [ ] Seed clean starter data (`prisma/seed-clean.ts`)
- [ ] Override seed defaults before first login:
  - [ ] `SEED_FACILITY_NAME`
  - [ ] `SEED_ADMIN_EMAIL`
  - [ ] `SEED_ADMIN_PASSWORD` (do **not** leave `ChangeMe123!`)
  - [ ] `SEED_ADMIN_NAME`
- [ ] Sign in as admin, immediately change password if seed default was used
- [ ] Enable 2FA for the founding admin account (`/settings/security`)

### A3. Automation smoke tests

- [ ] Cron with bearer token returns 200:
  - [ ] `/api/cron/compliance-alerts`
  - [ ] `/api/cron/export-summaries`
  - [ ] `/api/cron/scrape`
- [ ] Cron without token returns 401
- [ ] Signup welcome / notification email delivers via SMTP
- [ ] Sentry AI answers a basic compliance question
- [ ] Export Center can download at least one CSV/packet
- [ ] Board / executive report renders

### A4. Product smoke tests (happy path)

- [ ] Login / logout / session timeout behave correctly
- [ ] Create one compliance calendar item and one tracker record
- [ ] File an incident → create CAP → close loop
- [ ] Upload or attach one policy/document
- [ ] Invite or add a second user with a non-admin role; confirm role limits
- [ ] Walk Genius Tour / onboarding once without dead links
- [ ] Confirm landing page, `/login`, `/signup`, `/contact`, `/privacy`, `/terms` load

### A5. Beta go-to-market guardrails

- [ ] Keep “private beta / founding customers” messaging on the landing page
- [ ] Prefer invite-only onboarding (manual account provisioning) over open self-serve if SMTP/billing are not fully verified
- [ ] Write a 1-page pilot success criteria doc per facility (see `PROCUREMENT_BAA_PACK.md` metrics)
- [ ] Confirm BAA path for any facility that will enter PHI-adjacent workflows
- [ ] Assign an escalation contact for pilot support

### Stage A exit criteria

Ship Stage A only when:

1. Production deploy is live on the real domain  
2. Admin seed password is rotated / 2FA enabled  
3. Crons + SMTP + AI smoke tests pass  
4. At least one end-to-end compliance workflow works for a pilot facility  
5. Demo reset tooling is disabled in production  

---

## Stage B — Public launch (after beta is stable)

Goal: anyone can sign up from the marketing site and convert to a paid plan without white-glove setup.

### B1. Remove quality escape hatches

- [ ] Set `typescript.ignoreBuildErrors` to `false` in `next.config.js`
- [ ] Set `eslint.ignoreDuringBuilds` to `false` in `next.config.js`
- [ ] Fix all resulting TypeScript and ESLint errors
- [ ] Add CI that runs on every PR:
  - [ ] `npm test`
  - [ ] `npm run lint`
  - [ ] `npm run build`

### B2. Billing / self-serve revenue path

- [ ] Add Stripe vars to `.env.example` and Vercel:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_ID` (and additional price IDs if Starter/Pro differ)
- [ ] Configure Stripe Customer Portal
- [ ] Verify webhook endpoint `/api/billing/webhooks` in live mode
- [ ] Walk checkout → active subscription → billing portal → cancel/resume
- [ ] Confirm facility plan entitlements match pricing tiers on the landing page
- [ ] Decide: open `/signup` for all, or keep waitlist until first paid conversion succeeds

### B3. Marketing honesty pass

- [ ] Remove or rewrite “private beta only” copy when truly public
- [ ] Remove or qualify Enterprise claims that are not shipped (especially **SSO / SAML**)
- [ ] Confirm pricing numbers, included modules, and support promises match the product
- [ ] Hide or label unfinished surfaces (example: custom HVA builder “coming soon”)
- [ ] Verify Partner Portal / contact / walkthrough links are real and current

### B4. Reliability & abuse controls

- [ ] Confirm signup rate limiting still returns 429 under repeated attempts
- [ ] Confirm protected routes redirect unauthenticated users to `/login`
- [ ] Confirm admin APIs return 403 for non-admin roles
- [ ] Confirm security headers present on production responses
- [ ] Set up error monitoring (Sentry project) with alert routing
- [ ] Define backup/restore owner and basic RTO/RPO note

### Stage B exit criteria

Ship Stage B only when:

1. CI blocks merge on test/lint/build failure  
2. Live Stripe checkout and webhooks work  
3. Marketing claims match shipped features  
4. Open signup + paid conversion has been tested by someone other than the builder  
5. Monitoring/alerts are live  

---

## Stage C — Enterprise rollout (hospital procurement)

Goal: pass security/legal review for health-system contracts. Do not sell as enterprise-ready until this stage is done.

### C1. Identity & access

- [ ] Enforce MFA for admin and clinical leadership roles (not just optional 2FA)
- [ ] Implement real SSO (SAML and/or OIDC) before advertising it on Pricing
- [ ] Document role/permission matrix
- [ ] Quarterly access review workflow + evidence retention

### C2. Security evidence

- [ ] Architecture / data-flow diagram
- [ ] Subprocessors list
- [ ] Backup encryption + restore runbook with RTO/RPO
- [ ] Vulnerability management policy
- [ ] Incident response policy + tabletop completed
- [ ] External pen test + remediation summary
- [ ] Finalize BAA / MSA / SLA packet from `PROCUREMENT_BAA_PACK.md`

### C3. Commercial & support

- [ ] Enterprise contracting path (custom quote, MSA, BAA signatories)
- [ ] Support escalation / on-call expectations matching “Priority 24/7” claims if used
- [ ] Customer onboarding runbook for multi-facility tenants
- [ ] Pilot KPI dashboard path (`/admin/pilot-kpis`) validated with a real customer

### Stage C exit criteria

Sell Enterprise only when:

1. SSO works for a real IdP pilot  
2. MFA is enforced for privileged roles  
3. Pen test findings are remediated or accepted in writing  
4. Legal packet (MSA/BAA/SLA) is executable  
5. Backup/restore has been successfully rehearsed  

---

## Fast decision guide

| Question | If yes | If no |
| :--- | :--- | :--- |
| Can you invite 1–3 facilities with manual setup? | Proceed with **Stage A** | Finish A1–A3 first |
| Can a stranger sign up and pay without help? | You need **Stage B** complete | Keep beta messaging |
| Is a hospital security questionnaire due? | Start **Stage C** now | Don’t claim enterprise-ready |
| Is SSO listed on the public pricing page? | Only keep it if Stage C SSO is done; otherwise remove/qualify | OK for now |

---

## Suggested ownership snapshot

| Workstream | Primary owner | Stage |
| :--- | :--- | :--- |
| Vercel env + deploy | Engineering | A |
| DB seed + admin hardening | Engineering | A |
| Cron/SMTP/AI smoke tests | Engineering | A |
| Pilot customer success | Founder / CS | A |
| CI + build-error cleanup | Engineering | B |
| Stripe live billing | Engineering + Finance | B |
| Marketing claim audit | Founder + Eng | B |
| SSO / MFA enforcement | Engineering | C |
| Pen test + BAA packet | Security + Legal | C |

---

## Current recommendation (as of this doc)

**Operate as Stage A (private beta).**  
Do not call the product publicly launched until Stage B is complete.  
Do not sell Enterprise SSO / full enterprise readiness until Stage C is complete.

---

## Engineering progress log

Completed in-repo (does **not** replace production ops smoke tests):

- [x] Document Stripe + `ENABLE_DEMO_TOOLS` in `.env.example`
- [x] Document Stripe / demo vars in `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- [x] Qualify SSO marketing copy (landing + signup) as roadmap / on request
- [x] Label custom HVA builder as Coming soon
- [x] Fix blocking TypeScript errors and set `typescript.ignoreBuildErrors: false`
- [x] Add GitHub Actions CI (`npm test` + `tsc --noEmit`)
- [ ] Full ESLint gate (`ignoreDuringBuilds` still true — Stage B follow-up)
- [ ] Live Stripe checkout verification in production (ops)
- [ ] Production cron / SMTP / AI smoke tests (ops)
- [ ] Rotate seed admin password + enable 2FA on production admin (ops)
