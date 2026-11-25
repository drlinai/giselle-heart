'use strict';
// ===== Player, enemies, bosses, projectiles =====
const sfx=n=>AudioSys.sfx(n);
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const SOLID=v=>v===1;

class Player{
  constructor(x,y){ this.x=x; this.y=y; this.vx=0; this.vy=0; this.w=10; this.h=24; this.face=1; this.onGround=false; this.jumps=0; this.maxHp=8; this.hp=8; this.energy=0; this.inv=0; this.attackT=0; this.attackHit=new Set(); this.dashT=0; this.dashCd=0; this.walk=0; this.t=0; this.dead=false; this.after=[]; this.ultT=0; this.hurtT=0; this.locked=false; this.dropping=0; this.deathT=0; }
  rect(){ return {x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h}; }
  slashRect(){ return {x:this.face>0?this.x+1:this.x-25,y:this.y-30,w:24,h:30}; }
  update(level){
    this.t++; if(this.inv>0) this.inv--; if(this.dashCd>0) this.dashCd--; if(this.hurtT>0) this.hurtT--; if(this.ultT>0) this.ultT--; if(this.dropping>0) this.dropping--; if(this.attackT>0) this.attackT--;
    if(this.dead){ this.deathT++; this.vy+=0.2; this.y+=this.vy; return; }
    const g=THEMES[level.theme].gravity;
    if(this.dashT>0){ this.dashT--; this.vx=this.face*5; this.vy=0; if(this.dashT%2===0) this.after.push({x:this.x,y:this.y,face:this.face,life:12}); }
    else {
      let ax=0; if(!this.locked && this.hurtT===0){ if(key('ArrowLeft')) ax=-1; if(key('ArrowRight')) ax=1; }
      const sp=1.7; if(ax){ this.vx=lerp(this.vx,ax*sp,0.3); this.face=ax; this.walk+=0.22; } else { this.vx=lerp(this.vx,0,0.35); if(Math.abs(this.vx)<0.05) this.vx=0; }
      if(!this.locked && pressed('Space')){
        if(this.onGround && key('ArrowDown') && this.onPlatform){ this.dropping=8; this.y+=1; this.onGround=false; }
        else if(this.onGround){ this.vy=-4.8; this.jumps=1; this.onGround=false; sfx('jump'); }
        else if(this.jumps<2){ this.vy=-4.5; this.jumps=2; sfx('djump'); Particles.burst(this.x,this.y,8,'#a9dcff',1.3,16); Particles.add({x:this.x,y:this.y,type:'heart',color:'#ff9ec4',size:3,vy:-0.5,life:20}); }
      }
      if(!key('Space') && this.vy<-1.6) this.vy=-1.6;
      this.vy+=g; if(this.vy>6) this.vy=6;
      if(!this.locked && pressed('KeyS') && this.dashCd===0){ this.dashT=10; this.dashCd=42; this.inv=Math.max(this.inv,14); sfx('dash'); }
      if(!this.locked && pressed('KeyA') && this.attackT===0){ this.attackT=14; sfx('attack'); G.pproj.push({x:this.x+this.face*6,y:this.y-14,vx:this.face*4.6,life:42,t:0}); Particles.burst(this.x+this.face*8,this.y-14,4,'#ff9ec4',1,10); }
      if(!this.locked && pressed('KeyD') && this.energy>=100){ this.energy=0; this.ultT=45; sfx('ult'); G.ult(); }
    }
    this.moveX(level); this.moveY(level);
    for(const a of this.after) a.life--; this.after=this.after.filter(a=>a.life>0);
  }
  moveX(level){ this.x+=this.vx; const r=this.rect(); const ty0=Math.floor(r.y/TILE), ty1=Math.floor((r.y+r.h-1)/TILE);
    if(this.vx>0){ const tx=Math.floor((r.x+r.w)/TILE); for(let ty=ty0;ty<=ty1;ty++) if(SOLID(level.get(tx,ty))){ this.x=tx*TILE-this.w/2-0.01; this.vx=0; this.dashT=0; break; } }
    else if(this.vx<0){ const tx=Math.floor(r.x/TILE); for(let ty=ty0;ty<=ty1;ty++) if(SOLID(level.get(tx,ty))){ this.x=(tx+1)*TILE+this.w/2+0.01; this.vx=0; this.dashT=0; break; } }
    if(this.x<this.w/2) this.x=this.w/2; if(this.x>level.w*TILE-this.w/2) this.x=level.w*TILE-this.w/2; }
  moveY(level){ const prev=this.y; this.y+=this.vy; const r=this.rect(); const tx0=Math.floor(r.x/TILE), tx1=Math.floor((r.x+r.w-1)/TILE); this.onGround=false; this.onPlatform=false;
    if(this.vy>=0){ const ty=Math.floor(this.y/TILE); for(let tx=tx0;tx<=tx1;tx++){ const v=level.get(tx,ty); if(SOLID(v) || (v===2 && prev<=ty*TILE+0.01 && this.dropping===0)){ this.y=ty*TILE; this.vy=0; this.onGround=true; this.onPlatform=(v===2); this.jumps=0; break; } } }
    else { const ty=Math.floor((this.y-this.h)/TILE); for(let tx=tx0;tx<=tx1;tx++) if(SOLID(level.get(tx,ty))){ this.y=(ty+1)*TILE+this.h; this.vy=0; break; } } }
  hurt(d,fromX){ if(this.dead||this.inv>0||this.dashT>0) return false; this.hp-=d; this.inv=75; this.hurtT=16; this.vx=(this.x<fromX?-2.6:2.6); this.vy=-2.6; this.attackT=0; sfx('hurt'); Particles.burst(this.x,this.y-12,8,'#ff6b9d',1.5,20); if(this.hp<=0){ this.hp=0; this.die(); } return true; }
  die(){ if(this.dead) return; this.dead=true; this.deathT=0; this.vy=-4; this.vx=0; sfx('die'); Particles.burst(this.x,this.y-12,20,['#fff','#a9dcff','#ff9ec4'],2.5,40); }
  draw(){
    for(const a of this.after){ drawChar('giselle',a.x,a.y,{face:a.face,t:this.t,alpha:a.life/24,jump:true}); }
    if(this.inv>0 && !this.dead && (this.inv>>2)&1) return;
    const o={face:this.face,t:this.t,flash:this.hurtT>10};
    if(this.dead){ o.lie=true; o.sleep=true; }
    else if(this.attackT>0){ o.attack=1-this.attackT/14; if(!this.onGround) o.jump=true; }
    else if(this.dashT>0){ o.jump=true; }
    else if(!this.onGround){ o.jump=true; }
    else if(Math.abs(this.vx)>0.2){ o.walk=this.walk; }
    drawChar('giselle',this.x,this.y,o);
    if(this.ultT>0){ const p=1-this.ultT/45; ctx.globalAlpha=1-p; ctx.strokeStyle='#ff6b9d'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(this.x,this.y-12,p*260,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(this.x,this.y-12,p*200,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; heartShape(this.x,this.y-50-p*30,6+p*10,'#ff6b9d'); }
  }
}

class Enemy{
  constructor(s,theme){ this.kind=s.kind; this.theme=theme; this.x=s.x; this.y=s.y; this.y0=s.y; this.face=-1; this.t=Math.floor(Math.random()*100); this.flash=0; this.dead=false; this.cd=60+Math.random()*60;
    this.hp={walker:3,flyer:2,shooter:4}[this.kind]; this.w=14; this.h={walker:14,flyer:16,shooter:18}[this.kind]; }
  rect(){ return {x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h}; }
  update(level,pl){ this.t++; if(this.flash>0) this.flash--;
    if(this.kind==='walker'){ const sp=0.55; this.x+=this.face*sp; const ahead=Math.floor((this.x+this.face*9)/TILE), row=Math.floor(this.y/TILE); const g=level.get(ahead,row), up=level.get(ahead,row-1); if(SOLID(up) || !(g===1||g===2)){ this.face*=-1; this.x+=this.face*2; } }
    else if(this.kind==='flyer'){ const d=pl.x-this.x; const near=Math.abs(d)<130 && !pl.dead; if(near){ this.x+=Math.sign(d)*0.55; this.y0+=clamp((pl.y-18)-this.y0,-0.35,0.35); this.face=d<0?-1:1; } else { this.x+=Math.sin(this.t/50)*0.6; } this.y=this.y0+Math.sin(this.t/14)*7; }
    else { this.face=pl.x<this.x?-1:1; if(Math.abs(pl.x-this.x)<210 && Math.abs(pl.y-this.y)<90 && !pl.dead){ this.cd--; if(this.cd<=0){ this.cd=105; this.shoot(pl); } } }
  }
  shoot(pl){ sfx('shoot'); const k=['spark','water','bolt'][this.theme]; const sx=this.x+this.face*8, sy=this.y-12;
    if(k==='water'){ G.proj.push({kind:'water',x:sx,y:sy,vx:clamp((pl.x-sx)/45,-2.6,2.6),vy:-3.4,g:0.13,r:3,life:130}); }
    else { const a=Math.atan2((pl.y-12)-sy,pl.x-sx); const sp=k==='bolt'?2.3:1.9; G.proj.push({kind:k,x:sx,y:sy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:0,r:3,life:160}); } }
  hurt(d){ this.hp-=d; this.flash=6; sfx('hit'); Particles.burst(this.x,this.y-8,6,'#fff',1.6,14); if(this.hp<=0){ this.dead=true; sfx('enemyDie'); Particles.burst(this.x,this.y-8,16,['#ff6b9d','#fff','#a9dcff'],2.2,32,0.06); if(Math.random()<0.28) G.pickups.push({x:this.x,y:this.y-8,vy:-2}); } }
  draw(){ drawEnemy(this.kind,this.theme,this.x,this.y,this.t,this.face,this.flash>0); }
}

// ---------------- BOSSES ----------------
class Boss{
  constructor(level){ this.level=level; this.theme=level.theme; this.ax=level.bossX; this.x=this.ax+W-110; this.gy=(ROWS-3)*TILE; this.y=this.gy; this.face=-1; this.t=0; this.flash=0; this.state='intro'; this.st=0; this.dead=false; this.hp=this.maxHp; this.vx=0; this.vy=0; this.phase=1; this.alpha=1; this.shake=0; }
  rect(){ return {x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h}; }
  hurt(d){ if(this.dead||this.state==='intro'||this.alpha<0.5) return false; this.hp-=d; this.flash=5; sfx('bossHit'); Particles.burst(this.x,this.y-this.h/2,8,'#fff',2,20); if(this.hp<=this.maxHp*0.5 && this.phase===1){ this.phase=2; this.onPhase2&&this.onPhase2(); } if(this.hp<=0){ this.hp=0; this.dead=true; this.state='dying'; this.st=0; this.alpha=1; sfx('bossDie'); G.shake=30; } return true; }
  setState(s){ this.state=s; this.st=0; }
  faceP(pl){ this.face=pl.x<this.x?-1:1; }
  update(pl){ this.t++; this.st++; if(this.flash>0) this.flash--;
    if(this.state==='dying'){ if(this.st%5===0) Particles.burst(this.x+rand(-this.w/2,this.w/2),this.y-rand(0,this.h),12,['#fff','#ffd27f','#ff6b9d'],2.5,28); this.alpha=Math.max(0,1-this.st/110); return; }
    if(this.state==='intro'){ if(this.st>80) this.setState('idle'); return; }
    this.think(pl); this.x=clamp(this.x,this.ax+this.w/2+4,this.ax+W-this.w/2-4); }
  wave(dir,sp){ G.proj.push({kind:'wave',x:this.x+dir*(this.w/2),y:this.gy,vx:dir*(sp||2.4),vy:0,g:0,r:5,life:200,ground:true}); }
  dmgTint(){ return this.flash>0; }
}
// --- Boss 1: Guardian 101 ---
class Guardian101 extends Boss{
  constructor(l){ super(l); this.w=34; this.h=92; this.crouch=0; this.eye=0; this.laserY=0; }
  get maxHp(){ return 42; }
  think(pl){ const S=this.state, st=this.st, p2=this.phase===2;
    if(S==='idle'){ this.faceP(pl); if(st>(p2?30:50)){ const dx=Math.abs(pl.x-this.x); if(dx>110 && Math.random()<0.6) this.setState('walk'); else { const r=Math.random(); if(p2 && r<0.35) this.setState('laser'); else if(r<0.6) this.setState('stomp'); else this.setState('fire'); } } }
    else if(S==='walk'){ this.faceP(pl); this.x+=this.face*(p2?1.1:0.8); this.crouch=Math.abs(Math.sin(st/8))*3; if(st>70){ this.crouch=0; this.setState('idle'); } }
    else if(S==='stomp'){ if(st<28) this.crouch=st/28*8; else if(st===28){ this.crouch=0; sfx('stomp'); G.shake=14; this.wave(-1,p2?3:2.4); this.wave(1,p2?3:2.4); Particles.burst(this.x,this.gy,16,'#bca',3,25,0.1); } else if(st>65) this.setState('idle'); }
    else if(S==='fire'){ if(st===10||st===24||st===38||(p2&&st===52)){ sfx('shoot'); const n=p2?2:1; for(let i=0;i<n;i++){ const tx=pl.x+rand(-30,30); const vy=-5.5; const T=2*5.5/0.14; G.proj.push({kind:'spark',x:this.x,y:this.y-this.h,vx:(tx-this.x)/T,vy,g:0.14,r:4,life:220}); } } if(st>80) this.setState('idle'); }
    else if(S==='laser'){ if(st===1){ this.laserY=pl.y-12; } this.eye=Math.min(1,st/40); if(st===40){ sfx('alarm'); const x0=this.face>0?this.x+10:this.ax; const len=this.face>0?this.ax+W-this.x-10:this.x-10-this.ax; G.proj.push({kind:'laser',x:x0+len/2,x0,len,y:this.laserY,vx:0,vy:0,g:0,r:0,life:22,w:len,h:3}); } if(st>75){ this.eye=0; this.setState('idle'); } }
  }
  draw(){ ctx.save(); ctx.globalAlpha=this.alpha; const x=this.x, y=this.y, C=c=>this.dmgTint()?'#fff':c; const cr=this.crouch||0;
    // legs
    const step=this.state==='walk'?Math.sin(this.st/8)*3:0; R(x-12+step,y-14,8,14,C('#263858')); R(x+4-step,y-14,8,14,C('#263858')); R(x-14+step,y-3,11,3,C('#1a2740')); R(x+3-step,y-3,11,3,C('#1a2740'));
    const by=y-14+cr; // body base
    R(x-9,by-70,18,70,C('#3a3f4d'));
    for(let i=0;i<6;i++){ const ty=by-12-i*11; R(x-15,ty,30,9,C('#5d6b80')); R(x-16,ty+7,32,2,C('#8fa3b8')); R(x-15,ty,30,1,C('#2b303a')); for(let j=0;j<5;j++) R(x-12+j*6,ty+2,2,4,C((((this.t>>3)+i+j)%4===0)?'#ffd27f':'#ff5252')); }
    R(x-7,by-80,14,12,C('#5d6b80')); R(x-4,by-92,8,12,C('#8fa3b8')); R(x-1,by-100,2,10,C('#cfd8dc')); R(x-1,by-102,2,2,C('#ff1744'));
    // arms
    R(x-21,by-62,6,30,C('#263858')); R(x+15,by-62,6,30,C('#263858')); R(x-23,by-34,10,8,C('#1a2740')); R(x+13,by-34,10,8,C('#1a2740'));
    // eyes
    const ec=this.eye>0?'#ff1744':'#ff5252'; R(x-5,by-76,3,3,C(ec)); R(x+2,by-76,3,3,C(ec)); if(this.eye>0){ ctx.globalAlpha=this.eye*0.7; R(x-6,by-77,5,5,'#ff8a80'); R(x+1,by-77,5,5,'#ff8a80'); ctx.globalAlpha=this.alpha; const x0=this.face>0?x+10:this.ax, len=this.face>0?this.ax+W-x-10:x-10-this.ax; ctx.globalAlpha=0.35*this.eye; R(x0,this.laserY,len,1,'#ff1744'); ctx.globalAlpha=this.alpha; }
    ctx.restore(); }
}
// --- Boss 2: Petrified Merlion ---
class Merlion extends Boss{
  constructor(l){ super(l); this.w=50; this.h=46; this.tgt=0; }
  get maxHp(){ return 52; }
  think(pl){ const S=this.state, st=this.st, p2=this.phase===2;
    if(S==='idle'){ this.faceP(pl); if(st>(p2?28:45)){ const r=Math.random(); if(r<0.35) this.setState('charge'); else if(r<0.7) this.setState('spit'); else this.setState('leap'); } }
    else if(S==='charge'){ if(st<30){ this.x+=((st>>1)&1)?1:-1; if(st===1) this.faceP(pl); } else { this.x+=this.face*(p2?4.4:3.6); if(st%4===0) Particles.burst(this.x-this.face*20,this.gy,3,'#cfd8dc',1,12); const lim=this.face>0?this.ax+W-this.w/2-6:this.ax+this.w/2+6; if((this.face>0&&this.x>=lim)||(this.face<0&&this.x<=lim)){ G.shake=8; sfx('stomp'); this.setState(this.charges?'idle':'idle'); } } }
    else if(S==='spit'){ this.faceP(pl); const n=p2?5:3; if(st===20){ sfx('shoot'); for(let i=0;i<n;i++){ const vx=this.face*(1.2+i*0.7); G.proj.push({kind:'water',x:this.x+this.face*22,y:this.y-30,vx,vy:-4.2+i*0.3,g:0.14,r:4,life:150}); } } if(st>60) this.setState('idle'); }
    else if(S==='leap'){ if(st===1){ this.vy=-7.2; this.tgt=pl.x; this.faceP(pl); } this.vy+=0.26; this.y+=this.vy; this.x+=clamp(this.tgt-this.x,-3,3); if(this.y>=this.gy){ this.y=this.gy; this.vy=0; sfx('stomp'); G.shake=14; this.wave(-1,2.6); this.wave(1,2.6); if(p2){ for(let i=-2;i<=2;i++) G.proj.push({kind:'water',x:this.x,y:this.y-20,vx:i*1.3,vy:-4.5,g:0.14,r:3,life:120}); } this.setState('idle'); } }
  }
  draw(){ ctx.save(); ctx.globalAlpha=this.alpha; ctx.translate(Math.round(this.x),Math.round(this.y)); ctx.scale(this.face,1); const C=c=>this.dmgTint()?'#fff':c; const wig=this.state==='charge'&&this.st<30?((this.st>>1)&1?1:-1):0;
    // fish body + tail
    R(-26,-28,34,22,C('#cfd8dc')); R(-22,-32,26,4,C('#eceff1')); R(-28,-18,4,8,C('#b0bec5')); R(-34,-36+wig,8,8,C('#cfd8dc')); R(-38,-40+wig,6,6,C('#b0bec5')); R(-36,-26-wig,6,8,C('#cfd8dc')); for(let i=0;i<4;i++) R(-20+i*7,-22,3,3,C('#b0bec5')); R(-28,-6,36,4,C('#90a4ae'));
    // head
    R(2,-46,24,26,C('#eceff1')); R(8,-50,20,8,C('#eceff1')); R(0,-50,10,10,C('#b0bec5')); R(-2,-42,6,14,C('#b0bec5')); R(22,-56,6,8,C('#cfd8dc')); R(10,-54,6,6,C('#cfd8dc'));
    R(18,-40,4,4,C(this.state==='charge'?'#ff1744':'#37474f')); R(24,-30,6,6,C('#90a4ae')); R(10,-26,16,3,C('#78909c')); if(this.state==='spit'&&this.st<20) R(26,-30,4,4,C('#4fc3f7'));
    // cracks
    R(6,-36,1,8,C('#78909c')); R(-10,-26,8,1,C('#78909c'));
    ctx.restore(); }
}
// --- Boss 3: Shadow Sovereign ---
class ShadowKing extends Boss{
  constructor(l){ super(l); this.w=26; this.h=50; this.hover=0; this.x=this.ax+W/2; }
  get maxHp(){ return 58; }
  think(pl){ const S=this.state, st=this.st, p2=this.phase===2; this.hover=Math.sin(this.t/20)*5; if(S!=='crush') this.y=this.gy-36+this.hover;
    if(S==='idle'){ this.faceP(pl); if(st>(p2?26:40)){ const r=Math.random(); if(r<0.3) this.setState('tele'); else if(r<0.6) this.setState('orbs'); else if(p2&&r<0.8) this.setState('rain'); else this.setState('crush'); } }
    else if(S==='tele'){ this.alpha=st<15?1-st/15:st<25?0:Math.min(1,(st-25)/12); if(st===25){ sfx('teleport'); const side=pl.x<this.ax+W/2?1:-1; this.x=clamp(pl.x+side*rand(70,130),this.ax+30,this.ax+W-30); Particles.burst(this.x,this.y-25,20,['#7e57c2','#b388ff','#fff'],2,25); } if(st>40){ this.alpha=1; this.setState(Math.random()<0.6?'orbs':'idle'); } }
    else if(S==='orbs'){ this.faceP(pl); if(st===24){ sfx('shoot'); const n=p2?6:4; const base=Math.atan2((pl.y-12)-(this.y-25),pl.x-this.x); for(let i=0;i<n;i++){ const a=base+(i-(n-1)/2)*0.28; G.proj.push({kind:'orb',x:this.x,y:this.y-25,vx:Math.cos(a)*1.7,vy:Math.sin(a)*1.7,g:0,r:4,life:200}); } } if(st>60) this.setState('idle'); }
    else if(S==='rain'){ if(st%8===0 && st<64){ sfx('shoot'); G.proj.push({kind:'orb',x:this.ax+rand(20,W-20),y:-10,vx:0,vy:1.6,g:0.02,r:4,life:260}); } if(st>90) this.setState('idle'); }
    else if(S==='crush'){ if(st<30){ this.x+=clamp(pl.x-this.x,-3.5,3.5); this.y=this.gy-70; if(st===1) sfx('alarm'); } else if(this.y<this.gy){ this.y=Math.min(this.gy,this.y+7); if(this.y===this.gy){ sfx('stomp'); G.shake=16; this.wave(-1,2.8); this.wave(1,2.8); Particles.burst(this.x,this.gy,16,'#7e57c2',3,25,0.1); } } else if(st>80) this.setState('idle'); }
  }
  draw(){ ctx.save(); ctx.globalAlpha=this.alpha; ctx.translate(Math.round(this.x),Math.round(this.y)); ctx.scale(this.face,1); const C=c=>this.dmgTint()?'#fff':c; const t=this.t;
    // shadow tendrils
    for(let i=0;i<5;i++){ const ox=-14+i*7, l=8+Math.sin(t/7+i)*5; RA(ox,-6,3,l,'#4a148c',0.7); }
    // cloak
    R(-13,-44,26,40,C('#1a0a2e')); R(-15,-30,30,26,C('#1a0a2e')); R(-12,-42,24,2,C('#4a148c')); R(-3,-40,6,30,C('#6a1b9a'));
    // head + crown
    R(-7,-56,14,13,C('#120620')); R(-9,-62,18,6,C('#ffd54f')); for(let i=0;i<4;i++) R(-9+i*5,-66,3,4,C('#ffd54f')); R(-1,-64,2,2,C('#ff1744'));
    // eyes
    const g=((t>>3)&1)?'#e040fb':'#d500f9'; R(-4,-52,3,2,C(g)); R(2,-52,3,2,C(g)); RA(-6,-53,12,4,'#e040fb',0.25);
    // hands
    R(14,-34,5,5,C('#b39ddb')); R(-19,-34,5,5,C('#b39ddb')); if(this.state==='orbs'&&this.st<24){ circ(20,-32,3+this.st/6,'#8e24aa'); }
    ctx.restore(); }
}
const BOSS_CLASSES=[Guardian101,Merlion,ShadowKing];

// ---------------- projectiles / pickups ----------------
function updateProjectiles(level,pl){
  const P=G.proj;
  for(let i=P.length-1;i>=0;i--){ const p=P[i]; p.life--; let kill=p.life<=0;
    if(p.kind==='laser'){ /* static */ }
    else { p.x+=p.vx; p.y+=p.vy; p.vy+=p.g;
      if(p.ground){ const below=level.get(Math.floor(p.x/TILE),Math.floor((p.y+1)/TILE)); const ahead=level.get(Math.floor((p.x+Math.sign(p.vx)*6)/TILE),Math.floor((p.y-4)/TILE)); if(!SOLID(below)||SOLID(ahead)) kill=true; if(p.life%3===0) Particles.add({x:p.x,y:p.y-2,vy:-0.8,vx:rand(-0.5,0.5),life:12,color:'#ffd27f',size:2}); }
      else { const v=level.get(Math.floor(p.x/TILE),Math.floor(p.y/TILE)); if(SOLID(v)) kill=true; }
      if(p.y>H+40||p.x<G.cam.x-60||p.x>G.cam.x+W+60) kill=true; }
    if(kill){ if(p.kind!=='laser') Particles.burst(p.x,p.y,5,'#fff',1,10); P.splice(i,1); continue; }
    // hit player
    if(!pl.dead){ const r=pl.rect(); let hit=false;
      if(p.kind==='laser'){ hit=r.y<p.y+3&&r.y+r.h>p.y-1&&r.x<p.x0+p.len&&r.x+r.w>p.x0; }
      else { const cx=clamp(p.x,r.x,r.x+r.w), cy=clamp(p.y,r.y,r.y+r.h); hit=(p.x-cx)**2+(p.y-cy)**2<=(p.r+1)**2; }
      if(hit && pl.hurt(1,p.x)){ if(p.kind!=='laser'){ Particles.burst(p.x,p.y,6,'#fff',1.5,12); P.splice(i,1); } } }
  }
}
function updatePickups(level,pl){ const L=G.pickups; for(let i=L.length-1;i>=0;i--){ const p=L[i]; p.t=(p.t||0)+1; if(p.vy!=null){ p.vy+=0.2; p.y+=p.vy; const v=level.get(Math.floor(p.x/TILE),Math.floor(p.y/TILE)); if(v===1||v===2){ p.y=Math.floor(p.y/TILE)*TILE; p.vy=null; } if(p.y>H+40){ L.splice(i,1); continue; } }
    if(!pl.dead && overlap({x:p.x-5,y:p.y-12,w:10,h:12},pl.rect())){ pl.hp=Math.min(pl.maxHp,pl.hp+2); sfx('pickup'); Particles.hearts(pl.x,pl.y-16,5); L.splice(i,1); } } }

function drawHeartShot(p){ const s=3+Math.sin(p.t/2)*0.5; heartShape(p.x,p.y-2,s,'#ff4d79'); heartShape(p.x,p.y-2,1.5,'#fff'); }
function updatePlayerShots(level,pl){ const P=G.pproj; for(let i=P.length-1;i>=0;i--){ const p=P[i]; p.t++; p.x+=p.vx; p.life--;
    if(p.life%2===0) Particles.add({x:p.x-Math.sign(p.vx)*3,y:p.y-2+rand(-2,2),vx:-p.vx*0.1,vy:rand(-0.3,0.3),life:10,color:'#ff9ec4',size:1.5,type:'spark'});
    let kill=p.life<=0 || SOLID(level.get(Math.floor(p.x/TILE),Math.floor(p.y/TILE)));
    const r={x:p.x-5,y:p.y-7,w:10,h:10};
    if(!kill){ for(const e of G.enemies){ if(!e.dead && overlap(r,e.rect())){ e.hurt(2); pl.energy=Math.min(100,pl.energy+14); if(pl.energy===100) sfx('select'); kill=true; break; } } }
    if(!kill && G.boss && !G.boss.dead && G.boss.alpha>0.5 && G.boss.state!=='intro' && overlap(r,G.boss.rect())){ if(G.boss.hurt(2)){ pl.energy=Math.min(100,pl.energy+9); } kill=true; }
    if(kill){ Particles.burst(p.x,p.y,6,['#ff6b9d','#fff'],1.5,12); P.splice(i,1); } } }
