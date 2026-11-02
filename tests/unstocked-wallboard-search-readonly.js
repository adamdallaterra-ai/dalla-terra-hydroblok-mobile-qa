'use strict';
/**
 * DT8_HB_UNSTOCKED_10972_SEARCH_VISIBILITY_QA_V1_20261102
 * Manual-only public browser GETs. No login, orders, payments, emails,
 * forms, pricing edits or Odoo writes. Tested search results are public.
 */
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'https://www.dallaterra.ca';
const CASES = [
  {name:'held-exact',path:'/shop?search=HBWB2548112',held:true},
  {name:'held-lower',path:'/shop?search=hbwb2548112',held:true},
  {name:'valid-control',path:'/shop?search=HBWB366014',held:false}
];
async function main() {
  const browserName = process.argv[2] || 'chromium';
  if (!['chromium','webkit'].includes(browserName)) throw Error('UNSUPPORTED_BROWSER');
  const {chromium,webkit}=require('playwright');
  const browser=await (browserName==='chromium'?chromium:webkit).launch({headless:true});
  const output=path.resolve('qa-output-held-'+browserName);
  fs.mkdirSync(output,{recursive:true});
  const results=[];
  try {
    for (const width of [390,1280]) {
      const context=await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600});
      await context.route('**/*',async route=>{
        if(route.request().method()!=='GET') await route.abort();
        else await route.continue();
      });
      const page=await context.newPage();
      for (const c of CASES) {
        const row={name:c.name,width,issues:[]};
        try {
          const res=await page.goto(BASE+c.path,{waitUntil:'domcontentloaded',timeout:45000});
          const html=await res.text();
          row.status=res.status();
          row.noticeHTML=html.includes('id="dt8-hb-unstocked-sku-search-notice"');
          row.familyCardHTML=html.includes('Hydroblok Wallboard and Panels');
          row.priceHTML=html.includes('class="product_price"');
          const ui=await page.evaluate(()=>{
            const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&!!el.getClientRects().length;
            const notice=document.querySelector('#dt8-hb-unstocked-sku-search-notice');
            const price=document.querySelector('#products_grid .o_wsale_products_grid_table .product_price');
            const family=[...document.querySelectorAll('#products_grid .o_wsale_products_grid_table a[href]')]
              .find(a=>a.getAttribute('href')?.includes('wallboard-and-panels-6604'));
            return {noticeVisible:visible(notice),priceVisible:visible(price),hasFamilyLink:!!family};
          });
          row.ui=ui;
          if(row.status!==200)row.issues.push('GET status '+row.status);
          if(!row.familyCardHTML||!ui.hasFamilyLink)row.issues.push('Normal alternative family link missing');
          if(c.held){
            if(!row.noticeHTML||!ui.noticeVisible)row.issues.push('Held SKU notice missing');
            if(ui.priceVisible)row.issues.push('Misleading default-family price visible for held-SKU search');
          }else{
            if(row.noticeHTML||ui.noticeVisible)row.issues.push('Held notice leaked to valid SKU search');
            if(!row.priceHTML)row.issues.push('Normal search family card lost its source MSRP');
          }
        }catch(e){row.issues.push('GET_QA_ERROR: '+String(e.message||e).slice(0,240));}
        results.push(row);
      }
      await context.close();
    }
  }finally{await browser.close();}
  const passed=results.length===CASES.length*2&&results.every(x=>x.issues.length===0);
  fs.writeFileSync(path.join(output,'unstocked-search-results.json'),JSON.stringify({scope:'DT8 site1 public GET',browserName,passed,results},null,2)+'\n');
  console.log(JSON.stringify({browserName,passed,total:results.length,failed:results.filter(x=>x.issues.length)},null,2));
  if(!passed)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(String(e.stack||e));process.exitCode=1;});
