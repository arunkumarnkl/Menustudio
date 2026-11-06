/* Ragasaan Menu Studio — security and collaboration integration, 2026-11.
   No secrets in this file. D1 permissions are enforced in the security Worker.
   Session token stays in sessionStorage only. Client tokens travel in URL fragments.
*/
(() => {
'use strict';
const API='https://ragasaan-security-api.arunkumarnkl.workers.dev';
const FMT=['a4','a4-live','half-a4','a8-grid','foldtags-grid','a6-grid','canape-grid'];
const CLIENT_PRINT_FORMATS=['a4','a6-grid','a4-live','half-a4'];
const FN={'a4':'Buffet A4','a4-live':'Live Station','half-a4':'Table Menu Card','a8-grid':'A8 Tags','foldtags-grid':'FoldTags','a6-grid':'A6 Tags','canape-grid':'Canapé Labels'};
const PRESETS=[{"id":"executive-ivory","name":"Executive Ivory","kind":"professional","titleFont":"font-serif","bodyFont":"font-sans","textColor":"#24272d","accentColor":"#8b7551","borderColor":"#b5a78b","borderStyle":"solid","borderWidth":0.7,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"midnight-premier","name":"Midnight Premier","kind":"professional","titleFont":"font-montserrat","bodyFont":"font-sans","textColor":"#18243a","accentColor":"#2d5172","borderColor":"#456982","borderStyle":"double","borderWidth":1.1,"frameMotif":"art-deco","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"modern-minimal","name":"Modern Minimal","kind":"professional","titleFont":"font-sans","bodyFont":"font-sans","textColor":"#111827","accentColor":"#475569","borderColor":"#64748b","borderStyle":"solid","borderWidth":0.3,"frameMotif":"none","titleFontSize":19,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"heritage-burgundy","name":"Heritage Burgundy","kind":"professional","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#38252b","accentColor":"#70283c","borderColor":"#a47483","borderStyle":"double","borderWidth":1,"frameMotif":"corner-flourish","titleFontSize":22,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"botanical-emerald","name":"Botanical Emerald","kind":"professional","titleFont":"font-cormorant","bodyFont":"font-sans","textColor":"#20392e","accentColor":"#33755e","borderColor":"#7d9e8d","borderStyle":"solid","borderWidth":0.8,"frameMotif":"botanical","titleFontSize":21,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"slate-gold","name":"Slate & Gold","kind":"professional","titleFont":"font-montserrat","bodyFont":"font-sans","textColor":"#202835","accentColor":"#987637","borderColor":"#aa904f","borderStyle":"double","borderWidth":1.2,"frameMotif":"art-deco","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"romantic-blush","name":"Romantic Blush","kind":"wedding","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#573d47","accentColor":"#b67789","borderColor":"#cfa5b0","borderStyle":"double","borderWidth":0.9,"frameMotif":"corner-flourish","titleFontSize":25,"dishNameFontSize":14,"descFontSize":12,"allergenFontSize":10,"weightGroup":"mild"},{"id":"royal-wedding","name":"Royal Wedding","kind":"wedding","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#2c2532","accentColor":"#a07b35","borderColor":"#beaa76","borderStyle":"double","borderWidth":1.3,"frameMotif":"art-deco","titleFontSize":23,"dishNameFontSize":14,"descFontSize":12,"allergenFontSize":10,"weightGroup":"mild"},{"id":"garden-ceremony","name":"Garden Ceremony","kind":"wedding","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#2e4736","accentColor":"#698868","borderColor":"#92aa8e","borderStyle":"solid","borderWidth":0.9,"frameMotif":"botanical","titleFontSize":25,"dishNameFontSize":14,"descFontSize":12,"allergenFontSize":10,"weightGroup":"mild"},{"id":"monarch-navy","name":"Monarch Navy","kind":"professional","weightGroup":"bold","titleFont":"font-montserrat","bodyFont":"font-serif","textColor":"#f1f5f9","accentColor":"#0f3563","borderColor":"#284b73","borderStyle":"double","borderWidth":1,"frameMotif":"art-deco","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"crimson-gala","name":"Crimson Gala","kind":"wedding","weightGroup":"bold","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#562a32","accentColor":"#9d283b","borderColor":"#b95b69","borderStyle":"double","borderWidth":1,"frameMotif":"corner-flourish","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"copper-regency","name":"Copper Regency","kind":"wedding","weightGroup":"bold","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#4b3027","accentColor":"#a24d30","borderColor":"#b88f78","borderStyle":"double","borderWidth":1,"frameMotif":"corner-flourish","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"golden-celebration","name":"Golden Celebration","kind":"wedding","weightGroup":"bold","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#533c1d","accentColor":"#a57a19","borderColor":"#c9af63","borderStyle":"double","borderWidth":1,"frameMotif":"art-deco","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"linen-serif","name":"Linen Serif","kind":"professional","weightGroup":"mild","titleFont":"font-serif","bodyFont":"font-sans","textColor":"#333335","accentColor":"#8a847f","borderColor":"#cabfb1","borderStyle":"solid","borderWidth":0.6,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"sage-elegance","name":"Sage Elegance","kind":"wedding","weightGroup":"mild","titleFont":"font-cormorant","bodyFont":"font-cormorant","textColor":"#364c40","accentColor":"#78927e","borderColor":"#a9bbaa","borderStyle":"solid","borderWidth":0.6,"frameMotif":"botanical","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"powder-blue","name":"Powder Blue","kind":"professional","weightGroup":"mild","titleFont":"font-sans","bodyFont":"font-sans","textColor":"#304156","accentColor":"#718ea4","borderColor":"#afc1d0","borderStyle":"solid","borderWidth":0.6,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"blush-linen","name":"Blush Linen","kind":"wedding","weightGroup":"mild","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#62464d","accentColor":"#bf9ca5","borderColor":"#d2b9be","borderStyle":"solid","borderWidth":0.6,"frameMotif":"corner-flourish","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"soft-pearl","name":"Soft Pearl","kind":"professional","weightGroup":"mild","titleFont":"font-cormorant","bodyFont":"font-sans","textColor":"#4c5158","accentColor":"#87929b","borderColor":"#c8ced3","borderStyle":"solid","borderWidth":0.6,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"almond-garden","name":"Almond Garden","kind":"wedding","weightGroup":"mild","titleFont":"font-cormorant","bodyFont":"font-sans","textColor":"#514e3e","accentColor":"#a59d75","borderColor":"#cbc5a5","borderStyle":"double","borderWidth":0.6,"frameMotif":"botanical","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"lavender-mist","name":"Lavender Mist","kind":"wedding","weightGroup":"mild","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#534f65","accentColor":"#8b86a8","borderColor":"#bdb8d0","borderStyle":"solid","borderWidth":0.6,"frameMotif":"corner-flourish","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10}];
const SAFE=['titleFont','bodyFont','textColor','accentColor','bgColor','borderColor','borderStyle','borderWidth','borderOutsetCm','titleFontSize','dishNameFontSize','descFontSize','allergenFontSize','frameMotif'];
const s={token:null, user:null,cloudEvent:null, events:[], planners:[], activeTheme:'', clientToken:null, clientEvent:null, clientDesign:{designs:{}},clientFmt:'half-a4',clientAllowed:[...CLIENT_PRINT_FORMATS],themes:[...PRESETS], pendingChanges:false,clientCanPrint:false};
const $=id=>document.getElementById(id);
const e=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const escAttr=e;
const data=x=>JSON.parse(JSON.stringify(x));
function msg(t,kind=''){for(const id of ['rs-cloud-message','rs-admin-message']){const el=$(id);if(el){el.textContent=t;el.className='raga-alert '+(kind==='error'?'raga-error':'');el.setAttribute('aria-live','polite');}}}
function onLoginError(t){const el=$('rs-login-error');if(el)el.textContent=t;}
async function call(path,method='GET',body,auth=true){
  const headers={'Content-Type':'application/json'};
  if(auth&&s.token)headers.Authorization='Bearer '+s.token;
  let res;
  try{res=await fetch(API+path,{method,headers,cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});}catch(err){throw Error('Cannot connect to Security API. Check internet, Worker deployment and ALLOWED_ORIGIN.');}
  const json=await res.json().catch(()=>({}));
  if(!res.ok){if(res.status===401&&auth&&s.token){s.token=null;s.user=null;sessionStorage.removeItem('raga_session');onLoginError('Admin session expired. Sign in again for Admin Settings.');showPublic();}
    throw Error(json.error||`HTTP ${res.status}`);}
  return json;
}
// Guest feedback QR is an Admin-managed global print asset; not part of an event snapshot.
async function fetchFeedbackQR(){
  try{
    const result=await call('/public/feedback-qr','GET',undefined,false);
    window.ragaFeedbackQrData=typeof result.image==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(result.image)?result.image:'';
    const img=$('rs-feedback-image');if(img){img.hidden=!window.ragaFeedbackQrData;if(window.ragaFeedbackQrData)img.src=window.ragaFeedbackQrData;else img.removeAttribute('src');}
    const status=$('rs-feedback-status');if(status)status.textContent=window.ragaFeedbackQrData?'Official feedback QR published.':'No feedback QR is published.';
    if(typeof window.renderPreview==='function' && !document.body.classList.contains('ragasaan-locked'))window.renderPreview();
    if(s.clientEvent)renderClientPreview();
  }catch(err){const el=$('rs-feedback-status');if(el)el.textContent='Could not load QR: '+err.message;}
}
async function publishFeedbackQR(remove=false){
  if(s.user?.role!=='admin')return;
  const status=$('rs-feedback-status');
  let image='';
  if(!remove){
    const f=$('rs-feedback-upload')?.files?.[0];
    if(!f){if(status)status.textContent='Select a QR image before publishing.';return;}
    if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>150000){if(status)status.textContent='Use PNG/JPG/WebP up to 150 KB.';return;}
    image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(Error('Could not read image'));reader.readAsDataURL(f);});
  }else if(!confirm('Remove the published feedback QR from all menu cards?'))return;
  try{
    if(status)status.textContent=remove?'Removing published QR…':'Publishing QR…';
    await call('/admin/feedback-qr','PUT',{image});
    if($('rs-feedback-upload'))$('rs-feedback-upload').value='';
    await fetchFeedbackQR();
    if(status)status.textContent=remove?'Official QR removed from all menu cards.':'Official QR published for all menu cards.';
  }catch(err){if(status)status.textContent='QR update failed: '+err.message;}
}

async function loadFeedbackCopy(){
 if(s.user?.role!=='admin')return;
 const content=await call('/admin/feedback-copy');
 const cfg=state?.designs?.['half-a4'];if(cfg){
   cfg.feedbackTitle=content.title||'We Value Your Feedback';
   cfg.feedbackMessage=content.message||'Thank you for celebrating with us. Please scan the QR code below to share your experience.';
   window.ragaSyncFeedbackCopyEditor?.();
   if(state.layout==='half-a4')window.renderPreview?.();
 }
 const status=$('rs-feedback-copy-status');if(status)status.textContent='Shared guest feedback wording loaded.';
}
async function saveFeedbackCopy(){
 const status=$('rs-feedback-copy-status');
 if(s.user?.role!=='admin'){if(status)status.textContent='Administrator sign-in required.';return;}
 const title=String($('raga-feedback-title-input')?.value||'').trim();
 const message=String($('raga-feedback-message-input')?.value||'').trim();
 if(!title||!message){if(status)status.textContent='Heading and message cannot be empty.';return;}
 try{
   const result=await call('/admin/feedback-copy','PUT',{title,message});
   if(result?.updated!==true)throw Error('Security API did not confirm the saved wording');
   if(status)status.textContent='Guest feedback wording saved to D1 and all menus.';
   const cfg=state?.designs?.['half-a4'];if(cfg){cfg.feedbackTitle=title;cfg.feedbackMessage=message;}
   window.renderPreview?.();
 }catch(err){if(status)status.textContent='Feedback wording save failed: '+err.message;}
}
const CHOICE_NAMES={serviceModes:'Service types',mealSessions:'Meal sessions',menuCategories:'Menu categories',printFormats:'Menu / tag formats'};
const CHOICE_LABELS={'a4':'Buffet Menu A4','a4-live':'Live Station A4','half-a4':'Table Menu Card','a8-grid':'A8 Tags','foldtags-grid':'FoldTags','a6-grid':'A6 Tags','canape-grid':'Canapé Labels'};
let loadedChoiceOptions=null;
function companyLogoStatus(message,isError=false){
  const el=$('rs-company-status');
  if(el){el.textContent=message;el.style.color=isError?'#fecaca':'#bbf7d0';el.setAttribute('role','status');el.setAttribute('aria-live','polite');}
}
async function companyLogoData(file){
  if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPG or WebP logo.');
  if(file.size>12_000_000)throw Error('Original file is too large (maximum 12 MB). Choose a smaller image.');
  const read=source=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(Error('Cannot read logo file'));reader.readAsDataURL(source);});
  if(file.size<=125000){const data=await read(file);if(data.length<=190000)return data;}
  const objectURL=URL.createObjectURL(file);
  try{
    const img=await new Promise((resolve,reject)=>{const picture=new Image();picture.onload=()=>resolve(picture);picture.onerror=()=>reject(Error('Cannot decode logo image'));picture.src=objectURL;});
    const maxSide=Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height);
    if(!maxSide)throw Error('Empty logo image');
    for(const target of [1200,900,700,520,380,260,170]){
      const scale=Math.min(1,target/maxSide),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
      canvas.height=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Browser cannot resize the logo');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      for(const quality of [0.88,0.72,0.56]){
        const data=canvas.toDataURL('image/webp',quality);
        if(data.startsWith('data:image/webp;')&&data.length<=190000)return data;
      }
      // JPEG fallback for browsers with no WebP encoder.
      for(const quality of [0.82,0.65,0.48]){
        const data=canvas.toDataURL('image/jpeg',quality);
        if(data.length<=190000)return data;
      }
    }
    throw Error('Unable to compress this logo under 150 KB. Use a simpler, smaller image.');
  }finally{URL.revokeObjectURL(objectURL);}
}
async function fetchCompanyLogo(){
 const info=$('rs-company-status');
 try{
   const r=await call('/public/company-logo','GET',undefined,false);
   const image=typeof r.image==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(r.image)?r.image:'';
   window.ragaPublishedCompanyLogo=image;
   if(image)window.ragaSetPublishedCompanyLogo?.(image);
   else window.ragaClearPublishedCompanyLogo?.();
   const img=$('rs-company-image');
   if(img){img.hidden=!image;if(image)img.src=image;else img.removeAttribute('src');}
   if(info)info.textContent=image?'Published company logo is active.':'No published company logo; using the GitHub fallback.';
   return image;
 }catch(err){
   if(info)info.textContent='Unable to verify cloud company logo: '+err.message;
   return null;
 }
}
function ragaReadLogoDataUrl(blob){
 return new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>resolve(String(reader.result||''));
   reader.onerror=()=>reject(reader.error||Error('Could not read the selected logo file.'));
   reader.readAsDataURL(blob);
 });
}
async function ragaOptimiseCompanyLogo(file,progress){
 if(!file)throw Error('Choose a company logo image first.');
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Use a PNG, JPG or WebP logo.');
 if(file.size>12000000)throw Error('This file is larger than 12 MB. Please choose a smaller image.');
 if(file.size<=150000)return ragaReadLogoDataUrl(file);
 progress?.('Optimising logo for cloud publishing...');
 // Canvas WebP preserves PNG transparency. No third-party image compressor or server upload is used.
 const url=URL.createObjectURL(file);
 let picture;
 try{
   picture=await new Promise((resolve,reject)=>{
     const im=new Image();
     im.onload=()=>resolve(im);
     im.onerror=()=>reject(Error('The selected image cannot be decoded.'));
     im.src=url;
   });
   const iw=picture.naturalWidth,ih=picture.naturalHeight;
   if(!iw||!ih)throw Error('Invalid company logo image dimensions.');
   const canvas=document.createElement('canvas');
   const ctx=canvas.getContext('2d');
   if(!ctx)throw Error('Image resizing is unavailable in this browser.');
   for(const size of [1400,1150,950,780,620,500,390,300]){
     const scale=Math.min(1,size/Math.max(iw,ih));
     canvas.width=Math.max(1,Math.round(iw*scale));
     canvas.height=Math.max(1,Math.round(ih*scale));
     ctx.clearRect(0,0,canvas.width,canvas.height);
     ctx.drawImage(picture,0,0,canvas.width,canvas.height);
     for(const quality of [0.91,0.80,0.67]){
       const compressed=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
       if(compressed&&['image/png','image/jpeg','image/webp'].includes(compressed.type)&&compressed.size<=145000){
         return await ragaReadLogoDataUrl(compressed);
       }
     }
   }
   throw Error('Could not reduce the company logo to 150 KB while preserving legibility. Please use a simpler or smaller image.');
 }finally{URL.revokeObjectURL(url);}
}
async function publishCompanyLogo(remove=false){
 const status=$('rs-company-status'),button=$('rs-company-publish'),removeButton=$('rs-company-remove');
 const setStatus=value=>{if(status)status.textContent=value;};
 if(s.user?.role!=='admin'){setStatus('Only a signed-in Administrator can publish the shared company logo.');return;}
 if(remove&&!confirm('Remove the cloud company logo and return to the GitHub fallback?'))return;
 if(!remove&&!$('rs-company-upload')?.files?.[0]){setStatus('Please select a company logo before publishing.');return;}
 if(button)button.disabled=true;
 if(removeButton)removeButton.disabled=true;
 try{
   const image=remove?'':await ragaOptimiseCompanyLogo($('rs-company-upload').files[0],setStatus);
   setStatus(remove?'Removing cloud logo...':'Publishing company logo to cloud...');
   const response=await call('/admin/company-logo','PUT',{image});
   if(response?.updated!==true)throw Error('The Security API did not confirm that the logo was saved.');
   setStatus('Verifying the saved logo...');
   const confirmed=await fetchCompanyLogo();
   if(confirmed===null)throw Error('The logo update was accepted but its saved version could not be checked. Please verify the Security API connection.');
   if(confirmed!==image)throw Error('The returned cloud logo does not match the upload. Please verify the Worker deployment.');
   if(!remove&&$('rs-company-upload'))$('rs-company-upload').value='';
   if(remove){window.ragaClearPublishedCompanyLogo?.();setStatus('Cloud company logo removed. The GitHub logo is active.');}
   else setStatus('Company logo published and verified. It will appear for all users on refresh.');
   msg(remove?'GitHub company logo restored.':'Company logo published and verified.');
 }catch(err){
   setStatus('Company logo not confirmed: '+(err?.message||err));
   msg(err?.message||String(err),'error');
 }finally{
   if(button)button.disabled=false;
   if(removeButton)removeButton.disabled=false;
 }
}
async function loadChoiceOptions(){
 try{const r=await call('/settings/choices');const out={};
 for(const [key,all] of Object.entries(r.available||{})){const configured=r.settings?.[key];const enabled=Array.isArray(configured?.enabled)?all.filter(v=>configured.enabled.includes(v)):all.slice();
 out[key]={enabled:enabled.length?enabled:all.slice(),default:enabled.includes(configured?.default)?configured.default:(all[0]||'')};}
 loadedChoiceOptions={all:r.available,settings:out};window.ragaAdminChoices=out;
 document.dispatchEvent(new CustomEvent('ragasaan:admin-choices'));renderChoiceOptions();if(s.user?.role==='admin')loadAdminClientFormats();
 }catch(err){if($('rs-choices-status'))$('rs-choices-status').textContent='Cannot load settings: '+err.message;}
}
async function loadAdminClientFormats(){if(s.user?.role!=='admin')return;
 try{const r=await call('/admin/client-formats');const root=$('rs-client-format-choices');if(!root)return;
 const chosen=new Set(r.formats||[]);
 root.innerHTML=CLIENT_PRINT_FORMATS.map(id=>`<label style="display:inline-block;margin:8px"><input type="checkbox" data-client-format="${e(id)}" value="${e(id)}" ${chosen.has(id)?'checked':''}> ${e(FN[id]||id)}</label>`).join('');
 }catch(err){msg('Cannot load client format settings: '+err.message,'error');}
}
async function saveAdminClientFormats(){if(s.user?.role!=='admin')return;
 const formats=[...document.querySelectorAll('[data-client-format]:checked')].map(el=>el.value);
 if(!formats.length)return msg('Choose at least one client print format.','error');
 try{await call('/admin/client-formats','PUT',{formats});msg('Permitted client design formats updated for all client links.');await loadAdminClientFormats();}
 catch(err){msg(err.message,'error');}
}
function renderChoiceOptions(){const el=$('rs-choices-editor');if(!el||!loadedChoiceOptions)return;
 const {all,settings}=loadedChoiceOptions;
 el.innerHTML=Object.keys(all).map(key=>`<fieldset class="raga-list-item"><legend><b>${e(CHOICE_NAMES[key]||key)}</b></legend><div style="display:flex;flex-wrap:wrap;gap:5px">${all[key].map(v=>`<label style="font-size:12px;margin:5px"><input type="checkbox" data-choice-key="${e(key)}" value="${e(v)}" ${settings[key].enabled.includes(v)?'checked':''}> ${e(CHOICE_LABELS[v]||v)}</label>`).join('')}</div><label>Default choice<select class="raga-input" data-choice-default="${e(key)}">${all[key].map(v=>`<option value="${e(v)}" ${settings[key].default===v?'selected':''}>${e(CHOICE_LABELS[v]||v)}</option>`).join('')}</select></label></fieldset>`).join('');
}
async function saveChoiceOptions(){if(s.user?.role!=='admin'||!loadedChoiceOptions)return;const values={};
 for(const [key,all] of Object.entries(loadedChoiceOptions.all)){
 const enabled=[...document.querySelectorAll(`[data-choice-key="${key}"]:checked`)].map(c=>c.value);
 const selected=document.querySelector(`[data-choice-default="${key}"]`)?.value;
 if(!enabled.length||!enabled.includes(selected))return msg('Every section needs at least one enabled option and an enabled default. Check '+CHOICE_NAMES[key]+'.','error');
 values[key]={enabled:all.filter(v=>enabled.includes(v)),default:selected};}
 try{await call('/settings/choices','PUT',{settings:values});msg('Shared choices and defaults saved in Cloudflare D1.');await loadChoiceOptions();}
 catch(err){msg(err.message,'error');}
}

const MEAL_NAMES={breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner','hi-tea':'HI Tea','late-night':'Late Night Snack'};
const MEAL_FORMATS=['a4','a4-live','half-a4','a8-grid','foldtags-grid','a6-grid','canape-grid'];
let mealConfigResponse=null;
async function loadMealDefaults(){
 try{
  mealConfigResponse=await call('/settings/meal-defaults');
  window.ragaMealDefaults=mealConfigResponse.settings;
  document.dispatchEvent(new CustomEvent('ragasaan:meal-defaults'));
  renderMealDefaultsEditor();
 }catch(err){const el=$('rs-meal-defaults-status');if(el)el.textContent='Could not load meal defaults: '+err.message;}
}
function renderMealDefaultsEditor(){
 const root=$('rs-meal-defaults-editor');if(!root||!mealConfigResponse||s.user?.role!=='admin')return;
 const cfg=mealConfigResponse.settings,specs=mealConfigResponse.available.mealSpecs;
 root.innerHTML=Object.entries(specs).map(([kind,spec])=>{
  const item=cfg[kind];if(!item)return '';
  const svc=`<div class="raga-small" style="margin-top:7px">Available service styles — select the styles planners may use for this meal</div><div style="display:flex;flex-wrap:wrap;gap:7px">${spec.services.map(v=>`<label class="raga-small" style="display:inline-flex;align-items:center;gap:4px"><input type="checkbox" data-meal-service-enabled="${e(kind)}" value="${e(v)}" ${(item.enabledServices||spec.services).includes(v)?'checked':''}> ${e(v)}</label>`).join('')}</div><label>Default Service<select class="raga-input" data-meal-service="${e(kind)}">${spec.services.map(v=>`<option value="${e(v)}" ${v===item.service?'selected':''}>${e(v)}</option>`).join('')}</select></label>`;
  const fmt=`<div class="raga-small">Print formats for new dishes</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px">${MEAL_FORMATS.map(v=>`<label class="raga-small"><input type="checkbox" data-meal-format="${e(kind)}" value="${e(v)}" ${item.formats.includes(v)?'checked':''}> ${e(CHOICE_LABELS[v])}</label>`).join('')}</div>`;
  const categoryOptions=mealConfigResponse.available.categoryFormats||{};
  const categoryPrint=`<details class="raga-list-item" style="margin-top:8px"><summary><b>Category-wise print defaults (Canapé / Starter / Main / Dessert / Live Station)</b></summary><p class="raga-small">Only matching formats are offered to planners; event-specific selections remain editable.</p>${Object.entries(categoryOptions).map(([cat,allowed])=>{
    const defaults=item.categoryFormats?.[cat];
    // Empty indicates 'use serving-style automatic defaults' so pre-existing D1 records remain compatible.
    return `<fieldset style="margin:8px 0;padding:8px;border:1px solid #475569;border-radius:8px"><legend><b>${e(cat)}</b></legend><label class="raga-small"><input type="checkbox" data-meal-cat-override="${e(kind)}" data-course="${e(cat)}" ${Array.isArray(defaults)?'checked':''}> Override this category's default</label><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:5px">${allowed.map(f=>`<label class="raga-small"><input type="checkbox" data-meal-category-format="${e(kind)}" data-course="${e(cat)}" value="${e(f)}" ${Array.isArray(defaults)&&defaults.includes(f)?'checked':''}> ${e(CHOICE_LABELS[f]||f)}</label>`).join('')}</div></fieldset>`;
  }).join('')}</details>`;
  const courses=Object.entries(spec.courses).map(([course,opts])=>{
    const value=item.courses?.[course]||{enabled:opts,default:opts[0]};
    return `<div style="padding:8px;border:1px solid #475569;border-radius:6px;margin-top:6px"><b>${e(course)}</b><div>${opts.map(v=>`<label class="raga-small" style="display:inline-block;margin-right:9px"><input type="checkbox" data-meal-course-enabled="${e(kind)}" data-course="${e(course)}" value="${e(v)}" ${value.enabled.includes(v)?'checked':''}> ${e(v)}</label>`).join('')}</div><label class="raga-small">Course default<select class="raga-input" data-meal-course-default="${e(kind)}" data-course="${e(course)}">${opts.map(v=>`<option value="${e(v)}" ${v===value.default?'selected':''}>${e(v)}</option>`).join('')}</select></label></div>`;
  }).join('');
  return `<fieldset class="raga-list-item"><legend><b>${e(MEAL_NAMES[kind])}</b></legend>${svc}<p class="raga-small">Grouping: <b data-meal-group-label="${e(kind)}">${['Plated Service','Buffet-Selective'].includes(item.service)?'Course-wise':'Single section'}</b> (automatically follows the service)</p>${fmt}${categoryPrint}${courses?`<div class="raga-small" style="margin-top:8px"><b>Course options · used when Plated Service is selected</b></div>${courses}`:''}</fieldset>`;
 }).join('');
 root.querySelectorAll('[data-meal-service]').forEach(el=>el.addEventListener('change',()=>{const target=root.querySelector(`[data-meal-group-label="${el.dataset.mealService}"]`);if(target)target.textContent=['Plated Service','Buffet-Selective'].includes(el.value)?'Course-wise':'Single section';}));
}
async function saveMealDefaults(){
 if(s.user?.role!=='admin'||!mealConfigResponse)return;
 const specs=mealConfigResponse.available.mealSpecs;const settings={};
 for(const [kind,spec] of Object.entries(specs)){
  const service=document.querySelector(`[data-meal-service="${kind}"]`)?.value;
  const enabledServices=[...document.querySelectorAll(`[data-meal-service-enabled="${kind}"]:checked`)].map(el=>el.value);
  if(!enabledServices.length||!enabledServices.includes(service))return msg('Enable the selected default service for '+MEAL_NAMES[kind],'error');
  const formats=[...document.querySelectorAll(`[data-meal-format="${kind}"]:checked`)].map(el=>el.value);
  if(!spec.services.includes(service)||!formats.length)return msg('Choose a valid service and at least one format for '+MEAL_NAMES[kind],'error');
  const courses={};
  for(const [course,allowed] of Object.entries(spec.courses)){
    const enabled=[...document.querySelectorAll(`[data-meal-course-enabled="${kind}"][data-course="${course}"]:checked`)].map(el=>el.value);
    const defaultChoice=document.querySelector(`[data-meal-course-default="${kind}"][data-course="${course}"]`)?.value;
    if(!enabled.length||!enabled.includes(defaultChoice))return msg('Course default must be enabled: '+MEAL_NAMES[kind]+' '+course,'error');
    courses[course]={enabled:allowed.filter(v=>enabled.includes(v)),default:defaultChoice};
  }
  const categoryFormats={};
  for(const [course,allowed] of Object.entries(mealConfigResponse.available.categoryFormats||{})){
    const override=document.querySelector(`[data-meal-cat-override="${kind}"][data-course="${course}"]`);
    if(!override?.checked)continue;
    const chosen=[...document.querySelectorAll(`[data-meal-category-format="${kind}"][data-course="${course}"]:checked`)].map(el=>el.value);
    if(!chosen.length||chosen.some(v=>!allowed.includes(v)))return msg('Choose valid category formats for '+MEAL_NAMES[kind]+' / '+course,'error');
    categoryFormats[course]=allowed.filter(v=>chosen.includes(v));
  }
  settings[kind]={service,enabledServices,group:['Plated Service','Buffet-Selective'].includes(service)?'course':'single',formats,courses,categoryFormats};
 }
 try{
  await call('/settings/meal-defaults','PUT',{settings});
  const status=$('rs-meal-defaults-status');if(status)status.textContent='Saved to Cloudflare D1. Applies to new events only.';
  await loadMealDefaults();
 }catch(err){const status=$('rs-meal-defaults-status');if(status)status.textContent='Save failed: '+err.message;}
}
const PRINT_RULE_FIELD_LABELS={
  dinnerPlated:'Dinner · Plated Service (all non-canapé dishes)',
  dinnerCanape:'Dinner · Canapés (only tag/label formats)',
  selectivePlated:'Dinner · Buffet-Selective / plated course',
  selectiveBuffet:'Dinner · Buffet-Selective / buffet course',
  dinnerBuffet:'Dinner · Buffet (single section)',
  liveStation:'Live Station dishes',
  a4Companions:'Any A4 Buffet dish → additional tag layouts'
};
let loadedPrintingRules=null;
async function loadPrintingRules(){
 try{
   loadedPrintingRules=await call('/settings/printing-rules');
   window.ragaPrintingRules=loadedPrintingRules.settings;
   window.ragaApplyPrintingRules?.(loadedPrintingRules.settings);
   renderPrintingRulesEditor();
 }catch(err){const el=$('rs-print-rules-status');if(el)el.textContent='Could not load print rules: '+err.message;}
}
function renderPrintingRulesEditor(){
 const root=$('rs-print-rules-editor');if(!root||!loadedPrintingRules||s.user?.role!=='admin')return;
 root.innerHTML=Object.entries(loadedPrintingRules.available).map(([key,allowed])=>{
  const val=loadedPrintingRules.settings[key];
  const label=`<legend><strong>${e(PRINT_RULE_FIELD_LABELS[key]||key)}</strong></legend>`;
  const control=Array.isArray(val)?`<div style="display:flex;flex-wrap:wrap;gap:8px">${allowed.map(fmt=>`<label class="raga-small" style="display:inline-flex;align-items:center;gap:5px"><input type="checkbox" data-print-rule-multiple="${e(key)}" value="${e(fmt)}" ${val.includes(fmt)?'checked':''}> ${e(FN[fmt]||fmt)}</label>`).join('')}</div>`:
    `<select class="raga-input" data-print-rule-single="${e(key)}">${allowed.map(fmt=>`<option value="${e(fmt)}" ${fmt===val?'selected':''}>${e(FN[fmt]||fmt)}</option>`).join('')}</select>`;
  return `<fieldset class="raga-list-item" style="margin-top:8px">${label}${control}</fieldset>`;
 }).join('');
}
async function savePrintingRules(){
 if(s.user?.role!=='admin'||!loadedPrintingRules)return;
 const values={};
 for(const [key,allowed] of Object.entries(loadedPrintingRules.available)){
   if(Array.isArray(loadedPrintingRules.settings[key])){
     values[key]=[...document.querySelectorAll(`[data-print-rule-multiple="${key}"]:checked`)].map(el=>el.value).filter(v=>allowed.includes(v));
     if(key==='dinnerCanape'&&!values[key].length)return msg('Enable at least one canapé tag or label format.','error');
   }else values[key]=document.querySelector(`[data-print-rule-single="${key}"]`)?.value;
 }
 try{
   await call('/settings/printing-rules','PUT',{settings:values});
   const status=$('rs-print-rules-status');if(status)status.textContent='Printing Rules saved to D1. Applies to new events only.';
   await loadPrintingRules();
 }catch(err){const status=$('rs-print-rules-status');if(status)status.textContent='Save failed: '+err.message;}
}
function showPublic(){
 closeAdminSettings();
 // Shared event storage is staff-only. Client token holders must not be able
 // to switch to the unrestricted Event Planner by removing URL fragments.
 if(s.clientToken){document.body.classList.add('ragasaan-locked');return;}
 document.body.classList.remove('ragasaan-locked');
 $('ragasaan-auth-root')?.classList.remove('raga-client-on');
 const form=$('rs-login-form');if(form)form.hidden=false;
 for(const id of ['rs-logout','rs-open-admin-qr','tab-btn-master','tab-btn-venues']){const el=$(id);if(el)el.hidden=true;}
 const btn=$('rs-admin-login');if(btn)btn.hidden=false;
 document.querySelectorAll('[data-rs-admin],[data-rs-staff]').forEach(n=>n.hidden=true);
 const info=$('rs-user-info');if(info)info.textContent='Public event planning';
 loadChoiceOptions();loadMealDefaults();loadPrintingRules();
 const list=$('rs-cloud-events');if(list)list.innerHTML='<p class="raga-help">Sign in as Event Planner or Admin to access shared cloud events. Local menu design remains available.</p>';
}
window.ragaOpenAdminLogin=function(){document.body.classList.add('ragasaan-locked');};
function gateStatus(){const label=$('rs-user-info');if(label)label.textContent=s.user?`${s.user.name} · ${s.user.role==='admin'?'Administrator':'Event Planner'}`:'Not signed in';}
async function login(evt){evt?.preventDefault();onLoginError('Signing in…');try{
 const result=await call('/login','POST',{email:$('rs-email').value.trim(),password:$('rs-password').value},false);
 if(!result.token||!['admin','planner'].includes(result.user?.role))throw Error('Invalid role from Security API');
 s.token=result.token;s.user=result.user;sessionStorage.setItem('raga_session',JSON.stringify({token:result.token,expiresAt:result.expiresAt}));
 $('rs-password').value='';document.body.classList.remove('ragasaan-locked'); $('ragasaan-auth-root').classList.remove('raga-client-on');
 showAuthenticated();
 }catch(err){onLoginError(err.message);}
}
async function logout(){try{if(s.token)await call('/logout','POST',{},true)}catch(_){}finally{s.token=null;s.user=null;s.cloudEvent=null;sessionStorage.removeItem('raga_session');onLoginError('Signed out.');showPublic();}}
function showAuthenticated(){gateStatus();const adminLogin=$('rs-admin-login');if(adminLogin)adminLogin.hidden=true;const logoutBtn=$('rs-logout');if(logoutBtn)logoutBtn.hidden=false;const masterBtn=$('tab-btn-master');if(masterBtn)masterBtn.hidden=s.user?.role!=='admin';
  const venueButton=$('tab-btn-venues');if(venueButton)venueButton.hidden=true; // Managed through Admin Settings
  const venueTab=$('tab-venues');if(venueTab&&s.user?.role!=='admin')venueTab.hidden=true;
document.querySelectorAll('[data-rs-admin]').forEach(n=>n.hidden=s.user?.role!=='admin');
  document.querySelectorAll('[data-rs-staff]').forEach(n=>n.hidden=!s.user);
  // Signed-in informational banner intentionally removed. Security status remains in the login flow.
  renderThemeGallery();refreshCloudList().catch(x=>msg(x.message,'error'));loadChoiceOptions();loadMealDefaults();loadPrintingRules();
  // Existing local master UI is not an authorization boundary; publication is still checked by the separate GitHub Worker.
  {const master=$('tab-master');if(master)master.querySelectorAll('button[onclick*="requestMasterAuthorization"], #github-save-button').forEach(b=>b.hidden=s.user?.role!=='admin');}
}
function openCloud(){if(s.clientToken)return; $('ragasaan-cloud').classList.add('open');refreshCloudList().catch(err=>msg(err.message,'error'));}
function closeCloud(){$('ragasaan-cloud').classList.remove('open');}
function openAdminSettings(){
  if(s.clientToken)return;
  if(s.user?.role!=='admin'){msg('Administrator sign-in required for Admin Settings.','error');window.ragaOpenAdminLogin();return;}
  $('ragasaan-admin')?.classList.add('open');
  window.ragaSyncFeedbackCopyEditor?.();
  refreshPlanners().catch(err=>msg('User Profile loading failed: '+err.message,'error'));
  loadFeedbackCopy().catch(err=>msg('Feedback wording loading failed: '+err.message,'error'));
}
function closeAdminSettings(){$('ragasaan-admin')?.classList.remove('open');}
function opt(rows,idKey='id',labelKey='name'){return rows.map(r=>`<option value="${escAttr(r[idKey])}">${e(r[labelKey])}</option>`).join('');}

function ragaPlannerName(x){
 const assigned=s.planners.find(p=>p.id===x.plannerUserId);
 return String(assigned?.display_name||x.eventData?.plannerName||x.plannerName||'Unassigned planner').trim()||'Unassigned planner';
}
function ragaCanDeleteCloud(x){
 if(!s.user)return false;
 if(s.user.role==='admin')return true;
 return s.user.role==='planner'&&(x.plannerUserId===s.user.id||x.createdBy===s.user.id);
}
function ragaPendingClientDesigns(){
 const pending=s.events.filter(row=>(row.status==='review'||(row.status==='approved'&&row.clientDesignUpdatedAt))&&!row.deletedAt);
 const badge=$('rs-client-pending-badge');
 if(badge){badge.hidden=!s.user||!pending.length;badge.textContent='Client designs: '+pending.length;}
 const pane=$('rs-pending-designs');if(!pane)return;
 pane.innerHTML=pending.length?pending.map(x=>
  '<div class="raga-list-item raga-pending-task"><div class="raga-cloud-one-line"><strong>'+e(x.name)+'</strong><small>'+e(ragaPlannerName(x))+' · '+(x.status==='approved'?'Ready to print':'Pending client review')+'</small></div><div class="raga-actions"><button type="button" class="raga-btn" data-pending-review="'+e(x.id)+'">Review Design</button><button type="button" class="raga-btn primary" data-pending-print="'+e(x.id)+'">Review &amp; Print</button></div></div>'
 ).join(''):'<p class="raga-help">No pending client designs.</p>';
 pane.querySelectorAll('[data-pending-review]').forEach(button=>button.onclick=async()=>{
   selectCloud(button.dataset.pendingReview);await loadSubmissions();
   $('rs-design-inspector')?.scrollIntoView({block:'center',behavior:'smooth'});
 });
 pane.querySelectorAll('[data-pending-print]').forEach(button=>button.onclick=async()=>{
   const event=s.events.find(row=>row.id===button.dataset.pendingPrint);if(!event)return;
   if(event.status!=='approved'){msg('Please review and approve the latest client design before printing.','error');selectCloud(event.id);await loadSubmissions();return;}
   await loadCloud(event.id);window.switchTab?.('export');
 });
}
async function ragaDeleteCloud(id){
 const event=s.events.find(row=>row.id===id);if(!event)return;
 if(!ragaCanDeleteCloud(event)){msg('Only Admin may delete any event; a planner may delete their own assigned/created event.','error');return;}
 if(!confirm('Move "'+event.name+'" to recoverable deleted events? Its menu and design remain in D1.'))return;
 try{
   await call('/events/'+id,'DELETE',undefined,true);
   if(s.cloudEvent?.id===id)s.cloudEvent=null;
   msg('Event moved to recoverable deleted records.');await refreshCloudList();
 }catch(err){msg('Delete failed: '+err.message,'error');}
}
async function ragaRestoreCloud(id){
 if(!s.user){msg('Sign in to restore cloud events.','error');return;}
 try{await call('/events/'+id+'/restore','POST',{},true);msg('Deleted event restored to Draft.');await refreshCloudList();}
 catch(err){msg('Restore failed: '+err.message,'error');}
}
function renderCloudList(){
 const list=$('rs-cloud-events');if(!list)return;
 const planners=[...new Set(s.events.map(ragaPlannerName))].sort((a,b)=>a.localeCompare(b));
 const selected=String(s.cloudPlannerFilter||'');
 const relevant=s.events.filter(x=>!selected||ragaPlannerName(x)===selected);
 const sorted=[...relevant].sort((a,b)=>{
  const time=x=>Date.parse(x.updatedAt||x.updated_at||x.createdAt||x.created_at||x.eventDate||'')||0;
  return time(b)-time(a);
 });
 const visible=s.cloudShowArchive?sorted:sorted.slice(0,20);
 const plannerOptions=planners.map(p=>'<option value="'+e(p)+'" '+(selected===p?'selected':'')+'>'+e(p)+'</option>').join('');
 const controls='<div class="raga-list-item raga-cloud-filters"><label>Filter by planner<select id="rs-cloud-planner-filter" class="raga-input"><option value="">All planners</option>'+plannerOptions+'</select></label><div class="raga-actions"><span class="raga-small">Latest '+visible.length+' of '+sorted.length+' events</span><button type="button" class="raga-btn" id="rs-cloud-archive-toggle">'+(s.cloudShowArchive?'Show latest 20':'Older events')+'</button>'+(s.user?'<button type="button" id="rs-cloud-restore-toggle" class="raga-btn">'+(s.cloudIncludeDeleted?'Hide deleted':'Recover deleted')+'</button>':'')+'</div></div>';
 list.innerHTML=controls+(visible.length?visible.map(x=>{
  const archived=x.status==='archived'||!!x.deletedAt;
  const actions=archived?(ragaCanDeleteCloud(x)?'<button type="button" class="raga-btn" data-restore-cloud="'+e(x.id)+'">Restore</button>':''):'<button type="button" class="raga-btn primary" data-load-cloud="'+e(x.id)+'">Load</button><button type="button" class="raga-btn" data-manage-cloud="'+e(x.id)+'">Manage</button>'+(ragaCanDeleteCloud(x)?'<button type="button" class="raga-btn danger" data-delete-cloud="'+e(x.id)+'">Delete</button>':'');
  return '<details class="raga-list-item raga-cloud-record"><summary class="raga-cloud-one-line"><strong>'+e(x.name)+'</strong><span>'+e(x.eventDate||'No date')+'</span><span>'+e(ragaPlannerName(x))+'</span><span class="raga-pill">'+e(x.status||'draft')+'</span></summary><div class="raga-cloud-details"><p>'+e(x.venue||'Venue not supplied')+'</p><div class="raga-actions">'+actions+'</div></div></details>';
 }).join(''):'<p class="raga-help">No matching events. Select All planners or create an event.</p>');
 const filter=list.querySelector('#rs-cloud-planner-filter');
 if(filter)filter.onchange=()=>{s.cloudPlannerFilter=filter.value;renderCloudList();};
 const older=list.querySelector('#rs-cloud-archive-toggle');
 if(older)older.onclick=()=>{s.cloudShowArchive=!s.cloudShowArchive;renderCloudList();};
 const deleted=list.querySelector('#rs-cloud-restore-toggle');
 if(deleted)deleted.onclick=()=>{s.cloudIncludeDeleted=!s.cloudIncludeDeleted;refreshCloudList().catch(err=>msg(err.message,'error'));};
 list.querySelectorAll('[data-load-cloud]').forEach(b=>b.onclick=()=>loadCloud(b.dataset.loadCloud).catch(err=>msg(err.message,'error')));
 list.querySelectorAll('[data-manage-cloud]').forEach(b=>b.onclick=()=>selectCloud(b.dataset.manageCloud));
 list.querySelectorAll('[data-delete-cloud]').forEach(b=>b.onclick=()=>ragaDeleteCloud(b.dataset.deleteCloud));
 list.querySelectorAll('[data-restore-cloud]').forEach(b=>b.onclick=()=>ragaRestoreCloud(b.dataset.restoreCloud));
 const current=s.cloudEvent&&s.events.find(x=>x.id===s.cloudEvent.id);if(current)s.cloudEvent=current;
 drawSelected();ragaPendingClientDesigns();
}
async function refreshCloudList(){
 if(!s.user){const list=$('rs-cloud-events');if(list)list.innerHTML='<p class="raga-help">Event Planner or Admin sign-in required to view shared records.</p>';s.events=[];ragaPendingClientDesigns();return;}
 const path='/events'+(s.cloudIncludeDeleted?'?includeArchived=1':'');
 const result=await call(path,'GET',undefined,!!s.user);
 s.events=Array.isArray(result.events)?result.events:[];
 renderCloudList();
 if(s.user?.role==='admin')await refreshPlanners();
}
async function refreshPlanners(){
 const [plannersResult,accountsResult]=await Promise.all([call('/users/planners'),call('/users')]);
 s.planners=plannersResult.planners||[];
 const sel=$('rs-event-planner');
 if(sel){sel.innerHTML='<option value="">Not yet assigned</option>'+s.planners.filter(p=>p.active).map(x=>`<option value="${e(x.id)}">${e(x.display_name)} · ${e(x.email)}</option>`).join('');if(s.cloudEvent)sel.value=s.cloudEvent.plannerUserId||'';}
 const root=$('rs-planner-list');if(!root)return;
 const users=accountsResult.users||[];
 root.innerHTML=users.map(u=>`<div class="raga-list-item"><strong>${e(u.display_name)}</strong><span class="raga-pill">${e(u.role)} · ${u.active?'Active':'Disabled'}</span><div class="raga-small">${e(u.email)}</div><div class="raga-actions"><button type="button" class="raga-btn" data-user-edit="${e(u.id)}">Edit profile</button><button type="button" class="raga-btn" data-user-reset="${e(u.id)}">Reset password</button>${u.id!==s.user.id?`<button type="button" class="raga-btn ${u.active?'danger':''}" data-user-active="${e(u.id)}">${u.active?'Disable':'Reactivate'}</button>`:''}</div></div>`).join('');
 const byId=id=>users.find(x=>x.id===id);
 root.querySelectorAll('[data-user-edit]').forEach(b=>b.onclick=async()=>{const u=byId(b.dataset.userEdit);if(!u)return;const name=prompt('Display name',u.display_name);if(name===null)return;const email=prompt('Login email',u.email);if(email===null)return;const role=u.id===s.user.id?u.role:(prompt('Role: admin or planner',u.role)||'');if(!['admin','planner'].includes(role))return msg('Use admin or planner','error');try{await call('/users/'+u.id+'/profile','PUT',{name,email,role});msg('Profile updated. Changed roles require a fresh login.');await refreshPlanners();}catch(err){msg(err.message,'error');}});
 root.querySelectorAll('[data-user-reset]').forEach(b=>b.onclick=async()=>{const u=byId(b.dataset.userReset);if(!u)return;const password=prompt('New password for '+u.email+' (minimum 8 characters). Existing sessions will be revoked.');if(password===null)return;if(password.length<8)return msg('Password must contain at least 8 characters.','error');if(!confirm('Reset password and revoke all sessions for '+u.email+'?'))return;try{await call('/users/'+u.id+'/password','PUT',{password});msg('Password reset. Share securely and ask the user to sign in again.');if(u.id===s.user.id){await logout();}else await refreshPlanners();}catch(err){msg(err.message,'error');}});
 root.querySelectorAll('[data-user-active]').forEach(b=>b.onclick=async()=>{const u=byId(b.dataset.userActive);if(!u)return;const action=u.active?'deactivate':'reactivate';if(!confirm(action+' '+u.email+'?'))return;try{await call('/users/'+u.id+'/'+action,'POST',{});msg('User '+action+'d.');await refreshPlanners();}catch(err){msg(err.message,'error');}});
}

function selectCloud(id){s.cloudEvent=s.events.find(x=>x.id===id)||null;drawSelected();}
function drawSelected(){const el=$('rs-cloud-selected');if(!el)return;
 const x=s.cloudEvent;
 el.innerHTML=x?`<b>${e(x.name)}</b> <span class="raga-pill">${e(x.status)}</span><div class="raga-small">Cloud ID: ${e(x.id)}</div>`:'No cloud event selected';
 const sel=$('rs-event-planner');if(sel&&x)sel.value=x.plannerUserId||''; const guestName=$('rs-public-planner-name');if(guestName&&x)guestName.value=String(x.eventData?.plannerName||'');
 $('rs-cloud-event-id').textContent=x?'Selected: '+x.name:'Not yet saved to cloud';
 const enabled=!!x;
 ['rs-make-link','rs-load-submissions','rs-list-links','rs-approve-print','rs-load-selected'].forEach(id=>{const b=$(id);if(b)b.disabled=!enabled});
}
// Keep cloud event JSON below Worker request limits. Never upload large embedded images
// or duplicate identical images across all seven format designs. Master data stays in GitHub.
function compactCloudSnapshot(raw){
 const snapshot=data(raw);const imageKeys=/^(logoUrl|coupleLogoUrl|halfBackLeftImageUrl|halfBackRightImageUrl|halfBackImageUrl|imageUrl)$/i;
 function stripImages(node){
  if(Array.isArray(node))return node.map(stripImages);
  if(node&&typeof node==='object'){const o={};for(const [key,val] of Object.entries(node)){
   if(imageKeys.test(key)||typeof val==='string'&&val.startsWith('data:image/'))continue;
   o[key]=stripImages(val);
  }return o;}return node;
 }
 const cleaned=stripImages(snapshot);
 // Preserve small event logos once rather than seven duplicated copies. Large images
 // stay browser-local; the company logo is also served centrally from GitHub.
 const logoCandidate=(snapshot.designs?.['half-a4']||snapshot.designs?.a4||{});
 const oneLogo=(key)=>{
   const val=logoCandidate[key]||snapshot.designs?.a4?.[key]||'';
   return typeof val==='string'&&/^data:image\/(png|jpeg|webp);base64,/i.test(val)&&val.length<125000?val:'';
 };
 const companyLogo=oneLogo('logoUrl'),coupleLogo=oneLogo('coupleLogoUrl');
 if(companyLogo||coupleLogo)cleaned.sharedImages={companyLogo,coupleLogo};
 const bytes=new TextEncoder().encode(JSON.stringify(cleaned)).length;
 if(bytes>480000)throw Error('Event is still too large ('+Math.ceil(bytes/1024)+' KB). Reduce the number of items or descriptions before saving. Images remain browser-local.');
 return cleaned;
}
async function saveCloud(){
 if(!s.user||!['admin','planner'].includes(s.user.role)){msg('Sign in as Event Planner or Admin before saving to the shared D1 library.','error');return;}
 const snapshot=compactCloudSnapshot(eventSnapshot()),current=s.cloudEvent;
 const chosenName=String(snapshot.name||snapshot.title||'Event').trim();
 const payload={name:chosenName,eventDate:snapshot.date||'',venue:snapshot.venue||'',partyNo:snapshot.partyNo||'',eventData:snapshot};
 if(s.user?.role==='admin'){const planner=$('rs-event-planner');payload.plannerUserId=planner?.value||null;}
 if(!current){const r=await call('/events','POST',payload,true);s.cloudEvent={id:r.id,...payload,status:'draft'};msg('Shared event created.');}
 else {const confirmed=confirm('Overwrite the selected cloud event with the current builder snapshot? This resets print approval.');if(!confirmed)return;
 await call('/events/'+current.id,'PUT',payload,true);msg('Shared event updated.');}
 await refreshCloudList();
}
async function loadCloud(id){if(!s.user)throw Error('Event Planner or Admin sign-in required.');
 const x=await call('/events/'+id,'GET',undefined,true);if(!x.event)throw Error('Cloud event not found');
 // Loading a cloud snapshot also loads its approved client design. Keep local browser copy intact until confirmed.
 const remote=data(x.event.eventData);for(const fmt of FMT){if(remote.designs?.[fmt]){for(const k of ['logoUrl','coupleLogoUrl']){const v=remote.sharedImages?.[k==='logoUrl'?'companyLogo':'coupleLogo'];if(v&&!remote.designs[fmt][k])remote.designs[fmt][k]=v;}if(state.designs?.[fmt])for(const k of ['logoUrl','coupleLogoUrl','halfBackLeftImageUrl','halfBackRightImageUrl'])if(!remote.designs[fmt][k]&&state.designs[fmt][k])remote.designs[fmt][k]=state.designs[fmt][k];}}
 if(restoreEventSnapshot(remote)!==true)return;s.cloudEvent=x.event;s.activeTheme=x.event.eventData?.themeId||'';renderThemeGallery();s.loadedSnapshot=JSON.stringify(compactCloudSnapshot(eventSnapshot()));s.loadedRemote=JSON.stringify(x.event.eventData);
 drawSelected();msg('Loaded cloud event '+x.event.name);closeCloud();
}
async function createLink(){if(!s.cloudEvent)return msg('Save to Cloud first','error');
 const label=$('rs-link-label').value.trim(),days=Number($('rs-link-days').value)||7;
 try{const r=await call('/events/'+s.cloudEvent.id+'/client-links','POST',{label,days});
 const link=`${location.origin}${location.pathname}#client=${encodeURIComponent(r.token)}`;
 $('rs-link-output').value=link;
 msg('Access link generated. Copy it now: the token is shown only once. Expires '+new Date(r.expiresAt).toLocaleString()+'.');
 await listLinks();
 }catch(err){msg(err.message,'error');}
}
async function listLinks(){if(!s.cloudEvent)return;const r=await call('/events/'+s.cloudEvent.id+'/client-links');
 const root=$('rs-links-list');root.innerHTML=(r.links||[]).map(x=>`<div class="raga-list-item">${e(x.label||'Client Designer')} · ${x.revoked_at?'<b>Revoked</b>':new Date(x.expires_at)<new Date()?'<b>Expired</b>':'Active'}<div class="raga-small">Expires ${e(x.expires_at)}</div>${!x.revoked_at?`<button class="raga-btn danger" data-revoke="${e(x.id)}">Revoke</button>`:''}</div>`).join('')||'<p class="raga-help">No links yet.</p>';
 root.querySelectorAll('[data-revoke]').forEach(b=>b.onclick=async()=>{if(!confirm('Revoke this client link now?'))return;try{await call('/events/'+s.cloudEvent.id+'/client-links/'+b.dataset.revoke+'/revoke','POST',{});await listLinks();}catch(err){msg(err.message,'error');}});
}
async function loadSubmissions(){if(!s.cloudEvent)return;try{const r=await call('/events/'+s.cloudEvent.id+'/submissions');
 const root=$('rs-submissions-list');root.innerHTML=(r.submissions||[]).map(x=>`<div class="raga-list-item"><b>Design revision ${x.revision}</b> · <span class="raga-pill">${e(x.status)}</span><div class="raga-small">Submitted ${e(x.submitted_at)} · Theme: ${e(x.design?.themeId||'Custom')}</div><div class="raga-actions"><button class="raga-btn" data-preview-rev="${e(x.id)}">View settings</button>${s.user?.role==='planner'&&x.status==='submitted'?`<button class="raga-btn primary" data-review="${e(x.id)}" data-review-status="approved">Approve design</button><button class="raga-btn" data-review="${e(x.id)}" data-review-status="changes_requested">Request changes</button><button class="raga-btn danger" data-review="${e(x.id)}" data-review-status="rejected">Reject</button>`:''}</div></div>`).join('')||'<p class="raga-help">No submissions yet. Create a client link above.</p>';
 root.querySelectorAll('[data-preview-rev]').forEach(b=>b.onclick=()=>{const item=(r.submissions||[]).find(x=>x.id===b.dataset.previewRev);if(item)showSubmissionDesign(item);});
 root.querySelectorAll('[data-review]').forEach(b=>b.onclick=async()=>{const note=b.dataset.reviewStatus==='approved'?'':(prompt('Review note (optional):')??'');if(!confirm(`Mark this design ${b.dataset.reviewStatus.replace('_',' ')}?`))return;
 try{await call('/events/'+s.cloudEvent.id+'/submissions/'+b.dataset.review+'/review','POST',{status:b.dataset.reviewStatus,note});msg('Submission '+b.dataset.reviewStatus+'. Approved designs are merged into the cloud event; load it again to preview.');await loadSubmissions();await refreshCloudList();}catch(err){msg(err.message,'error');}});
 }catch(err){msg(err.message,'error');}}
function showSubmissionDesign(item){const d=item.design||{};const root=$('rs-design-inspector');
 root.innerHTML=`<b>Revision ${item.revision} · ${e(item.status)}</b><p>Theme: ${e(d.themeId||'Custom')}<br>Table name: ${e(d.coupleTitle||[d.brideName,d.groomName].filter(Boolean).join(' & '))}<br>Welcome message: ${e(d.welcomeMessage||'')}</p><div class="raga-small">${Object.entries(d.designs||{}).map(([fmt,x])=>e(FN[fmt]||fmt)+': '+e(x.titleFont||'')+', '+e(x.accentColor||'')).join(' · ')}</div>`;}
async function approvePrint(){if(!s.cloudEvent)return;try{await call('/events/'+s.cloudEvent.id+'/approve-print','POST',{});msg('Printing approved for this cloud event.');await refreshCloudList();}catch(err){msg(err.message,'error');}}
async function createPlanner(){
 const status=$('rs-new-planner-status'),button=$('rs-create-planner');
 const set=(message,isError=false)=>{if(status){status.textContent=message;status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.color=isError?'#a42342':'#256746';}msg(message,isError?'error':'');};
 if(s.user?.role!=='admin'){set('Only an Administrator can create an Event Planner.',true);return;}
 const email=String($('rs-new-planner-email')?.value||'').trim().toLowerCase();
 const name=String($('rs-new-planner-name')?.value||'').trim();
 const password=String($('rs-new-planner-password')?.value||'');
 if(!name||!/^\S+@\S+\.\S+$/.test(email)||password.length<8){set('Enter a name, valid email and an initial password of at least 8 characters.',true);return;}
 if(button){button.disabled=true;button.textContent='Creating Event Planner…';}
 set('Checking account details and submitting user creation…');
 try{
  const created=await call('/users/planners','POST',{email,name,password});
  if(!created?.id)throw Error('The server did not return a new user ID; account creation is not confirmed.');
  $('rs-new-planner-password').value='';
  set('Event Planner '+name+' created successfully. Share the initial password securely.');
  await refreshPlanners();
 }catch(err){set('Could not create Event Planner: '+(err?.message||String(err)),true);}
 finally{if(button){button.disabled=false;button.textContent='Create Event Planner';}}
}
// The public HTML can be bypassed; this guard provides operational UI workflow protection only.
// The backend independently authorizes cloud event, client link, submission, approval and print-status calls.
async function canPrint(){return true;}
 function lockMaster(){if(s.user?.role!=='admin'){alert('Only the Admin can modify the master allergen database.');return false;}return true;}
const nativeRequestMaster=window.requestMasterAuthorization;
window.requestMasterAuthorization=function(label,callback){if(!lockMaster())return;return nativeRequestMaster(label,callback);};
const originalSwitchTab=window.switchTab;
if(typeof originalSwitchTab==='function')window.switchTab=function(name){if(['venues','master'].includes(name)&&s.user?.role!=='admin'){window.ragaOpenAdminLogin();return;}return originalSwitchTab.apply(this,arguments);};
const originalMasterRender=window.renderMasterDB;
if(typeof originalMasterRender==='function')window.renderMasterDB=function(...args){const result=originalMasterRender.apply(this,args);if(s.user?.role!=='admin')document.querySelectorAll('#tab-master button[onclick*="requestMasterAuthorization"]').forEach(b=>b.hidden=true);return result;};
for(const fn of ['publishMasterToGitHub','saveDishModal','deleteDish','openDishModal','importExcel']){
 const original=window[fn];if(typeof original==='function')window[fn]=function(...args){if(!lockMaster())return;return original.apply(this,args);};
}
for(const fn of ['triggerPrint','downloadPDF','printEventSummary','exportClientSummaryWord','exportFormatWord']){
 const native=window[fn];if(typeof native==='function')window[fn]=async function(...args){if(!(await canPrint()))return;return native.apply(this,args);};
}
// A browser's Ctrl+P cannot be server-authorized. Reduce accidental bypass with a beforeprint warning.
// Public previews and print are permitted. Only Admin and Master editing are protected.
window.addEventListener('afterprint',()=>document.body.classList.remove('raga-print-blocked'));
function savedThemes(){try{const d=JSON.parse(localStorage.getItem('ragasaan_custom_themes_v1')||'[]');return Array.isArray(d)?d:[];}catch{return [];}}
function validTheme(input){if(!input||typeof input!=='object')return null;
 const out={id:String(input.id||'').slice(0,60).replace(/[^a-z0-9_-]/gi,''),name:String(input.name||'Custom theme').slice(0,80),kind:['professional','wedding','custom'].includes(input.kind)?input.kind:'custom'};
 if(!out.id||!out.name)return null;
 for(const k of SAFE){const v=input[k];if(v===undefined)continue;
 if(['textColor','accentColor','borderColor','bgColor'].includes(k)&&/^#[0-9a-f]{6}$/i.test(v))out[k]=v;
 else if(['titleFont','bodyFont'].includes(k)&&['font-serif','font-cormorant','font-script','font-montserrat','font-sans'].includes(v))out[k]=v;
 else if(k==='borderStyle'&&['none','solid','double','dashed','dotted'].includes(v))out[k]=v;
 else if(k==='frameMotif'&&['none','fine-line','art-deco','botanical','corner-flourish'].includes(v))out[k]=v;
 else if(typeof v==='number'&&Number.isFinite(v))out[k]=v;
 }
 return out;}
async function loadThemeGallery(){// Optional GitHub gallery extends the built-in collection; it is never required for startup.
 try{const res=await fetch('./themes/gallery.json',{cache:'no-store'});if(!res.ok)return;const raw=await res.json();if(!Array.isArray(raw))return;
 const additional=raw.slice(0,100).map(validTheme).filter(Boolean),map=new Map(s.themes.map(t=>[t.id,t]));for(const t of additional)map.set(t.id,t);s.themes=[...map.values()];
 }catch(_){/* built-ins still available */}renderThemeGallery(); if(s.clientEvent&&$('rs-client-themes'))$('rs-client-themes').innerHTML=allThemes().map(x=>themeCard(x,'client')).join('');}
function allThemes(){const m=new Map(s.themes.map(x=>[x.id,x]));for(const t of savedThemes()){const valid=validTheme(t);if(valid)m.set(valid.id,valid);}return [...m.values()];}
function styleFrom(theme){const o={};for(const key of SAFE)if(theme[key]!==undefined)o[key]=theme[key];return o;}
function applyTheme(id,scope='all'){
 if(!s.user)return;
 const theme=allThemes().find(t=>t.id===id);if(!theme)return;
 const f=scope==='all'?FMT:[state.layout];for(const fmt of f)Object.assign(state.designs[fmt],styleFrom(theme),{bgColor:'#ffffff'});
 state.design=state.designs[state.layout];s.activeTheme=id;window.ragaActiveThemeId=id;
 renderContextualControls();renderPreview();renderThemeGallery();msg('Theme applied: '+theme.name+'. Save to Cloud to share changes.');
}
function themeCard(t,context='staff'){
 const active=(context==='client'?s.clientDesign.themeId:s.activeTheme)===t.id;
 const action=context==='client'?`ragaSelectClientTheme('${t.id}')`:`ragaApplyTheme('${t.id}')`;
 return `<button type="button" onclick="${action}" class="raga-theme-card${active?' active':''}" style="--themetext:${e(t.textColor||'#25272d')};--themeaccent:${e(t.accentColor||'#8b7551')};--themeborder:${e(t.borderColor||'#b5a78b')}"><span class="raga-theme-swatch"><span class="raga-theme-emblem">✦</span><span class="raga-theme-preview-title">MENU</span><span class="raga-theme-preview-line"></span><span class="raga-theme-preview-dots">—  ·  —</span></span><strong>${e(t.name)}</strong><span>${e(t.kind)}</span></button>`;
}
function renderThemeGallery(){const root=$('rs-theme-gallery');if(!root)return;const themes=allThemes();
 const list=themes.map(t=>themeCard(t)).join('');
 root.innerHTML=`<div class="raga-gallery-head"><div><h3>Design Theme Gallery</h3><p>20 complete presets · 10 bold and 10 mild · professional and wedding · all seven menu/tag formats</p></div><div class="raga-actions"><button class="raga-btn" onclick="ragaSaveCurrentTheme()">Save custom theme</button><button class="raga-btn" onclick="ragaExportThemes()">Export</button><label class="raga-btn" style="cursor:pointer">Import <input type="file" accept="application/json,.json" onchange="ragaImportThemes(event)" hidden></label></div></div><div class="raga-theme-grid">${list}</div><p class="raga-help">Choose a gallery theme to update fonts, typography sizes, colors and decorative borders across all formats. You can still fine-tune each format below. Custom themes stay in this browser unless exported or added to <code>themes/gallery.json</code> on GitHub.</p>`;
}
function saveCurrentTheme(){if(!s.user)return;const name=prompt('Custom theme name:');if(!name?.trim())return;
 const id='custom-'+crypto.randomUUID().slice(0,13),style=styleFrom(state.design),theme={id,name:name.trim(),kind:'custom',...style};
 const themes=savedThemes();themes.push(theme);localStorage.setItem('ragasaan_custom_themes_v1',JSON.stringify(themes));s.activeTheme=id;window.ragaActiveThemeId=id;renderThemeGallery();}
function exportThemes(){const blob=new Blob([JSON.stringify(savedThemes(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ragasaan-custom-themes.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
async function importThemes(ev){const f=ev.target.files?.[0];if(!f)return;try{const raw=JSON.parse(await f.text());if(!Array.isArray(raw))throw Error('Expected a JSON array');const got=raw.map(validTheme).filter(Boolean),map=new Map(savedThemes().map(x=>[x.id,x]));for(const t of got)map.set(t.id,t);localStorage.setItem('ragasaan_custom_themes_v1',JSON.stringify([...map.values()]));renderThemeGallery();alert(`Imported ${got.length} valid themes`);}catch(err){alert('Theme import failed: '+err.message);}finally{ev.target.value='';}}
function initClient(){const fragment=location.hash.match(/(?:^#|&)client=([a-f0-9]{64})/i);
 if(!fragment){$('rs-login-form').hidden=false;return false;}
 s.clientToken=fragment[1];
 // Fail closed before asynchronous /client/view: no staff navbar, cloud button,
 // Admin interface or event builder may be visible on the client invitation URL.
 document.body.classList.add('ragasaan-locked');
 $('ragasaan-cloud')?.classList.remove('open');
 $('ragasaan-admin')?.classList.remove('open');$('ragasaan-auth-root').classList.add('raga-client-on');$('rs-login-form').hidden=true;$('rs-client-panel').hidden=false;openClient().catch(err=>{$('rs-client-panel').innerHTML=`<div class="raga-login-card"><h2>Client link unavailable</h2><p>${e(err.message)}</p></div>`;});return true;
}
async function openClient(){const result=await call('/client/view','POST',{token:s.clientToken},false);s.clientEvent=result.event;s.clientCanPrint=result.canPrint===true;
 s.clientAllowed=CLIENT_PRINT_FORMATS.filter(f=>Array.isArray(result.clientFormats)?result.clientFormats.includes(f):true);
 if(!s.clientAllowed.length)throw Error('Client design access is disabled for this event.');
 s.clientFmt=s.clientAllowed.includes('half-a4')?'half-a4':s.clientAllowed[0];
 s.clientDesign={themeId:'executive-ivory',designs:{},coupleTitle:'',brideName:'',groomName:'',welcomeMessage:'',coupleLogo:'',coupleLogoWidth:110};
 const root=$('rs-client-panel');root.innerHTML=`<div class="raga-client-shell"><section class="raga-client-side"><h2>Ragasaan Client Design</h2><p class="raga-muted">${e(result.event.name)} · ${e(result.event.eventDate||'')}<br>${e(result.event.venue||'')} · Link expires ${new Date(result.expiresAt).toLocaleString()}</p><div class="raga-rule"></div><h3 class="raga-section-title">1. Select a theme</h3><div class="raga-client-themes" id="rs-client-themes"></div><div class="raga-rule"></div><h3 class="raga-section-title">2. Design format &amp; type</h3><select id="rs-client-fmt" class="raga-input" onchange="ragaClientChangeFormat(this.value)">${s.clientAllowed.map(f=>`<option value="${f}" ${f===s.clientFmt?'selected':''}>${e(FN[f])}</option>`).join('')}</select><div id="rs-client-controls"></div><div class="raga-rule"></div><h3 class="raga-section-title">3. Table Menu Card personalization</h3><p class="raga-help">These fields apply to the Table Menu Card only; event dishes, allergens and other formats remain unchanged.</p><div class="raga-client-form-grid"><label>Bride name<input class="raga-input" maxlength="100" id="rs-bride" oninput="ragaClientDetail('brideName',this.value)"></label><label>Groom name<input class="raga-input" maxlength="100" id="rs-groom" oninput="ragaClientDetail('groomName',this.value)"></label></div><label>Couple display title<input class="raga-input" id="rs-couple-title" maxlength="220" placeholder="${escAttr(result.event.name)}" oninput="ragaClientDetail('coupleTitle',this.value)"></label><label>Welcome message (Table Menu Card only)<textarea class="raga-input" rows="3" maxlength="450" id="rs-welcome" oninput="ragaClientDetail('welcomeMessage',this.value)"></textarea></label><label>Couple monogram / image (PNG, JPG, WebP; max 240 KB)<input type="file" class="raga-input" accept="image/png,image/jpeg,image/webp" onchange="ragaClientLogo(event)"></label><label>Couple logo width (px)<input type="number" class="raga-input" min="30" max="220" value="110" onchange="ragaClientDetail('coupleLogoWidth',Number(this.value))"></label><div class="raga-rule"></div><button id="rs-submit-design" class="raga-btn primary" onclick="ragaSubmitClientDesign()">Submit Design to Event Planner</button><p id="rs-client-notice" class="raga-alert" role="status"></p><p class="raga-help">Submitting saves design choices in Cloudflare D1. The Event Planner must review them. You cannot edit dishes or allergens here.</p></section><section class="raga-client-preview"><div class="raga-client-preview-head"><div><b id="rs-client-preview-title">Table Menu Card</b><p>Read-only design preview · supplied event menu</p></div><span class="raga-pill">Live preview</span></div><div id="rs-client-print-controls" class="raga-actions" aria-label="Client Print Studio"><strong>Print Studio</strong><button type="button" id="rs-client-save-pdf" class="raga-btn" onclick="ragaClientSavePDF()" ${s.clientCanPrint?'':'disabled'}>Save PDF</button><button type="button" id="rs-client-print" class="raga-btn primary" onclick="ragaClientPrintPreview()" ${s.clientCanPrint?'':'disabled'}>Print</button><small id="rs-client-print-status" class="raga-help">${s.clientCanPrint?'Approved for client printing':'Preview available; planner approval required for printing'}</small></div><div id="rs-client-paper" class="raga-client-paper"></div><p class="raga-help">This is the actual Print Studio template at scaled A4 dimensions, using the event menu supplied by your Event Planner. The Event Planner checks final output before printing.</p></section></div>`;
 ragaSelectClientTheme('executive-ivory');
}
function selectClientTheme(id){const t=allThemes().find(x=>x.id===id);if(!t)return;
 s.clientDesign.themeId=id;
 for(const fmt of s.clientAllowed)s.clientDesign.designs[fmt]={...styleFrom(t),bgColor:'#ffffff'};
 $('rs-client-themes').innerHTML=allThemes().map(x=>themeCard(x,'client')).join('');renderClientControls();renderClientPreview();}
function clientFormat(fmt){if(!s.clientAllowed.includes(fmt))return;s.clientFmt=fmt;renderClientControls();renderClientPreview();}
function detailClient(key,value){if(!['brideName','groomName','coupleTitle','welcomeMessage','coupleLogoWidth'].includes(key))return;
 if(key==='coupleLogoWidth')value=Math.max(30,Math.min(220,Number(value)||110));
 else value=String(value).slice(0,key==='welcomeMessage'?450:220);
 s.clientDesign[key]=value;renderClientPreview();}
function updateClientStyle(key,value){if(!SAFE.includes(key))return;
 const cfg=s.clientDesign.designs[s.clientFmt]||{};
 if(['borderWidth','borderOutsetCm','titleFontSize','dishNameFontSize','descFontSize','allergenFontSize'].includes(key))value=Number(value);
 cfg[key]=value;s.clientDesign.designs[s.clientFmt]=cfg;renderClientPreview();}
function renderClientControls(){const root=$('rs-client-controls');if(!root)return;const d=s.clientDesign.designs[s.clientFmt]||{};
 const color=(key,label)=>`<label>${label}<input type="color" value="${e(d[key]||'#000000')}" class="raga-input" onchange="ragaClientStyle('${key}',this.value)"></label>`;
 const select=(key,label,opts)=>`<label>${label}<select class="raga-input" onchange="ragaClientStyle('${key}',this.value)">${opts.map(([v,l])=>`<option value="${e(v)}" ${d[key]===v?'selected':''}>${e(l)}</option>`).join('')}</select></label>`;
 const number=(key,label,min,max,step=1)=>`<label>${label}<input class="raga-input" type="number" min="${min}" max="${max}" step="${step}" value="${e(d[key]??min)}" onchange="ragaClientStyle('${key}',this.value)"></label>`;
 root.innerHTML=`<div class="raga-client-form-grid">${select('titleFont','Title font',[['font-serif','Playfair Display'],['font-cormorant','Cormorant Garamond'],['font-script','Great Vibes'],['font-montserrat','Montserrat'],['font-sans','Inter']])}${select('bodyFont','Body font',[['font-serif','Playfair Display'],['font-cormorant','Cormorant Garamond'],['font-script','Great Vibes'],['font-montserrat','Montserrat'],['font-sans','Inter']])}${color('textColor','Text color')}${color('accentColor','Accent color')}${color('borderColor','Border color')}${select('borderStyle','Border style',['none','solid','double','dashed','dotted'].map(x=>[x,x]))}${number('borderWidth','Border width (mm)',0,5,.1)}${select('frameMotif','Decoration',[['none','None'],['fine-line','Fine line'],['art-deco','Art Deco'],['corner-flourish','Corner Flourish'],['botanical','Botanical']])}${number('titleFontSize','Title size (px)',10,72)}${number('dishNameFontSize','Dish font (px)',10,72)}${number('descFontSize','Description font (px)',10,72)}${number('allergenFontSize','Allergens font (px)',10,72)}</div>`;
}
function renderClientPreview(){
 const root=$('rs-client-paper');if(!root||!s.clientEvent)return;
 if(!s.clientAllowed.includes(s.clientFmt))return;
 root.replaceChildren();root.classList.add('raga-client-paper--actual');
 $('rs-client-preview-title').textContent=FN[s.clientFmt]+' · actual A4 print layout';
 try {
  const render=window.ragaRenderActualClientPages;
  if(typeof render!=='function')throw Error('Print renderer is not available. Refresh the website.');
  const pages=render(s.clientFmt,s.clientEvent,s.clientDesign,root);
  if(!pages)throw Error('No printable pages could be generated.');
  // Use the physical 210 x 297 mm layout; scale the whole sheet uniformly
  // for the available browser width (never recompute different HTML).
  const width=Math.max(230,root.parentElement?.clientWidth||650);
  const scale=Math.min(1,(width-40)/794);
  root.style.zoom=String(Math.max(.35,scale));
  let note=$('rs-client-pages');if(!note){note=document.createElement('p');note.id='rs-client-pages';note.className='raga-help';root.parentElement.append(note);}
  note.textContent=pages+' actual A4 '+(pages===1?'sheet':'sheets')+' · 210 × 297 mm · scaled '+Math.round(scale*100)+'% on screen';
 }catch(err){root.classList.remove('raga-client-paper--actual');root.style.zoom='1';root.textContent='Print preview unavailable: '+err.message;}
}
async function clientLogo(evt){const file=evt.target.files?.[0];if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>240_000){alert('Use PNG, JPG or WebP smaller than 240 KB.');return;}
 const reader=new FileReader();reader.onload=()=>{s.clientDesign.coupleLogo=String(reader.result);renderClientPreview();};reader.readAsDataURL(file);
}

function printClientPreview(){
 if(!s.clientCanPrint){const notice=$('rs-client-print-status');if(notice)notice.textContent='Planner approval required before client printing.';return;}
 if(!$('rs-client-paper')?.querySelector('.print-sheet')){alert('No printable client page.');return;}
 document.body.classList.add('raga-client-print');
 window.print();
}
window.addEventListener('afterprint',()=>document.body.classList.remove('raga-client-print'));
async function saveClientPdf(){
 const status=$('rs-client-print-status');
 if(!s.clientCanPrint){if(status)status.textContent='Planner approval required before client PDF download.';return;}
 if(typeof window.html2pdf!=='function'){if(status)status.textContent='PDF converter unavailable. Reload with internet access.';return;}
 const sheets=[...($('rs-client-paper')?.querySelectorAll('.print-sheet')||[])];
 if(!sheets.length){if(status)status.textContent='No client pages available';return;}
 const root=document.createElement('div');
 root.style.cssText='position:fixed;left:-20000px;top:0;width:210mm;background:#fff';
 sheets.forEach((page,i)=>{const el=page.cloneNode(true);el.style.cssText+=';width:210mm!important;height:297mm!important;zoom:1!important;transform:none!important;margin:0!important';el.removeAttribute('contenteditable');root.appendChild(el);if(i<sheets.length-1){const br=document.createElement('div');br.className='html2pdf__page-break';root.appendChild(br);}});
 $('rs-client-panel').appendChild(root);
 try{await window.html2pdf().set({margin:0,filename:'Ragasaan_Client_Design.pdf',image:{type:'jpeg',quality:.97},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy']}}).from(root).save();if(status)status.textContent='PDF saved.';}
 catch(err){if(status)status.textContent='Unable to save PDF: '+err.message;}
 finally{root.remove();}
}
async function submitClient(){if(!s.clientToken)return;
 const btn=$('rs-submit-design');btn.disabled=true;$('rs-client-notice').textContent='Submitting design…';
 try{const payload=data(s.clientDesign);if(!payload.coupleTitle){const couple=[payload.brideName,payload.groomName].filter(Boolean).join(' & ');payload.coupleTitle=couple||s.clientEvent.name||'';}const result=await call('/client/submit','POST',{token:s.clientToken,design:payload},false);
 $('rs-client-notice').textContent=result.applied===true?'Design saved immediately to the shared event. Your planner has an in-app review task; printing requires approval.':'Submission recorded. Your planner can review it; shared updates require the latest Security API.';
 }catch(err){$('rs-client-notice').textContent='Submission failed: '+err.message;}
 finally{btn.disabled=false;}
}
function copyLink(){const x=$('rs-link-output').value;if(!x)return;try{navigator.clipboard.writeText(x).then(()=>msg('Client link copied.')).catch(()=>{ $('rs-link-output').select();document.execCommand('copy');});}catch(_){$('rs-link-output').select();}}
function attach(){
 // The form uses an inline fail-closed submit handler so missing JS cannot silently reload the page.
 $('rs-open-cloud')?.addEventListener('click',openCloud);
 $('rs-client-pending-badge')?.addEventListener('click',()=>{
   openCloud();$('rs-pending-designs')?.scrollIntoView({block:'center',behavior:'smooth'});
 });
 $('rs-open-admin-qr')?.addEventListener('click',openAdminSettings);
 $('rs-close-admin')?.addEventListener('click',closeAdminSettings);
 $('ragasaan-admin')?.addEventListener('click',evt=>{if(evt.target===evt.currentTarget)closeAdminSettings();});
 $('rs-feedback-copy-save')?.addEventListener('click',()=>saveFeedbackCopy().catch(err=>msg(err.message,'error')));
 // Delegated handler survives Cloud Settings panel rerenders and always acknowledges clicks.
 document.addEventListener('click',event=>{
   const button=event.target.closest?.('#rs-company-publish, #rs-company-remove');
   if(!button)return;
   event.preventDefault();
   const status=$('rs-company-status');
   if(status){
     status.hidden=false;
     status.setAttribute('role','status');
     status.setAttribute('aria-live','polite');
     status.textContent='Checking administrator session...';
   }
   publishCompanyLogo(button.id==='rs-company-remove').catch(error=>{
     const detail='Company logo publish action failed: '+(error?.message||String(error));
     if(status)status.textContent=detail;
     msg(detail,'error');
   });
 });
 document.addEventListener('click',event=>{
   const button=event.target.closest?.('#rs-create-planner');
   if(button&&!event.defaultPrevented){event.preventDefault();createPlanner().catch(err=>msg(err.message,'error'));}
 });
 $('rs-company-upload')?.addEventListener('change',event=>{
   const file=event.target.files?.[0],status=$('rs-company-status');
   if(status&&file)status.textContent='Selected '+file.name+' ('+Math.ceil(file.size/1024)+' KB). Click Publish Company Logo to save for all users.';
 });
 $('rs-save-choices')?.addEventListener('click',saveChoiceOptions);
 $('rs-save-meal-defaults')?.addEventListener('click',saveMealDefaults);
 $('rs-save-print-rules')?.addEventListener('click',savePrintingRules);
 $('rs-manage-venues')?.addEventListener('click',()=>{if(s.user?.role==='admin'){closeCloud();window.switchTab?.('venues');}});
 $('rs-manage-registry')?.addEventListener('click',()=>{if(s.user?.role==='admin'){closeCloud();window.switchTab?.('master');}});
 $('rs-save-client-formats')?.addEventListener('click',saveAdminClientFormats);
 $('rs-feedback-save')?.addEventListener('click',()=>publishFeedbackQR(false));
 $('rs-feedback-remove')?.addEventListener('click',()=>publishFeedbackQR(true));

 $('rs-close-cloud')?.addEventListener('click',closeCloud);
 $('rs-logout')?.addEventListener('click',logout);
 $('rs-admin-login')?.addEventListener('click',window.ragaOpenAdminLogin);
 $('rs-cloud-save')?.addEventListener('click',()=>saveCloud().catch(x=>msg(x.message,'error')));
 $('rs-cloud-refresh')?.addEventListener('click',()=>refreshCloudList().catch(x=>msg(x.message,'error')));
 $('rs-make-link')?.addEventListener('click',createLink);
 $('rs-copy-link')?.addEventListener('click',copyLink);
 $('rs-list-links')?.addEventListener('click',()=>listLinks().catch(x=>msg(x.message,'error')));
 $('rs-load-submissions')?.addEventListener('click',loadSubmissions);
 $('rs-approve-print')?.addEventListener('click',approvePrint);
 $('rs-create-planner')?.addEventListener('click',event=>{event.preventDefault();createPlanner().catch(err=>msg(err.message,'error'));});
 $('rs-load-selected')?.addEventListener('click',()=>loadCloud(s.cloudEvent?.id).catch(x=>msg(x.message,'error')));
 $('rs-cloud')?.addEventListener('click',evt=>{if(evt.target===evt.currentTarget)closeCloud();});
 loadThemeGallery();
 // QR fetch is independent of staff login so client links show the exact printed QR.
 fetchFeedbackQR();fetchCompanyLogo().catch(()=>{});
 if(initClient())return;
 // Refresh pending design notifications when the planner returns to the app.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&s.user)refreshCloudList().catch(()=>{});});
 setInterval(()=>{if(s.user&&!document.hidden)refreshCloudList().catch(()=>{});},120000);
 const stored=JSON.parse(sessionStorage.getItem('raga_session')||'null');
 if(stored?.token && new Date(stored.expiresAt)>new Date()){
 s.token=stored.token;call('/me').then(u=>{s.user=u;document.body.classList.remove('ragasaan-locked');showAuthenticated();}).catch(err=>{onLoginError('Admin session expired: '+err.message);showPublic();});
 }else{sessionStorage.removeItem('raga_session');showPublic();}
}
// Export only specific event handlers to the global namespace for CSP-compatible markup callbacks.
Object.assign(window,{
 ragaLoginSubmit:login, ragaApplyTheme:applyTheme,ragaSaveCurrentTheme:saveCurrentTheme,ragaExportThemes:exportThemes,ragaImportThemes:importThemes,
 ragaSelectClientTheme:selectClientTheme,ragaClientChangeFormat:clientFormat,ragaClientDetail:detailClient,
 ragaClientStyle:updateClientStyle,ragaClientLogo:clientLogo,ragaSubmitClientDesign:submitClient,ragaClientPrintPreview:printClientPreview,ragaClientSavePDF:saveClientPdf
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
})();
