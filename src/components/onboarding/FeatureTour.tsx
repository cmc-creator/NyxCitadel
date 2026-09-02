'use client';

import { useEffect } from 'react';

const tourSteps = [
  {
    element: undefined as string | undefined,
    popover: {
      title: 'Welcome to NyxCitadel',
      description:
        'This 2-minute tour covers the main areas of your compliance command center. Use the arrows to move between stops, or press Escape to exit anytime.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="dashboard"]',
    popover: {
      title: 'Command Center',
      description:
        'Your daily home base. At a glance: overdue compliance events, open Corrective Action Plans, expiring credentials, and active risk signals that need attention today.',
    },
  },
  {
    element: '[data-tour="calendar"]',
    popover: {
      title: 'Compliance Calendar',
      description:
        'Every regulatory deadline in one place \u2014 CMS CoP reviews, TJC survey windows, ADHS reporting cycles, QAPI quarters, and custom events your team adds. Color-coded by type and urgency.',
    },
  },
  {
    element: '[data-tour="incidents"]',
    popover: {
      title: 'Risk & Incidents',
      description:
        'Log incidents, near-misses, and adverse events. From each incident you can launch a Root Cause Analysis or open a Corrective Action Plan (CAP) to track remediation through to closure.',
    },
  },
  {
    element: '[data-tour="training"]',
    popover: {
      title: 'Training & Competency',
      description:
        'Track required training completions for every staff member. The Compliance Gatekeeper automatically restricts system access for anyone with overdue mandatory training \u2014 no manual follow-up needed.',
    },
  },
  {
    element: '[data-tour="sentry"]',
    popover: {
      title: 'Sentry AI',
      description:
        'Your built-in compliance assistant. Ask Sentry to explain a regulation, draft a policy, help structure a CAP, or summarize survey findings. It understands your facility type and Arizona-specific requirements.',
    },
  },
  {
    element: '[data-tour="board-report"]',
    popover: {
      title: 'Board Report',
      description:
        'An auto-generated executive dashboard that pulls live data from across the system \u2014 incidents, quality metrics, compliance status, training rates, and risk indicators. Ready to share directly with your board.',
    },
  },
  {
    element: '[data-tour="settings"]',
    popover: {
      title: 'Settings',
      description:
        "Configure your facility details (NPI, Medicare/Medicaid IDs, ADHS license), invite team members with the right roles, set notification preferences, and manage your subscription. Start with Facility Config to personalize your compliance deadlines.",
    },
  },
];

export function startFeatureTour() {
  window.dispatchEvent(new Event('nyx:start-feature-tour'));
}

export function FeatureTour() {
  useEffect(() => {
    const handler = async () => {
      const { driver } = await import('driver.js');

      const driverObj = driver({
        showProgress: true,
        progressText: 'Stop __current__ of __total__',
        popoverClass: 'nyx-tour-popover',
        nextBtnText: 'Next \u2192',
        prevBtnText: '\u2190 Back',
        doneBtnText: 'Done',
        animate: true,
        smoothScroll: true,
        allowClose: true,
        steps: tourSteps.map((s) =>
          s.element
            ? { element: s.element, popover: s.popover }
            : { popover: s.popover }
        ),
      });

      driverObj.drive();
    };

    window.addEventListener('nyx:start-feature-tour', handler);
    return () => window.removeEventListener('nyx:start-feature-tour', handler);
  }, []);

  return null;
}
