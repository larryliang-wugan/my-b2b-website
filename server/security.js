import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export const token=()=>randomBytes(32).toString('hex');
export const digest=s=>createHash('sha256').update(s).digest('hex');
export function hashPassword(password){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
export function checkPassword(password,stored){try{const [salt,hash]=stored.split(':');const a=Buffer.from(hash,'hex'),b=scryptSync(password,salt,64);return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}}
export function validateInquiry(b){
 const max={name:120,email:254,company:180,country:100,message:6000,products:1000,quantity:30,fabric:100,requestKey:80};
 const d={};for(const [k,n] of Object.entries(max)){d[k]=String(b[k]??'').trim();if(d[k].length>n)throw new Error('A field exceeds the maximum length.');}
 if(!d.name||!d.company||!d.country||d.message.length<10||!/^\S+@[^\s@]+\.[^\s@]+$/.test(d.email))throw new Error('Complete your contact details and add at least 10 characters about your project.');
 if(!/^\d+$/.test(d.quantity)||Number(d.quantity)<1||Number(d.quantity)>100000000)throw new Error('Enter a valid estimated quantity.');
 if(b.consent!=='yes')throw new Error('Please acknowledge the privacy notice.');
 if(!/^[a-zA-Z0-9-]{16,80}$/.test(d.requestKey))throw new Error('Refresh the form and try again.');
 return d;
}
