# Dalla Terra — supplier-unavailable wallboard backend acceptance
**Date:** November 2, 2026 · **Status:** Technical implementation / staging required — NOT INSTALLED · **Issue:** [#3](https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/issues/3)

## Decision and exact scope

Product owner confirms: **HBWB2548112, Odoo variant 10972**, 25 × 48-inch / 1½-inch-thick HYDRO-BLOK board, is **NOT AVAILABLE** because the Dalla Terra supplier does not stock it. This supersedes the earlier request for product equivalence/repricing review. **Do not sell, accept new order requests, quote an invented MSRP or switch the item to available in Dalla Terra company 8** without a new explicit, source-backed product decision.

Company **8** is Dalla Terra. Company **2** is Showroom Flooring; its orders, products, website, Studio, history and access must not change. Variant 10972 is shared/unassigned at the product company field, so **do not archive, unpublish globally, change `sale_ok`, edit default_code, or change global list_price** to enforce Dalla Terra-only exclusion.

## Independently verified, live public-site safeguards

- Product QWeb view **7920**, website 1/company 8, active, **346,911 UTF-16 units / FNV32 `0799e4fe`**. It suppresses the native product form for selected variant 10972, shows a customer-friendly unavailable notice and alternative-size link, hides the empty MSRP panel, and omits variant 10972 from the wallboard's hidden per-variant pricing data. Exact pre-copy backup: [FNV32 `79bc40de`](../qa-baselines/odoo-view-7920-before-confirmed-unavailable-copy-2026-11-02-fnv-79bc40de.xml); exact installed source: [staged copy](../qa-staged/odoo-view-7920-wallboard-10972-confirmed-unavailable-copy-v1.xml).
- Category/search QWeb view **7936**, active, **87,118 UTF-16 units / FNV32 `0e9614d8`**. Exact search for `HBWB2548112` on the public Dalla Terra shop now shows a prominent unavailable warning, identifies the product family as other available panel sizes, and visually suppresses the default-family card MSRP **only for that search term**. It does not change product pricing or search index results. Exact prior backup: [FNV32 `842ec192`](../qa-baselines/odoo-view-7936-before-unstocked-sku-search-note-2026-11-02-fnv-842ec192.xml). Exact installed candidate: [staged copy](../qa-staged/odoo-view-7936-supplier-unavailable-wallboard-search-v1.xml).
- The original 22 HYDRO-BLOK product-family public URLs continued to return valid HTML and normal forms after view 7920 update. Search exact/upper/lower, other SKU, generic `Hydroblok` and category comparisons all returned valid HTML after view 7936 update. Existing public 41/41 Chromium and 41/41 WebKit suites had passed after view 7920's update; their final rerun after view 7936's update is separately recorded when complete.
- These are **frontend safeguards**, **NOT** backend or API sale.order.line validation.

## Required write-time policy

For any **new Dalla Terra company-8 commercial order/request/quote line** with `product_id=10972`, reject before committing. Cover all origin channels (website 1, authenticated dealer portal, back-office manual quote/order, quote upload, RPC/API and automated import) rather than relying solely on `website_id=1`. A manual Dalla Terra sales order is not a legitimate workaround for an unstocked item. On existing Dalla Terra draft orders, changing an order line to SKU 10972 or confirming a draft containing a historical pending 10972 line must also fail closed. A friendly user message should identify that Dalla Terra does not offer the item and direct the user to select an available wallboard size.

**No retroactive mutation:** historical confirmed/cancelled orders, purchase orders, stock moves, invoices and audit trails remain unchanged and readable. Never block unrelated Dalla Terra SKUs or Showroom company-2 transactions.

## Schema reviewed in connected Odoo v19

| Model | Confirmed fields |
|---|---|
| `sale.order.line` | `product_id` (many2one `product.product`), `order_id` (many2one `sale.order`), `company_id` (readonly related) |
| `sale.order` | `company_id`, `order_line`, `state`, `website_id` (readonly) |
| `product.product` | `company_id` (shared/unassigned on held variant), `active`, `sale_ok`, `is_published`, `x_studio_retailvariantunit` |

A **candidate predicate** for new lines is `order.company_id.id == 8 and line.product_id.id == 10972`. Test the company context both during line creation and at order confirmation; `website_id` may not be populated at all times, so it is **not a sufficiently reliable sole guard**.

Odoo v19 Studio's **On create / On create and edit** automation triggers and **Execute Code / UserError** exist, according to [official Odoo 19 documentation](https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html). However this is a **design option, not an installed rule or guarantee**. Trigger timing, persistence/rollback of exceptions, RPC and portal bypass, legacy edits, and model permissions must be validated in a controlled authorized environment before any production rule is created. Odoo Online does not support arbitrary custom modules ([official platform documentation](https://www.odoo.com/documentation/19.0/administration/odoo_online.html)); do not propose an incompatible module deployment. Odoo warns that custom-code maintenance may carry additional charges — **do not enroll in or install new paid services without approval**.

The current connector exposes reads, existing QWeb view updates and edits/toggles to *known* server actions/automations, but no safely scoped general create-and-bind `sale.order.line` validation operation. **Do not repurpose an unrelated automation or circumvent connector safety checks.** No new backend rule has been installed.

## Required validation matrix (nontransactional design review, then authorized staged negative writes)

1. **Company 8, site1 direct variant**: product URL / attributes `346,305` renders no purchase form, no held SKU MSRP or pricebox (already observed).
2. **Company 8, public exact-SKU search**: unavailable message shown, family card MSRP visually suppressed, other-size link works without forced redirect.
3. **Company 8, authenticated dealer**: exact held variant cannot enter a new quote, portal request, cart or sale.order.line. A safe test should attempt in an isolated authorized test environment, not on live customer orders.
4. **Company 8, internal/new line**: new back-office order line or API request for variant 10972 is rejected, no partial order record, no email or notification.
5. **Company 8, existing draft**: editing product to 10972 is rejected; confirming a draft with the held SKU fails; historical already-confirmed data remains intact.
6. **Company 2**: same product record or comparable approved variant and unrelated order flows are unchanged; no record written during QA.
7. **All other company-8 products**: ordinary variant/price/portal operations continue.
8. **Regression**: public Chromium and WebKit suites (all 22 HYDRO-BLOK families at 390px, supporting sizes 375/430/768), 390/1280 direct held URL, positive image loads and no console errors. Physical iPhone Safari and new Studio cutover remain separately gated.

Before any authorized backend write: record the exact automation/server-action code and trigger model, confirm the two-company impact, save an independently verified rollback baseline, test in staging, obtain connector write permissions for this specific action, deploy guarded, read back, run negative/positive test matrix, and restore rollback on failure. **No external email, no order, no booking.**

## Owners / release state

**Dalla Terra product decision owner:** COMPLETE — supplier does not stock item, remain unavailable. **Dalla Terra Odoo order-flow technical owner:** implement safe write-time enforcement; incomplete. **Assistant:** site-level safeguards and QA evidence; continue all nonblocked read-only/public regression work. **Marketing rights / SEO property / physical iPhone / Studio release owners:** their other campaign gates remain unchanged. **User input now:** none. **Full campaign Milestone 07:** NOT APPROVED.
