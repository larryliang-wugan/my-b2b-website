const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const site=require('../wordpress/wugan-second/data/site.json');
const base=process.env.WUGAN_TEST_URL||'http://localhost:8092';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const routes=['/',...Object.keys(site.pages).filter(x=>x!=='home').map(x=>`/${x}/`),...site.products.map(p=>`/product/${p.slug}/`)];
  for(const width of [360,390,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});
   for(const route of routes){
    assert.equal((await page.goto(base+route)).status(),200,route);
    assert.equal(await page.locator('h1').count(),1,route);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.evaluate(()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})})));
    assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src)),[],route);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${route} overflow`);
   }
   await page.goto(base);
   await page.evaluate(()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})})));
   await page.screenshot({path:`review/second-scheme-1.0.0-${width}.png`,fullPage:true});
   if(width>=1024){
    for(const menu of await page.locator('.desktop-nav .product-menu').all()){
     const summary=menu.locator('summary');await summary.hover();
     const a=await summary.boundingBox(),b=await menu.locator('a').nth(1).boundingBox();
     assert.ok(b,'Dropdown opens');
     for(let i=0;i<=20;i++){
      await page.mouse.move(a.x+a.width/2+(b.x+b.width/2-a.x-a.width/2)*i/20,a.y+a.height/2+(b.y+b.height/2-a.y-a.height/2)*i/20);
      await page.waitForTimeout(25);assert.equal(await menu.getAttribute('open'),'','Slow hover remains open');
     }
     await menu.locator('a').nth(1).click();assert.notEqual(new URL(page.url()).pathname,'/');await page.goto(base);
    }
   }else{
    await page.locator('.nav-toggle').click();await page.locator('.mobile-nav .product-menu').first().locator('summary').click();
    await page.locator('.mobile-nav a').filter({hasText:/^Athletic socks$/}).click();assert.equal(new URL(page.url()).pathname,'/socks/');await page.goto(base);
   }
   await page.locator('.language-menu summary').click();assert.equal(await page.locator('.language-menu a').count(),4);
   await page.keyboard.press('Escape');assert.equal(await page.locator('.language-menu').getAttribute('open'),null);
   const rail=page.locator('.s2-product-rail .product-grid');await rail.scrollIntoViewIfNeeded();
   await page.locator('[data-rail-next]').click();await page.waitForTimeout(650);assert.ok(await rail.evaluate(el=>el.scrollLeft>0));
  }
  await page.goto(base+'/contact/?private=test');
  assert.equal(new URL(await page.locator('.language-menu a[lang=de]').getAttribute('href')).searchParams.get('u'),'https://wugan.net/contact/');
  assert.equal((await page.goto(base+'/not-a-real-page/')).status(),404);
  assert.deepEqual(errors,[]);console.log(`PASS: ${routes.length} routes x 6 widths; images, headings, overflow; three hover menus, mobile navigation, language, carousel, 404, JS.`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
