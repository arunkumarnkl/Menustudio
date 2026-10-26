# Allergen Database & Menu Generator — GitHub AutoDB Edition

**Master allergen database:** Automatically fetched from `database/allergens.json` whenever the website loads. Local master edits are temporary and overwritten at next successful site load. A clear warning is displayed if GitHub cannot be reached; previously cached data is used when available.

**Venue database:** `database/venues.json` seeds browser-local venues on first use. Later venue edits are kept locally.

## Company logo hosted on GitHub
1. In your repository, create the `assets` folder (e.g. with `assets/README.md` via **Add file → Create new file**).
2. Upload your **actual company logo** named exactly `company-logo.png` into `assets`.
3. Replace `index.html` with the new version in this package, and commit.
4. On each subsequent visit, the site automatically fetches `assets/company-logo.png` and uses it on all menu formats that show the company logo. You can still upload a temporary replacement from the app; refreshing the page re-applies the GitHub logo.
5. To permanently change the company logo, replace the PNG in GitHub and commit the change.

**Note:** The real logo image is not in this download because it has not been supplied. Until it is uploaded, the existing built-in logo or browser-local logo is used.

## Update the live site
1. Extract this ZIP. In the GitHub repository root, replace `index.html`.
2. Create a `database` folder. Upload `allergens.json` and `venues.json` into it.
3. Commit all three files to `main`. The existing GitHub Pages publishing configuration will deploy them.
4. Reload the Pages website. You should see the status bar displaying the dish count.

## Updating the central Master Database
Replace `database/allergens.json` in GitHub and commit. On the next visit the site fetches the new version. The browser UI cannot permanently edit GitHub files. A browser-local passphrase is not real authorisation; GitHub write permissions control permanent updates. This is a **public static** database; do not publish confidential information.

## Important allergen quality note
This JSON was generated from `master allergen 2027.xlsx`. Fields with irregular text and `tbc` were left as provided rather than guessing allergen values. **Verify each dish's allergens against an authoritative kitchen recipe/allergen matrix before service**. No automatic conversion of ambiguous entries should be relied upon for food safety.

## Storage/printing
Browser-local design settings, menu choices, logos and venues remain local. JSON backup/restore is available. Some HTML/CDN dependencies require internet access. Test browser printing before service.
