import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.WUGAN_TEST_URL||'http://localhost:8090';
const site=JSON.parse(await readFile('wordpress/wugan-studio/data/site.json','utf8'));
const root=path.resolve('review/WUGAN-2.0.2-preview');
await mkdir(path.join(root,'media'),{recursive:true});
const routes=['/',...Object.keys(site.pages).filter(x=>x!=='home').map(x=>`/${x}/`),...site.products.map(p=>`/product/${p.slug}/`)];
const files=new Map();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage();
 for(const route of routes){
  const response=await page.goto(base+route);
  if(response.status()!==200)throw Error(`Cannot export ${route}`);
  await page.evaluate(()=>{
   document.querySelectorAll('link[rel="https://api.w.org/"],link[rel="EditURI"],link[rel="shortlink"],link[rel="canonical"],link[rel="alternate"],link[rel="dns-prefetch"],link[rel="preconnect"]').forEach(n=>n.remove());
   document.querySelectorAll('script').forEach(n=>{if(!/\/(site\.js|lucide\.min\.js)(\?|$)/.test(n.src))n.remove()});
   document.querySelectorAll('img').forEach(n=>{n.removeAttribute('srcset');n.removeAttribute('sizes')});
   document.querySelectorAll('form.wugan-form').forEach(form=>{
    form.removeAttribute('action');form.removeAttribute('method');form.setAttribute('data-preview-form','');
    form.querySelectorAll('input[type=hidden],.wugan-trap').forEach(n=>n.remove());
    form.querySelector('button[type=submit]').textContent='Prepare inquiry email';
    const notice=document.createElement('p');notice.className='preview-notice';notice.textContent='Offline preview: this form prepares an email draft. It does not send or save an inquiry.';form.before(notice);
    const status=document.createElement('p');status.className='form-status';status.hidden=true;status.setAttribute('role','status');form.append(status);
   });
   document.querySelectorAll('.catalogue').forEach(catalog=>{
    catalog.classList.add('catalog');
    const old=catalog.querySelector('form');const options=[...old.querySelectorAll('select option')].map(x=>[x.value||'all',x.textContent]);
    const controls=document.createElement('div');controls.className='catalog-tools';
    const tabs=document.createElement('div');tabs.className='filter-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Filter products');
    for(const [value,label]of options){const button=document.createElement('button');button.type='button';button.dataset.filter=value;button.textContent=label;tabs.append(button)}
    const label=document.createElement('label');label.className='catalog-search';label.textContent='Search styles';const input=document.createElement('input');input.type='search';input.dataset.productSearch='';label.append(input);controls.append(tabs,label);old.replaceWith(controls);
    const count=document.createElement('p');count.className='result-count';count.setAttribute('aria-live','polite');controls.after(count);
    catalog.querySelectorAll('.product-card').forEach(card=>card.dataset.search=card.textContent.trim().toLowerCase());
    const empty=document.createElement('p');empty.className='no-results';empty.hidden=true;empty.textContent='No matching styles. Try another keyword or category.';catalog.append(empty);
   });
  });
  const resources=await page.locator('img[src],script[src],link[rel=stylesheet],a[download],a.gallery-link').evaluateAll(nodes=>nodes.map(n=>n.src||n.href));
  for(const url of resources){if(!url.startsWith(base+'/'))throw Error('Unexpected external resource '+url);if(files.has(url))continue;const target='media/'+files.size+'-'+path.basename(new URL(url).pathname);const r=await fetch(url);if(!r.ok)throw Error('Missing asset '+url);await writeFile(path.join(root,target),Buffer.from(await r.arrayBuffer()));files.set(url,target);}
  const target=route==='/'?'index.html':route.slice(1)+'index.html';const depth=path.dirname(target);const relative=file=>path.relative(depth,file).split(path.sep).join('/');
  await page.evaluate(({base,resources,links})=>{
   document.querySelectorAll('[src],[href]').forEach(n=>{for(const attr of ['src','href']){const value=n.getAttribute(attr);if(!value)continue;const absolute=new URL(value,location.href).href;if(resources[absolute])n.setAttribute(attr,resources[absolute]);else if(absolute.startsWith(base+'/')){const u=new URL(absolute);if(links[u.pathname])n.setAttribute(attr,links[u.pathname]+u.search+u.hash);}}});
  },{base,resources:Object.fromEntries([...files].map(([url,file])=>[url,relative(file)])),links:Object.fromEntries([...routes.map(r=>[r,relative(r==='/'?'index.html':r.slice(1)+'index.html')]),...site.products.map(p=>['/product-category/'+p.category+'/',relative('underwear/index.html')+'?category='+p.category])])});
  await mkdir(path.dirname(path.join(root,target)),{recursive:true});await writeFile(path.join(root,target),await page.content());
 }
 await writeFile(path.join(root,'README.txt'),'WUGAN 2.0.2 offline design review\nOpen index.html after extracting this entire folder.\nThis is a preview of the WordPress theme, not an installable theme. Forms prepare email drafts; no inquiry is saved.\nThe live WordPress theme and plugin are packaged separately.\n');
 console.log(`Exported ${routes.length} actual WordPress pages and ${files.size} resources to ${root}`);
}finally{await browser.close()}
