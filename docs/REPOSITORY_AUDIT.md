# Repository audit — 6 November 2026

Scope: `arunkumarnkl/Menustudio`, draft PR #5, **no live deployment or D1 modifications**.

## Audit conclusions

The repository contains two distinct applications: (1) the static Menu Studio allergen/menu builder and (2) a Python Streamlit Purchase Order app. They share the repository root but **not** a build system. Menu Studio deployment must not publish the Purchase Order source, documentation, or backend Worker reference.

### Retained files

**Menu Studio runtime:** `index.html`, `security-app.js`, `security.css`, `github-sync-config.js`, `database/allergens.json`, `database/venues.json`, `assets/company-logo.png`, `themes/gallery.json`. These are the curated browser allowlist. The fallback PNG is 522 KB; it should not be mistaken for a file to delete merely because the D1 logo publisher has a 150 KB upload limit.

**Static deployment and validation:** `wrangler.toml`, `scripts/build-menustudio.mjs`, both workflows under `.github/workflows/`, `.nojekyll`, `.gitignore`, `scripts/test-menu-studio-review.mjs`. The GitHub Pages workflow is restricted to curated `dist/menustudio` artifacts instead of publishing the entire repo. The build refuses to proceed if an allowlisted source file is absent.

**Separate Security Worker:** `security/review-only-security-worker.js` is an *old source reference for review, not a deployable current production Worker*. Production authentication, permissions and D1 must be reconciled with its latest live source.

**Separate Streamlit Purchase Order app:** `app.py`, `requirements.txt`, `cloud_storage.py`, `logo_store.py`, `persistent_images.py`, `po_auth.py`, `recipe_images.py`, `recipe_management.py`, `sheet_store.py`, `ui_theme.py`, `create_admin_hash.py`, `migrate_excel_to_github.py`. All are retained: active imports or administrative utilities warrant keeping them. Their deployment instructions remain `GITHUB_DEPLOY_UPDATE.md`.

**Additional retained guide:** `GITHUB_SYNC_SETUP.md` documents the separate GitHub database synchronization Worker.

### Existing Purchase Order problems (not caused by the cleanup)

`app.py` and `recipe_management.py` reference Python modules missing from the tracked repository. Observed imports include:

```
recipe_book_view.py
purchase_preview.py
recipe_thumbnail.py
po_word.py
po_v35_features.py
po_logic.py
po_v2_logic.py
po_v34_features.py
calculation_guide.py
startup_repair.py
po_v3_logic.py
```

The root Streamlit application is therefore **not self-contained as committed**. Do not delete its remaining Python files or assume that Menu Studio deploy tests establish Streamlit functionality. Restore missing modules from the correct Purchase Order release in a separate change.

### Removed from draft branch (recoverable in git history)

- `DEPLOY_README.md` — refers to a missing `MIGRATION_D1.sql` and an absent `worker.js`; stale deployment instructions.
- `README_DEPLOY.md` — previous Admin Rules rollout guide referencing an absent Worker source and legacy configuration.
- `README_UPDATE.txt` and `READ_ME_FIRST.txt` — obsolete 4–5 November ZIP replacement instructions.
- `assets/README.md` and `database/README.md` — folder-creation placeholders no longer needed after real files were committed.

The primary `README.md` now explains the deployed build and the two applications.

### Boundaries and remaining validation

- **No cloud D1 event, account, or security data deleted.** Trial event cleanup requires inspecting the active D1 database/Worker, and should be kept separate from code cleanup.
- Do not move root `app.py` or its Python modules without updating all Streamlit imports and its deployment entrypoint.
- Do not move Menu Studio `index.html` / public JSON / logo without updating relative fetch URLs, external Pages URL, Cloudflare build script, and previews.
- Do not delete `security-app.js` or `github-sync-config.js`; they are used by the browser.
- Test `node scripts/test-menu-studio-review.mjs` and `node scripts/build-menustudio.mjs`. Browser and PDF/Word printing, all serving-style transitions, live Worker permissions and D1 must be tested before merging PR #5.
