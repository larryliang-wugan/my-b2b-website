import {spawnSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
for(const dir of ['server','web','scripts'])for(const name of readdirSync(dir)){if(!/\.(m?js)$/.test(name))continue;const r=spawnSync(process.execPath,['--check',`${dir}/${name}`],{stdio:'inherit'});if(r.status)process.exit(r.status);}
for(const file of ['public/media/trunks.jpg','public/media/brief.jpg','public/media/long-leg.jpg','public/media/modal.png','public/media/partners.png','web/style.css'])if(!existsSync(file))throw new Error('Missing asset: '+file);
console.log('Server and browser scripts validated; required assets present. Run npm test for functional validation.');
