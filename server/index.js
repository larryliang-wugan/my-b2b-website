import { createApp } from './app.js';
const {app}=createApp();
app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log(`WUGAN server listening on port ${process.env.PORT||3000}`));
