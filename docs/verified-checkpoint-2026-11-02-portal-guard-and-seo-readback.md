# Dalla Terra HYDRO-BLOK Master Campaign V2 — verified portal/backend/SEO checkpoint
**Date:** November 2, 2026 (America/Toronto)  
**Scope:** Dalla Terra company **8**, website **1** only. **No production writes in this verification pass.**  
**Previous continuation:** [confirmed-unavailable checkpoint](continuation-ready-2026-11-02-dt8-hbwb-unavailable.md)  
**Master gates:** [campaign offer/release record](campaign-offer-release-gates-2026-11-01.md)  
**Backend blocker:** [issue #3](../issues/3) · [acceptance specification](dt8-hbwb2548112-backend-order-hold-acceptance-2026-11-02.md)

## A. Independently verified live Odoo source
Fresh connected read-only `ir.ui.view` results, rehashed over **UTF-16 code units using FNV32**, exactly match the recorded baseline:

| View | Active | Inherits | Length | FNV32 | Interpretation |
|---|---|---:|---:|---|---|
| Product 7920 | Yes | 3256 | 346,911 | `0799e4fe` | Exact current live source matches; no product-view update warranted |
| Category/search 7936 | Yes | 3228 | 87,118 | `0e9614d8` | Exact current live source matches; no category-view update warranted |

Current sources retain existing company8 HYDRO-BLOK family presentation and held-variant/search markers. Product decision is settled: **HBWB2548112** / product variant **10972** / template **6604**, size 25 × 48 inches × 1½ inches, is **unavailable because the Dalla Terra supplier does not stock it**. Do not infer MSRP, globally archive the shared record, alter company2, send messages, submit orders or modify pricing.

## B. Important new source finding: EXISTING portal quote-builder check
Read-only source inspection of live `ir.ui.view 7899` (`website.b2b_quote_review`) identified its request-submission path: an authenticated browser POST to `/web/dataset/call_kw/ir.actions.server/run`, running **server action 1768**. This route was **inspected, never invoked**.

Fresh read-only server action **1768 — B2B Headless Cart Builder** (`sale.order` model, `state=code`, source 32,444 code characters) shows:

1. Inside **`if website.id == 1 and company_id == 8:`**, the action loops over submitted `ghost_cart` lines and parses each `dt_product_id`.
2. Exact existing check:
   ```python
   if dt_product_id == 10972:
       raise UserError('This legacy HYDRO-BLOK wallboard is unavailable for online requests while supplier status is unconfirmed. Please contact Dalla Terra.')
   ```
3. The check is **before** the action's `sale.order.create(so_vals)`, `sale.order.line.create(line_vals)`, and subsequent mail calls. This is a **coded portal-quote/request preflight hold**, not simply CSS suppression.
4. The message **“supplier status is unconfirmed” is stale** following the owner's confirmed non-stock decision. Correct it only during a tested, reversible update; **no action-1768 write was made**.
5. **No actual negative request was submitted**; its runtime behavior is unverified. The action has later code paths that can send email (`send_mail(..., force_send=True)`); **do not execute action 1768 in live QA** under the strict no-email/no-order rule.
6. This safeguard is specific to a particular website quote-builder route and **does not establish** a model-wide `sale.order.line` creation/edit block, backend quotation form, API/import, other cart endpoints, or sale-order confirmation enforcement.

**Correct issue classification:** Existing *portal quote-builder code-level guard = SOURCE-VERIFIED, RUNTIME-UNTESTED*. New *all-channel model/backend rule = NOT INSTALLED / NOT ACCEPTED*. GitHub issue #3 **remains OPEN**.

## C. Fresh public read-only checks and SEO
November 2 uncached public page GET inspections (via Firecrawl; **no form, POST, authentication or sale action**):

- Held direct URL `/shop/hydroblok-wallboard-and-panels-6604?attribute_values=346%2C305`: HTTP **200**; actual source includes supplier-unavailable copy, normal Odoo invalid-combination state, and **no native held-product form/held product_id 10972 hidden input or held product MSRP panel**. A browser accessibility/visual check at **1920px** independently observed the visible explanatory heading, absence of purchase form/MSRP, and alternative-size links. It **could not resize to 390px**.
- Exact search `/shop?search=HBWB2548112`: HTTP **200**, dedicated unavailable search notice in source. Valid SKU control `/shop?search=HBWB366014`: HTTP **200**, no unavailable-SKU notice, ordinary source product card price retained. **Price for the normal family can remain in raw exact-search HTML while CSS hides that card price on the exact held search; this is not a database-level SKU price removal.**
- A separate **390px mobile-emulated screenshot request** obtained HTTP 200 HTML and screenshot outputs for held product and exact search. These **do not constitute independent Playwright Chromium/WebKit computed-CSS acceptance**, and were not asserted as such. The manual-only strict fixtures `tests/held-wallboard-ssr-smoke.js` and `tests/unstocked-wallboard-search-readonly.js` remain committed but **not independently executed by GitHub Actions**.
- `robots.txt`: HTTP **200**, explicitly references **`https://www.dallaterra.ca/sitemap.xml`**, without a blanket crawl disallow.
- `sitemap.xml`: HTTP **200**, **142 `<loc>` entries**; all **22 existing HYDRO-BLOK product-family URLs** plus the **HYDRO-BLOK category hub** appear.
- The hub `/shop/category/hydroblok-1` and three essential families **sealant 6608, fasteners 6610, curbs 6605**: all HTTP **200**, expected accepted HTML titles/descriptions, **self-canonical** URLs, and no robots noindex meta on inspected sources. No new SEO production changes were necessary.
- **Actual Google indexing/performance remains UNKNOWN**, not proven by sitemap availability. Correct **Dalla Terra** GSC-property access is still a separate owner dependency.

## D. Evidence for historical automated regression results
Github Actions readback rechecked the **successful** job conclusions (no redundant rerun):
- [Public Chromium run 41384791570](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41384791570) — completed/success; prior detailed evidence: **41/41** public cases.
- [Public WebKit run 41384803666](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41384803666) — completed/success; prior detailed evidence: **41/41** public cases.
- [Authenticated Chromium + WebKit run 41384812621](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41384812621) — completed/success; prior detailed evidence covers nontransactional signed-in cases.

Those are the **previous completed runs**, not a newly launched full suite. No backend order-negative acceptance, physical iPhone Safari acceptance, new Studio cutover or newly dispatched strict manual workflow is asserted.

## E. Backend enforcement design — CANDIDATE ONLY, NOT DEPLOYED
Odoo 19 official guidance supports Studio **On create / On create and edit** triggers and **Execute Code** with `UserError` ([Odoo automation rules](https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html)). Official platform guidance says **Odoo Online is incompatible with arbitrary custom modules** ([Odoo Online](https://www.odoo.com/documentation/19.0/administration/odoo_online.html)). Odoo also warns that custom code maintenance can carry additional charges; do not subscribe/install without approval.

Connected Odoo schema readback:
- `sale.order.line.product_id` and `sale.order.line.order_id` are many2one; `sale.order.line.company_id` is stored related/readonly.
- `sale.order.company_id`, `order_line`, `state`, `website_id` are present; `website_id` is readonly and may be unset in back-office transactions.
- `base.automation` exposes `model_id`, `trigger`, `trigger_field_ids`, `filter_domain`, `action_server_ids`; `ir.actions.server` exposes `base_automation_id`, `model_id`, `state`, `code`. **This is model-schema evidence, not permission to create/install.**

**Proposed primary invariant:** any newly created or edited `sale.order.line` selecting `product_id=10972` in an order with `company_id=8` must fail **before transaction commit** with friendly supplier-unavailable feedback. Candidate independent, new `sale.order.line` Studio automation, triggered on create/edit of `product_id`; guard by the related order company, **not solely website_id**. Validate that create and field-specific edit triggers execute for every requested entrypoint and do not fire on unrelated edits to historic confirmed records.

**Proposed confirmation safety net:** a **separate** new `sale.order` transition guard, triggered on `state` create/edit or appropriate confirmed server transition, should reject company8 confirmation when any pending order line uses variant 10972. Verify *actual* `action_confirm()` timing and transaction rollback, including possible side effects; do not assume that an automation exception automatically reverses every downstream effect.

**Do not deploy as a finished fix without:** Odoo Online-compatible instance/plan review and any custom-code-cost approval; access to a dedicated test duplicate with outgoing emails/payments/carriers disabled; ability to create/bind two genuinely scoped rules through authorized tool/API; exact before/after snapshots; tested cart/portal/manual/RPC/import/create/edit/confirmation denial; unrelated company8 positive controls; company2/shared-product negative control; historic order preservation; independently verified production readback and rollback. Current connected controlled-write tools do **not** expose a suitable safe create-and-bind operation. **Never repurpose unrelated actions or bypass connector restrictions.**

## F. Seven-milestone state after this pass

| Milestone | Verified state |
|---|---|
| 01 Dealer positioning/two paths | COMPLETE |
| 02 Product/dealer journey | COMPLETE within previously accepted scope; held wallboard site copy readback remains consistent |
| 03 New Shower Studio integration | SEPARATE RELEASE HOLD |
| 04 Dealer enablement/toolkit | Existing drafts and page-specific errata retained; **image/manual rights and distribution HOLD; five email drafts UNSENT** |
| 05 Targeted SEO | Three essential metadata pages accepted; sitemap/canonical/robots **verified**; actual Google indexing **UNVERIFIED** |
| 06 Regression/acceptance | Prior 41/41 × 2 and signed-in runs verified successful; portal action 1768 guard **source-only**; model-wide denial, physical iPhone, live pilot **OPEN** |
| 07 Campaign launch/optimization | **NOT APPROVED** |

## G. Owners and next actions
1. **Assistant:** maintain this verified status, leave current matching QWeb views unchanged, and continue only narrowly scoped read-only source/asset/SEO preparation. Do not repeat full passed regression suites without a relevant change or failure.
2. **Dalla Terra Odoo order-flow technical owner:** design/install **new** model-level, company8-only line/create/edit and confirmation guards in an authorized safe test environment; demonstrate the full negative/positive matrix and rollback, then request permitted production deployment. Align existing 1768 stale error copy in the same controlled/fully tested order-flow release.
3. **Dalla Terra marketing/asset owner:** provide explicit commercial usage rights and genuine before/after provenance; no unlicensed distribution.
4. **Technical/product reviewer:** resolve `HBSCREWWASH100` vs `HBSCREWWASHER100` equivalence and assembly/warranty-specific claims using source documentation/labelled packaging. No speculative SKU changes.
5. **Dalla Terra Search Console property administrator:** supply verified access to the correct `dallaterra.ca` property for URL inspection and indexing measurement; no inference from the Showroom property.
6. **Dealer operations / physical iPhone / separate Studio owners:** separately accept a true non-email first-project request/response pilot, native Safari, and the new Studio cutover, respectively.

**Immediate user action: NONE.** **No Odoo write, no email, no actual order, no booking, no new paid service, and no company2 change occurred in this pass.** All independently verified results are source/read-only checks unless explicitly marked prior CI evidence.
