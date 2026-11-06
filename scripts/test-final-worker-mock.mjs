// Local authorization and D1-contract unit tests for review-only Security Worker.
// This is NOT a test against the installed production Security API or live D1.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const source=fs.readFileSync('security/review-only-security-worker.js','utf8');
const sandbox={URL,Request,Response,Headers,TextEncoder,crypto:webcrypto,console};
vm.runInNewContext(source.replace('export default {','const stagedWorker = {')+'globalThis.stagedWorker=stagedWorker;',sandbox);
const API=sandbox.stagedWorker;
const EVENT='11111111-1111-4111-8111-111111111111';
const P1='22222222-2222-4222-8222-222222222222';
const P2='33333333-3333-4333-8333-333333333333';
const A1='44444444-4444-4444-8444-444444444444';
const LINK='55555555-5555-4555-8555-555555555555';
const ORIGIN='https://menustudio.arunkumarnkl.workers.dev';
const AUTH='a'.repeat(64),CLIENT='b'.repeat(64);
const db={
 role:null,plannerId:P1,sql:[],events:{
  [EVENT]:{id:EVENT,name:'Demo Event',event_date:'2026-11-20',venue:'Venue',party_no:'',status:'draft',
   planner_user_id:P1,created_by:P1,event_json:JSON.stringify({sessions:[{id:'dinner',name:'Dinner'}],items:[
    {name:'Pasta',allergens:['Milk'],mayContain:['Eggs']}
   ],designs:{'half-a4':{accentColor:'#112233',logoWidth:100}},title:'Event'})}
 },submissions:[],
 prepare(sql){
  db.sql.push(sql);let args=[];
  return {bind(...params){args=params;return this;},
   async first(){
    if(sql.includes('FROM auth_sessions'))return db.role?{id:db.plannerId,role:db.role,email:'local@test.invalid',display_name:'Tester',active:1,session_id:'demo'}:null;
    if(sql.includes('FROM client_links l JOIN events'))return {id:LINK,event_id:EVENT,expires_at:'2027-11-20T00:00:00Z',revoked_at:null,...db.events[EVENT]};
    if(sql.includes('FROM events WHERE id='))return db.events[args[0]]||null;
    if(sql.includes('MAX(revision)'))return {n:db.submissions.length};
    if(sql.includes('FROM app_settings'))return null;
    return null;
   },
   async all(){if(sql.includes('FROM events'))return {results:Object.values(db.events)};return {results:[]};},
   async run(){
    if(sql.includes('UPDATE events SET status=')&&sql.includes("'archived'"))db.events[args[args.length-1]].status='archived';
    if(sql.includes('UPDATE events SET status=')&&sql.includes("'draft'"))db.events[args[args.length-1]].status='draft';
    if(sql.includes('UPDATE events SET event_json=')&&sql.includes("status='review'")){
      db.events[args[1]].event_json=args[0];db.events[args[1]].status='review';
    }
    if(sql.includes('INSERT INTO design_submissions'))db.submissions.push({id:args[0],eventId:args[1],design:JSON.parse(args[4])});
    return {success:true};
   }
  };
 },
 async batch(stmts){return Promise.all(stmts.map(s=>s.run()));}
};
const env={DB:db,ALLOWED_ORIGIN:ORIGIN};
async function request(path,method='GET',opts={}){
 const headers={Origin:ORIGIN,...(opts.auth?{Authorization:'Bearer '+AUTH}:{})};
 if(opts.body)headers['Content-Type']='application/json';
 const req=new Request('https://ragasaan-security-api.arunkumarnkl.workers.dev'+path,{
  method,headers,body:opts.body?JSON.stringify(opts.body):undefined
 });
 const response=await API.fetch(req,env);
 return {status:response.status,data:await response.json(),allowMethods:response.headers.get('Access-Control-Allow-Methods')};
}

const anonymous=await request('/public/events');
assert.equal(anonymous.status,401);
const unauthDelete=await request('/events/'+EVENT,'DELETE');
assert.equal(unauthDelete.status,401);
console.log('PASS Anonymous visitors and client-link holders cannot access staff event list or deletion');

db.role='planner';db.plannerId=P2;
const foreign=await request('/events/'+EVENT,'DELETE',{auth:true});
assert.equal(foreign.status,403);
assert.equal(db.events[EVENT].status,'draft');
db.plannerId=P1;
const own=await request('/events/'+EVENT,'DELETE',{auth:true});
assert.equal(own.status,200);assert.equal(own.data.recoverable,true);
assert.equal(db.events[EVENT].status,'archived');
assert.match(own.allowMethods,/DELETE/);
const restored=await request('/events/'+EVENT+'/restore','POST',{auth:true});
assert.equal(restored.status,200);
assert.equal(db.events[EVENT].status,'draft');
console.log('PASS Planner can soft-delete and restore OWN record, not another planner record');

db.plannerId=A1;db.role='admin';
const adminDeleted=await request('/events/'+EVENT,'DELETE',{auth:true});
assert.equal(adminDeleted.status,200);
assert.equal(db.events[EVENT].status,'archived');
const adminRestored=await request('/events/'+EVENT+'/restore','POST',{auth:true});
assert.equal(adminRestored.status,200);
console.log('PASS Admin can recoverably delete any event');

db.role=null;
const before=JSON.parse(db.events[EVENT].event_json);
const submitted=await request('/client/submit','POST',{body:{token:CLIENT,design:{
 themeId:'a',designs:{'half-a4':{textColor:'#556677',accentColor:'#456789'}},
 coupleTitle:'Bride & Groom'
}}});
assert.equal(submitted.status,201);
assert.equal(submitted.data.applied,true);
const after=JSON.parse(db.events[EVENT].event_json);
assert.deepEqual(after.items,before.items);
assert.deepEqual(after.sessions,before.sessions);
assert.deepEqual(after.items[0].allergens,['Milk']);
assert.equal(after.designs['half-a4'].textColor,'#556677');
assert.equal(after.designs['half-a4'].accentColor,'#456789');
assert.equal(after.clientDesignPendingReview,true);
assert.equal(db.events[EVENT].status,'review');
assert.equal(db.submissions.length,1);
console.log('PASS Client design is immediately applied while preserving all dishes and allergens and creating a review task');

console.log('REVIEW-ONLY WORKER MOCK TESTS COMPLETE. Live D1/Worker deployment and role tests remain required.');
