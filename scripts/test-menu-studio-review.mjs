import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('index.html','utf8');
const client=fs.readFileSync('security-app.js','utf8');
const worker=fs.readFileSync('security/review-only-security-worker.js','utf8');
const pass=(label,condition)=>{assert.ok(condition,label); console.log('PASS',label)};
const section=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Section bounds '+start);return html.slice(a,b)};

// Parse ALL inline application scripts. No network or deployment required.
let inlineCount=0;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=/.test(m[1])||/\btype\s*=\s*["'](?:module|application\/json)/.test(m[1]))continue;
  if(m[2].trim()){new vm.Script(m[2],{filename:'index.html inline '+(++inlineCount)});}
}
new vm.Script(client,{filename:'security-app.js'});
new vm.Script(worker.replace('export default {','const stagedWorker = {'),{filename:'worker reference'});
pass('JavaScript syntax: '+inlineCount+' inline scripts, client and Worker reference',inlineCount>=5);

// Validate selected pure functions against realistic input data.
const courseSrc=section('function courseDisplay(session,course){','function normalizeGroupService(session,course){');
const course=vm.runInNewContext('('+courseSrc.trim()+')',{isCourseWise:s=>!!s.courseWise});
assert.equal(course({courseWise:false},'Main Course'),'Mains Menu');
assert.equal(course({courseWise:false},'Dessert'),'Desserts');
pass('Non-plated main and dessert labels are independent',true);
pass('Redundant General / Buffet Items removed',!html.includes('General / Buffet Items'));
pass('A4 non-plated menu has distinct printed headings',html.includes('const collectionHtml=session&&!isCourseWise(session)?records.map'));
pass('Plated and Buffet-Selective print restrictions exist',html.includes("if(mode==='Plated Service')allowed=['half-a4']")&&html.includes("if(mode==='Buffet-Selective'&&normalizeGroupService(session,category)==='Plated Service')allowed=['half-a4']"));

pass('Allergen tick editors and confirmation present',html.includes('function ragaTickMarkup')&&html.includes('function ragaCardTicks')&&html.includes('data-raga-manual-check')&&html.includes('data-summary-allergen-field'));
pass('Dish font 15 and allergen font 12 defaults',html.includes('dishNameFontSize:15, descFontSize:10, allergenFontSize:12'));
pass('Preview drag controls are positioned, not allocated layout space',html.includes('.raga-drag-handle{position:absolute!important'));
pass('Preview-only empty lines collapse',html.includes('.print-sheet .leading-tight:empty'));
pass('FoldTags use equal halves',html.includes('const topHeight=3;')&&html.includes('height:3cm;flex:0 0 50%'));
pass('Existing A8, FoldTags and Canape sheet identifier retained',html.includes('raga-tag-sheet-session')&&html.includes("if(fmt!=='a6-grid' && tagSession)"));
pass('Print Studio has final preview and page navigation',html.includes('raga-studio-page-choice')&&html.includes('window.ragaStudioChoose')&&html.includes('raga-preview-only-hidden'));
pass('Event Summary has dedicated Instant Print route',html.includes("if(document.getElementById('tab-summary')&&!document.getElementById('tab-summary').classList.contains('hidden')){printEventSummary();return;}"));

// Exercise the filename generator without DOM/browser dependencies.
const fileNameSrc=section('function ragaDownloadFilename(original){','function saveBlob(blob, filename) {');
const sandbox={document:{getElementById:()=>({value:'2026-11-25'})},state:{event:{venue:'North Mymms Park, Hertfordshire WD7 8PJ'}}};
vm.runInNewContext(fileNameSrc+'globalThis.ragaDownloadFilename=ragaDownloadFilename;',sandbox);
assert.equal(sandbox.ragaDownloadFilename('Menu_A4.docx'),'25-11-North Mymms Park.docx');
pass('Word filename removes full venue address and format suffix',true);
pass('Word regular menu item has no ordinal; summary still uses numbers',html.includes("const out=[w.paragraph(String(item.name||'Unnamed dish')")&&html.includes("cols[idx].push(w.paragraph(`${++num}."));
pass('Word two-column layout uses fixed geometry',html.includes('<w:tblLayout w:type="fixed"/>')&&html.includes('<w:vAlign w:val="top"/>'));

pass('Cloud records sorted then limited to latest five in UI',client.includes('const visible=s.cloudShowArchive?sorted:sorted.slice(0,5)'));
pass('Cloud planner filter and older-record archive exist',client.includes('rs-cloud-planner-filter')&&client.includes('rs-cloud-archive-toggle'));
pass('All records retained in client state, not deleted by five-row display',client.includes('s.events=r.events||[];'));
pass('Feedback heading and message editable on print preview',html.includes('data-preview-text="feedbackTitle"')&&html.includes('data-preview-text="feedbackMessage"'));
pass('Feedback editable in Print Studio without a QR image',html.includes('raga-feedback-title-input')&&html.includes('raga-feedback-message-input')&&html.includes('ragaUpdateFeedbackCopy'));
pass('Feedback text persisted and included in editable Word',html.includes("'feedbackTitle','feedbackMessage'")&&html.includes("w.paragraph(d.feedbackTitle ?? 'We Value Your Feedback'")&&html.includes("w.paragraph(d.feedbackMessage ?? 'Thank you for celebrating with us."));
pass('Feedback fields and editor have no dedicated print spacing',html.includes('id="raga-feedback-copy-editor" class="no-print'));
pass('Review-only Worker provides saved timestamps',worker.includes('createdAt:event.created_at,updatedAt:event.updated_at'));
pass('Review-only Worker orders both cloud list routes by latest update',worker.split('ORDER BY COALESCE(updated_at,created_at) DESC,created_at DESC LIMIT 500').length-1===2);
pass('Company logo publishing automatically resizes high-resolution files',client.includes('async function companyLogoData(file)')&&client.includes('canvas.toDataURL(\'image/webp\'')&&client.includes('canvas.toDataURL(\'image/jpeg\''));
pass('Company logo publishing checks the stored D1 logo before claiming success',client.includes("const published=await fetchCompanyLogo()")&&client.includes('Company logo published and verified for all menus'));
pass('Company logo publishing surfaces API failures beside uploader',client.includes("companyLogoStatus('Company logo was not confirmed as published: "));
pass('Company logo publishing remains admin-only',client.includes("if(s.user?.role!=='admin'){companyLogoStatus"));
pass('Feedback heading and message remain editable in print and Word',html.includes('raga-feedback-title-input')&&html.includes('raga-feedback-message-input')&&html.includes('data-preview-text="feedbackTitle"')&&html.includes('data-preview-text="feedbackMessage"')&&html.includes("d.feedbackTitle ?? 'We Value Your Feedback'"));
console.log('REVIEW CHECKS COMPLETE. Real browser, D1 and Word/PDF layout checks are required before production deployment.');
