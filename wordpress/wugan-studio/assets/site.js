(() => {
 document.querySelectorAll('a, .product-arrow').forEach(el=>{
  for(const node of [...el.childNodes]){
   if(node.nodeType===3&&node.textContent.includes('↗')){
    node.textContent=node.textContent.replaceAll('↗','');
    const icon=document.createElement('i');icon.dataset.lucide='arrow-up-right';icon.setAttribute('aria-hidden','true');el.append(icon);
   }
  }
 });
 document.querySelectorAll('span[aria-hidden=true]').forEach(el=>{if(el.textContent==='↗'){el.textContent='';el.dataset.lucide='arrow-up-right'}});
 document.querySelectorAll('.nav-toggle').forEach(el=>{el.textContent='';const icon=document.createElement('i');icon.dataset.lucide='menu';el.append(icon)});
 if(window.lucide)window.lucide.createIcons();
 const params = new URLSearchParams(location.search);
 document.querySelectorAll('form[data-preview-form] select[name=product]').forEach(select=>{
  const reference=params.get('product');
  if(reference&&!Array.from(select.options).some(o=>o.value===reference)){
   const option=document.createElement('option');option.value=reference;option.textContent=reference;select.append(option);
   const message=select.form.querySelector('textarea[name=message]');if(message&&!message.value)message.value='Interested in '+reference+'.\n';
  }
 });
 document.querySelectorAll('.desktop-nav .product-menu').forEach(menu=>{
  let closing;
  const cancel=()=>clearTimeout(closing);
  const schedule=()=>{cancel();closing=setTimeout(()=>{if(!menu.matches(':hover')&&!menu.contains(document.activeElement))menu.open=false},220)};
  menu.addEventListener('mouseenter',()=>{cancel();if(matchMedia('(hover:hover)').matches)menu.open=true});
  menu.addEventListener('mouseleave',schedule);
  menu.addEventListener('focusin',cancel);
  menu.addEventListener('focusout',schedule);
  document.addEventListener('click',event=>{if(!menu.contains(event.target)){cancel();menu.open=false}});
 });
 document.querySelectorAll('.site-header details,.language-menu').forEach(menu=>menu.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){event.stopPropagation();menu.open=false;menu.querySelector('summary').focus()}}));
 document.querySelectorAll('.language-menu').forEach(menu=>document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false}));
 const cards=[...document.querySelectorAll('.catalog .product-card')];
 let category=params.get('category')||'all';
 const search=document.querySelector('[data-product-search]');
 const filter=()=>{let count=0;cards.forEach(card=>{const match=(category==='all'||card.dataset.category===category)&&(!search||card.dataset.search.includes(search.value.trim().toLowerCase()));card.hidden=!match;if(match)count++});document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===category);b.setAttribute('aria-pressed',String(b.dataset.filter===category))});const result=document.querySelector('.result-count');if(result)result.textContent=`${count} ${count===1?'style':'styles'}`;const empty=document.querySelector('.no-results');if(empty)empty.hidden=count!==0;};
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;filter();const url=new URL(location.href);if(category==='all')url.searchParams.delete('category');else url.searchParams.set('category',category);history.replaceState({},'',url)}));
 search?.addEventListener('input',filter);if(cards.length)filter();
 document.querySelectorAll('.gallery-link').forEach(a=>a.addEventListener('click',e=>{const main=document.querySelector('.product-main-image img');if(!main)return;e.preventDefault();main.src=a.href;main.removeAttribute('srcset');main.removeAttribute('sizes');document.querySelectorAll('.gallery-link').forEach(t=>t.removeAttribute('aria-current'));a.setAttribute('aria-current','true')}));
 document.querySelectorAll('form[data-preview-form]').forEach(form=>{const product=form.querySelector('[name=product]');if(product&&params.get('product'))product.value=params.get('product');form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);const body=[...d.entries()].filter(([k])=>k!=='consent').map(([k,v])=>`${k}: ${v}`).join('\n');const url=`mailto:sales@wugan.net?subject=${encodeURIComponent('WUGAN '+(d.get('request_type')||'Product inquiry'))}&body=${encodeURIComponent(body)}`;const status=form.querySelector('.form-status');status.hidden=false;status.textContent='Your email draft is ready. Send it from your email app to complete your inquiry. This preview does not submit to the website.';location.href=url;});});
})();
