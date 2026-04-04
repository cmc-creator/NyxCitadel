export interface OnboardingEmailData {
  facilityName: string;
  contactName: string;
  contactEmail: string;
}

export function getOnboardingWelcomeEmail(data: OnboardingEmailData) {
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
          <a href="https://citadel.example.com/settings/facility" class="cta-button">Go to Settings</a>
        </div>

        <div class="step">
          <div class="step-title">2. Invite Your Team</div>
          <div class="step-desc">Add team members (Compliance Officer, Quality Lead, Admin) so your entire team has access and can collaborate in real-time.</div>
          <a href="https://citadel.example.com/settings/users" class="cta-button">Invite Users</a>
        </div>

        <div class="step">
          <div class="step-title">3. Build Your Compliance Calendar</div>
          <div class="step-desc">We've pre-loaded sample events. Customize them to match your facility's survey cycle, policy review dates, and training schedules.</div>
          <a href="https://citadel.example.com/dashboard/calendar" class="cta-button">Open Calendar</a>
        </div>

        <div class="step">
          <div class="step-title">4. Say Hello to Sentry 🤖</div>
          <div class="step-desc">Try asking Sentry to draft a CAP or explain a compliance standard. Watch how it learns your facility's language and context.</div>
          <a href="https://citadel.example.com/dashboard/assistant" class="cta-button">Meet Sentry</a>
        </div>
      </div>

      <div class="section">
        <h2>📖 Resources to Get Started</h2>
        <ul style="color: #6b7280; padding-left: 20px;">
          <li><a href="https://citadel.example.com/guide" style="color: #0d7377; text-decoration: none;">📚 Read the User Guide</a> - Comprehensive walkthrough of all features</li>
          <li><a href="https://citadel.example.com/walkthrough" style="color: #0d7377; text-decoration: none;">🎬 Watch the Feature Tour</a> - 5-minute video showing core workflows</li>
          <li><strong>Questions?</strong> Reply to this email or contact support@nyxcitadel.com</li>
        </ul>
      </div>

      <div class="section" style="background: #ccfbf1; padding: 20px; border-radius: 8px; border: 1px solid #99f6e4;">
        <strong style="color: #0b6165;">Pro Tip:</strong> Your compliance calendar is pre-loaded with samples. Customize it in the <strong>Dashboard → Compliance Calendar</strong> section to match your facility's regulatory timeline and survey cycle.
      </div>

      <div class="footer">
        <p>© 2026 NyxCitadel™ | HIPAA Compliant | Healthcare Compliance Platform</p>
        <p><a href="https://citadel.example.com/guide" style="color: #9ca3af; text-decoration: none;">Need help?</a> · <a href="https://citadel.example.com" style="color: #9ca3af; text-decoration: none;">Visit Dashboard</a></p>
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

1. Complete Your Facility Profile - https://citadel.example.com/settings/facility
   Add facility details so Sentry can provide contextual compliance guidance.

2. Invite Your Team - https://citadel.example.com/settings/users
   Add team members so your entire team has access and can collaborate.

3. Build Your Compliance Calendar - https://citadel.example.com/dashboard/calendar
   We've pre-loaded samples. Customize them to match your facility's timeline.

4. Say Hello to Sentry 🤖 - https://citadel.example.com/dashboard/assistant
   Try asking Sentry to draft a CAP. Watch how it learns your facility's context.

RESOURCES:
- Read the User Guide: https://citadel.example.com/guide
- Watch the Feature Tour: https://citadel.example.com/walkthrough
- Questions? Reply to this email or contact support@nyxcitadel.com

PRO TIP: Your compliance calendar is pre-loaded with samples. Customize it to match your facility's regulatory timeline.

© 2026 NyxCitadel™ - HIPAA Compliant Healthcare Compliance Platform
    `,
  };
}
