'use strict';
// ===== Web Audio chiptune engine (no external files) =====
const AudioSys = (() => {
  let ctx = null, master, bgmG, sfxG;
  let cur = null, timer = null, step = 0, nextT = 0, songName = null;
  const SEMI = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
  function freq(n){ const m=/^([A-G][#b]?)(\d)$/.exec(n); if(!m) return 0; return 440*Math.pow(2,(SEMI[m[1]]+(+m[2]-4)*12-9)/12); }
  function parse(str){ // "C5 E5:2 - G5" -> array per 8th step
    const out=[]; str.split(/\s+/).filter(Boolean).forEach(tok=>{ if(tok==='|') return; const [n,l]=tok.split(':'); const len=+(l||1); out.push(n==='-'?null:{f:freq(n),len}); for(let i=1;i<len;i++) out.push(undefined); }); return out; }
  function init(){ if(ctx) return; try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
    master=ctx.createGain(); master.gain.value=0.55; master.connect(ctx.destination);
    bgmG=ctx.createGain(); bgmG.gain.value=0.28; bgmG.connect(master);
    sfxG=ctx.createGain(); sfxG.gain.value=0.5; sfxG.connect(master);
    if(songName) play(songName, true); }
  function resume(){ if(ctx && ctx.state==='suspended') ctx.resume(); }
  function osc(type,f,t0,dur,vol,dest,f2){ if(!ctx||f<=0) return; const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(Math.max(1,f2),t0+dur); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(0.001,t0+dur); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0+dur+0.03); }
  function noise(t0,dur,vol,dest,hp){ if(!ctx) return; const n=Math.floor(ctx.sampleRate*dur); const b=ctx.createBuffer(1,n,ctx.sampleRate); const d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1; const s=ctx.createBufferSource(); s.buffer=b; const g=ctx.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(0.001,t0+dur); let node=s; if(hp){ const f=ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp; s.connect(f); node=f; } node.connect(g); g.connect(dest); s.start(t0); }

  // ---------- SONGS (8th-note steps) ----------
  const SONGS = {
    title: { bpm:92, lead:'A4:2 C5:2 E5:2 A5:2 G5:4 E5:4 F5:2 E5:2 D5:2 C5:2 D5:4 E5:4 A4:2 C5:2 E5:2 A5:2 B5:4 G5:4 A5:2 G5:2 E5:2 C5:2 A4:8',
      bass:'A2:8 F2:8 D2:8 E2:8 A2:8 F2:8 D2:8 E2:8', drum:'k - - - s - h -', lt:'triangle' },
    taiwan: { bpm:150, lead:'E5 G5 C6 G5 E5 G5 A5 G5 F5 A5 C6 A5 F5 A5 G5 F5 E5 G5 C6 G5 E5 G5 A5 B5 C6:2 G5:2 E5:2 C5:2 D5 F5 A5 F5 D5 F5 G5 F5 E5 G5 C6 G5 E5 G5 A5 G5 F5 A5 C6 A5 G5 F5 E5 D5 C5:4 G5:2 C6:2',
      bass:'C3 - C3 G2 C3 - G2 - F2 - F2 C3 F2 - C3 - C3 - C3 G2 C3 - G2 - A2 - A2 E2 A2 - E2 - D2 - D2 A2 D2 - A2 - C3 - C3 G2 C3 - G2 - F2 - F2 C3 G2 - G2 - C3 - C3 - C3 - C3 -', drum:'k - h - s - h h', lt:'square' },
    singapore: { bpm:138, lead:'F5 - A5 C6 - A5 F5 - G5 - Bb5 D6 - Bb5 G5 - A5 - C6 E6 - C6 A5 - F6:2 E6:2 C6:2 A5:2 F5 - A5 C6 - A5 F5 - G5 - Bb5 D6 - Bb5 G5 - A5 C6 F6 E6 D6 C6 A5 G5 F5:4 -:2 C6:2',
      bass:'F2 - F2 - C3 - F2 - G2 - G2 - D3 - G2 - A2 - A2 - E3 - A2 - F2 - C3 - F2 - C3 - F2 - F2 - C3 - F2 - G2 - G2 - D3 - G2 - A2 - A2 - E3 - A2 - F2 - C3 - F2 - F2 -', drum:'k - h k - k h -', lt:'square' },
    moon: { bpm:104, lead:'D5:3 A5:1 F5:2 D5:2 E5:3 G5:1 E5:2 C5:2 D5:3 A5:1 F5:2 A5:2 Bb5:4 A5:4 D5:3 A5:1 F5:2 D5:2 E5:3 G5:1 E5:2 C5:2 F5:2 G5:2 A5:2 C6:2 D6:8',
      bass:'D2:4 A2:4 C3:4 G2:4 D2:4 A2:4 Bb2:4 A2:4 D2:4 A2:4 C3:4 G2:4 F2:4 G2:4 D3:8', drum:'k - - - s - - h', lt:'triangle' },
    boss: { bpm:172, lead:'E4 B4 E5 B4 E4 B4 E5 G5 C5 G5 C6 G5 C5 G5 C6 D6 E5 B4 E5 B4 G5 F#5 E5 D5 B4 D5 F#5 B5 A5 F#5 D5 B4 E4 B4 E5 B4 E4 B4 E5 G5 C5 G5 C6 G5 C5 G5 C6 D6 E5 G5 B5 E6 D6 B5 G5 E5 F#5 D5 B4 F#4 B4:2 E5:2',
      bass:'E2 E2 E3 E2 E2 E2 E3 E2 C2 C2 C3 C2 C2 C2 C3 C2 E2 E2 E3 E2 E2 E2 E3 E2 B1 B1 B2 B1 B1 B1 B2 B1 E2 E2 E3 E2 E2 E2 E3 E2 C2 C2 C3 C2 C2 C2 C3 C2 E2 E2 E3 E2 G2 G2 G3 G2 B1 B1 B2 B1 B1 B1 B2 B1', drum:'k h s h k k s h', lt:'sawtooth' },
    reunion: { bpm:88, lead:'G4:2 B4:2 D5:4 B4:2 D5:2 G5:4 F#5:2 E5:2 D5:2 B4:2 A4:8 G4:2 B4:2 D5:4 E5:2 D5:2 B4:4 C5:2 B4:2 A4:2 B4:2 G4:8',
      bass:'G2:8 D2:8 E2:8 D2:8 G2:8 C3:8 D2:8 G2:8', drum:'- - - - - - - -', lt:'triangle' },
    birthday: { bpm:120, lead:'G4 G4 A4:2 G4:2 C5:2 B4:4 G4 G4 A4:2 G4:2 D5:2 C5:4 G4 G4 G5:2 E5:2 C5:2 B4:2 A4:2 F5 F5 E5:2 C5:2 D5:2 C5:4',
      bass:'C3:6 C3:6 G2:6 C3:6 C3:6 F2:6 G2:6 C3:6', drum:'- - - - - -', lt:'triangle' },
    eerie: { bpm:60, lead:'- - - - - - - - E4:4 - - - - Eb4:4 - - - - - - - -', bass:'A1:8 - - - - - - -', drum:'- - - - - - - -', lt:'sine' },
  };
  function play(name, force){ if(!force && songName===name) return; songName=name; stop(true); if(!ctx) return; cur={ name, lead:parse(SONGS[name].lead), bass:parse(SONGS[name].bass), drum:SONGS[name].drum.split(/\s+/).filter(Boolean), bpm:SONGS[name].bpm, lt:SONGS[name].lt||'square' }; step=0; nextT=ctx.currentTime+0.05; timer=setInterval(tick,30); }
  function stop(keepName){ if(timer) clearInterval(timer); timer=null; cur=null; if(!keepName) songName=null; }
  function tick(){ if(!cur||!ctx) return; const spb=60/cur.bpm/2; while(nextT<ctx.currentTime+0.15){ const t=nextT; const L=cur.lead[step%cur.lead.length], B=cur.bass[step%cur.bass.length], D=cur.drum[step%cur.drum.length];
      if(L) osc(cur.lt,L.f,t,spb*L.len*0.9,0.18,bgmG);
      if(B) osc('triangle',B.f,t,spb*B.len*0.95,0.22,bgmG);
      if(D==='k') osc('sine',120,t,0.12,0.5,bgmG,40); else if(D==='s') noise(t,0.1,0.25,bgmG,1200); else if(D==='h') noise(t,0.03,0.08,bgmG,6000);
      nextT+=spb; step++; } }

  // ---------- SFX ----------
  const SFX = {
    jump(){ osc('square',300,ctx.currentTime,0.12,0.25,sfxG,700); },
    djump(){ osc('square',500,ctx.currentTime,0.12,0.25,sfxG,1100); },
    attack(){ noise(ctx.currentTime,0.08,0.3,sfxG,2500); osc('square',900,ctx.currentTime,0.06,0.15,sfxG,300); },
    hit(){ osc('square',200,ctx.currentTime,0.08,0.3,sfxG,80); noise(ctx.currentTime,0.06,0.2,sfxG,800); },
    hurt(){ osc('sawtooth',250,ctx.currentTime,0.25,0.35,sfxG,60); },
    die(){ for(let i=0;i<4;i++) osc('square',400-i*80,ctx.currentTime+i*0.12,0.14,0.3,sfxG,100); },
    enemyDie(){ noise(ctx.currentTime,0.2,0.3,sfxG,400); osc('square',150,ctx.currentTime,0.2,0.2,sfxG,40); },
    dash(){ osc('sine',1200,ctx.currentTime,0.15,0.2,sfxG,200); noise(ctx.currentTime,0.1,0.1,sfxG,3000); },
    ult(){ const t=ctx.currentTime; for(let i=0;i<8;i++) osc('square',220*(1+i*0.25),t+i*0.05,0.4,0.2,sfxG); noise(t,0.6,0.3,sfxG,500); },
    pickup(){ osc('square',880,ctx.currentTime,0.08,0.2,sfxG); osc('square',1320,ctx.currentTime+0.08,0.12,0.2,sfxG); },
    select(){ osc('square',660,ctx.currentTime,0.06,0.2,sfxG); osc('square',990,ctx.currentTime+0.06,0.1,0.2,sfxG); },
    move(){ osc('square',500,ctx.currentTime,0.04,0.15,sfxG); },
    blip(){ osc('square',1000,ctx.currentTime,0.02,0.05,sfxG); },
    teleport(){ const t=ctx.currentTime; for(let i=0;i<12;i++) osc('sine',300+i*120,t+i*0.04,0.3,0.15,sfxG,300+i*240); noise(t+0.4,0.5,0.25,sfxG,2000); },
    bossHit(){ osc('square',120,ctx.currentTime,0.1,0.3,sfxG,60); noise(ctx.currentTime,0.08,0.2,sfxG,1000); },
    bossDie(){ const t=ctx.currentTime; for(let i=0;i<10;i++){ noise(t+i*0.12,0.3,0.35,sfxG,200+i*100); osc('sawtooth',100-i*5,t+i*0.12,0.3,0.25,sfxG,30);} },
    shoot(){ osc('square',700,ctx.currentTime,0.1,0.15,sfxG,200); },
    stomp(){ osc('sine',80,ctx.currentTime,0.3,0.5,sfxG,30); noise(ctx.currentTime,0.2,0.3,sfxG,300); },
    shatter(){ const t=ctx.currentTime; for(let i=0;i<6;i++) osc('triangle',1500+Math.random()*1500,t+i*0.05,0.3,0.2,sfxG,400); noise(t,0.3,0.3,sfxG,3000); },
    heart(){ const t=ctx.currentTime; [523,659,784,1047].forEach((f,i)=>osc('sine',f,t+i*0.1,0.5,0.2,sfxG)); },
    alarm(){ osc('square',440,ctx.currentTime,0.3,0.2,sfxG,445); },
  };
  function sfx(n){ if(!ctx) return; try{ SFX[n] && SFX[n](); }catch(e){} }
  return { init, resume, play, stop, sfx, get ready(){ return !!ctx; } };
})();
