(() => {
 const header=document.querySelector('.internal-header');
 if(!header) return;
 const menu=header.querySelector('.menu-toggle');
 const groups=[...header.querySelectorAll('.nav-group')];
 const booking=document.querySelector('#booking-dialog');
 function closeGroups(except){groups.forEach(group=>{if(group!==except)group.open=false;});}
 function setMenu(open){
  header.classList.toggle('menu-open',open);
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  menu.querySelector('use').setAttribute('href',open?'#i-close':'#i-menu');
  if(!open)closeGroups();
 }
 groups.forEach(group=>group.querySelector('summary').addEventListener('click',()=>{if(!group.open)closeGroups(group);}));
 menu.addEventListener('click',()=>setMenu(!header.classList.contains('menu-open')));
 header.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('click',event=>{
  if(!header.contains(event.target)&&header.classList.contains('menu-open'))setMenu(false);
  const open=event.target.closest('[data-book]');
  if(open&&booking?.showModal){
   event.preventDefault();setMenu(false);if(!booking.open)booking.showModal();
  }
  if(event.target.closest('[data-close]'))booking?.close();
  if(event.target===booking){
   const box=booking.getBoundingClientRect();
   if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)booking.close();
  }
 });
 addEventListener('keydown',e=>{
  if(e.key!=='Escape'||booking?.open)return;
  const active=groups.find(group=>group.open);
  if(active){active.open=false;active.querySelector('summary').focus();}
  else if(header.classList.contains('menu-open')){setMenu(false);menu.focus();}
 });
 const light=()=>header.classList.toggle('light',scrollY>20);
 addEventListener('scroll',light,{passive:true});light();
})();
