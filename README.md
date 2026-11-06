# Ragasaan Menu Studio — Repository Guide

This repository currently contains **two separate applications**, along with public database assets. Avoid deleting Python modules or changing Cloudflare D1 when deploying the Menu Studio website.

## 1. Menu Studio (HTML/JavaScript)

| Location | Purpose |
| --- | --- |
| `index.html` | Menu Studio UI, meal planner, previews, printing and Word exports |
| `security-app.js` | Front-end login, cloud events, Admin/Planner integration |
| `security.css` | Cloud login and management panel styling |
| `github-sync-config.js` | Public URL for the separate GitHub allergen-sync Worker; **no secrets here** |
| `database/allergens.json` | Published master dish/allergen data |
| `database/venues.json` | Initial venue database |
| `themes/gallery.json` | Theme gallery |
| `assets/company-logo.png` | GitHub-hosted fallback logo |
| `scripts/build-menustudio.mjs` | **Allowlisted** static website build |
| `scripts/test-menu-studio-review.mjs` | Automated checks for the in-progress release |
| `wrangler.toml` | Cloudflare static-website configuration |
| `security/review-only-security-worker.js` | **Historical Worker reference for code review only. Never deploy directly.** |

### Build and validate

Run from the repository root with Node.js 22 or later:

```bash
node scripts/test-menu-studio-review.mjs
node scripts/build-menustudio.mjs
```

The build creates `dist/menustudio` containing only the HTML, scripts, styles, public JSON, theme data and approved fallback logo. It excludes Python files, deployment documents and Security Worker source. The build folder is gitignored.

**GitHub Pages** publishes `dist/menustudio` via `.github/workflows/deploy-pages.yml`, triggered on `main`. **Cloudflare's** `menustudio` site is a separate deployment governed by `wrangler.toml`; a GitHub Pages deployment alone does not update it.

**Never** replace the deployed `ragasaan-security-api` Worker with the review-only copy in this repository. First obtain its actual live source, reconcile authentication and D1 changes, and test all roles on staging. The other `ragasaan-allergen-sync` Worker is unrelated and must not be overwritten.

## 2. Purchase Order application (Streamlit)

The root `app.py`, `requirements.txt`, and root Python modules are the separate Ragasaan Purchase Order system. Its import paths currently assume modules that are **not present in this repository**, such as `po_logic.py`, `recipe_book_view.py`, and `po_word.py`; see `docs/REPOSITORY_AUDIT.md` before trying to deploy the Python app.

Do not remove these modules as "unused" just because the Menu Studio static builder does not reference them. The Purchase Order deployment instructions are kept in `GITHUB_DEPLOY_UPDATE.md`.

## 3. Data, security, and releases

- The public JSON files under `database/` are **not** the Cloudflare D1 event database.
- D1 holds account, permission, event, and approval data and belongs to `ragasaan-security-api`. Website code changes do not automatically migrate or delete D1.
- The company logo may be Admin-published in D1, with the GitHub asset used as fallback. Permissions and Worker endpoints must be tested before claiming cloud publication works.
- `.github/workflows/menu-studio-review.yml` checks draft changes without deploying.
- Keep work in [draft PR #5](https://github.com/arunkumarnkl/Menustudio/pull/5) until browser, print/Word, login, D1 and Cloudflare staging tests pass.
- Existing events contain allergen information; review each against the approved kitchen allergen matrix before catering service.

See `docs/REPOSITORY_AUDIT.md` for the November 2026 cleanup findings. `GITHUB_SYNC_SETUP.md` documents the separate allergen database publishing Worker.
