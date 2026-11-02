# Dalla Terra HYDRO-BLOK mobile QA

**Public website:** https://www.dallaterra.ca · **Odoo company:** 8 · **Website:** 1

This private repository runs **manual-only, non-transactional** browser QA for Dalla Terra HYDRO-BLOK. The public suites do not log in; the separate approved dealer suite signs in only as the temporary QA account and reads the existing cart/checkout screens **without editing, submitting an order or making a payment**. No suite modifies product data or accesses Showroom Flooring company 2.

## Run a live mobile audit

Open **Actions → Dalla Terra HYDRO-BLOK mobile audit → Run workflow**, select branch `main`, and keep the default widths `375,390,430,768` and all-390 catalogue coverage. No schedules, push triggers, subscriptions, or polling.

The workflow installs Chromium and visits the live site from GitHub's internet-connected runner. It saves `qa-output/report.md`, `results.json`, and full-page **before/after** screenshots as a downloadable workflow artifact for 14 days. Any `REVIEW` or `ERROR` result makes the workflow fail, even when later checks continue.

## Assistant-run on-demand workflow (no TinyFish)

Connected Make scenario **6856455** (`DT8 HYDRO-BLOK | On-demand GitHub mobile QA trigger (no schedule)`) dispatches the same `.github/workflows/mobile-audit.yml` workflow via the existing GitHub OAuth connection. It accepts no inputs, targets only this QA repository and branch `main`, and returns HTTP **204** when GitHub accepts the dispatch. Prefer this direct API route to asking the user to manually launch runs. The workflow itself is **manual-dispatch only**, not scheduled or push-triggered. After dispatch, use the connected GitHub tools to inspect the run and download the QA artifact.

## Company-specific description correction and regression

Odoo QWeb view **7920**, marker `DT8_HB_FAMILY_COPY_SITE1_ALL_VARIANTS_V2_20261101`, server-renders configuration-neutral description copy for exactly **17 multi-variant** Dalla Terra product families on website **1**, company **8**. Shared `product.template.website_description` fields and the Showroom Flooring site **2** are not modified; the original field renderer is preserved for all other websites and products.

The runner includes `EXPECTED_DESCRIPTIONS` and checks the **exact visible description text** for all 17 family pages in addition to viewport, price, guest-button, and interaction checks. The first verified post-correction run is [run #2](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41276065885), with **41/41 page/viewport checks passed**, **47 full-page screenshots**, and **zero reported page JavaScript errors**. These tests cover public Chromium mobile emulation, not authenticated dealer mobile checkout, physical iPhone Safari, or payment processing.

## Coverage

- 390 CSS px: all 22 HYDRO-BLOK product families plus the category page.
- 375, 430 and 768 CSS px: category, wallboards, standard-drain pans, invisible-drain pan extensions, niches and sealant.
- Confirms real Chromium viewport and media queries, checks document horizontal overflow, public SKU/MSRP, HTTP errors, missing price boxes, exposed guest ordering buttons and page-level JavaScript errors.
- Mobile tap checks: 1/2-inch wallboard, sausage sealant/20oz, Barrel Head niche, Thin Single Slope extension, Offset Drain pan, and 1/4-inch invisible-drain trim.
- Failures remain review items until traced to real application behavior; a screenshot-only pass does not certify every possible combination.

## Local run

```bash
npm install --no-audit --no-fund
npx playwright install chromium
npm run test:mobile
```

This is a remote-site smoke and responsive interaction regression suite, **not** iOS Safari, physical-device testing, signed-in dealer mobile checkout or an actual order placement test. Public mobile QA cannot sign off those separate gates.

## WebKit and authenticated acceptance (separate release gates)

- **Public WebKit mobile emulation** is available via `.github/workflows/webkit-audit.yml`, triggered directly on demand through Make scenario **6856534**. It uses Playwright WebKit on Linux (Safari engine), **not physical iPhone Safari**. [Live run #3](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41278146019) passed **41/41** viewport/page checks, including six mobile variant taps and 17 family-description assertions, with zero JavaScript errors. Early false positives arose from automated navigation interrupting a lazy recently-viewed RPC; a controlled cross-engine timing diagnostic isolated the cause, and only the **QA runner dwell time** was changed. [QA issue #2](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/issues/2) is closed; no Odoo production fix was required.
- **Signed-in dealer checkout mobile QA** is prepared at `.github/workflows/dealer-mobile-readonly.yml` using `dealer_mobile_qa.js`. It tests the authorized test account at 390px in **Chromium and WebKit**; it checks assigned account prices, public MSRP, variant taps, guest/dealer controls, and GET-only cart/address/extra-info navigation. It NEVER adds lines to cart, edits addresses, confirms an order, or submits payment. No screenshots of private checkout data are saved.
- The authenticated workflow uses a **temporary GitHub Actions secret** named `DT_QA_TEST_PASSWORD_EPHEMERAL_NOV2026`. The November 1 authenticated run succeeded using the configured secret; the secret value was not written to source or printed in the reports. After acceptance, the responsible credential owner must delete that temporary Actions secret and rotate the test password because it previously appeared in a screenshot. Never commit or expose it.
- The assistant can trigger the already-approved on-demand workflow through existing Make scenario **6856567** and inspect sanitized reports. Do not request new credentials or use TinyFish for the same test unless direct tools genuinely cannot perform the required check. A future run still requires a valid secret; a successful past run is not proof the credential remains valid after rotation.

## Authenticated mobile acceptance — verified (2026-11-01)

**[Signed-in mobile run #2](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41309265075) — SUCCESS.** The downloaded GitHub artifact was inspected and verified (ZIP integrity OK, `results.json` and `report.md` only; no screenshots or credentials). Test account: `test@dallaterra.ca`. Both Playwright **Chromium and WebKit at 390×844 CSS px** passed, with no page JavaScript errors or horizontal overflow.

- Dealer prices and MSRP verified for HYDRO-BLOK sealant cartridge (`HBJSCART`: $11.24 / $20.43 MSRP) and sausage (`HBJSSAUS`: $19.92 / $36.22 MSRP), including the one-tap 10oz→20oz dependency.
- Wallboards verified (`HBWB366014`: $36.17 / $65.76 MSRP; `HBWB366012`: $41.09 / $74.70 MSRP) with thickness-option tap.
- Dealer ordering CTA present on the tested product configurations.
- Existing four-line test cart accessible (HTTP 200), and prior subtotal **$273.82**, taxes **$32.87**, and total **$306.69** remained visible before/after checkout navigation in both engines.
- Checkout Address and Extra Info GET screens loaded (HTTP 200), width 390, no horizontal overflow; existing cart values preserved.
- **No products added or removed, no address saved, no order confirmation, no payment, and no customer-private screenshots.**
- This is **emulated mobile** Chromium/WebKit, not a physical iPhone or native iOS Safari, and does not test final purchase/payment submission.

**Required credential cleanup:** After acceptance, delete the repository Actions secret `DT_QA_TEST_PASSWORD_EPHEMERAL_NOV2026` and rotate the test-account password, which appeared in an earlier screenshot. The connected tools cannot safely manage the GitHub Actions secret deletion; user must perform it in GitHub Settings → Secrets and variables → Actions. Do not place the password in code, reports or chat.

## Change controls

Run on demand during an approved change or regression checkpoint **without requiring another user 'Proceed'**; never schedule or auto-send. Treat new failures as potential application issues, and independently reproduce before any production modification. The assistant owns the next executable, in-scope task unless a specifically named human owner must approve a commercial release, email, customer-facing submission, credential or physical-device action. At each checkpoint state **Completed and verified / Assistant's next action / Other owner's later action / User action now**. Never modify Showroom company 2 or its separate Shower Studio QA repository from this campaign. See [the controlling company-8 campaign gates](docs/campaign-offer-release-gates-2026-11-01.md).

The original offline-validated v2 source pack is retained in the ChatGPT conversation. The deployed runner uses the same 22-family scope and a consolidated live-audit implementation; do not describe the deployed code as having passed offline fixtures unless those tests are separately executed.

## Current post-SEO checkpoint (2026-11-01)

**Completed:** Dalla Terra company 8/website 1 product-6604 and product-6621 metadata update, exact QWeb 7920 readback, public SEO/canonical check, public Chromium [41/41](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41374558748), public WebKit [41/41](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41374565164), and authenticated Chromium + WebKit [PASS](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41374571050). No checkout/order submitted.

**Now owner: assistant** — continue manufacturer/asset and stock-schema source evidence and offline dealer-pilot readiness documented in the [current campaign release gates](docs/campaign-offer-release-gates-2026-11-01.md), without starting emails or modifying other systems.

**External owners at their gates:** Dalla Terra technical/product reviewer signs off product-specific instruction and warranty claims; Order Desk/commercial owner accepts any real dealer pilot; Dalla Terra website/GSC administrator grants correct Search Console property access; separate Studio owner accepts cutover; credential owner rotates/deletes the temporary QA secret. **User action for current assistant-led work: none.**

The documented availability/inventory discrepancy on company-8 sealant is an evidence issue, not permission to advertise stock or change Odoo stock/structured-data logic without a verified source-of-truth and narrow QA.


## Sealant availability assertion and regression guard — accepted (2026-11-01)
<!-- DT8_HB_SEALANT_SCHEMA_POST_RELEASE_V1_20261101 -->

A narrowly scoped, reversible company-8/website-1 correction to the **existing** product QWeb view **7920** now omits the **unverified** ProductGroup `InStock` assertion for **HBJSCART** and **HBJSSAUS** (family **6608**) without touching actual inventory, vendor snapshots, MSRP/dealer prices, order eligibility, checkout or other products. Corrected view read back at **343,638 characters** and passed eight public target/control URLs including selected sealant variant, original SEO families, unrelated tile and category hub. The manufacturer's stock source is still NOT proven, so do not advertise ready-stock or dispatch promises.

The existing public Chromium and WebKit suites now include `DT8_HB_SEALANT_JSONLD_AVAILABILITY_GUARD_V1_20261101` within their sealant cases. The [new Chromium run](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41377447885) and [new WebKit run](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41377460697) both independently passed **41/41**, with sealant asserted at **375/390/430/768**. The [separate signed-in dealer run](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41377145431) passed **Chromium + WebKit**, with **no order/payment/submission**.

**Next owner and exact action:** Dalla Terra stock/availability operations must confirm the vendor status source, timestamp and whether positive customer-facing stock claims can ever be authorized for these SKUs; the Dalla Terra technical/product reviewer must reconcile **HBSCREWWASH100** in the Dalla Terra catalogue against manufacturer's **HBSCREWWASHER100** in the linked **2026** brochure, and confirm reuse rights for imagery. The assistant owns subsequent source verification and any explicitly supported scoped correction using these same direct connectors and tests. No user action for this checkpoint, no emails, and no company-2 or new Studio edits. Full evidence and rollback are in the [authoritative campaign gates](docs/campaign-offer-release-gates-2026-11-01.md).

