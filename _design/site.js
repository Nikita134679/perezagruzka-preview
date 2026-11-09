(() => {
 const menu = document.querySelector('.menu');
 if(menu){
  document.addEventListener('click', e => { if(menu.open && !menu.contains(e.target)) menu.open=false; });
  document.addEventListener('keydown', e => { if(menu.open && e.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();} });
 }
 document.querySelectorAll('.compare input').forEach(input=>{
  const render=()=>{input.parentElement.style.setProperty('--cut',input.value+'%'); input.setAttribute('aria-valuetext',input.value+' процентов');};
  input.addEventListener('input',render); render();
 });
 document.querySelectorAll('[data-filter-grid]').forEach(scope=>{
  const controls=[...scope.querySelectorAll('[data-choice]')], cases=[...scope.querySelectorAll('[data-category]')];
  const apply=(key,update)=>{
   controls.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.choice===key)));
   cases.forEach(c=>c.hidden=key!=='all'&&c.dataset.category!==key);
   scope.querySelector('[role=status]').textContent='Показано: '+cases.filter(c=>!c.hidden).length;
   if(update){const url=new URL(location.href);if(key==='all')url.searchParams.delete('category');else url.searchParams.set('category',key);history.replaceState(null,'',url);}
  };
  const asked=new URLSearchParams(location.search).get('category');
  apply(controls.some(c=>c.dataset.choice===asked)?asked:'all',false);
  controls.forEach(c=>c.addEventListener('click',()=>apply(c.dataset.choice,true)));
 });
 document.querySelectorAll('[data-price]').forEach(scope=>{
  const options=[...scope.querySelectorAll('select')], groups=[...scope.querySelectorAll('[data-machine]')];
  const apply=()=>{
   groups.forEach(g=>g.hidden=options.some(o=>o.value!=='all'&&g.dataset[o.name]!==o.value));
   scope.querySelector('[role=status]').textContent=groups.some(g=>!g.hidden)?'':'Для этой комбинации нет отдельного тарифа в прайсе.';
  };
  options.forEach(o=>o.addEventListener('change',apply));apply();
 });
 
 const folio=document.querySelector('#main');
 if(!folio) return;
 const panels=[...folio.querySelectorAll(':scope > .hero, :scope > .section')];
 const footer=document.querySelector('body > .footer');
 const surfaces=footer?[...panels,footer]:panels;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse=matchMedia('(pointer: coarse)');
 const header=document.querySelector('.top');
 const dock=folio.querySelector(':scope > .anchors');
 let frame=0, settle=0, measure=true, incoming=null, outgoing=null, lift=0;
 const smooth=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
 const clearIn=el=>{
  el.removeAttribute('data-paper-in');el.style.removeProperty('--paper-lift');el.style.removeProperty('--paper-shadow');
 };
 const clearOut=el=>{
  el.removeAttribute('data-paper-out');el.style.removeProperty('--paper-white');el.style.removeProperty('--paper-blur');
 };
 function render(){
  frame=0;
  const folioTop=folio.getBoundingClientRect().top;
  // Read static positions, even while one paper surface is translated.
  const tops=surfaces.map(el=>el.getBoundingClientRect().top-(el===incoming?lift:0));
  if(measure){
   folio.style.setProperty('--folio-length',folio.offsetHeight+'px');
   panels.forEach((el,i)=>el.style.setProperty('--folio-y',(folioTop-tops[i]).toFixed(2)+'px'));
   folio.setAttribute('data-folio-ready','');measure=false;
  }
  const headerEdge=Math.max(0,header?.getBoundingClientRect().bottom||0);
  const dockRect=dock?.getBoundingClientRect();
  const edge=dockRect && dockRect.top<=headerEdge+3 ? Math.max(dockRect.bottom,headerEdge):headerEdge;
  const span=Math.max(1,innerHeight-edge);
  const seam=edge+span*.64;
  let pair=-1,strength=0;
  if(!reduced.matches){
   for(let i=1;i<surfaces.length;i++){
    const t=tops[i];
    const p=smooth((innerHeight+24-t)/(span*.46))*smooth((t-edge-12)/(span*.44));
    if(p>strength){pair=i;strength=p;}
   }
  }
  const next=pair<0?null:surfaces[pair];
  const prior=pair<0?null:surfaces[pair-1];
  if(incoming && incoming!==next)clearIn(incoming);
  if(outgoing && outgoing!==prior)clearOut(outgoing);
  lift=0;
  if(next){
   const maxLift=coarse.matches?Math.min(40,Math.max(23,innerHeight*.049)):Math.min(58,Math.max(31,innerHeight*.061));
   lift=-maxLift*strength;
   next.style.setProperty('--paper-lift',lift.toFixed(2)+'px');
   next.style.setProperty('--paper-shadow',(.27*strength).toFixed(3));
   next.setAttribute('data-paper-in','');
   const reach=Math.min(90,span*.122);
   const soft=smooth(1-Math.abs(tops[pair]+lift-seam)/reach);
   if(soft>0){
    prior.style.setProperty('--paper-blur',((coarse.matches?.62:.9)*soft).toFixed(2)+'px');
    prior.style.setProperty('--paper-white',(.075*soft).toFixed(3));
    prior.setAttribute('data-paper-out','');
   }else if(prior.hasAttribute('data-paper-out'))clearOut(prior);
  }
  incoming=next;outgoing=prior;
 }
 function queue(){if(!frame)frame=requestAnimationFrame(render);}
 function resize(){measure=true;queue();}
 addEventListener('scroll',()=>{
  if(coarse.matches && !reduced.matches){
   document.documentElement.classList.add('paper-scrolling');
   clearTimeout(settle);settle=setTimeout(()=>document.documentElement.classList.remove('paper-scrolling'),210);
  }
  queue();
 },{passive:true});
 addEventListener('resize',resize);
 reduced.addEventListener('change',queue);
 coarse.addEventListener('change',queue);
 if('ResizeObserver' in window){const ro=new ResizeObserver(resize);ro.observe(folio);panels.forEach(p=>ro.observe(p));}
 resize();
})();
