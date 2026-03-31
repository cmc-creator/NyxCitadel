# NyxCitadel Demo Playbook

## Purpose

Use this script to run the same 10-minute story every time while keeping data believable and fresh.

## Requirement

Demo tooling must be explicitly enabled with `ENABLE_DEMO_TOOLS=true` before using Reset Demo Data.

## Before Every Demo

1. Log in as Admin.
1. Open Admin Control Panel.
1. Click Reset Demo Data and wait for the success toast.
1. Refresh browser tabs to ensure fresh dashboard counts.

## 10-Minute Sales Script

1. Mission framing (60s)

   Show Dashboard and explain one command center for compliance, risk, and emergency readiness.

1. Risk signal flow (2 min)

   Open Incidents and highlight recent sentinel or medication items.
   Open CAPs and show accountable remediation with dates and owners.

1. Workforce and readiness (2 min)

   Open Training for completion and overdue insight.
   Open Drills for scheduled and completed emergency exercises.

1. Automation proof (2 min)

   Go to Admin Panel.
   Show Automation Status and recent run history.
   Trigger Run Alerts Now to prove live automation.

1. Executive reporting (2 min)

   Open Export Center.
   Download the Board Packet.
   Open the Board PDF and highlight the trend page and operational cadence.

1. Operational close (60s)

   Show Export Delivery Lists and explain external executive recipients with cadence controls.
   Reinforce that alerts, exports, and board reporting are production-ready workflows.

## Demo Recovery if Something Looks Stale

1. Run Reset Demo Data again.
1. Trigger Run Alerts Now once.
1. Re-download the Board PDF.

## Optional Deep-Dive Paths

- Compliance teams: policies, calendar, and reminders
- Risk teams: incidents, RCA, and CAP linkage
- Executive teams: board PDF trends and scheduled export delivery lists
