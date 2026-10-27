const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  for(const width of [1024,1280,1440,1920]){
   await page.setViewportSize({width,height:900});
   for(const scrolled of [false,true]){
    await page.goto('http://localhost:8090/');
    if(scrolled)await page.evaluate(()=>window.scrollTo(0,600));
    const menu=page.locator('.desktop-nav .product-menu');
    const summary=menu.locator('summary');await summary.hover();
    const start=await summary.boundingBox();
    // A slow move across the former gap must not close the panel.
    const target=await menu.locator('a').nth(2).boundingBox();
    for(let i=0;i<=25;i++){
     await page.mouse.move(start.x+start.width/2+(target.x+target.width/2-start.x-start.width/2)*i/25,start.y+start.height/2+(target.y+target.height/2-start.y-start.height/2)*i/25);
     await page.waitForTimeout(25);assert.equal(await menu.getAttribute('open'),'');
    }
    await page.waitForTimeout(350);assert.equal(await menu.locator('.mega-menu').isVisible(),true);
    await menu.locator('a').nth(2).click();assert.ok(page.url().includes('category=seamless'));
    await page.locator('.desktop-nav a').filter({hasText:/^Home$/}).click();assert.equal(new URL(page.url()).pathname,'/');
    await summary.hover();await page.mouse.move(10,800);await page.waitForTimeout(350);assert.equal(await menu.getAttribute('open'),null);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  for(const width of [360,390,768,1440]){
   await page.setViewportSize({width,height:844});await page.goto('http://localhost:8090/');
   const language=page.locator('.language-menu');await language.locator('summary').click();
   assert.equal(await language.locator('a').count(),4);
   const href=await language.locator('a[lang=es]').getAttribute('href');const url=new URL(href);assert.equal(url.hostname,'translate.google.com');assert.equal(url.searchParams.get('u'),'https://wugan.net/');
   await page.screenshot({path:`review/navigation-2.0.2-${width}.png`});
   await page.keyboard.press('Escape');assert.equal(await language.getAttribute('open'),null);
   if(width<1000){await page.locator('.nav-toggle').click();await page.locator('.mobile-nav .product-menu summary').click();await page.locator('.mobile-nav a').filter({hasText:/^Athletic socks$/}).click();assert.ok(page.url().endsWith('/socks/'))}
  }
  await page.goto('http://localhost:8090/contact/?inquiry=received&private=test');
  const url=new URL(await page.locator('.language-menu a[lang=de]').getAttribute('href'));assert.equal(url.searchParams.get('u'),'https://wugan.net/contact/');
  console.log('PASS: slow pointer traversal before/after scroll at four desktop widths; click-through; outside close; Home; language menu; no query leakage; mobile menus.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
