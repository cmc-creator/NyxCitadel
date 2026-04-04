type DigestAlert = {
  title: string;
  message: string;
  linkUrl: string | null;
  createdAt: Date;
};

function appBaseUrl(): string {
  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}

function emailShell(title: string, eyebrow: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
    .hero { padding: 28px 28px 20px; background: linear-gradient(135deg, #0d7377 0%, #14a4a8 60%, #0f172a 100%); color: white; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.78; }
    .hero h1 { margin: 10px 0 0; font-size: 28px; line-height: 1.15; }
    .content { padding: 28px; }
    .section { margin-bottom: 22px; }
    .muted { color: #6b7280; font-size: 14px; line-height: 1.6; }
    .list-item { padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px; background: #f8fafc; }
    .list-item h3 { margin: 0 0 6px; font-size: 15px; color: #111827; }
    .list-item p { margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5; }
    .meta { margin-top: 8px; font-size: 12px; color: #0d7377; font-weight: 600; }
    .button { display: inline-block; padding: 12px 18px; border-radius: 10px; background: #0d7377; color: white; text-decoration: none; font-weight: 700; font-size: 14px; }
    .footer { padding: 0 28px 28px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="hero">
        <div class="eyebrow">${eyebrow}</div>
        <h1>${title}</h1>
      </div>
      <div class="content">${body}</div>
      <div class="footer">NyxCitadel Compliance Intelligence</div>
    </div>
  </div>
</body>
</html>`;
}

export function getComplianceDigestEmail(data: {
  recipientName: string | null;
  alerts: DigestAlert[];
}) {
  const base = appBaseUrl();
  const body = `
    <div class="section">
      <p class="muted">Daily compliance digest for <strong>${data.recipientName ?? 'your team'}</strong>. You have <strong>${data.alerts.length}</strong> new alert${data.alerts.length === 1 ? '' : 's'} in the last 24 hours.</p>
    </div>
    <div class="section">
      ${data.alerts.slice(0, 12).map((alert) => `
        <div class="list-item">
          <h3>${alert.title}</h3>
          <p>${alert.message}</p>
          <div class="meta">${alert.createdAt.toLocaleString()}${alert.linkUrl ? ` · <a href="${base}${alert.linkUrl}" style="color:#0d7377;text-decoration:none;">Open in NyxCitadel</a>` : ''}</div>
        </div>
      `).join('')}
    </div>
    <div class="section">
      <a class="button" href="${base}/dashboard">Open Dashboard</a>
    </div>
  `;

  return {
    subject: `[NyxCitadel] Daily Compliance Digest (${data.alerts.length})`,
    html: emailShell('Daily Compliance Digest', 'Automation', body),
  };
}

export function getExportSummaryEmail(data: {
  facilityName: string;
  frequency: 'daily' | 'weekly';
}) {
  const base = appBaseUrl();
  const items = [
    { label: 'Corrective Action Plans', path: '/api/export/caps' },
    { label: 'Incidents', path: '/api/export/incidents' },
    { label: 'Root Cause Analyses', path: '/api/export/rcas' },
    { label: 'Training Records', path: '/api/export/training' },
    { label: 'Emergency Drills', path: '/api/export/drills' },
    { label: 'Policies & Procedures', path: '/api/export/policies' },
    { label: 'Board PDF Report', path: '/api/export/board-report/pdf' },
  ];

  const body = `
    <div class="section">
      <p class="muted"><strong>${data.facilityName}</strong> ${data.frequency} reporting package is ready. Use the links below to pull current CSVs and the board-ready PDF.</p>
    </div>
    <div class="section">
      ${items.map((item) => `
        <div class="list-item">
          <h3>${item.label}</h3>
          <p><a href="${base}${item.path}" style="color:#0d7377;text-decoration:none;">${base}${item.path}</a></p>
        </div>
      `).join('')}
    </div>
    <div class="section">
      <a class="button" href="${base}/export">Open Export Center</a>
    </div>
  `;

  const periodLabel = data.frequency === 'weekly' ? 'Weekly' : 'Daily';
  return {
    subject: `[NyxCitadel] ${periodLabel} Export Package`,
    html: emailShell(`${periodLabel} Export Package`, 'Reporting', body),
  };
}

export function getRegulatoryAlertEmail(data: {
  recipientName: string | null;
  updates: Array<{
    impactLevel: string;
    agency: string;
    docType: string | null;
    title: string;
    url: string;
  }>;
}) {
  const base = appBaseUrl();
  const criticalCount = data.updates.filter((u) => u.impactLevel === 'CRITICAL').length;
  const highCount = data.updates.filter((u) => u.impactLevel === 'HIGH').length;

  const summaryParts: string[] = [];
  if (criticalCount > 0) summaryParts.push(`${criticalCount} CRITICAL`);
  if (highCount > 0) summaryParts.push(`${highCount} HIGH`);
  const summary = summaryParts.join(', ');

  const body = `
    <div class="section">
      <p class="muted">Hello <strong>${data.recipientName ?? 'Compliance Team'}</strong>,</p>
      <p class="muted">NyxCitadel has detected <strong>${data.updates.length} new high-priority regulatory update${data.updates.length === 1 ? '' : 's'}</strong> (${summary}) that may require immediate attention.</p>
    </div>
    <div class="section">
      ${data.updates.map((u) => {
        const badge = u.impactLevel === 'CRITICAL'
          ? '<span style="background:#fef2f2;color:#dc2626;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;border:1px solid #fecaca;">CRITICAL</span>'
          : '<span style="background:#fff7ed;color:#ea580c;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;border:1px solid #fed7aa;">HIGH</span>';
        const agencyLabel = u.agency.replace(/_/g, '/');
        const docLabel = u.docType ? ` &mdash; ${u.docType}` : '';
        return `
          <div class="list-item">
            <h3>${badge}&nbsp; ${agencyLabel}${docLabel}</h3>
            <p>${u.title.slice(0, 200)}</p>
            ${u.url ? `<div class="meta"><a href="${u.url}" style="color:#0d7377;text-decoration:none;">View Source</a> &nbsp;·&nbsp; <a href="${base}/intelligence/updates" style="color:#0d7377;text-decoration:none;">Open in NyxCitadel</a></div>` : `<div class="meta"><a href="${base}/intelligence/updates" style="color:#0d7377;text-decoration:none;">Open in NyxCitadel</a></div>`}
          </div>`;
      }).join('')}
    </div>
    <div class="section">
      <a class="button" href="${base}/intelligence/updates">Review All Regulatory Updates</a>
    </div>
    <div class="section">
      <p class="muted" style="font-size:12px;">You are receiving this alert because your role (Admin / Compliance Officer) is configured to receive high-priority regulatory intelligence notifications.</p>
    </div>
  `;

  return {
    subject: `[NyxCitadel] ${summary} Regulatory Alert${data.updates.length === 1 ? '' : 's'} Detected`,
    html: emailShell('New Regulatory Alerts', 'Regulatory Intelligence', body),
  };
}
