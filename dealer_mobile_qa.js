'use strict';
/*
 * Authorized TEST account only: Dalla Terra website 1, company 8.
 * Manual-only, non-transactional mobile browser acceptance.
 * No add-to-cart, checkout confirmation, payment, order, address edits, or screenshots of private data.
 * Password supplied only through GitHub Actions encrypted secret at runtime; never log it.
 */
const { chromium, webkit } = require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const BASE='https://www.dallaterra.ca';
const EMAIL='test@dallaterra.ca';
const PASSWORD=process.env.DT_QA_TEST_PASSWORD;
if(!PASSWORD) { console.error('BLOCKED: temporary test-account Actions secret not configured. No tests run.'); process.exit(3); }
const OUT=path.resolve('qa-output-dealer');
fs.mkdirSync(OUT,{recursive:true});
const report={created:new Date().toISOString(),scope:'Dalla Terra test account only, read-only nontransactional mobile',engines:[],passed:false};
const products=[
  {slug:'/shop/hydroblok-1/hydroblok-sealant-6608',sku:'HBJSCART',net:'$11.24',msrp:'$20.43',tap:'Sausage',afterSku:'HBJSSAUS',afterNet:'$19.92',afterMsrp:'$36.22'},
  {slug:'/shop/hydroblok-1/hydroblok-wallboard-and-panels-6604',sku:'HBWB366014',net:'$36.17',msrp:'$65.76',tap:'1/2"',afterSku:'HBWB366012',afterNet:'$41.09',afterMsrp:'$74.70'}
];
function observed(page){return page.evaluate(()=>{
 const root=document.documentElement;
 const visible=el=>{
   if(!el||!el.getClientRects().length)return false;
   for(let n=el;n&&n.nodeType===1;n=n.parentElement){
     const st=getComputedStyle(n);
     if(st.display==='none'||st.visibility==='hidden'||Number(st.opacity)===0)return false;
   }
   return true;
 };
 const controls=[...document.querySelectorAll('button,a,input[type="submit"],[role="button"]')];
 return {
   width:root.clientWidth,innerWidth:innerWidth,scrollWidth:root.scrollWidth,
   title:document.querySelector('#product_details h1')?.textContent?.trim()||'',
   sku:document.querySelector('#dt8-hb-sku')?.textContent?.trim()||'',
   net:document.querySelector('#dt8-hb-primary')?.textContent?.trim()||'',
   msrp:document.querySelector('#dt8-hb-msrp')?.textContent?.trim()||'',
   accountLabel:document.querySelector('#dt8-hb-pricebox')?.textContent?.includes('Your account price')||false,
   addToOrderVisible:controls.some(x=>visible(x)&&/add to (cart|order)/i.test((x.innerText||x.value||'').trim())),
   selected:[...document.querySelectorAll('#product_details input[type="radio"]:checked')].map(x=>x.dataset.valueName||x.value),
   media530:matchMedia('(max-width:530px)').matches
 };
});}
async function awaitPrice(page,sku,net,msrp){
 await page.waitForFunction(v=>{
   let s=document.querySelector('#dt8-hb-sku')?.textContent?.trim();
   let n=document.querySelector('#dt8-hb-primary')?.textContent?.trim();
   let m=document.querySelector('#dt8-hb-msrp')?.textContent?.trim();
   return s===v.sku&&n===v.net&&m===v.msrp;
 },{sku,net,msrp},{timeout:15000});
}
async function productCheck(page,p,issues){
 const resp=await page.goto(BASE+p.slug,{waitUntil:'domcontentloaded',timeout:45000});
 if(resp?.status()!==200)issues.push('Product HTTP '+resp?.status());
 await awaitPrice(page,p.sku,p.net,p.msrp).catch(()=>issues.push('Expected dealer product price did not load'));
 let start=await observed(page);
 function check(s,expected){
  if(s.width!==390||s.innerWidth!==390||s.scrollWidth>s.width+2||!s.media530)issues.push('Mobile viewport/overflow problem');
  if(s.sku!==expected.sku||s.net!==expected.net||s.msrp!==expected.msrp)issues.push('Dealer SKU/net/MSRP mismatch for '+expected.sku);
  if(!s.accountLabel)issues.push('Account price label absent');
  if(!s.addToOrderVisible)issues.push('Dealer ordering CTA absent');
 }
 check(start,p);
 const label=page.locator('#product_details input[type="radio"][data-value-name='+JSON.stringify(p.tap)+']').first();
 if(!await label.count()){issues.push('Variant radio absent');return {product:p.sku,before:start,after:null};}
 let clickable=label.locator('xpath=ancestor::label[1]');
 if(!await clickable.count()){
  const id=await label.getAttribute('id');
  if(id)clickable=page.locator('label[for='+JSON.stringify(id)+']').first();
 }
 if(!await clickable.count()){issues.push('Accessible variant tap label absent');return {product:p.sku,before:start,after:null};}
 try{await clickable.tap({timeout:12000});await awaitPrice(page,p.afterSku,p.afterNet,p.afterMsrp);}
 catch{issues.push('Dealer variant mobile tap/price update failed');}
 let after=await observed(page);
 check(after,{sku:p.afterSku,net:p.afterNet,msrp:p.afterMsrp});
 if(p.tap==='Sausage'&&!after.selected.includes('20 oz'))issues.push('Sealant option dependency not reconciled');
 return {product:p.sku,before:start,after};
}
async function runEngine(kind){
 const record={engine:kind,status:'REVIEW',issues:[],products:[],cart:null,checkout:null,extraInfo:null,errors:[]};
 let browser;
 try{
   browser=await (kind==='webkit'?webkit:chromium).launch({headless:true});
   const ctx=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:'en-CA'});
   const page=await ctx.newPage();
   page.setDefaultTimeout(12000);
   page.on('pageerror',err=>record.errors.push(String(err?.message||'page JS error').slice(0,170)));
   const login=await page.goto(BASE+'/web/login?redirect=%2Fshop',{waitUntil:'domcontentloaded',timeout:45000});
   if(login?.status()!==200)throw Error('Login page not HTTP 200');
   // Odoo header includes unrelated search forms: scope all login controls to the actual, visible login form.
   const loginForm=page.locator('form.oe_login_form').first();
   await loginForm.waitFor({state:'visible',timeout:15000});
   const emailInput=loginForm.locator('input[name="login"]').first(),passInput=loginForm.locator('input[name="password"]').first();
   if(!await emailInput.count()||!await passInput.count())throw Error('Normal Odoo sign-in form not found');
   await emailInput.fill(EMAIL);
   await passInput.fill(PASSWORD);
   // Only credential form submission is permitted. No product/order forms are submitted.
   const submit=loginForm.locator('button[type="submit"]').first();
   if(!await submit.count())throw Error('Login button missing');
   await submit.click({timeout:15000});
   await page.waitForTimeout(1300);
   for(const p of products){
     record.products.push(await productCheck(page,p,record.issues));
     await page.waitForTimeout(2600); // WebKit/Odoo lazy recently-viewed RPC must finish before navigation.
   }
   record.authenticated=record.products.every(x=>x.before.accountLabel);
   if(!record.authenticated)throw Error('Dealer account authentication not verified; checkout inspection prohibited');
   // Only safe GET routes below. No clicks that save, modify or confirm a cart/order.
   const cartResp=await page.goto(BASE+'/shop/cart',{waitUntil:'domcontentloaded',timeout:45000});
   let cartText=await page.locator('body').innerText({timeout:12000});
   record.cart={
     http:cartResp?.status(),urlPath:new URL(page.url()).pathname,
     hasSealant:cartText.includes('Sealant'),hasWallboard:cartText.includes('Wallboard'),
     hasFreightcom:cartText.includes('Freightcom'),
     previousKnownSubtotalVisible:cartText.includes('273.82'),
     previousKnownTaxesVisible:cartText.includes('32.87'),
     previousKnownTotalVisible:cartText.includes('306.69'),
     width:(await page.evaluate(()=>document.documentElement.clientWidth)),
     overflow:(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2))
   };
   if(record.cart.http!==200)record.issues.push('Authenticated cart did not return 200');
   if(record.cart.width!==390||record.cart.overflow)record.issues.push('Cart mobile horizontal overflow/viewport');
   for(const key of ['hasSealant','hasWallboard','hasFreightcom','previousKnownSubtotalVisible','previousKnownTaxesVisible','previousKnownTotalVisible']){
      if(!record.cart[key])record.issues.push('Existing cart expected item/total not verified: '+key);
   }
   if(/your cart is empty|empty cart/i.test(cartText))record.issues.push('Existing test cart missing; checkout addresses not exercised');
   if(!record.issues.some(s=>s.includes('Existing test cart missing'))){
     await page.waitForTimeout(2600);
     const address=await page.goto(BASE+'/shop/checkout?try_skip_step=true',{waitUntil:'domcontentloaded',timeout:45000});
     record.checkout=await page.evaluate(()=>({
       currentPath:location.pathname,width:document.documentElement.clientWidth,
       overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
       hasAddressStep:/address|shipping|billing/i.test(document.body.innerText)
     }));
     record.checkout.http=address?.status();
     if(record.checkout.http!==200||record.checkout.overflow||record.checkout.width!==390||!record.checkout.hasAddressStep)record.issues.push('Address page mobile acceptance');
     await page.waitForTimeout(1600);
     const extra=await page.goto(BASE+'/shop/extra_info',{waitUntil:'domcontentloaded',timeout:45000});
     record.extraInfo=await page.evaluate(()=>({
       currentPath:location.pathname,width:document.documentElement.clientWidth,
       overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
       hasReferenceField:/reference|purchase order|additional information/i.test(document.body.innerText)
     }));
     record.extraInfo.http=extra?.status();
     if(record.extraInfo.http!==200||record.extraInfo.overflow||record.extraInfo.width!==390||!record.extraInfo.hasReferenceField)record.issues.push('Extra Info mobile acceptance');
     await page.waitForTimeout(1600);
     // GET-only post-audit cart integrity: never change order lines or submit checkout.
     await page.goto(BASE+'/shop/cart',{waitUntil:'domcontentloaded',timeout:45000});
     const endText=await page.locator('body').innerText({timeout:12000});
     record.finalCart={
       hasSealant:endText.includes('Sealant'),hasWallboard:endText.includes('Wallboard'),
       hasFreightcom:endText.includes('Freightcom'),
       subtotalUnchanged:endText.includes('273.82'),
       taxUnchanged:endText.includes('32.87'),
       totalUnchanged:endText.includes('306.69')
     };
     if(Object.values(record.finalCart).some(v=>!v))record.issues.push('Existing cart content or totals not preserved after navigation');
   }
   if(record.errors.length)record.issues.push('Page JS errors ('+record.errors.length+')');
   record.status=record.issues.length?'REVIEW':'PASS';
   await ctx.close();
 }catch(e){record.issues.push(String(e?.message||e).slice(0,180));record.status='ERROR';}
 finally{if(browser)await browser.close().catch(()=>{});}
 return record;
}
async function main(){
 for(const engine of ['chromium','webkit']){const result=await runEngine(engine);report.engines.push(result);console.log(engine+' '+result.status+' '+result.issues.join(' | ').slice(0,280));}
 report.passed=report.engines.length===2&&report.engines.every(x=>x.status==='PASS');
 const json=JSON.stringify(report,null,2);
 fs.writeFileSync(path.join(OUT,'results.json'),json);
 const lines=['# Dalla Terra authenticated dealer mobile acceptance — test account only','',
  'Emulated mobile Chromium + WebKit at 390×844; no real Safari device. No cart/order write or payment.','',
  '| Engine | Result | Cart | Address | Extra Info | Findings |','|---|---|---|---|---|---|'];
 for(const e of report.engines)lines.push('| '+e.engine+' | '+e.status+' | '+(e.cart?.http||'not tested')+
 ' | '+(e.checkout?.http||'not tested')+' | '+(e.extraInfo?.http||'not tested')+
 ' | '+e.issues.join('; ').replace(/\|/g,'/')+' |');
 fs.writeFileSync(path.join(OUT,'report.md'),lines.join('\n'));
 process.exitCode=report.passed?0:1;
}
main().catch(e=>{console.error('DEALER MOBILE QA ERROR '+String(e?.message||e).slice(0,160));process.exitCode=2;});