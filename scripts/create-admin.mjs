import {openDb} from '../server/db.js';
import {hashPassword} from '../server/security.js';
import path from 'node:path';
const password=process.env.ADMIN_PASSWORD,username=process.env.ADMIN_USERNAME||'admin';
if(!password||password.length<14)throw new Error('Set ADMIN_PASSWORD to a unique password of at least 14 characters via secure environment configuration.');
const db=openDb(process.env.DATA_DIR||path.resolve('data'));
db.prepare('INSERT INTO admins VALUES(?,?) ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash').run(username,hashPassword(password));db.exec('DELETE FROM sessions');db.close();console.log('Administrator configured. Existing sessions revoked.');
