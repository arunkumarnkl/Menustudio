// REVIEW-ONLY SECURITY WORKER REFERENCE — DO NOT DIRECTLY DEPLOY.
// Based on earlier approved release in Library; compare against CURRENT deployed Worker first.
// Only event-list timestamps/sort were changed; Admin security release compatibility remains unverified.
/* Ragasaan Security API v1 — Cloudflare Worker + D1.
   Deploy ONLY to ragasaan-security-api (not ragasaan-allergen-sync).
   Required D1 binding: DB; secret: BOOTSTRAP_SECRET; variable: ALLOWED_ORIGIN.
   Existing menu UI is NOT connected by deploying this Worker alone.
*/
const enc = new TextEncoder();
const MAX_JSON = 750_000;
const TOKEN_TTL_HOURS = 8;
const ITERATIONS = 100000; // Cloudflare Workers WebCrypto PBKDF2 maximum
const corsMethods = 'GET, POST, PUT, OPTIONS';
const STYLE_FORMATS=new Set(['a4','a4-live','half-a4','a8-grid','foldtags-grid','a6-grid','canape-grid']);
const CLIENT_PRINT_FORMATS=['a4','a6-grid','a4-live','half-a4'];

const FONT_OPTIONS=new Set(['font-serif','font-cormorant','font-script','font-montserrat','font-sans']);
const BORDER_OPTIONS=new Set(['none','solid','double','dashed','dotted']);
const MOTIF_OPTIONS=new Set(['none','fine-line','corner-flourish','art-deco','botanical']);
const SAFE_STYLE_FIELDS=new Set(['titleFont','bodyFont','textColor','accentColor','bgColor','borderColor','borderStyle','borderWidth','titleFontSize','dishNameFontSize','descFontSize','allergenFontSize','borderOutsetCm','frameMotif']);
function reply(payload, status=200, headers={}) {
  return new Response(JSON.stringify(payload), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
function error(message,status=400){return reply({error:message},status);}
function hex(bytes){return Array.from(bytes, b=>b.toString(16).padStart(2,'0')).join('');}
function rand(){return hex(crypto.getRandomValues(new Uint8Array(32)));}
function id(){return crypto.randomUUID();}
async function sha(s){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s))));}
async function hashPassword(password,salt,iterations=ITERATIONS){
  const k=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations},k,256)));
}
function constantEq(a,b){
  const x=enc.encode(a||''),y=enc.encode(b||'');let mismatch=x.length^y.length;
  const n=Math.max(x.length,y.length);
  for(let i=0;i<n;i++)mismatch|=(x[i]||0)^(y[i]||0);
  return mismatch===0;
}
function isoAfterHours(n){return new Date(Date.now()+n*3600000).toISOString();}
function parsedJson(text,fallback={}){try{return JSON.parse(text??'');}catch{return fallback;}}
function cleanString(s,limit=160){return String(s??'').trim().slice(0,limit);}
function validEmail(s){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)&&s.length<=254;}
async function jsonBody(request){
  if(Number(request.headers.get('content-length'))>MAX_JSON)throw Error('Request too large');
  const raw=await request.text();if(raw.length>MAX_JSON)throw Error('Request too large');
  return JSON.parse(raw);
}
function requestCors(request,env){
  const origin=request.headers.get('Origin');
  const configured=String(env.ALLOWED_ORIGIN||'').trim().replace(/\/$/,'');
  if(!configured||!configured.startsWith('https://')) return {invalid:true};
  if(origin&&origin!==configured) return {forbidden:true};
  return {headers:origin?{'Access-Control-Allow-Origin':configured,'Vary':'Origin'}:{}};
}
async function audit(env,action,who=null,eventId=null,meta={}){
  // Database audit_log was created manually with actor_role, action, target_type, target_id, details_json.
  try{await env.DB.prepare(`INSERT INTO audit_log (id,event_id,actor_user_id,actor_role,action,target_type,target_id,details_json)
    VALUES (?,?,?,?,?,?,?,?)`).bind(id(),eventId,who?.id??null,who?.role||'client',action,meta.target_type||null,meta.target_id||null,JSON.stringify(meta)).run();}
  catch(e){console.error('Audit unavailable',e.message);}
}
async function actor(request,env){
  const m=(request.headers.get('Authorization')||'').match(/^Bearer\s+([a-f0-9]{64})$/i);
  if(!m)return null;
  const hashed=await sha(m[1]);
  return await env.DB.prepare(`SELECT u.id,u.email,u.display_name,u.role,u.active,s.id AS session_id
    FROM auth_sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.active=1`).bind(hashed,new Date().toISOString()).first();
}
function authorized(who,roles){return who&&roles.includes(who.role);}
async function canEditEvent(env,who,eventId){
  const event=await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(eventId).first();
  if(!event)return null;
  if(event.status==='archived')return null;
  if(authorized(who,['admin','planner']))return event;
  return false;
}
function publicEvent(event){
  return {id:event.id,name:event.name,eventDate:event.event_date,venue:event.venue,partyNo:event.party_no,
    plannerUserId:event.planner_user_id,createdBy:event.created_by,status:event.status,createdAt:event.created_at,updatedAt:event.updated_at,
    clientDesignUpdatedAt:parsedJson(event.event_json,{})?.clientDesignUpdatedAt||null,
    clientDesignPendingReview:parsedJson(event.event_json,{})?.clientDesignPendingReview===true,
    eventData:parsedJson(event.event_json,{})};
}
function clientEvent(event){
  const e=parsedJson(event.event_json,{});
  // A deliberately minimal, read-only snapshot. Never include app settings, credentials, users, or internal notes.
  const menu=Array.isArray(e.eventRecords)?e.eventRecords:Array.isArray(e.items)?e.items:[];
  const sessions=Array.isArray(e.sessions)?e.sessions.slice(0,25).map(x=>({
    id:cleanString(x.id,90),name:cleanString(x.name,90),time:cleanString(x.time,25),
    serviceMode:cleanString(x.serviceMode,40),
    courseServices:Object.fromEntries(Object.entries(x.courseServices||{}).slice(0,20).map(([k,v])=>[cleanString(k,70),cleanString(v,40)])),
    courseTimes:Object.fromEntries(Object.entries(x.courseTimes||{}).slice(0,20).map(([k,v])=>[cleanString(k,70),cleanString(v,25)]))
  })):[];
  const ruleFmt=(key,values,fallback)=>values.includes(e.printRules?.[key])?e.printRules[key]:fallback;
  const ruleList=(key,allowed,fallback)=>Array.isArray(e.printRules?.[key])?allowed.filter(f=>e.printRules[key].includes(f)):fallback;
  const printRules={
    dinnerPlated:ruleFmt('dinnerPlated',['a4','half-a4'],'half-a4'),
    dinnerCanape:ruleList('dinnerCanape',['canape-grid','a8-grid','a6-grid'],['canape-grid','a8-grid','a6-grid']),
    selectivePlated:ruleFmt('selectivePlated',['a4','half-a4'],'half-a4'),
    selectiveBuffet:ruleFmt('selectiveBuffet',['a4','half-a4'],'a4'),
    dinnerBuffet:ruleFmt('dinnerBuffet',['a4','half-a4'],'a4'),
    liveStation:ruleFmt('liveStation',['a4-live','a4'],'a4-live'),
    a4Companions:ruleList('a4Companions',['a8-grid','canape-grid','foldtags-grid','a6-grid'],['a8-grid','canape-grid','foldtags-grid'])
  };
  return {id:event.event_id||event.id,name:event.name,eventDate:event.event_date,venue:event.venue,partyNo:event.party_no,sessions,
    printRules,designs:limitedClientDesigns(e),
    menu:menu.slice(0,500).map(item=>({name:cleanString(item.name,200),desc:cleanString(item.desc,450),
      sessionId:cleanString(item.sessionId,90),menuCourse:cleanString(item.menuCourse,70),
      printFormats:Array.isArray(item.printFormats)?item.printFormats.filter(x=>STYLE_FORMATS.has(x)):[],
      allergens:Array.isArray(item.allergens)?item.allergens.map(x=>cleanString(x,60)):[],
      mayContain:Array.isArray(item.mayContain)?item.mayContain.map(x=>cleanString(x,60)):[]}))};
}
async function allowedClientFormats(env){
  try {
    const row=await env.DB.prepare("SELECT value_json FROM app_settings WHERE key='client_print_formats'").first();
    if(!row)return CLIENT_PRINT_FORMATS.slice();
    const values=parsedJson(row.value_json,[]);
    return Array.isArray(values)?CLIENT_PRINT_FORMATS.filter(f=>values.includes(f)):CLIENT_PRINT_FORMATS.slice();
  }catch(err){
    // Compatibility with existing deployments until the app_settings migration is applied.
    if(/no such table/i.test(String(err.message)))return CLIENT_PRINT_FORMATS.slice();
    throw err;
  }
}
function limitedClientDesigns(eventJson){
  const raw=eventJson&&typeof eventJson.designs==='object'?eventJson.designs:{};
  const permitted=[...SAFE_STYLE_FIELDS,'menuHeading','liveTitle','tableMenuHeading',
    'logoWidth','a4LogoWidth','halfLogoWidth','halfTitleTop','halfVenueBottom',
    'showDescription','showCoupleLogo','coupleLogoWidth','noticeTitle','noticeMessage'];
  const filtered={};
  for(const format of CLIENT_PRINT_FORMATS){
    const src=raw[format];if(!src||typeof src!=='object')continue;
    const clean={};for(const key of permitted){const v=src[key];
      if(['string','number','boolean'].includes(typeof v)&&String(v).length<=650)clean[key]=v;
    }
    filtered[format]=clean;
  }
  return filtered;
}
async function getClientLink(env,token){
  if(!/^[a-f0-9]{64}$/i.test(token||''))return null;
  return env.DB.prepare(`SELECT l.id,l.event_id,l.expires_at,l.revoked_at,e.name,e.event_date,e.venue,e.party_no,e.event_json,e.status
    FROM client_links l JOIN events e ON e.id=l.event_id
    WHERE l.token_hash=? AND l.expires_at > ? AND l.revoked_at IS NULL AND e.status!='archived'`)
    .bind(await sha(token),new Date().toISOString()).first();
}
function normaliseDesign(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid design');
  const allowed=new Set(['themeId','designs','brideName','groomName','coupleTitle','welcomeMessage','coupleLogo','coupleLogoWidth']);
  for(const key of Object.keys(input))if(!allowed.has(key))throw Error('Disallowed design field');
  const out={themeId:cleanString(input.themeId||'classic',60),designs:{}};
  if(input.designs!==undefined){
    if(!input.designs||typeof input.designs!=='object'||Array.isArray(input.designs))throw Error('Invalid format designs');
    for(const [fmt,raw] of Object.entries(input.designs)){
      if(!STYLE_FORMATS.has(fmt)||!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Disallowed format');
      const d={};
      for(const [key,value] of Object.entries(raw)){
        if(!SAFE_STYLE_FIELDS.has(key))throw Error('Disallowed design setting');
        if(key==='titleFont'||key==='bodyFont'){
          if(!FONT_OPTIONS.has(value))throw Error('Invalid font');d[key]=value;
        }else if(key==='borderStyle'){
          if(!BORDER_OPTIONS.has(value))throw Error('Invalid border style');d[key]=value;
        }else if(key==='frameMotif'){
          if(!MOTIF_OPTIONS.has(value))throw Error('Invalid decoration');d[key]=value;
        }else if(key.endsWith('Color')||key==='bgColor'){
          if(typeof value!=='string'||!/^#[0-9a-fA-F]{6}$/.test(value))throw Error('Invalid colour');d[key]=value;
        }else{
          const n=Number(value);if(!Number.isFinite(n))throw Error('Invalid size');
          d[key]=key==='borderWidth'?Math.max(0,Math.min(5,n)):key==='borderOutsetCm'?Math.max(.2,Math.min(.5,n)):Math.max(10,Math.min(72,n));
        }
      }
      out.designs[fmt]=d;
    }
  }
  for(const k of ['brideName','groomName'])if(input[k]!==undefined)out[k]=cleanString(input[k],100);
  for(const k of ['coupleTitle','welcomeMessage'])if(input[k]!==undefined)out[k]=cleanString(input[k],k==='welcomeMessage'?450:220);
  if(input.coupleLogo!==undefined){
    if(input.coupleLogo!==''&&(typeof input.coupleLogo!=='string'||!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(input.coupleLogo)||input.coupleLogo.length>350_000))throw Error('Invalid or oversized couple logo');
    out.coupleLogo=input.coupleLogo;
  }
  if(input.coupleLogoWidth!==undefined){const w=Number(input.coupleLogoWidth);if(!Number.isFinite(w))throw Error('Invalid logo width');out.coupleLogoWidth=Math.max(30,Math.min(220,w));}
  return out;
}
function applyApprovedDesign(snapshot,design){
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('Event snapshot unavailable');
  if(!snapshot.designs||typeof snapshot.designs!=='object')snapshot.designs={};
  for(const [fmt,style] of Object.entries(design.designs||{})){
    const previous=snapshot.designs[fmt]&&typeof snapshot.designs[fmt]==='object'?snapshot.designs[fmt]:{};
    snapshot.designs[fmt]={...previous,...style};
  }
  const table=snapshot.designs['half-a4']||{};
  if(Object.prototype.hasOwnProperty.call(design,'coupleTitle'))table.clientCoupleTitle=design.coupleTitle;
  else if(design.brideName||design.groomName)table.clientCoupleTitle=[design.brideName,design.groomName].filter(Boolean).join(' & ');
  if(Object.prototype.hasOwnProperty.call(design,'welcomeMessage'))table.clientWelcomeMessage=design.welcomeMessage;
  if(design.coupleLogo){table.coupleLogoUrl=design.coupleLogo;table.showCoupleLogo=true;}
  if(design.coupleLogoWidth)table.coupleLogoWidth=design.coupleLogoWidth;
  snapshot.designs['half-a4']=table;
  snapshot.themeId=design.themeId;
  return snapshot;
}
async function handle(req,env){
  if(!env.DB)return error('D1 database binding DB is missing',503);
  const url=new URL(req.url),path=url.pathname.replace(/\/$/,'')||'/';
  const method=req.method;
  if(path==='/'&&method==='GET')return reply({service:'Ragasaan Security API',database:'Connected',security:'Backend installed',websiteIntegration:'Not yet connected'});
  if(path==='/health'&&method==='GET'){
    const result=await env.DB.prepare('SELECT 1 AS ok').first();
    return reply({database:result?.ok===1?'Connected':'Error',security:'Backend installed'});
  }
  // Published QR is public because it appears on printed menus and client previews.
  // Admin changes are validated and committed through the authenticated route below.
  if(path==='/public/feedback-qr'&&method==='GET'){
    try {
      const row=await env.DB.prepare("SELECT value_json FROM app_settings WHERE key='feedback_qr'").first();
      const setting=parsedJson(row?.value_json,'');
      return reply({image:typeof setting==='string'&&setting.length<220000?setting:''});
    } catch(e) {
      if(/no such table/i.test(String(e.message)))return reply({image:''});
      throw e;
    }
  }
  if(path==='/public/company-logo'&&method==='GET'){
    try {const row=await env.DB.prepare("SELECT value_json FROM app_settings WHERE key='company_logo'").first();
      const image=parsedJson(row?.value_json,'');return reply({image:typeof image==='string'&&image.length<220000?image:''});
    }catch(e){if(/no such table/i.test(String(e.message)))return reply({image:''});throw e;}
  }
  if(path==='/bootstrap'&&method==='POST'){
    // One-time first Admin only; prevent reuse once any Admin exists.
    const body=await jsonBody(req);
    const provided=String(body.setupSecret||'');
    if(!env.BOOTSTRAP_SECRET||env.BOOTSTRAP_SECRET.length<24||!constantEq(provided,env.BOOTSTRAP_SECRET))return error('Setup not authorised',403);
    const existing=await env.DB.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").first();
    if(existing)return error('Administrator already exists; bootstrap disabled',409);
    const email=cleanString(body.email,254).toLowerCase(),name=cleanString(body.name,100),pwd=String(body.password||'');
    if(!validEmail(email)||!name||pwd.length<8||pwd.length>256)return error('Use a valid email, name and password of at least 8 characters');
    const salt=rand(),uid=id(),hash=await hashPassword(pwd,salt);
    await env.DB.prepare(`INSERT INTO users(id,email,display_name,role,password_hash,password_salt,password_iterations)
      VALUES (?,?,?,?,?,?,?)`).bind(uid,email,name,'admin',hash,salt,ITERATIONS).run();
    await audit(env,'admin_bootstrapped',{id:uid,role:'admin'},null,{target_type:'user',target_id:uid});
    return reply({created:true,role:'admin'},201);
  }
  if(path==='/login'&&method==='POST'){
    const body=await jsonBody(req),email=cleanString(body.email,254).toLowerCase(),pwd=String(body.password||'');
    if(!validEmail(email)||!pwd||pwd.length>256)return error('Invalid credentials',401);
    const user=await env.DB.prepare('SELECT * FROM users WHERE email=? AND active=1').bind(email).first();
    // Hash an invalid login too, avoiding a fast user-enumeration response.
    const salt=user?.password_salt||'f4adbb013d626dea8b5f7e784e270a50';
    const hash=await hashPassword(pwd,salt,user?.password_iterations||ITERATIONS);
    if(!user||!constantEq(hash,user.password_hash))return error('Invalid credentials',401);
    const token=rand(),sessionId=id();
    await env.DB.prepare('INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)')
      .bind(sessionId,user.id,await sha(token),isoAfterHours(TOKEN_TTL_HOURS)).run();
    return reply({token,expiresAt:isoAfterHours(TOKEN_TTL_HOURS),user:{id:user.id,email:user.email,name:user.display_name,role:user.role}});
  }
  // Client links work without an Admin/Planner login but are scoped to a single event.
  if(path==='/client/view'&&method==='POST'){
    const body=await jsonBody(req),link=await getClientLink(env,body.token);
    if(!link)return error('Client link invalid or expired',403);
    return reply({event:clientEvent(link),clientFormats:await allowedClientFormats(env),
      permissions:['design','couple-details','couple-logo','table-welcome'],
      expiresAt:link.expires_at});
  }
  if(path==='/client/submit'&&method==='POST'){
    const body=await jsonBody(req),link=await getClientLink(env,body.token);
    if(!link)return error('Client link invalid or expired',403);
    const design=normaliseDesign(body.design);
    const enabled=await allowedClientFormats(env);
    if(Object.keys(design.designs).some(f=>!enabled.includes(f)))return error('Client design format not permitted',403);
    const revisionRow=await env.DB.prepare('SELECT COALESCE(MAX(revision),0) n FROM design_submissions WHERE event_id=?').bind(link.event_id).first();
    const submissionId=id(),revision=(revisionRow?.n||0)+1;
    // Commit allowlisted design changes to the event immediately, preserving all dish and allergen data.
    const updated=applyApprovedDesign(parsedJson(link.event_json,{}),design);
    updated.clientDesignUpdatedAt=new Date().toISOString();
    updated.clientDesignPendingReview=true;
    updated.clientDesignRevision=revision;
    const eventJSON=JSON.stringify(updated);
    if(eventJSON.length>500000)return error('Client design exceeds event storage limit',413);
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO design_submissions(id,event_id,client_link_id,revision,design_json,status)
        VALUES(?,?,?,?,?,'submitted')`).bind(submissionId,link.event_id,link.id,revision,JSON.stringify(design)),
      env.DB.prepare("UPDATE events SET event_json=?,status='review',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(eventJSON,link.event_id)
    ]);
    await audit(env,'client_design_immediately_applied',null,link.event_id,{target_type:'design',target_id:submissionId,revision});
    return reply({submitted:true,applied:true,pendingReview:true,id:submissionId,revision,status:'submitted'},201);
  }
  // Ordinary cloud event storage is open by explicit owner request.
  // Admin settings, user management, master allergen editing, and client approval
  // endpoints remain behind the authenticated routes below.
  if(path==='/public/events'&&method==='GET'){
    const rows=await env.DB.prepare('SELECT * FROM events ORDER BY COALESCE(updated_at,created_at) DESC,created_at DESC LIMIT 500').all();
    return reply({events:(rows.results||[]).map(publicEvent)});
  }
  if(path==='/public/events'&&method==='POST'){
    const body=await jsonBody(req),name=cleanString(body.name,200);
    if(!name)return error('Event name required');
    const snapshot=body.eventData&&typeof body.eventData==='object'&&!Array.isArray(body.eventData)?body.eventData:{};
    if(JSON.stringify(snapshot).length>500000)return error('Event payload too large',413);
    const guestId='00000000-0000-4000-8000-00000000f001';
    // Never make this account active or generate a session. It exists solely to satisfy
    // legacy D1 event attribution constraints without rewriting existing records.
    await env.DB.prepare(`INSERT OR IGNORE INTO users(id,email,display_name,role,password_hash,password_salt,password_iterations,active)
      VALUES(?,?,'Public Event Builder','planner',?,?,310000,0)`)
      .bind(guestId,'public-builder@invalid.local',rand(),rand()).run();
    const eventId=id();
    await env.DB.prepare(`INSERT INTO events(id,name,event_date,venue,party_no,planner_user_id,event_json,created_by,updated_by)
      VALUES(?,?,?,?,?,NULL,?,?,?)`).bind(eventId,name,cleanString(body.eventDate,40),cleanString(body.venue,200),'',JSON.stringify(snapshot),guestId,guestId).run();
    await audit(env,'public_event_created',null,eventId,{target_type:'event',target_id:eventId});
    return reply({id:eventId,created:true},201);
  }
  const publicEventId=path.match(/^\/public\/events\/([0-9a-f-]{36})$/);
  if(publicEventId&&['GET','PUT'].includes(method)){
    const event=await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(publicEventId[1]).first();
    if(!event)return error('Event unavailable',404);
    if(method==='GET')return reply({event:publicEvent(event)});
    const body=await jsonBody(req),name=cleanString(body.name??event.name,200);
    if(!name)return error('Event name required');
    const data=body.eventData&&typeof body.eventData==='object'&&!Array.isArray(body.eventData)?body.eventData:parsedJson(event.event_json,{});
    if(JSON.stringify(data).length>500000)return error('Event payload too large',413);
    const guestId='00000000-0000-4000-8000-00000000f001';
    // Keep the original creator and assigned planner for historical attribution.
    // Editing the menu invalidates prior client design approvals.
    await env.DB.prepare("UPDATE design_submissions SET status='changes_requested',review_note='Event menu changed; submit updated design' WHERE event_id=? AND status='submitted'").bind(event.id).run();
    await env.DB.prepare(`UPDATE events SET name=?,event_date=?,venue=?,event_json=?,updated_by=NULL,status='draft',updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(name,cleanString(body.eventDate??event.event_date,40),cleanString(body.venue??event.venue,200),JSON.stringify(data),event.id).run();
    await audit(env,'public_event_updated',null,event.id,{target_type:'event',target_id:event.id});
    return reply({updated:true,status:'draft'});
  }
  const who=await actor(req,env);
  // GET-only rule catalogs do not contain secrets; Admin PUT stays protected.
  if(!who&&!(method==='GET'&&['/settings/choices','/settings/meal-defaults','/settings/printing-rules'].includes(path)))return error('Login required',401);
  if(path==='/me'&&method==='GET')return reply({id:who.id,email:who.email,name:who.display_name,role:who.role});
  if(path==='/admin/feedback-qr'&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const body=await jsonBody(req);
    if(typeof body.image!=='string')return error('QR image must be supplied');
    // Empty image means explicit Admin removal. Never accept arbitrary URLs/SVG/HTML.
    const image=body.image;
    if(image && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>210000))
      return error('Use a valid PNG/JPG/WebP QR image up to 150 KB',413);
    if(image){
      const encoded=image.split(',')[1]||'';
      const approximateBytes=Math.floor(encoded.length*3/4)-(encoded.endsWith('==')?2:encoded.endsWith('=')?1:0);
      if(approximateBytes>150000)return error('QR image exceeds 150 KB',413);
    }
    try {
      await env.DB.prepare(`INSERT INTO app_settings(key,value_json,updated_at,updated_by)
        VALUES('feedback_qr',?,CURRENT_TIMESTAMP,?)
        ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
        .bind(JSON.stringify(image),who.id).run();
    } catch(e){
      if(/no such table/i.test(String(e.message)))return error('Create app_settings table using MIGRATION_D1.sql first',503);
      throw e;
    }
    await audit(env,image?'feedback_qr_published':'feedback_qr_removed',who,null,{target_type:'app_settings',target_id:'feedback_qr'});
    return reply({updated:true,hasQR:!!image});
  }
  if(path==='/admin/client-formats'&&method==='GET'){
    if(who.role!=='admin')return error('Administrator only',403);
    return reply({formats:await allowedClientFormats(env),available:CLIENT_PRINT_FORMATS});
  }
  if(path==='/admin/client-formats'&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const body=await jsonBody(req);
    if(!Array.isArray(body.formats)||body.formats.length<1||body.formats.length>4||body.formats.some(x=>!CLIENT_PRINT_FORMATS.includes(x)))return error('Select at least one permitted format');
    const selected=CLIENT_PRINT_FORMATS.filter(f=>body.formats.includes(f));
    await env.DB.prepare(`INSERT INTO app_settings(key,value_json,updated_at,updated_by)
      VALUES('client_print_formats',?,CURRENT_TIMESTAMP,?)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
      .bind(JSON.stringify(selected),who.id).run();
    await audit(env,'client_print_formats_updated',who,null,{formats:selected});
    return reply({updated:true,formats:selected});
  }
  if(path==='/logout'&&method==='POST'){
    await env.DB.prepare('UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=?').bind(who.session_id).run();
    return reply({loggedOut:true});
  }
  if(path==='/admin/company-logo'&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const body=await jsonBody(req),image=body.image;
    if(typeof image!=='string')return error('Image must be supplied');
    if(image && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>210000))return error('Valid PNG/JPG/WebP required',413);
    if(image){const encoded=image.split(',')[1]||'';
      const n=Math.floor(encoded.length*3/4)-(encoded.endsWith('==')?2:encoded.endsWith('=')?1:0);
      if(n>150000)return error('Logo must be 150 KB or less',413);
    }
    await env.DB.prepare(`INSERT INTO app_settings(key,value_json,updated_at,updated_by) VALUES('company_logo',?,CURRENT_TIMESTAMP,?)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
      .bind(JSON.stringify(image),who.id).run();
    await audit(env,'company_logo_updated',who,null,{target_type:'app_settings',target_id:'company_logo',removed:!image});
    return reply({updated:true,hasLogo:!!image});
  }
  const CHOICES={serviceModes:['Buffet','Regular Buffet','Thali','Plated Service','Buffet-Selective','Bowl Food','Canapé','Live Station','Other'],
    mealSessions:['Breakfast','Lunch','Dinner','HI Tea','Late Night Snack'],
    menuCategories:['Starter','Main Course','Dessert','Canapé','Live Station','Other'],
    printFormats:['a4','a4-live','half-a4','a8-grid','foldtags-grid','a6-grid','canape-grid']};
  if(path==='/settings/choices'&&method==='GET'){
    const row=await env.DB.prepare("SELECT value_json FROM app_settings WHERE key='choice_catalog_v1'").first();
    return reply({available:CHOICES,settings:parsedJson(row?.value_json,{})});
  }
  if(path==='/settings/choices'&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const body=await jsonBody(req),settings=body.settings;
    if(!settings||typeof settings!=='object'||Array.isArray(settings))return error('Settings object required');
    const clean={};
    for(const [key,allowed] of Object.entries(CHOICES)){
      const part=settings[key];
      if(!part||!Array.isArray(part.enabled)||part.enabled.length<1||part.enabled.some(v=>!allowed.includes(v))||!part.enabled.includes(part.default))return error('Invalid choice settings for '+key);
      clean[key]={enabled:allowed.filter(v=>part.enabled.includes(v)),default:part.default};
    }
    await env.DB.prepare(`INSERT INTO app_settings(key,value_json,updated_at,updated_by) VALUES('choice_catalog_v1',?,CURRENT_TIMESTAMP,?)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
      .bind(JSON.stringify(clean),who.id).run();
    await audit(env,'choice_catalog_updated',who,null,{target_type:'app_settings',target_id:'choice_catalog_v1'});
    return reply({updated:true,settings:clean});
  }

  // Admin-governed per-meal defaults, persisted in the existing app_settings table.
  // This endpoint never modifies existing events.
  const MEAL_SPECS={
    breakfast:{services:['Buffet'],courses:{}},
    lunch:{services:['Buffet','Regular Buffet','Thali','Plated Service'],courses:{}},
    dinner:{services:['Plated Service','Buffet-Selective','Buffet','Thali','Bowl Food'],courses:{
      Starter:['Plated Service','Buffet'],
      'Main Course':['Plated Service','Buffet','Bowl Food'],
      Dessert:['Plated Service','Buffet']}},
    'hi-tea':{services:['Buffet'],courses:{}},
    'late-night':{services:['Other'],courses:{}}
  };
  const CATEGORY_PRINT_FORMATS={
    'Canapé':['canape-grid','a8-grid','foldtags-grid'],
    'Live Station':['a4-live'],
    Starter:['half-a4','a4','a8-grid','a6-grid','canape-grid','foldtags-grid'],
    'Main Course':['half-a4','a4','a8-grid','a6-grid','canape-grid','foldtags-grid'],
    Dessert:['half-a4','a4','a8-grid','a6-grid','canape-grid','foldtags-grid'],
    Other:['half-a4','a4','a8-grid','a6-grid','canape-grid','foldtags-grid']
  };
  const DEFAULT_MEALS={
    breakfast:{service:'Buffet',enabledServices:['Buffet'],group:'single',formats:['a4','foldtags-grid','canape-grid'],courses:{}},
    lunch:{service:'Buffet',enabledServices:['Buffet','Regular Buffet','Thali','Plated Service'],group:'single',formats:['a4'],courses:{}},
    dinner:{service:'Plated Service',enabledServices:['Plated Service','Buffet-Selective','Buffet','Thali','Bowl Food'],group:'course',formats:['half-a4'],courses:{
      Starter:{enabled:['Plated Service','Buffet'],default:'Plated Service'},
      'Main Course':{enabled:['Plated Service','Buffet','Bowl Food'],default:'Plated Service'},
      Dessert:{enabled:['Plated Service','Buffet'],default:'Plated Service'}}},
    'hi-tea':{service:'Buffet',enabledServices:['Buffet'],group:'single',formats:['a4','foldtags-grid'],courses:{}},
    'late-night':{service:'Other',enabledServices:['Other'],group:'single',formats:['a4'],courses:{}}
  };
  if(path==='/settings/meal-defaults'&&method==='GET'){
    const row=await env.DB.prepare("SELECT value_json FROM app_settings WHERE key='meal_defaults_v1'").first();
    const saved=parsedJson(row?.value_json,{});
    const settings=Object.fromEntries(Object.entries(DEFAULT_MEALS).map(([kind,base])=>{
      const item=saved[kind]||{};return [kind,{...base,...item,
        enabledServices:Array.isArray(item.enabledServices)?item.enabledServices:MEAL_SPECS[kind].services.slice(),
        courses:{...base.courses,...(item.courses||{})},categoryFormats:{...(item.categoryFormats||{})}}];
    }));
    return reply({settings,available:{formats:CHOICES.printFormats,mealSpecs:MEAL_SPECS,categoryFormats:CATEGORY_PRINT_FORMATS}});
  }
  if(path==='/settings/meal-defaults'&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const body=await jsonBody(req);const settings=body.settings;
    if(!settings||typeof settings!=='object'||Array.isArray(settings))return error('Invalid meal defaults');
    const clean={};
    for(const [name,spec] of Object.entries(MEAL_SPECS)){
      const item=settings[name];if(!item||!spec.services.includes(item.service))return error('Invalid service for '+name);
      const services=Array.isArray(item.enabledServices)?item.enabledServices:spec.services;
      if(!services.length||services.some(v=>!spec.services.includes(v))||!services.includes(item.service))return error('Enable a valid default service for '+name);
      const group=['Plated Service','Buffet-Selective'].includes(item.service)?'course':'single';
      if(item.group!==group)return error('Invalid grouping for '+name);
      if(!Array.isArray(item.formats)||!item.formats.length||item.formats.some(f=>!CHOICES.printFormats.includes(f)))return error('Invalid print formats for '+name);
      const courses={};
      for(const [course,allowed] of Object.entries(spec.courses)){
        const configured=item.courses?.[course];
        if(!configured||!Array.isArray(configured.enabled)||!configured.enabled.length||configured.enabled.some(v=>!allowed.includes(v))||!configured.enabled.includes(configured.default))return error('Invalid '+name+' course '+course);
        courses[course]={enabled:allowed.filter(v=>configured.enabled.includes(v)),default:configured.default};
      }
      const categoryFormats={};
      for(const [category,options] of Object.entries(CATEGORY_PRINT_FORMATS)){
        const selected=item.categoryFormats?.[category];
        if(selected===undefined)continue; // Existing Admin settings remain valid.
        if(!Array.isArray(selected)||!selected.length||selected.some(v=>!options.includes(v)))return error('Invalid print defaults for '+name+' / '+category);
        categoryFormats[category]=options.filter(v=>selected.includes(v));
      }
      clean[name]={service:item.service,enabledServices:spec.services.filter(v=>services.includes(v)),group,formats:CHOICES.printFormats.filter(v=>item.formats.includes(v)),courses,categoryFormats};
    }
    await env.DB.prepare(`INSERT INTO app_settings(key,value_json,updated_at,updated_by) VALUES('meal_defaults_v1',?,CURRENT_TIMESTAMP,?)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
      .bind(JSON.stringify(clean),who.id).run();
    await audit(env,'meal_defaults_updated',who,null,{target_type:'app_settings',target_id:'meal_defaults_v1'});
    return reply({updated:true,settings:clean});
  }
  // Shared print routing preferences. Never rewrite existing event_json records.
  // Validated allowlists prevent client/browser input from inventing an output format.
  const PRINT_RULE_DEFAULTS={
    dinnerPlated:'half-a4',
    dinnerCanape:['canape-grid','a8-grid','a6-grid'],
    selectivePlated:'half-a4',
    selectiveBuffet:'a4',
    dinnerBuffet:'a4',
    liveStation:'a4-live',
    a4Companions:['a8-grid','canape-grid','foldtags-grid']
  };
  const PRINT_RULE_SPECS={
    dinnerPlated:['half-a4','a4'],
    dinnerCanape:['canape-grid','a8-grid','a6-grid'],
    selectivePlated:['half-a4','a4'],
    selectiveBuffet:['a4','half-a4'],
    dinnerBuffet:['a4','half-a4'],
    liveStation:['a4-live','a4'],
    a4Companions:['a8-grid','canape-grid','foldtags-grid','a6-grid']
  };
  if(path==='/settings/printing-rules'&&method==='GET'){
    const row=await env.DB.prepare("SELECT value_json FROM app_settings WHERE key='printing_rules_v1'").first();
    const current=parsedJson(row?.value_json,{});
    return reply({settings:{...PRINT_RULE_DEFAULTS,...current},available:PRINT_RULE_SPECS});
  }
  if(path==='/settings/printing-rules'&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const body=await jsonBody(req),v=body.settings;
    if(!v||typeof v!=='object'||Array.isArray(v))return error('Invalid print rules');
    const clean={};
    for(const [key,allowed] of Object.entries(PRINT_RULE_SPECS)){
      const value=v[key];
      if(Array.isArray(PRINT_RULE_DEFAULTS[key])){
        if(!Array.isArray(value)||value.some(x=>!allowed.includes(x))||
          (key==='dinnerCanape'&&!value.length))return error('Invalid print rule '+key);
        clean[key]=allowed.filter(x=>value.includes(x));
      } else {
        if(typeof value!=='string'||!allowed.includes(value))return error('Invalid print rule '+key);
        clean[key]=value;
      }
    }
    await env.DB.prepare(`INSERT INTO app_settings(key,value_json,updated_at,updated_by) VALUES('printing_rules_v1',?,CURRENT_TIMESTAMP,?)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
      .bind(JSON.stringify(clean),who.id).run();
    await audit(env,'printing_rules_updated',who,null,{target_type:'app_settings',target_id:'printing_rules_v1'});
    return reply({updated:true,settings:clean});
  }
  if(path==='/users'&&method==='GET'){
    if(who.role!=='admin')return error('Administrator only',403);
    const result=await env.DB.prepare("SELECT id,email,display_name,role,active,created_at FROM users ORDER BY role,display_name").all();
    return reply({users:result.results||[]});
  }
  let userMatch=path.match(/^\/users\/([0-9a-f-]{36})\/profile$/);
  if(userMatch&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const target=await env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(userMatch[1]).first();if(!target)return error('Account not found',404);
    const body=await jsonBody(req),name=cleanString(body.name,100),email=cleanString(body.email,254).toLowerCase(),role=String(body.role||'');
    if(!name||!validEmail(email)||!['admin','planner'].includes(role))return error('Valid name, email and role required');
    if(target.id===who.id&&role!==target.role)return error('Cannot change your own role',403);
    const duplicate=await env.DB.prepare('SELECT id FROM users WHERE email=? AND id<>?').bind(email,target.id).first();
    if(duplicate)return error('Email already used',409);
    await env.DB.prepare('UPDATE users SET display_name=?,email=?,role=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(name,email,role,target.id).run();
    if(target.role!==role)await env.DB.prepare('UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=? AND revoked_at IS NULL').bind(target.id).run();
    await audit(env,'user_profile_updated',who,null,{target_type:'user',target_id:target.id});return reply({updated:true});
  }
  userMatch=path.match(/^\/users\/([0-9a-f-]{36})\/password$/);
  if(userMatch&&method==='PUT'){
    if(who.role!=='admin')return error('Administrator only',403);
    const target=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userMatch[1]).first();if(!target)return error('Account not found',404);
    const body=await jsonBody(req),pwd=String(body.password||'');
    if(pwd.length<8||pwd.length>256)return error('Use a password of 8–256 characters');
    const salt=rand(),hash=await hashPassword(pwd,salt);
    await env.DB.prepare('UPDATE users SET password_hash=?,password_salt=?,password_iterations=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .bind(hash,salt,ITERATIONS,target.id).run();
    await env.DB.prepare('UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=? AND revoked_at IS NULL').bind(target.id).run();
    await audit(env,'user_password_reset',who,null,{target_type:'user',target_id:target.id});
    return reply({updated:true,sessionsRevoked:true});
  }
  userMatch=path.match(/^\/users\/([0-9a-f-]{36})\/(deactivate|reactivate)$/);
  if(userMatch&&method==='POST'){
    if(who.role!=='admin')return error('Administrator only',403);
    if(userMatch[1]===who.id)return error('Cannot deactivate or reactivate your own account',403);
    const target=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userMatch[1]).first();if(!target)return error('Account not found',404);
    const active=userMatch[2]==='reactivate'?1:0;
    await env.DB.prepare('UPDATE users SET active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(active,target.id).run();
    if(!active)await env.DB.prepare('UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=? AND revoked_at IS NULL').bind(target.id).run();
    await audit(env,active?'user_reactivated':'user_deactivated',who,null,{target_type:'user',target_id:target.id});return reply({updated:true,active:!!active});
  }
  if(path==='/users/planners'&&method==='POST'){
    if(!authorized(who,['admin']))return error('Administrator only',403);
    const body=await jsonBody(req),email=cleanString(body.email,254).toLowerCase(),name=cleanString(body.name,100),password=String(body.password||'');
    if(!validEmail(email)||!name||password.length<8||password.length>256)return error('Valid email, name, password (8+ chars) required');
    const salt=rand(),uid=id();
    await env.DB.prepare("INSERT INTO users(id,email,display_name,role,password_hash,password_salt,password_iterations) VALUES(?,?,?,?,?,?,?)")
      .bind(uid,email,name,'planner',await hashPassword(password,salt),salt,ITERATIONS).run();
    await audit(env,'planner_created',who,null,{target_type:'user',target_id:uid});
    return reply({id:uid,email,name,role:'planner'},201);
  }
  if(path==='/users/planners'&&method==='GET'){
    if(!authorized(who,['admin']))return error('Administrator only',403);
    const rows=await env.DB.prepare("SELECT id,email,display_name,active FROM users WHERE role='planner' ORDER BY display_name").all();
    return reply({planners:rows.results||[]});
  }
  const deactivateMatch=path.match(/^\/users\/planners\/([0-9a-f-]{36})\/deactivate$/);
  if(deactivateMatch&&method==='POST'){
    if(who.role!=='admin')return error('Administrator only',403);
    await env.DB.prepare("UPDATE users SET active=0,updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='planner'").bind(deactivateMatch[1]).run();
    await env.DB.prepare("UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=? AND revoked_at IS NULL").bind(deactivateMatch[1]).run();
    await audit(env,'planner_deactivated',who,null,{target_type:'user',target_id:deactivateMatch[1]});
    return reply({deactivated:true});
  }
  if(path==='/events'&&method==='GET'){
    const includeArchived=url.searchParams.get('includeArchived')==='1';
    const sql=includeArchived
      ? 'SELECT * FROM events ORDER BY COALESCE(updated_at,created_at) DESC,created_at DESC LIMIT 500'
      : "SELECT * FROM events WHERE status!='archived' ORDER BY COALESCE(updated_at,created_at) DESC,created_at DESC LIMIT 500";
    const result=await env.DB.prepare(sql).all();
    return reply({events:(result.results||[]).map(publicEvent)});
  }
  if(path==='/events'&&method==='POST'){
    const body=await jsonBody(req),eventId=id(),name=cleanString(body.name,200);
    if(!name)return error('Event name required');
    let planner=who.role==='planner'?who.id:(body.plannerUserId||null);
    if(who.role==='admin'&&planner){
      const assigned=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role='planner' AND active=1").bind(planner).first();
      if(!assigned)return error('Selected planner does not exist');
    }
    const data=body.eventData&&typeof body.eventData==='object'?body.eventData:{};
    if(JSON.stringify(data).length>500000)return error('Event payload too large');
    await env.DB.prepare(`INSERT INTO events(id,name,event_date,venue,party_no,planner_user_id,event_json,created_by,updated_by)
      VALUES(?,?,?,?,?,?,?,?,?)`).bind(eventId,name,cleanString(body.eventDate,40),cleanString(body.venue,200),cleanString(body.partyNo,40),planner,JSON.stringify(data),who.id,who.id).run();
    await audit(env,'event_created',who,eventId,{target_type:'event',target_id:eventId});
    return reply({id:eventId,created:true},201);
  }
  let m=path.match(/^\/events\/([0-9a-f-]{36})$/);
  if(m&&method==='GET'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    return reply({event:publicEvent(event)});
  }
  if(m&&method==='PUT'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const body=await jsonBody(req),name=cleanString(body.name??event.name,200);
    if(!name)return error('Event name required');
    const data=body.eventData&&typeof body.eventData==='object'?body.eventData:parsedJson(event.event_json,{});
    if(JSON.stringify(data).length>500000)return error('Event payload too large');
    let planner=event.planner_user_id;
    if(who.role==='admin'&&Object.prototype.hasOwnProperty.call(body,'plannerUserId')){
      planner=body.plannerUserId||null;
      if(planner){const assigned=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role='planner' AND active=1").bind(planner).first();if(!assigned)return error('Planner not found');}
    }
    // Updating event content invalidates pending client reviews and prior printing approval.
    await env.DB.prepare("UPDATE design_submissions SET status='changes_requested',review_note='Event menu changed; request an updated design' WHERE event_id=? AND status='submitted'").bind(event.id).run();
    await env.DB.prepare(`UPDATE events SET name=?,event_date=?,venue=?,party_no=?,planner_user_id=?,event_json=?,updated_by=?,status='draft',updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(name,cleanString(body.eventDate??event.event_date,40),cleanString(body.venue??event.venue,200),cleanString(body.partyNo??event.party_no,40),planner,JSON.stringify(data),who.id,event.id).run();
    await audit(env,'event_updated',who,event.id,{target_type:'event',target_id:event.id});
    return reply({updated:true,status:'draft'});
  }

  m=path.match(/^\/events\/([0-9a-f-]{36})\/restore$/);
  if(m&&method==='POST'){
    const event=await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(m[1]).first();
    if(!event||event.status!=='archived')return error('Deleted event unavailable',404);
    if(!(who.role==='admin'||who.role==='planner'&&(event.planner_user_id===who.id||event.created_by===who.id)))
      return error('Only Admin or the event owner may restore this record',403);
    await env.DB.prepare("UPDATE events SET status='draft',updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(who.id,event.id).run();
    await audit(env,'event_restored',who,event.id,{target_type:'event',target_id:event.id});
    return reply({restored:true,status:'draft'});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})$/);
  if(m&&method==='DELETE'){
    const event=await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(m[1]).first();
    if(!event)return error('Event unavailable',404);
    if(!(who.role==='admin'||who.role==='planner'&&(event.planner_user_id===who.id||event.created_by===who.id)))
      return error('Only Admin may delete any event; a planner may delete their own event',403);
    if(event.status==='archived')return reply({deleted:true,recoverable:true,status:'archived'});
    await env.DB.prepare("UPDATE events SET status='archived',updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(who.id,event.id).run();
    await audit(env,'event_soft_deleted',who,event.id,{target_type:'event',target_id:event.id});
    return reply({deleted:true,recoverable:true,status:'archived'});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/client-links$/);
  if(m&&method==='POST'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const body=await jsonBody(req),ttl=Math.min(30,Math.max(1,Number(body.days)||7));
    const token=rand(),linkId=id(),expiresAt=isoAfterHours(ttl*24);
    await env.DB.prepare('INSERT INTO client_links(id,event_id,token_hash,label,expires_at,created_by) VALUES(?,?,?,?,?,?)')
      .bind(linkId,event.id,await sha(token),cleanString(body.label,90),expiresAt,who.id).run();
    await audit(env,'client_link_created',who,event.id,{target_type:'client_link',target_id:linkId});
    // Token returned once: don't log, persist, or embed it in publicly readable GitHub files.
    return reply({id:linkId,token,expiresAt},201);
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/client-links$/);
  if(m&&method==='GET'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const result=await env.DB.prepare('SELECT id,label,expires_at,revoked_at,created_at FROM client_links WHERE event_id=? ORDER BY created_at DESC LIMIT 100').bind(event.id).all();
    return reply({links:result.results||[]});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/client-links\/([0-9a-f-]{36})\/revoke$/);
  if(m&&method==='POST'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const result=await env.DB.prepare('UPDATE client_links SET revoked_at=CURRENT_TIMESTAMP WHERE id=? AND event_id=? AND revoked_at IS NULL').bind(m[2],event.id).run();
    await audit(env,'client_link_revoked',who,event.id,{target_type:'client_link',target_id:m[2]});
    return reply({revoked:(result.meta?.changes||0)>0});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/print-status$/);
  if(m&&method==='GET'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const latest=await env.DB.prepare('SELECT id,revision,status FROM design_submissions WHERE event_id=? ORDER BY revision DESC LIMIT 1').bind(event.id).first();
    const allowed=who.role==='admin'||(event.status==='approved'&&(!latest||latest.status==='approved'));
    return reply({allowed,role:who.role,eventStatus:event.status,latestSubmission:latest?{id:latest.id,revision:latest.revision,status:latest.status}:null});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/approve-print$/);
  if(m&&method==='POST'){
    if(!authorized(who,['planner','admin']))return error('Event Planner or Admin required',403);
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const latest=await env.DB.prepare('SELECT status FROM design_submissions WHERE event_id=? ORDER BY revision DESC LIMIT 1').bind(event.id).first();
    if(latest&&latest.status!=='approved')return error('Latest client design must be approved before printing',409);
    await env.DB.prepare("UPDATE events SET status='approved',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(event.id).run();
    await audit(env,'printing_approved',who,event.id,{target_type:'event',target_id:event.id});
    return reply({approved:true});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/submissions$/);
  if(m&&method==='GET'){
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const result=await env.DB.prepare('SELECT id,revision,design_json,status,submitted_at,reviewed_at,review_note FROM design_submissions WHERE event_id=? ORDER BY revision DESC LIMIT 100').bind(event.id).all();
    return reply({submissions:(result.results||[]).map(x=>({...x,design:parsedJson(x.design_json),design_json:undefined}))});
  }
  m=path.match(/^\/events\/([0-9a-f-]{36})\/submissions\/([0-9a-f-]{36})\/review$/);
  if(m&&method==='POST'){
    // Event Planners, not Admin, own final print approval.
    if(who.role!=='planner')return error('Event Planner approval required',403);
    const event=await canEditEvent(env,who,m[1]);if(!event)return error('Event unavailable',404);
    const body=await jsonBody(req),status=String(body.status||'');
    if(!['approved','changes_requested','rejected'].includes(status))return error('Invalid review status');
    const sub=await env.DB.prepare('SELECT id,status,revision,design_json FROM design_submissions WHERE event_id=? AND id=?').bind(event.id,m[2]).first();
    if(!sub||sub.status!=='submitted')return error('Only submitted designs may be reviewed',409);
    const newest=await env.DB.prepare('SELECT MAX(revision) n FROM design_submissions WHERE event_id=?').bind(event.id).first();
    if(sub.revision!==newest?.n)return error('Review the latest submission only',409);
    // Validate the whole approved snapshot before any writes; commit review + event status together.
    let mergedJson=null;
    if(status==='approved'){
      const design=normaliseDesign(parsedJson(sub.design_json,{}));
      const snapshot=applyApprovedDesign(parsedJson(event.event_json,{}),design);
      snapshot.clientDesignPendingReview=false;
      mergedJson=JSON.stringify(snapshot);
      if(mergedJson.length>500000)return error('Approved design exceeds event storage limit',413);
    }
    const statements=[env.DB.prepare(`UPDATE design_submissions SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,review_note=? WHERE id=?`)
      .bind(status,who.id,cleanString(body.note,700),sub.id)];
    if(status==='approved')statements.push(env.DB.prepare("UPDATE events SET event_json=?,status='approved',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(mergedJson,event.id));
    else statements.push(env.DB.prepare("UPDATE events SET status='review',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(event.id));
    await env.DB.batch(statements);
    await audit(env,'design_'+status,who,event.id,{target_type:'design',target_id:sub.id});
    return reply({reviewed:true,status});
  }
  return error('Not found',404);
}
export default {
  async fetch(request,env){
    const cors=requestCors(request,env);
    if(cors.invalid)return error('Set ALLOWED_ORIGIN to your HTTPS GitHub Pages origin',503);
    if(cors.forbidden)return error('Origin not permitted',403);
    const headers={...cors.headers,'Access-Control-Allow-Methods':corsMethods,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'};
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    try{
      const result=await handle(request,env);
      const h=new Headers(result.headers);for(const [key,value]of Object.entries(headers))h.set(key,value);
      return new Response(result.body,{status:result.status,headers:h});
    }catch(e){
      console.error('Ragasaan API error:',e.message);
      const failure=e instanceof SyntaxError?error('Invalid JSON',400):/Request too large/.test(e.message)?error('Request too large',413):error('Request failed',500);
      const h=new Headers(failure.headers);for(const [key,value]of Object.entries(headers))h.set(key,value);
      return new Response(failure.body,{status:failure.status,headers:h});
    }
  }
};