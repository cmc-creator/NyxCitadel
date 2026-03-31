# Security Hardening Checklist

## Objective

Production-readiness checklist for hospital procurement and security reviews.

## Implemented in Product

- Baseline response security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Auth-gated dashboard and role checks on admin API routes
- Signup API rate limiting to reduce abuse and spam
- Demo tooling disabled by default (`ENABLE_DEMO_TOOLS` required)

## Required Before Enterprise Rollout

- Configure managed secrets for production (not `.env` files)
- Enforce MFA and SSO (SAML/OIDC) for admin and clinical leadership roles
- Encrypt backups and document restore runbook with RTO/RPO targets
- Centralize application logs and set alerting thresholds for auth anomalies
- Run external penetration test and remediate findings
- Implement quarterly access review workflow with evidence retention
- Add incident response tabletop and escalation contacts

## Security Evidence Packet (What buyers ask for)

- Architecture/data-flow diagram
- Access control matrix by role
- Vulnerability management policy
- Backup and disaster recovery SOP
- Incident response policy
- Third-party subprocessors list
- Pen test executive summary

## Operational Verification

1. `npm run build`
2. Confirm protected routes redirect unauthenticated users to login.
3. Confirm admin-only APIs return 403 for non-admin roles.
4. Confirm repeated signup requests get 429.
5. Confirm security headers are present in production responses.
