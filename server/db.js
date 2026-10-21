import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { initialProducts,initialArticles } from './content.js';
export function openDb(dir){
 mkdirSync(dir,{recursive:true,mode:0o700});
 const db=new DatabaseSync(path.join(dir,'wugan.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS articles(id TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,request_key TEXT UNIQUE,data TEXT NOT NULL,attachment TEXT,created_at TEXT NOT NULL,status TEXT DEFAULT 'new',mail_status TEXT DEFAULT 'pending');
 CREATE TABLE IF NOT EXISTS admins(username TEXT PRIMARY KEY,password_hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
 if(!db.prepare("SELECT key FROM settings WHERE key='seeded'").get()){
  for(const p of initialProducts)db.prepare('INSERT OR IGNORE INTO products VALUES (?,?)').run(p.id,JSON.stringify(p));
  for(const p of initialArticles)db.prepare('INSERT OR IGNORE INTO articles VALUES (?,?)').run(p.id,JSON.stringify(p));
  db.prepare('INSERT INTO settings VALUES (?,?)').run('seeded','1');
 }
 return db;
}
export const records=(db,table)=>db.prepare(`SELECT data FROM ${table}`).all().map(r=>JSON.parse(r.data));
