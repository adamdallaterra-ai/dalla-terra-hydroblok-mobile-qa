# Dalla Terra HYDRO-BLOK mobile QA

**Public website:** https://www.dallaterra.ca · **Odoo company:** 8 · **Website:** 1

This private repository runs **read-only, manual-only** browser tests on the public Dalla Terra HYDRO-BLOK catalogue. It does **not** log in, send forms, add to carts, create orders, submit payments, change product data, or access Showroom Flooring company 2.

## Run a live mobile audit

Open **Actions → Dalla Terra HYDRO-BLOK mobile audit → Run workflow**, select branch `main`, and keep the default widths `375,390,430,768` and all-390 catalogue coverage. No schedules, push triggers, subscriptions, or polling.

The workflow installs Chromium and visits the live site from GitHub's internet-connected runner. It saves `qa-output/report.md`, `results.json`, and full-page **before/after** screenshots as a downloadable workflow artifact for 14 days. Any `REVIEW` or `ERROR` result makes the workflow fail, even when later checks continue.

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

## Change controls

Only run when requested. Treat new failures as potential application issues but independently verify before modifying the production site. Never modify Showroom company 2 or the Showroom shower-studio QA repository in response to this project.

The original offline-validated v2 source pack is retained in the ChatGPT conversation. The deployed runner uses the same 22-family scope and a consolidated live-audit implementation; do not describe the deployed code as having passed offline fixtures unless those tests are separately executed.
