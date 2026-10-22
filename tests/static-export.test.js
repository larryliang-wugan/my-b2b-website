import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readdirSync,readFileSync,statSync} from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';

test('NAS export: every page, link, anchor and asset works without directory redirects', async()=>{
 const root=path.resolve(import.meta.dirname,'..');
 const result=spawnSync(process.execPath,['scripts/export-static.mjs'],{cwd:root,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const output=path.join(root,'artifacts/nas-preview/wugan-site');
 const all=[];
 function walk(dir){for(const name of readdirSync(dir)){const file=path.join(dir,name);if(statSync(file).isDirectory())walk(file);else all.push(file);}}
 walk(output);const pages=all.filter(f=>f.endsWith('.html'));
 assert.equal(pages.length,19,'Export all main, product and article pages');
 // Refuse directories deliberately: tests cannot pass through a helpful redirect or directory index.
 const server=createServer((req,res)=>{
  const url=new URL(req.url,'http://local');
  if(!url.pathname.startsWith('/renamed-preview/')){res.writeHead(404).end();return;}
  const file=path.join(output,decodeURIComponent(url.pathname.slice('/renamed-preview/'.length)));
  try{if(!statSync(file).isFile()){res.writeHead(404).end();return;}res.end(readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;const checked=new Set();
 try{
  for(const file of pages){
   const url=new URL('/renamed-preview/'+path.relative(output,file),origin);
   const html=readFileSync(file,'utf8');
   assert.match(html,/data-static-preview/);assert.match(html,/NAS preview v3/);
   assert.match(html,/noindex,nofollow/);
   const response=await fetch(url,{redirect:'error'});assert.equal(response.status,200);
   for(const [,attr,value]of html.matchAll(/\b(href|src|data-image)="([^"]+)"/g)){
    if(/^(https?:|mailto:|tel:)/.test(value))continue;
    assert.ok(!value.startsWith('/'),'No hardcoded root links: '+value);
    const destination=new URL(value.replaceAll('&amp;','&'),url);
    assert.ok(destination.pathname.startsWith('/renamed-preview/'));
    if(!checked.has(destination.href)){const r=await fetch(destination,{redirect:'error'});assert.equal(r.status,200,`${url.pathname}: ${attr}=${value}`);checked.add(destination.href);}
    if(destination.hash){const target=path.join(output,decodeURIComponent(destination.pathname.slice('/renamed-preview/'.length)));assert.ok(readFileSync(target,'utf8').includes(`id="${destination.hash.slice(1)}"`),'Missing anchor '+destination.href);}
   }
  }
  assert.ok(checked.size>30);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
