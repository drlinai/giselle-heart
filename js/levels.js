'use strict';
// ===== Levels: builder, tiles, backgrounds =====
const THEMES=[
  { id:0, name:'台灣・台北', en:'TAIWAN', captive:'rex', captiveLabel:'Rex（2歲）', boss:'101 鋼鐵守護者', bossEn:'GUARDIAN 101', gravity:0.24, song:'taiwan',
    ground:['#5b4a3a','#3d3128','#8a6d4a'], plat:['#b23a2a','#f1c40f'], spike:'#c0c8d0' },
  { id:1, name:'新加坡・濱海灣', en:'SINGAPORE', captive:'liam', captiveLabel:'Liam（6歲）', boss:'石化魚尾獅', bossEn:'PETRIFIED MERLION', gravity:0.24, song:'singapore',
    ground:['#c9b58a','#9a8660','#e6d6a8'], plat:['#2e7d32','#81c784'], spike:'#cfd8dc' },
  { id:2, name:'月球・寧靜海', en:'THE MOON', captive:'william', captiveLabel:'William（38歲）', boss:'月之暗面・影王', bossEn:'SHADOW SOVEREIGN', gravity:0.13, song:'moon',
    ground:['#7d8290','#4e535e','#a6abb8'], plat:['#546e7a','#90a4ae'], spike:'#ff5252' },
];
class LevelBuilder{
  constructor(theme,w){ this.theme=theme; this.w=w; this.t=new Uint8Array(w*ROWS); this.spawns=[]; this.checkpoints=[]; this.decos=[]; this.pickups=[]; }
  set(x,y,v){ if(x<0||x>=this.w||y<0||y>=ROWS) return; this.t[y*this.w+x]=v; }
  get(x,y){ if(x<0||x>=this.w) return 1; if(y<0) return 0; if(y>=ROWS) return 0; return this.t[y*this.w+x]; }
  ground(x0,x1,h=3){ for(let x=x0;x<=x1;x++) for(let y=ROWS-h;y<ROWS;y++) this.set(x,y,1); return this; }
  block(x,y,w,h){ for(let i=0;i<w;i++) for(let j=0;j<h;j++) this.set(x+i,y+j,1); return this; }
  plat(x,y,len){ for(let i=0;i<len;i++) this.set(x+i,y,2); return this; }
  spikes(x0,x1){ for(let x=x0;x<=x1;x++){ let y=0; while(y<ROWS&&this.get(x,y)!==1) y++; this.set(x,y-1,3); } return this; }
  surface(tx){ for(let y=0;y<ROWS;y++) if(this.get(tx,y)===1||this.get(tx,y)===2) return y*TILE; return (ROWS-3)*TILE; }
  enemy(kind,tx,dy=0){ const y=this.surface(tx); this.spawns.push({kind,x:tx*TILE+8,y:kind==='flyer'?y-56+dy:y+dy}); return this; }
  cp(tx){ this.checkpoints.push(tx*TILE+8); return this; }
  deco(type,tx,dx=0){ this.decos.push({type,x:tx*TILE+dx,y:this.surface(tx)}); return this; }
  heart(tx){ this.pickups.push({x:tx*TILE+8,y:this.surface(tx)-2}); return this; }
  finish(bossTile,cageTile,info){ return Object.assign({theme:this.theme,w:this.w,tiles:this.t,spawns:this.spawns,checkpoints:this.checkpoints,decos:this.decos,pickups:this.pickups,bossX:bossTile*TILE,cageX:cageTile*TILE+8,get:(x,y)=>this.get(x,y)},info||{}); }
}
function buildLevel(i){
  if(i===0){ const L=new LevelBuilder(0,210);
    L.ground(0,28).cp(3).enemy('walker',20).deco('stall',8).deco('lantern',14).deco('lantern',24)
     .ground(32,58).plat(38,11,4).plat(44,8,4).enemy('flyer',48).enemy('shooter',46).enemy('walker',53).deco('stall',35).deco('sign',56)
     .ground(63,92).spikes(70,73).plat(69,11,3).cp(65).enemy('walker',80).enemy('flyer',86).enemy('shooter',90).deco('lantern',78).deco('stall',84)
     .ground(96,124).block(102,13,2,1).block(106,12,2,2).block(110,11,2,3).plat(114,9,4).plat(119,7,4).enemy('flyer',108).enemy('walker',118).enemy('shooter',121).deco('lantern',99)
     .plat(127,10,2)
     .ground(130,160).cp(132).enemy('walker',140).enemy('walker',147).enemy('flyer',150).enemy('shooter',155).enemy('flyer',158).block(143,12,2,2).deco('stall',136).deco('sign',152)
     .ground(164,209).cp(166).heart(171).heart(175).deco('lantern',184).deco('lantern',200).deco('lantern',192);
    return L.finish(180,206,{});
  }
  if(i===1){ const L=new LevelBuilder(1,220);
    L.ground(0,24).cp(3).enemy('walker',16).deco('palm',6).deco('palm',20)
     .ground(28,50).plat(33,11,3).plat(38,8,3).plat(43,11,3).enemy('flyer',40).enemy('shooter',48).enemy('walker',36).deco('palm',30)
     .plat(53,10,2)
     .ground(57,80).cp(59).plat(65,11,6).spikes(66,69).enemy('walker',74).enemy('flyer',78).deco('bench',72)
     .ground(81,100,5).plat(85,9,3).enemy('shooter',90).enemy('walker',95).deco('palm',98)
     .ground(105,130).cp(107).plat(110,11,3).plat(115,8,3).plat(120,5,3).plat(125,8,3).enemy('flyer',113).enemy('flyer',122).enemy('shooter',116).enemy('walker',128).deco('supertree',118).deco('supertree',126)
     .plat(133,10,2)
     .ground(137,165).cp(139).spikes(150,152).enemy('walker',145).enemy('walker',158).enemy('flyer',148).enemy('flyer',160).enemy('shooter',163).block(155,12,2,2).deco('palm',142).deco('bench',156)
     .ground(169,219).cp(171).heart(176).heart(180).deco('palm',183).deco('palm',212);
    return L.finish(190,216,{});
  }
  const L=new LevelBuilder(2,230);
  L.ground(0,24).cp(3).enemy('walker',15).deco('flag',8).deco('crater',18)
   .ground(31,55).plat(36,10,3).plat(42,6,3).enemy('flyer',40).enemy('flyer',46).enemy('shooter',52).enemy('walker',50).deco('crater',34)
   .plat(59,9,2)
   .ground(64,90).cp(66).spikes(72,76).enemy('shooter',82).enemy('walker',86).enemy('flyer',88).deco('lander',68).deco('crater',80)
   .ground(91,110,6).enemy('walker',100).enemy('shooter',105).deco('crater',96)
   .plat(114,8,2)
   .ground(118,150).cp(120).plat(124,10,3).plat(130,6,3).plat(136,10,3).plat(142,6,3).enemy('flyer',127).enemy('flyer',133).enemy('flyer',139).enemy('shooter',145).enemy('walker',140).enemy('walker',148).deco('crater',122).deco('flag',135)
   .ground(158,180).cp(160).enemy('walker',166).enemy('walker',172).enemy('flyer',168).enemy('flyer',176).enemy('shooter',178).block(170,12,2,2).deco('crater',163)
   .ground(185,229).cp(187).heart(192).heart(196).deco('crater',204).deco('crater',222);
  return L.finish(200,226,{});
}

// ---------- tile rendering ----------
function drawTiles(level,camX){
  const th=THEMES[level.theme]; const x0=Math.max(0,Math.floor(camX/TILE)), x1=Math.min(level.w-1,Math.floor((camX+W)/TILE)+1);
  for(let x=x0;x<=x1;x++) for(let y=0;y<ROWS;y++){ const v=level.get(x,y); if(!v) continue; const px=x*TILE, py=y*TILE;
    if(v===1){ const top=level.get(x,y-1)!==1; R(px,py,TILE,TILE,th.ground[0]);
      if(level.theme===0){ if(top){ R(px,py,TILE,3,th.ground[2]); R(px,py+3,TILE,1,'#6b5540'); } if(((x+y)&1)) R(px+2,py+6,5,3,th.ground[1]); else R(px+9,py+10,5,3,th.ground[1]); }
      else if(level.theme===1){ if(top){ R(px,py,TILE,3,th.ground[2]); R(px,py+3,TILE,1,'#b89d6e'); } R(px+((x*7)%9),py+7+((y*3)%5),3,2,th.ground[1]); }
      else { if(top){ R(px,py,TILE,2,th.ground[2]); } R(px+((x*5)%10),py+6+((x*3)%6),4,3,th.ground[1]); if(((x*13+y)%7)===0) R(px+3,py+9,2,2,'#3a3d46'); } }
    else if(v===2){ R(px,py,TILE,5,th.plat[0]); R(px,py,TILE,1,th.plat[1]); if(level.theme===0){ R(px+((x&1)?2:9),py+5,3,3,'#8a2a1a'); } else if(level.theme===2){ R(px+1,py+2,2,2,'#cfd8dc'); R(px+13,py+2,2,2,'#cfd8dc'); } }
    else if(v===3){ for(let i=0;i<4;i++){ ctx.fillStyle=th.spike; ctx.beginPath(); ctx.moveTo(px+i*4,py+16); ctx.lineTo(px+i*4+2,py+6); ctx.lineTo(px+i*4+4,py+16); ctx.fill(); } }
  }
}
// ---------- decorations ----------
function drawDecos(level,camX){ for(const d of level.decos){ if(d.x<camX-80||d.x>camX+W+80) continue; const x=d.x,y=d.y;
  switch(d.type){
    case 'stall': R(x-14,y-26,36,4,'#c0392b'); R(x-16,y-23,40,3,'#e74c3c'); R(x-12,y-22,2,22,'#7a5230'); R(x+16,y-22,2,22,'#7a5230'); R(x-10,y-12,26,8,'#d9a066'); R(x-6,y-18,6,6,'#f1c40f'); R(x+6,y-18,6,6,'#f1c40f'); text('夜市',x+2,y-32,{size:7,color:'#ffd27f',align:'center'}); break;
    case 'lantern': R(x,y-60,1,14,'#7a5230'); R(x-5,y-48,11,12,'#e8302a'); R(x-6,y-46,13,8,'#ff5a4f'); R(x-2,y-50,5,2,'#f1c40f'); R(x-2,y-36,5,2,'#f1c40f'); R(x,y-34,1,4,'#f1c40f'); RA(x-8,y-50,17,16,'#ff8a65',0.15); break;
    case 'sign': R(x,y-30,2,30,'#555'); R(x-12,y-34,26,10,'#1e88e5'); text('台北101 →',x+1,y-33,{size:6,color:'#fff',align:'center',shadow:false}); break;
    case 'palm': R(x,y-34,3,34,'#8d6e3f'); R(x-1,y-24,2,2,'#6d4e2f'); for(let i=0;i<5;i++){ const a=-Math.PI*0.9+i*Math.PI*0.2; ctx.strokeStyle='#2e7d32'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x+1,y-34); ctx.quadraticCurveTo(x+1+Math.cos(a)*14,y-44+Math.sin(a)*6,x+1+Math.cos(a)*22,y-30+Math.sin(a)*4); ctx.stroke(); } R(x-2,y-36,6,4,'#5d4037'); break;
    case 'bench': R(x-10,y-8,24,3,'#795548'); R(x-10,y-14,24,2,'#795548'); R(x-8,y-5,2,5,'#4e342e'); R(x+10,y-5,2,5,'#4e342e'); break;
    case 'supertree': R(x-2,y-90,5,90,'#6a1b9a'); for(let i=0;i<4;i++){ R(x-3-i*3,y-28-i*8,2,6,'#7b1fa2'); R(x+3+i*3,y-28-i*8,2,6,'#7b1fa2'); } ctx.fillStyle='#8e24aa'; ctx.beginPath(); ctx.ellipse(x,y-92,22,8,0,0,Math.PI*2); ctx.fill(); for(let i=0;i<7;i++) R(x-18+i*6,y-96+(i%2)*3,2,2,((G.frame>>4)+i)%3?'#f48fb1':'#fff'); break;
    case 'flag': R(x,y-30,1,30,'#ddd'); R(x+1,y-30,14,9,'#eceff1'); R(x+1,y-30,14,1,'#c62828'); R(x+1,y-28,14,1,'#c62828'); R(x+1,y-26,14,1,'#c62828'); R(x+1,y-24,14,1,'#c62828'); R(x+1,y-30,6,5,'#283593'); break;
    case 'crater': ctx.fillStyle='#5c6069'; ctx.beginPath(); ctx.ellipse(x+8,y+3,14,4,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#8a8f99'; ctx.beginPath(); ctx.ellipse(x+8,y+2,12,3,0,0,Math.PI*2); ctx.fill(); break;
    case 'lander': R(x-10,y-14,24,10,'#c0a060'); R(x-8,y-22,20,8,'#9e9e9e'); R(x-6,y-26,16,4,'#bdbdbd'); R(x-14,y-6,4,6,'#9e9e9e'); R(x+14,y-6,4,6,'#9e9e9e'); R(x-16,y-1,8,2,'#757575'); R(x+12,y-1,8,2,'#757575'); R(x-2,y-20,4,3,'#1e88e5'); break;
  } } }

// ---------- parallax backgrounds (cached) ----------
const BG={ cache:{},
  layer(theme,n){ const k=theme+'_'+n; if(this.cache[k]) return this.cache[k]; const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); const save=ctx; ctx=g; srand(theme*101+n*7+3);
    try{ this['t'+theme][n](g); } finally { ctx=save; }
    this.cache[k]=c; return c; },
  draw(theme,camX,camY){ // sky, far(0.15), mid(0.45)
    ctx.drawImage(this.layer(theme,0),0,0);
    const far=this.layer(theme,1), mid=this.layer(theme,2);
    let ox=-Math.round(camX*0.15)%W; ctx.drawImage(far,ox,0); ctx.drawImage(far,ox+W,0); if(ox>0) ctx.drawImage(far,ox-W,0);
    ox=-Math.round(camX*0.45)%W; ctx.drawImage(mid,ox,0); ctx.drawImage(mid,ox+W,0); if(ox>0) ctx.drawImage(mid,ox-W,0);
  },
  t0:[ g=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#05061f'); gr.addColorStop(0.6,'#1b1140'); gr.addColorStop(1,'#3a1f55'); g.fillStyle=gr; g.fillRect(0,0,W,H); for(let i=0;i<70;i++) R(rnd()*W,rnd()*160,1,1,rnd()<0.3?'#fff':'#9fb4ff'); circ(400,40,16,'#fff7d6'); circ(394,36,13,'#1b1140'); circ(396,38,13,'#fff7d6'); },
    g=>{ // mountains + skyline + 101
      g.fillStyle='#120c2a'; g.beginPath(); g.moveTo(0,200); for(let x=0;x<=W;x+=20){ g.lineTo(x,170+Math.sin(x/37)*12+Math.sin(x/13)*5);} g.lineTo(W,H); g.lineTo(0,H); g.fill();
      const b=[[0,30,60],[40,24,90],[70,20,70],[100,36,110],[150,30,80],[300,26,95],[340,40,120],[390,28,85],[430,30,100],[460,24,70]];
      for(const [x,w,h] of b){ R(x,220-h,w,h+10,'#1f1838'); for(let i=0;i<Math.floor(h/8);i++) for(let j=0;j<Math.floor(w/6);j++) if(rnd()<0.35) R(x+2+j*6,224-h+i*8,2,3,rnd()<0.2?'#ffd27f':'#8fb4ff'); }
      // Taipei 101
      const cx=240; R(cx-10,60,20,160,'#2a3f6b'); for(let i=0;i<8;i++){ const y=80+i*17; R(cx-16,y,32,14,'#315a8a'); R(cx-17,y+12,34,3,'#3f7ab5'); for(let j=0;j<5;j++) R(cx-13+j*6,y+3,2,6,'#bfe3ff'); }
      R(cx-8,64,16,16,'#315a8a'); R(cx-5,50,10,14,'#3f7ab5'); R(cx-1,20,2,30,'#9fd4ff'); R(cx-1,16,2,2,'#ff5252'); R(cx-24,218,48,6,'#2a3f6b'); },
    g=>{ // night market mid: lantern strings + stalls silhouettes
      for(let x=0;x<W;x+=48){ g.strokeStyle='#4a2a5a'; g.lineWidth=1; g.beginPath(); g.moveTo(x,120); g.quadraticCurveTo(x+24,132,x+48,120); g.stroke(); R(x+10,124,6,8,'#c62828'); R(x+34,126,6,8,'#f9a825'); RA(x+8,122,10,12,'#ff8a65',0.12); }
      for(let x=20;x<W;x+=160){ R(x,196,50,28,'#2e1a3a'); R(x-4,190,58,6,'#4a2a5a'); R(x+6,200,10,8,'#f9a825'); R(x+30,200,10,8,'#ff7043'); } } ],
  t1:[ g=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#3b1f6b'); gr.addColorStop(0.45,'#d2527f'); gr.addColorStop(0.75,'#ff9a5c'); gr.addColorStop(1,'#ffd27f'); g.fillStyle=gr; g.fillRect(0,0,W,H); circ(120,150,22,'#fff1b8'); for(let i=0;i<20;i++) R(rnd()*W,rnd()*60,1,1,'#fff'); },
    g=>{ // sea + MBS + Merlion + Flyer
      R(0,166,W,60,'#2c6e9e'); for(let i=0;i<40;i++) R(rnd()*W,168+rnd()*50,6,1,'#5ab0e0');
      // Singapore Flyer
      g.strokeStyle='#eee'; g.lineWidth=1; g.beginPath(); g.arc(60,120,34,0,Math.PI*2); g.stroke(); for(let i=0;i<12;i++){ const a=i*Math.PI/6; g.beginPath(); g.moveTo(60,120); g.lineTo(60+Math.cos(a)*34,120+Math.sin(a)*34); g.stroke(); R(58+Math.cos(a)*34,118+Math.sin(a)*34,4,4,'#fff'); } R(58,120,4,50,'#ddd');
      // Marina Bay Sands
      for(let i=0;i<3;i++){ const x=300+i*42; R(x,96,26,74,'#dfe6ee'); for(let r=0;r<9;r++) for(let c=0;c<3;c++) R(x+3+c*8,100+r*8,4,4,'#7fb3d5'); } R(292,86,130,10,'#c9d6e2'); R(288,80,140,8,'#e8eef4'); g.fillStyle='#2e7d32'; g.fillRect(300,76,100,4);
      // Merlion
      const mx=210; R(mx-8,140,16,30,'#f5f5f5'); R(mx-10,134,20,8,'#eeeeee'); R(mx-2,116,22,24,'#fafafa'); R(mx+6,112,16,14,'#f5f5f5'); R(mx+16,118,3,3,'#333'); R(mx+4,108,8,6,'#e0e0e0'); R(mx-6,104,10,8,'#e0e0e0'); g.strokeStyle='#8fd3ff'; g.lineWidth=2; g.beginPath(); g.moveTo(mx+22,124); g.quadraticCurveTo(mx+44,118,mx+52,168); g.stroke(); R(mx-20,168,56,8,'#b0bec5'); },
    g=>{ // palms + rail
      R(0,214,W,3,'#8d6e63'); for(let x=0;x<W;x+=24) R(x,214,2,12,'#8d6e63');
      for(let x=40;x<W;x+=120){ R(x,160,4,56,'#6d4c41'); g.strokeStyle='#1b5e20'; g.lineWidth=4; for(let i=0;i<5;i++){ const a=-Math.PI*0.9+i*Math.PI*0.2; g.beginPath(); g.moveTo(x+2,160); g.quadraticCurveTo(x+2+Math.cos(a)*18,150+Math.sin(a)*8,x+2+Math.cos(a)*30,170+Math.sin(a)*6); g.stroke(); } } } ],
  t2:[ g=>{ R(0,0,W,H,'#03030a'); for(let i=0;i<140;i++){ const b=rnd(); R(rnd()*W,rnd()*H,b<0.1?2:1,b<0.1?2:1,b<0.5?'#fff':b<0.8?'#bcd':'#ffe9a8'); }
      // Earth
      const ex=380,ey=70; circ(ex,ey,30,'#1565c0'); g.save(); g.beginPath(); g.arc(ex,ey,30,0,Math.PI*2); g.clip(); R(ex-26,ey-18,18,12,'#2e7d32'); R(ex-10,ey-4,22,16,'#388e3c'); R(ex+4,ey-24,14,10,'#2e7d32'); R(ex-22,ey+8,12,8,'#43a047'); for(let i=0;i<18;i++) RA(ex-30+rnd()*60,ey-30+rnd()*60,10+rnd()*12,3,'#fff',0.7); RA(ex+6,ey-30,30,60,'#000',0.45); g.restore(); },
    g=>{ g.fillStyle='#2b2e36'; g.beginPath(); g.moveTo(0,190); for(let x=0;x<=W;x+=16){ g.lineTo(x,180+Math.sin(x/29)*10+Math.sin(x/7)*3);} g.lineTo(W,H); g.lineTo(0,H); g.fill();
      for(let i=0;i<6;i++){ const x=rnd()*W,y=195+rnd()*25; g.fillStyle='#1f2229'; g.beginPath(); g.ellipse(x,y,12+rnd()*10,3,0,0,Math.PI*2); g.fill(); }
      // space station
      R(80,60,40,6,'#90a4ae'); R(70,56,8,14,'#1e88e5'); R(122,56,8,14,'#1e88e5'); R(96,54,8,18,'#cfd8dc'); },
    g=>{ g.fillStyle='#3a3e48'; g.beginPath(); g.moveTo(0,215); for(let x=0;x<=W;x+=12){ g.lineTo(x,208+Math.sin(x/17)*5);} g.lineTo(W,H); g.lineTo(0,H); g.fill(); for(let i=0;i<10;i++){ const x=rnd()*W; R(x,212+rnd()*8,6+rnd()*8,4,'#4e535e'); } } ],
};
