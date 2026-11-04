# Ragasaan Menu Studio — November 4 update (requirements from ccc.docx + follow-ups)

## This update replaces four existing GitHub files

Open repository: https://github.com/arunkumarnkl/Menustudio

In the repository root, replace:
1. `index.html`
2. `security-app.js`
3. `security.css`

Inside `themes/`, replace:
4. `themes/gallery.json`

**Do not replace** `github-sync-config.js`, `database/allergens.json`, any asset/logo files, or any of your Cloudflare Workers. No new database tables or D1 migration is needed for this version. Upload all four files and commit them; wait for GitHub Pages deployment to finish and hard-refresh with Ctrl+Shift+R.

## What changed

- Meal sessions default to Breakfast (single buffet), Lunch (regular buffet or Thali), Dinner (course-wise Table Service), HI Tea (single buffet), and Late Night Snack (single Other). Reception session removed. Prior Reception dishes are moved into Dinner on migration; check their course assignments.
- Dinner Buffet **now combines all dishes into one section** (latest decision); Dinner Table Service remains course-wise. Dinner Thali and Bowl Food also use one section.
- Fixed Canapé and Live Station service types; Main Course choices Table Service/ Buffet / Bowl Food; Dessert choices Table Service / Buffet.
- A4 Client Summary is optional via checkbox in Meal-wise Planning. Course/meal times appear for data entry only if that report is selected. Course-wise meals have per-course timing fields.
- Summary Party No input removed, report prints `PARTY NO:` with no value even for legacy saved events.
- A4 summary: compact read-only meal-grouped item list on left; live two-column A4 preview on right; Print/PDF and editable Word .docx button. Word may paginate differently from browser A4 preview. Internet connection required for the Word DOCX library.
- Twenty built-in theme presets: 10 bold and 10 mild, both professional and wedding styles. Quick Color Palette controls removed; theme gallery remains.
- FoldTags logo width default 100px for new settings; previously saved custom width remains in effect.
- Table Menu Card: event date directly beneath event/couple title; couple logo centered nearby; venue placed just above Ragasaan logo.
- Venues tab hidden for Event Planner; existing Admin can access. Authorization on backend D1 remains unchanged.
- Cloud save is compacted to avoid 'Request too large': base64 image duplication stripped, small logos stored once; large embedded images stay local. Existing GitHub company logo still auto-loads. Never store extra secrets in GitHub.
- Existing cloud event authentication, Client Designer links, submitted designs and planner approval code is retained; existing GitHub allergen sync files untouched.

## Test before using real clients

1. Log in as the existing Admin. Verify all five meal sessions and all 20 themes.
2. Select Dinner → Buffet: all dishes should be in one section. Then select Table Service: course choices and course service appear.
3. Turn A4 Client Summary ON. Enter course times, add dishes, open Summary; verify Party No blank, read-only items at left, A4 preview at right, print and Word buttons.
4. Save a **dummy** event to Cloud Events. The compact event payload should avoid previous HTTP 413. If it still fails, check the D1 Worker log and the displayed error; do not delete the tables.
5. Use a dummy client link to verify Client Designer submissions and Event Planner approvals. Test a planner cannot access Venues.
6. Keep a backup of your original four GitHub files before replacement. Do not overwrite your company/allergen data.

## Validation completed here

- JavaScript syntax check (`node --check`) passed for app and security scripts.
- Headless Chromium mocked-login navigation tested meal mode switches, summary toggle, summary preview, 20 themes, and save-cloud request, with no JavaScript exceptions.
- A test event's serialized cloud-save request was around 10 KB (worker limit is much larger). Live Cloudflare D1 was not modified or tested from this environment.
- Word export code is implemented; full Word library download and live export cannot be verified in this offline test environment, and exported Word pages may paginate differently from the A4 HTML preview.

## Known constraints

- Static GitHub Pages assets and the public allergen JSON are publicly retrievable. Cloudflare API permissions protect D1 records; hiding a UI control is not a security boundary for local browser data or printing via native browser functions.
- Cloud snapshots omit large embedded local images, especially large rear-page image files; use GitHub company logo and keep backups of local designs. Small embedded logos below 125,000 characters are preserved once.
- Browser print to PDF is the best match to the exact one-page A4 summary preview. Word export is editable but may use more than one Word page if content is unusually large.
