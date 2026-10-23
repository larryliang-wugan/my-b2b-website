import {cp,readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('review/WUGAN-offline-preview');
await mkdir(root,{recursive:true});
await cp('review/wugan-studio-preview',root,{recursive:true});
async function walk(dir){let files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
let count=0;
for(const file of await walk(root)){
 if(!file.endsWith('.html'))continue;
 let html=await readFile(file,'utf8');
 html=html.replace(/\b(href|src)="(\/[^"\s]*)"/g,(full,attr,url)=>{
  if(url.startsWith('//'))return full;
  const u=new URL(url,'https://preview.invalid');
  const target=path.join(root,u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname);
  let relative=path.relative(path.dirname(file),target).split(path.sep).join('/');
  return `${attr}="${relative||'index.html'}${u.search}${u.hash}"`;
 });
 await writeFile(file,html);count++;
}
// The preview generates its email draft locally and does not require a server.
await writeFile(path.join(root,'README.txt'),'WUGAN 网站离线预览\n\n1. 解压整个压缩包。\n2. 双击本文件旁边的 index.html，用 Chrome 或 Safari 打开。\n3. 保留文件夹结构，导航可跳转各页面。\n\n这是外观和交互预览，不包含 WordPress 后台。询盘按钮打开邮件草稿，不会保存后台询盘。正式后台使用单独交付的 WordPress 主题和询盘插件。\n');
console.log(`Exported ${count} offline pages to ${root}`);
