const { chromium }=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 await page.goto('http://localhost:8090/samples/?product=cp6108-active-boxer-brief');
 assert.equal(await page.locator('[name=request_type]').inputValue(),'Samples');
 assert.equal(await page.locator('[name=product]').inputValue(),'underwear');
 assert.match(await page.locator('[name=message]').inputValue(),/CP6108/);
 for(const [key,value] of Object.entries({customer_name:'Integration Test',email:'buyer@example.invalid',company:'Local Test Only',country:'United States',quantity:'300'}))await page.locator(`[name=${key}]`).fill(value);
 await page.locator('[name=consent]').check();
 await Promise.all([page.waitForURL('**/contact/?inquiry=received'),page.locator('button[type=submit]').click()]);
 assert.match(await page.locator('.wugan-notice').innerText(),/inquiry has been saved/);
 assert.match(await page.locator('.wugan-notice').innerText(),/could not be sent/);
 const bad=await page.request.post('http://localhost:8090/wp-admin/admin-post.php',{form:{action:'wugan_submit',wugan_nonce:'bad'}});assert.equal(bad.status(),403);
 const fresh=await browser.newPage();await fresh.goto('http://localhost:8090/contact/?inquiry=received');assert.match(await fresh.locator('.wugan-notice').innerText(),/No recent submission/);
 await browser.close();console.log('PASS: sample/style preselection, real inquiry save, email-failure receipt, invalid nonce rejection and unverified receipt handling. External mail disabled.');
})().catch(e=>{console.error(e);process.exit(1)});
