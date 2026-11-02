# Dalla Terra HYDRO-BLOK mobile QA

**Public website:** https://www.dallaterra.ca · **Odoo company:** 8 · **Website:** 1

**LATEST USER RULE — STRICT NO EMAILS:** Never send supplier/customer/internal/test/campaign mail or execute automatic notification actions for this HYDRO-BLOK project. Preserve existing unsent drafts; older approve/send suggestions are superseded. Only read-only/historical replay + manually invoked public/dealer QA are permitted. See the newest Master Campaign release gate for exact owners.

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


### CBS company-8 vendor-status source clarified (2026-11-01)
<!-- DT8_HB_CBS_VENDOR_STOCK_PROVENANCE_V1_20261101 -->

The two sealant SKUs **HBJSCART** (10274) and **HBJSSAUS** (10277) have verified Odoo stock-log records from **May 11** and **September 23, 2026**, linked through company-8 supplier **CBS** stock-check-origin purchase orders **PS27523** and **PS31009**. The latest PS31009 per-line response says **Available** but **reported vendor quantity = 0** with no ETA, while the product's undated latest-check fields remain unset. Current shelf stock, dispatch and Quick Ship claims **are not proven**. Public page 6608's targeted omission of unverified JSON-LD `InStock` remains correct; do not silently reintroduce that markup.

For screws-and-washers 100-pack, Dalla Terra **HBSCREWWASH100** variant 10294 and CBS's supplier product code match, as do historical company-8 vendor check lines. Official manufacturer website uses **HBSCREWWASHER100** for a 100ct combo. A third-party retailer also uses HBSCREWWASH100, so an alias is plausible but **not manufacturer/CBS-confirmed**. Maintain the existing SKU, products and prices until verified.

**Next responsible owner/action:** **Dalla Terra Order Desk / stock operations** obtains a fresh CBS check with explicit quantity, UoM/pack, warehouse/source, timestamp and ETA or unavailable; **Dalla Terra technical/product reviewer** confirms the manufacturer's exact 100-pack equivalent code and applicable manuals. **Assistant** keeps the existing release-gates document current, verifies evidence once available and uses the existing QA/regression tools for approved changes. **User: no action now; no emails, orders or test requests were sent.**

Full internal IDs, precise source links and rollout safeguards: [Master Campaign V2 release gates](docs/campaign-offer-release-gates-2026-11-01.md).

### Historical dealer workflow proof (not a V2 pilot) — Nov 1 checkpoint
<!-- DT8_HB_RETRO_PILOT_EVIDENCE_V1_20261101 -->

Existing Dalla Terra company-8 sale.order **SO74539** (Odoo ID 3076, state sale) and vendor stock-check **PS31009** (Odoo PO ID 3344, CBS) were linked through bounded **read-only** Odoo and Order Desk Zoho searches. September 23 messages verify portal request, CBS inquiry, vendor reply, customer availability update, and later order confirmation. The initial request-to-customer-update interval was about **63.5 minutes** in this single historical case, **not** a new service-level promise. Vendor lines reported *Available* while numeric supplier availability was 0/unset and no ETA given; keep this separate from positive confirmed stock. No new send/order or booking occurred during proofing.

The transaction preceded November 1 Master Campaign V2 guidance, so the **current guided first-project request/response pilot remains NOT ACCEPTED**. A narrow Order Desk subject search returned no post-November-1 acknowledgement in that exact subject set; it does not prove no other submissions occurred. Staff must pick **one legitimate newly authorized case** and approve the specific vendor/customer communication before running a supervised real-world acceptance test. Assistant owns proof/QA once authorized. Five campaign emails unsent, company 2 untouched, Studio held.

Full chronology, source IDs, safeguards and approval-owner actions: [Master Campaign V2 release gates](docs/campaign-offer-release-gates-2026-11-01.md). **User action now: none to complete the retrospective verification.**

### Approved pilot preparation, supplier-code guard and one UNSENT CBS draft — Nov 1
<!-- DT8_HB_PILOT_APPROVAL_EMAIL_TEMPLATE_GUARD_V1_20261101 -->

User approved advancing the supervised, legitimate dealer pilot. **No eligible current HYDRO-BLOK dealer project** was identified in scoped recent company-8 SO and CRM searches: only "test" and "Dalla Terra Testco" accounts had open recent HYDRO-BLOK draft orders. No fabricated dealer request, order, booking or customer email is permitted.

A direct check of the September 23 **outbound CBS stock-check email** exposed wrong vendor item codes for **HBJSSAUS** and **HBSAUSGUN**. Current product and PO-line vendor item code records are correct. Source of the historic issue is **Dalla Terra mail.template 19**, which still uses the first supplier row from a template's sellers (variant-unsafe). Current **server action 1559** provides a **variant-exact, read-after-verified correction inside its stock-check composer** and refuses incorrect renders; current webhook action **1781** also selects exact seller variant. Treat native/direct template-19 bypass as **unsafe** until a scoped source repair is accepted. No Odoo template mutation was attempted in this checkpoint.

One draft **HYDRO-BLOK | CBS stock and SKU verification** was created using existing Dalla Terra **Order Desk** draft-only Make scenario **6711557**, read back in Zoho Drafts and confirmed **NOT SENT**. It requests fresh supplier quantities, ETAs and exact 10 oz/20 oz, applicator and 100-pack SKU confirmations. No new automated scenario, customer data, campaign mail or supplier email was transmitted.

**Next owner:** **Dalla Terra Order Desk** must (a) identify a real, current eligible HYDRO-BLOK dealer case with proper account consent/owner and (b) specifically approve/send the exact CBS draft if appropriate. **Dalla Terra technical/Odoo owner** confirms/fixes the variant-unsound raw template path when a safe company-8 template-edit route is available. **Assistant** then verifies any current case/response using existing Odoo/Zoho and manual Chromium/WebKit QA, no fake order or repeat broad audit. User's general pilot approval is recorded; it does not substitute for exact recipient/message release authorization. Five original campaign emails unsent; Studio and company 2 protected.

Full source IDs, approval boundaries and rollback/QA evidence: [Master Campaign V2 release gates](docs/campaign-offer-release-gates-2026-11-01.md).

## LATEST OVERRIDE — NO EMAILS, including tests and pilot communications
<!-- DT8_HB_ZERO_EMAIL_TEST_RULE_V1_20261101 -->

**Explicit user instruction (Nov 1 checkpoint): DO NOT SEND ANY EMAILS.** No CBS/vendor, customer/dealer, internal/test, campaign, automated or scheduled email. Do not initiate portal/order actions that generate mail. The previously saved CBS inquiry draft must **remain unsent and unused**; all five campaign drafts stay preserved and unsent. Any older action suggesting "approve/send" is **superseded**. No email or request/send approval is needed to proceed with authorized offline work.

**Current replacement pilot QA (no emails, no customer/order writes):**
- Read-only historical company-8 SO74539 / PS31009 linked request, vendor response and SKU lines.
- Company-8 Odoo CBS supplierinfo source codes independently checked for five variants (10274/10277/10284/10184/10294).
- Existing repo `tests/vendor-sku-routing-no-email.test.js` replays the historical incorrect first-seller behavior, validates exact variant matches and row-order/vendor isolation, and fails closed for missing/ambiguous codes. It has no network, email, Odoo or transaction APIs.
- Existing manual-only Chromium and WebKit GitHub workflows run this `node:test` replay **before** their read-only 41-case public mobile suite. No new automation, sender or external system.
- Existing signed-in Chromium/WebKit dealer browser checks are safe GET-only for cart/checkout (login only); none submit a request or order. Prior PASS remains evidence, not acceptance of a new commercial response pilot.
- Raw Odoo mail.template **19** remains known variant-unsafe if bypassed; server action **1559** includes the existing exact-variant composer/readback guard. The offline replay alone **is not** a server-side template correction or an actual no-email Odoo QWeb render. No raw template send or manual external reply allowed.

**Latest verification:** manually dispatched [Chromium run 41381257354](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41381257354) and [WebKit run 41381263680](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41381263680) both concluded **success** with **12/12 offline CBS code tests + 41/41 public mobile checks EACH**. The old wrong-first-seller choice was reproduced; the candidate exact-variant rule passed its offline checks. These are fixture/browser results, **not proof mail.template 19 was changed or server-rendered without email**. The **real dealer request/response pilot and physical iPhone Safari are separate, unaccepted gates**.

**Next action owner: assistant**, not the user — continue offline manufacturer/toolkit evidence and a narrowly scoped *offline-only* template-19 patch candidate/rollback review; do not send mail or submit a portal request. Technical/product owner internally reviews the existing CBS code evidence. All five campaign drafts and the saved CBS draft remain **UNSENT**; no company-2/Studio or production Odoo changes. **User action now: NONE.**

### Latest no-email PK/guest/dealer QA checkpoint (Nov 1 Toronto)
<!-- DT8_HB_M04_PK_QA_SIGNEDIN_V1_20261101 -->

Public Chromium [run 41382752342](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41382752342) and WebKit [run 41382761848](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41382761848) each **PASS 12/12 CBS code replay + 41/41 mobile checks** after adding a guest-only PK privacy guard. The signed-in GET-only [diagnostic run 41383201011](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41383201011) **PASS Chromium and WebKit**, verifying 15/30/45/60 PK duration options and default, date/time/zone controls, no-booking caveat and cart/checkout HTTP200 without order/request submissions. The diagnostic blocks any Odoo server-action request and captures only /mail/data status and page path. Both engines returned /mail/data HTTP200. **Intermittent WebKit WARNING:** earlier two attempts [run 41382563487](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41382563487) had one /mail/data access-control JavaScript error; it has **not been proven permanently resolved**, and there were **no portal/ACL production changes**. Never suppress it to pass QA.

Original internal PDFs and five campaign email drafts remain untouched; strict **NO EMAILS** continues. Master Campaign source-specific manual, alias and licensing approvals remain open, as do real dealer-response pilot and physical iPhone Safari. **Milestone T01 baseline VERIFIED:** company-8 fixed 22-family accepted-order `sale.order.line` data dated 2025-11-01 00:00 UTC to 2026-11-01 00:00 UTC: **47 product lines, 9 unique accepted SOs, 3 unique commercial purchasing partners and CAD 62,324.52 pretax line value**, across 7 families. Historic prior observed window: 57 lines, 11 accepted SOs, 3 partners, CAD 69,326.27. Every one of 20 distinct SO references was independently reconciled; currency CAD; 0 unmatched; result independently replicated by family and the on-demand Make lookup restored exactly. **Not invoiced revenue, not after-freight margin, not certified first-ever customer attribution.** Read the authoritative campaign gates for full date/filter definitions, family mix and eligibility caveats. Assistant owns only milestone-based future comparisons, not a new dashboard or scheduled job. **User action now: NONE.**
