# Dalla Terra HYDRO-BLOK mobile QA

**Public website:** https://www.dallaterra.ca · **Odoo company:** 8 · **Website:** 1

This private repository runs **read-only, manual-only** browser tests on the public Dalla Terra HYDRO-BLOK catalogue. It does **not** log in, send forms, add to carts, create orders, submit payments, change product data, or access Showroom Flooring company 2.

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
- The authenticated workflow requires a **temporary GitHub Actions secret** named `DT_QA_TEST_PASSWORD_EPHEMERAL_NOV2026`. The password must be entered directly through GitHub's encrypted Actions Secret UI, **never committed to source code, provided in workflow-dispatch inputs, or printed in logs**. This secret has **not** been configured or tested by the assistant. After acceptance, delete the temporary repository secret and rotate the test password because it previously appeared in a screenshot.
- Once the user configures the encrypted secret, the assistant can trigger the workflow via on-demand Make scenario **6856567** and review its sanitized reports. No TinyFish is needed.

## Change controls

Only run when requested. Treat new failures as potential application issues but independently verify before modifying the production site. Never modify Showroom company 2 or the Showroom shower-studio QA repository in response to this project.

The original offline-validated v2 source pack is retained in the ChatGPT conversation. The deployed runner uses the same 22-family scope and a consolidated live-audit implementation; do not describe the deployed code as having passed offline fixtures unless those tests are separately executed.
