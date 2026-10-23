import { readdir, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve('wordpress/wugan-studio/assets');
await mkdir(root,{recursive:true});
async function walk(dir) { let out=[]; for(const e of await readdir(dir,{withFileTypes:true})) { if(e.name==='__MACOSX')continue; const p=path.join(dir,e.name); out.push(...(e.isDirectory()?await walk(p):[p])); }return out; }
const files=await walk('/workspace/attachments');
const sources={
 'logo.png':'公司简介/LOGO 透明底.png',
 'showroom.jpg':'展厅/1 (2).jpg', 'sock-showroom.jpg':'展厅/1 (4).jpg',
 'partnership.jpg':'客户合作素材/5.jpg','customer-visit.jpg':'客户合作素材/2.jpg',
 'team.jpg':'团队素材/3-2.jpg',
 'cp6108.jpg':'CP6108/2.jpg','cp6108-blue.jpg':'CP6108/1.jpg','cp6108-fit.jpg':'CP6108/4.jpg',
 'cp6116.jpg':'CP6116全无痕长腿/2.jpg','cp6116-white.jpg':'CP6116全无痕长腿/1.jpg','fabric-detail.jpg':'CP6116全无痕长腿/7.jpg',
 'cp6112.jpg':'CP6112/3.jpg','cp6112-brown.jpg':'CP6112/2.jpg',
 'cp6110.jpg':'CP6110/3.jpg','cp6110-black.jpg':'CP6110/2.jpg',
 'cp6117.jpg':'CP6117再生纤维面料/1.jpg','cp6117-white.jpg':'CP6117再生纤维面料/2.jpg',
 'cp6125.jpg':'CP6125/5.jpg','stitch-detail.jpg':'CP6125/8.jpg',
 'cp6127.jpg':'CP6127/13.jpg','waistband-detail.jpg':'CP6127/6.jpg',
 'cp6113.jpg':'CP6113/2.jpg','cp6113-navy.jpg':'CP6113/3.jpg',
 'pouch-detail.jpg':'CP6123内部结构款/2.jpg',
};
const provenance=[];
for(const [name,suffix] of Object.entries(sources)) {
 const source=files.find(f=>f.endsWith('/'+suffix)); if(!source)throw Error('Missing '+suffix);
 // Resize only for delivery; retain the original uploaded files unchanged.
 execFileSync('convert',[source,'-auto-orient','-resize',name==='logo.png'?'280x280>':'1800x1400>','-strip','-quality','86',path.join(root,name)]);
 provenance.push({asset:name,source:suffix});
}
for(const name of ['workshop','cutting','quality','sewing','bonding'])execFileSync('convert',[`public/media/${name}.jpg`,'-auto-orient','-resize','1800x1400>','-strip','-quality','84',path.join(root,`${name}.jpg`)]);
await writeFile(path.join(root,'provenance.json'),JSON.stringify(provenance,null,2));
console.log(`Prepared ${provenance.length+5} original brand, product and factory assets.`);
