// Read-only diagnostic: compare public Cloudflare website assets with GitHub main.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const origin='https://menustudio.arunkumarnkl.workers.dev';
const sha=data=>createHash('sha256').update(data).digest('hex').slice(0,16);
const list=[
  {path:'/',file:'index.html',asset:'dist/menustudio/index.html'},
  {path:'/security-app.js',file:'security-app.js',asset:'dist/menustudio/security-app.js'},
  {path:'/security.css',file:'security.css',asset:'dist/menustudio/security.css'},
  {path:'/themes/gallery.json',file:'themes/gallery.json',asset:'dist/menustudio/themes/gallery.json'}
];
let mismatches=0,failures=0;
for(const item of list){
  try{
    const live=await fetch(origin+item.path,{cache:'no-store',signal:AbortSignal.timeout(15000)});
    const liveBody=await live.arrayBuffer();
    const repo=await fetch('https://raw.githubusercontent.com/arunkumarnkl/Menustudio/main/'+item.file,{cache:'no-store',signal:AbortSignal.timeout(15000)});
    const repoBytes=await repo.arrayBuffer();
    const draft=readFileSync(item.asset);
    const identical=live.status===200&&repo.status===200&&sha(Buffer.from(liveBody))===sha(Buffer.from(repoBytes));
    if(!identical)mismatches++;
    console.log('CLOUDFLARE ASSET',JSON.stringify({path:item.path,liveStatus:live.status,liveType:live.headers.get('content-type'),liveBytes:liveBody.byteLength,liveHash:sha(Buffer.from(liveBody)),githubMainStatus:repo.status,githubMainHash:sha(Buffer.from(repoBytes)),draftHash:sha(draft),matchesMain:identical}));
  }catch(err){failures++;console.log('CLOUDFLARE ASSET UNVERIFIED',item.path,String(err.message));}
}
try{
 const url='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
 const res=await fetch(url,{signal:AbortSignal.timeout(15000)});
 console.log('EXTERNAL PDF LIBRARY',res.status,res.headers.get('content-type'));
}catch(err){console.log('EXTERNAL PDF LIBRARY UNVERIFIED',String(err.message));}
console.log('CLOUDFLARE DIAGNOSTIC SUMMARY',JSON.stringify({mismatches,failures,total:list.length}));
