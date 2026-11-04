/* Ragasaan Menu Studio — security and collaboration integration, 2026-11.
   No secrets in this file. D1 permissions are enforced in the security Worker.
   Session token stays in sessionStorage only. Client tokens travel in URL fragments.
*/
(() => {
'use strict';
const API='https://ragasaan-security-api.arunkumarnkl.workers.dev';
const FMT=['a4','a4-live','half-a4','a8-grid','foldtags-grid','a6-grid','canape-grid'];
const FN={'a4':'Buffet A4','a4-live':'Live Station','half-a4':'Table Menu Card','a8-grid':'A8 Tags','foldtags-grid':'FoldTags','a6-grid':'A6 Tags','canape-grid':'Canapé Labels'};
const PRESETS=[{"id":"executive-ivory","name":"Executive Ivory","kind":"professional","titleFont":"font-serif","bodyFont":"font-sans","textColor":"#24272d","accentColor":"#8b7551","borderColor":"#b5a78b","borderStyle":"solid","borderWidth":0.7,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"midnight-premier","name":"Midnight Premier","kind":"professional","titleFont":"font-montserrat","bodyFont":"font-sans","textColor":"#18243a","accentColor":"#2d5172","borderColor":"#456982","borderStyle":"double","borderWidth":1.1,"frameMotif":"art-deco","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"modern-minimal","name":"Modern Minimal","kind":"professional","titleFont":"font-sans","bodyFont":"font-sans","textColor":"#111827","accentColor":"#475569","borderColor":"#64748b","borderStyle":"solid","borderWidth":0.3,"frameMotif":"none","titleFontSize":19,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"heritage-burgundy","name":"Heritage Burgundy","kind":"professional","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#38252b","accentColor":"#70283c","borderColor":"#a47483","borderStyle":"double","borderWidth":1,"frameMotif":"corner-flourish","titleFontSize":22,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"botanical-emerald","name":"Botanical Emerald","kind":"professional","titleFont":"font-cormorant","bodyFont":"font-sans","textColor":"#20392e","accentColor":"#33755e","borderColor":"#7d9e8d","borderStyle":"solid","borderWidth":0.8,"frameMotif":"botanical","titleFontSize":21,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"slate-gold","name":"Slate & Gold","kind":"professional","titleFont":"font-montserrat","bodyFont":"font-sans","textColor":"#202835","accentColor":"#987637","borderColor":"#aa904f","borderStyle":"double","borderWidth":1.2,"frameMotif":"art-deco","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10,"weightGroup":"bold"},{"id":"romantic-blush","name":"Romantic Blush","kind":"wedding","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#573d47","accentColor":"#b67789","borderColor":"#cfa5b0","borderStyle":"double","borderWidth":0.9,"frameMotif":"corner-flourish","titleFontSize":25,"dishNameFontSize":14,"descFontSize":12,"allergenFontSize":10,"weightGroup":"mild"},{"id":"royal-wedding","name":"Royal Wedding","kind":"wedding","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#2c2532","accentColor":"#a07b35","borderColor":"#beaa76","borderStyle":"double","borderWidth":1.3,"frameMotif":"art-deco","titleFontSize":23,"dishNameFontSize":14,"descFontSize":12,"allergenFontSize":10,"weightGroup":"mild"},{"id":"garden-ceremony","name":"Garden Ceremony","kind":"wedding","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#2e4736","accentColor":"#698868","borderColor":"#92aa8e","borderStyle":"solid","borderWidth":0.9,"frameMotif":"botanical","titleFontSize":25,"dishNameFontSize":14,"descFontSize":12,"allergenFontSize":10,"weightGroup":"mild"},{"id":"monarch-navy","name":"Monarch Navy","kind":"professional","weightGroup":"bold","titleFont":"font-montserrat","bodyFont":"font-serif","textColor":"#f1f5f9","accentColor":"#0f3563","borderColor":"#284b73","borderStyle":"double","borderWidth":1,"frameMotif":"art-deco","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"crimson-gala","name":"Crimson Gala","kind":"wedding","weightGroup":"bold","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#562a32","accentColor":"#9d283b","borderColor":"#b95b69","borderStyle":"double","borderWidth":1,"frameMotif":"corner-flourish","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"copper-regency","name":"Copper Regency","kind":"wedding","weightGroup":"bold","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#4b3027","accentColor":"#a24d30","borderColor":"#b88f78","borderStyle":"double","borderWidth":1,"frameMotif":"corner-flourish","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"golden-celebration","name":"Golden Celebration","kind":"wedding","weightGroup":"bold","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#533c1d","accentColor":"#a57a19","borderColor":"#c9af63","borderStyle":"double","borderWidth":1,"frameMotif":"art-deco","titleFontSize":24,"dishNameFontSize":14,"descFontSize":11,"allergenFontSize":10},{"id":"linen-serif","name":"Linen Serif","kind":"professional","weightGroup":"mild","titleFont":"font-serif","bodyFont":"font-sans","textColor":"#333335","accentColor":"#8a847f","borderColor":"#cabfb1","borderStyle":"solid","borderWidth":0.6,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"sage-elegance","name":"Sage Elegance","kind":"wedding","weightGroup":"mild","titleFont":"font-cormorant","bodyFont":"font-cormorant","textColor":"#364c40","accentColor":"#78927e","borderColor":"#a9bbaa","borderStyle":"solid","borderWidth":0.6,"frameMotif":"botanical","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"powder-blue","name":"Powder Blue","kind":"professional","weightGroup":"mild","titleFont":"font-sans","bodyFont":"font-sans","textColor":"#304156","accentColor":"#718ea4","borderColor":"#afc1d0","borderStyle":"solid","borderWidth":0.6,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"blush-linen","name":"Blush Linen","kind":"wedding","weightGroup":"mild","titleFont":"font-script","bodyFont":"font-cormorant","textColor":"#62464d","accentColor":"#bf9ca5","borderColor":"#d2b9be","borderStyle":"solid","borderWidth":0.6,"frameMotif":"corner-flourish","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"soft-pearl","name":"Soft Pearl","kind":"professional","weightGroup":"mild","titleFont":"font-cormorant","bodyFont":"font-sans","textColor":"#4c5158","accentColor":"#87929b","borderColor":"#c8ced3","borderStyle":"solid","borderWidth":0.6,"frameMotif":"fine-line","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"almond-garden","name":"Almond Garden","kind":"wedding","weightGroup":"mild","titleFont":"font-cormorant","bodyFont":"font-sans","textColor":"#514e3e","accentColor":"#a59d75","borderColor":"#cbc5a5","borderStyle":"double","borderWidth":0.6,"frameMotif":"botanical","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10},{"id":"lavender-mist","name":"Lavender Mist","kind":"wedding","weightGroup":"mild","titleFont":"font-serif","bodyFont":"font-cormorant","textColor":"#534f65","accentColor":"#8b86a8","borderColor":"#bdb8d0","borderStyle":"solid","borderWidth":0.6,"frameMotif":"corner-flourish","titleFontSize":20,"dishNameFontSize":13,"descFontSize":11,"allergenFontSize":10}];
const SAFE=['titleFont','bodyFont','textColor','accentColor','bgColor','borderColor','borderStyle','borderWidth','borderOutsetCm','titleFontSize','dishNameFontSize','descFontSize','allergenFontSize','frameMotif'];
const s={token:null, user:null,cloudEvent:null, events:[], planners:[], activeTheme:'', clientToken:null, clientEvent:null, clientDesign:{designs:{}},clientFmt:'half-a4',themes:[...PRESETS], pendingChanges:false};
const $=id=>document.getElementById(id);
const e=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const escAttr=e;
const data=x=>JSON.parse(JSON.stringify(x));
function msg(t,kind=''){const el=$('rs-cloud-message');if(el){el.textContent=t;el.className='raga-alert '+(kind==='error'?'raga-error':'');}}
function onLoginError(t){const el=$('rs-login-error');if(el)el.textContent=t;}
async function call(path,method='GET',body,auth=true){
  const headers={'Content-Type':'application/json'};
  if(auth&&s.token)headers.Authorization='Bearer '+s.token;
  let res;
  try{res=await fetch(API+path,{method,headers,cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});}catch(err){throw Error('Cannot connect to Security API. Check internet, Worker deployment and ALLOWED_ORIGIN.');}
  const json=await res.json().catch(()=>({}));
  if(!res.ok){if(res.status===401&&auth){s.token=null;s.user=null;sessionStorage.removeItem('raga_session');document.body.classList.add('ragasaan-locked');onLoginError('Session expired. Please sign in again.');}
    throw Error(json.error||`HTTP ${res.status}`);}
  return json;
}
function gateStatus(){const label=$('rs-user-info');if(label)label.textContent=s.user?`${s.user.name} · ${s.user.role==='admin'?'Administrator':'Event Planner'}`:'Not signed in';}
async function login(evt){evt?.preventDefault();onLoginError('Signing in…');try{
 const result=await call('/login','POST',{email:$('rs-email').value.trim(),password:$('rs-password').value},false);
 if(!result.token||!['admin','planner'].includes(result.user?.role))throw Error('Invalid role from Security API');
 s.token=result.token;s.user=result.user;sessionStorage.setItem('raga_session',JSON.stringify({token:result.token,expiresAt:result.expiresAt}));
 $('rs-password').value='';document.body.classList.remove('ragasaan-locked'); $('ragasaan-auth-root').classList.remove('raga-client-on');
 showAuthenticated();
 }catch(err){onLoginError(err.message);}
}
async function logout(){try{if(s.token)await call('/logout','POST',{},true)}catch(_){}finally{s.token=null;s.user=null;s.cloudEvent=null;sessionStorage.removeItem('raga_session');document.body.classList.add('ragasaan-locked');onLoginError('Signed out.');}}
function showAuthenticated(){gateStatus();
  const venueButton=$('tab-btn-venues');if(venueButton)venueButton.hidden=s.user?.role!=='admin';
  const venueTab=$('tab-venues');if(venueTab&&s.user?.role!=='admin')venueTab.hidden=true;
document.querySelectorAll('[data-rs-admin]').forEach(n=>n.hidden=s.user?.role!=='admin');
  document.querySelectorAll('[data-rs-staff]').forEach(n=>n.hidden=!s.user);
  const banner=$('rs-security-banner');if(banner)banner.textContent='Cloud events are shared through D1. Browser backups remain local. GitHub master publishing uses separate Admin authentication.';
  renderThemeGallery();refreshCloudList().catch(x=>msg(x.message,'error'));
  // Existing local master UI is not an authorization boundary; publication is still checked by the separate GitHub Worker.
  {const master=$('tab-master');if(master)master.querySelectorAll('button[onclick*="requestMasterAuthorization"], #github-save-button').forEach(b=>b.hidden=s.user?.role!=='admin');}
}
function openCloud(){if(!s.user)return; $('ragasaan-cloud').classList.add('open');refreshCloudList().catch(err=>msg(err.message,'error'));}
function closeCloud(){$('ragasaan-cloud').classList.remove('open');}
function opt(rows,idKey='id',labelKey='name'){return rows.map(r=>`<option value="${escAttr(r[idKey])}">${e(r[labelKey])}</option>`).join('');}
async function refreshCloudList(){if(!s.user)return;
 const r=await call('/events');s.events=r.events||[];
 const list=$('rs-cloud-events');if(!list)return;
 list.innerHTML=s.events.length?s.events.map(x=>`<div class="raga-list-item"><strong>${e(x.name)}</strong> <span class="raga-pill">${e(x.status)}</span><div class="raga-small">${e(x.eventDate||'Date not set')} · ${e(x.venue||'No venue')}</div><div class="raga-actions"><button class="raga-btn" data-load-cloud="${e(x.id)}">Load</button><button class="raga-btn" data-manage-cloud="${e(x.id)}">Manage</button></div></div>`).join(''):'<p class="raga-help">No cloud events yet. Save the event in your current builder using “Save to Cloud”.</p>';
 list.querySelectorAll('[data-load-cloud]').forEach(b=>b.onclick=()=>loadCloud(b.dataset.loadCloud));
 list.querySelectorAll('[data-manage-cloud]').forEach(b=>b.onclick=()=>selectCloud(b.dataset.manageCloud));
 const current=s.cloudEvent&&s.events.find(x=>x.id===s.cloudEvent.id);
 if(current)s.cloudEvent=current;
 drawSelected();
 if(s.user.role==='admin')await refreshPlanners();
}
async function refreshPlanners(){const r=await call('/users/planners');s.planners=r.planners||[];const sel=$('rs-event-planner');
 if(sel){sel.innerHTML='<option value="">Not yet assigned</option>'+s.planners.filter(p=>p.active).map(x=>`<option value="${e(x.id)}">${e(x.display_name)} · ${e(x.email)}</option>`).join('');if(s.cloudEvent)sel.value=s.cloudEvent.plannerUserId||'';}
 const root=$('rs-planner-list');if(root)root.innerHTML=s.planners.map(p=>`<div class="raga-list-item"><strong>${e(p.display_name)}</strong><div class="raga-small">${e(p.email)} · ${p.active?'Active':'Inactive'}</div>${p.active?`<button data-deactivate="${e(p.id)}" class="raga-btn danger">Deactivate</button>`:''}</div>`).join('');
 root?.querySelectorAll('[data-deactivate]').forEach(b=>b.onclick=async()=>{if(!confirm('Deactivate this planner and revoke their sessions?'))return;try{await call('/users/planners/'+b.dataset.deactivate+'/deactivate','POST',{});await refreshPlanners();}catch(x) {msg(x.message,'error');}});
}
function selectCloud(id){s.cloudEvent=s.events.find(x=>x.id===id)||null;drawSelected();}
function drawSelected(){const el=$('rs-cloud-selected');if(!el)return;
 const x=s.cloudEvent;
 el.innerHTML=x?`<b>${e(x.name)}</b> <span class="raga-pill">${e(x.status)}</span><div class="raga-small">Cloud ID: ${e(x.id)}</div>`:'No cloud event selected';
 const sel=$('rs-event-planner');if(sel&&x)sel.value=x.plannerUserId||'';
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
async function saveCloud(){if(!s.user)throw Error('Sign in first');
 const snapshot=compactCloudSnapshot(eventSnapshot()),current=s.cloudEvent;
 const chosenName=String(snapshot.name||snapshot.title||'Event').trim();
 const payload={name:chosenName,eventDate:snapshot.date||'',venue:snapshot.venue||'',partyNo:snapshot.partyNo||'',eventData:snapshot};
 if(s.user.role==='admin'){const planner=$('rs-event-planner');payload.plannerUserId=planner?.value||null;}
 if(!current){const r=await call('/events','POST',payload);s.cloudEvent={id:r.id,...payload,status:'draft'};msg('Cloud event created. You can now make a client access link.');}
 else {const confirmed=confirm('Overwrite the selected cloud event with the current builder snapshot? This resets print approval.');if(!confirmed)return;
 await call('/events/'+current.id,'PUT',payload);msg('Cloud event saved; printing approval has been reset.');}
 await refreshCloudList();
}
async function loadCloud(id){const x=await call('/events/'+id);if(!x.event)throw Error('Cloud event not found');
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
 const root=$('rs-submissions-list');root.innerHTML=(r.submissions||[]).map(x=>`<div class="raga-list-item"><b>Design revision ${x.revision}</b> · <span class="raga-pill">${e(x.status)}</span><div class="raga-small">Submitted ${e(x.submitted_at)} · Theme: ${e(x.design?.themeId||'Custom')}</div><div class="raga-actions"><button class="raga-btn" data-preview-rev="${e(x.id)}">View settings</button>${s.user.role==='planner'&&x.status==='submitted'?`<button class="raga-btn primary" data-review="${e(x.id)}" data-review-status="approved">Approve design</button><button class="raga-btn" data-review="${e(x.id)}" data-review-status="changes_requested">Request changes</button><button class="raga-btn danger" data-review="${e(x.id)}" data-review-status="rejected">Reject</button>`:''}</div></div>`).join('')||'<p class="raga-help">No submissions yet. Create a client link above.</p>';
 root.querySelectorAll('[data-preview-rev]').forEach(b=>b.onclick=()=>{const item=(r.submissions||[]).find(x=>x.id===b.dataset.previewRev);if(item)showSubmissionDesign(item);});
 root.querySelectorAll('[data-review]').forEach(b=>b.onclick=async()=>{const note=b.dataset.reviewStatus==='approved'?'':(prompt('Review note (optional):')??'');if(!confirm(`Mark this design ${b.dataset.reviewStatus.replace('_',' ')}?`))return;
 try{await call('/events/'+s.cloudEvent.id+'/submissions/'+b.dataset.review+'/review','POST',{status:b.dataset.reviewStatus,note});msg('Submission '+b.dataset.reviewStatus+'. Approved designs are merged into the cloud event; load it again to preview.');await loadSubmissions();await refreshCloudList();}catch(err){msg(err.message,'error');}});
 }catch(err){msg(err.message,'error');}}
function showSubmissionDesign(item){const d=item.design||{};const root=$('rs-design-inspector');
 root.innerHTML=`<b>Revision ${item.revision} · ${e(item.status)}</b><p>Theme: ${e(d.themeId||'Custom')}<br>Table name: ${e(d.coupleTitle||[d.brideName,d.groomName].filter(Boolean).join(' & '))}<br>Welcome message: ${e(d.welcomeMessage||'')}</p><div class="raga-small">${Object.entries(d.designs||{}).map(([fmt,x])=>e(FN[fmt]||fmt)+': '+e(x.titleFont||'')+', '+e(x.accentColor||'')).join(' · ')}</div>`;}
async function approvePrint(){if(!s.cloudEvent)return;try{await call('/events/'+s.cloudEvent.id+'/approve-print','POST',{});msg('Printing approved for this cloud event.');await refreshCloudList();}catch(err){msg(err.message,'error');}}
async function createPlanner(){if(s.user?.role!=='admin')return;
 const email=$('rs-new-planner-email').value.trim(),name=$('rs-new-planner-name').value.trim(),password=$('rs-new-planner-password').value;
 try{await call('/users/planners','POST',{email,name,password});$('rs-new-planner-password').value='';msg('Event Planner created. Share their initial password through a secure channel.');await refreshPlanners();}catch(err){msg(err.message,'error');}}
// The public HTML can be bypassed; this guard provides operational UI workflow protection only.
// The backend independently authorizes cloud event, client link, submission, approval and print-status calls.
async function canPrint(){if(!s.user){alert('Please sign in to print.');return false;}
 if(s.user.role==='admin')return true;
 if(!s.cloudEvent){alert('Select a saved cloud event before printing. The Event Planner must approve printing.');openCloud();return false;}
 try{const check=await call('/events/'+s.cloudEvent.id+'/print-status');if(!check.allowed){alert('Printing not approved for this cloud event. Review the latest design and approve printing.');openCloud();return false;}
 // Ensure local working draft matches the cloud approved snapshot, rather than an unsaved edit.
 const latest=await call('/events/'+s.cloudEvent.id);
 if(!s.loadedSnapshot||!s.loadedRemote||JSON.stringify(compactCloudSnapshot(eventSnapshot()))!==s.loadedSnapshot||JSON.stringify(latest.event?.eventData)!==s.loadedRemote){
   alert('Your browser contains unsaved changes, or the approved cloud event was updated. Load the approved cloud event before printing.');return false;
 }
 return true;
 }catch(err){alert('Unable to verify printing approval: '+err.message);return false;}}
function lockMaster(){if(s.user?.role!=='admin'){alert('Only the Admin can modify the master allergen database.');return false;}return true;}
const nativeRequestMaster=window.requestMasterAuthorization;
window.requestMasterAuthorization=function(label,callback){if(!lockMaster())return;return nativeRequestMaster(label,callback);};
const originalSwitchTab=window.switchTab;
if(typeof originalSwitchTab==='function')window.switchTab=function(name){if(name==='venues'&&s.user?.role!=='admin')return;return originalSwitchTab.apply(this,arguments);};
const originalMasterRender=window.renderMasterDB;
if(typeof originalMasterRender==='function')window.renderMasterDB=function(...args){const result=originalMasterRender.apply(this,args);if(s.user?.role!=='admin')document.querySelectorAll('#tab-master button[onclick*="requestMasterAuthorization"]').forEach(b=>b.hidden=true);return result;};
for(const fn of ['publishMasterToGitHub','saveDishModal','deleteDish','openDishModal','importExcel']){
 const original=window[fn];if(typeof original==='function')window[fn]=function(...args){if(!lockMaster())return;return original.apply(this,args);};
}
for(const fn of ['triggerPrint','downloadPDF','printEventSummary','exportClientSummaryWord','exportFormatWord']){
 const native=window[fn];if(typeof native==='function')window[fn]=async function(...args){if(!(await canPrint()))return;return native.apply(this,args);};
}
// A browser's Ctrl+P cannot be server-authorized. Reduce accidental bypass with a beforeprint warning.
window.addEventListener('beforeprint',()=>{if(!s.user||s.user.role==='planner'&&!s.cloudEvent)document.body.classList.add('raga-print-blocked');});
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
 s.clientToken=fragment[1];$('ragasaan-auth-root').classList.add('raga-client-on');$('rs-login-form').hidden=true;$('rs-client-panel').hidden=false;openClient().catch(err=>{$('rs-client-panel').innerHTML=`<div class="raga-login-card"><h2>Client link unavailable</h2><p>${e(err.message)}</p></div>`;});return true;
}
async function openClient(){const result=await call('/client/view','POST',{token:s.clientToken},false);s.clientEvent=result.event;
 s.clientDesign={themeId:'executive-ivory',designs:{},coupleTitle:'',brideName:'',groomName:'',welcomeMessage:'',coupleLogo:'',coupleLogoWidth:110};
 const root=$('rs-client-panel');root.innerHTML=`<div class="raga-client-shell"><section class="raga-client-side"><h2>Ragasaan Client Design</h2><p class="raga-muted">${e(result.event.name)} · ${e(result.event.eventDate||'')}<br>${e(result.event.venue||'')} · Link expires ${new Date(result.expiresAt).toLocaleString()}</p><div class="raga-rule"></div><h3 class="raga-section-title">1. Select a theme</h3><div class="raga-client-themes" id="rs-client-themes"></div><div class="raga-rule"></div><h3 class="raga-section-title">2. Design format &amp; type</h3><select id="rs-client-fmt" class="raga-input" onchange="ragaClientChangeFormat(this.value)">${FMT.map(f=>`<option value="${f}" ${f==='half-a4'?'selected':''}>${e(FN[f])}</option>`).join('')}</select><div id="rs-client-controls"></div><div class="raga-rule"></div><h3 class="raga-section-title">3. Table Menu Card personalization</h3><p class="raga-help">These fields apply to the Table Menu Card only; event dishes, allergens and other formats remain unchanged.</p><div class="raga-client-form-grid"><label>Bride name<input class="raga-input" maxlength="100" id="rs-bride" oninput="ragaClientDetail('brideName',this.value)"></label><label>Groom name<input class="raga-input" maxlength="100" id="rs-groom" oninput="ragaClientDetail('groomName',this.value)"></label></div><label>Couple display title<input class="raga-input" id="rs-couple-title" maxlength="220" placeholder="${escAttr(result.event.name)}" oninput="ragaClientDetail('coupleTitle',this.value)"></label><label>Welcome message (Table Menu Card only)<textarea class="raga-input" rows="3" maxlength="450" id="rs-welcome" oninput="ragaClientDetail('welcomeMessage',this.value)"></textarea></label><label>Couple monogram / image (PNG, JPG, WebP; max 240 KB)<input type="file" class="raga-input" accept="image/png,image/jpeg,image/webp" onchange="ragaClientLogo(event)"></label><label>Couple logo width (px)<input type="number" class="raga-input" min="30" max="220" value="110" onchange="ragaClientDetail('coupleLogoWidth',Number(this.value))"></label><div class="raga-rule"></div><button id="rs-submit-design" class="raga-btn primary" onclick="ragaSubmitClientDesign()">Submit Design to Event Planner</button><p id="rs-client-notice" class="raga-alert" role="status"></p><p class="raga-help">Submitting saves design choices in Cloudflare D1. The Event Planner must review them. You cannot edit dishes or allergens here.</p></section><section class="raga-client-preview"><div class="raga-client-preview-head"><div><b id="rs-client-preview-title">Table Menu Card</b><p>Read-only design preview · supplied event menu</p></div><span class="raga-pill">Live preview</span></div><div id="rs-client-paper" class="raga-client-paper"></div><p class="raga-help">Preview is illustrative; final print geometry is checked by the Event Planner in Menu Studio.</p></section></div>`;
 ragaSelectClientTheme('executive-ivory');
}
function selectClientTheme(id){const t=allThemes().find(x=>x.id===id);if(!t)return;
 s.clientDesign.themeId=id;
 for(const fmt of FMT)s.clientDesign.designs[fmt]={...styleFrom(t),bgColor:'#ffffff'};
 $('rs-client-themes').innerHTML=allThemes().map(x=>themeCard(x,'client')).join('');renderClientControls();renderClientPreview();}
function clientFormat(fmt){if(!FMT.includes(fmt))return;s.clientFmt=fmt;renderClientControls();renderClientPreview();}
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
function renderClientPreview(){const root=$('rs-client-paper');if(!root||!s.clientEvent)return;
 const d=s.clientDesign.designs[s.clientFmt]||{},ev=s.clientEvent,formatted=s.clientFmt;
 const family=x=>({'font-serif':'Playfair Display,serif','font-cormorant':'Cormorant Garamond,serif','font-script':'Great Vibes,cursive','font-montserrat':'Montserrat,sans-serif','font-sans':'Inter,sans-serif'})[x]||'serif';
 const color=d.textColor||'#25272d',accent=d.accentColor||'#8b7551';
 const border=d.borderStyle==='none'?'none':`${Math.max(1,Number(d.borderWidth)||.7)*2}px ${d.borderStyle||'solid'} ${d.borderColor||accent}`;
 const sample=ev.menu.filter(x=>!x.printFormats?.length||x.printFormats.includes(formatted)).slice(0,12);
 const rows=sample.length?sample.map(x=>`<div class="raga-paper-dish"><b style="font-size:${Math.min(22,Number(d.dishNameFontSize)||13)}px">${e(x.name)}</b>${x.desc?`<div class="raga-paper-desc">${e(x.desc)}</div>`:''}<small>${x.allergens?.length?`Allergens: ${e(x.allergens.join(', '))}`:''}${x.mayContain?.length?` · May contain: ${e(x.mayContain.join(', '))}`:''}</small></div>`).join(''):'<div class="raga-paper-dish">The Event Planner has not assigned dishes to this format.</div>';
 const name=formatted==='half-a4'?s.clientDesign.coupleTitle||[s.clientDesign.brideName,s.clientDesign.groomName].filter(Boolean).join(' & ')||ev.name:ev.name;
 const motif={'art-deco':'◇　✦　◇','corner-flourish':'❦　✦　❦','botanical':'❧　✦　❧','fine-line':'—　✦　—','none':''}[d.frameMotif||'none'];
 root.innerHTML=`<div class="raga-paper-inner" style="color:${color};border:${border};font-family:${family(d.bodyFont)}"><div style="color:${accent};text-align:center;font-size:19px;padding-bottom:8px">${motif}</div><h1 style="color:${accent};font-family:${family(d.titleFont)};font-size:${Math.min(36,Number(d.titleFontSize)||20)+8}px">${e(name)}</h1><div class="raga-paper-meta">${e(ev.eventDate||'')} · ${e(ev.venue||'')}</div>${formatted==='half-a4'&&s.clientDesign.coupleLogo?`<img alt="Couple monogram" src="${s.clientDesign.coupleLogo}" style="width:${Math.min(220,s.clientDesign.coupleLogoWidth||110)}px;height:auto;max-width:100%;margin:12px auto">`:''}${formatted==='half-a4'&&s.clientDesign.welcomeMessage?`<div class="raga-paper-welcome">${e(s.clientDesign.welcomeMessage)}</div>`:''}<h2 style="font:700 18px ${family(d.titleFont)};color:${accent};margin:14px 0">${e(FN[formatted])}</h2><div class="raga-paper-menu">${rows}</div><div class="raga-paper-footer">Ragasaan · Preview only · Event Planner verifies print layout</div></div>`;
 $('rs-client-preview-title').textContent=FN[formatted];
}
async function clientLogo(evt){const file=evt.target.files?.[0];if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>240_000){alert('Use PNG, JPG or WebP smaller than 240 KB.');return;}
 const reader=new FileReader();reader.onload=()=>{s.clientDesign.coupleLogo=String(reader.result);renderClientPreview();};reader.readAsDataURL(file);
}
async function submitClient(){if(!s.clientToken)return;
 const btn=$('rs-submit-design');btn.disabled=true;$('rs-client-notice').textContent='Submitting design…';
 try{const payload=data(s.clientDesign);if(!payload.coupleTitle){const couple=[payload.brideName,payload.groomName].filter(Boolean).join(' & ');payload.coupleTitle=couple||s.clientEvent.name||'';}const result=await call('/client/submit','POST',{token:s.clientToken,design:payload},false);
 $('rs-client-notice').textContent='Submitted successfully (revision stored). Your Event Planner can now review the design.';
 }catch(err){$('rs-client-notice').textContent='Submission failed: '+err.message;}
 finally{btn.disabled=false;}
}
function copyLink(){const x=$('rs-link-output').value;if(!x)return;try{navigator.clipboard.writeText(x).then(()=>msg('Client link copied.')).catch(()=>{ $('rs-link-output').select();document.execCommand('copy');});}catch(_){$('rs-link-output').select();}}
function attach(){
 // The form uses an inline fail-closed submit handler so missing JS cannot silently reload the page.
 $('rs-open-cloud')?.addEventListener('click',openCloud);
 $('rs-close-cloud')?.addEventListener('click',closeCloud);
 $('rs-logout')?.addEventListener('click',logout);
 $('rs-cloud-save')?.addEventListener('click',()=>saveCloud().catch(x=>msg(x.message,'error')));
 $('rs-cloud-refresh')?.addEventListener('click',()=>refreshCloudList().catch(x=>msg(x.message,'error')));
 $('rs-make-link')?.addEventListener('click',createLink);
 $('rs-copy-link')?.addEventListener('click',copyLink);
 $('rs-list-links')?.addEventListener('click',()=>listLinks().catch(x=>msg(x.message,'error')));
 $('rs-load-submissions')?.addEventListener('click',loadSubmissions);
 $('rs-approve-print')?.addEventListener('click',approvePrint);
 $('rs-create-planner')?.addEventListener('click',createPlanner);
 $('rs-load-selected')?.addEventListener('click',()=>loadCloud(s.cloudEvent?.id).catch(x=>msg(x.message,'error')));
 $('rs-cloud')?.addEventListener('click',evt=>{if(evt.target===evt.currentTarget)closeCloud();});
 loadThemeGallery();
 if(initClient())return;
 const stored=JSON.parse(sessionStorage.getItem('raga_session')||'null');
 if(stored?.token && new Date(stored.expiresAt)>new Date()){
 s.token=stored.token;call('/me').then(u=>{s.user=u;document.body.classList.remove('ragasaan-locked');showAuthenticated();}).catch(err=>{onLoginError('Please sign in: '+err.message);document.body.classList.add('ragasaan-locked');});
 }else{sessionStorage.removeItem('raga_session');}
}
// Export only specific event handlers to the global namespace for CSP-compatible markup callbacks.
Object.assign(window,{
 ragaLoginSubmit:login, ragaApplyTheme:applyTheme,ragaSaveCurrentTheme:saveCurrentTheme,ragaExportThemes:exportThemes,ragaImportThemes:importThemes,
 ragaSelectClientTheme:selectClientTheme,ragaClientChangeFormat:clientFormat,ragaClientDetail:detailClient,
 ragaClientStyle:updateClientStyle,ragaClientLogo:clientLogo,ragaSubmitClientDesign:submitClient
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
})();
