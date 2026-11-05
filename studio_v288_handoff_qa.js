/* DT8 V288 handoff: browser-only assertions. No emails, orders, invoice, or server-action writes. */
const {chromium,webkit}=require('playwright');
const fs=require('fs');
const BASE='https://www.dallaterra.ca';
const STUDIO_ROUTE=process.argv.includes('--production')?'/shower-calculator':'/hydroblok-planner-v3-preview?layout_lab=1';
const PASSWORD=process.env.DT_QA_TEST_PASSWORD;
if(!PASSWORD)throw Error('Existing encrypted test credential unavailable.');
const output={version:'DT8_V288',date:new Date().toISOString(),engines:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function check(engine){
 const browser=await(engine==='webkit'?webkit:chromium).launch(engine==='chromium'&&process.argv.includes('--chrome-channel')?{headless:true,channel:'chrome'}:{headless:true});
 const context=await browser.newContext({viewport:{width:1200,height:900},locale:'en-CA'});
 const page=await context.newPage(),out={engine,checks:{},notes:[],errors:[]};
 page.on('pageerror',err=>out.errors.push(String(err.message||err).slice(0,180)));
 const ok=(label,val,detail)=>{out.checks[label]=!!val;if(!val)out.notes.push(label+': '+JSON.stringify(detail||{}).slice(0,1200));};
 try{
  // Any unexpected server-side write is forbidden. Auth sign-in is the only permitted POST.
  await page.route('**/web/dataset/call_kw/ir.actions.server/run',route=>route.abort());
  await page.route('**/website/action/1771',route=>route.abort());
  const guest=await page.goto(BASE+STUDIO_ROUTE,
   {waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>!!document.getElementById('dt8_price_bom'),{timeout:25000});
  const g=await page.evaluate(()=>({
   guest:window.hbIsGuest,quoteButtons:document.querySelectorAll('#add_to_quote_btn').length,
   key:window.hbCartStorageKey,publicPrice:window.hydroblokCatalog?.HBWB366012?.price,
   oldHandoffHidden:!!document.getElementById('sf251_quote_action')?
       getComputedStyle(document.getElementById('sf251_quote_action')).display==='none':true}));
  ok('guest_http_and_no_order_action',guest?.status()===200&&g.guest===true&&g.quoteButtons===0,g);
  ok('guest_public_msrp',Number(g.publicPrice)===74.70,g);

  // V289: required drain must visibly and functionally disable forward navigation.
  await page.waitForFunction(()=>!!window.sfHBV135?.status&&!!window.sfHBV282Repair&&
    !!window.sfHBV48?.status&&!!window.sfHBV31C?.show,{timeout:25000});
  await page.evaluate(()=>window.sfHBV31C.show('start',false));
  await sleep(550);
  const beforeDrain=await page.evaluate(()=>{
    const b=document.querySelector('.sf-v31-flow-next button.sf-v31-primary');
    const f=document.querySelector('#sf_v133_floating_actions .sf-v133-next');
    return {stage:document.getElementById('wrap')?.dataset.v31Stage,
      explicit:window.sfHBV135?.status?.()?.explicitDrainChosen,
      nativeDisabled:b?.disabled,colour:b?getComputedStyle(b).backgroundColor:null,
      floatingDisabled:f?.disabled,cssPresent:!!document.getElementById('dt8_v289_drain_next_disabled')};
  });
  ok('v289_required_drain_next_grey_and_disabled',beforeDrain.stage==='start'&&
    beforeDrain.explicit===false&&beforeDrain.nativeDisabled===true&&
    beforeDrain.colour==='rgb(165, 174, 167)'&&beforeDrain.floatingDisabled===true&&
    beforeDrain.cssPresent===true,beforeDrain);
  await page.locator('#sf48_types [data-style="linear"]').click();
  await page.locator('#sf48_locations [data-position="linear:entry"]').click();
  await sleep(750);
  const afterDrain=await page.evaluate(()=>{
    const b=document.querySelector('.sf-v31-flow-next button.sf-v31-primary');
    const f=document.querySelector('#sf_v133_floating_actions .sf-v133-next');
    return {explicit:window.sfHBV135?.status?.()?.explicitDrainChosen,
      nativeDisabled:b?.disabled,floatingDisabled:f?.disabled,
      drain:window.sfHBV48?.status?.()};
  });
  ok('v289_valid_drain_unlocks_navigation',afterDrain.explicit===true&&
    afterDrain.nativeDisabled===false&&afterDrain.floatingDisabled===false,afterDrain);

  const login=await page.goto(BASE+'/web/login?redirect=%2Fshop',{waitUntil:'domcontentloaded'});
  const form=page.locator('form.oe_login_form').first();
  await form.waitFor({state:'visible',timeout:20000});
  await form.locator('input[name="login"]').fill('test@dallaterra.ca');
  await form.locator('input[name="password"]').fill(PASSWORD);
  await form.locator('button[type="submit"]').click();
  await sleep(1200);
  const auth=await page.goto(BASE+STUDIO_ROUTE,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.dt8HBHandoffV288?.status&&!!window.sfHBV31C?.show,{timeout:25000});
  const d=await page.evaluate(()=>({
    guest:window.hbIsGuest,key:window.hbCartStorageKey,scope:window.hbVisitorScope,
    unit:window.hydroblokCatalog?.HBWB366012?.price,
    seal:window.hydroblokCatalog?.HBJSCART?.price,
    action:!!document.getElementById('add_to_quote_btn')
  }));
  ok('dealer_price_and_scoped_key',auth?.status()===200&&d.guest===false&&
      d.key==='b2b_ghost_cart_dt8_user_'+d.scope&&Number(d.unit)===41.09&&
      Number(d.seal)===11.24&&d.action,d);
  await page.evaluate(()=>window.sfHBV31C.show('review',false));
  await sleep(1500);
  let state=await page.evaluate(()=>({
    status:window.dt8HBHandoffV288.status(),
    audit:window.sfHBV259WallReview?.audit?.()?.reason,
      pending:window.sfHydroblokPreviewV5?.exportPlan?.()?.required_unquantified?.map(x=>({sku:x.sku,category:x.category,quantity:x.quantity,reason:x.reason})),
      style:document.getElementById('entry_style')?.value,
    stage:document.getElementById('wrap')?.dataset.v31Stage,
    pdf:window.sfHBV221Print?.content?.()
  }));
  if(!state.status.verified){
    // Restore the already-documented reference 72x36 factory pan configuration.
    await page.evaluate(()=>{
      const settings={pan_w:'72',pan_d:'36',entry_w:'72',entry_style:'std',
       curb_style:'std',drain_type:'offset',custom_x:'18',custom_y:'18',
       linear_loc:'back',linear_trim:'shadow',tile_thick:'38',board_thick:'12',
       hb_stud_spacing:'16',sealant_size:'cartridge'};
      for(const [key,value] of Object.entries(settings)){
        const el=document.getElementById(key);
        if(el){el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}
      }
      for(const key of ['board_3660','board_4864','board_4896']){
        const el=document.getElementById(key);if(el){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}
      }
      for(const choice of document.querySelectorAll('#niche_container select.accessory-select,#bench_container select.accessory-select')){
        choice.value='none';choice.dispatchEvent(new Event('change',{bubbles:true}));
      }
      const caddy=document.getElementById('sf_v13_caddy_wanted');
      if(caddy){caddy.checked=false;caddy.dispatchEvent(new Event('change',{bubbles:true}));}
      window.sfHBV31C?.show?.('review',false);
    });
    await sleep(1700);
    await page.evaluate(()=>window.sfHBV31C?.show?.('review',false));
    await sleep(350);
    state=await page.evaluate(()=>({
      status:window.dt8HBHandoffV288.status(),
      audit:window.sfHBV259WallReview?.audit?.()?.reason,
      pending:window.sfHydroblokPreviewV5?.exportPlan?.()?.required_unquantified?.map(x=>({sku:x.sku,category:x.category,quantity:x.quantity,reason:x.reason})),
      style:document.getElementById('entry_style')?.value,
      stage:document.getElementById('wrap')?.dataset.v31Stage,
      pdf:window.sfHBV221Print?.content?.()
    }));
  }
  ok('native_material_audit_gates_quote',state.status.verified&&state.status.materialLines>0,{status:state.status,pending:state.pending,style:state.style,audit:state.audit});
  if(state.status.verified){
    await page.evaluate(()=>window.sfHBV31C?.show?.('review',false));
    await sleep(250);
    const disclosure=await page.evaluate(()=>document.getElementById('dt8_quote_handoff_status')?.textContent||'');
    ok('unquantified_materials_explicitly_disclosed',disclosure.toLowerCase().includes('joint sealant')&&
       disclosure.toLowerCase().includes('modified thinset')&&disclosure.toLowerCase().includes('drain finish'),{disclosure:disclosure.slice(0,450)});
  }
  ok('review_stage_live',state.stage==='review',state);
  ok('pdf_available',!!state.pdf&&state.pdf.pages>=3&&
    typeof state.pdf.html==='string'&&state.pdf.html.includes('HYDRO'),{pages:state.pdf?.pages});
  if(state.status.verified){
    const dry=await page.evaluate(()=>{
      const h=window.dt8HBHandoffV288,base=h.previewCartMerge([]);
      const first=base[0],other={product_id:9999999,qty:3,price:20,name:'Other Dalla Terra item',code:'TEST'};
      const merged=h.previewCartMerge([{...first,qty:2},other]);
      const same=merged.find(x=>x.product_id===first.product_id);
      const keep=merged.find(x=>x.product_id===other.product_id);
      return {count:base.length,quantity:first.qty,after:same.qty,
        price:same.price,expectedPrice:first.price,otherPreserved:keep?.qty===3,
        exactAll:base.every(x=>merged.some(y=>y.product_id===x.product_id))};
    });
    ok('dry_run_cart_merge_preserves_existing_products',dry.after===dry.quantity+2&&
      dry.otherPreserved&&dry.exactAll&&dry.price===dry.expectedPrice,dry);
    const wrong=await page.evaluate(()=>{
      const old=window.sfHydroblokPreviewV5.exportPlan;
      window.sfHydroblokPreviewV5.exportPlan=function(){const p=old();p.company_id=2;return p;};
      let result;try{result=window.dt8HBHandoffV288.status();}finally{window.sfHydroblokPreviewV5.exportPlan=old;}
      return result;
    });
    ok('cross_company_bom_rejected',wrong.verified===false,wrong);
    const withoutPrice=await page.evaluate(()=>{
      const plan=window.sfHBV259WallReview.audit(),sku=Object.keys(plan.exported.bom)[0],
       price=window.hydroblokCatalog[sku].price;
      window.hydroblokCatalog[sku].price=0;
      let result;try{result=window.dt8HBHandoffV288.status();}finally{window.hydroblokCatalog[sku].price=price;}
      return {sku,result};
    });
    ok('unpriced_sku_rejected',withoutPrice.result.verified===false,withoutPrice);
    // Local-browser saved design only; restore the pre-test key before exit.
    const save=await page.evaluate(()=>{
      const key=window.sfHydroblokPreviewV5.storageKey,prior=localStorage.getItem(key);
      try{
        const expected=window.sfHydroblokPreviewV5.exportPlan();
        localStorage.setItem(key,JSON.stringify(expected));
        window.sfHBV31C?.show?.('review',false);
        const btn=document.getElementById('sf_v5_save');btn.click();
        const saved=JSON.parse(localStorage.getItem(key)||'null');
        return {matched:saved?.company_id===8&&saved?.website_id===1&&Object.keys(saved?.bom||{}).length>0,
          company:saved?.company_id,website:saved?.website_id,lines:Object.keys(saved?.bom||{}).length,
          key,disabled:btn.disabled,notice:document.getElementById('sf_v5_save_status')?.textContent?.slice(0,160)};
      }finally{if(prior===null)localStorage.removeItem(key);else localStorage.setItem(key,prior);}
    });
    ok('saved_design_preserved',save.matched,save);
    // Protect the test account's existing browser basket: do not click through or modify it.
    await page.evaluate(()=>{
      window.sfHBV31C?.show?.('review',false);
      window.sfHBV259WallReview?.refresh?.();
    });
    await sleep(300);
    const contract=await page.evaluate(()=>{
      const button=document.getElementById('add_to_quote_btn'),value=window.dt8HBHandoffV288.status();
      return {button:!!button,verified:value.verified,reason:value.reason,
       stage:document.getElementById('wrap')?.dataset.v31Stage,
       audit:window.sfHBV259WallReview?.audit?.()?.reason,
       label:button?.textContent?.trim(),key:window.hbCartStorageKey};
    });
    ok('quote_review_button_and_scoped_route_contract',contract.button&&contract.verified&&
      contract.label.includes('Review Quote')&&contract.key===d.key,contract);
    if(contract.verified){
      let requestedRedirect=false;
      page.on('request',req=>{try{
        if(new URL(req.url()).pathname==='/website/action/1771')requestedRedirect=true;
      }catch(_){ }});
      const prior=await page.evaluate(key=>localStorage.getItem(key),d.key);
      let clickError=null;
      try{
        page.once('dialog',dialog=>dialog.accept());
        await page.locator('#add_to_quote_btn').click({timeout:12000,noWaitAfter:true});
        await sleep(450);
      }catch(error){clickError=String(error?.message||error).slice(0,150);}
      try{
        await page.goto(BASE+STUDIO_ROUTE,{waitUntil:'domcontentloaded',timeout:35000});
      }catch(_){}
      const staged=await page.evaluate(key=>{
        const raw=localStorage.getItem(key),lines=raw?JSON.parse(raw):[];
        return {key,items:lines.length,
          valid:lines.length>0&&lines.every(x=>Number.isInteger(x.product_id)&&x.product_id>0&&
            Number.isInteger(x.qty)&&x.qty>0&&x.isSqft===false&&x.fullBoxOnly===false)};
      },d.key).catch(()=>({key:d.key,items:0,valid:false}));
      await page.evaluate(({key,prior})=>{
        if(prior===null)localStorage.removeItem(key);
        else localStorage.setItem(key,prior);
      },{key:d.key,prior}).catch(()=>{});
      ok('intercepted_real_click_stages_only_verified_account_cart',
        requestedRedirect&&staged.valid&&staged.items>=state.status.materialLines,
        {redirectAttempted:requestedRedirect,staged,clickError});
    }
  }
 }catch(e){out.notes.push('Exception: '+String(e.stack||e).slice(0,1100));}
 out.passed=Object.keys(out.checks).length>=9&&Object.values(out.checks).every(Boolean);
 await context.close();await browser.close();
 return out;
}
(async()=>{
 for(const e of (process.argv.includes('--chromium-only')?['chromium']:['chromium','webkit'])){const r=await check(e);output.engines.push(r);
  console.log(e,JSON.stringify({passed:r.passed,checks:r.checks,notes:r.notes}).slice(0,5000));}
 output.passed=output.engines.every(x=>x.passed);
 fs.mkdirSync('qa-output-v288',{recursive:true});
 fs.writeFileSync('qa-output-v288/results.json',JSON.stringify(output,null,2));
 if(!output.passed)process.exitCode=1;
})();
