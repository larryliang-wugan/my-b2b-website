const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
(async()=>{
 const root=process.argv[2];if(!root)throw Error('Pass the extracted reference directory');
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);return res.end()};res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.png':'image/png'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)});
 await new Promise(ok=>server.listen(4186,'127.0.0.1',ok));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4186/')?route.continue():route.abort());
  const report=[];
  for(const name of ['index','jewelry-showcase','front-jewelry-display-case','solution','factory-show','company-profile','contact-us']){
   await page.goto('http://127.0.0.1:4186/'+name+'.html');
   report.push(await page.evaluate(()=>({
    page:location.pathname,title:document.title,
    navigation:[...document.querySelectorAll('[data-menu]')].slice(0,45).map(n=>({label:n.querySelector('a')?.textContent.trim(),href:n.querySelector('a')?.getAttribute('href'),parent:n.dataset.parents})),
    languageLinks:[...document.querySelectorAll('a')].filter(n=>/translate|\/es\/|\/de\/|\/fr\//.test(n.href)).slice(0,6).map(n=>({label:n.textContent.trim(),href:n.getAttribute('href')})),
    media:[...document.querySelectorAll('[data-media]')].map(n=>({label:n.dataset.media,tag:n.tagName,width:Math.round(n.getBoundingClientRect().width),height:Math.round(n.getBoundingClientRect().height)})),
    fields:[...document.querySelectorAll('[data-title]')].map(n=>n.dataset.title),
    text:document.body.innerText.replace(/\s+/g,' ').slice(-15000)
   })));
  }
  fs.writeFileSync('review/reference-study.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.map(r=>({page:r.page,navigation:r.navigation,media:r.media.slice(0,12),fields:r.fields})),null,2));
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
