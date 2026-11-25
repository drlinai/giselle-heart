'use strict';
// ===== Main: state machine, level loop, HUD, title =====
const G={ state:'title', frame:0, scene:null, rescued:[false,false,false], stage:0, level:null, player:null, cam:{x:0,y:0}, enemies:[], proj:[], pproj:[], pickups:[], boss:null, bossStarted:false, bossBanner:0, shake:0, cageBroken:false, cpIndex:0, titleT:0, ultFlash:0, deaths:0,
  ult(){ this.ultFlash=20; for(const e of this.enemies){ if(!e.dead && Math.abs(e.x-this.player.x)<W*0.7){ e.hurt(6); } } if(this.boss && !this.boss.dead) this.boss.hurt(6); for(const p of this.proj) Particles.burst(p.x,p.y,4,'#fff',1,10); this.proj.length=0; this.shake=12; Particles.hearts(this.player.x,this.player.y-20,16); }
};
function setState(s){ G.state=s; clearPressed(); }
function startIntro(){ setState('intro'); G.scene=Scenes.intro(()=>gotoMap()); }
function gotoMap(){ Particles.clear(); Dialog.top=false; G.boss=null; G.level=null; setState('map'); Fade.set(0); G.scene=Scenes.map(i=>{ G.stage=i; setState('card'); G.scene=Scenes.card(i,()=>startLevel(i)); }); }
function startLevel(i){ G.level=buildLevel(i); G.stage=i; G.cpIndex=0; G.bossStarted=false; G.boss=null; G.cageBroken=false; G.bossBanner=0; spawnAll(); G.player=new Player(G.level.checkpoints[0],(ROWS-3)*TILE); G.cam.x=0; G.levelT=0; setState('level'); Fade.set(1); Fade.to(0,0.03); AudioSys.play(THEMES[i].song); }
function spawnAll(){ G.enemies=G.level.spawns.map(s=>new Enemy(s,G.level.theme)); G.proj=[]; G.pproj=[]; G.pickups=G.level.pickups.map(p=>({x:p.x,y:p.y})); Particles.clear(); }
function respawn(){ const L=G.level; spawnAll(); const x=L.checkpoints[G.cpIndex]; G.player=new Player(x,L.surface?L.surface(Math.floor(x/TILE)):(ROWS-3)*TILE); G.player.y=(function(){ for(let y=0;y<ROWS;y++){ const v=L.get(Math.floor(x/TILE),y); if(v===1||v===2) return y*TILE; } return (ROWS-3)*TILE; })(); G.bossStarted=false; G.boss=null; G.bossBanner=0; AudioSys.play(THEMES[L.theme].song); Fade.set(1); Fade.to(0,0.04); }

// ---------------- LEVEL UPDATE ----------------
function updateLevel(){
  const L=G.level, pl=G.player; if(!pl) return;
  if(G.state==='rescue'){ G.scene.update(); pl.t++; if(G.boss) G.boss.update(pl); Particles.update(); return; }
  pl.locked = G.bossBanner>0; G.levelT++;
  pl.update(L);
  // hazards (spikes) + pit
  if(!pl.dead){ const r=pl.rect(); const tx0=Math.floor((r.x+2)/TILE), tx1=Math.floor((r.x+r.w-3)/TILE), ty0=Math.floor((r.y+4)/TILE), ty1=Math.floor((r.y+r.h-1)/TILE); outer: for(let tx=tx0;tx<=tx1;tx++) for(let ty=ty0;ty<=ty1;ty++) if(L.get(tx,ty)===3){ pl.hurt(2,pl.x+(pl.face)); break outer; }
    if(pl.y>H+30){ pl.hp=0; pl.die(); } }
  // boss trigger / arena clamp
  if(!G.bossStarted && pl.x>L.bossX+60){ G.bossStarted=true; G.boss=new BOSS_CLASSES[L.theme](L); G.bossBanner=110; AudioSys.play('boss'); AudioSys.sfx('alarm'); }
  if(G.bossStarted){ pl.x=clamp(pl.x,L.bossX+pl.w/2+2,L.bossX+W-pl.w/2-2); if(G.bossBanner>0) G.bossBanner--; }
  // checkpoints
  L.checkpoints.forEach((cx,i)=>{ if(i>G.cpIndex && pl.x>cx-6){ G.cpIndex=i; AudioSys.sfx('pickup'); Particles.hearts(cx+6,pl.y-20,6); } });
  // enemies
  updatePlayerShots(L,pl);
  for(const e of G.enemies){ if(e.dead) continue; if(Math.abs(e.x-pl.x)>W*0.8) continue; e.update(L,pl);
    if(!e.dead && !pl.dead && overlap(e.rect(),pl.rect())) pl.hurt(1,e.x); }
  G.enemies=G.enemies.filter(e=>!e.dead);
  // boss
  if(G.boss){ const b=G.boss; b.update(pl);
    if(!b.dead){ if(!pl.dead && b.alpha>0.5 && b.state!=='intro' && overlap(b.rect(),pl.rect())) pl.hurt(1,b.x); }
    else if(b.state==='dying' && b.st>=115 && G.state==='level'){ setState('rescue'); G.proj.length=0; G.pproj.length=0; Dialog.top=true; G.scene=Scenes.rescue(L.theme,pl,L,()=>{ G.rescued[L.theme]=true; if(G.rescued.every(Boolean)){ Dialog.top=false; setState('finale'); G.scene=Scenes.finale(()=>{ setState('birthday'); G.scene=Scenes.birthday(()=>{ G.rescued=[false,false,false]; setState('title'); Fade.set(1); Fade.to(0,0.02); AudioSys.play('title'); }); }); } else gotoMap(); }); } }
  updateProjectiles(L,pl); updatePickups(L,pl); Particles.update();
  // death → respawn
  if(pl.dead && pl.deathT===60){ Fade.to(1,0.04,()=>{ G.deaths++; respawn(); }); }
  // camera
  if(G.bossStarted) G.cam.x=L.bossX; else { const tx=clamp(pl.x-W/2+pl.face*24,0,L.w*TILE-W); G.cam.x=lerp(G.cam.x,tx,0.12); }
  if(G.shake>0) G.shake--; if(G.ultFlash>0) G.ultFlash--;
}
// ---------------- LEVEL DRAW ----------------
function drawLevel(){
  const L=G.level, pl=G.player, th=THEMES[L.theme];
  BG.draw(L.theme,G.cam.x,0);
  ctx.save(); const sx=G.shake>0?rand(-3,3):0, sy=G.shake>0?rand(-2,2):0; ctx.translate(Math.round(-G.cam.x+sx),Math.round(sy));
  drawDecos(L,G.cam.x); drawTiles(L,G.cam.x);
  L.checkpoints.forEach((cx,i)=>{ if(i===0) return; let y=(ROWS-3)*TILE; for(let r=0;r<ROWS;r++){ const v=L.get(Math.floor(cx/TILE),r); if(v===1||v===2){ y=r*TILE; break; } } drawCheckpoint(cx,y,i<=G.cpIndex,G.frame); });
  for(const p of G.pickups) drawHeartPickup(p.x,p.y,G.frame+p.x);
  // captive + cage
  if(G.state==='rescue') G.scene.drawNPC(G.frame); else { drawChar(th.captive,L.cageX,(ROWS-3)*TILE,{t:G.frame,face:-1}); drawCage(L.cageX,(ROWS-3)*TILE,G.frame,false); }
  for(const e of G.enemies) if(Math.abs(e.x-G.cam.x-W/2)<W) e.draw();
  if(G.boss) G.boss.draw();
  pl.draw();
  for(const p of G.proj) drawProjectile(p,G.frame); for(const p of G.pproj) drawHeartShot(p);
  Particles.draw();
  ctx.restore();
  if(G.ultFlash>0) RA(0,0,W,H,'#ffd1e1',G.ultFlash/40);
  drawHUD();
  if(G.bossBanner>0){ const a=G.bossBanner>90?(110-G.bossBanner)/20:G.bossBanner<20?G.bossBanner/20:1; ctx.globalAlpha=a; RA(0,100,W,50,'#000',0.6); R(0,100,W,1,'#ff1744'); R(0,149,W,1,'#ff1744'); text('WARNING',W/2,106,{size:9,align:'center',color:'#ff1744',font:FONT_EN,bold:true}); text(th.boss,W/2,120,{size:14,align:'center',color:'#fff',bold:true}); text(th.bossEn,W/2,138,{size:8,align:'center',color:'#ffd27f',font:FONT_EN}); ctx.globalAlpha=1; }
  if(G.state==='rescue') Dialog.draw();
}
function drawHUD(){ const pl=G.player; if(!pl) return; const th=THEMES[G.level.theme];
  RA(6,6,110,30,'#000',0.45); text('GISELLE',10,8,{size:7,color:'#ff9ec4',font:FONT_EN,bold:true});
  for(let i=0;i<pl.maxHp;i++) heartShape(16+i*12,22,4,i<pl.hp?'#ff4d79':'#3a2a35');
  R(10,32,100,3,'#222'); R(10,32,pl.energy,3,pl.energy>=100?(((G.frame>>3)&1)?'#fff':'#ff6b9d'):'#b388ff'); if(pl.energy>=100) text('D 心之波 READY!',52,20,{size:6,color:'#fff'});
  text('STAGE '+(G.stage+1)+'  '+th.name,W-8,8,{size:7,align:'right',color:'#ddd'});
  if(G.boss && !G.boss.dead && G.boss.state!=='intro'){ const b=G.boss; const bw=240,bx=(W-bw)/2,by=H-16; RA(bx-2,by-12,bw+4,16,'#000',0.5); text(th.boss,W/2,by-11,{size:7,align:'center',color:'#ffd27f'}); R(bx,by,bw,5,'#3a0a0a'); R(bx,by,bw*b.hp/b.maxHp,5,b.phase===2?'#ff6b35':'#e53935'); R(bx,by,bw*b.hp/b.maxHp,1,'#ff9e80'); }
  if(G.levelT<720 && G.stage===0 && !G.bossStarted){ ctx.globalAlpha=clamp((720-G.levelT)/60,0,1); RA(W/2-150,H-40,300,22,'#000',0.6); text('← → 移動   空白 跳躍(二段)   A 心形飛彈   S 瞬移   D 心之波   ↓+空白 下平台',W/2,H-34,{size:7,align:'center',color:'#fff'}); ctx.globalAlpha=1; }
}
// ---------------- TITLE ----------------
srand(99); const TSTARS=[]; for(let i=0;i<90;i++) TSTARS.push([rnd()*W,rnd()*H,rnd()]);
function drawTitle(){ const t=G.titleT++; const gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#07071f'); gr.addColorStop(1,'#2a0f3d'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
  for(const s of TSTARS) R(s[0],s[1],1,1,((t/15+s[2]*10)|0)%4?'#fff':'#445');
  if(t%12===0) Particles.add({x:rand(0,W),y:H+4,vy:rand(-0.6,-0.2),vx:rand(-0.2,0.2),life:160,type:'heart',size:rand(1.5,4),color:['#ff6b9d','#ff9ec4','#b388ff'][t%3]}); Particles.update(); Particles.draw();
  // emblem
  const ex=W/2, ey=118; ctx.globalAlpha=0.18+Math.sin(t/30)*0.06; heartShape(ex,ey-40,70,'#ff6b9d'); ctx.globalAlpha=1;
  // big Giselle
  ctx.save(); ctx.translate(ex+150,232); ctx.scale(3,3); drawChar('giselle',0,0,{t,face:-1}); ctx.restore();
  ctx.save(); ctx.translate(ex-150,232); ctx.scale(2,2); drawChar('william',-24,0,{t,face:1,alpha:0.5}); drawChar('liam',-6,0,{t,face:1,alpha:0.5}); drawChar('rex',10,0,{t,face:1,alpha:0.5}); ctx.restore();
  text("GISELLE'S HEART",ex,56,{size:30,align:'center',color:'#ffe6f2',font:FONT_EN,bold:true,shadow:'#7a1f5a'}); text('— Eternal Reunion —',ex,96,{size:12,align:'center',color:'#ff9ec4',font:FONT_EN}); text('吉賽兒之心：永恆重逢',ex,116,{size:12,align:'center',color:'#fff',bold:true});
  if((t>>4)&1) text('PRESS SPACE',ex,170,{size:11,align:'center',color:'#fff',font:FONT_EN});
  text('方向鍵 移動　空白鍵 跳躍　A 攻擊　S 瞬移　D 心之波',ex,236,{size:8,align:'center',color:'#bbb'}); text('A gift for Giselle  ♥  2026.11.25',ex,254,{size:7,align:'center',color:'#777',font:FONT_EN});
}
// ---------------- LOOP ----------------
let last=0, acc=0; const STEP=1000/60;
function loop(ts){ requestAnimationFrame(loop); if(!last) last=ts; let dt=ts-last; last=ts; if(dt>100) dt=100; acc+=dt; let n=0; while(acc>=STEP && n<4){ update(); acc-=STEP; n++; clearPressed(); } draw(); }
function update(){ G.frame++;
  switch(G.state){
    case 'title': if(CONFIRM()){ AudioSys.sfx('select'); setState('fadeintro'); Fade.to(1,0.03,()=>startIntro()); } break;
    case 'fadeintro': break;
    case 'intro': case 'map': case 'card': case 'finale': case 'birthday': if(G.scene){ G.scene.update(); if(G.state==='intro'||G.state==='map'||G.state==='finale'||G.state==='birthday') Particles.update(); } break;
    case 'level': case 'rescue': updateLevel(); break;
  }
  Fade.update(); if(G.state==='title' && !AudioSys.ready) {} 
}
function draw(){ beginFrame(); ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  switch(G.state){
    case 'title': case 'fadeintro': drawTitle(); break;
    case 'intro': case 'map': case 'card': case 'finale': case 'birthday': if(G.scene){ G.scene.draw(); if(G.state!=='card') Particles.draw(); if(Dialog.active && G.state!=='card') {} } break;
    case 'level': case 'rescue': drawLevel(); break;
  }
  Fade.draw();
  if(!AudioSys.ready && G.state==='title') text('♪ 按任意鍵開啟音效',W-8,H-12,{size:7,align:'right',color:'#888'});
}
window.addEventListener('keydown',e=>{ if(G.state==='title' && !AudioSys.ready){ setTimeout(()=>AudioSys.play('title'),50); } },{once:false});
AudioSys.init && null;
requestAnimationFrame(loop);
