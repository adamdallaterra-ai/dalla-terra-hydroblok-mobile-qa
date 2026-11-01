'use strict';
/*
 * Dalla Terra website 1, company 8. PUBLIC-ONLY mobile regression checks.
 * Read-only: page visits and product option taps; NO login/cart/order writes.
 */
const { webkit } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const BASE = process.env.QA_BASE_URL || 'https://www.dallaterra.ca';
if (BASE !== 'https://www.dallaterra.ca') throw Error('Only the public Dalla Terra site is allowed');
const OUTPUT = path.resolve('qa-output-webkit');
fs.mkdirSync(OUTPUT, { recursive: true });
const widths = (process.env.QA_WIDTHS || '375,390,430,768').split(',').map(x => Number(x.trim()))
  .filter(x => Number.isInteger(x) && x >= 320 && x <= 1600);
if (!widths.length) throw Error('No valid viewport widths');
const allAt390 = process.env.QA_ALL_390 !== '0';
const KEY = [
  ['category', '/shop/category/hydroblok-1'],
  ['wallboards-6604', '/shop/hydroblok-1/hydroblok-wallboard-and-panels-6604', 'HBWB366014', '$65.76'],
  ['pans-6621', '/shop/hydroblok-1/hydroblok-standard-drain-shower-pans-6621', 'HBLPSP3636', '$715.59'],
  ['extensions-6623', '/shop/hydroblok-1/hydroblok-invisible-drain-shower-pan-extensions-6623', 'HBSSSP7212EXT', '$371.08'],
  ['niches-6606', '/shop/hydroblok-1/hydroblok-niches-6606', 'HBRSN1616', '$160.52'],
  ['sealant-6608', '/shop/hydroblok-1/hydroblok-sealant-6608', 'HBJSCART', '$20.43'],
];
const OTHER = [
  ['invisible-pans-6620', '/shop/hydroblok-1/hydroblok-invisible-drain-shower-pans-6620'],
  ['standard-extensions-6622', '/shop/hydroblok-1/hydroblok-standard-drain-shower-pan-extensions-6622'],
  ['trims-6600', '/shop/hydroblok-1/hydroblok-invisible-drain-trims-6600'],
  ['drain-covers-6611', '/shop/hydroblok-1/hydroblok-drain-covers-6611'],
  ['benches-6607', '/shop/hydroblok-1/hydroblok-benches-6607'],
  ['drain-kit-6598', '/shop/hydroblok-1/hbld73-hydroblok-invisible-drain-kit-6598'],
  ['drain-accessories-6602', '/shop/hydroblok-1/hydroblok-invisible-drain-accessories-6602'],
  ['diamond-caddy-38942', '/shop/hydroblok-1/hbdsc-hydro-blok-diamond-shampoo-caddy-8-x-8-38942'],
  ['screws-6610', '/shop/hydroblok-1/hydroblok-screws-and-washers-6610'],
  ['pipe-seals-6613', '/shop/hydroblok-1/hydroblok-pipe-valve-seals-6613'],
  ['sealant-accessories-6614', '/shop/hydroblok-1/hydroblok-sealant-accessories-6614'],
  ['curbs-6605', '/shop/hydroblok-1/hydroblok-curbs-6605'],
  ['access-ramp-38941', '/shop/hydroblok-1/hbsr1272-hydro-blok-ez-access-shower-ramp-12-x-72-38941'],
  ['sealant-guns-6609', '/shop/hydroblok-1/hydroblok-sealant-guns-6609'],
  ['membrane-6615', '/shop/hydroblok-1/hydroblok-uncoupling-membrane-6615'],
  ['joist-kit-6616', '/shop/hydroblok-1/hbfljck-hydroblok-lowering-joist-kit-6616'],
  ['brass-drain-38943', '/shop/hydroblok-1/hbbdk-hydro-blok-brass-drain-kit-38943'],
];
// DT8_HB_DESCRIPTIONS_C8_V1_20261101: exact site1-only neutral family descriptions verified against Odoo QWeb view 7920.
const EXPECTED_DESCRIPTIONS = {
  "6600": "Select the available HYDRO-BLOK invisible-drain trim profile and finish above. Confirm the item code and per-unit price for your selection.",
  "6602": "Choose the HYDRO-BLOK invisible-drain accessory that matches your project. Check the selected configuration and item code.",
  "6604": "Choose HYDRO-BLOK wallboard dimensions and thickness above. The item code and per-unit price follow the selected panel.",
  "6605": "Select a HYDRO-BLOK shower curb style and length above. Confirm your selected size and item code before ordering.",
  "6606": "Explore available HYDRO-BLOK recessed niche shapes and sizes above. The item code and price reflect your selection.",
  "6607": "Choose the HYDRO-BLOK bench style and size suited to your shower. The item code and price follow the selected option.",
  "6608": "Select HYDRO-BLOK joint sealant in the available cartridge or sausage format. Check the item code and quantity for your choice.",
  "6609": "Choose the HYDRO-BLOK sealant applicator for your selected cartridge or sausage format. Check the item code before ordering.",
  "6610": "Select the HYDRO-BLOK screws or washers required for the installation. Packaging and quantity vary by item.",
  "6611": "Choose from the available HYDRO-BLOK drain-cover styles and finishes. The item code and price follow the selected cover.",
  "6613": "Select the HYDRO-BLOK pipe or valve seal needed for your opening. Confirm the selected option and item code.",
  "6614": "Choose the HYDRO-BLOK sealant accessory required for your project. Item specifications and packaging vary by selection.",
  "6615": "Select the available HYDRO-BLOK uncoupling membrane format. Confirm the selected size, item code, and price.",
  "6620": "Choose a HYDRO-BLOK invisible-drain shower pan by available size and slope profile. Confirm the selected item code before ordering.",
  "6621": "Explore HYDRO-BLOK standard-drain shower pans by available dimensions and drain position. Choose an offered combination above.",
  "6622": "Choose a compatible standard-drain shower-pan extension by style and size. Check the item code and per-unit price for your selected configuration.",
  "6623": "Choose a compatible invisible-drain shower-pan extension by slope profile and size. Check the item code and per-unit price for your selected configuration."
};
const report = { engine: 'Playwright WebKit on Linux, mobile emulation (not physical iPhone Safari)', created: new Date().toISOString(), target: BASE, company: 8, website: 1,
  readonly: true, widths, allAt390, entries: [], summary: {} };
const short = e => String(e && e.message || e).slice(0, 500);
function present(el) {
  if (!el || !el.getClientRects().length) return false;
  for (let n=el; n && n.nodeType===1; n=n.parentElement) {
    let s=getComputedStyle(n);
    if (s.display==='none' || s.visibility==='hidden' || Number(s.opacity)===0) return false;
  }
  return true;
}
async function snapshot(page) {
  return page.evaluate(() => {
    const root=document.documentElement, body=document.body;
    const visible=el => {
      if (!el || !el.getClientRects().length) return false;
      for (let n=el; n && n.nodeType===1; n=n.parentElement) {
        const s=getComputedStyle(n);
        if (s.display==='none' || s.visibility==='hidden' || Number(s.opacity)===0) return false;
      }
      return true;
    };
    const controls=[...document.querySelectorAll('button,a,input[type="submit"],[role="button"]')];
    const ordering=controls.filter(el=>visible(el)&&/add to (cart|order)/i.test((el.innerText||el.value||'').trim()))
      .map(el=>(el.innerText||el.value||'').trim().slice(0,60)).slice(0,4);
    const cartBtn=document.querySelector('#add_to_cart');
    const sku=document.querySelector('#dt8-hb-sku')?.textContent?.trim()||null;
    const price=document.querySelector('#dt8-hb-primary')?.textContent?.trim()||null;
    const rootProduct=document.querySelector('#product_detail')||document.body;
    let overhangs=[];
    for(const el of rootProduct.querySelectorAll('*')) {
      if(overhangs.length>=12)break;
      if(!visible(el))continue;
      const r=el.getBoundingClientRect();
      if(r.left < -4 || r.right > root.clientWidth+4) overhangs.push({
        tag:el.tagName.toLowerCase(), id:el.id||'', left:Math.round(r.left), right:Math.round(r.right)
      });
    }
    const choices=[...document.querySelectorAll('#product_details input[type="radio"]:checked')]
      .map(el=>el.dataset.valueName||el.value);
    return {innerWidth:innerWidth,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,
      bodyScrollWidth:body.scrollWidth,media530:matchMedia('(max-width:530px)').matches,
      media640:matchMedia('(max-width:640px)').matches,sku,msrp:price,
      hasPriceBox:visible(document.querySelector('#dt8-hb-pricebox')),
      title:(document.querySelector('#product_details h1')||document.querySelector('h1'))?.innerText?.trim()||'',
      ordering,cartButtonVisible:visible(cartBtn),choices,
      horizontalOverflow:root.scrollWidth>root.clientWidth+2 || body.scrollWidth>root.clientWidth+2,
      overhangs};
  });
}
async function settle(page, sku, dwellMs=700) {
  if(sku)await page.waitForFunction(x=>document.querySelector('#dt8-hb-sku')?.textContent?.trim()===x,
    sku,{timeout:12000}).catch(()=>{});
  await page.waitForTimeout(dwellMs);
}
function checkSnapshot(m, sku, price, issues, width) {
  if(m.clientWidth!==width || m.innerWidth!==width)issues.push('Wrong CSS viewport: inner='+m.innerWidth+', client='+m.clientWidth);
  if(m.horizontalOverflow)issues.push('Horizontal overflow: document='+m.scrollWidth+', body='+m.bodyScrollWidth+', viewport='+m.clientWidth);
  if(width<=530&&!m.media530)issues.push('530px breakpoint absent');
  if(width<=640&&!m.media640)issues.push('640px breakpoint absent');
  if(sku && m.sku!==sku)issues.push('SKU expected '+sku+', got '+m.sku);
  if(price && m.msrp!==price)issues.push('MSRP expected '+price+', got '+m.msrp);
  if(m.ordering.length||m.cartButtonVisible)issues.push('Guest purchase control visible: '+m.ordering.join(', '));
}
async function tapRadio(page,name,sku,price,width) {
  const inp=page.locator('#product_details input[type="radio"][data-value-name='+JSON.stringify(name)+']').first();
  if(!await inp.count())return {status:'NOT_TESTED',reason:'Option absent: '+name};
  let label=inp.locator('xpath=ancestor::label[1]');
  if(!await label.count()) {
    const id=await inp.getAttribute('id');
    if(id)label=page.locator('label[for='+JSON.stringify(id)+']').first();
  }
  if(!await label.count())return {status:'NOT_TESTED',reason:'Radio has no accessible label: '+name};
  try {
    await label.tap({timeout:9000});
    await settle(page,sku);
    let state=await snapshot(page),issues=[];
    checkSnapshot(state,sku,price,issues,width);
    return {status:issues.length?'REVIEW':'PASS',issues,state};
  }catch(e){return {status:'NOT_TESTED',reason:short(e)};}
}
async function interactions(page,id,width) {
  let tests=[];
  if(id==='wallboards-6604')tests.push({name:'Wallboard 1/2 inch',result:await tapRadio(page,'1/2"','HBWB366012','$74.70',width)});
  if(id==='sealant-6608') {
    let r=await tapRadio(page,'Sausage','HBJSSAUS','$36.22',width);
    if(r.state&&!r.state.choices.includes('20 oz')){r.status='REVIEW';r.issues.push('20 oz choice was not retained');}
    tests.push({name:'Sausage selects 20 oz',result:r});
  }
  if(id==='niches-6606')tests.push({name:'Barrel Head selects 16x22',result:await tapRadio(page,'Barrel Head','HBRBHSN1622','$297.85',width)});
  if(id==='extensions-6623') {
    let r=await tapRadio(page,'Thin Single Slope','HBTSSSP7212EXT','$350.47',width);
    tests.push({name:'Thin single slope selection',result:r});
  }
  if(id==='trims-6600')tests.push({name:'Trim 1/4 selection',result:await tapRadio(page,'1/4"','HBINSI14','$178.58',width)});
  if(id==='pans-6621'){
    const b=page.locator('#product_details button.hb6-drain-option').filter({hasText:'Offset Drain'}).first();
    if(!await b.count())tests.push({name:'Offset Drain',result:{status:'NOT_TESTED',reason:'Custom Offset button absent'}});
    else try{
      await b.tap({timeout:9000});await settle(page,'HBLPSP3672OD');
      let state=await snapshot(page),issues=[];
      checkSnapshot(state,'HBLPSP3672OD','$1,113.24',issues,width);
      tests.push({name:'Offset Drain',result:{status:issues.length?'REVIEW':'PASS',issues,state}});
    }catch(e){tests.push({name:'Offset Drain',result:{status:'NOT_TESTED',reason:short(e)}});}
  }
  return tests;
}
async function main(){
  const browser=await webkit.launch({headless:true});
  try{
    for(const width of widths){
      const mobile=width<640;
      const context=await browser.newContext({viewport:{width,height:844},
        screen:{width,height:844},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,locale:'en-CA'});
      const page=await context.newPage();page.setDefaultTimeout(12000);
      let pageErrors=[];
      let recentlyViewedResponses=[];
      page.on('pageerror',err=>pageErrors.push(short(err)));
      page.on('response',resp=>{
        if(resp.url().includes('/shop/products/recently_viewed_update')) recentlyViewedResponses.push({status:resp.status(),method:resp.request().method(),path:'/shop/products/recently_viewed_update'});
      });
      const items=width===390&&allAt390?KEY.concat(OTHER):KEY;
      for(const [id,slug,sku,msrp] of items){
        const issues=[],url=BASE+slug;pageErrors=[];recentlyViewedResponses=[];
        const entry={id,width,url,issues,status:'ERROR'};
        try{
          const resp=await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});
          entry.httpStatus=resp?.status()||null;entry.actualUrl=page.url();
          if(entry.httpStatus!==200)issues.push('HTTP '+entry.httpStatus);
          if(new URL(entry.actualUrl).hostname!=='www.dallaterra.ca')issues.push('Unexpected host '+entry.actualUrl);
          await settle(page,sku,2600); // Ensure Odoo recently-viewed RPC finishes before next navigation on WebKit.
          entry.metrics=await snapshot(page);
          checkSnapshot(entry.metrics,sku,msrp,issues,width);
          const familyId=(id.match(/-(\d+)$/)||[])[1];
          if(familyId && EXPECTED_DESCRIPTIONS[familyId]) {
            const familyCopy=await page.locator('#product_full_description').first().innerText({timeout:5000}).catch(()=>'');
            entry.descriptionText=familyCopy.trim().slice(0,200);
            if(familyCopy.trim()!==EXPECTED_DESCRIPTIONS[familyId])issues.push('Dalla Terra family description mismatch: product '+familyId);
          }
          if(id==='category'){
            const dealer=page.locator('#dt8-hb-dealers').first();
            const copy=await dealer.innerText({timeout:5000}).catch(()=>'');
            const labels=['Order for a project.','Stock the essentials.','Use the portal you already have.'];
            entry.dealerOfferLabels=labels.map(label=>({label,present:copy.includes(label)}));
            for(const item of entry.dealerOfferLabels)if(!item.present)issues.push('Dealer offer label missing: '+item.label);
            if(!copy.includes('request availability and freight')||!copy.includes('which stocking-dealer terms apply'))issues.push('Dealer offer confirmation/qualification wording missing');
            if(!(await dealer.locator('a[href="/web/login?redirect=/my/home"]').count()))issues.push('Dealer sign-in action missing');
            if(!(await dealer.locator('a[href="/contact-us"]').count()))issues.push('Dealer enquiry action missing');

            // DT8_HB_FIRST_PROJECT_PATH_V1_20261101: exercise native guide at every viewport, not just static HTML.
            const first=dealer.locator('#dt8-hb-first-project').first();
            if(!(await first.count()))issues.push('First-project guide missing');
            else {
              const summary=first.locator('summary').first();
              if(!(await summary.count()))issues.push('First-project guide summary missing');
              else {
                try{
                  const initiallyClosed=await first.evaluate(el=>!el.open);
                  if(!initiallyClosed)issues.push('First-project guide should start collapsed');
                  await summary.click({timeout:8500});
                  const opened=await first.evaluate(el=>!!el.open);
                  if(!opened)issues.push('First-project guide did not expand on click');
                  const guideText=await first.innerText({timeout:5000});
                  const terms=['Capture the basics.','Explore the options.','Request a review.','New Quote / Check Availability','does not reserve inventory'];
                  entry.firstProjectGuide={opened,terms:terms.map(term=>({term,present:guideText.includes(term)})),contactLink:await first.locator('a[href="/contact-us"]').count()>0};
                  for(const item of entry.firstProjectGuide.terms)if(!item.present)issues.push('First-project step missing: '+item.term);
                  if(!entry.firstProjectGuide.contactLink)issues.push('First-project help contact link missing');
                  const dimensions=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
                  entry.expandedGuidePageWidth=dimensions;
                  if(dimensions.scroll>dimensions.client+2)issues.push('Expanded first-project guide causes horizontal overflow');
                }catch(e){issues.push('First-project guide interaction: '+short(e));}
              }
            }
          }
          if(id!=='category'&&!entry.metrics.hasPriceBox)issues.push('Guest price box missing');
          if(!entry.metrics.title)issues.push('Product title missing');
          const initial=id+'-'+width+'-initial.png';
          await page.screenshot({path:path.join(OUTPUT,initial),fullPage:true,animations:'disabled',timeout:26000});
          entry.initialScreenshot=initial;
          if(width===390){
            entry.interactions=await interactions(page,id,width);
            if(entry.interactions.length){
              const after=id+'-'+width+'-after.png';
              await page.screenshot({path:path.join(OUTPUT,after),fullPage:true,animations:'disabled',timeout:26000});
              entry.afterScreenshot=after;
              for(const test of entry.interactions){
                if(test.result.status!=='PASS')issues.push(test.name+': '+(test.result.issues?.join('; ')||test.result.reason||test.result.status));
              }
            }
          }
          entry.recentlyViewedResponses=recentlyViewedResponses.slice(-15);
          entry.javascriptErrors=pageErrors.slice(0,10);
          if(entry.javascriptErrors.length)issues.push('Page JS errors: '+entry.javascriptErrors.join('; '));
          entry.status=issues.length?'REVIEW':'PASS';
        }catch(e){entry.error=short(e);issues.push('Test error: '+entry.error);}
        report.entries.push(entry);
        console.log(width+' '+id+' '+entry.status+' '+issues.join('; ').slice(0,220));
      }
      await context.close();
    }
  }finally{await browser.close();}
}
function finish(){
  const counts={};
  for(const e of report.entries)counts[e.status]=(counts[e.status]||0)+1;
  report.summary={counts,total:report.entries.length,passed:report.entries.length>0&&report.entries.every(e=>e.status==='PASS')};
  fs.writeFileSync(path.join(OUTPUT,'results.json'),JSON.stringify(report,null,2));
  const lines=['# Dalla Terra WebKit mobile QA — live public storefront (Safari-like engine)','',
    'Date: '+report.created,'Viewport widths: '+widths.join(', '),
    'Checked: '+report.summary.total,'Results: '+JSON.stringify(counts),'',
    '| Width | Page | Verdict | SKU | MSRP | Issues |','|---:|---|---|---|---|---|'];
  for(const e of report.entries)lines.push('| '+e.width+' | '+e.id+' | '+e.status+
    ' | '+(e.metrics?.sku||'—')+' | '+(e.metrics?.msrp||'—')+
    ' | '+e.issues.join('; ').replace(/\|/g,'\\|')+' |');
  lines.push('','These are Playwright WebKit mobile emulation checks on Linux, NOT actual iOS Safari, authenticated checkout, payment, or physical iPhone/device testing.');
  fs.writeFileSync(path.join(OUTPUT,'report.md'),lines.join('\n'));
  console.log('SUMMARY '+JSON.stringify(report.summary));
  return report.summary.passed?0:1;
}
main().then(()=>{process.exitCode=finish();}).catch(e=>{
  report.runnerError=short(e);console.error('RUNNER ERROR '+report.runnerError);finish();process.exitCode=2;
});
