# Allergen Database & Menu Generator — Web Edition

A GitHub Pages–deployable version of the existing HTML/JavaScript menu generator.
No Python, PySide6, Streamlit, Node build step, or SQLite server is required.

## Features retained
- Existing HTML interface, menu formats, live previews, editing and print controls
- Master dish/allergen registry, venue registry, manual menu items
- Excel/CSV import and export (requires the third-party XLSX CDN to load)
- Design settings, logos, colour themes, border and image controls
- Local browser storage, plus **Backup JSON / Restore JSON** controls

## Deploy to GitHub Pages
1. Create a GitHub repository, ideally **private** for source-code management.
2. Upload the **contents of this folder**, including `index.html`, `.nojekyll`, and `.github/workflows/deploy-pages.yml` (not the ZIP itself).
3. Commit to the `main` branch.
4. In **Settings → Pages**, set **Source: GitHub Actions**.
5. Open **Actions** and wait for the `Deploy Menu Generator to GitHub Pages` workflow to finish.
6. Open the published URL shown in Settings → Pages, usually
   `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The published Pages URL is normally publicly accessible, even if repository visibility is restricted (depending on GitHub plan/settings). Do not assume this is a private employee portal.

## Local testing
Run `python -m http.server 8000` in this folder, then visit
`http://localhost:8000`. No extra Python packages are needed.
You can also open `index.html` directly, but HTTP testing is preferable.

## Storage and data migration
GitHub Pages hosts static files only. Dish records, venue records, design settings and
uploaded images remain in the **localStorage of the browser and origin**.
They are **not** synced to GitHub, between devices, or between browsers.

Use the top **Backup JSON / Restore JSON** controls to migrate between deployments
of this Web Edition. To move from the old desktop HTML, export the Master Database
and Venue Database using their existing Excel export options, then import them
in the web version. The old app's local styling and logo state does not automatically
transfer between origins; you may need to re-upload logos and adjust styling.

The JSON backup may contain names, event details, and embedded logo/image data.
Keep backup files private. Browser storage can be cleared by the user or browser;
take regular backups. Large images can exceed browser storage quotas.

## Security — important
- **No real user authentication is provided by GitHub Pages.**
- The original hard-coded HTML password was removed. On the first protected
  edit/export action, users configure a browser-local passphrase. Its hash is
  stored locally; this is a **UI safeguard only**, not access control.
- Anyone who can open the published URL can use their own copy of the app,
  and can inspect or modify its JavaScript. They cannot see another user's
  browser-local records merely by visiting the site.
- Never commit real event data, private venue records, credentials, API keys,
  or database backups to the repository.
- For central, multi-user storage and real roles/login, a separate authenticated
  backend and managed database are required (e.g., Supabase with RLS or a
  hosted Python API + PostgreSQL). GitHub Pages alone cannot provide these.

## Online dependencies
Some icon fonts, Google Fonts, Excel import/export, and PDF libraries load
from public CDNs. The page requires internet access for those libraries.
Check browser print/PDF layouts on your target printer before production use.

## Not part of this deployment
The PySide6 desktop code, SQLite database, and desktop bridge are **not** deployed.
They are not needed for the GitHub Pages edition.

## Troubleshooting
- Blank page: check browser developer console and reload with internet access.
- Excel controls unavailable: ensure CDN scripts are reachable.
- Old data missing: browser storage is per origin; import Excel or restore JSON.
- Pages 404: verify `index.html` is at repo root and Pages uses GitHub Actions.
- Styles look wrong: ensure `index.html` uploaded completely and no content was
  copied into GitHub's Markdown editor.
