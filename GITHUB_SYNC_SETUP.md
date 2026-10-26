# Ragasaan — secure GitHub database publishing

## Upload to existing GitHub Pages repository
Replace root `index.html`, and add root `github-sync-config.js`. Keep your existing `database/allergens.json`, `database/venues.json`, and company logo files intact. Do not upload the `cloudflare-worker` directory to GitHub Pages as a publicly usable credential store: it is source code for a separately deployed Worker.

## Set up Cloudflare Worker
1. In Cloudflare, create a Worker, paste `cloudflare-worker/worker.js` into its editor and deploy it. A free plan may be sufficient for modest usage.
2. In Worker Settings → Variables and Secrets, set:
   - `GH_OWNER`: GitHub account or organisation that owns the repository.
   - `GH_REPO`: exact repository name (not the Pages domain).
   - `GH_BRANCH`: `main` (or your actual publishing branch).
   - `ALLOWED_ORIGIN`: exact site origin, e.g. `https://arunkumarnkl.github.io` (no trailing slash).
   - `GH_TOKEN` **secret**: fine-grained GitHub personal access token limited to this one repository, with **Contents: Read and write** permission.
   - `ADMIN_PASSWORD` **secret**: a long unique password, separate from your browser-local passphrase.
3. Copy the deployed Worker HTTPS URL into `window.RAGASAAN_SYNC_ENDPOINT` in root `github-sync-config.js` and commit.
4. Open the website, navigate to **Master Database**, make an edit and choose **Save to GitHub**. Enter the Worker admin password. Reload to confirm.

## Important security and reliability notes
- Neither GitHub token nor admin password goes into GitHub Pages, JavaScript configuration, screenshots, or git commits. Secrets are stored only in Cloudflare Worker settings.
- Browser-local edit passphrase is NOT security. Anyone can change their own browser data or import files; only users with the Worker admin password can publish to GitHub. The public website's master editor is not genuinely access-controlled. For strict admin-only editing, put the admin editor behind Cloudflare Access or a separate authenticated admin interface.
- Use Cloudflare WAF/rate limiting and optionally Cloudflare Access to protect `/publish` against password guessing. CORS limits browser access, not direct HTTP clients. The Worker validates the password server-side.
- Save to GitHub overwrites the full master JSON. It checks the GitHub file SHA to reject stale saves; it does not merge changes. Back up local edits before reloading after a conflict.
- Published changes can take time to reach GitHub Pages. Browser visits fetch the master with `cache: no-store`.
- GitHub Pages is public; do not put sensitive data in the database. Allergen records should be professionally checked before food service.
- The ZIP intentionally does not contain `database/allergens.json`, because your original upload did not contain it. Preserve the existing repository file.
