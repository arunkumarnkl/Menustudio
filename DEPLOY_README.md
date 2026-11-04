# Ragasaan Menu Studio — staged release

## Scope
This release is for the **Menustudio** GitHub repository only. It does not touch the separate Purchase Order app/repository.

## Before deployment
1. Back up the current Menustudio GitHub repository and D1 database.
2. In Cloudflare D1 `ragasaan-menu-db` Console, execute `MIGRATION_D1.sql` once. It creates `app_settings` without deleting existing tables.
3. Update **only** `ragasaan-security-api` with the provided `worker.js`. Keep existing D1 binding `DB`, `ALLOWED_ORIGIN`, and existing account records. Do not modify `ragasaan-allergen-sync`.
4. In GitHub repository `Menustudio`, replace `index.html`, `security-app.js`, `security.css`, and `themes/gallery.json`. Keep existing `assets/`, `database/`, and `github-sync-config.js` untouched.
5. Wait for GitHub Pages build to complete, refresh and test with a dummy event.

## Included changes
- Admin view with user profile/role editing, activation, password resets (minimum 8 characters) and session revocation
- Shared Cloudflare D1 choice settings and default selections
- Admin-controlled client print-format availability; logo publishing and feedback QR configuration
- Three-column Event Builder; streamlined sessions and Plated Service display
- Default Breakfast Buffet/Thali formats A4 + FoldTags + Canape Labels; removal of per-dish tag-copy inputs
- Existing theme, client submission and menu-printing integration preserved in the staged source

## Not automatically changed
- No GitHub files were pushed or deleted.
- No Cloudflare Worker or D1 changes were deployed by this package.
- No changes were made to the separate Purchase Order repository.

## Testing limitations
Local JavaScript syntax checks and a browser smoke test passed. Live Cloudflare login, D1 migration, client link submission, print fidelity, Word export, and actual GitHub Pages deployment require staging/production verification.

## Deletion policy
Do not delete any existing GitHub files as part of this release. Review file usage and obtain approval before deleting obsolete files.
