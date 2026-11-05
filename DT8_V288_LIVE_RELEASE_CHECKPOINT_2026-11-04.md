# Dalla Terra HYDRO-BLOK Shower Studio V288 — LIVE Release

**Verified November 4, 2026.** Odoo Online `https://dalla-terra.odoo.com`, Dalla Terra company **8**, website **1**.

## Live deployment
- Canonical public page: **https://www.dallaterra.ca/shower-calculator**
- Production `website.page` **69**, QWeb `ir.ui.view` **7891**, `t-name="website.shower-calculator"`.
- Preview preserved: `/hydroblok-planner-v3-preview?layout_lab=1`, page83, QWeb8221.
- Main visual Studio, 3D-first, saved design, PDF, V287 guest MSRP / dealer pricelist integration retained.
- Replaced original Dalla Terra calculator in view7891 with scoped V288 Studio.
- Original *exact* pre-release production view7891 XML stored in GitHub `backups/DT8_QWEB_VIEW_7891_BEFORE_V288_2026-11-04.xml`, commit `4a4e7d65f145654fce5aa80ae9cdc1aaaeec279a`. Existing verified Google Docs backup also retained: https://docs.google.com/document/d/1IgVqUG5oVHseZgv67xiPno5Vo6eug8dkyDV19_B89P0/edit.

## Quote handoff, no new cart system
- The authenticated **Review Quote & Calculate Freight** control replaces inherited unsafe generic `b2b_ghost_cart` code; it uses `b2b_ghost_cart_dt8_user_<user.id>` and existing `/website/action/1771` journey.
- Guest MSRP browsing is allowed without a fake order/login button.
- Uses `window.sfHBV259WallReview.audit()` for native V5 authoritative BOM and exact 3D/2D panel/fastener reconciliations, not scraped provisional UI list.
- Validates company8/site1, published catalog product IDs, positive dealer price, eligible SKU, integer quantity and matching live BOM, safely merges existing quantities by product ID and does not erase unrelated quote basket lines.
- Stops custom/unverified material concepts, missing prices, unsupported product IDs and cross-company snapshots.
- A **preliminary quote** is *not* an approved order. Known required installation items **sealant quantity, modified thinset and supplied drain-cover/kit compatibility** are listed explicitly, require acknowledgment, and remain subject to installer/manufacturer review; none receive invented quantities/prices or secretly become products.
- Client-side local storage only until existing review journey; no sales orders, order submissions, email, or Make scheduling were executed by test.

## Focused acceptance evidence
- Previous V287 cross-engine pricing Chromium + WebKit: https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41906025125 (both passed; pricing remained unchanged).
- V288 preview Chromium 12/12 checks: https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41929190596
- V288 production Chromium 12/12: https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41929613645
- V288 production actual quote CTA click 13/13 (destination intercepted, ephemeral scoped browser-cart verified): https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41929859170
- No backend SO created and real /website/action/1771 destination deliberately intercepted during final browser click. End-to-end *submitting* a quotation/order was not tested because forbidden.
- Post-test cosmetic-only change corrected line-break escape sequences within the pending-material confirmation dialog in production and preview, with successful Odoo XML writes/readback; no material/price/validation logic changed.

## Protected and remaining
- Showroom company **2**, website **2**, Showroom V287 production QWeb **8127** untouched.
- Dalla Terra production CRM inherited QWeb **8080** remained unchanged; structural anchors (`#hydroblok_wizard`, `#add_to_quote_btn`, `#print_pdf_btn`, `section.s_text_block`) preserved. Public and dealer route rendering compiled with inheritance and passed automated browser checks. **An internal Showroom CRM-mode session was not exercised**; do not claim functional regression coverage of that separate authorized context.
- Production is live and browser accepted for tested public/dealer paths. Do not repeat completed pricing work without evidence.
- If rollback required, restore `backups/DT8_QWEB_VIEW_7891_BEFORE_V288_2026-11-04.xml` to view7891 only, preserving CRM view8080 and all company boundaries.

## Execution safeguards
Only company8 QWeb views 8221/7891 modified. No Showroom write, no cost exposure (`standard_price`), no email, real orders, recurring Make, Work, TinyFish or paid services.

## V289 targeted navigation correction — November 4, 2026
- User requested: when a drain choice is required, the Next/Continue control must be visibly greyed out and not clickable until the required selection exists.
- Installed only in Dalla Terra company 8 preview QWeb 8221 and production QWeb 7891. Both XML updates were followed by exact readback matches.
- Existing V282 disabled-button guard now also requires V135's explicit drain choice result; this avoids treating default native drain settings as a user selection. V133 floating Next is disabled/re-enabled in sync; CSS greys both disabled controls.
- The patch did **not** modify manufacturer BOM, dealer/MSRP prices, authenticated cart handoff, CRM inheritance anchors, or Showroom company 2.
- Focused Chromium browser assertions added to existing GitHub QA `studio_v288_handoff_qa.js` for initial grey/disabled and valid linear-drain unlock. Commits `8c5f9d25c4ba1146fc9373d4aab5da725dc60cd6`, `cce8477751321d455fbd0aa71c0ca36c5db70a89`. The workflow is configured for push, but its execution result was **not retrieved** in this turn; do not claim a passed interactive browser test. XML readbacks passed.
- No order, email, Make, or scheduled process triggered. Original V288 rollback evidence remains applicable; any rollback should preserve customer quote data.
