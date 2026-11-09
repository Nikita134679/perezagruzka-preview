(() => {
 const root=document.querySelector('[data-pricing]');
 if(!root) return;
 const {service,machine,q}=Object.fromEntries([...root.querySelectorAll('select,input')].map(el=>[el.name,el]));
 const params=new URLSearchParams(location.search);
 const matchesValue=(el,v)=>[...el.options].some(o=>o.value===v);
 for(const el of [service,machine]) if(matchesValue(el,params.get(el.name)))el.value=params.get(el.name);
 q.value=params.get('q')||'';
 const groups=[...root.querySelectorAll('.rate-group')].map(el=>({el,rows:[...el.querySelectorAll('.price-row')]}));
 const status=root.querySelector('[role=status]');
 const reset=root.querySelector('.price-reset');
 const norm=t=>t.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/\s+/g,' ').trim();
 function render(sync=false){
  const terms=norm(q.value).split(' ').filter(Boolean);
  const filtered=terms.length>0||service.value!=='all'||machine.value!=='all';
  let total=0, first=true;
  groups.forEach(({el,rows})=>{
   const eligible=(service.value==='all'||service.value===el.dataset.service)&&(machine.value==='all'||machine.value===el.dataset.machine);
   let n=0;
   rows.forEach(row=>{
    const hay=norm(row.textContent);const visible=eligible&&terms.every(t=>hay.includes(t));
    row.hidden=!visible;if(visible)n++;
   });
   el.hidden=n===0;total+=n;
   el.querySelector('.rate-count').textContent=n+' поз.';
   if(n && filtered)el.open=terms.length>0||first;
   if(n)first=false;
  });
  status.textContent=total?'Найдено позиций: '+total:'Ничего не найдено. Измените фильтры или запрос.';
  reset.hidden=!filtered;
  if(sync){
   const url=new URL(location.href);
   for(const el of [service,machine,q]){
    if(el.value&&(el===q||el.value!=='all'))url.searchParams.set(el.name,el.value);else url.searchParams.delete(el.name);
   }
   history.replaceState(null,'',url);
  }
 }
 for(const el of [service,machine])el.addEventListener('change',()=>render(true));
 q.addEventListener('input',()=>render(true));
 reset.addEventListener('click',()=>{
  service.value=machine.value='all';q.value='';
  groups.forEach(({el},i)=>el.open=i===0);render(true);q.focus();
 });
 render();
})();
