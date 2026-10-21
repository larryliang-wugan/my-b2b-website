import nodemailer from 'nodemailer';
export function mailer(env=process.env){
 if(!env.SMTP_HOST||!env.SMTP_FROM)return null;
 return nodemailer.createTransport({host:env.SMTP_HOST,port:Number(env.SMTP_PORT||587),secure:env.SMTP_PORT==='465',requireTLS:env.SMTP_PORT!=='465',auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000});
}
export async function notifyInquiry(transport,entry,env=process.env){
 if(!transport)return 'unconfigured';
 try{await transport.sendMail({from:env.SMTP_FROM,to:env.INQUIRY_TO||'sales@wugan.com',replyTo:entry.email,subject:`WUGAN enquiry ${entry.id}`,text:`New website enquiry: ${entry.id}\n\n${Object.entries(entry).map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nReview the record and any attachment in the authenticated website dashboard.`});return 'sent';}catch{return 'failed';}
}
