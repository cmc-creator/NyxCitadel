# Partner Screenshot Swap Guide

To replace the current branded preview graphics with real in-app screenshots, add the files below to:

`public/partner-previews/real/`

Required file names:

- `dashboard.png`
- `compliance.png`
- `executive.png`

Recommended export settings:

- Resolution: 1920x1080 (or 1600x900 minimum)
- Format: PNG
- Browser zoom: 100%
- Capture with realistic but non-sensitive data

How the fallback works:

- If a real screenshot exists at the path above, the partner portal displays it.
- If missing, the portal automatically shows the existing branded SVG preview.

Current fallback SVGs:

- `public/partner-previews/dashboard-preview.svg`
- `public/partner-previews/compliance-preview.svg`
- `public/partner-previews/executive-preview.svg`
