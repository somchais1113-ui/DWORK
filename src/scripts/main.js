(() => {
  'use strict';
  let site=window.PROCLEANING_SITE;
  const i18n=window.PROCLEANING_I18N;
  if(!i18n){console.error('Missing i18n module');return;}
  let language=i18n.initial(site),activeSite=null;
  const config=window.PROCLEANING_CONFIG,ui=window.PROCLEANING_UI;
  const byId=id=>document.getElementById(id);
  let serviceOffset=0,testimonialIndex=0,billing='monthly';
  if(!site||!config||!ui){console.error('Missing data/site-data.js or scripts');return;}
  function fallbackImages(scope=document){scope.querySelectorAll('img[data-fallback]').forEach(img=>{
    if(img.dataset.fallbackBound)return;
    img.dataset.fallbackBound='yes';
    img.addEventListener('error',()=>{if(!img.src.endsWith('placeholder.svg'))img.src=img.dataset.fallback;});
  });}
  function renderServices(){
    const list=activeSite.services||[],grid=byId('servicesGrid');if(!list.length){grid.textContent=activeSite.labels?.emptyServices||'No services configured.';byId('serviceNext').disabled=true;return;}
    byId('serviceNext').disabled=list.length<2;
    const offset=serviceOffset%list.length;
    grid.innerHTML=list.slice(offset).concat(list.slice(0,offset)).map((s,i)=>ui.serviceCard(s,i)).join('');
    fallbackImages(grid);
  }
  function renderPricing(){
    const list=activeSite.pricing||[];
    byId('pricingGrid').innerHTML=list.length?list.map(p=>ui.priceCard(p,billing,config.demoYearlyDiscount)).join(''):`<p>${ui.escape(activeSite.labels?.emptyPricing||'No packages configured.')}</p>`;
    byId('pricingNote').hidden=billing!=='yearly';
    document.querySelectorAll('[data-billing]').forEach(b=>{const active=b.dataset.billing===billing;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
  }
  function renderTestimonial(){
    const list=activeSite.testimonials||[];const card=byId('testimonialCard');if(!list.length){card.textContent=activeSite.labels?.emptyTestimonials||'No testimonials configured.';return;}
    testimonialIndex=((testimonialIndex%list.length)+list.length)%list.length;
    card.innerHTML=ui.testimonial(list[testimonialIndex]);fallbackImages(card);
  }
  function draw(){
    document.documentElement.lang=language;
    activeSite=i18n.resolve(site,language);
    window.PROCLEANING_SITE=activeSite;
    window.PROCLEANING_APPLY_SITE(activeSite,window.PROCLEANING_IMAGE_OVERRIDES||{});
    renderServices();
    byId('teamGrid').innerHTML=(activeSite.team||[]).map((p,i)=>ui.teamCard(p,i)).join('');
    byId('featureGrid').innerHTML=(activeSite.features||[]).map(x=>`<div class="feature-pill">${ui.escape(x)}</div>`).join('');
    renderPricing();renderTestimonial();
    byId('blogGrid').innerHTML=(activeSite.blogs||[]).map(x=>ui.blogCard(x)).join('');
    const photos=activeSite.photos||{};
    const images={quoteMainImage:photos.quoteMain,quoteSmallImage:photos.quoteSmall,aboutMainImage:photos.aboutMain,aboutSmallImage:photos.aboutSmall};
    Object.entries(images).forEach(([id,url])=>{const el=byId(id);if(el)el.src=url||'./assets/images/placeholder.svg';});
    const cn=activeSite.contact||{},labels=activeSite.labels||{};
    byId('contactMethods').innerHTML=[ui.contactMethod('☎',labels.contactCall||'Call Us',cn.phone||''),ui.contactMethod('✉',labels.contactEmail||'Email Now',cn.email||''),ui.contactMethod('●',labels.contactAddress||'Address',cn.address||'')].join('');
    byId('year').textContent=new Date().getFullYear();
    fallbackImages();
  }
  function useOverrides(original,overrides){
    const copy=JSON.parse(JSON.stringify(original));
    function walk(value){if(typeof value==='string')return overrides[value.replace(/^\.\//,'')]||value;
      if(Array.isArray(value))return value.map(walk);
      if(value&&typeof value==='object')for(const k of Object.keys(value))value[k]=walk(value[k]);
      return value;
    }
    return walk(copy);
  }
  function setLanguage(next,persist=true){
    if(!i18n.supported.includes(next))return;
    language=next;
    if(persist)i18n.persist(next);
    const selected=document.activeElement;
    const selectElement=byId('quoteForm')?.elements?.service;
    const selectIndex=selectElement?.selectedIndex??0;
    draw();
    if(selectIndex>0){const el=byId('quoteForm').elements.service;if(el.options.length>selectIndex)el.selectedIndex=selectIndex;}
    if(selected?.matches?.('[data-language]'))selected.focus();
  }
  draw();
  document.querySelectorAll('[data-language]').forEach(btn=>btn.addEventListener('click',()=>setLanguage(btn.dataset.language)));
  byId('serviceNext').addEventListener('click',()=>{serviceOffset++;renderServices();});
  byId('testimonialPrev').addEventListener('click',()=>{testimonialIndex--;renderTestimonial();});
  byId('testimonialNext').addEventListener('click',()=>{testimonialIndex++;renderTestimonial();});
  document.querySelectorAll('[data-billing]').forEach(btn=>btn.addEventListener('click',()=>{billing=btn.dataset.billing;renderPricing();}));
  const menu=byId('mainNav'),menuToggle=byId('menuToggle');
  menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?(activeSite.labels?.closeNav||'Close navigation'):(activeSite.labels?.openNav||'Open navigation'));});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');}});
  const form=byId('quoteForm'),feedback=byId('formFeedback');
  form.addEventListener('submit',event=>{
    event.preventDefault();const data=new FormData(form),fields=['name','email','service','message'];
    const labels=activeSite.labels||{};
    if(fields.some(field=>!String(data.get(field)||'').trim())||!form.elements.email.validity.valid){feedback.className='form-feedback is-error';feedback.textContent=labels.formError||'Please complete all fields.';form.reportValidity();return;}
    const body=`${language==='th'?'ชื่อ':'Name'}: ${data.get('name')}\n${language==='th'?'อีเมล':'Email'}: ${data.get('email')}\n${language==='th'?'บริการ':'Service'}: ${data.get('service')}\n${language==='th'?'รายละเอียด':'Message'}:\n${data.get('message')}`;
    const target=`mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent(config.bookingSubject)}&body=${encodeURIComponent(body)}`;
    feedback.className='form-feedback is-success';feedback.textContent=labels.formSuccess||'Your email app will open.';window.location.href=target;
  });
  if(new URLSearchParams(window.location.search).get('editorPreview')==='1'){
    window.addEventListener('message',event=>{
      if(event.source!==window.parent)return;
      if(event.data?.kind==='PROCLEANING_PREVIEW_PING'){window.parent.postMessage({kind:'PROCLEANING_PREVIEW_READY'},'*');return;}
      if(event.data?.kind!=='PROCLEANING_PREVIEW')return;
      if(!event.data.site || typeof event.data.site!=='object')return;
      window.PROCLEANING_IMAGE_OVERRIDES=event.data.images||{};
      site=useOverrides(event.data.site,window.PROCLEANING_IMAGE_OVERRIDES);
      if(i18n.supported.includes(event.data.lang))language=event.data.lang;
      serviceOffset=0;testimonialIndex=0;draw();
    });
    window.parent.postMessage({kind:'PROCLEANING_PREVIEW_READY'},'*');
  }
})();
