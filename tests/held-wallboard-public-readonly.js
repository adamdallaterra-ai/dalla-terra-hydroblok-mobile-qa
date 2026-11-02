'use strict';
/**
 * DT8_HB_HELD_WALLBOARD_PUBLIC_GUARD_V1_20261101
 * Manual-only, PUBLIC-GUEST, GET-only live guard. No login, email, forms,
 * add-to-cart, checkout, order, booking, Odoo writes or Showroom website visits.
 * Deliberately FAILS while held product 10972 is deep-link selectable.
 */
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'https://www.dallaterra.ca';
const PRODUCT = BASE + '/shop/hydroblok-wallboard-and-panels-6604';
const HELD = PRODUCT + '?attribute_values=346%2C305';
const HUB = BASE + '/shop/category/hydroblok-1';
const HELD_ID = 10972, HELD_CODE = 'HBWB2548112';
const ASSETS = [
  'hydro-blok_web_2000_tagline-448px.png',
  'SF_Website2_Hydroblok_Clean_Construction_Approved_20261017.webp',
  'HYDRO-BLOK-before-after-2-scaled.jpg',
  'HYDROBLOK_4224lineardrain_B_webhome-scaled.jpg'
];
function serverProductId(html) {
  for (const m of String(html || '').matchAll(/<input\b[^>]*>/gi)) {
    if (!/\bname\s*=\s*["']product_id["']/i.test(m[0])) continue;
    const value = m[0].match(/\bvalue\s*=\s*["'](\d+)["']/i);
    return value ? Number(value[1]) : null;
  }
  return null;
}
function visiblePurchaseControls(texts) {
  return texts.filter(x => /add to (cart|order)/i.test(x));
}
module.exports = { serverProductId, visiblePurchaseControls, BASE, PRODUCT, HELD, HUB, HELD_ID, HELD_CODE, ASSETS };

async function main() {
  // Lazy import so isolated parser fixtures can run without a browser install.
  const { chromium, webkit } = require('playwright');
  const engine = process.argv[2] || 'chromium';
  if (!['chromium', 'webkit'].includes(engine)) throw Error('ENGINE_NOT_ALLOWED');
  const browser = await (engine === 'webkit' ? webkit : chromium).launch({ headless: true });
  const out = path.resolve('qa-output-held-' + engine);
  fs.mkdirSync(out, { recursive: true });
  const report = { scope: 'DT8 SITE1 PUBLIC GET ONLY', engine, created: new Date().toISOString(),
    expectedCurrentHold: true, cases: [], passed: false };
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: {width, height: 850},
        isMobile: width < 600, hasTouch: width < 600, locale: 'en-CA' });
      const blocked = [];
      // No mutating HTTP methods are permitted, even if page JS attempts them.
      await context.route('**/*', async route => {
        const req = route.request();
        if (req.method() !== 'GET') {
          let pathname = '[unparsed]';
          try { pathname = new URL(req.url()).pathname; } catch (_) {}
          blocked.push({ method: req.method(), pathname });
          await route.abort();
        } else await route.continue();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(18000);
      const errors = [];
      page.on('pageerror', e => errors.push(String(e.message || e).slice(0, 220)));
      const one = { width, issues: [], warnings: [], blockedNonGet: blocked,
        jsErrors: errors, pages: {}, images: [] };
      try {
        const normal = await page.goto(PRODUCT, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const html = await normal.text();
        one.pages.default = { status: normal.status(), serverProductId: serverProductId(html) };
        if (normal.status() !== 200 || one.pages.default.serverProductId !== 10238)
          one.issues.push('Normal wallboard default product baseline drift');
        const held = await page.goto(HELD, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const heldHtml = await held.text();
        await page.waitForTimeout(900);
        const state = await page.evaluate(() => {
          const visible = el => !!el && !!el.getClientRects().length &&
            getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
          const choices = [...document.querySelectorAll('#product_detail input[type="radio"]:checked')]
            .map(x => ({ label: x.dataset.valueName || x.value,
              attributeId: x.dataset.attributeValueId || null }));
          const controls = [...document.querySelectorAll('button,a,input[type="submit"]')]
            .filter(visible).map(x => (x.innerText || x.value || '').trim()).filter(Boolean);
          const price = document.querySelector('#dt8-hb-primary')?.textContent?.trim() || null;
          const sku = document.querySelector('#dt8-hb-sku')?.textContent?.trim() || null;
          const heldData = document.querySelector('#dt8-hb-prices [data-id="10972"]');
          return { url: location.href, sku, price, choices,
            hiddenMsrpPresent: !!(heldData && heldData.hasAttribute('data-msrp')),
            guestPurchaseLabels: controls.filter(x => /add to (cart|order)/i.test(x)).slice(0, 6),
            canonical: document.querySelector('link[rel="canonical"]')?.href || null };
        });
        one.pages.held = { status: held.status(), serverProductId: serverProductId(heldHtml), ...state };
        if (held.status() !== 200) one.issues.push('Held deep link does not load predictably: HTTP ' + held.status());
        if (one.pages.held.serverProductId === HELD_ID || state.sku === HELD_CODE ||
            state.choices.some(c => c.attributeId === '346'))
          one.issues.push('RELEASE HOLD: unpriced variant 10972 still selectable using attribute_values=346,305');
        if (!one.pages.held.serverProductId) one.issues.push('Unable to independently verify held URL server product_id');
        if (state.hiddenMsrpPresent) one.issues.push('Held variant unexpectedly has public data-msrp');
        if (state.guestPurchaseLabels.length) one.issues.push('Public guest purchase control visible');
        await page.screenshot({ path: path.join(out, 'held-' + width + '.png'), fullPage: false });
        const hub = await page.goto(HUB, { waitUntil: 'domcontentloaded', timeout: 45000 });
        if (hub.status() !== 200) one.issues.push('HYDRO-BLOK hub HTTP ' + hub.status());
        for (const needle of ASSETS) {
          const loc = page.locator('img[src*="' + needle + '"]').first();
          if (!await loc.count()) {
            one.issues.push('Hub image missing from DOM: ' + needle);
            one.images.push({ needle, missing: true });
            continue;
          }
          await loc.scrollIntoViewIfNeeded({timeout:10000}).catch(() => {});
          await page.waitForFunction(n => {
            const i = [...document.images].find(x => x.src.includes(n));
            return !!i && i.complete && i.naturalWidth > 0;
          }, needle, {timeout:15000}).catch(() => {});
          const result = await page.evaluate(n => {
            const i = [...document.images].find(x => x.src.includes(n));
            if (!i) return {needle:n, missing:true};
            return {needle:n, complete:i.complete, naturalWidth:i.naturalWidth,
              naturalHeight:i.naturalHeight, renderedWidth:Math.round(i.getBoundingClientRect().width)};
          }, needle);
          one.images.push(result);
          if (!result.complete || !(result.naturalWidth > 0))
            one.issues.push('Hub asset fails positive load: ' + needle);
        }
        await page.screenshot({ path: path.join(out, 'hub-' + width + '.png'), fullPage: false });
      } catch (e) { one.issues.push('QA exception: ' + String(e.message || e).slice(0, 350)); }
      report.cases.push(one);
      await context.close();
    }
  } finally { await browser.close(); }
  report.passed = report.cases.length === 2 && report.cases.every(c => c.issues.length === 0);
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  const summary = report.cases.map(c => c.width + 'px: ' + (c.issues.length ? c.issues.join(' | ') : 'PASS')).join('\n');
  console.log('DT8 HELD-WALLBOARD READ-ONLY RELEASE GATE\n' + summary);
  console.log('Final: ' + (report.passed ? 'PASS' : 'HOLD / FAIL') + ' (no non-GET requests allowed)');
  if (!report.passed) process.exitCode = 1;
}
if (require.main === module) main().catch(e => { console.error(String(e.stack || e)); process.exitCode = 1; });
