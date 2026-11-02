'use strict';
/**
 * DT8_HB_WALLBOARD_10972_SSR_FORM_ACCEPTANCE_V1_20261102
 * Public, GET-only, manual browser check for an interim native-form hold.
 * A PASS does NOT prove cart/API/order rejection or approve campaign release.
 */
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'https://www.dallaterra.ca';
const WALL = BASE + '/shop/hydroblok-wallboard-and-panels-6604';
const CASES = [
  {name:'held', url:WALL+'?attribute_values=346%2C305', form:false, product:null},
  {name:'held-reversed', url:WALL+'?attribute_values=305%2C346', form:false, product:null},
  {name:'held-plus-variant', url:WALL+'?attribute_values=346%2C305&variant=10972', form:false, product:null},
  {name:'wallboard-default', url:WALL, form:true, product:10238},
  {name:'sealant', url:BASE+'/shop/hydroblok-sealant-6608', form:true, product:10274},
  {name:'fasteners', url:BASE+'/shop/hydroblok-screws-and-washers-6610', form:true, product:10294},
  {name:'curbs', url:BASE+'/shop/hydroblok-curbs-6605', form:true, product:10181}
];
function nativeForm(html) {
  const s = String(html || '');
  const at = s.search(/\bid=["']o_wsale_product_details_content["']/i);
  if (at < 0) return null;
  const close = s.indexOf('>', at);
  if (close < 0) return null;
  return /^\s*<form(?:\s|>)/i.test(s.slice(close + 1));
}
function productId(html) {
  const s = String(html || '');
  for (const [tag] of s.matchAll(/<input\b[^>]*>/gi)) {
    if (!/\bname=["']product_id["']/i.test(tag)) continue;
    const id = tag.match(/\bvalue=["'](\d+)["']/i);
    return id ? Number(id[1]) : null;
  }
  return null;
}
module.exports = { nativeForm, productId, CASES };
async function main() {
  const which = process.argv[2] || 'chromium';
  if (!['chromium','webkit'].includes(which)) throw Error('UNSUPPORTED_BROWSER');
  const {chromium, webkit} = require('playwright');
  const browser = await (which === 'chromium' ? chromium : webkit).launch({headless:true});
  const cases = [];
  const out = path.resolve('qa-output-held-'+which);
  fs.mkdirSync(out, {recursive:true});
  try {
    for (const width of [390,1280]) {
      const context = await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600});
      const blocked = [];
      await context.route('**/*', async route => {
        const req = route.request();
        if (req.method() !== 'GET') {
          blocked.push({method:req.method(),pathname:new URL(req.url()).pathname});
          await route.abort();
        } else await route.continue();
      });
      const page = await context.newPage();
      for (const c of CASES) {
        const row = {name:c.name,width,issues:[]};
        try {
          const response = await page.goto(c.url,{waitUntil:'domcontentloaded',timeout:45000});
          const html = await response.text();
          row.status = response.status();
          row.nativeForm = nativeForm(html);
          row.productId = productId(html);
          row.hasLegacyCode = html.includes('HBWB2548112');
          row.hasExpectedNotice = html.includes('This product has no valid combination.');
          if(row.status !== 200) row.issues.push('HTTP '+row.status);
          if(row.nativeForm !== c.form) row.issues.push('Expected native form '+c.form+', got '+row.nativeForm);
          if(row.productId !== c.product) row.issues.push('Expected native form product '+c.product+', got '+row.productId);
          if(c.form === false && !row.hasExpectedNotice) row.issues.push('Expected held-SKU unavailable notice absent');
          if(/\bInternal Server Error\b|QWebException|Traceback/.test(html.slice(0,6000))) row.issues.push('Server exception text');
        } catch(e) { row.issues.push('GET_FAILED: '+String(e.message || e).slice(0,220)); }
        cases.push(row);
      }
      if(blocked.length) cases.push({name:'blocked-nonGET',width,blockedCount:blocked.length,issues:[],note:'all non-GET requests aborted; not an assertion that page JS fully hydrated'});
      await context.close();
    }
  } finally { await browser.close(); }
  const tested = cases.filter(c=>CASES.map(x=>x.name).includes(c.name));
  const passed = tested.length === CASES.length*2 && tested.every(c=>c.issues.length===0);
  const report={scope:'DT8 website1 public GET only',which,passed,hardLimit:'SSR form suppression only; backend ordering not tested',cases};
  fs.writeFileSync(path.join(out,'ssr-form-results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({browser:which,passed,tested:tested.length,failures:tested.filter(c=>c.issues.length).slice(0,15)},null,2));
  if(!passed) process.exitCode=1;
}
if (require.main === module) main().catch(e=>{console.error(String(e.stack||e));process.exitCode=1;});
