'use strict';
// ===== Core engine: canvas, input, drawing, text, dialog, fade, particles, cutscene =====
const W=480, H=272, TILE=16, ROWS=17;
const FONT='"PingFang TC","Microsoft JhengHei","Noto Sans TC","Heiti TC",sans-serif';
const FONT_EN='Georgia,"Times New Roman",serif';
const canvas=document.getElementById('c');
let ctx=canvas.getContext('2d');
let SCALE=2;
function resize(){
  const s=Math.max(1, Math.floor(Math.min(window.innerWidth/W, window.innerHeight/H)*2)/2);
  SCALE=s; const dpr=Math.min(2, window.devicePixelRatio||1);
  canvas.width=Math.round(W*s*dpr); canvas.height=Math.round(H*s*dpr);
  canvas.style.width=(W*s)+'px'; canvas.style.height=(H*s)+'px';
}
window.addEventListener('resize',resize); resize();
function beginFrame(){ const dpr=Math.min(2, window.devicePixelRatio||1); ctx.setTransform(SCALE*dpr,0,0,SCALE*dpr,0,0); ctx.imageSmoothingEnabled=false; }

// ---- input ----
const Keys={}, Pressed={};
const PREVENT=new Set(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
window.addEventListener('keydown',e=>{ AudioSys.init(); AudioSys.resume(); if(!Keys[e.code]) Pressed[e.code]=true; Keys[e.code]=true; if(PREVENT.has(e.code)) e.preventDefault(); });
window.addEventListener('keyup',e=>{ Keys[e.code]=false; });
window.addEventListener('blur',()=>{ for(const k in Keys) Keys[k]=false; });
const key=c=>!!Keys[c], pressed=c=>!!Pressed[c];
function clearPressed(){ for(const k in Pressed) Pressed[k]=false; }
const CONFIRM=()=>pressed('Space')||pressed('Enter')||pressed('KeyA');

// ---- drawing helpers ----
function R(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function RA(x,y,w,h,c,a){ ctx.globalAlpha=a; R(x,y,w,h,c); ctx.globalAlpha=1; }
function circ(x,y,r,c){ ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
function heartShape(x,y,s,c){ // pixel heart, s = half width
  ctx.fillStyle=c; const u=Math.max(1,s/3);
  R(x-s,y-u,u*2,u*2); R(x,y-u,u*2,u*2); R(x-s-u/2,y,s*2+u,u*2); R(x-s+u/2,y+u*2,s*2-u,u); R(x-s+u*1.5,y+u*3,s*2-u*3,u); R(x-u/2,y+u*4,u,u);
}
function star(x,y,r,c,a){ ctx.fillStyle=c; ctx.globalAlpha=a==null?1:a; ctx.beginPath(); for(let i=0;i<10;i++){ const rr=i%2?r*0.4:r; const an=-Math.PI/2+i*Math.PI/5; ctx.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr);} ctx.closePath(); ctx.fill(); ctx.globalAlpha=1; }
function sparkle(x,y,s,c){ R(x-s,y,s*2+1,1,c); R(x,y-s,1,s*2+1,c); }
let seedv=1; function srand(seed){ seedv=seed; } function rnd(){ seedv=(seedv*16807)%2147483647; return (seedv-1)/2147483646; }
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;

// ---- text ----
function text(s,x,y,o={}){
  ctx.font=`${o.bold?'bold ':''}${o.size||9}px ${o.font||FONT}`; ctx.textAlign=o.align||'left'; ctx.textBaseline='top';
  if(o.shadow!==false){ ctx.fillStyle=o.shadow||'#000'; ctx.fillText(s,x+1,y+1); }
  ctx.fillStyle=o.color||'#fff'; ctx.fillText(s,x,y);
}
function textW(s,size,font,bold){ ctx.font=`${bold?'bold ':''}${size||9}px ${font||FONT}`; return ctx.measureText(s).width; }
function wrap(s,maxW,size){ const lines=[]; let cur=''; for(const ch of s){ if(ch==='\n'){ lines.push(cur); cur=''; continue; } if(textW(cur+ch,size)>maxW){ lines.push(cur); cur=ch; } else cur+=ch; } lines.push(cur); return lines; }

// ---- fade ----
const Fade={ a:0, target:0, speed:0.03, cb:null,
  to(t,speed,cb){ this.target=t; this.speed=speed||0.03; this.cb=cb||null; },
  set(a){ this.a=a; this.target=a; },
  update(){ if(this.a!==this.target){ this.a=this.a<this.target?Math.min(this.target,this.a+this.speed):Math.max(this.target,this.a-this.speed); if(this.a===this.target&&this.cb){ const c=this.cb; this.cb=null; c(); } } },
  draw(){ if(this.a>0){ ctx.globalAlpha=this.a; ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; } }
};

// ---- particles ----
const Particles={ list:[],
  add(p){ this.list.push(Object.assign({vx:0,vy:0,life:30,g:0,size:1,color:'#fff',type:'rect',fade:true},p)); },
  burst(x,y,n,color,spd,life,g){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=Math.random()*spd; this.add({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:life||30,color:Array.isArray(color)?color[i%color.length]:color,size:1+Math.random()*2,g:g||0}); } },
  hearts(x,y,n){ for(let i=0;i<n;i++) this.add({x:x+rand(-10,10),y:y+rand(-6,6),vx:rand(-0.3,0.3),vy:rand(-1.2,-0.4),life:rand(40,80),color:['#ff6b9d','#ff9ec4','#ffd1e1'][i%3],size:rand(2,4),type:'heart'}); },
  update(){ for(let i=this.list.length-1;i>=0;i--){ const p=this.list[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.life--; if(p.life<=0) this.list.splice(i,1); } },
  draw(){ for(const p of this.list){ ctx.globalAlpha=p.fade?clamp(p.life/20,0,1):1; if(p.type==='heart') heartShape(p.x,p.y,p.size,p.color); else if(p.type==='spark') sparkle(p.x,p.y,p.size,p.color); else R(p.x,p.y,p.size,p.size,p.color); } ctx.globalAlpha=1; },
  clear(){ this.list.length=0; }
};

// ---- dialog ----
const Dialog={ lines:[], i:0, shown:0, active:false, cb:null, speed:0.6, top:false,
  start(lines,cb){ this.lines=lines.map(l=>typeof l==='string'?{who:'',text:l}:l); this.i=0; this.shown=0; this.active=true; this.cb=cb||null; },
  update(){ if(!this.active) return; const L=this.lines[this.i]; const full=this.shown>=L.text.length;
    if(!full){ const prev=Math.floor(this.shown); this.shown=Math.min(L.text.length,this.shown+this.speed); if(Math.floor(this.shown)!==prev && Math.floor(this.shown)%2===0) AudioSys.sfx('blip'); }
    if(CONFIRM()){ if(!full){ this.shown=L.text.length; } else { this.i++; this.shown=0; AudioSys.sfx('move'); if(this.i>=this.lines.length){ this.active=false; const c=this.cb; this.cb=null; if(c) c(); } } }
  },
  draw(){ if(!this.active) return; const L=this.lines[this.i]; const bx=16,by=this.top?10:H-70,bw=W-32,bh=58;
    RA(bx,by,bw,bh,'#0a0a1e',0.88); R(bx,by,bw,1,'#8fb4ff'); R(bx,by+bh-1,bw,1,'#8fb4ff'); R(bx,by,1,bh,'#8fb4ff'); R(bx+bw-1,by,1,bh,'#8fb4ff');
    let ty=by+8; if(L.who){ text(L.who,bx+10,by+6,{size:9,color:L.color||'#ffd27f',bold:true}); ty=by+20; }
    const s=L.text.slice(0,Math.floor(this.shown)); const lines=wrap(s,bw-24,9); lines.forEach((ln,k)=>text(ln,bx+12,ty+k*13,{size:9}));
    if(this.shown>=L.text.length && (G.frame>>4)&1) text('▼',bx+bw-16,by+bh-14,{size:8,color:'#8fb4ff'});
  }
};

// ---- cutscene ----
class Cutscene{
  constructor(steps){ this.steps=steps; this.i=-1; this.t=0; this.done=false; this.next(); }
  next(){ this.i++; this.t=0; const s=this.steps[this.i]; if(!s){ this.done=true; return; } if(s.enter) s.enter(); if(s.dialog){ const d=typeof s.dialog==='function'?s.dialog():s.dialog; Dialog.start(d,()=>this.next()); } else if(s.dur===0) this.next(); }
  update(){ if(this.done) return; const s=this.steps[this.i]; this.t++; if(s.update) s.update(this.t);
    if(Dialog.active){ Dialog.update(); return; }
    if(s.dialog) return; // waiting for dialog callback
    if(s.wait){ if(CONFIRM()) this.next(); return; }
    if(s.dur!=null && this.t>=s.dur) this.next(); }
  draw(){ const s=this.steps[Math.min(this.i,this.steps.length-1)]; if(s&&s.draw) s.draw(this.t); if(Dialog.active) Dialog.draw(); }
}
