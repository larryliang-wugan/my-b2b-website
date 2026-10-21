import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync,unlinkSync} from 'node:fs';
import path from 'node:path';
import {openDb,records} from './db.js';
import {token,digest,checkPassword,validateInquiry} from './security.js';
import {mailer,notifyInquiry} from './mail.js';
import {company} from './content.js';
import * as views from './render.js';
const root=path.resolve(import.meta.dirname,'..');
export function createApp({dataDir=process.env.DATA_DIR||path.join(root,'data'),env=process.env,transport=mailer(env)}={}){
 const db=openDb(dataDir);const app=express();
 const uploadDir=path.join(dataDir,'uploads');mkdirSync(uploadDir,{recursive:true,mode:0o700});
 app.disable('x-powered-by');if(env.TRUST_PROXY)app.set('trust proxy',Number(env.TRUST_PROXY));
 app.use(helmet({contentSecurityPolicy:{directives:{'script-src':["'self'"],'img-src':["'self'",'data:'],'upgrade-insecure-requests':env.NODE_ENV==='production'?[]:null}},strictTransportSecurity:env.NODE_ENV==='production'?undefined:false}));
 app.use(express.json({limit:'128kb'}));
 app.use((req,res,next)=>{if(req.path.startsWith('/api/')||req.path==='/admin')res.set('Cache-Control','no-store');next();});
 app.use('/media',express.static(path.join(root,'public/media'),{maxAge:'1d',dotfiles:'deny'}));
 app.use(express.static(path.join(root,'public'),{maxAge:'1h',index:false}));
 app.use(express.static(path.join(root,'web'),{maxAge:0,index:false}));
 const list=t=>records(db,t);const products=()=>list('products').filter(p=>p.active);const articles=()=>list('articles').filter(a=>a.active);
 function sameOrigin(req,res,next){const o=req.get('origin');if(o&&!new Set([env.APP_ORIGIN||company.domain,`${req.protocol}://${req.get('host')}`]).has(o))return res.status(403).json({error:'Request origin is not allowed.'});next();}
 app.use('/api',sameOrigin);
 const inquiryLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false,message:{error:'Too many requests. Please try again later or email sales@wugan.com.'}});
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1,fields:16,fieldSize:8000}});
 function fileType(f){if(!f)return null;const b=f.buffer;if(b.subarray(0,5).toString()==='%PDF-')return '.pdf';if(b[0]===255&&b[1]===216&&b[2]===255)return '.jpg';if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return '.png';throw new Error('Only PDF, JPG and PNG files are accepted.');}
 app.post('/api/inquiries',inquiryLimiter,upload.single('attachment'),async(req,res)=>{
  try{
   if(req.body.website)return res.status(400).json({error:'Unable to submit. Please contact us by email.'});
   const data=validateInquiry(req.body);const ext=fileType(req.file);
   const prior=db.prepare('SELECT id FROM inquiries WHERE request_key=?').get(data.requestKey);
   if(prior)return res.json({id:prior.id,message:'This enquiry has already been saved.'});
   let selected;try{selected=JSON.parse(data.products||'[]');}catch{throw new Error('Invalid product selection.');}
   if(!Array.isArray(selected)||selected.length>30||selected.some(id=>typeof id!=='string'||!products().some(p=>p.id===id)))throw new Error('Refresh your product selection and try again.');
   data.products=selected.map(id=>{const p=products().find(p=>p.id===id);return `${p.sku} — ${p.name}`;});
   const id='WG-'+randomUUID();const attachment=ext?id+ext:null;
   if(attachment)writeFileSync(path.join(uploadDir,attachment),req.file.buffer,{mode:0o600});
   try{db.prepare('INSERT INTO inquiries(id,request_key,data,attachment,created_at) VALUES(?,?,?,?,?)').run(id,data.requestKey,JSON.stringify(data),attachment,new Date().toISOString());}catch(e){if(attachment)unlinkSync(path.join(uploadDir,attachment));throw e;}
   res.status(201).json({id,message:'Your enquiry has been saved for our team. Keep your reference number for follow-up.'});
   const status=await notifyInquiry(transport,{id,...data},env);db.prepare('UPDATE inquiries SET mail_status=? WHERE id=?').run(status,id);
  }catch(e){res.status(400).json({error:e.code?'Unable to save your enquiry. Please try again or email us.':e.message});}
 });
 const loginLimiter=rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:true,legacyHeaders:false,message:{error:'Too many login attempts. Try again later.'}});
 app.post('/api/admin/login',loginLimiter,(req,res)=>{
  const {username,password}=req.body||{};
  if(typeof username!=='string'||typeof password!=='string'||password.length>1024)return res.status(400).json({error:'Invalid credentials.'});
  const admin=db.prepare('SELECT password_hash FROM admins WHERE username=?').get(username);
  if(!admin||!checkPassword(password,admin.password_hash))return res.status(401).json({error:'Invalid username or password.'});
  const session=token(),csrf=token();db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(session),csrf,Date.now()+8*60*60*1000);
  res.cookie('wugan_session',session,{httpOnly:true,secure:env.NODE_ENV==='production',sameSite:'strict',maxAge:8*60*60*1000,path:'/'});res.json({csrf});
 });
 function auth(req,res,next){
  const raw=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('wugan_session='))?.slice(14);
  const session=raw&&db.prepare('SELECT * FROM sessions WHERE token=? AND expires>?').get(digest(raw),Date.now());
  if(!session)return res.status(401).json({error:'Sign in required.'});
  if(!['GET','HEAD'].includes(req.method)&&req.get('X-CSRF-Token')!==session.csrf)return res.status(403).json({error:'Refresh the dashboard and try again.'});
  req.session=session;next();
 }
 app.use('/api/admin',auth);
 app.get('/api/admin/session',(req,res)=>res.json({csrf:req.session.csrf,mailConfigured:!!transport}));
 app.post('/api/admin/logout',(req,res)=>{db.prepare('DELETE FROM sessions WHERE token=?').run(req.session.token);res.clearCookie('wugan_session',{path:'/'});res.json({ok:true});});
 app.get('/api/admin/inquiries',(req,res)=>res.json(db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 1000').all().map(r=>({...r,data:JSON.parse(r.data),request_key:undefined}))));
 app.patch('/api/admin/inquiries/:id',(req,res)=>{if(!['new','contacted','quoted','closed'].includes(req.body.status))return res.status(400).json({error:'Invalid status.'});db.prepare('UPDATE inquiries SET status=? WHERE id=?').run(req.body.status,req.params.id);res.json({ok:true});});
 app.post('/api/admin/inquiries/:id/retry-mail',async(req,res)=>{const r=db.prepare('SELECT * FROM inquiries WHERE id=?').get(req.params.id);if(!r)return res.sendStatus(404);const status=await notifyInquiry(transport,{id:r.id,...JSON.parse(r.data)},env);db.prepare('UPDATE inquiries SET mail_status=? WHERE id=?').run(status,r.id);res.json({status});});
 app.get('/api/admin/inquiries/:id/attachment',(req,res)=>{const r=db.prepare('SELECT attachment FROM inquiries WHERE id=?').get(req.params.id);if(!r?.attachment)return res.sendStatus(404);res.download(path.join(uploadDir,r.attachment),'reference'+path.extname(r.attachment));});
 app.get('/api/admin/export',(req,res)=>{
  const csv=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'"+'$&').replaceAll('"','""')+'"';
  const rows=db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  res.type('text/csv').attachment('wugan-enquiries.csv').send('\uFEFF'+[['Reference','Date','Status','Name','Email','Company','Country','Quantity','Products','Message'],...rows.map(r=>{const d=JSON.parse(r.data);return [r.id,r.created_at,r.status,d.name,d.email,d.company,d.country,d.quantity,d.products.join('; '),d.message];})].map(r=>r.map(csv).join(',')).join('\r\n'));
 });
 for(const table of ['products','articles']){
  app.get('/api/admin/'+table,(req,res)=>res.json(list(table)));
  app.put('/api/admin/'+table+'/:id',(req,res)=>{
   const id=req.params.id,b=req.body;
   if(!/^[a-z0-9-]{1,80}$/.test(id))return res.status(400).json({error:'Use a lowercase slug with letters, numbers and hyphens.'});
   const keys=table==='products'?['sku','name','category','fabric','description','sizes','weight']:['title','summary','body'];
   if(keys.some(k=>typeof b[k]!=='string'||!b[k].trim()||b[k].length>(k==='body'?15000:2000)))return res.status(400).json({error:'Complete every text field within its length limit.'});
   if(table==='products'&&(!Array.isArray(b.images)||b.images.length<1||b.images.length>12||b.images.some(s=>typeof s!=='string'||!/^\/media\/[a-zA-Z0-9._-]+$/.test(s))))return res.status(400).json({error:'Provide 1–12 uploaded image paths.'});
   const data={id,...Object.fromEntries(keys.map(k=>[k,b[k].trim()])),active:b.active===true,...(table==='products'?{images:b.images}:{})};
   db.prepare(`INSERT INTO ${table}(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data`).run(id,JSON.stringify(data));res.json(data);
  });
 }
 app.post('/api/admin/media',upload.single('attachment'),(req,res)=>{try{const ext=fileType(req.file);if(!['.jpg','.png'].includes(ext))throw new Error('Upload a JPG or PNG image.');const filename=randomUUID()+ext;writeFileSync(path.join(root,'public/media',filename),req.file.buffer,{mode:0o644});res.json({url:'/media/'+filename});}catch(e){res.status(400).json({error:e.message});}});
 app.get('/health',(_req,res)=>{try{db.prepare('SELECT 1').get();res.json({status:'ok'});}catch{res.sendStatus(503);}});
 app.get('/robots.txt',(_req,res)=>res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${company.domain}/sitemap.xml\n`));
 app.get('/sitemap.xml',(_req,res)=>res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/products','/oem-odm','/fabrics','/factory','/about','/contact','/quote','/faq','/guides','/privacy','/terms',...products().map(p=>'/products/'+p.id),...articles().map(a=>'/guides/'+a.id)].map(p=>`<url><loc>${company.domain}${p}</loc></url>`).join('')}</urlset>`));
 const pages={'/':['Men’s underwear OEM & private label manufacturer',()=>views.home(products())],'/products':['Private label underwear collection',()=>views.catalog(products())],'/oem-odm':['OEM & ODM underwear development',views.oem],'/fabrics':['Fabrics & customization',views.fabrics],'/factory':['Our factory & quality',views.factory],'/about':['About WUGAN',views.about],'/quote':['Request a quote',()=>views.quote(products())],'/contact':['Contact WUGAN',views.contact],'/faq':['Buyer FAQ',views.faqPage],'/guides':['Buyer resources',()=>views.guides(articles())],'/privacy':['Privacy notice',views.privacy],'/terms':['Business terms',views.terms]};
 for(const [url,[title,render]]of Object.entries(pages))app.get(url,(req,res)=>res.send(views.layout(title,render(),url)));
 app.get('/products/:id',(req,res)=>{const p=products().find(p=>p.id===req.params.id);if(!p)return notFound(req,res);res.send(views.layout(p.name,views.product(p,products()),req.path,{description:p.description}));});
 app.get('/guides/:id',(req,res)=>{const a=articles().find(a=>a.id===req.params.id);if(!a)return notFound(req,res);res.send(views.layout(a.title,views.article(a),req.path,{description:a.summary}));});
 app.get('/admin',(req,res)=>res.send(views.layout('Management',views.adminPage(),'/admin',{admin:true,noindex:true})));
 function notFound(req,res){res.status(404).send(views.layout('Page not found','<section class="section wrap"><p class="eyebrow">404</p><h1>A different direction.</h1><p>This page is unavailable.</p><a class="button" href="/products">Explore our products ↗</a></section>',req.path,{noindex:true}));}
 app.use(notFound);
 app.use((err,req,res,next)=>{if(res.headersSent)return next(err);res.status(err.code==='LIMIT_FILE_SIZE'?413:400).json({error:err.code==='LIMIT_FILE_SIZE'?'Attachment exceeds 10 MB.':'Unable to process the request. Check the file and try again.'});});
 return {app,db};
}
