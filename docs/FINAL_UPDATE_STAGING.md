# Menu Studio Final Update — Staging and Release Gates

**Date:** 6 November 2026  
**Change set:** [draft PR #6](https://github.com/arunkumarnkl/Menustudio/pull/6)  
**Source:** `xxxxxx.docx` (three pages and embedded screenshots); five user-confirmed implementation decisions.  
**State:** Draft and **not deployed**. Do not merge or publish to production without staging sign-off.

## Confirmed behaviour and source checklist

| Area | Expected result | Current draft scope |
| --- | --- | --- |
| Dinner print choices | All Dinner serving styles expose Table Menu Card as an **extra optional** choice, never automatically checked for non-plated meals | `index.html` routing and real-contract tests |
| Breakfast / Lunch | Every serving style remains selectable | Unchanged all-style session selector; regression checks |
| Live Stations | Each distinct Live Station has its own A4 page; dishes under the same station may share that sheet, paginated only on overflow | Station IDs, active station for new dishes, one inline-editable title and separate print groups |
| PDF Save | Download an actual PDF; **never launch Print** | `html2pdf` file save with status and independent native Print |
| Word | Two equal half-page columns, predictable vertical alignment, front/back page layout | DOCX fixed-cell OOXML, row heights, balanced vertical alignment; downloadable DOCX smoke |
| Print Studio | Screen controls approximately 20% on desktop and full-size page preview 80%; small 1 cm × 0.5 cm print/save icons | Screen-only CSS; existing physical print sheet dimensions left unchanged |
| QR guest copy | Move edit controls out of Print Studio into Admin Settings QR code section | Admin-only `/admin/feedback-copy` GET/PUT storing shared text in D1 |
| Cloud Library | Twenty newest records for selected planner; filter other planners; compact expandable row; older records preserved | Signed-in Cloud UI filter and older-record toggle |
| Delete/Restore | Admin can delete/restore any event; Planner only own. Data retained, recoverable | D1 event status `archived` (no hard delete) with ownership checks and restore route |
| User creation | Clear validation, in-progress and success/failure response | User Profile panel and `/users/planners` response verification |
| Admin Settings | Print Rule, User Profile, QR code, Logo only on standalone Admin Settings screen | Separate `#ragasaan-admin` dialog; removed from Cloud Events |
| Client link | Only design settings and client preview/approved printing; no staff or cloud event navigation | Fail-closed `#client=...` isolation and backend removal of anonymous event routes |
| Client design | Immediately save design to shared event; planner gets in-app review/print task | Atomic D1 submission + allowlisted design merge; pending task badge and list; review before Print |
| Bride/Groom image | Adjustable vertical offset **0–200px** | Font/Logo design control range extended |

## Security Worker integration — **blocking gate**

The repository file `security/review-only-security-worker.js` is **a historical review reference**, not a verified copy of the deployed `ragasaan-security-api` source. Do **not** deploy it blindly. First obtain the actual deployed Worker source, reconcile the new routes and current authentication/legacy D1 schema, and deploy to a separate staging Worker and staging D1.

Verify every one of these APIs against staging:

- `GET /events`, `GET /events?includeArchived=1`: login required; all authenticated planners may browse other planners' events using a filter. Archived records are excluded by default.
- `DELETE /events/{id}`: Admin or owner only, changes status to `archived`, does not delete event JSON or dependents.
- `POST /events/{id}/restore`: Admin or owner only; returns archived event as Draft.
- `POST /client/view`: scoped single-event design-only snapshot; no staff/user/allergen-master data, and server-provided `canPrint` flag.
- `POST /client/submit`: applied design only, not any client-edited dishes, allergens, users or event ownership; atomic creation of submission and shared event design update; sets review status.
- `GET/PUT /admin/feedback-copy`: Admin-only, text stored in existing `app_settings`; non-Admin denied.
- `POST /users/planners`: Admin-only; duplicate or malformed inputs return readable errors; created user ID returned.
- `OPTIONS` preflight: `Access-Control-Allow-Methods` includes `DELETE`.
- Check existing D1 `events.status` column permits `archived`, app_settings exists with `key/value_json`, event ownership columns exist, audit logging works, and client design submission tables match.

**Potential compatibility change:** The review-only code previously exposed unauthenticated `/public/events` listing/writing. This draft denies those endpoints to enforce isolation from client invitation links and requires staff login for shared D1 records. Verify this behaviour against current production requirements before rollout. Browser-local menu editing is unaffected.

## Required browser + visual QA

The draft CI runs `node scripts/test-menu-studio-review.mjs`, `node scripts/test-final-worker-mock.mjs`, static build, and headless Chrome smoke tests `smoke-menu-studio-browser.mjs` and `smoke-final-update-security.mjs`. **Mock backend checks do not prove current production D1 compatibility.**

Before merge:

1. Open staging as Admin, Event Planner A, Event Planner B, signed-out visitor and a client invitation. Confirm each role's permitted controls and all forbidden endpoints. Reload the client link and remove its URL fragment to verify that staff data still requires sign-in.
2. Create 25 events across two planners in staging. Confirm 20 latest records, filter, older-record access, and ownership-based Delete/Restore with retained dishes and allergen values.
3. Open Dinner > Live Station, add 3 stations and 2 dishes per station; verify exactly one distinct title per A4 station and proper overflow pagination. Confirm title is editable and persists on reload.
4. Change serving styles for Breakfast, Lunch, Dinner and confirm all previously assigned dishes are retained. Test optional Table Menu Card under every Dinner style and never automatically checked.
5. Download A4/Live/Table/FoldTags/A6/A8/Canapé PDF separately without browser Print dialog; **open each PDF** and inspect every page at true print size, including allergen dark red and margin/cut alignment.
6. Download Table Menu Card DOCX and open in **Microsoft Word**; inspect front/back page proportions, image/logo and QR placement, and absence of unintended third page. PDF preview and Word are different rendering engines and will not automatically pixel-match.
7. Test Admin Create Event Planner with invalid, duplicate and valid emails. Confirm success/error in User Profile and actual D1 user record.
8. Create a client design link. Verify client can change only permitted style fields, preview reflects print geometry, submission updates shared event immediately, planner receives in-app task, and Print remains blocked until approved.
9. Change Admin QR image and feedback wording; verify both propagate to new and reloaded event Table Menu Card back pages, without exposing Admin editor to planners or clients.
10. Test narrow desktop/mobile viewport and print scaling. Compact buttons still need accessible pointer targets.

## Release/rollback plan

1. Back up production D1 before any Worker migration. Never clear events/users during this release.
2. Deploy the reconciled Security Worker to a **staging** Worker/D1, validate all role and token paths.
3. Test the static frontend branch against staging API with explicit staging origin.
4. After all gates pass, approve/merge PR #6 and deploy the compatible Security Worker and frontend together, verifying API responses and actual browser exports on the final `workers.dev` URL.
5. Retain previous frontend commit and Worker version as rollback points; D1 archived-record and new setting changes must be backward-compatible.

No production code, Worker, account, logo, D1 record, or deployment has been changed by this draft.
