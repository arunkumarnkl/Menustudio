// Headless release smoke checks. No credentials, D1 writes or production changes.
// Auth-only integration is tested separately; block the live Security API here.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base=process.env.MENUSTUDIO_URL||'http://127.0.0.1:8765/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/security-app.js')){
    return route.fulfill({status:200,contentType:'application/javascript',body:'/* Auth deliberately excluded from local offline smoke test */'});
  }
  if(url.origin!==new URL(base).origin)return route.abort();
  return route.continue();
});

async function run(){
  await mkdir('browser-smoke',{recursive:true});
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200,'Local built Menu Studio loads');
  await page.waitForFunction(()=>typeof window.ragaRenderMealCards==='function',{timeout:30000});
  await page.evaluate(()=>window.ragaRenderMealCards());
  assert.ok(await page.locator('[data-raga-session]').count()>=5,'Existing meal session cards present');
  assert.equal(await page.locator('#header-app-theme').count(),0,'Removed dark/light app selector');
  assert.equal(await page.locator('body.app-light').count(),1,'Light UI is enforced');

  const breakfast=page.locator('[data-raga-session="breakfast"]');
  await breakfast.locator('[data-raga-action="toggle-meal"]').click();
  const mode=()=>page.locator('[data-raga-action="meal-service"][data-session="breakfast"]');
  await mode().selectOption('Buffet');
  assert.equal(await breakfast.locator('.raga-course-card').count(),1,'Buffet is one General section');
  await mode().selectOption('Thali');
  assert.equal(await breakfast.locator('.raga-course-card').count(),1,'Thali is one General section');
  await mode().selectOption('Multi Stations');
  assert.equal(await breakfast.locator('.raga-course-card').count(),6,'Multi Stations has six default sections');
  await breakfast.locator('[data-raga-action="add-station"]').click();
  assert.equal(await breakfast.locator('.raga-course-card').count(),7,'New stations can be added');
  const rename=breakfast.locator('[data-raga-action="station-name"]').last();
  await rename.fill('Live Pasta Bar');
  await rename.press('Tab');
  assert.ok(await breakfast.getByText('Live Pasta Bar').count()>0,'Station name is editable');

  await mode().selectOption('Buffet');
  await breakfast.locator('.raga-course-card summary').click();
  const manual=breakfast.locator('.raga-card-manual');
  await manual.locator('summary').click();
  await manual.locator('[data-raga-manual="name"]').fill('chicken curry');
  await manual.locator('[data-raga-manual="desc"]').fill('FRESH HERBS AND SPICES');
  await manual.locator('[data-raga-manual-check="allergens"][value="Milk"]').check();
  await manual.locator('[data-raga-manual="verified"]').check();
  await manual.locator('[data-raga-action="manual-add"]').click();
  assert.ok((await page.locator('#raga-cards-total').innerText()).includes('1 dish'),'Manual dish is retained');
  await mode().selectOption('Multi Stations');
  assert.ok((await page.locator('#raga-cards-total').innerText()).includes('1 dish'),'Style change does not delete dishes');

  await page.evaluate(()=>{state.layout='a4';state.design=state.designs.a4;normalizeEventFormatRecords();renderPreview();});
  assert.ok(await page.locator('#paper-render-target .print-sheet').count()>=1,'A4 print preview renders');
  const html=await page.locator('#paper-render-target').innerHTML();
  assert.ok(html.includes('raga-declared-allergens')&&html.includes('#8B1E20'),'Allergens are bold dark red in print preview');
  await page.screenshot({path:'browser-smoke/menu-studio-builder.png',fullPage:false});
  await page.evaluate(()=>switchTab('design'));
  await page.screenshot({path:'browser-smoke/menu-studio-design.png',fullPage:false});
  assert.equal(errors.length,0,'No unhandled browser script exceptions: '+errors.join('; '));
  console.log('PASS Browser smoke: session styles, station management, manual allergens, single light UI and A4 preview');
}
try{await run();}
finally{await browser.close();}
