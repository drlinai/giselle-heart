'use strict';
// ===== Cutscenes: intro, map, stage card, rescue, finale, birthday =====
const Scenes={};
// ---------- shared room drawing ----------
function drawRoom(mode){ // 'morning' | 'night' | 'dark'
  const night=mode!=='morning';
  R(0,0,W,H,night?'#1a1626':'#f3e5d8'); R(0,200,W,72,night?'#2b2030':'#a1796a'); for(let i=0;i<W;i+=32) R(i,200,1,72,night?'#241a28':'#8d6b5c'); R(0,196,W,4,night?'#332637':'#6d4c41');
  // window
  R(40,36,70,56,night?'#3e3a52':'#7a5a4a'); const sky=night?'#0b1030':'#8fd3ff'; R(44,40,62,48,sky); if(night){ R(60,48,2,2,'#fff'); R(84,56,1,1,'#fff'); R(72,70,1,1,'#fff'); circ(92,50,6,'#fff7d6'); } else { circ(90,52,7,'#fff7b0'); RA(50,72,24,6,'#fff',0.8); RA(70,60,18,5,'#fff',0.8); } R(74,40,2,48,night?'#3e3a52':'#7a5a4a'); R(44,63,62,2,night?'#3e3a52':'#7a5a4a');
  // photo frame
  R(200,50,44,34,'#8d6e63'); R(203,53,38,28,night?'#4a4050':'#ffe8d6'); drawChar('giselle',214,78,{t:0}); drawChar('william',230,78,{t:0}); drawChar('liam',206,78,{t:0}); drawChar('rex',222,78,{t:0}); text('♥',238,54,{size:6,color:'#ff6b9d',shadow:false});
  // bed
  R(20,176,100,24,night?'#5d4037':'#8d6e63'); R(22,160,96,18,night?'#c8bfc9':'#ffffff'); R(24,154,26,10,night?'#b8b0b8':'#fff5f5'); R(18,150,8,50,night?'#4e342e':'#795548'); R(114,150,8,50,night?'#4e342e':'#795548'); R(50,160,66,16,night?'#5c6bc0':'#ff8fb1');
  // table + chairs
  R(330,172,90,6,night?'#5d4037':'#a1887f'); R(334,178,6,22,night?'#4e342e':'#8d6e63'); R(410,178,6,22,night?'#4e342e':'#8d6e63'); R(312,184,14,4,night?'#4e342e':'#8d6e63'); R(312,170,3,30,night?'#4e342e':'#8d6e63'); R(426,184,14,4,night?'#4e342e':'#8d6e63'); R(435,170,3,30,night?'#4e342e':'#8d6e63');
  // door
  R(440,110,32,86,night?'#3e2723':'#6d4c41'); R(444,114,24,78,night?'#4e342e':'#8d6e63'); R(462,152,3,3,'#ffd54f');
}
function noteOverlay(t,txt){ RA(0,0,W,H,'#000',0.55); const w=260,h=120,x=(W-w)/2,y=60; R(x+4,y+4,w,h,'#00000055'); R(x,y,w,h,'#fdf6e3'); R(x,y,w,2,'#d7ccc8'); R(x+14,y+14,w-28,1,'#e0d6c8'); for(let i=1;i<6;i++) R(x+14,y+14+i*18,w-28,1,'#e8dfd0'); const s=txt.slice(0,Math.floor(t*0.7)); const lines=wrap(s,w-40,11); lines.forEach((l,i)=>text(l,x+20,y+22+i*20,{size:11,color:'#3e2723',shadow:false})); if(t>txt.length*1.5 && (G.frame>>4)&1) text('▼ 空白鍵',x+w-50,y+h-14,{size:7,color:'#8d6e63',shadow:false}); }
const NOTE_TEXT='請善用你的超能力，\n救出你的家人。';

// ---------- INTRO ----------
Scenes.intro=function(onDone){
  const S={gx:70,gy:200,up:false,glow:0};
  const room=(t)=>{ drawRoom('morning'); if(S.up){ drawChar('giselle',S.gx,S.gy,{t,face:1,walk:S.walking?t*0.22:null,arms:S.glow>0?'up':null}); if(S.glow>0){ for(let i=0;i<2;i++) Particles.add({x:S.gx+rand(-8,8),y:S.gy-30,vx:rand(-0.4,0.4),vy:rand(-1.5,-0.5),life:30,type:'spark',size:2,color:['#a9dcff','#fff','#ff9ec4'][i]}); } } else { drawChar('giselle',72,168,{t,lie:true,sleep:true,face:1}); R(78,160,36,16,'#ff8fb1'); } drawNote(366,166); };
  AudioSys.play('eerie');
  return new Cutscene([
    { dur:70, enter:()=>Fade.set(0), draw:t=>{ R(0,0,W,H,'#000'); if(t>30) text('……',W/2,H/2,{size:14,align:'center',color:'#777'}); } },
    { dialog:[ {who:'？？？',text:'吉賽兒……',color:'#9fa8da'}, {who:'？？？',text:'吉賽兒……醒醒……',color:'#9fa8da'} ], draw:()=>R(0,0,W,H,'#000') },
    { dur:40, enter:()=>{ Fade.set(1); Fade.to(0,0.02); AudioSys.stop(); }, draw:room },
    { dur:50, draw:room, update:t=>{ if(t===30){ S.up=true; S.gx=120; } } },
    { dialog:[ {who:'Giselle',text:'嗯……早安——',color:'#ff9ec4'}, {who:'Giselle',text:'咦？William？Rex？Liam？',color:'#ff9ec4'}, '（家裡安靜得可怕。沒有人回答。）' ], draw:room },
    { dur:120, draw:room, update:t=>{ S.walking=true; S.gx=Math.min(345,S.gx+1.6); if(S.gx>=345) S.walking=false; } },
    { dialog:['（桌上放著一張紙條。）'], draw:room },
    { wait:true, draw:t=>{ room(t); noteOverlay(t,NOTE_TEXT); } },
    { dialog:[ {who:'Giselle',text:'我的……超能力？',color:'#ff9ec4'} ], draw:room },
    { dur:80, enter:()=>{ S.glow=1; AudioSys.sfx('heart'); }, draw:room },
    { dialog:[ {who:'Giselle',text:'……我明白了。',color:'#ff9ec4'}, {who:'Giselle',text:'等我。無論你們在哪裡，我一定會把你們全部帶回家。',color:'#ff9ec4'} ], draw:room },
    { dur:50, enter:()=>{ AudioSys.sfx('teleport'); Fade.to(1,0.04); }, draw:t=>{ room(t); RA(0,0,W,H,'#fff',Math.min(1,t/30)); }, update:t=>{ if(t===49) onDone(); } },
  ]);
};

// ---------- STAGE CARD ----------
Scenes.card=function(i,onDone){ const th=THEMES[i];
  const S={done:false};
  return new Cutscene([ { dur:170, enter:()=>{ Fade.set(0); AudioSys.stop(); }, draw:t=>{ R(0,0,W,H,'#000'); const a=clamp(t/30,0,1); ctx.globalAlpha=a; text('STAGE '+(i+1),W/2,80,{size:20,font:FONT_EN,align:'center',color:'#ffd27f',bold:true}); text(th.en,W/2,110,{size:14,font:FONT_EN,align:'center',color:'#fff'}); text(th.name,W/2,132,{size:12,align:'center',color:'#ddd'}); if(t>60){ text('被囚禁者：'+th.captiveLabel,W/2,158,{size:10,align:'center',color:'#ff9ec4'}); drawChar(th.captive,W/2,236,{t}); drawCage(W/2,237,t); } ctx.globalAlpha=1; }, update:t=>{ if(!S.done && (t>=169 || (t>40&&CONFIRM()))){ S.done=true; onDone(); } } } ]);
};

// ---------- MAP ----------
Scenes.map=function(onSelect){
  const nodes=[{x:140,y:150,label:'台灣',en:'TAIWAN'},{x:250,y:112,label:'新加坡',en:'SINGAPORE'},{x:380,y:70,label:'月球',en:'THE MOON'}];
  let sel=G.rescued.findIndex(r=>!r); if(sel<0) sel=2; const S={gx:60,gy:236,phase:'select',t:0,walk:0};
  AudioSys.play('title');
  srand(42); const stars=[]; for(let i=0;i<80;i++) stars.push([rnd()*W,rnd()*H,rnd()]);
  const draw=(t)=>{ const gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#050a2a'); gr.addColorStop(1,'#1a1240'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H); for(const s of stars) R(s[0],s[1],1,1,((t/20+s[2]*10)|0)%3?'#fff':'#556');
    // dotted path
    ctx.strokeStyle='#5c6bc0'; ctx.setLineDash([3,4]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(90,220); for(const n of nodes) ctx.lineTo(n.x,n.y+10); ctx.stroke(); ctx.setLineDash([]);
    nodes.forEach((n,i)=>{ const locked=i>0&&!G.rescued[i-1]; const done=G.rescued[i]; ctx.globalAlpha=locked?0.4:1;
      if(i===0){ R(n.x-14,n.y-6,28,22,'#2e7d32'); R(n.x-10,n.y-12,16,8,'#388e3c'); R(n.x-2,n.y-36,4,32,'#3f7ab5'); R(n.x-5,n.y-20,10,4,'#4a90d9'); R(n.x-5,n.y-30,10,4,'#4a90d9'); R(n.x-1,n.y-42,2,6,'#9fd4ff'); }
      else if(i===1){ R(n.x-16,n.y+2,32,12,'#2c6e9e'); R(n.x-12,n.y-4,24,8,'#43a047'); R(n.x-4,n.y-28,8,24,'#eceff1'); R(n.x-2,n.y-34,12,8,'#fafafa'); R(n.x+8,n.y-30,2,2,'#333'); R(n.x+8,n.y-22,6,2,'#8fd3ff'); }
      else { circ(n.x,n.y-10,18,'#bdbdbd'); circ(n.x-6,n.y-14,4,'#9e9e9e'); circ(n.x+6,n.y-4,3,'#9e9e9e'); circ(n.x+4,n.y-18,2,'#9e9e9e'); }
      text(n.label,n.x,n.y+18,{size:9,align:'center',color:locked?'#999':'#fff'}); text(n.en,n.x,n.y+30,{size:7,align:'center',color:'#9fa8da',font:FONT_EN});
      if(done){ heartShape(n.x+16,n.y-40,4,'#ff6b9d'); text('CLEAR',n.x,n.y+40,{size:7,align:'center',color:'#ffd27f',font:FONT_EN}); }
      if(locked) text('LOCKED',n.x,n.y+40,{size:7,align:'center',color:'#888',font:FONT_EN});
      ctx.globalAlpha=1;
      if(i===sel && S.phase==='select'){ const b=Math.sin(t/8)*3; ctx.strokeStyle='#ff9ec4'; ctx.lineWidth=2; ctx.strokeRect(n.x-24-b/2,n.y-48-b/2,48+b,96+b); text('▼',n.x,n.y-62+b,{size:9,align:'center',color:'#ff9ec4'}); } });
    // platform + characters
    R(20,236,120,6,'#5c6bc0'); R(20,242,120,30,'#283593'); RA(20,236,120,2,'#fff',0.5);
    let px=S.gx-22; ['rex','liam','william'].forEach((n,i)=>{ if(G.rescued[i]){ drawChar(n,px,236,{t,face:1}); px-=18; } });
    const go={t,face:1}; if(S.phase==='walk') go.walk=S.walk; if(S.phase==='charge') go.arms='up'; if(S.phase!=='gone') drawChar('giselle',S.gx,S.gy,go);
    if(S.phase==='charge'){ const p=S.t/70; for(let i=0;i<3;i++) Particles.add({x:S.gx+rand(-14,14),y:S.gy-rand(0,30),vx:0,vy:rand(-2,-0.5),life:25,type:'spark',size:2,color:['#a9dcff','#fff','#ff9ec4'][i]}); ctx.strokeStyle='#a9dcff'; ctx.lineWidth=2; ctx.globalAlpha=0.6; ctx.beginPath(); ctx.arc(S.gx,S.gy-13,30-p*28,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; }
    if(S.phase==='flash'){ RA(0,0,W,H,'#fff',Math.min(1,S.t/12)); } if(S.phase==='gone') RA(0,0,W,H,'#fff',1);
    text('選擇目的地',W/2,12,{size:11,align:'center',color:'#fff',bold:true}); text('← → 選擇　　空白鍵 / Enter 瞬間移動',W/2,H-14,{size:8,align:'center',color:'#9fa8da'});
    text('MISSION: 救出全家人',8,8,{size:7,color:'#ffd27f',font:FONT_EN});
  };
  return new Cutscene([ { draw, update:t=>{ S.t++;
    if(S.phase==='select'){ const avail=i=>i===0||G.rescued[i-1]; if(pressed('ArrowLeft')){ let n=sel; do{ n=(n+2)%3; }while(!avail(n)); if(n!==sel){ sel=n; AudioSys.sfx('move'); } } if(pressed('ArrowRight')){ let n=sel; do{ n=(n+1)%3; }while(!avail(n)); if(n!==sel){ sel=n; AudioSys.sfx('move'); } } if(CONFIRM()&&avail(sel)){ S.phase='walk'; S.t=0; AudioSys.sfx('select'); } }
    else if(S.phase==='walk'){ S.walk+=0.22; S.gx+=1.4; if(S.gx>=96){ S.phase='charge'; S.t=0; } }
    else if(S.phase==='charge'){ if(S.t===1) AudioSys.sfx('teleport'); if(S.t>70){ S.phase='flash'; S.t=0; Particles.burst(S.gx,S.gy-13,30,['#a9dcff','#fff','#ff9ec4'],3,30); } }
    else if(S.phase==='flash'){ if(S.t===6) S.phase='gone', S.t=0; }
    else if(S.phase==='gone'){ if(S.t===25){ onSelect(sel); } }
  } } ]);
};

// ---------- RESCUE (in-level, drawn over level) ----------
Scenes.rescue=function(i,pl,level,onDone){ const th=THEMES[i]; const name=th.captive; const S={cx:level.cageX,cy:(ROWS-3)*TILE,shattered:false,npc:null,hug:false,t:0};
  pl.locked=true; pl.vx=0;
  const lines={ rex:[ {who:'Rex',text:'媽媽！',color:'#ffd27f'}, {who:'Giselle',text:'Rex！我的寶貝……',color:'#ff9ec4'}, {who:'Giselle',text:'媽媽來了，不怕了喔。',color:'#ff9ec4'}, '（Rex 緊緊抱住媽媽，咯咯地笑了起來。）', {who:'Giselle',text:'哥哥和爸爸還在等我們。走吧，下一站。',color:'#ff9ec4'} ],
    liam:[ {who:'Liam',text:'媽媽！我就知道妳一定會來！',color:'#81c784'}, {who:'Giselle',text:'Liam，你好勇敢，一個人撐到現在。',color:'#ff9ec4'}, {who:'Liam',text:'弟弟呢？',color:'#81c784'}, {who:'Giselle',text:'Rex 平安了。接下來，我們一起去救爸爸。',color:'#ff9ec4'}, {who:'Liam',text:'嗯！我會保護媽媽的！',color:'#81c784'} ],
    william:[ {who:'William',text:'Giselle……妳真的來了。',color:'#9fa8da'}, {who:'Giselle',text:'笨蛋，我當然會來。',color:'#ff9ec4'}, {who:'Giselle',text:'你是我的心啊。少了你，吉賽兒之心怎麼跳？',color:'#ff9ec4'}, {who:'William',text:'……孩子們呢？',color:'#9fa8da'}, {who:'Giselle',text:'都在等你。我們回家吧。',color:'#ff9ec4'} ] }[name];
  const drawNPC=(t)=>{ if(!S.shattered){ drawChar(name,S.cx,S.cy,{t,face:-1}); drawCage(S.cx,S.cy,t); } else if(S.npc){ drawChar(name,S.npc.x,S.cy,{t,face:S.npc.face,walk:S.npc.walk?t*0.3:null,arms:S.hug?'hug':null,happy:S.hug}); } };
  let cs; cs=new Cutscene([
    { dur:40 },
    { dur:50, enter:()=>{ S.shattered=true; S.npc={x:S.cx,face:-1,walk:false}; AudioSys.sfx('shatter'); Particles.burst(S.cx,S.cy-22,40,['#b388ff','#fff','#e1bee7'],3,40,0.1); G.cageBroken=true; } },
    { dur:150, enter:()=>{ S.npc.walk=true; AudioSys.play('reunion'); }, update:t=>{ const tx=pl.x+12; if(S.npc.x>tx){ S.npc.x-=1.2; pl.face=1; } else { S.npc.walk=false; S.npc.face=-1; if(!S.hug){ S.hug=true; S.t=0; AudioSys.sfx('heart'); } } if(S.hug){ S.t++; if(S.t%6===0) Particles.hearts(pl.x+6,pl.y-26,2); if(S.t>60) cs.next(); } } },
    { dialog:lines, update:()=>{ if(G.frame%12===0) Particles.hearts(pl.x+6,pl.y-26,1); } },
    { dur:60, enter:()=>Fade.to(1,0.03), update:t=>{ if(t===59) onDone(); } },
  ]); return Object.assign(cs,{ drawNPC, hugging:()=>S.hug });
};

// ---------- FINALE ----------
Scenes.finale=function(onDone){
  const S={t:0,bubbleHat:false,wx:70,wUp:false,wWalk:false};
  const home=(t,o={})=>{ drawRoom(o.mode||'morning'); };
  const hugScene=t=>{ home(t); const cx=240, by=200, b=Math.sin(t/10)*1; drawChar('liam',cx-14,by,{t,face:1,arms:'hug',happy:true}); drawChar('william',cx+16,by+b,{t,face:-1,arms:'hug',happy:true}); drawChar('giselle',cx,by,{t,face:1,arms:'hug',happy:true}); drawChar('rex',cx+4,by,{t,face:-1,arms:'up',happy:true}); if(t%5===0) Particles.hearts(cx,by-36,2); };
  const dinner=t=>{ R(0,0,W,H,'#f6e7d2'); R(0,200,W,72,'#a1796a'); R(0,196,W,4,'#6d4c41'); R(200,50,44,34,'#8d6e63'); R(203,53,38,28,'#ffe8d6'); // lamp
    R(238,0,4,40,'#555'); R(220,40,40,14,'#ffb74d'); RA(180,54,120,140,'#fff3c4',0.25);
    const tx=170,ty=186; R(tx,ty,140,6,'#8d6e63'); R(tx+6,ty+6,6,14,'#6d4c41'); R(tx+128,ty+6,6,14,'#6d4c41'); R(tx+4,ty-2,132,2,'#fff'); 
    // food
    circ(tx+40,ty-2,8,'#fff'); circ(tx+40,ty-2,6,'#ff7043'); circ(tx+70,ty-3,9,'#fff'); circ(tx+70,ty-3,7,'#8bc34a'); circ(tx+100,ty-2,8,'#fff'); circ(tx+100,ty-2,6,'#ffc107'); R(tx+56,ty-10,4,8,'#fff'); R(tx+84,ty-10,4,8,'#fff'); if(t%7===0){ Particles.add({x:tx+40+rand(-4,4),y:ty-10,vy:-0.6,life:30,color:'#fff',size:1}); Particles.add({x:tx+100+rand(-4,4),y:ty-10,vy:-0.6,life:30,color:'#fff',size:1}); }
    const eat=(n,x,f)=>{ const bob=((Math.floor(t/14)+x)%2)?1:0; drawChar(n,x,200+bob,{t,face:f,sit:true,happy:true}); };
    // chairs
    [150,318].forEach(x=>{ R(x-6,184,14,4,'#6d4c41'); R(x-6,170,3,30,'#6d4c41'); R(x+5,188,3,12,'#6d4c41'); });
    eat('liam',158,1); eat('giselle',140,1); eat('william',324,-1); eat('rex',310,-1); text('♪',tx+70,ty-40+Math.sin(t/10)*3,{size:9,color:'#ff6b9d'}); };
  const bath=t=>{ R(0,0,W,H,'#cfe8f3'); for(let i=0;i<W;i+=24) for(let j=0;j<H;j+=24) R(i,j,23,23,((i/24+j/24)%2)?'#dbeef7':'#cfe8f3'); R(0,210,W,62,'#9ec3d6');
    const bx=150,by=165,bw=180,bh=55; R(bx-6,by-4,bw+12,6,'#eee'); R(bx,by,bw,bh,'#ffffff'); R(bx+6,by+4,bw-12,bh-10,'#7fd1f7'); R(bx+8,by+4,bw-16,3,'#b3ecff');
    const heads=[['liam',190],['giselle',220],['rex',248],['william',280]]; heads.forEach(([n,x],i)=>{ const b=Math.sin(t/12+i)*1.5; drawChar(n,x,by+22+b,{t,face:i<2?1:-1,happy:true}); });
    R(bx,by+6,bw,bh-6,'#ffffff'); R(bx+6,by+6,bw-12,3,'#7fd1f7'); R(bx-10,by+bh,16,8,'#ddd'); R(bx+bw-6,by+bh,16,8,'#ddd'); for(let i=0;i<6;i++){ const bxx=bx+10+((i*37)%(bw-20)), byy=by+4-((t/2+i*13)%30); circ(bxx,byy,2+i%3,'#ffffffaa'); }
    if(t>60){ circ(280,by-16,7,'#fff'); circ(274,by-12,5,'#fff'); circ(287,by-11,5,'#fff'); } if(t%6===0) Particles.add({x:bx+rand(10,bw-10),y:by+4,vx:rand(-0.3,0.3),vy:rand(-1,-0.4),life:40,color:'#ffffff',size:2});
    // shower head
    R(400,60,6,40,'#999'); R(380,98,30,8,'#bbb'); if(t%3===0) for(let i=0;i<3;i++) Particles.add({x:384+i*9,y:106,vy:2.5,life:40,color:'#9fe0ff',size:1}); };
  const sleep=t=>{ drawRoom('night'); RA(0,0,W,H,'#000',0.2); RA(44,40,62,48,'#9fb4ff',0.15);
    const bx=150,by=120,bw=190,bh=100; R(bx-6,by-10,bw+12,bh+14,'#5d4037'); R(bx,by-4,bw,6,'#4e342e'); R(bx,by,bw,bh,'#eceff1');
    const ppl=[['liam',bx+28],['giselle',bx+74],['rex',bx+112],['william',bx+156]]; ppl.forEach(([n,x])=>{ R(x-12,by+4,24,10,'#fff'); drawChar(n,x,by+46,{t,sleep:true,face:1}); });
    R(bx+4,by+40,bw-8,bh-44,'#5c6bc0'); R(bx+4,by+40,bw-8,3,'#9fa8da'); for(let i=0;i<4;i++) R(bx+14+i*46,by+52,20,2,'#7986cb');
    ppl.forEach(([n,x],i)=>{ const ph=(t/40+i*0.7)%2; if(ph<1) text('z',x+8+ph*10,by-6-ph*14,{size:8+ph*4,color:'#9fa8da'}); }); };
  const morning=t=>{ drawRoom('morning'); if(!S.wUp){ drawChar('william',72,168,{t,lie:true,sleep:true,face:1}); R(78,160,36,16,'#ff8fb1'); } else drawChar('william',S.wx,200,{t,face:1,walk:S.wWalk?t*0.22:null}); drawNote(366,166); };
  AudioSys.play('reunion');
  return new Cutscene([
    { dur:30, enter:()=>{ Fade.set(1); Fade.to(0,0.03); }, draw:hugScene },
    { dur:120, draw:hugScene, enter:()=>AudioSys.sfx('heart') },
    { dialog:['（Giselle、William、Liam、Rex——全家人終於再次緊緊相擁。）', {who:'Giselle',text:'回家了。',color:'#ff9ec4'}, {who:'Liam',text:'我肚子好餓！',color:'#81c784'}, {who:'Rex',text:'餓餓！',color:'#ffd27f'}, {who:'William',text:'哈哈，那我們去吃晚餐吧。',color:'#9fa8da'}], draw:hugScene },
    { dur:40, enter:()=>Fade.to(1,0.05), draw:hugScene },
    { dur:40, enter:()=>Fade.to(0,0.05), draw:dinner },
    { dialog:['（四個人圍著餐桌，吃了一頓熱熱鬧鬧的晚餐。）','（Rex 把飯粒黏在臉上，Liam 笑到噴飯，William 一直幫 Giselle 夾菜。）'], draw:dinner },
    { dur:40, enter:()=>Fade.to(1,0.05), draw:dinner },
    { dur:40, enter:()=>Fade.to(0,0.05), draw:bath },
    { dialog:['（洗澡時間。Rex 把泡泡全抹在爸爸頭上。）','（浴室裡充滿了笑聲。）'], draw:bath },
    { dur:40, enter:()=>Fade.to(1,0.05), draw:bath },
    { dur:40, enter:()=>Fade.to(0,0.05), draw:sleep },
    { dialog:['（然後，所有人都在 Giselle 的身邊，安心地睡著了。）','（這一天，吉賽兒之心，跳得很安穩。）'], draw:sleep },
    { dur:90, enter:()=>{ Fade.to(1,0.02); AudioSys.stop(); }, draw:sleep },
    { dur:120, draw:t=>{ R(0,0,W,H,'#000'); if(t>30) text('隔天早上。',W/2,H/2-6,{size:12,align:'center',color:'#ccc'}); } },
    { dur:60, enter:()=>{ Fade.set(1); Fade.to(0,0.03); AudioSys.play('eerie'); }, draw:morning },
    { dur:40, draw:morning, update:t=>{ if(t===20){ S.wUp=true; S.wx=120; } } },
    { dialog:[ {who:'William',text:'嗯……早安——',color:'#9fa8da'}, {who:'William',text:'……Giselle？',color:'#9fa8da'}, {who:'William',text:'Giselle！Liam！Rex！',color:'#9fa8da'}, '（家裡安靜得可怕。沒有人回答。）' ], draw:morning },
    { dur:140, draw:morning, update:t=>{ S.wWalk=true; S.wx=Math.min(345,S.wx+1.6); if(S.wx>=345) S.wWalk=false; } },
    { dialog:['（桌上，放著同一張紙條。）'], draw:morning },
    { wait:true, draw:t=>{ morning(t); noteOverlay(t,NOTE_TEXT); } },
    { dialog:[ {who:'William',text:'……我的超能力？',color:'#9fa8da'} ], draw:morning },
    { dur:60, enter:()=>{ Fade.to(1,0.03); AudioSys.stop(); }, draw:morning },
    { dur:200, enter:()=>Fade.set(0), draw:t=>{ R(0,0,W,H,'#000'); ctx.globalAlpha=clamp(t/40,0,1); text('全劇終',W/2,100,{size:22,align:'center',color:'#fff',bold:true}); text('THE END',W/2,132,{size:12,align:'center',color:'#aaa',font:FONT_EN}); if(t>100){ ctx.globalAlpha=clamp((t-100)/40,0,1); text("Giselle's Heart II",W/2,180,{size:11,align:'center',color:'#ff9ec4',font:FONT_EN}); text('To be continued……?',W/2,196,{size:9,align:'center',color:'#888',font:FONT_EN}); } ctx.globalAlpha=1; } },
    { wait:true, draw:t=>{ R(0,0,W,H,'#000'); text('全劇終',W/2,100,{size:22,align:'center',color:'#fff',bold:true}); text('THE END',W/2,132,{size:12,align:'center',color:'#aaa',font:FONT_EN}); text("Giselle's Heart II",W/2,180,{size:11,align:'center',color:'#ff9ec4',font:FONT_EN}); text('To be continued……?',W/2,196,{size:9,align:'center',color:'#888',font:FONT_EN}); if((t>>4)&1) text('▼ 空白鍵',W/2,240,{size:8,align:'center',color:'#666'}); } },
    { dur:1, update:()=>onDone() },
  ]);
};

// ---------- BIRTHDAY CARD ----------
const BIRTHDAY_LINES=[
  '2026 . 11 . 25',
  '親愛的 Giselle：',
  '在這個世界上，妳一直是那個救我們的人。',
  '謝謝妳用妳的超能力——愛、耐心和笑容——',
  '守護著這個家，守護著吉賽兒之心。',
  '老婆，生日快樂。',
  '我愛妳。',
  '— William、Liam、Rex',
];
Scenes.birthday=function(onDone){ AudioSys.play('birthday'); srand(7); const confetti=[]; for(let i=0;i<40;i++) confetti.push({x:rnd()*W,y:rnd()*H,s:rnd()*2+1,c:['#ff6b9d','#ffd27f','#a9dcff','#fff','#b388ff'][i%5],v:rnd()*0.5+0.3});
  const draw=t=>{ const gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#2a0a3a'); gr.addColorStop(1,'#7a1f5a'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
    confetti.forEach(c=>{ c.y+=c.v; if(c.y>H) c.y=-4; R(c.x+Math.sin(t/20+c.y/30)*4,c.y,c.s,c.s,c.c); });
    if(t%10===0) Particles.add({x:rand(0,W),y:H+4,vy:rand(-1,-0.4),vx:rand(-0.2,0.2),life:120,type:'heart',size:rand(2,5),color:['#ff6b9d','#ff9ec4','#ffd1e1'][t%3]});
    const cw=330,ch=200,cx=(W-cw)/2,cy=30; RA(cx,cy,cw,ch,'#fff',0.93); R(cx,cy,cw,3,'#ff6b9d'); R(cx,cy+ch-3,cw,3,'#ff6b9d'); heartShape(cx+cw/2,cy+12,8,'#ff4d79'); heartShape(cx+16,cy+16,4,'#ff9ec4'); heartShape(cx+cw-16,cy+16,4,'#ff9ec4');
    let y=cy+32; const shown=Math.floor(t/18); BIRTHDAY_LINES.forEach((l,i)=>{ const big=i===5||i===6; if(i<=shown){ const a=clamp((t-i*18)/18,0,1); ctx.globalAlpha=a; text(l,cx+cw/2,y,{size:big?13:(i===0?10:9),align:'center',color:i===0?'#7a1f5a':big?'#d81b60':'#3e2723',bold:big,shadow:false,font:i===0?FONT_EN:FONT}); ctx.globalAlpha=1; } y+=big?20:17; });
    // family at bottom
    const by=262; drawChar('liam',cx+60,by,{t,face:1,arms:'up',happy:true}); drawChar('giselle',cx+120,by,{t,face:1,happy:true}); drawChar('rex',cx+150,by,{t,face:-1,arms:'up',happy:true}); drawChar('william',cx+185,by,{t,face:-1,happy:true}); if(t%40===0) Particles.hearts(cx+120,by-30,3);
    if(t>BIRTHDAY_LINES.length*18+60 && (t>>4)&1) text('♥ 空白鍵 回到標題 ♥',W/2,H-8,{size:7,align:'center',color:'#ffd1e1'}); };
  return new Cutscene([ { dur:40, enter:()=>{ Fade.set(1); Fade.to(0,0.02); }, draw }, { draw, update:t=>{ if(t>BIRTHDAY_LINES.length*18+60 && CONFIRM()) { Fade.to(1,0.03,onDone); } } } ]);
};
