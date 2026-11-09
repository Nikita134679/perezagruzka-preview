(() => {
 const dialog=document.querySelector('#catalog-video-dialog');
 if(!dialog || !dialog.showModal) return;
 const screen=dialog.querySelector('.catalog-player-screen');
 const title=dialog.querySelector('#catalog-video-title');
 const note=dialog.querySelector('.catalog-player-note');
 let opener;
 const clear=()=>{
  const player=screen.querySelector('video');
  if(player){player.pause();player.removeAttribute('src');player.load();}
  screen.replaceChildren();
 };
 document.querySelectorAll('[data-catalog-video]').forEach(button=>{
  button.addEventListener('click',()=>{
   clear();note.hidden=true;opener=button;
   const {catalogVideo,videoKind,videoTitle,videoPoster}=button.dataset;
   title.textContent=videoTitle;
   if(videoKind==='file'){
    const v=document.createElement('video');
    v.controls=true;v.playsInline=true;v.poster=videoPoster;v.src=catalogVideo;
    v.addEventListener('error',()=>{if(v.isConnected)note.hidden=false;});
    screen.append(v);dialog.showModal();v.play().catch(()=>{});
   }else{
    const frame=document.createElement('iframe');
    frame.title='Видео: '+videoTitle;
    frame.allow='autoplay; fullscreen; picture-in-picture';
    frame.allowFullscreen=true;frame.src=catalogVideo;
    screen.append(frame);dialog.showModal();
   }
  });
 });
 dialog.querySelector('.catalog-player-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{clear();opener?.focus({preventScroll:true});});
})();
