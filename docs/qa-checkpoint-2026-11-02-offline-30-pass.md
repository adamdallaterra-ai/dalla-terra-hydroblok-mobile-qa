# Dalla Terra HYDRO-BLOK V2 — reproducible offline-test checkpoint

**Date:** 2026-11-02 (America/Toronto)  
**Evidence category:** isolated static policy/unit checks, **not** Odoo staging, live order-rejection testing or Playwright acceptance.  
**Scope:** GitHub test sources only; no Odoo write, order, email, booking, user-session POST or company-2 modification.

## Original-source execution
On this checkpoint, the current default-branch GitHub test sources were fetched and executed in an isolated JavaScript V8 evaluation harness using synchronous `node:test` / strict assertion-compatible shims. This does **not** claim execution under the native Node.js test runner or GitHub Actions.

| Source file | Current source blob SHA | Cases executed | Passed | Failed |
|---|---|---:|---:|---:|
| `tests/backend-held-wallboard-policy-offline.test.js` | `5048681620471f6e390a210a5fa736c272307516` | 6 | 6 | 0 |
| `tests/held-wallboard-parser.test.js` | `f3c34bc05fbdf72f07fedc4fc1f64ffe290a4338` | 4 | 4 | 0 |
| `tests/vendor-sku-routing-no-email.test.js` | `e12840c28e46c63ee8db4cf131302241d7cc071d` | 20 | 20 | 0 |
| **Total** | | **30** | **30** | **0** |

The three sources were evaluated as written; the harness replaced test registration, assertion methods and the parser test's Node built-ins with synchronous compatible stubs. All 30 registered assertions ran; no network, live order, Odoo or email calls are present in the offline suite. These results establish the expected *mock policy behaviour and pure helper logic only*. They are not transaction-level production proof.

## Confirmed live source and remaining limits
A fresh connected **read-only** inspection of existing server action 1768 reconfirmed the website1/company8 portal quote-builder preflight on variant 10972, appearing before its sale-order/line creation calls and before the later mail-send path. This is source/ordering evidence only. The current user-facing error still describes supplier status as unconfirmed, although the product owner decision is final. **Do not run this action on production for a negative test** because its downstream paths can send emails.

The formerly stale held-wallboard public QA source and its manual-only workflow have already been corrected in prior commits. The revised Chromium/WebKit 390/1280 Playwright checks have **not yet run**. No GitHub Actions workflow-dispatch write operation is available through the connected GitHub tools, and the code execution environment's HTTP network and browser-test tooling are restricted. **No PASS is claimed for the updated browser suite.**

## Odoo Online v19 design and implementation constraint
Official Odoo v19 [Studio automation rules](https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html) explicitly describe custom **On create** and **On create and edit** triggers with `When updating field` selection, and `Execute Code` action exposing `UserError`. The same documentation says maintenance of custom automation code is not included in Standard/Custom pricing and may incur additional fees. [Odoo Online](https://www.odoo.com/documentation/19.0/administration/install/online.html) does not accept arbitrary custom modules. [Odoo Studio](https://www.odoo.com/documentation/19.0/applications/studio.html) may upgrade a Standard subscription automatically if newly installed. **Never install, subscribe or trigger an upsell without approval.**

**Design to validate in an authorized existing Odoo Online-compatible test duplicate:**
1. A *new* company8-only `sale.order.line` On create/edit guard for selected product 10972, using the **order's actual company**, never just website or `env.company`. Avoid indiscriminately blocking unrelated writes to historical confirmed lines.
2. A *new* company8 `sale.order` state/company-transition safety net for a draft containing variant 10972. It must actually reject transition to confirmed/done in staging and roll back the entire attempted transaction.
3. Negative tests for back-office, API/RPC, CSV/import, portal quote builder, website cart, product-changing edits, and pending-draft confirmation. Positive controls for company2, other company8 variants and historical confirmed orders. Explicitly verify that server automation still triggers with `sudo` and nested order-line commands, and that no email/side effect occurs on rejection.

**Not accepted:** A frontend CSS restriction, product/global archive, speculative price, record rule alone (may be bypassed by privileged `sudo` paths), reuse of an unrelated automation, or unverified assumption about trigger execution/transaction rollback.

## Owners / release
- **Assistant:** preserve code/QA status and execute the manual-only revised Playwright workflow only through a supported, authorized runner; no false CI pass.
- **Dalla Terra Odoo technical owner:** establish an authorized staged write path for newly scoped model-level create/edit/confirmation checks; demonstrate negative/positive matrix and rollback; correct stale action 1768 copy during controlled update.
- **GitHub repository owner:** independently verify intended repository visibility; connector currently reports `public`; no credentials or confidential files should be added.
- **User action at this QA checkpoint:** none required to preserve the current functioning public site. Broader backend release remains blocked; **issue #3 stays OPEN**.

**Milestone 06 and campaign launch 07 remain gated.**
