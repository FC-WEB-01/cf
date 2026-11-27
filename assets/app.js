'use strict';
// Coordonnées et URL réelles à renseigner avant ouverture. Aucun service fictif.
const CONTACT = Object.freeze({bookingUrl:'', email:'', phone:''});
const ADVICE_FEE = .01;
function project({initial,monthly,years,gross,baseFee,supportFee},advised=false){
  const growth=(1+gross)**(1/12), base=(1-baseFee)**(1/12), supports=(1-supportFee)**(1/12), advice=advised?(1-ADVICE_FEE)**(1/12):1;
  let capital=initial, adviceCost=0;
  for(let m=0;m<years*12;m++){
    const beforeAdvice=capital*growth*base*supports;
    adviceCost+=beforeAdvice*(1-advice);
    capital=beforeAdvice*advice+monthly;
  }
  return {capital,adviceCost,paid:initial+monthly*years*12};
}
if(typeof module!=='undefined' && module.exports) module.exports={project};
if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id);
  document.documentElement.classList.add('js');
  const menu=document.querySelector('.menu-toggle'), nav=$('navigation');
  if(menu&&nav){
    const setOpen=open=>{nav.dataset.open=String(open);menu.setAttribute('aria-expanded',String(open));};
    menu.addEventListener('click',()=>setOpen(menu.getAttribute('aria-expanded')!=='true'));
    nav.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setOpen(false);menu.focus();}});
  }
  const filter=$('product-filter'), cm=$('compare-mode');
  function compare(){
    if(!filter||!cm)return;
    document.querySelectorAll('[data-product]').forEach(block=>block.hidden=filter.value!=='all'&&filter.value!==block.dataset.product);
    const advised=cm.value==='advised';
    document.querySelectorAll('[data-advice]').forEach(el=>el.textContent=advised?'+1 % / an (envisagé)':'0 %');
    $('compare-status').textContent=({av:'Assurance-vie',per:'PER individuel',all:'Assurance-vie et PER'})[filter.value]+' · '+(advised?'avec conseil optionnel':'gestion libre');
  }
  if(filter&&cm){filter.addEventListener('change',compare);cm.addEventListener('change',compare);compare();}
  document.querySelectorAll('[data-select-product]').forEach(a=>a.addEventListener('click',()=>{if(filter){filter.value=a.dataset.selectProduct;compare();}}));
  const form=$('simulation'), money=new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  function simulate(){
    if(!form)return;
    const ids=['initial','monthly','years','return','base-fee','support-fee'];
    const inputs=ids.map($);
    if(inputs.some(el=>!el.validity.valid||!Number.isFinite(el.valueAsNumber))){
      $('sim-error').textContent='Corrigez les champs : saisissez un nombre dans les limites autorisées.';
      ['capital','paid','gain','advice-cost','delta','free-value','advised-value'].forEach(id=>$(id).textContent='—');
      ['free-bar','advised-bar'].forEach(id=>$(id).style.width='0%');return;
    }
    $('sim-error').textContent='';
    const [initial,monthly,years,r,b,s]=inputs.map(el=>el.valueAsNumber);
    const params={initial,monthly,years,gross:r/100,baseFee:b/100,supportFee:s/100};
    const free=project(params), advised=project(params,true), mode=form.elements.mode.value, result=mode==='advised'?advised:free;
    const values={capital:result.capital,paid:result.paid,gain:result.capital-result.paid,'advice-cost':advised.adviceCost,delta:free.capital-advised.capital,'free-value':free.capital,'advised-value':advised.capital};
    for(const [id,value] of Object.entries(values))$(id).textContent=money.format(value);
    $('mode-label').textContent=mode==='advised'?'Avec conseil en allocation · +1 % / an':'Gestion libre · 0 % de supplément conseil';
    const max=Math.max(free.capital,advised.capital,1);
    $('free-bar').style.width=`${100*free.capital/max}%`;$('advised-bar').style.width=`${100*advised.capital/max}%`;
  }
  if(form){form.addEventListener('submit',e=>{e.preventDefault();simulate();});form.addEventListener('input',simulate);simulate();}
  document.querySelectorAll('[data-select-mode]').forEach(a=>a.addEventListener('click',()=>{if(form){form.elements.mode.value=a.dataset.selectMode;simulate();}}));
  document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
  if($('contact-actions')){
    let configured=false;
    const activate=(id,href)=>{const a=$(id);a.href=href;a.hidden=false;configured=true;};
    try{if(CONTACT.bookingUrl&&new URL(CONTACT.bookingUrl).protocol==='https:')activate('booking-link',CONTACT.bookingUrl);}catch{}
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACT.email))activate('email-link','mailto:'+CONTACT.email);
    if(/^\+?[\d\s().-]{7,20}$/.test(CONTACT.phone))activate('phone-link','tel:'+CONTACT.phone.replace(/[^\d+]/g,''));
    if(configured){$('contact-actions').hidden=false;$('contact-pending').hidden=true;}
  }
}
