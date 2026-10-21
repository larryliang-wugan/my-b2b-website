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
if(form){
 const products=JSON.parse($('#product-data').dataset.products);cart=cart.filter(x=>products.some(p=>p.id===x.id));
 const id=new URLSearchParams(location.search).get('product');const product=products.find(p=>p.id===id);if(product&&!cart.some(p=>p.id===id))cart.push({id,name:product.name});
 function selection(){const box=$('#selected-products');box.replaceChildren();if(!cart.length){box.textContent='No styles selected. Describe your own design below.';return;}cart.forEach(p=>{const row=document.createElement('div');row.className='selected-row';const text=document.createElement('span');text.textContent=p.name;const b=document.createElement('button');b.type='button';b.textContent='Remove';b.addEventListener('click',()=>{cart=cart.filter(x=>x.id!==p.id);save();selection();});row.append(text,b);box.append(row);});}
 selection();let requestKey=crypto.randomUUID();
 form.addEventListener('submit',async e=>{e.preventDefault();const status=$('#form-status'),button=form.querySelector('button[type="submit"]');const body=new FormData(form);const file=body.get('attachment');if(file?.size>10*1024*1024){status.textContent='Please choose a file smaller than 10 MB.';return;}
 body.set('products',JSON.stringify(cart.map(p=>p.id)));body.set('requestKey',requestKey);button.disabled=true;status.textContent='Saving your enquiry…';
 try{const r=await fetch('/api/inquiries',{method:'POST',body});const result=await r.json();if(!r.ok)throw new Error(result.error||'Unable to submit.');status.textContent=`${result.message} Reference: ${result.id}`;form.reset();cart=[];save();selection();requestKey=crypto.randomUUID();}
 catch(err){status.textContent=err.message+' Your entries have been kept. You can also email sales@wugan.com.';}
 finally{button.disabled=false;}
 });
}
save();
