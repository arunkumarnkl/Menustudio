RAGASAAN MENU STUDIO — 5 NOVEMBER 2026
Unified Simple Builder + OFFLINE Word Export
================================================

THIS ZIP IS ONLY FOR THE GitHub repository: arunkumarnkl/Menustudio.
Do not edit or delete anything in the separate Purchase Order repository.

FILES
index.html           (required replacement; includes all Word code)
security-app.js      (same current meal-defaults/client-security integration)
security.css         (same security stylesheet)
themes/gallery.json  (current theme gallery; preserve your own edits to gallery.json)

WHAT CHANGED
1) Event Builder: latest three-column Simple/Advanced mode, one meal selector,
   quick dish search/add, compact selected-items list with edit/remove/drag,
   editable Menu and meal heading names/visibility, preserved meal defaults.
2) A4 Client Allergen Summary: Word (.docx) works without downloading DOCX
   libraries or loading docx@... from a third-party CDN.
3) Print & Downloads: NEW Word (.docx) buttons for A4 Buffet Menu and Table
   Menu Card, including the second/back page; Admin feedback QR is embedded
   when a PNG/JPEG data URL is available.
4) Documents are genuine OOXML Word files. Text is editable. Page arrangement,
   font substitution, borders and image sizing may differ from the browser's
   exact Print/PDF preview. Use Print/PDF for print-identical production.
5) Cloudflare login, D1 data, GitHub allergen sync, QR management, other formats
   and the separate Purchase Order app are not changed by this package.

DEPLOYMENT
1) BACK UP your current GitHub Menustudio index.html locally first.
2) Upload the included index.html to the root of arunkumarnkl/Menustudio.
3) If your previous Simple Builder update was not deployed, also upload the
   included security-app.js and security.css to the repository root, and
   themes/gallery.json to the themes folder. Do not overwrite customised
   themes/gallery.json without comparing the changes first.
4) Check your Pages deployment and test the GitHub Pages URL:
   https://arunkumarnkl.github.io/Menustudio/
5) If you normally use https://menustudio.arunkumarnkl.workers.dev, that URL
   may use a separate Cloudflare deployment and may NOT automatically follow
   GitHub commits. If the new export works on GitHub Pages but not the Workers
   address, update the deployment source for that separate site first.
6) Hard refresh with Ctrl+Shift+R, sign in, and test a dummy event:
   Event Allergen Summary > Download Word (.docx)
   Print & Downloads > Buffet Menu A4 > Download Word (.docx)
   Print & Downloads > Table Menu Card > Download Word (.docx)

NO WORKER UPDATE NEEDED FOR THIS WORD FIX.
If the per-meal Admin defaults were NOT previously deployed, that is a separate
Security Worker update (meal_defaults_v1); do not mix its code with this ZIP.

TEST EVIDENCE
Node syntax checks passed for all inline scripts. Headless Chromium produced
3 .docx downloads WITHOUT external libraries; Python zipfile verified ZIP CRC
and python-docx opened all three, including the optional QR image on Table Card.
A browser UI smoke test verified Simple/Advanced, heading editing, selected item
editing, and preview rendering. Live Cloudflare writes and real printer layout
have not been end-to-end tested.
