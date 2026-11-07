'use strict';
const header = document.querySelector('.top');
const hero = document.querySelector('.hero');
const sheet = document.querySelector('.sheet');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;
function paint() {
  frame = 0;
  const distance = Math.max(0, -hero.getBoundingClientRect().top);
  const progress = reduced.matches ? 0 : Math.min(1, distance / (innerHeight * .54));
  hero.style.setProperty('--p', progress.toFixed(3));
  header.classList.toggle('light', sheet.getBoundingClientRect().top <= header.offsetHeight + 36);
}
function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }
addEventListener('scroll', requestPaint, {passive:true});
addEventListener('resize', requestPaint);
reduced.addEventListener('change', requestPaint);
paint();
const portrait = document.querySelector('#portrait');
const portraitLayer = portrait.querySelector('.clear');
const resetLens = () => portrait.style.setProperty('--lens-opacity','0');
const moveLens = e => {
  const box = portrait.getBoundingClientRect();
  const x = e.clientX - box.left, y = e.clientY - box.top;
  if (e.pointerType === 'touch' || x < box.width * .45 || y < 0 || y > box.height ||
      !portraitLayer.complete || !portraitLayer.naturalWidth) {resetLens();return;}
  portrait.style.setProperty('--lens-x',x+'px');
  portrait.style.setProperty('--lens-y',y+'px');
  portrait.style.setProperty('--radius',Math.min(155,box.width*.13)+'px');
  portrait.style.setProperty('--lens-opacity','1');
};
hero.addEventListener('pointermove',moveLens,{passive:true});
hero.addEventListener('pointerleave',resetLens);
const menu = document.querySelector('.menu-toggle');
const groups = [...header.querySelectorAll('.nav-group')];
function closeGroups(except) {
  groups.forEach(group=>{if(group!==except)group.open=false;});
}
function setMenu(open) {
  header.classList.toggle('menu-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menu.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  if(!open)closeGroups();
}
groups.forEach(group=>group.querySelector('summary').addEventListener('click',()=>{if(!group.open)closeGroups(group);}));
menu.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click',e=>{if(!header.contains(e.target))setMenu(false);});
addEventListener('keydown', e => {
  if(e.key!=='Escape')return;
  const active=groups.find(group=>group.open);
  if(active){active.open=false;active.querySelector('summary').focus();}
  else if(header.classList.contains('menu-open')){setMenu(false);menu.focus();}
});
const booking = document.querySelector('#booking-dialog');
const photo = document.querySelector('#photo-dialog');
document.addEventListener('click', event => {
  const open = event.target.closest('[data-book]');
  if (open && typeof booking.showModal === 'function') {
    event.preventDefault();
    if (!booking.open) booking.showModal();
  }
  const close = event.target.closest('[data-close]');
  if (close) close.closest('dialog').close();
  if (event.target instanceof HTMLDialogElement) {
    const r = event.target.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close();
  }
});
const workCases = JSON.parse(document.querySelector('#work-cases').textContent);
const works = document.querySelector('.works-carousel');
const workPair = works.querySelector('.works-pair');
const workCanvas = works.querySelector('.works-canvas');
const workRange = works.querySelector('#work-compare');
function setWorkSplit() {
  workCanvas.style.setProperty('--split', workRange.value+'%');
  workRange.setAttribute('aria-valuetext','Первый кадр: '+workRange.value+'%; второй кадр: '+(100-Number(workRange.value))+'%');
}
workRange.addEventListener('input',setWorkSplit);
let workDrag=null;
function splitAt(e) {
  const rect=workCanvas.getBoundingClientRect();
  workRange.value=Math.round(Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100)));
  setWorkSplit();
}
workRange.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||e.button!==0)return;
  e.preventDefault();
  workRange.focus({preventScroll:true});
  workDrag=e.pointerId;
  workRange.setPointerCapture(e.pointerId);
  splitAt(e);
});
workRange.addEventListener('pointermove',e=>{if(workDrag===e.pointerId)splitAt(e);});
for(const event of ['pointerup','pointercancel','lostpointercapture']){
  workRange.addEventListener(event,e=>{if(workDrag===e.pointerId)workDrag=null;});
}

const workTitle = works.querySelector('#case-name');
const workCount = works.querySelector('#work-count');
const workThumbs = works.querySelector('.works-thumbs');
const workFilters = [...works.querySelectorAll('[data-work-filter]')];
let workList = workCases, workIndex = 0, workAnimation;
const twoDigits = n => String(n).padStart(2,'0');
function workCrop(item, frame, thumb = false) {
  const [x,y,w,h] = item.frames[frame], [iw,ih] = item.size;
  const crop = document.createElement('span');
  crop.className = 'works-crop';
  for (const [key,val] of Object.entries({ratio:w/h,'img-w':iw/w*100+'%','img-h':ih/h*100+'%','img-x':-x/w*100+'%','img-y':-y/h*100+'%'})) crop.style.setProperty('--'+key,val);
  const image = new Image();
  image.alt = thumb ? '' : item.title + ', пример ' + item.number + ', кадр ' + (frame+1);
  image.decoding = 'async';
  if (thumb) image.loading = 'lazy';
  image.src = item.src;
  crop.append(image);
  return crop;
}
function renderWork(index, animate = true) {
  workIndex = (index + workList.length) % workList.length;
  const item = workList[workIndex];
  workCanvas.style.setProperty('--case-ratio',item.ratio);
  workRange.value='50';
  setWorkSplit();
  workPair.querySelectorAll('.works-frame').forEach((el,i)=>el.replaceChildren(workCrop(item,i)));
  workTitle.textContent = item.title;
  workCount.textContent = twoDigits(workIndex+1)+' / '+twoDigits(workList.length);
  workCount.setAttribute('aria-label',item.title+', работа '+(workIndex+1)+' из '+workList.length);
  [...workThumbs.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===workIndex)));
  const thumb = workThumbs.children[workIndex];
  if (thumb && animate) {
    const {offsetLeft:x,offsetTop:y,offsetWidth:w,offsetHeight:h}=thumb;
    const {scrollLeft:l,scrollTop:t,clientWidth:cw,clientHeight:ch}=workThumbs;
    const left=x<l?x-3:x+w>l+cw?x+w-cw+3:l;
    const top=y<t?y-3:y+h>t+ch?y+h-ch+3:t;
    if(left!==l||top!==t)workThumbs.scrollTo({left,top,behavior:reduced.matches?'instant':'smooth'});
  }
  workAnimation?.cancel();
  if (animate && !reduced.matches) workAnimation = workPair.animate([{opacity:.64},{opacity:1}],{duration:200,easing:'ease-out'});
}
function filterWorks(group) {
  workFilters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.workFilter===group)));
  workList = group==='all' ? workCases : workCases.filter(x=>String(x.category)===group);
  workThumbs.replaceChildren(...workList.map((item,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='works-thumb'; b.dataset.work=String(i);
    b.setAttribute('aria-label',item.title+', пример '+item.number);
    b.append(workCrop(item,0,true));
    b.addEventListener('click',()=>renderWork(i));
    return b;
  }));
  workThumbs.scrollLeft=0;
  workThumbs.scrollTop=0;
  renderWork(0,false);
}
workFilters.forEach(b=>b.addEventListener('click',()=>filterWorks(b.dataset.workFilter)));
works.querySelector('#work-prev').addEventListener('click',()=>renderWork(workIndex-1));
works.querySelector('#work-next').addEventListener('click',()=>renderWork(workIndex+1));
works.addEventListener('keydown',e=>{
  if(e.target===workRange||e.target.closest('.works-filters')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  renderWork(e.key==='Home'?0:e.key==='End'?workList.length-1:workIndex+(e.key==='ArrowLeft'?-1:1));
  if(e.target.closest('[data-work]'))workThumbs.children[workIndex].focus({preventScroll:true});
});
let workTouch;
workPair.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'&&!workCanvas.contains(e.target))workTouch={x:e.clientX,y:e.clientY,id:e.pointerId};
});
workPair.addEventListener('pointercancel',()=>{workTouch=null;});
workPair.addEventListener('pointerup',e=>{
  if(workTouch?.id!==e.pointerId)return;
  const dx=e.clientX-workTouch.x,dy=e.clientY-workTouch.y;
  workTouch=null;
  if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.4)renderWork(workIndex+(dx<0?1:-1));
});
filterWorks('all');

const devices=JSON.parse(document.querySelector('#devices').textContent);
const deviceButtons=[...document.querySelectorAll('[data-device]')];
deviceButtons.forEach((button,i)=>button.addEventListener('click',()=>{
  const d=devices[i];
  deviceButtons.forEach((item,j)=>item.setAttribute('aria-pressed',String(i===j)));
  const image=document.querySelector('#device-img');
  image.src=d.image;image.alt=d.name;
  image.animate([{opacity:.35,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:reduced.matches?0:240});
  document.querySelector('#device-type').textContent=d.kind;
  document.querySelector('#device-name').textContent=d.name;
  document.querySelector('#device-full').textContent=d.full;
  document.querySelector('#device-link').href=d.path;
}));
const serviceExplorer = document.querySelector('.service-explorer');
const serviceTablist = serviceExplorer.querySelector('[role="tablist"]');
const serviceTabs = [...serviceTablist.querySelectorAll('[role="tab"]')];
const servicePanels = serviceTabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
const serviceMobile = matchMedia('(max-width:640px)');
let serviceActive = 0;
let serviceAnimations = [];
reduced.addEventListener('change', () => {if(reduced.matches) {serviceAnimations.forEach(a=>a.cancel());serviceAnimations=[];}});
function syncServiceOrientation(){
  serviceTablist.setAttribute('aria-orientation',serviceMobile.matches?'horizontal':'vertical');
}
syncServiceOrientation();
serviceMobile.addEventListener('change',syncServiceOrientation);
function chooseService(index,focus=false){
  if(index<0 || index>=serviceTabs.length) return;
  if(focus)serviceTabs[index].focus({preventScroll:true});
  if(index===serviceActive)return;
  serviceAnimations.forEach(a=>a.cancel());
  serviceAnimations=[];
  serviceActive=index;
  serviceTabs.forEach((tab,i)=>{
    tab.setAttribute('aria-selected',String(i===index));
    tab.tabIndex=i===index?0:-1;
    servicePanels[i].hidden=i!==index;
  });
  serviceExplorer.style.setProperty('--service-progress',String((index+1)/serviceTabs.length));
  if(reduced.matches)return;
  const ease='cubic-bezier(.21,.7,.29,1)';
  const panel=servicePanels[index];
  serviceAnimations=[
    panel.querySelector('img').animate([{opacity:.38,transform:'scale(1.07)'},{opacity:1,transform:'scale(1)'}],{duration:490,easing:ease}),
    panel.querySelector('.service-feature-content').animate([{opacity:.35,transform:'translateY(11px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:ease}),
  ];
}
serviceTabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>chooseService(i));
  tab.addEventListener('keydown',e=>{
    let target;
    if(e.key==='Home') target=0;
    if(e.key==='End') target=serviceTabs.length-1;
    if(e.key===(serviceMobile.matches?'ArrowLeft':'ArrowUp'))target=(i+serviceTabs.length-1)%serviceTabs.length;
    if(e.key===(serviceMobile.matches?'ArrowRight':'ArrowDown'))target=(i+1)%serviceTabs.length;
    if(target!==undefined){e.preventDefault();chooseService(target,true);}
  });
});
let swipeStart;
servicePanels.forEach(panel=>{
  const photo=panel.querySelector('.service-feature-photo');
  photo.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')swipeStart={x:e.clientX,y:e.clientY,id:e.pointerId};},{passive:true});
  photo.addEventListener('pointercancel',()=>{swipeStart=null;});
  photo.addEventListener('pointerup',e=>{
    if(!swipeStart||swipeStart.id!==e.pointerId)return;
    const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)chooseService(serviceActive+(dx<0?1:-1));
  },{passive:true});
});
if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      reveal.unobserve(entry.target);
      if(reduced.matches)continue;
      entry.target.animate([{opacity:.42,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,easing:'ease-out'});

    }
  },{threshold:.18});
  document.querySelectorAll('[data-service-enter]').forEach(el=>reveal.observe(el));
}

const paymentBadge = document.querySelector('.pay-badge');
const paymentSummary = paymentBadge.querySelector('summary');
document.addEventListener('click',e=>{if(paymentBadge.open&&!paymentBadge.contains(e.target))paymentBadge.open=false;});
paymentBadge.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&paymentBadge.open){e.stopPropagation();paymentBadge.open=false;paymentSummary.focus();}
});
if('IntersectionObserver' in window){
  const enterRatio=.55, exitRatio=.1;
  let armed=true, impression;
  const stopStamp=()=>{impression?.cancel();impression=undefined;};
  const stampObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.intersectionRatio<=exitRatio){
        armed=true;
        stopStamp();
        continue;
      }
      if(!armed || entry.intersectionRatio<enterRatio)continue;
      armed=false;
      if(reduced.matches)continue;
      stopStamp();
      impression=paymentSummary.animate([
        {transform:'translateY(-25px) scale(1.55) rotate(-15deg)',opacity:0,filter:'blur(3px)',offset:0},
        {transform:'translateY(-18px) scale(1.37) rotate(-13deg)',opacity:.4,filter:'blur(2px)',offset:.21},
        {transform:'translateY(0) scale(1.06,.93) rotate(-8deg)',opacity:1,filter:'blur(0)',offset:.57},
        {transform:'translateY(-2px) scale(.98,1.02) rotate(-6deg)',opacity:1,filter:'blur(0)',offset:.76},
        {transform:'rotate(-7deg)',opacity:1,filter:'blur(0)',offset:1}
      ],{duration:520,easing:'ease-out'});
    }
  },{threshold:[exitRatio,enterRatio],rootMargin:'-110px 0px 0px'});
  // Observe the stable layout box so the animated transform cannot retrigger the stamp.
  stampObserver.observe(paymentBadge);
  reduced.addEventListener('change',()=>{if(reduced.matches)stopStamp();});
}
