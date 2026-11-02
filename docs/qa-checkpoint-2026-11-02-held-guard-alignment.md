# DT8 HYDRO-BLOK — held variant QA alignment checkpoint
**November 2, 2026 · Dalla Terra company 8 / website 1 only**

## What changed (GitHub source, NOT production Odoo)
1. Updated `tests/held-wallboard-public-readonly.js` to test the now-installed frontend supplier-unavailable state correctly. The previous check incorrectly treated *absence* of the hidden `product_id` and native form as failure. It now requires no native form/product ID for SKU 10972, visible confirmed-unavailable message and alternative link, absent MSRP panel, suppressed obsolete generic warning, and normal product baseline with purchase form and price panel. Retains 390/1280 viewport and image checks. All non-GET requests remain aborted.
2. Updated `.github/workflows/held-wallboard-manual-guard.yml` description to distinguish **public frontend QA** from **backend sale-order enforcement still on HOLD**. `workflow_dispatch` remains the only trigger. No workflow run was dispatched.
3. Added `tests/backend-held-wallboard-policy-offline.test.js`, a pure offline proposed-policy matrix for company8 create/product-changing-edit and draft-to-sale confirmation, with company2 and unrelated-product isolation and historical-record preservation. **This is a design fixture only, not proof of native Odoo trigger execution or production guard installation.**

## Executed validation
- Verified the revised public test, existing SSR smoke, search visibility test and parser test source with Node `vm.Script` compilation via a read-only remote Node runner. **4/4 JavaScript syntax PASS**. This is syntax validation, not actual Playwright/browser acceptance.
- Re-fetched the updated test source and inspected the existing public category image tags in fresh public HTTP-200 HTML. All four expected filenames are present in rendered source; positive image-load `naturalWidth` is **not** established by source inclusion alone.
- New offline policy test source was committed and read back. Attempts to execute it did not return independent TAP/test-case results; a later runner attempt was rejected for the remote environment's concurrent-job limit. **Do not report the offline policy tests as passed.**
- The updated public browser suite was **not executed**: Playwright is not available in the local workspace and no manual GitHub workflow_dispatch capability was used. Prior 41/41 public Chromium and WebKit successes remain the prior documented runs, not a new acceptance of these test changes.
- **No Odoo write, live order, quote, API POST, mail, booking, marketing launch, product change, company2 modification, or paid service.**

## Existing live enforcement layers — precise classification
- Public website QWeb 7920 and 7936 are unchanged from the independently verified FNV32 baselines `0799e4fe` and `0e9614d8`; frontend held SKU protections are source-observed.
- The previously uncovered **server action 1768 B2B Headless Cart Builder** has a static company8/site1 `ghost_cart` preflight with `if dt_product_id == 10972: raise UserError(...)` before draft order creation. **Source-verified; negative runtime refusal NOT accepted.** The message says supplier nonstock status is unconfirmed and should be reworded in a properly controlled release. The server action contains later email-sending code; do not execute in production QA.
- **A company8-only, native all-channel `sale.order.line` create/edit and `sale.order` confirmation guard is NOT installed or tested.** Existing connected writes lack a safe create-and-bind operation. Do not repurpose unrelated automations or override safety restrictions. Issue #3 remains OPEN.

## Next actions and owners
- **Assistant:** verify public GET-only revised browser suite when a safe runner supports the existing Playwright manual workflow; record *observed* outcomes, not assumed green. If a failed check indicates frontend regression, diagnose from current snapshot before any production change.
- **Dalla Terra Odoo technical owner:** safely create and bind new company8-only model guards in an authorized isolated Odoo Online-compatible test environment with outgoing mail/orders/carriers disabled; validate line create/edit, quote import/RPC/cart, draft confirmation, company2 isolation, history preservation and rollback. Production deployment only after evidence and authorized write path. Do not reuse action1768 as universal protection.
- **Marketing asset rights and technical reviewers:** validate before/after imagery rights, manufacturer photo licence, fastener code equivalence, assembly/warranty specifications before external distribution.
- **SEO property admin:** supply correct Dalla Terra Search Console property; sitemap inclusion alone does not prove indexing.
- **User:** no immediate action required; no release authorization implied.
