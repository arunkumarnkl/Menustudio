// Browser-only release checks for new access and export UX. The API is mocked.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

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
let clientApproved=false;
function json(route,obj,status=200){return route.fulfill({status,contentType:'application/json',body:JSON.stringify(obj),headers:{'access-control-allow-origin':origin,'access-control-allow-headers':'*'}});}
async function network(route){
 const request=route.request(),url=new URL(request.url()),path=url.pathname;
 if(url.pathname.endsWith('/html2pdf.bundle.min.js'))return route.fulfill({status:200,contentType:'application/javascript',body:readFileSync('node_modules/html2pdf.js/dist/html2pdf.bundle.min.js')});
 if(url.origin===origin)return route.continue();
 if(url.hostname==='ragasaan-security-api.arunkumarnkl.workers.dev'){
   if(path==='/client/view')return json(route,{event:{name:'Private wedding',venue:'Event venue',eventDate:'2026-11-18',menu:[],sessions:[],items:[]},clientFormats:['half-a4','a4'],expiresAt:'2027-11-01T00:00:00Z',canPrint:clientApproved});
   if(path==='/me')return json(route,{id:'admin-1',email:'admin@test.invalid',name:'Test Admin',role:'admin'});
   if(path==='/events')return json(route,{events:mockEvents});
   if(path==='/users/planners'&&request.method()==='POST')return json(route,{id:'planner-created',role:'planner'},201);
   if(path==='/users/planners')return json(route,{planners:[{id:'p1',display_name:'Planner One',email:'one@test.invalid',active:1},{id:'p2',display_name:'Planner Two',email:'two@test.invalid',active:1}]});
   if(path==='/users')return json(route,{users:[{id:'admin-1',display_name:'Test Admin',email:'admin@test.invalid',role:'admin',active:1}]});
   if(path==='/admin/feedback-copy')return json(route,{title:'We Value Your Feedback',message:'Tell us about the evening.'});
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

 // Staff design theme: exercise the real gallery click and the visible A4 preview.
 const themeTest=await setupPage(true);
 const tp=themeTest.page;
 await tp.evaluate(()=>switchTab('design'));
 await tp.locator('#rs-theme-gallery .raga-theme-card').first().waitFor({state:'visible',timeout:30000});
 const themeBefore=await tp.evaluate(()=>({
  saveExposed:typeof window.saveStyle,
  color:state.designs.a4.accentColor,
  previewCount:document.querySelectorAll('#paper-render-target .print-sheet').length
 }));
 await tp.locator('#rs-theme-gallery .raga-theme-card').nth(1).click();
 const themeAfter=await tp.evaluate(()=>({
  active:window.ragaActiveThemeId,
  activeCard:document.querySelector('#rs-theme-gallery .raga-theme-card.active')?.innerText,
  color:state.designs.a4.accentColor,
  saved:JSON.parse(localStorage.getItem('ragasaan_theme_styles_v1')||'{}').designs?.a4?.accentColor,
  previewText:document.querySelector('#paper-render-target')?.innerHTML.slice(0,15000)
 }));
 console.log('STAFF THEME DIAGNOSTICS',JSON.stringify({before:themeBefore,after:{...themeAfter,previewText:themeAfter.previewText?.includes(themeAfter.color)}}));
 assert.notEqual(themeAfter.color,themeBefore.color,'Theme selection changes the print accent colour');
 assert.equal(themeAfter.saved,themeAfter.color,'Theme selection persists the print accent colour');
 assert.ok(themeAfter.previewText.includes(themeAfter.color),'Preview uses the newly selected accent colour');
 await tp.reload({waitUntil:'domcontentloaded'});
 await tp.waitForTimeout(500);
 assert.equal(await tp.evaluate(()=>state.designs.a4.accentColor),themeAfter.color,'Selected theme survives browser reload');
 console.log('PASS Staff gallery click changes preview and persists across reload');
 await themeTest.context.close();

 // Approved client route: click a theme and download an actual PDF.
 clientApproved=true;
 const approved=await setupPage(false,'#client='+token);
 await approved.page.locator('#rs-client-save-pdf').waitFor({state:'visible',timeout:30000});
 assert.equal(await approved.page.locator('#rs-client-save-pdf').isEnabled(),true,'Approved client can download PDF');
 const clientThemes=approved.page.locator('#rs-client-themes .raga-theme-card');
 assert.ok(await clientThemes.count()>1,'Client theme presets rendered');
 await clientThemes.nth(1).click();
 assert.ok(await clientThemes.nth(1).evaluate(n=>n.classList.contains('active')),'Client theme click updates active style');
 const clientSheets=await approved.page.locator('#rs-client-paper .print-sheet').count();
 assert.ok(clientSheets>0,'Approved client has menu preview sheets');
 const [clientDownload]=await Promise.all([
   approved.page.waitForEvent('download',{timeout:120000}),
   approved.page.locator('#rs-client-save-pdf').click()
 ]);
 const clientBytes=readFileSync(await clientDownload.path());
 console.log('CLIENT PDF CAPTURE METRICS',JSON.stringify(await approved.page.evaluate(()=>window.__clientPdfCaptureMetrics)));
 console.log('CLIENT PDF CANVAS METRICS',JSON.stringify(await approved.page.evaluate(()=>window.__clientPdfCanvasMetrics)));
 assert.ok(clientBytes.subarray(0,5).toString('ascii')==='%PDF-','Client PDF has correct file signature');
 assert.ok(clientBytes.length>10000,'Client PDF may be blank: '+clientBytes.length+' bytes');
 console.log('PASS Approved client changes theme and downloads actual PDF:',clientBytes.length,'bytes');
 await approved.context.close();
 clientApproved=false;

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
 await page.locator('#rs-new-planner-name').fill('New Planner');
 await page.locator('#rs-new-planner-email').fill('new.planner@test.invalid');
 await page.locator('#rs-new-planner-password').fill('SamplePassphrase2026!');
 await page.locator('#rs-create-planner').click();
 await page.locator('#rs-new-planner-status').getByText(/created successfully/i).waitFor({state:'visible',timeout:20000});
 console.log('PASS Browser: Create Event Planner returns explicit confirmation');
 await page.locator('#rs-close-admin').click();
 console.log('PASS Browser: latest 20 cloud events, planner filter and standalone Admin settings');

 // Staff theme click must update all print designs, persist in localStorage and survive reload.
 await page.locator('#tab-btn-builder').click();
 const staffThemes=page.locator('#rs-theme-gallery .raga-theme-card');
 await staffThemes.first().waitFor({state:'visible',timeout:20000});
 assert.ok(await staffThemes.count()>1,'Staff theme presets rendered');
 await staffThemes.nth(1).click();
 const savedTheme=await page.evaluate(()=>{
   const saved=JSON.parse(localStorage.getItem('ragasaan_theme_styles_v1')||'{}');
   return {selected:window.ragaActiveThemeId,design:saved.designs?.a4,current:state.designs.a4};
 });
 assert.ok(savedTheme.selected,'Selected theme recorded');
 assert.equal(savedTheme.design.borderColor,savedTheme.current.borderColor,'Theme styling saved to local storage');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForTimeout(850);
 const storedTheme=await page.evaluate(()=>JSON.parse(localStorage.getItem('ragasaan_theme_styles_v1')||'{}').designs?.a4?.borderColor);
 assert.equal(storedTheme,savedTheme.current.borderColor,'Theme style persists after page reload');
 console.log('PASS Staff theme selection updates format style and persists after reload');

 await page.evaluate(()=>{window.__printCount=0;window.print=()=>{window.__printCount++};});
 await page.evaluate(()=>{
  const breakfast=eventSessions.find(row=>row.id==='breakfast')||eventSessions[0];
  eventRecords.push({id:'pdf-sample',eventUid:'pdf-sample',sessionId:breakfast.id,menuCourse:'Other',
    name:'Bright Strawberry Salad with Almonds',desc:'Fresh berries, toasted almonds and creamy dressing',
    allergens:['Tree nuts','Milk'],mayContain:['Eggs'],printFormats:['a4'],manual:true});
  state.layout='a4';state.design=state.designs.a4;
  state.design.showDescription=true;
  normalizeEventFormatRecords();renderPreview();
 });
 const pdfDiagnostic=await page.evaluate(()=>{const root=document.querySelector('#paper-render-target');const sheets=[...root.querySelectorAll('.print-sheet')];return {sheetCount:sheets.length,text:sheets.map(s=>s.innerText.slice(0,160)),sizes:sheets.map(s=>({width:s.getBoundingClientRect().width,height:s.getBoundingClientRect().height,display:getComputedStyle(s).display,visibility:getComputedStyle(s).visibility})),layout:state.layout,records:eventRecords.length};});
 console.log('PDF DIAGNOSTICS',JSON.stringify(pdfDiagnostic));
 assert.equal(await page.evaluate(()=>typeof window.html2pdf),'function','Real html2pdf.js library is available');
 const [pdfDownload]=await Promise.all([
   page.waitForEvent('download',{timeout:120000}),
   page.evaluate(()=>downloadPDF())
 ]);
 const pdfPath=await pdfDownload.path(),pdfBytes=readFileSync(pdfPath);
 console.log('PDF EXPORT METRICS',JSON.stringify(await page.evaluate(()=>window.__lastPdfExportMetrics)));
 assert.ok(pdfBytes.subarray(0,5).toString('ascii')==='%PDF-','Downloaded file is a real PDF');
 assert.ok(pdfBytes.length>10000,'Populated PDF seems blank or incomplete: '+pdfBytes.length+' bytes');
 assert.equal(await page.evaluate(()=>window.__printCount),0,'PDF Save does not launch native Print');
 console.log('PASS Real html2pdf.js conversion produces a downloadable PDF without invoking Print, bytes:',pdfBytes.length);
 await page.evaluate(()=>switchTab('export'));
 await page.screenshot({path:'browser-smoke/final-update-export.png'});
 const bounds=await page.evaluate(()=>{
  const left=document.querySelector('#sidebar-controls').getBoundingClientRect();
  const right=document.querySelector('#preview-main-panel').getBoundingClientRect();
  return {left:left.width,right:right.width,visible:!document.querySelector('#preview-main-panel').classList.contains('hidden')};
 });
 assert.ok(bounds.visible&&bounds.right>bounds.left*2,'Final Preview uses most of the screen: '+JSON.stringify(bounds));
 console.log('PASS Browser: independent PDF download, no Print dialog, preview right pane',bounds);
 // Generate an actual editable DOCX, inspect its OOXML to catch corrupted or
 // misaligned column tables before any production publishing.
 await page.evaluate(()=>{
   const dinner=eventSessions.find(row=>row.id==='dinner')||eventSessions[0];
   eventRecords.push({id:'docx-test',eventUid:'docx-test',sessionId:dinner.id,menuCourse:'Main Course',
     name:'Test Wedding Pasta',desc:'Fresh Italian herbs',allergens:['Milk'],mayContain:['Eggs'],
     printFormats:['half-a4'],tagCopies:{},manual:true});
   normalizeEventFormatRecords();
 });
 const [wordDownload]=await Promise.all([
   page.waitForEvent('download',{timeout:30000}),
   page.evaluate(()=>window.RagasaanWordActions.exportFormatWord('half-a4'))
 ]);
 const wordPath=await wordDownload.path();
 assert.ok(wordPath,'DOCX download available to browser');
 const xml=execFileSync('unzip',['-p',wordPath,'word/document.xml'],{encoding:'utf8'});
 assert.match(xml,/<w:document /);
 assert.match(xml,/<w:tblLayout w:type="fixed"\/>/);
 assert.match(xml,/<w:trHeight w:val="13100" w:hRule="atLeast"\/>/);
 assert.match(xml,/<w:vAlign w:val="center"\/>/);
 assert.match(xml,/<w:vAlign w:val="top"\/>/);
 assert.match(xml,/Test Wedding Pasta/);
 assert.match(xml,/Milk/);
 assert.equal((xml.match(/<w:tbl>/g)||[]).length,2,'Table Menu front and reverse have two balanced tables');
 console.log('PASS Browser-generated Word document opens as valid OOXML and includes aligned front/back table cards');
 await staff.context.close();
 // API mocks do not verify live Worker/D1, only browser presentation and contract usage.
 if(errors.length)console.log('Browser captured script exceptions:',errors.slice(0,6));
}finally{await chrome.close();}
