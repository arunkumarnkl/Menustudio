# Ragasaan Menu Studio — Admin Rules release (5 Nov 2026)

Scope: ONLY the `Menustudio` repository and the `ragasaan-security-api` Cloudflare Worker. Do not modify the separate Purchase Order repository or `ragasaan-allergen-sync`.

## Why both updates?
The new Admin Printing Rules endpoint is server-backed. Deploying the HTML alone will not enable it. Existing D1 `app_settings` already exists; **no SQL migration is needed**.

## Install safely
1. Back up the current `ragasaan-security-api` Worker code (and note the current deployed version). Save a local copy of your current GitHub website files.
2. In Cloudflare Workers & Pages > `ragasaan-security-api` > Edit code, replace the code with `worker.js` from this release and Deploy. Preserve the `DB` D1 binding, `ALLOWED_ORIGIN`, and Admin credentials. Do NOT modify `ragasaan-allergen-sync`.
3. Check `/health` and re-test Admin login. Health does not verify new settings endpoints; the Admin settings tab will do that.
4. Replace ONLY these `Menustudio` repo files, preserving paths: `index.html`, `security-app.js`. `security.css` and `themes/gallery.json` are included for completeness and may be left unchanged if already matching.
5. Wait for your live host deployment. If using the Cloudflare Workers-hosted `menustudio.arunkumarnkl.workers.dev`, confirm that service has the new site files too; publishing GitHub Pages does not automatically update an independently deployed Cloudflare Worker website.
6. Sign in Admin > Cloud Events > Admin Settings. Under **1. Meal Defaults** set enabled services, default service, per-course services, and default print formats. Under **2. Printing Rules** set print destinations and A4 companion tags. Save each section separately.
7. Test a NEW dummy event. Verify Breakfast A4/FoldTags/Canapé, Lunch A4, Dinner Plated Table Menu Card (no canapés), Dinner Buffet-Selective course outputs, Admin permissions, existing saved event, and Cloud Save/Load.

## Behavior
- Settings are stored in existing Cloudflare D1 `app_settings` (`meal_defaults_v1`, `printing_rules_v1`).
- Only Admin may save shared rules; Event Planners can read them.
- New, empty events accept updated defaults. Events saved in this version persist their own print-routing snapshot. Older saved events without a snapshot continue using the legacy print rules.
- Existing D1 event data, personal credentials, allergen master, venue records and PO repo are not modified by this release.
- The GitHub source files and publicly served allergen JSON remain public; frontend hiding alone is not a security boundary.
- New export format templates still require code; the Admin interface configures existing print destinations, not arbitrary new page designs.
