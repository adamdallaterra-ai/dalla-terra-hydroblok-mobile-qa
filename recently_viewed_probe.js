'use strict';
// Read-only, public Dalla Terra diagnostic for Odoo website_sale recently-viewed RPC.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base='https://www.dallaterra.ca';
const out=path.resolve('qa-output-rpc');
fs.mkdirSync(out,{recursive:true});
const memorial='/shop/hydroblok-1/hydroblok-uncoupling-membrane-6615';
const slugs=[
 '/shop/category/hydroblok-1',
 '/shop/hydroblok-1/hydroblok-wallboard-and-panels-6604',
 '/shop/hydroblok-1/hydroblok-standard-drain-shower-pans-6621',
 '/shop/hydroblok-1/hydroblok-invisible-drain-shower-pan-extensions-6623',
 '/shop/hydroblok-1/hydroblok-niches-6606',
 '/shop/hydroblok-1/hydroblok-sealant-6608',
 '/shop/hydroblok-1/hydroblok-invisible-drain-shower-pans-6620',
 '/shop/hydroblok-1/hydroblok-standard-drain-shower-pan-extensions-6622',
 '/shop/hydroblok-1/hydroblok-invisible-drain-trims-6600',
 '/shop/hydroblok-1/hydroblok-drain-covers-6611',
 '/shop/hydroblok-1/hydroblok-benches-6607',
 '/shop/hydroblok-1/hbld73-hydroblok-invisible-drain-kit-6598',
 '/shop/hydroblok-1/hydroblok-invisible-drain-accessories-6602',
 '/shop/hydroblok-1/hbdsc-hydro-blok-diamond-shampoo-caddy-8-x-8-38942',
 '/shop/hydroblok-1/hydroblok-screws-and-washers-6610',
 '/shop/hydroblok-1/hydroblok-pipe-valve-seals-6613',
 '/shop/hydroblok-1/hydroblok-sealant-accessories-6614',
 '/shop/hydroblok-1/hydroblok-curbs-6605',
 '/shop/hydroblok-1/hbsr1272-hydro-blok-ez-access-shower-ramp-12-x-72-38941',
 '/shop/hydroblok-1/hydroblok-sealant-guns-6609',
 memorial
];
async function one(kind,mode){
 const record={engine:kind,mode,visited:[],errors:[],rpc:[],failedRequests:[],consoleErrors:[],product:null};
 const browser=await (kind==='webkit'?webkit:chromium).launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:'en-CA'});
  const page=await context.newPage();
  page.on('pageerror',e=>record.errors.push(String(e?.message||e).slice(0,450)));
  page.on('requestfailed',req=>{if(req.url().includes('recently_viewed_update'))record.failedRequests.push({url:req.url().slice(0,180),errorText:req.failure()?.errorText||''});});
  page.on('console',msg=>{if(msg.type()==='error' && msg.text().includes('recently_viewed_update'))record.consoleErrors.push(msg.text().slice(0,400));});
  const pending=[];
  page.on('response',r=>{
   if(!r.url().includes('/shop/products/recently_viewed_update'))return;
   const task=(async()=>{
    const item={status:r.status(),method:r.request().method(),path:'/shop/products/recently_viewed_update'};
    try{
      const json=await r.json();
      if(json.error){item.hasError=true;item.name=String(json.error?.data?.name||'').slice(0,180);item.message=String(json.error?.data?.message||json.error?.message||'').slice(0,300);}
      else item.hasError=false;
    }catch{item.parse='failed';}
    record.rpc.push(item);
   })();
   pending.push(task);
  });
  const visits=mode==='fresh'?[memorial]:slugs.slice(0,7);
  for(const slug of visits){
   const response=await page.goto(base+slug,{waitUntil:'domcontentloaded',timeout:40000});
   await page.waitForTimeout(2600); // Deliberately allow lazy recently-viewed JSON-RPC to finish before leaving.
   record.visited.push({product:slug.split('/').pop(),http:response?.status()||0,jsErrorCount:record.errors.length});
  }
  await Promise.allSettled(pending);
  record.product=await page.evaluate(()=>({
   width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
   sku:document.querySelector('#dt8-hb-sku')?.textContent?.trim()||'',
   price:document.querySelector('#dt8-hb-primary')?.textContent?.trim()||'',
   description:document.querySelector('#product_full_description')?.textContent?.trim()||''
  }));
  await context.close();
 }catch(e){record.testError=String(e?.message||e).slice(0,380);}
 finally{await browser.close().catch(()=>{});}
 return record;
}
async function main(){
 const runs=[];
 for(const engine of ['webkit','chromium']){
  for(const mode of ['fresh','warm']){
   const result=await one(engine,mode);
   runs.push(result);
   console.log(engine+' '+mode+' visited='+result.visited.length+' errors='+result.errors.length+' failedRequests='+result.failedRequests.length+' rpc_errors='+result.rpc.filter(r=>r.hasError).length);
  }
 }
 const summary={runs:runs.length,auth:'guest',site:'www.dallaterra.ca',incidents:runs.filter(x=>x.errors.length||x.failedRequests.length||x.rpc.some(v=>v.hasError)).map(x=>({engine:x.engine,mode:x.mode,errors:x.errors.length,failedRequests:x.failedRequests.length,rpcErrors:x.rpc.filter(v=>v.hasError).length}))};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({summary,runs},null,2));
 fs.writeFileSync(path.join(out,'report.md'),'# Recently-viewed RPC diagnostic\n\n'+JSON.stringify(summary,null,2)+'\n\nRead-only public Odoo website_sale diagnostic. Successful HTTP 200 does not guarantee JSON-RPC success.');
}
main().catch(e=>{console.error('PROBE ERROR '+String(e?.message||e).slice(0,160));process.exitCode=2;});