const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
(async()=>{
 const base=process.env.WUGAN_TEST_URL||'http://localhost:8090';
 const root=path.resolve('review/WUGAN-2.0.1-preview');
 const site=JSON.parse(fs.readFileSync('wordpress/wugan-studio/data/site.json'));
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.txt':'text/plain'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).on('error',()=>{res.statusCode=404;res.end()}).pipe(res);
 });
 await new Promise(ok=>server.listen(4189,'127.0.0.1',ok));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  for(const width of [360,390,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
   await page.locator('img').evaluateAll(a=>Promise.all(a.map(async i=>{i.loading='eager';await i.decode()})));
   await page.waitForTimeout(250);
   await page.screenshot({path:`review/WUGAN-2.0.1-${width}.png`,fullPage:width===1440||width===390});
  }
  await page.goto(base+'/?s=CP6108&post_type=wugan_product');assert.equal(await page.locator('.product-card').count(),1);assert.match(await page.locator('.product-card').innerText(),/CP6108/);
  await page.goto(base+'/?s=not-a-real-style&post_type=wugan_product');assert.equal(await page.locator('.empty-state').count(),1);
  await page.goto(base+'/underwear/?category=natural');assert.equal(await page.locator('.product-card').count(),3);
  const missing=await page.goto(base+'/this-page-does-not-exist/');assert.equal(missing.status(),404);assert.equal(await page.locator('h1').count(),1);
  await page.goto(base+'/');await page.locator('.desktop-nav .product-menu summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.desktop-nav .mega-menu').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.desktop-nav .mega-menu').isVisible(),false);
  const routes=['index.html',...Object.keys(site.pages).filter(s=>s!=='home').map(s=>s+'/index.html'),...site.products.map(p=>'product/'+p.slug+'/index.html')];
  for(const route of routes){
   await page.goto('http://127.0.0.1:4189/'+route);
   const links=await page.locator('[href],[src]').evaluateAll(nodes=>nodes.flatMap(n=>['href','src'].map(a=>n.getAttribute(a)).filter(Boolean)));
   for(const value of links){
    if(/^(mailto:|https?:|#|data:)/.test(value)){assert.ok(!value.includes('localhost:8090'),'local runtime leaked into preview');continue}
    const file=decodeURIComponent(value.split(/[?#]/)[0]);if(!file)continue;
    assert.ok(fs.existsSync(path.resolve(root,path.dirname(route),file)),route+' missing '+value);
   }
   assert.equal(await page.locator('form[action*="admin-post"]').count(),0);
  }
  await page.goto('http://127.0.0.1:4189/underwear/index.html');await page.locator('[data-filter=natural]').click();assert.equal(await page.locator('.product-card:visible').count(),3);
  await page.goto('http://127.0.0.1:4189/samples/index.html?product=cp6108-active-boxer-brief');assert.match(await page.locator('[name=message]').inputValue(),/cp6108/);
  console.log('PASS: six viewport widths; decoded screenshots; SKU search; category and empty states; keyboard menu; 404; all offline links/assets; offline form safety.');
 }finally{await browser.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});
