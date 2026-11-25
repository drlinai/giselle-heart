'use strict';
// ===== Characters & enemy sprites (procedural pixel drawing) =====
const CHARS = {
  giselle:{ headW:8, headH:8, bodyW:8, bodyH:8, legH:9, skin:'#ffdcc2', hair:'#3d8bff', hair2:'#a9dcff', hairStyle:'long', top:'#ffffff', topAcc:'#ff7fb0', bottom:'#ff7fb0', skirt:true, shoe:'#d43f78', sparkle:true, eye:'#2a4a9a', name:'Giselle' },
  william:{ headW:8, headH:8, bodyW:10, bodyH:10, legH:10, skin:'#f2c9a6', hair:'#2a1a10', hairStyle:'short', top:'#1f2f6b', collar:'#3a4f9a', bottom:'#182452', shoe:'#111', eye:'#222', name:'William' },
  liam:{ headW:7, headH:7, bodyW:7, bodyH:6, legH:7, skin:'#f7d2b2', hair:'#5a3a20', hairStyle:'short', top:'#2e9e4f', collar:'#1e7a3a', bottom:'#3b6fb0', shoe:'#333', eye:'#222', name:'Liam' },
  rex:{ headW:8, headH:7, bodyW:6, bodyH:4, legH:3, skin:'#fbdcc4', hair:'#6b4a2a', hairStyle:'baby', top:null, bottom:'#ffffff', diaper:true, shoe:null, eye:'#222', name:'Rex' },
};
// o: {face, walk(phase), jump, attack(0..1), t, flash, arms:'up'|'hug', lie, sit, alpha, happy}
function drawChar(name,x,y,o={}){
  const s=CHARS[name], t=o.t||0, face=o.face||1;
  const C=c=>o.flash?'#ffffff':c;
  ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(o.alpha!=null) ctx.globalAlpha=o.alpha;
  if(o.lie){ ctx.rotate(Math.PI/2*face); } else if(face<0) ctx.scale(-1,1);
  const lh=s.legH, bh=s.bodyH, hh=s.headH, hw=s.headW, bw=s.bodyW;
  const bob=(o.walk==null && !o.jump && Math.floor(t/28)%2===1)?1:0;
  const legY=-lh, bodyY=-lh-bh+bob, headY=-lh-bh-hh+bob;
  const sw=o.walk!=null?Math.sin(o.walk)*3:0;
  // --- back hair ---
  if(s.hairStyle==='long'){
    const sway=Math.round(Math.sin(t/10)*1.2); const trail=(o.walk!=null||o.jump)?3:1;
    R(-hw/2-1,headY+2,hw+2,hh+bh+1,C(s.hair));
    R(-hw/2-1-trail+sway,headY+5,trail+2,bh+hh-3,C(s.hair));
    R(-hw/2-1-trail+sway,headY+hh+bh-3,trail+3,3,C(s.hair));
    if(s.sparkle && !o.flash){ for(let i=0;i<3;i++){ const k=(Math.floor(t/6)+i*7)%17; const sx=-hw/2-trail+ (k*5)%(hw+trail+1), sy=headY+3+(k*3)%(hh+bh-2); if((k+Math.floor(t/6))%3===0) sparkle(sx,sy,1,'#ffffff'); else R(sx,sy,1,1,s.hair2); } }
  }
  // --- legs ---
  const legC=C(s.skirt||s.diaper?s.skin:s.bottom);
  if(o.sit){ R(-2,legY-2,2,lh-1,legC); R(0,-3,lh,3,legC); R(1,-3,lh-1,3,legC); if(s.shoe) R(lh-2,-3,3,3,C(s.shoe)); }
  else if(o.jump){ R(-3,legY,3,lh-3,legC); R(1,legY,3,lh-1,legC); if(s.shoe){ R(-3,legY+lh-5,3,2,C(s.shoe)); R(1,legY+lh-3,4,2,C(s.shoe)); } }
  else { R(-3+sw,legY,3,lh,legC); R(1-sw,legY,3,lh,legC); if(s.shoe){ R(-3+sw,-2,4,2,C(s.shoe)); R(1-sw,-2,4,2,C(s.shoe)); } }
  if(s.diaper){ R(-bw/2-1,legY-2,bw+2,4,C('#ffffff')); R(-bw/2,legY+1,bw,1,C('#e8e8f0')); R(1,legY-1,1,1,C('#ffd27f')); }
  // --- body ---
  if(s.top){ R(-bw/2,bodyY,bw,bh,C(s.top)); if(s.collar){ R(-2,bodyY,4,2,C(s.collar)); R(-1,bodyY+2,2,2,C(s.collar)); } if(s.topAcc){ R(-bw/2,bodyY+bh-2,bw,2,C(s.topAcc)); R(-1,bodyY+1,2,1,C(s.topAcc)); } }
  else { R(-bw/2,bodyY,bw,bh,C(s.skin)); R(0,bodyY+bh-2,1,1,C('#e8b89a')); }
  if(s.skirt){ const sk=C(s.bottom); R(-bw/2-1,bodyY+bh-1,bw+2,3,sk); R(-bw/2-2,bodyY+bh+2,bw+4,2,sk); R(-bw/2-3+(o.walk!=null?-1:0),bodyY+bh+4,bw+6+(o.walk!=null?1:0),2,sk); R(-bw/2-3,bodyY+bh+6,bw+6,1,C('#ffb3d1')); }
  // --- arms ---
  const armC=C(s.top||s.skin), handC=C(s.skin); const armL=bh-2;
  if(o.attack!=null){ const ph=o.attack; const ex=ph<0.3?2:6; R(bw/2-1,bodyY+2,ex,2,armC); R(bw/2-1+ex,bodyY+2,2,2,handC); R(-bw/2-2,bodyY+2,2,armL-2,armC); }
  else if(o.arms==='up'){ R(-bw/2-2,bodyY-4,2,6,armC); R(bw/2,bodyY-4,2,6,armC); R(-bw/2-2,bodyY-6,2,2,handC); R(bw/2,bodyY-6,2,2,handC); }
  else if(o.arms==='hug'){ R(bw/2,bodyY+1,5,2,armC); R(bw/2+5,bodyY+1,2,2,handC); R(bw/2,bodyY+4,5,2,armC); R(bw/2+5,bodyY+4,2,2,handC); }
  else if(o.sit){ R(bw/2-1,bodyY+2,2,bh-3,armC); R(bw/2-1,bodyY+bh-1,2,2,handC); }
  else { const as=o.walk!=null?Math.round(sw*0.7):0; R(-bw/2-2,bodyY+1+Math.max(0,-as),2,armL,armC); R(bw/2,bodyY+1+Math.max(0,as),2,armL,armC); R(-bw/2-2,bodyY+1+armL+Math.max(0,-as),2,2,handC); R(bw/2,bodyY+1+armL+Math.max(0,as),2,2,handC); }
  // --- head ---
  R(-hw/2,headY,hw,hh,C(s.skin));
  if(s.hairStyle==='long'){ R(-hw/2-1,headY-1,hw+2,3,C(s.hair)); R(-hw/2-1,headY+2,2,3,C(s.hair)); R(hw/2-2,headY+2,1,1,C(s.hair)); R(-hw/2+1,headY-2,hw-1,1,C(s.hair2)); }
  else if(s.hairStyle==='short'){ R(-hw/2-1,headY-1,hw+2,3,C(s.hair)); R(-hw/2-1,headY+2,2,3,C(s.hair)); R(-hw/2,headY-2,hw-2,1,C(s.hair)); }
  else { R(-1,headY-2,2,2,C(s.hair)); R(0,headY-3,1,1,C(s.hair)); R(-hw/2,headY,hw,1,C(s.hair)); }
  // face
  const ey=headY+Math.floor(hh/2)-1;
  if(o.sleep){ R(hw/2-3,ey+1,2,1,C('#333')); }
  else if(o.happy){ R(hw/2-3,ey,1,1,C(s.eye)); R(hw/2-4,ey+1,1,1,C(s.eye)); R(hw/2-2,ey+1,1,1,C(s.eye)); R(hw/2-3,ey+3,2,1,C('#c0392b')); }
  else { R(hw/2-3,ey,1,2,C(s.eye)); if(!o.walk && s.name==='Rex') R(hw/2-4,ey+2,1,1,C('#f9a8c0')); }
  if(s.name==='Rex' || s.name==='Giselle') R(hw/2-5,ey+2,1,1,C('#ffb6c1'));
  ctx.restore();
}
// Heart blade slash (in front of Giselle), ph 0..1
function drawSlash(x,y,face,ph){
  ctx.save(); ctx.translate(x,y); if(face<0) ctx.scale(-1,1);
  const a0=-1.4+ph*0.4, a1=a0+1.1+ph*0.6; const r=15+ph*4;
  ctx.strokeStyle='#ff9ecb'; ctx.lineWidth=4; ctx.globalAlpha=1-ph*0.5; ctx.beginPath(); ctx.arc(2,-14,r,a0-0.2,a1-0.2); ctx.stroke();
  ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(2,-14,r,a0,a1); ctx.stroke();
  const hx=2+Math.cos(a1)*r, hy=-14+Math.sin(a1)*r; heartShape(hx,hy-2,3,'#ff6b9d');
  ctx.restore();
}
// ---- enemies: kind walker/flyer/shooter, theme 0/1/2 ----
function drawEnemy(kind,theme,x,y,t,face,flash){
  ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(face<0) ctx.scale(-1,1);
  const C=c=>flash?'#fff':c; const w=Math.round(Math.sin(t/6)*2);
  if(kind==='walker'){
    if(theme===0){ // boba cup monster
      R(-6,-14,12,12,C('#d9a066')); R(-6,-14,12,3,C('#f0d2a8')); R(-7,-15,14,2,C('#eee')); R(0,-20,2,6,C('#ff6b9d'));
      R(-4,-5,2,2,C('#3a2a1a')); R(0,-6,2,2,C('#3a2a1a')); R(3,-4,2,2,C('#3a2a1a')); R(-3,-10,2,2,C('#fff')); R(2,-10,2,2,C('#fff')); R(-2,-9,1,1,C('#000')); R(3,-9,1,1,C('#000'));
      R(-5+w,-2,3,2,C('#3a2a1a')); R(2-w,-2,3,2,C('#3a2a1a'));
    } else if(theme===1){ // stone lion
      R(-7,-10,14,8,C('#9aa0a6')); R(2,-14,8,8,C('#aab0b6')); R(1,-16,10,3,C('#7f868c')); R(-8,-12,3,3,C('#7f868c')); R(-8,-8,3,3,C('#7f868c'));
      R(6,-11,2,2,C('#c0392b')); R(4,-8,5,2,C('#6c7278')); R(-6+w,-2,3,2,C('#6c7278')); R(-1-w,-2,3,2,C('#6c7278')); R(4+w,-2,3,2,C('#6c7278'));
    } else { // moon rock
      R(-7,-12,14,10,C('#8a8f99')); R(-5,-14,10,2,C('#a4a9b3')); R(-8,-9,1,5,C('#a4a9b3')); R(-3,-8,2,2,C('#ff5252')); R(2,-8,2,2,C('#ff5252')); R(-4,-5,8,1,C('#4b4f58'));
      R(-5+w,-2,3,2,C('#5c6069')); R(2-w,-2,3,2,C('#5c6069'));
    }
  } else if(kind==='flyer'){
    const f=Math.round(Math.sin(t/4)*1.5);
    if(theme===0){ // lantern ghost
      RA(-9,-14,18,16,'#ff3b3b',flash?1:0.25); R(-6,-16,12,14,C('#e8302a')); R(-7,-13,14,8,C('#ff5a4f')); R(-3,-18,6,2,C('#f1c40f')); R(-3,-2,6,2,C('#f1c40f')); R(-1,0,2,4+f,C('#f1c40f'));
      R(-4,-11,2,3,C('#2a0a0a')); R(2,-11,2,3,C('#2a0a0a')); R(-2,-6,4,1,C('#2a0a0a'));
    } else if(theme===1){ // durian
      R(-6,-13,12,11,C('#7fb04a')); R(-4,-15,8,2,C('#7fb04a')); R(-8,-10,2,6,C('#7fb04a')); R(6,-10,2,6,C('#7fb04a'));
      for(let i=0;i<5;i++){ R(-6+i*3,-16+(i%2),1,2,C('#c8e07a')); } R(-9,-8,1,2,C('#c8e07a')); R(8,-8,1,2,C('#c8e07a')); R(-3,-9,2,2,C('#222')); R(2,-9,2,2,C('#222')); R(-1,-5,2,1,C('#222')); R(-1,-18,2,3,C('#5a3a20'));
    } else { // UFO
      R(-10,-8,20,4,C('#b8c0cc')); R(-12,-6,24,3,C('#8a96a8')); R(-5,-13,10,5,C('#9fe8ff')); R(-3,-15,6,2,C('#9fe8ff')); R(-1,-10,2,2,C('#4a9')); 
      for(let i=0;i<4;i++) R(-9+i*6,-4,2,1,C(((Math.floor(t/8)+i)%2)?'#ff5252':'#f1c40f'));
    }
  } else { // shooter
    if(theme===0){ // firecracker turret
      R(-7,-6,14,6,C('#8b1a1a')); R(-6,-16,12,10,C('#e02424')); R(-6,-16,12,2,C('#f1c40f')); R(-6,-9,12,1,C('#f1c40f')); R(-1,-21,2,5,C('#c9a66b')); if((t>>2)&1) sparkle(0,-22,1,'#ffd27f');
      R(5,-14,6,4,C('#c0392b')); R(-3,-13,2,2,C('#222')); R(1,-13,2,2,C('#222'));
    } else if(theme===1){ // mini merlion
      R(-6,-4,12,4,C('#cfd8dc')); R(-4,-12,8,8,C('#eceff1')); R(-3,-18,8,7,C('#eceff1')); R(-5,-17,3,5,C('#b0bec5')); R(2,-16,2,2,C('#222')); R(3,-13,3,2,C('#90a4ae')); R(-3,-19,7,1,C('#b0bec5'));
    } else { // alien cannon
      R(-7,-3,3,3,C('#5e35b1')); R(4,-3,3,3,C('#5e35b1')); R(-2,-4,4,4,C('#5e35b1')); R(-6,-10,12,6,C('#7e57c2')); R(-4,-12,8,2,C('#9575cd')); R(4,-9,7,3,C('#4527a0')); R(-3,-9,2,2,C(((t>>3)&1)?'#00e676':'#004d40')); R(1,-9,2,2,C(((t>>3)&1)?'#00e676':'#004d40'));
    }
  }
  ctx.restore();
}
function drawProjectile(p,t){
  const x=p.x,y=p.y;
  if(p.kind==='spark'){ circ(x,y,p.r,'#ffb347'); R(x-1,y-1,2,2,'#fff'); if((t&1)) sparkle(x,y,p.r+1,'#ffe082'); }
  else if(p.kind==='water'){ circ(x,y,p.r,'#4fc3f7'); circ(x-1,y-1,p.r*0.5,'#b3e5fc'); }
  else if(p.kind==='orb'){ circ(x,y,p.r+1,'#4a148c'); circ(x,y,p.r,'#8e24aa'); circ(x,y,p.r*0.4,'#f3e5f5'); }
  else if(p.kind==='wave'){ R(x-4,y-6,8,6,'#ffd27f'); R(x-6,y-3,12,3,'#ff9800'); R(x-3,y-9,6,3,'#fff3c4'); }
  else if(p.kind==='rock'){ R(x-3,y-3,6,6,'#8a8f99'); R(x-2,y-4,4,1,'#b0b5bf'); }
  else if(p.kind==='laser'){ ctx.globalAlpha=0.9; R(p.x0,y-1,p.len,3,'#ff1744'); R(p.x0,y,p.len,1,'#fff'); ctx.globalAlpha=1; }
  else if(p.kind==='bolt'){ R(x-3,y-1,6,2,'#00e676'); R(x-1,y-2,2,4,'#b9f6ca'); }
}
function drawHeartPickup(x,y,t){ const b=Math.sin(t/10)*1.5; heartShape(x,y-6+b,4,'#ff4d79'); R(x-2,y-7+b,1,1,'#fff'); }
function drawCheckpoint(x,y,active,t){ R(x-1,y-28,2,28,'#c9a66b'); const wv=Math.sin(t/8)*1; R(x+1,y-27,12+wv,8,active?'#ff6b9d':'#777'); if(active) heartShape(x+7,y-25,2,'#fff'); }
function drawNote(x,y){ R(x,y,12,9,'#fdf6e3'); R(x+2,y+2,8,1,'#999'); R(x+2,y+4,8,1,'#999'); R(x+2,y+6,5,1,'#999'); }
function drawCage(x,y,t,broken){ // crystal cage, bottom-center x,y
  if(broken) return;
  ctx.save(); ctx.globalAlpha=0.55; R(x-16,y-44,32,44,'#b388ff'); ctx.globalAlpha=0.9; R(x-16,y-44,32,2,'#e1bee7'); R(x-16,y-2,32,2,'#e1bee7');
  for(let i=0;i<5;i++) R(x-15+i*7,y-44,2,44,'#ede7f6'); ctx.globalAlpha=0.5; if((t>>3)&1) sparkle(x+8,y-30,2,'#fff'); else sparkle(x-6,y-16,2,'#fff'); ctx.restore();
}
