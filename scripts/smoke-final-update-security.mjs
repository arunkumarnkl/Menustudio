// Browser-only release checks for new access and export UX. The API is mocked.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base=process.env.MENUSTUDIO_URL||'http://127.0.0.1:8765/';
const chrome=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const origin=new URL(base).origin;
const token='a'.repeat(64);
const mockEvents=Array.from({length:26},(_,i)=>({
 id:String(i+1).padStart(8,'0')+'-1111-4111-8111-111111111111',
 name:'Planner event '+String(i+1).padStart(2,'0'),
 status:'draft',
 eventDate:'2026-11-'+String(i%25+1).padStart(2,'0'),
 updatedAt:new Date(Date.now()-i*60*1000).toISOString(),
 plannerUserId:i%2?'p2':'p1',
 createdBy:i%2?'p2':'p1',
 eventData:{plannerName:i%2?'Planner Two':'Planner One',items:[],sessions:[]}
}));
const errors=[];
function json(route,obj,status=200){return route.fulfill({status,contentType:'application/json',body:JSON.stringify(obj),headers:{'access-control-allow-origin':origin,'access-control-allow-headers':'*'}});}
async function network(route){
 const request=route.request(),url=new URL(request.url()),path=url.pathname;
 if(url.origin===origin)return route.continue();
 if(url.hostname==='ragasaan-security-api.arunkumarnkl.workers.dev'){
   if(path==='/client/view')return json(route,{event:{name:'Private wedding',venue:'Event venue',eventDate:'2026-11-18',menu:[],sessions:[],items:[]},clientFormats:['half-a4','a4'],expiresAt:'2027-11-01T00:00:00Z',canPrint:false});
   if(path==='/me')return json(route,{id:'admin-1',email:'admin@test.invalid',name:'Test Admin',role:'admin'});
   if(path==='/events')return json(route,{events:mockEvents});
   if(path==='/users/planners')return json(route,{planners:[{id:'p1',display_name:'Planner One',email:'one@test.invalid',active:1},{id:'p2',display_name:'Planner Two',email:'two@test.invalid',active:1}]});
   if(path==='/users')return json(route,{users:[{id:'admin-1',display_name:'Test Admin',email:'admin@test.invalid',role:'admin',active:1}]});
   if(path==='/admin/feedback-copy')return json(route,{title:'We Value Your Feedback',message:'Tell us about the evening.'});
   if(path==='/users/planners'&&request.method()==='POST')return json(route,{id:'planner-created',role:'planner'},201);
   if(path.startsWith('/public/'))return json(route,{image:''});
   return json(route,{settings:{},available:{mealSpecs:{},serviceTypes:[]},planners:[],events:[],formats:['a4']});
 }
 return route.abort();
}
async function setupPage(withAuth,hash=''){
 const context=await chrome.newContext({viewport:{width:1440,height:900}});
 if(withAuth)await context.addInitScript(value=>{
  sessionStorage.setItem('raga_session',JSON.stringify({token:value,expiresAt:new Date(Date.now()+3600000).toISOString()}));
 },token);
 const page=await context.newPage();
 page.on('pageerror',err=>errors.push(String(err)));
 await page.route('**/*',network);
 await page.goto(base+hash,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(400);
 return {page,context};
}
try{
 // Client invitation: no Planner, Admin or unrestricted cloud navigation exposed.
 const client=await setupPage(false,'#client='+token);
 const p=client.page;
 await p.locator('#rs-client-panel').waitFor({state:'visible',timeout:30000});
 assert.equal(await p.locator('#rs-client-print').isDisabled(),true,'Print requires approved event');
 assert.equal(await p.locator('#rs-client-save-pdf').isDisabled(),true,'PDF requires approved event');
 assert.equal(await p.locator('#ragasaan-cloud').evaluate(n=>n.classList.contains('open')),false);
 assert.equal(await p.locator('#ragasaan-admin').evaluate(n=>n.classList.contains('open')),false);
 assert.equal(await p.locator('body').evaluate(n=>n.classList.contains('ragasaan-locked')),true);
 assert.equal(await p.locator('#tab-builder').isVisible(),false,'Client sees no unrestricted menu builder');
 await client.context.close();
 console.log('PASS Browser client token is isolated to design/preview, print disabled before approval');

 const staff=await setupPage(true);
 const page=staff.page;
 await page.locator('#rs-open-cloud').click();
 await page.locator('#rs-cloud-events .raga-cloud-record').first().waitFor({state:'attached',timeout:30000});
 assert.equal(await page.locator('#rs-cloud-events .raga-cloud-record').count(),20,'Library default shows 20');
 await page.locator('#rs-cloud-planner-filter').selectOption('Planner Two');
 assert.equal(await page.locator('#rs-cloud-events .raga-cloud-record').count(),13,'Planner filter shows all 13 of another planner');
 await page.locator('#rs-close-cloud').click();
 await page.locator('#rs-open-admin-qr').click();
 assert.equal(await page.locator('#ragasaan-admin').evaluate(n=>n.classList.contains('open')),true);
 assert.equal(await page.locator('#ragasaan-cloud').evaluate(n=>n.classList.contains('open')),false);
 assert.equal(await page.locator('#rs-feedback-copy-save').count(),1,'Feedback belongs to Admin');
 assert.equal(await page.locator('#raga-feedback-copy-editor').count(),1);
 await page.locator('#rs-close-admin').click();
 console.log('PASS Browser: latest 20 cloud events, planner filter and standalone Admin settings');

 await page.evaluate(()=>{window.__printCount=0;window.print=()=>{window.__printCount++};});
 const pdf=await page.evaluate(async()=>{
  window.html2pdf=()=>({set(){return this;},from(){return this;},save(){return Promise.resolve();}});
  state.layout='a4';state.design=state.designs.a4;normalizeEventFormatRecords();renderPreview();
  const result=await downloadPDF();
  return {result,printCount:window.__printCount,status:document.getElementById('raga-pdf-status')?.textContent};
 });
 assert.equal(pdf.result,true,'PDF action completes with converter');
 assert.equal(pdf.printCount,0,'PDF Save never triggers native Print dialog');
 assert.match(pdf.status,/saved/i);
 await page.evaluate(()=>switchTab('export'));
 await page.screenshot({path:'browser-smoke/final-update-export.png'});
 const bounds=await page.evaluate(()=>{
  const left=document.querySelector('#sidebar-controls').getBoundingClientRect();
  const right=document.querySelector('#preview-main-panel').getBoundingClientRect();
  return {left:left.width,right:right.width,visible:!document.querySelector('#preview-main-panel').classList.contains('hidden')};
 });
 assert.ok(bounds.visible&&bounds.right>bounds.left*2,'Final Preview uses most of the screen: '+JSON.stringify(bounds));
 console.log('PASS Browser: independent PDF download, no Print dialog, preview right pane',bounds);
 await staff.context.close();
 // API mocks do not verify live Worker/D1, only browser presentation and contract usage.
 if(errors.length)console.log('Browser captured script exceptions:',errors.slice(0,6));
}finally{await chrome.close();}
