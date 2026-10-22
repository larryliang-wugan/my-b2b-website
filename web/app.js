const $=s=>document.querySelector(s);
let cart;try{cart=JSON.parse(localStorage.getItem('wugan-enquiry')||'[]');if(!Array.isArray(cart))cart=[];}catch{cart=[];}
cart=cart.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string');
function save(){try{localStorage.setItem('wugan-enquiry',JSON.stringify(cart));}catch{}document.querySelectorAll('.cart-count').forEach(e=>e.textContent=cart.length?`(${cart.length})`:'');}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
const menu=$('.menu-button');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#nav').classList.toggle('open',open);});
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{if(!cart.some(p=>p.id===b.dataset.add)){cart.push({id:b.dataset.add,name:b.dataset.name});save();}toast('Added to your enquiry. Use “Get a quote” to continue.');}));
document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{$('.main-product-photo').src=b.dataset.image;}));
function filter(){let n=0;document.querySelectorAll('.product-card').forEach(card=>{const match=card.dataset.search.includes(($('#product-search')?.value||'').toLowerCase())&&(!$('#category-filter')?.value||card.dataset.category===$('#category-filter').value);card.hidden=!match;if(match)n++;});if($('#result-count'))$('#result-count').textContent=`${n} styles`;if($('#empty-results'))$('#empty-results').hidden=n!==0;}
$('#product-search')?.addEventListener('input',filter);$('#category-filter')?.addEventListener('change',filter);
const form=$('#quote-form');
const preview=document.documentElement.hasAttribute('data-static-preview');
const makeKey=()=>globalThis.crypto?.randomUUID?.()||'preview-'+Date.now()+'-'+Math.random().toString(36).slice(2);
if(form){
 const products=JSON.parse($('#product-data').dataset.products);cart=cart.filter(x=>products.some(p=>p.id===x.id));
 const id=new URLSearchParams(location.search).get('product');const product=products.find(p=>p.id===id);if(product&&!cart.some(p=>p.id===id))cart.push({id,name:product.name});
 function selection(){const box=$('#selected-products');box.replaceChildren();if(!cart.length){box.textContent='No styles selected. Describe your own design below.';return;}cart.forEach(p=>{const row=document.createElement('div');row.className='selected-row';const text=document.createElement('span');text.textContent=p.name;const b=document.createElement('button');b.type='button';b.textContent='Remove';b.addEventListener('click',()=>{cart=cart.filter(x=>x.id!==p.id);save();selection();});row.append(text,b);box.append(row);});}
 const intent=new URLSearchParams(location.search).get('request');
 if(intent==='sample')form.elements.message.value='I would like to request samples. Please confirm the selection, cost and shipping.';
 if(intent==='bundle')form.elements.message.value='Please help me develop a starter collection for my gym or brand.';
 if(intent==='socks'){form.elements.productInterest.value='Socks — feasibility enquiry';form.elements.message.value='Please review feasibility for my athletic sock project.';}
 if(preview)form.querySelector('.preview-notice').hidden=false;
 selection();let requestKey=makeKey();
 form.addEventListener('submit',async e=>{e.preventDefault();const status=$('#form-status'),button=form.querySelector('button[type="submit"]');const body=new FormData(form);const file=body.get('attachment');if(file?.size>10*1024*1024){status.textContent='Please choose a file smaller than 10 MB.';return;}
 if(preview){status.textContent='Preview complete: nothing was sent or saved. Contact sales@wugan.com for a live enquiry.';return;}
 const extras=['Product interest: '+body.get('productInterest'),'Quantity range: '+form.elements.quantity.selectedOptions[0].textContent,'Customization: '+(body.getAll('customization').join(', ')||'To discuss')];
 body.set('message',body.get('message')+'\n\n'+extras.join('\n'));body.delete('productInterest');body.delete('customization');
 body.set('products',JSON.stringify(cart.map(p=>p.id)));body.set('requestKey',requestKey);button.disabled=true;status.textContent='Saving your enquiry…';
 try{const r=await fetch('/api/inquiries',{method:'POST',body});const result=await r.json();if(!r.ok)throw new Error(result.error||'Unable to submit.');status.textContent=`${result.message} Reference: ${result.id}`;form.reset();cart=[];save();selection();requestKey=makeKey();}
 catch(err){status.textContent=err.message+' Your entries have been kept. You can also email sales@wugan.com.';}
 finally{button.disabled=false;}
 });
}
save();
const dialog=$('#sample-dialog');
document.querySelectorAll('[data-sample-open]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
dialog?.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const tabs=[...document.querySelectorAll('[data-tech]')];
function activate(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!active;});}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(t));t.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();activate(tabs[next]);tabs[next].focus();}});});
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>{$('#nav').classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
