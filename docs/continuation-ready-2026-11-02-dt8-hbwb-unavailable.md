# NEW CHAT — CONTINUATION READY
## Dalla Terra HYDRO-BLOK Master Campaign V2
**Checkpoint:** November 2, 2026 (America/Toronto) · **Source of truth:** [Master Campaign V2 release/QA gates](campaign-offer-release-gates-2026-11-01.md) and [open held-variant issue #3](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/issues/3).

### Protected scope / rules
- Odoo `dalla-terra.odoo.com`; **Dalla Terra company 8, website 1** at `dallaterra.ca`.
- **No company 2 / Showroom Flooring edits**, no release of its separately gated Shower Studio, no shared-product archival, SKU or pricing changes.
- **No emails** (supplier/customer/internal/test/campaign), no orders, bookings, form submissions, marketing launch or new paid services.
- Company 8 dealer pricing, portal, freight and security remain protected. Use connected read-only/guarded writes, exact rollback/readback, and regression evidence. Do not overclaim 100% coverage; continue autonomously when no actual human input needed.

### Product-owner decision — RESOLVED
User explicitly confirmed **HBWB2548112** (variant **10972**, 25x48 × 1½-inch wallboard) **MUST REMAIN UNAVAILABLE because Dalla Terra's supplier does not stock it**. No MSRP may be inferred from its historical `list_price=65.76` or other SKU's pricing. **Do not offer new company8 orders/quotes/portal requests** of this variant; preserve historic data and shared company2 variant. This closes the original business-decision blocker, not the unimplemented backend enforcement.

### Latest independently verified LIVE configuration
- Product `ir.ui.view 7920` (parent 3256) **active**, **346,911 UTF-16 units / FNV32 `0799e4fe`**. Exact held wallboard direct link `/shop/hydroblok-wallboard-and-panels-6604?attribute_values=346%2C305`, reversed and combined variants: no native order form or hidden `product_id`, no MSRP panel or held SKU price row, friendly unavailable note and links to available sizes. Normal family variants retain forms and pricing. [Exact prior rollback `79bc40de`](../qa-baselines/odoo-view-7920-before-confirmed-unavailable-copy-2026-11-02-fnv-79bc40de.xml), [exact staged/installed `0799e4fe`](../qa-staged/odoo-view-7920-wallboard-10972-confirmed-unavailable-copy-v1.xml). Earlier pre-first-protection rollback `a2089897` also archived.
- Category/search `ir.ui.view 7936` (parent 3228) **active**, **87,118 UTF-16 units / FNV32 `0e9614d8`**. Public exact SKU searches (upper and lowercase) render an explicit supplier-unavailable notice and link to other wallboard options, with a scoped CSS price-display suppression for this search only. Standard product card MSRP **still exists in raw HTML** as the *different* default variant; do not call it a priced held SKU or claim DOM data-level removal. No forced redirect. Other SKU/category searches unaffected. [Exact prior rollback `842ec192`](../qa-baselines/odoo-view-7936-before-unstocked-sku-search-note-2026-11-02-fnv-842ec192.xml), [exact staged/installed `0e9614d8`](../qa-staged/odoo-view-7936-supplier-unavailable-wallboard-search-v1.xml).
- **No global product, company2, website2, order, price, PO, automation or freight write** occurred.

### Verified QA (after latest production changes)
- Public **Chromium 41/41 PASS**, [workflow run 41384791570, latest job 125332730618](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41384791570).
- Public **WebKit 41/41 PASS**, [workflow run 41384803666, latest job 125332824555](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41384803666).
- Authenticated **Chromium PASS + WebKit PASS** on authorized test account, strictly nontransactional [run 41384812621, job 125334615059](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41384812621). This does NOT attempt an actual held-SKU order and therefore does NOT verify write-time refusal.
- Post-product-view update all **22/22 HYDRO-BLOK product-family public GETs** returned valid HTML with native forms and canonical pages; direct held URLs suppressed. After view 7936 update, exact-SKU, lowercase, other SKU, generic search and category GETs returned valid HTML. A targeted visual agent reported unavailable messages; its claim that normal search card price DOM was absent contradicts raw HTML, so **computed-price DOM absence is NOT accepted** as evidence.
- Historical 12/12 supplier-code fixture passed in these old-SHA GitHub reruns. The newer strict 20/20 offline vendor-code model passed in a prior local replay, **not newly executed in those workflow attempts**. Do not confuse them.

### Staged, NOT EXECUTED, manual-only QA
- [SSR product availability and browser UI fixture](../tests/held-wallboard-ssr-smoke.js): GET-only 390/1280, checks friendly notice, generic warning visibility, no MSRP/held row, normal controls, 25x48 picker hide.
- [Exact unstocked SKU search browser fixture](../tests/unstocked-wallboard-search-readonly.js): GET-only 390/1280 Chromium/WebKit, checks notice, price computed display, normal-SKU control.
- [Manual-only workflow](../.github/workflows/held-wallboard-manual-guard.yml): `workflow_dispatch` only, includes old full hold/image tests and strict vendor-code replay; **not dispatched**, no falsely claimed result. Do not enable push/schedule or send emails.

### Main unresolved technical safety gate
**GitHub issue #3 REMAINS OPEN**: Webpage suppression **does NOT equal** a backend order-line/cart/API refusal. User product decision now settled; Dalla Terra Odoo technical owner must implement a **new company8 order-line rejection for product 10972 across website/dealer/back office/API/import**, including draft edit and confirmation, with negative tests/rollback. Preserve historic documents and company2; no global `product.product` edits. Connected writes cannot safely create/bind such a rule; do NOT repurpose unrelated automations. Odoo v19 Studio automated action/UserError may be an option but needs trigger/transaction timing and fee review; Odoo Online does not support custom modules. See [implementation acceptance criteria](dt8-hbwb2548112-backend-order-hold-acceptance-2026-11-02.md).

### Seven-milestone roadmap (keep original strategy)
1. Dealer offer/positioning **DONE**
2. Website product/dealer journey **DONE**, new held SKU website safeguards accepted within tested scope
3. New Shower Studio integration **SEPARATE HOLD / no cutover**
4. Dealer toolkit reviewed; illustration rights and distribution **HOLD**; five email drafts remain **UNSENT**
5. Targeted SEO three pages **ACCEPTED**; proper Dalla Terra GSC property and actual indexing measurements **HOLD**
6. Public 41/41×2 + authorized dealer GET-only regressions **PASS** within documented coverage; backend rejection, actual dealer pilot, positive image-rights and physical iPhone **HOLD**
7. Campaign launch/optimization **NOT APPROVED**

### Next actions & owners
**Assistant:** re-read exact current view hashes before any future edit; maintain no-email/browser/regression safety; continue nonblocked asset, SEO and dealer toolkit evidence checks; no routine permission requests. **Dalla Terra Odoo backend/order-flow technical owner:** implement and validate safe company8 all-channel SKU 10972 order rejection (no unrelated global actions), return implementation evidence. **Marketing asset owner:** licence/own photos/illustrations and validate before/after sequence. **SEO property administrator:** verify `dallaterra.ca` Search Console access and sitemap/index. **Separate physical-iPhone / Studio owners:** independent acceptance. **User action right now: NONE** — the supplier non-stock decision is already confirmed.
