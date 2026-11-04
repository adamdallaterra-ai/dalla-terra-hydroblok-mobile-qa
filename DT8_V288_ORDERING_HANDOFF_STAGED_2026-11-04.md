# Dalla Terra HYDRO-BLOK Shower Studio V288 — Quotation Handoff Stage

Checkpoint: November 4, 2026. **Not a production release.** Dalla Terra company 8 / website 1 only.

## Installed in preview
- QWeb view 8221, website.page 83, /hydroblok-planner-v3-preview?layout_lab=1.
- Existing generic Showroom `b2b_ghost_cart` and redirect to /shower-calculator removed from inherited native handler.
- Authenticated-only "Review Quote & Calculate Freight" control, gated on V259 independent audit of native V5 BOM quantities/3D panel geometry, V5 export company_id=8/website_id=1, and no unresolved custom/curbless accessories.
- Actual `currentBom` quantity comparison against audited export; direct product validation against company8/website1-rendered `#sf_hb_catalog_reference`, positive product ID, positive dealer unit price, integer quantities.
- Existing enquiry cart key `b2b_ghost_cart_dt8_user_<user.id>`; existing line schema; merge by product ID and preserve other basket lines; route /website/action/1771.
- Unquantified mandatory joint sealant excluded **with explicit confirmation**, not silently added; it must be checked by installer. No automatic quote action on a design failing the manufacturer audit.
- Guest MSRP browsing with no live order button; public legacy quote CTA hidden. Existing PDF and saved design engines untouched.
- No real orders or backend order writes. No changes to Showroom company 2/website 2.

## Confirmed technical readback
- Odoo 8221 retains V288 marker and source code, 2,059,684-char normalized QWeb. Preserves `hydroblok_wizard`, `add_to_quote_btn`, `print_pdf_btn`, `section.s_text_block`.
- Production QWeb view 7891 remains ORIGINAL (161,999 chars), its current handoff functional, and inherited CRM extension view 8080 unchanged (20,763 chars).
- Source XML backup already exists: https://docs.google.com/document/d/1IgVqUG5oVHseZgv67xiPno5Vo6eug8dkyDV19_B89P0/edit.
- Pricing previous acceptance Chromium/WebKit: https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41906025125.

## Tests and release gate
- GitHub focused test: `studio_v288_handoff_qa.js`; GitHub workflow `.github/workflows/studio-v288-handoff.yml`, no orders/no email/no scheduled Make.
- First workflow started: https://github.com/adamdallaterra-ai/dalla-terra-hydroblok-mobile-qa/actions/runs/41927261389. At checkpoint, **in progress installing Chromium/WebKit**; results NOT YET VERIFIED.
- QA may reveal additional preview failures. Do not claim operational handoff or release until actual guest/dealer, saved-design, PDF, standard factory-material, custom denial and cross-company tests pass.
- Current production replacement blocked pending passing verification **and compatibility with inherited CRM view 8080**.
- If QA fails, fix the specific blocker and rerun only the targeted check. Preserve production until safe.
- After focused verification, replace only company8 website1 production 7891 at /shower-calculator, preserving 8080 anchors and backup; verify public/dealer live readback.
- This record reports staged source implementation, not live functionality.

## Safeguards
Never modify Showroom 2/website 2 or V287 production 8127. Never submit a real order, send email or enable Make schedule/TinyFish/Work. Source prices: public MSRP x_studio_retailvariantunit; logged-in customer's assigned pricelist, NEVER standard_price. Existing prices verified, do not reopen without regression evidence.
