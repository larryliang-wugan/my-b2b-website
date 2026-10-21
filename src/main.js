import './style.css';
import { makeInquiry } from './inquiry.js';

const products = [
  { id: '01', name: 'Boxer briefs', tag: 'Men’s underwear', shape: 'one', text: 'Explore a starting point for boxer brief development. Actual styles, fabrics and specifications await confirmation.' },
  { id: '02', name: 'Trunks & briefs', tag: 'Men’s underwear', shape: 'two', text: 'Discuss fit, cut and material requirements for trunks and briefs. The confirmed collection will be added here.' },
  { id: '03', name: 'Private label development', tag: 'OEM / ODM enquiries', shape: 'three', text: 'Tell us about your brand, logo and packaging needs. Available services and order requirements await confirmation.' },
];

document.querySelector('#app').innerHTML = `
  <a class="skip" href="#main">Skip to content</a>
  <div class="draft">WEBSITE STARTER · Company information and product details await confirmation</div>
  <header class="header wrap">
    <a class="brand" href="#" aria-label="Your Brand home"><span class="mark">Y<span>↗</span></span> YOUR BRAND<span class="brand-dot">®</span></a>
    <button class="menu" aria-label="Toggle navigation" aria-expanded="false" aria-controls="navigation">Menu <span>☰</span></button>
    <nav id="navigation" aria-label="Main navigation"><a href="#products">Products</a><a href="#about">About us</a><a href="#process">How we work</a><a href="#contact" class="nav-cta">Let’s talk <span>↗</span></a></nav>
  </header>
  <main id="main">
    <section class="hero wrap">
      <div class="hero-copy"><p class="eyebrow"><span></span> MEN’S UNDERWEAR · B2B SOURCING</p><h1>Your brand.<br>Your fit.<br><em>New possibilities.</em></h1><p class="lead">A starting point for your next men’s underwear collection. Explore product directions and share your private label requirements.</p><a class="button" href="#products">Explore our products <span>↗</span></a><div class="hero-note"><span>01 /</span> YOUR NEXT BUSINESS CONNECTION STARTS HERE</div></div>
      <div class="hero-art" role="img" aria-label="Abstract geometric product illustration, not an actual company product"><div class="art-grid"></div><div class="orb"></div><div class="block block-a"></div><div class="block block-b"></div><div class="art-caption"><span>FORM. FUNCTION. POSSIBILITY.</span><span>ILLUSTRATIVE CONCEPT ↗</span></div><span class="art-label">A NEW<br>PERSPECTIVE.</span></div>
    </section>
    <div class="principles"><div class="wrap"><span>MEN’S UNDERWEAR</span><span>✳</span><span>PRIVATE LABEL ENQUIRIES</span><span>✳</span><span>OEM / ODM DISCUSSIONS</span><span>✳</span></div></div>
    <section id="products" class="section wrap"><div class="section-head"><div><p class="eyebrow">01 — OUR OFFERING</p><h2>Explore the possibilities.</h2></div><p>Start with a category.<br>Let’s work out the details together.</p></div><div class="products">${products.map(p => `<article class="product"><div class="product-art ${p.shape}"><span class="product-number">${p.id}</span><div class="object"></div><span class="sample">ILLUSTRATIVE PLACEHOLDER</span></div><div class="product-body"><p class="eyebrow">${p.tag}</p><h3>${p.name}</h3><p>${p.text}</p><a href="#contact" data-product="${p.name}">Discuss this category <span>↗</span></a></div></article>`).join('')}</div><p class="small">These are example categories. Actual products, specifications and availability will be added after confirmation.</p></section>
    <section id="about" class="about"><div class="wrap about-grid"><div><p class="eyebrow">02 — GET TO KNOW US</p><h2>Behind every product,<br>there’s a conversation.</h2></div><div><p class="about-lead">Your business has its own requirements. This website gives us a starting point to understand them.</p><p>This space will introduce the company, its team and its real capabilities. Verified company history, facilities, certifications and service details will be added here when supplied.</p><a class="text-link" href="#contact">Tell us about your project ↗</a></div></div></section>
    <section id="process" class="section wrap"><div class="section-head"><div><p class="eyebrow">03 — A CLEAR WAY FORWARD</p><h2>From an idea to a conversation.</h2></div></div><div class="steps"><article><span>01</span><h3>Share your requirements</h3><p>Describe the product, intended use, quantity and destination market.</p></article><article><span>02</span><h3>Discuss the details</h3><p>Confirm specifications, customization and the commercial terms with the team.</p></article><article><span>03</span><h3>Agree on next steps</h3><p>Review the proposal and confirm the details before placing an order.</p></article></div></section>
    <section id="contact" class="contact"><div class="wrap contact-grid"><div><p class="eyebrow">04 — LET’S CONNECT</p><h2>What are you<br><em>looking for?</em></h2><p>Tell us a little about your project.<br>Good partnerships start with the right details.</p><div class="contact-note">DEMO INQUIRY FORM<br><span>This starter generates a downloadable inquiry. It does not send messages. Company contact details and a delivery service still need to be configured.</span></div></div><form id="inquiry"><div class="form-row"><label>Your name<input name="name" autocomplete="name" required maxlength="120" placeholder="Full name"></label><label>Work email<input name="email" autocomplete="email" type="email" required maxlength="254" placeholder="you@company.com"></label></div><label>Company<input name="company" autocomplete="organization" required maxlength="180" placeholder="Company name"></label><label>What do you need?<textarea name="message" rows="5" required maxlength="5000" placeholder="Product, quantity, specifications, destination…"></textarea></label><p class="privacy">Your entries stay in this browser until you download the inquiry file. Nothing is sent to a server.</p><button class="button" type="submit">Download inquiry <span>↗</span></button><p id="form-status" role="status" aria-live="polite"></p></form></div></section>
  </main>
  <footer class="wrap"><a class="brand" href="#">YOUR BRAND<span class="brand-dot">®</span></a><p>Company name and legal details to be confirmed.</p><a href="#main">Back to top ↑</a></footer>
`;

const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }
});
document.querySelectorAll('[data-product]').forEach(link => link.addEventListener('click', () => {
  const field = document.querySelector('textarea');
  if (!field.value.trim()) field.value = `I'm interested in: ${link.dataset.product}.\n`;
}));
document.querySelector('#inquiry').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.querySelector('#form-status');
  try {
    const content = makeInquiry(Object.fromEntries(new FormData(event.currentTarget)));
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-inquiry.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Inquiry file generated. It has not been sent. Share it with your supplier when ready.';
  } catch (error) { status.textContent = error.message; }
});
