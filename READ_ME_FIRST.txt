RAGASAAN MENU STUDIO — GITHUB FILE UPDATE
Version: 2026-11-04, three-role integration and theme gallery

Your existing live site is NOT changed by downloading this ZIP.

IMPORTANT: FIRST deploy the separately supplied Ragasaan Security Worker Update ZIP
into ragasaan-security-api and test /health. Do NOT deploy it into
ragasaan-allergen-sync. Do NOT delete D1 tables or re-create the Admin account.

AFTER the worker update:
1. Back up the existing Menustudio GitHub repository (at least index.html).
2. In your Menustudio GitHub repository ROOT, replace index.html with this ZIP's index.html.
3. Add security-app.js and security.css in that SAME ROOT folder.
4. Create the 'themes' folder and upload themes/gallery.json into it.
5. Keep your existing github-sync-config.js, database/allergens.json,
   database/venues.json, assets/ and other files unchanged.
6. Commit all four replacement/additional files together. Clear browser cache (Ctrl+Shift+R).
7. Sign in using your established Admin email/password; do not use the BOOTSTRAP_SECRET.

DESIGN & SECURITY FEATURES
- Nine complete presets: six professional, three wedding, including font pairing,
  typographic sizes, colours, per-format decorative borders.
- Seven menu/tag formats preserved including FoldTags.
- Custom themes: save/import/export in browser. Optional GitHub gallery expansion by
  editing themes/gallery.json. Direct web editing/publishing of gallery.json is NOT installed.
- Role-aware Admin / Event Planner login, session/logout, Cloud Events D1 save/load.
- Admin: create/deactivate planner accounts, assign planners to saved events.
- Client: time-limited event link with revocation, read-only event dishes/allergens,
  styling for menu/tag formats, and Table Menu Card-only bride/groom name/logo/welcome.
- Submit directly to D1; assigned planner reviews and approves/rejects, requests changes,
  and approves printing. Admin can print without a planner approval.
- Existing GitHub allergen database sync and local backup formats remain untouched.

USE IN APP
- Admin/Planner: login > Cloud Events > Save Current Event to Cloud > choose event >
  Generate Secure Client Link. Share it privately.
- Client: open link > select theme/format > customise > Submit Design.
- Planner: Cloud Events > select event > Refresh Submissions > Approve Design >
  Load Selected into Builder > approve printing (if needed) > print.
- 'Save Event' in the older Builder/summary remains a LOCAL browser save. Use the
  new 'Save Current Event to Cloud' button for cross-device collaboration.

SECURITY & TESTING LIMITATIONS
- We tested JavaScript syntax, source preservation, and Worker design validation;
  live Cloudflare D1 permissions and browser UI must still be tested after deployment.
- This is GitHub Pages. HTML/JavaScript and public database/allergens.json remain
  publicly readable. Cloudflare D1 event data is access-controlled server-side.
- The existing ragasaan-allergen-sync Worker remains a separate publishing system
  with its own Admin password. Do not remove its credential protection.
- In a static GitHub Pages app, a malicious user with developer tools can bypass
  print buttons; the approval check is a staff workflow guard, not DRM.
  Truly access-controlled print files require server-side document generation.
- Client preview is illustrative. Event Planner must check final physical page layout
  and allergen accuracy before printing or distribution.
- Secure client URLs are bearer links: anyone with a valid unexpired link can submit
  designs for that one event. Share privately, revoke if disclosed.
- Enable login rate limiting on Cloudflare for production, and consider stronger
  admin authentication / MFA through Cloudflare Access as a later upgrade.
- Do not put Worker secrets, passwords or client access tokens in GitHub.

ROLLBACK
Restore your backed-up old GitHub index.html. Keep DB as-is; no table deletion.
If necessary, restore your previous ragasaan-security-api Worker code.
Your existing ragasaan-allergen-sync Worker should never be changed by this update.
