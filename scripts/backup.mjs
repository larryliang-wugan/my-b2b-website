import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,cpSync} from 'node:fs';
import path from 'node:path';
const dir=process.env.DATA_DIR||path.resolve('data');const target=path.resolve(process.env.BACKUP_DIR||'backups',new Date().toISOString().replace(/[:.]/g,'-'));mkdirSync(target,{recursive:true,mode:0o700});
const db=new DatabaseSync(path.join(dir,'wugan.sqlite'));await backup(db,path.join(target,'wugan.sqlite'));cpSync(path.join(dir,'uploads'),path.join(target,'uploads'),{recursive:true});cpSync('public/media',path.join(target,'media'),{recursive:true});db.close();console.log('Backup created:',target);
