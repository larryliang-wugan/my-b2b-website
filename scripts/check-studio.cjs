const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async()=>{
 const base=process.env.WUGAN_TEST_URL||'http://localhost:4173';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 const site=JSON.parse(fs.readFileSync('wordpress/wugan-studio/data/site.json','utf8'));
 const routes=['/',...Object.keys(site.pages).filter(s=>s!=='home').map(s=>'/'+s+'/'),...site.products.map(p=>'/product/'+p.slug+'/')];
 for(const route of routes){const res=await page.goto(base+route);assert.equal(res.status(),200,route);await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete));const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src));assert.deepEqual(broken,[],route+' images');assert.equal(await page.locator('h1').count(),1,route+' h1');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,route+' desktop overflow');}
 await page.goto(base+'/');await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete));await page.screenshot({path:'review/wugan-desktop.png',fullPage:true});
 await page.locator('.desktop-nav .product-menu').hover();assert.equal(await page.locator('.desktop-nav .product-menu').getAttribute('open'),'');await page.locator('.desktop-nav .nav-dropdown a').first().click();assert.ok(page.url().includes('/underwear/'));
 if(base.endsWith('4173')){await page.locator('[data-filter=natural]').click();assert.equal(await page.locator('.product-card:visible').count(),3);await page.locator('[data-product-search]').fill('does-not-exist');assert.equal(await page.locator('.product-card:visible').count(),0);assert.equal(await page.locator('.no-results').isVisible(),true);}
 await page.goto(base+'/product/'+site.products[0].slug+'/');const before=await page.locator('.product-main-image img').getAttribute('src');await page.locator('.gallery-link').nth(1).click();assert.notEqual(await page.locator('.product-main-image img').getAttribute('src'),before);
 await page.setViewportSize({width:390,height:844});
 for(const route of routes){await page.goto(base+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' mobile overflow');}
 await page.goto(base+'/');await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete));await page.screenshot({path:'review/wugan-mobile.png',fullPage:true});await page.locator('.nav-toggle').click();await page.locator('.mobile-nav .product-menu summary').click();await page.locator('.mobile-nav a[href$="/socks/"]').click();assert.ok(page.url().includes('/socks/'));
 assert.deepEqual(failures,[],'browser errors');await browser.close();console.log(`PASS: ${routes.length} pages, images, desktop/mobile overflow, dropdowns, gallery, and catalog interactions (${base}).`);
})().catch(e=>{console.error(e);process.exit(1)});
