# Dalla Terra HYDRO-BLOK Shower Studio — DT8 V287 Pricing Integration

Checkpoint: 2026-11-04. Scope: company 8 / website 1 only.

## Implemented, staged
- Preview Odoo website.page 83, QWeb ir.ui.view 8221; URL https://www.dallaterra.ca/hydroblok-planner-v3-preview?layout_lab=1.
- Ported Showroom V287 studio UI/geometry and changed company/website plan boundaries from 2/2 to 8/1.
- Source Odoo product.product records: active, saleable, published, Hydroblok category, SKU HB%, company_id False/8, website_id False/1.
- Guest public MSRP: x_studio_retailvariantunit. Authenticated price: request.env.user.partner_id.property_product_pricelist._get_product_price(product,1.0). Currency unit prices rounded to 2 decimals in browser.
- Missing prices flagged Price pending; totals labeled partial where necessary. No supplier standard_price used.
- Separate user-specific local storage for saved designs. No original Showroom designer change.
- Legacy client-side quote submission disabled on staged preview to prevent cross-website checkout.
- Odoo production Dalla Terra view 7891 / website.page 69 at /shower-calculator retained unchanged.

## Verified evidence
- Anonymous HTTP 200, Dalla Terra website ID 1, public MSRP wallboard HBWB366012 $74.70 and sealant HBJSCART $20.43.
- Guest chromium and WebKit mobile test passed: correct MSRP, pricing card rendered, correct company, no Showroom logo, no horizontal overflow.
- Signed-in test account via GitHub Actions: authorization/pricing mode correct, account id scoped. Raw Odoo assigned pricelist prices BEFORE currency rounding were $41.085 for HBWB366012 and $11.2365 for HBJSCART; storefront presented $41.09 and $11.24. Two-decimal rounding patch installed in preview 8221.
- Targeted retest initiated: manual-only workflow `.github/workflows/studio-v287-pricing.yml`, run https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41906025125 . **Do not assert dealer test PASS until report read.**
- Broader historical dealer QA returns unrelated pre-existing cart/CTA differences; isolate V287 price checks instead of reopening old workflows.

## Backups
- Exact original DT8 live 7891 and preview 8221 XML archived, verified restorable:
  https://docs.google.com/document/d/1IgVqUG5oVHseZgv67xiPno5Vo6eug8dkyDV19_B89P0/edit
- Showroom production 8127 V287 already active; do not touch company 2.
- Original Dalla Terra production QWeb unchanged.

## Remaining deliverables
1. Confirm targeted signed-in guest/dealer QA after rounding in Chromium and WebKit. If fails, fix precise cause without changing production.
2. Keep staged preview; if replacing live Dalla Terra production, preserve its functional order/quote flow. Preview currently intentionally disables cross-company legacy quote submission. Do not swap into production until the ordering path is ported and tested.
3. Review price depiction in generated PDF only if required for release; preserve existing installer disclaimer and fail-closed material status.
4. Publish Dalla Terra replacement to /shower-calculator only when end-to-end flow works and session-specific prices are confirmed.

Safeguards: company8/website1 only; no company2 changes; no emails; no purchase, cart, or sales order writes; on-demand QA only (no Make schedule).
