export interface OnboardingEmailData {
  facilityName: string;
  contactName: string;
  contactEmail: string;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const base = () => process.env.APP_URL ?? 'https://nyxcitadel.com';

function htmlWrap(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#374151;background:#f9fafb;margin:0}
.wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
.hdr{background:linear-gradient(135deg,#0d7377,#14a4a8);color:#fff;padding:28px 32px}
.hdr h2{margin:0;font-size:20px}
.hdr p{margin:6px 0 0;opacity:.85;font-size:13px}
.body{padding:28px 32px}
.chip{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.chip-red{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5}
.chip-amber{background:#fffbeb;color:#d97706;border:1px solid #fcd34d}
.chip-blue{background:#eff6ff;color:#2563eb;border:1px solid #93c5fd}
.btn{display:inline-block;background:#0d7377;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px}
.row{display:flex;gap:8px;margin:4px 0;font-size:14px}
.label{color:#6b7280;min-width:130px;flex-shrink:0}
.val{color:#111827;font-weight:500}
.footer{font-size:11px;color:#9ca3af;text-align:center;padding:16px 32px;border-top:1px solid #f3f4f6}
</style></head><body><div style="padding:20px"><div class="wrap">${content}</div></div></body></html>`;
}

// ── Incident created ──────────────────────────────────────────────────────────

export function getIncidentCreatedEmail(opts: {
  facilityName: string;
  reportNumber: string;
  incidentType: string;
  severity: string;
  dateOccurred: string;
  reportedBy: string;
  description: string;
}) {
  const url = `${base()}/trackers/ir-iad`;
  const sevChip = ['SENTINEL','CATASTROPHIC','MAJOR'].includes(opts.severity)
    ? `<span class="chip chip-red">${opts.severity}</span>`
    : `<span class="chip chip-amber">${opts.severity}</span>`;

  const html = htmlWrap(`
    <div class="hdr">
      <h2>New Incident Report Filed</h2>
      <p>${opts.facilityName}</p>
    </div>
    <div class="body">
      <p>A new incident report has been submitted and requires review.</p>
      <div class="row"><span class="label">Report #</span><span class="val">${opts.reportNumber}</span></div>
      <div class="row"><span class="label">Type</span><span class="val">${opts.incidentType.replace(/_/g,' ')}</span></div>
      <div class="row"><span class="label">Severity</span><span class="val">${sevChip}</span></div>
      <div class="row"><span class="label">Date Occurred</span><span class="val">${opts.dateOccurred}</span></div>
      <div class="row"><span class="label">Reported By</span><span class="val">${opts.reportedBy}</span></div>
      <p style="margin-top:16px;font-size:14px;color:#374151"><strong>Description:</strong><br>${opts.description.slice(0,300)}${opts.description.length > 300 ? '...' : ''}</p>
      ${opts.severity === 'SENTINEL' ? '<p style="color:#dc2626;font-weight:600;font-size:13px">&#9888; Sentinel event - ADHS reporting within 24 hours may be required.</p>' : ''}
      <a href="${url}" class="btn">Review in NyxCitadel &rarr;</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[NyxCitadel] Incident Report Filed: ${opts.reportNumber} - ${opts.severity}`,
    html,
  };
}

// ── CAP created ───────────────────────────────────────────────────────────────

export function getCapCreatedEmail(opts: {
  recipientName: string;
  capNumber: string;
  title: string;
  source: string;
  priority: string;
  targetDate: string;
}) {
  const url = `${base()}/trackers/caps`;
  const html = htmlWrap(`
    <div class="hdr">
      <h2>Corrective Action Plan Created</h2>
      <p>CAP #${opts.capNumber} has been logged in NyxCitadel</p>
    </div>
    <div class="body">
      <p>Hello ${opts.recipientName}, your Corrective Action Plan has been saved.</p>
      <div class="row"><span class="label">CAP Number</span><span class="val">${opts.capNumber}</span></div>
      <div class="row"><span class="label">Title</span><span class="val">${opts.title}</span></div>
      <div class="row"><span class="label">Source</span><span class="val">${opts.source.replace(/_/g,' ')}</span></div>
      <div class="row"><span class="label">Priority</span><span class="val">${opts.priority}</span></div>
      <div class="row"><span class="label">Target Date</span><span class="val">${opts.targetDate}</span></div>
      <p style="font-size:13px;color:#6b7280;margin-top:12px">A calendar reminder has been added for the target date. You can update progress, assign responsible parties, and track completion in NyxCitadel.</p>
      <a href="${url}" class="btn">Open CAP Tracker &rarr;</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[NyxCitadel] CAP Created: ${opts.capNumber} - ${opts.title}`,
    html,
  };
}

// ── Grievance created ─────────────────────────────────────────────────────────

export function getGrievanceCreatedEmail(opts: {
  recipientName: string;
  grievanceNumber: string;
  complainantName: string;
  category: string;
  severity: string;
  ackDueDate: string;
  resDueDate: string;
}) {
  const url = `${base()}/trackers/grievances`;
  const isExpedited = opts.severity !== 'STANDARD';
  const html = htmlWrap(`
    <div class="hdr">
      <h2>Patient Grievance Assigned to You</h2>
      <p>Grievance #${opts.grievanceNumber}</p>
    </div>
    <div class="body">
      <p>Hello ${opts.recipientName}, a patient grievance has been assigned to you for resolution.</p>
      <div class="row"><span class="label">Grievance #</span><span class="val">${opts.grievanceNumber}</span></div>
      <div class="row"><span class="label">Complainant</span><span class="val">${opts.complainantName}</span></div>
      <div class="row"><span class="label">Category</span><span class="val">${opts.category.replace(/_/g,' ')}</span></div>
      <div class="row"><span class="label">Severity</span><span class="val">${isExpedited ? `<span class="chip chip-red">${opts.severity}</span>` : opts.severity}</span></div>
      <div class="row"><span class="label">Ack. Due</span><span class="val">${opts.ackDueDate} (CMS 7-day)</span></div>
      <div class="row"><span class="label">Resolution Due</span><span class="val">${opts.resDueDate} (CMS 30-day)</span></div>
      ${isExpedited ? '<p style="color:#dc2626;font-weight:600;font-size:13px">&#9888; This grievance requires expedited review - clinical urgency applies.</p>' : ''}
      <a href="${url}" class="btn">Review Grievance &rarr;</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[NyxCitadel] Grievance Assigned: ${opts.grievanceNumber} - ${opts.category.replace(/_/g,' ')}`,
    html,
  };
}

// ── Policy amended ────────────────────────────────────────────────────────────

export function getPolicyAmendedEmail(opts: {
  facilityName: string;
  policyTitle: string;
  policyNumber: string;
  newVersion: number;
  changedBy: string;
  changeNote: string;
  effectiveDate?: string;
  nextReviewDate?: string;
}) {
  const url = `${base()}/trackers/policies`;
  const html = htmlWrap(`
    <div class="hdr">
      <h2>Policy Amended - Version ${opts.newVersion}</h2>
      <p>${opts.facilityName}</p>
    </div>
    <div class="body">
      <p>A policy has been updated in NyxCitadel. Please review and acknowledge the changes.</p>
      <div class="row"><span class="label">Policy</span><span class="val">${opts.policyTitle}</span></div>
      <div class="row"><span class="label">Policy #</span><span class="val">${opts.policyNumber}</span></div>
      <div class="row"><span class="label">New Version</span><span class="val"><span class="chip chip-blue">v${opts.newVersion}</span></span></div>
      <div class="row"><span class="label">Updated By</span><span class="val">${opts.changedBy}</span></div>
      ${opts.effectiveDate ? `<div class="row"><span class="label">Effective Date</span><span class="val">${opts.effectiveDate}</span></div>` : ''}
      ${opts.nextReviewDate ? `<div class="row"><span class="label">Next Review</span><span class="val">${opts.nextReviewDate}</span></div>` : ''}
      <div style="margin-top:16px;padding:12px 16px;background:#f9fafb;border-left:3px solid #0d7377;border-radius:4px">
        <p style="margin:0;font-size:13px;color:#374151"><strong>Change Summary:</strong><br>${opts.changeNote}</p>
      </div>
      <p style="font-size:13px;color:#6b7280;margin-top:12px">Staff may be required to re-read and acknowledge this policy. Verify with your compliance officer.</p>
      <a href="${url}" class="btn">View Policy &rarr;</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[NyxCitadel] Policy Updated v${opts.newVersion}: ${opts.policyTitle} (${opts.policyNumber})`,
    html,
  };
}

// ── CAP due-soon ──────────────────────────────────────────────────────────────

export function getCapDueSoonEmail(opts: {
  recipientName: string;
  capNumber: string;
  title: string;
  priority: string;
  daysUntilDue: number;
  targetDate: string;
}) {
  const url = `${base()}/trackers/caps`;
  const urgentColor = opts.daysUntilDue <= 1 ? '#dc2626' : '#d97706';
  const html = htmlWrap(`
    <div class="hdr">
      <h2>CAP Deadline Approaching</h2>
      <p>${opts.daysUntilDue <= 1 ? 'Due Tomorrow!' : `Due in ${opts.daysUntilDue} Days`}</p>
    </div>
    <div class="body">
      <p>Hello ${opts.recipientName}, the following Corrective Action Plan is approaching its target date.</p>
      <div class="row"><span class="label">CAP Number</span><span class="val">${opts.capNumber}</span></div>
      <div class="row"><span class="label">Title</span><span class="val">${opts.title}</span></div>
      <div class="row"><span class="label">Priority</span><span class="val">${opts.priority}</span></div>
      <div class="row"><span class="label">Target Date</span><span class="val" style="color:${urgentColor};font-weight:700">${opts.targetDate}</span></div>
      <a href="${url}" class="btn">Update CAP Status &rarr;</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[NyxCitadel] CAP Due ${opts.daysUntilDue <= 1 ? 'Tomorrow' : `in ${opts.daysUntilDue} days`}: ${opts.capNumber}`,
    html,
  };
}

// ── Policy acknowledgment request ────────────────────────────────────────────

export function getPolicyAckRequestEmail(opts: {
  facilityName: string;
  policyTitle: string;
  policyNumber: string;
  version: string;
  changeNote?: string;
  sentBy: string;
  ackUrl: string;
}) {
  const html = htmlWrap(`
    <div class="hdr">
      <h2>Policy Read &amp; Acknowledge Required</h2>
      <p>${opts.facilityName}</p>
    </div>
    <div class="body">
      <p>You are required to read and acknowledge the following policy:</p>
      <div class="row"><span class="label">Policy</span><span class="val">${opts.policyTitle}</span></div>
      <div class="row"><span class="label">Policy #</span><span class="val">${opts.policyNumber}</span></div>
      <div class="row"><span class="label">Version</span><span class="val"><span class="chip chip-blue">v${opts.version}</span></span></div>
      <div class="row"><span class="label">Sent By</span><span class="val">${opts.sentBy}</span></div>
      ${opts.changeNote ? `<div style="margin-top:14px;padding:12px 16px;background:#f9fafb;border-left:3px solid #0d7377;border-radius:4px"><p style="margin:0;font-size:13px;color:#374151"><strong>What Changed:</strong><br>${opts.changeNote}</p></div>` : ''}
      <p style="margin-top:16px;font-size:13px;color:#6b7280">Click the button below to confirm you have read this policy. Your acknowledgment will be recorded with a timestamp for survey compliance documentation.</p>
      <a href="${opts.ackUrl}" class="btn" style="margin-top:20px;display:inline-block">Acknowledge Policy &rarr;</a>
      <p style="font-size:11px;color:#9ca3af;margin-top:16px">If the button does not work, copy and paste this link into your browser:<br>${opts.ackUrl}</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[Action Required] Acknowledge Policy: ${opts.policyTitle} (${opts.policyNumber})`,
    html,
  };
}

// ── Training assignment ───────────────────────────────────────────────────────

export function getTrainingAssignmentEmail(opts: {
  facilityName: string;
  staffName: string;
  trainingName: string;
  category: string;
  assignedBy: string;
  reason?: string;
  completionUrl: string;
  expiryDate?: string;
}) {
  const html = htmlWrap(`
    <div class="hdr">
      <h2>Training Assignment</h2>
      <p>${opts.facilityName}</p>
    </div>
    <div class="body">
      <p>Hello ${opts.staffName}, you have been assigned the following required training:</p>
      <div class="row"><span class="label">Training</span><span class="val">${opts.trainingName}</span></div>
      <div class="row"><span class="label">Category</span><span class="val">${opts.category.replace(/_/g, ' ')}</span></div>
      <div class="row"><span class="label">Assigned By</span><span class="val">${opts.assignedBy}</span></div>
      ${opts.expiryDate ? `<div class="row"><span class="label">Must Complete By</span><span class="val" style="color:#d97706;font-weight:700">${opts.expiryDate}</span></div>` : ''}
      ${opts.reason ? `<div style="margin-top:14px;padding:12px 16px;background:#f9fafb;border-left:3px solid #0d7377;border-radius:4px"><p style="margin:0;font-size:13px;color:#374151"><strong>Reason:</strong><br>${opts.reason}</p></div>` : ''}
      <p style="margin-top:16px;font-size:13px;color:#6b7280">Once you have completed this training, click the button below to confirm your completion. Your record will be updated automatically.</p>
      <a href="${opts.completionUrl}" class="btn" style="margin-top:20px;display:inline-block">Confirm Completion &rarr;</a>
      <p style="font-size:11px;color:#9ca3af;margin-top:16px">If the button does not work, copy and paste this link into your browser:<br>${opts.completionUrl}</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[Action Required] Training Assignment: ${opts.trainingName} - ${opts.facilityName}`,
    html,
  };
}

// ── Grievance deadline ────────────────────────────────────────────────────────

export function getGrievanceDeadlineEmail(opts: {
  recipientName: string;
  grievanceNumber: string;
  type: 'acknowledgment' | 'resolution';
  dueDate: string;
  complainantName: string;
}) {
  const url = `${base()}/trackers/grievances`;
  const deadlineName = opts.type === 'acknowledgment' ? '7-Day Acknowledgment' : '30-Day Resolution';
  const html = htmlWrap(`
    <div class="hdr">
      <h2>Grievance Deadline: ${deadlineName}</h2>
      <p>Grievance #${opts.grievanceNumber}</p>
    </div>
    <div class="body">
      <p>Hello ${opts.recipientName}, a CMS grievance deadline is approaching.</p>
      <div class="row"><span class="label">Grievance #</span><span class="val">${opts.grievanceNumber}</span></div>
      <div class="row"><span class="label">Complainant</span><span class="val">${opts.complainantName}</span></div>
      <div class="row"><span class="label">Deadline Type</span><span class="val"><span class="chip chip-red">CMS ${deadlineName}</span></span></div>
      <div class="row"><span class="label">Due Date</span><span class="val" style="color:#dc2626;font-weight:700">${opts.dueDate}</span></div>
      <p style="font-size:13px;color:#6b7280">CMS 482.13(e) requires written ${opts.type === 'acknowledgment' ? 'acknowledgment within 7 days' : 'resolution within 30 days'} of receipt.</p>
      <a href="${url}" class="btn">Manage Grievance &rarr;</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} NyxCitadel&trade; | HIPAA Compliant</div>
  `);

  return {
    subject: `[NyxCitadel] Grievance ${deadlineName} Due: ${opts.grievanceNumber}`,
    html,
  };
}

export function getOnboardingWelcomeEmail(data: OnboardingEmailData) {
  const base = process.env.APP_URL ?? 'https://nyxcitadel.com';
  return {
    subject: `Welcome to NyxCitadel™ - Your Compliance Command Center is Ready`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d7377 0%, #14a4a8 100%); color: white; padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0 0; opacity: 0.95; }
    .content { background: #f0fdfa; padding: 40px 20px; border-radius: 0 0 12px 12px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #1f2937; font-size: 18px; margin-top: 0; }
    .cta-button { display: inline-block; background: #0d7377; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px 0; }
    .cta-button:hover { background: #0b6165; }
    .step { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #0d7377; }
    .step-title { font-weight: 600; color: #1f2937; }
    .step-desc { color: #6b7280; font-size: 14px; margin: 5px 0 0 0; }
    .footer { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Welcome to NyxCitadel</h1>
      <p>Your Healthcare Compliance Command Center</p>
    </div>
    <div class="content">
      <div class="section">
        <p>Hello ${data.contactName},</p>
        <p>Your facility <strong>${data.facilityName}</strong> is now live on NyxCitadel! We're thrilled to help your team stay survey-ready and turn compliance from a crisis response into a competitive advantage.</p>
      </div>

      <div class="section">
        <h2>🎯 Next Steps (Takes 15 minutes)</h2>
        
        <div class="step">
          <div class="step-title">1. Complete Your Facility Profile</div>
          <div class="step-desc">Add facility details so Sentry can provide contextual compliance guidance specific to your facility type and regulations.</div>
          <a href="${base}/settings/facility" class="cta-button">Go to Settings</a>
        </div>

        <div class="step">
          <div class="step-title">2. Invite Your Team</div>
          <div class="step-desc">Add team members (Compliance Officer, Quality Lead, Admin) so your entire team has access and can collaborate in real-time.</div>
          <a href="${base}/settings/users" class="cta-button">Invite Users</a>
        </div>

        <div class="step">
          <div class="step-title">3. Build Your Compliance Calendar</div>
          <div class="step-desc">We've pre-loaded sample events. Customize them to match your facility's survey cycle, policy review dates, and training schedules.</div>
          <a href="${base}/calendar" class="cta-button">Open Calendar</a>
        </div>

        <div class="step">
          <div class="step-title">4. Say Hello to Sentry 🤖</div>
          <div class="step-desc">Try asking Sentry to draft a CAP or explain a compliance standard. Watch how it learns your facility's language and context.</div>
          <a href="${base}/assistant" class="cta-button">Meet Sentry</a>
        </div>
      </div>

      <div class="section">
        <h2>📖 Resources to Get Started</h2>
        <ul style="color: #6b7280; padding-left: 20px;">
          <li><strong>Questions?</strong> Reply to this email or contact support@nyxcitadel.com</li>
        </ul>
      </div>

      <div class="section" style="background: #ccfbf1; padding: 20px; border-radius: 8px; border: 1px solid #99f6e4;">
        <strong style="color: #0b6165;">Pro Tip:</strong> Your compliance calendar is pre-loaded with samples. Customize it in the <strong>Compliance Calendar</strong> section to match your facility's regulatory timeline and survey cycle.
      </div>

      <div class="footer">
        <p>© 2026 NyxCitadel™ | HIPAA Compliant | Healthcare Compliance Platform</p>
        <p><a href="${base}" style="color: #9ca3af; text-decoration: none;">Visit Dashboard</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Welcome to NyxCitadel - Your Healthcare Compliance Command Center

Hello ${data.contactName},

Your facility ${data.facilityName} is now live on NyxCitadel! We're thrilled to help your team stay survey-ready.

NEXT STEPS (Takes 15 minutes):

1. Complete Your Facility Profile - ${base}/settings/facility
   Add facility details so Sentry can provide contextual compliance guidance.

2. Invite Your Team - ${base}/settings/users
   Add team members so your entire team has access and can collaborate.

3. Build Your Compliance Calendar - ${base}/calendar
   We've pre-loaded samples. Customize them to match your facility's timeline.

4. Say Hello to Sentry 🤖 - ${base}/assistant
   Try asking Sentry to draft a CAP. Watch how it learns your facility's context.

Questions? Reply to this email or contact support@nyxcitadel.com

PRO TIP: Your compliance calendar is pre-loaded with samples. Customize it to match your facility's regulatory timeline.

© 2026 NyxCitadel™ - HIPAA Compliant Healthcare Compliance Platform
    `,
  };
}
