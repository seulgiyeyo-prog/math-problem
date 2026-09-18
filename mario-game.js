// ============================================================
//  마리오 플랫포머 — 좌우 이동 + 점프 풀컨트롤
//  ← → / A D : 이동   Space / ↑ / W : 점프 (2단 점프 가능)
// ============================================================
'use strict';

// ── Web Audio ─────────────────────────────────────────────────
const SFX = {
  ctx: null, bgTimer: null,
  init() { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} },
  resume() { if (this.ctx?.state === 'suspended') this.ctx.resume(); },
  _tone(f,s,d,type='square',vol=0.18) {
    if (!this.ctx) return;
    const t=this.ctx.currentTime+s, o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type=type; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+d);
    o.start(t); o.stop(t+d+0.01);
  },
  _sweep(f1,f2,d,type='square',vol=0.22) {
    if (!this.ctx) return; this.resume();
    const t=this.ctx.currentTime, o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type=type; o.frequency.setValueAtTime(f1,t); o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+d);
    o.start(t); o.stop(t+d+0.01);
  },
  jump()  { this.resume(); this._sweep(240,700,0.11); },
  djump() { this.resume(); this._sweep(320,950,0.09); },
  coin()  { this.resume(); this._tone(988,0,0.06); this._tone(1319,0.06,0.17); },
  stomp() { this.resume(); this._sweep(300,70,0.1); },
  bump()  { this.resume(); this._sweep(160,60,0.08); },
  flagGrab() { this.resume(); this.stopBg(); this._sweep(420,980,0.22,'sine',0.24); },
  flagDown() {
    this.resume();
    [[392,0,0.1],[330,0.1,0.1],[262,0.2,0.16]].forEach(([f,t,d])=>this._tone(f,t,d,'square',0.2));
  },
  die() {
    this.resume(); this.stopBg();
    [[440,0,0.09],[440,0.11,0.09],[440,0.22,0.09],[349,0.33,0.1],[440,0.45,0.09],[392,0.58,0.18]]
      .forEach(([f,t,d]) => this._tone(f,t,d,'square',0.28));
  },
  victory() {
    this.resume(); this.stopBg();
    [[523,0,0.14],[659,0.15,0.14],[784,0.3,0.14],[1047,0.45,0.25],[784,0.72,0.12],[1047,0.86,0.3]]
      .forEach(([f,t,d]) => this._tone(f,t,d,'square',0.28));
  },
  startBg() {
    this.resume();
    const M = [
      [659,0.15],[0,0.08],[659,0.15],[0,0.13],[659,0.15],[0,0.13],
      [523,0.15],[659,0.15],[0,0.13],[784,0.28],[0,0.28],[392,0.28],[0,0.28],
      [523,0.28],[0,0.13],[392,0.28],[0,0.13],[330,0.42],[0,0.08],
      [440,0.14],[0,0.06],[494,0.14],[0,0.06],[466,0.14],[0,0.04],[440,0.14],[0,0.12],
      [392,0.14],[659,0.14],[784,0.14],[880,0.14],[698,0.14],[784,0.14],
      [0,0.13],[659,0.18],[0,0.05],[523,0.14],[0,0.05],[587,0.14],[0,0.05],[494,0.18],[0,0.08],
      [523,0.28],[0,0.13],[392,0.28],[0,0.13],[330,0.42],[0,0.08],
      [440,0.14],[0,0.06],[494,0.14],[0,0.06],[466,0.14],[0,0.04],[440,0.14],[0,0.12],
      [392,0.14],[659,0.14],[784,0.14],[880,0.14],[698,0.14],[784,0.14],
      [0,0.13],[659,0.18],[0,0.05],[523,0.14],[0,0.05],[587,0.14],[0,0.05],[494,0.22],
    ];
    const total = M.reduce((s,[,d])=>s+d,0);
    const play = () => {
      if(!this.ctx) return;
      let t=0; M.forEach(([f,d]) => { if(f) this._tone(f,t,d*0.88,'square',0.13); t+=d; });
      this.bgTimer = setTimeout(play, total*1000+300);
    };
    play();
  },
  stopBg() { clearTimeout(this.bgTimer); this.bgTimer=null; }
};

// ── Constants ─────────────────────────────────────────────────
const GRAV    = 0.54;
const MOVE_SP = 4.8;     // 이동 속도
const FRICTION= 0.68;    // 지상 마찰
const JUMP_V  = -13.5;   // 1단 점프
const DJ_V    = -11.0;   // 2단 점프
const T       = 32;      // 타일 크기
const GOAL_C  = 8;       // 목표 코인 수
const SLIDE_SPD = 3.4;   // 깃대를 타고 내려오는 속도
const WALK_SPD  = 2.6;   // 성으로 걸어가는 속도
let   LVL_W   = 72 * T;  // 레벨 폭 (스테이지 생성 시 재계산됨)

// ── Game State ────────────────────────────────────────────────
let _canvas, _ctx;
let _state  = 'idle';
let _camX   = 0;
let _frame  = 0;
let _mario, _plats, _coins, _goombas, _parts, _flagX, _castleX;
let _flagBonus = 0, _walkTimer = 0;
let _animId = null;

// 키 상태
const _keys = {};
// 모바일 터치 상태
let _tLeft=false, _tRight=false;

// ── 마리오 초기화 ─────────────────────────────────────────────
function _initMario() {
  _mario = {
    x:60, y:0, w:26, h:30,
    vx:0, vy:0,
    onGround:false, jumps:0,
    lives:3, score:0, coins:0,
    dead:false, invTimer:0,
    anim:0, animT:0, facing:1,
  };
}

// ── 레벨 생성 ─────────────────────────────────────────────────
function _buildLevel() {
  _plats=[]; _coins=[]; _goombas=[]; _parts=[];
  const H=_canvas.height, GY=H-T;

  const gnd=(sx,n)=>{ for(let i=0;i<n;i++) _plats.push({x:sx+i*T,y:GY,w:T,h:T,type:'g'}); };
  const brk=(sx,sy,n)=>{ for(let i=0;i<n;i++) _plats.push({x:sx+i*T,y:sy,w:T,h:T,type:'b'}); };
  const cn=(x,y)=>_coins.push({x,y,r:9,collected:false,bob:Math.random()*Math.PI*2});
  const gba=(x,y,mn,mx)=>_goombas.push({x,y,w:26,h:26,vx:-1.4,vy:0,dead:false,deadT:0,minX:mn,maxX:mx});

  // ── 구간 0: 시작 안전지대 ──
  gnd(0,11);
  cn(3*T+16,GY-T-10); cn(4*T+16,GY-T-10); cn(5*T+16,GY-T-10);
  brk(3*T,GY-3*T,4);
  cn(3*T+16,GY-4*T-10); cn(4*T+16,GY-4*T-10); cn(5*T+16,GY-4*T-10);
  cn(6*T+16,GY-4*T-10);

  // ── 구간 1: 첫 번째 갭 ──
  // 갭 (x=11T~12T)
  gnd(13*T,7);
  cn(14*T+16,GY-T-10); cn(15*T+16,GY-T-10);
  brk(14*T,GY-3*T,4);
  cn(14*T+16,GY-4*T-10); cn(15*T+16,GY-4*T-10);
  cn(16*T+16,GY-4*T-10); cn(17*T+16,GY-4*T-10);
  gba(15*T,GY-T,13*T,20*T);

  // ── 구간 2: 계단 지형 ──
  gnd(21*T,9);
  // 계단 (올라갔다 내려오기)
  _plats.push({x:22*T,y:GY-T,  w:T,h:T,type:'g'});
  _plats.push({x:23*T,y:GY-2*T,w:T,h:T,type:'g'});
  _plats.push({x:24*T,y:GY-3*T,w:T,h:T,type:'g'});
  _plats.push({x:25*T,y:GY-3*T,w:T,h:T,type:'g'});
  _plats.push({x:26*T,y:GY-2*T,w:T,h:T,type:'g'});
  _plats.push({x:27*T,y:GY-T,  w:T,h:T,type:'g'});
  cn(24*T+16,GY-4*T-10); cn(25*T+16,GY-4*T-10);
  cn(26*T+16,GY-3*T-10);
  gba(23*T,GY-T,21*T,29*T);

  // ── 구간 3: 공중 발판 건너기 ──
  // 갭 (x=31T~33T)
  _plats.push({x:34*T,y:GY-2*T,w:2*T,h:T,type:'b'});
  _plats.push({x:36*T+T/2,y:GY-3*T,w:2*T,h:T,type:'b'});
  gnd(39*T,7);
  cn(34*T+16,GY-3*T-10); cn(35*T+16,GY-3*T-10);
  cn(36*T+T/2+16,GY-4*T-10); cn(37*T+T/2+16,GY-4*T-10);
  cn(40*T+16,GY-T-10); cn(41*T+16,GY-T-10);
  brk(40*T,GY-4*T,3);
  cn(40*T+16,GY-5*T-10); cn(41*T+16,GY-5*T-10); cn(42*T+16,GY-5*T-10);

  // ── 구간 4: 넓은 지형 + 굼바 2마리 ──
  gnd(47*T,10);
  gba(48*T,GY-T,47*T,56*T);
  gba(53*T,GY-T,47*T,56*T);
  brk(48*T,GY-3*T,4);
  cn(48*T+16,GY-4*T-10); cn(49*T+16,GY-4*T-10);
  cn(50*T+16,GY-4*T-10); cn(51*T+16,GY-4*T-10);
  brk(53*T,GY-5*T,3);
  cn(53*T+16,GY-6*T-10); cn(54*T+16,GY-6*T-10); cn(55*T+16,GY-6*T-10);

  // ── 구간 5: 두 번째 갭 ──
  // 갭 (x=58T~60T)
  gnd(61*T,6);
  cn(62*T+16,GY-T-10); cn(63*T+16,GY-T-10);

  // ── 구간 6: 클라이맥스 ──
  gnd(68*T,8);
  gba(69*T,GY-T,68*T,75*T);
  brk(69*T,GY-3*T,5);
  cn(69*T+16,GY-4*T-10); cn(70*T+16,GY-4*T-10); cn(71*T+16,GY-4*T-10);
  cn(72*T+16,GY-4*T-10); cn(73*T+16,GY-4*T-10);
  gba(71*T,GY-3*T,69*T,75*T); // 발판 위 굼바

  // 깃발 + 성 구간 (봉을 잡고 내려온 뒤 성까지 걸어가는 구간)
  _flagX = 76*T;
  gnd(76*T, 20);           // 깃발 착지 지점부터 성 앞까지 이어지는 안전한 땅
  _castleX = 89*T;         // 성(도착 지점) 위치

  LVL_W = _castleX + 8*T;  // 레벨 전체 폭 재계산 (카메라가 성까지 따라오도록)
}

// ── 충돌 ──────────────────────────────────────────────────────
function _aabb(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }

function _resolveY(e,platList) {
  let onGround=false;
  for(const p of platList) {
    if(e.x+e.w<=p.x+2||e.x>=p.x+p.w-2) continue;
    if(e.y+e.h>p.y && e.y<p.y+p.h) {
      const oTop=(e.y+e.h)-p.y, oBot=(p.y+p.h)-e.y;
      if(oTop<oBot+4 && e.vy>=0){ e.y=p.y-e.h; e.vy=0; onGround=true; }
      else if(oBot<oTop && e.vy<0){ e.y=p.y+p.h; e.vy=0; SFX.bump(); }
    }
  }
  return onGround;
}

// ── 업데이트 ──────────────────────────────────────────────────
function _update() {
  if(_state==='playing') { _frame++; _updatePlaying(); }
  else if(_state==='sliding') { _frame++; _updateSliding(); }
  else if(_state==='walking') { _frame++; _updateWalking(); }
}

function _updatePlaying() {
  if(!_mario.dead) {
    // ── 입력 처리 ──
    const goL = _keys['ArrowLeft']  || _keys['KeyA'] || _tLeft;
    const goR = _keys['ArrowRight'] || _keys['KeyD'] || _tRight;

    if(goL && !goR) {
      _mario.vx = -MOVE_SP; _mario.facing=-1;
    } else if(goR && !goL) {
      _mario.vx =  MOVE_SP; _mario.facing= 1;
    } else {
      _mario.vx *= (_mario.onGround ? FRICTION : 0.85);
      if(Math.abs(_mario.vx)<0.4) _mario.vx=0;
    }

    // ── 물리 ──
    _mario.vy += GRAV;
    _mario.x  += _mario.vx;
    _mario.y  += _mario.vy;

    // 왼쪽 경계
    if(_mario.x<0){ _mario.x=0; _mario.vx=0; }

    if(_mario.invTimer>0) _mario.invTimer--;

    // 발판 충돌
    _mario.onGround = _resolveY(_mario, _plats);
    if(_mario.onGround) _mario.jumps=0;

    // 낙사
    if(_mario.y > _canvas.height+80) _triggerDeath();

    // 코인
    for(const c of _coins) {
      if(c.collected) continue;
      c.bob += 0.07;
      const cy=c.y+Math.sin(c.bob)*4;
      if(Math.hypot((_mario.x+_mario.w/2)-c.x, (_mario.y+_mario.h/2)-cy) < _mario.w/2+c.r) {
        c.collected=true; _mario.coins++; _mario.score+=100;
        SFX.coin(); _burst(c.x,c.y,'#FFD700',10);
      }
    }

    // 굼바 충돌
    for(const g of _goombas) {
      if(g.dead) continue;
      if(!_aabb(_mario,g)) continue;
      if(_mario.vy>0 && _mario.y+_mario.h < g.y+g.h*0.55) {
        g.dead=true; g.deadT=50;
        _mario.vy=-8; _mario.score+=200; _mario.jumps=0;
        SFX.stomp(); _burst(g.x+g.w/2,g.y+g.h/2,'#8B4513',8);
      } else if(_mario.invTimer<=0) {
        _triggerDeath();
      }
    }

    // 깃발 봉에 닿으면 → 봉을 잡고 미끄러져 내려오기 시작
    if(!_mario.dead && _mario.x+_mario.w >= _flagX+16) _startFlagSlide();

    // ── 카메라 (부드러운 추적) ──
    const tCam = _mario.x - _canvas.width*0.38;
    _camX += (tCam-_camX)*0.13;
    _camX = Math.max(0, Math.min(_camX, LVL_W-_canvas.width));

    // 애니메이션
    _mario.animT++;
    if(_mario.onGround) {
      if(Math.abs(_mario.vx)>0.5) { if(_mario.animT%6===0) _mario.anim=(_mario.anim+1)%3; }
      else _mario.anim=0;
    } else { _mario.anim=2; }
  }

  // 굼바
  for(const g of _goombas) {
    if(g.dead){ g.deadT--; continue; }
    g.vy+=GRAV; g.y+=g.vy; g.x+=g.vx;
    _resolveY(g,_plats);
    if(g.x<g.minX){g.x=g.minX;g.vx*=-1;}
    if(g.x+g.w>g.maxX){g.x=g.maxX-g.w;g.vx*=-1;}
  }

  // 파티클
  _parts=_parts.filter(p=>p.life>0);
  for(const p of _parts){ p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life--; }
}

// 깃대를 붙잡는 순간 — 높이에 따라 보너스 점수를 주고, 그대로 스르륵 미끄러져 내려온다
function _startFlagSlide() {
  const GY = _canvas.height - T;
  const grabHeight = Math.max(0, GY - _mario.y); // 바닥에서 얼마나 높은 지점을 잡았는지
  _flagBonus = Math.min(800, Math.round(grabHeight * 4));
  _mario.score += _flagBonus;
  _mario.x  = _flagX + 2;
  _mario.vx = 0; _mario.vy = 0;
  _mario.facing = -1;
  SFX.flagGrab();
  _state = 'sliding';
}

function _updateSliding() {
  const GY = _canvas.height - T;
  const bottomY = GY - _mario.h;

  _mario.y = Math.min(bottomY, _mario.y + SLIDE_SPD);
  if(_frame%3===0) _burst(_mario.x+_mario.w/2, _mario.y+2, '#e6e6e6', 1);

  // 카메라는 깃대 근처에 고정
  const tCam = _mario.x - _canvas.width*0.38;
  _camX += (tCam-_camX)*0.13;
  _camX = Math.max(0, Math.min(_camX, LVL_W-_canvas.width));

  if(_mario.y >= bottomY) {
    _mario.onGround = true;
    _startWalking();
  }

  // 파티클
  _parts=_parts.filter(p=>p.life>0);
  for(const p of _parts){ p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life--; }
}

// 깃대에서 내려온 뒤 성 앞까지 자동으로 걸어간다 (클래식 마리오처럼)
function _startWalking() {
  SFX.flagDown();
  _mario.facing = 1;
  _mario.vx = WALK_SPD;
  _walkTimer = 0;
  _state = 'walking';
}

function _updateWalking() {
  _walkTimer++;
  _mario.x += WALK_SPD;
  _mario.animT++;
  if(_mario.animT%6===0) _mario.anim=(_mario.anim+1)%3;

  const tCam = _mario.x - _canvas.width*0.38;
  _camX += (tCam-_camX)*0.13;
  _camX = Math.max(0, Math.min(_camX, LVL_W-_canvas.width));

  if(_mario.x + _mario.w >= _castleX + T*1.3 || _walkTimer > 200) {
    _triggerWin();
  }
}


// ── 렌더링 ────────────────────────────────────────────────────
function _draw() {
  const W=_canvas.width, H=_canvas.height;

  // 하늘
  const sky=_ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#5bacd4'); sky.addColorStop(1,'#b8dff0');
  _ctx.fillStyle=sky; _ctx.fillRect(0,0,W,H);

  _drawClouds(W,H);

  _ctx.save();
  _ctx.translate(-_camX,0);

  // 발판
  for(const p of _plats) {
    if(p.x+p.w<_camX-4||p.x>_camX+W+4) continue;
    p.type==='g' ? _drawGround(p) : _drawBrick(p);
  }

  // 깃발 + 성
  _drawFlag(_flagX, H-T, _flagSlideRatio());
  _drawCastle(_castleX, H-T);

  // 코인
  for(const c of _coins) {
    if(c.collected) continue;
    _drawCoin(c.x, c.y+Math.sin(c.bob)*4);
  }

  // 굼바
  for(const g of _goombas) {
    if(g.dead&&g.deadT<=0) continue;
    _drawGoomba(g);
  }

  // 마리오
  if(!_mario.dead || _frame%6<3) _drawMario(_mario);

  // 파티클
  for(const p of _parts) {
    _ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
    _ctx.fillStyle=p.color;
    _ctx.fillRect(p.x-3,p.y-3,6,6);
  }
  _ctx.globalAlpha=1;
  _ctx.restore();

  // HUD
  _drawHUD(W,H);

  // 오버레이
  if(_state==='ready')    _drawOverlay(W,H,'ready');
  if(_state==='dying')    _drawOverlay(W,H,'dying');
  if(_state==='gameover') _drawOverlay(W,H,'gameover');
  if(_state==='won')      _drawOverlay(W,H,'won');
}

// ── 그리기 함수들 ─────────────────────────────────────────────
function _drawGround(p) {
  _ctx.fillStyle='#56a130'; _ctx.fillRect(p.x,p.y,p.w,10);
  _ctx.fillStyle='#8B5E3C'; _ctx.fillRect(p.x,p.y+10,p.w,p.h-10);
  _ctx.strokeStyle='#2d6e12'; _ctx.lineWidth=1;
  _ctx.strokeRect(p.x+.5,p.y+.5,p.w-1,p.h-1);
}

function _drawBrick(p) {
  _ctx.fillStyle='#c8714a'; _ctx.fillRect(p.x,p.y,p.w,p.h);
  _ctx.fillStyle='#7b3a1e';
  _ctx.fillRect(p.x,p.y+p.h/2-1,p.w,2);
  _ctx.fillRect(p.x+p.w/2-1,p.y,2,p.h/2);
  _ctx.fillRect(p.x-1,p.y+p.h/2,2,p.h/2);
  _ctx.strokeStyle='#6b2e14'; _ctx.lineWidth=1;
  _ctx.strokeRect(p.x+.5,p.y+.5,p.w-1,p.h-1);
}

function _drawCoin(x,y) {
  _ctx.fillStyle='#FFD700';
  _ctx.beginPath(); _ctx.arc(x,y,9,0,Math.PI*2); _ctx.fill();
  _ctx.fillStyle='#FFE040';
  _ctx.beginPath(); _ctx.arc(x-2,y-2,4,0,Math.PI*2); _ctx.fill();
  _ctx.strokeStyle='#cc8800'; _ctx.lineWidth=2;
  _ctx.beginPath(); _ctx.arc(x,y,9,0,Math.PI*2); _ctx.stroke();
}

// 깃발이 봉의 몇 %(0=꼭대기, 1=바닥) 지점에 있는지 계산
function _flagSlideRatio() {
  if(_state==='sliding') {
    const GY=_canvas.height-T, poleTopY=GY-T*5, poleBotY=GY;
    return Math.min(1, Math.max(0, (_mario.y-poleTopY)/(poleBotY-poleTopY)));
  }
  if(_state==='walking' || _state==='won') return 1;
  return 0;
}

function _drawFlag(x,gy,ratio=0) {
  _ctx.fillStyle='#888'; _ctx.fillRect(x+14,gy-T*5,4,T*5);
  const topY=gy-T*5, flagY=topY + ratio*(T*5-T*1.7);
  _ctx.fillStyle='#e53935';
  _ctx.beginPath();
  _ctx.moveTo(x+18,flagY); _ctx.lineTo(x+55,flagY+T*0.9); _ctx.lineTo(x+18,flagY+T*1.7);
  _ctx.closePath(); _ctx.fill();
  _ctx.fillStyle='#aaa'; _ctx.fillRect(x+2,gy-6,34,6);
}

function _drawCastle(x,gy) {
  const bw=T*5.5, bh=T*3.6, bx=x, by=gy-bh;
  // 본체
  _ctx.fillStyle='#d8d4c8'; _ctx.fillRect(bx,by,bw,bh);
  _ctx.fillStyle='#b8b2a0'; _ctx.fillRect(bx,by,bw,8);
  // 여장(흉벽)
  _ctx.fillStyle='#d8d4c8';
  for(let i=0;i<6;i++) _ctx.fillRect(bx+i*(bw/6),by-14,bw/6-6,14);
  // 좌우 탑
  [bx-T*0.6, bx+bw-T*0.4].forEach(tx=>{
    _ctx.fillStyle='#c8c2b0'; _ctx.fillRect(tx,by-T*0.9,T,bh+T*0.9);
    _ctx.fillStyle='#d8d4c8';
    for(let i=0;i<2;i++) _ctx.fillRect(tx+i*(T/2),by-T*0.9-12,T/2-4,12);
  });
  // 문
  const dw=T*1.15, dh=T*1.7;
  _ctx.fillStyle='#3a2a1a';
  _ctx.beginPath();
  _ctx.moveTo(bx+bw/2-dw/2, by+bh);
  _ctx.lineTo(bx+bw/2-dw/2, by+bh-dh+dw/2);
  _ctx.arc(bx+bw/2, by+bh-dh+dw/2, dw/2, Math.PI, 0);
  _ctx.lineTo(bx+bw/2+dw/2, by+bh);
  _ctx.closePath(); _ctx.fill();
  // 깃발 (성 꼭대기)
  if(_state==='won') {
    _ctx.fillStyle='#888'; _ctx.fillRect(bx+bw/2-2, by-14-30, 4, 30);
    _ctx.fillStyle='#4ade80';
    _ctx.beginPath();
    _ctx.moveTo(bx+bw/2+2, by-44); _ctx.lineTo(bx+bw/2+24, by-38); _ctx.lineTo(bx+bw/2+2, by-32);
    _ctx.closePath(); _ctx.fill();
  }
  // 창문
  _ctx.fillStyle='#3a2a1a';
  _ctx.fillRect(bx+T*0.6, by+T*0.7, 10, 14);
  _ctx.fillRect(bx+bw-T*0.6-10, by+T*0.7, 10, 14);
}

function _drawMario(m) {
  const x=Math.round(m.x), y=Math.round(m.y), W=m.w;
  const fl=m.facing<0;

  _ctx.save();
  if(fl){ _ctx.scale(-1,1); _ctx.translate(-(x*2+W),0); }

  // 모자
  _ctx.fillStyle='#e53935'; _ctx.fillRect(x+3,y,W-6,7); _ctx.fillRect(x-1,y+5,W+2,5);
  // 얼굴
  _ctx.fillStyle='#FFCC80'; _ctx.fillRect(x+3,y+9,W-6,9);
  // 눈
  _ctx.fillStyle='#212121'; _ctx.fillRect(x+6,y+10,4,3);
  // 콧수염
  _ctx.fillStyle='#5D4037'; _ctx.fillRect(x+2,y+13,W-4,4);
  // 상의
  _ctx.fillStyle='#e53935'; _ctx.fillRect(x+3,y+18,W-6,7);
  // 멜빵
  _ctx.fillStyle='#1565C0';
  _ctx.fillRect(x,y+18,5,7); _ctx.fillRect(x+W-5,y+18,5,7);
  _ctx.fillRect(x,y+24,W,7);
  // 다리
  const la=m.onGround?[[-2,2],[2,-2],[0,0]][m.anim]:[0,0];
  _ctx.fillRect(x+1,y+30,11,5+la[0]); _ctx.fillRect(x+W-12,y+30,11,5+la[1]);
  // 신발
  _ctx.fillStyle='#4E342E';
  _ctx.fillRect(x-1,y+30+la[0],14,4); _ctx.fillRect(x+W-13,y+30+la[1],14,4);

  _ctx.restore();
}

function _drawGoomba(g) {
  if(g.dead){
    _ctx.fillStyle='#8B4513'; _ctx.fillRect(g.x,g.y+g.h-5,g.w,5);
    return;
  }
  const x=Math.round(g.x),y=Math.round(g.y),W=g.w,H=g.h;
  _ctx.fillStyle='#8B4513';
  _ctx.beginPath(); _ctx.ellipse(x+W/2,y+H*.62,W/2,H*.42,0,0,Math.PI*2); _ctx.fill();
  _ctx.fillStyle='#A0522D';
  _ctx.beginPath(); _ctx.ellipse(x+W/2,y+H*.36,W*.46,H*.34,0,0,Math.PI*2); _ctx.fill();
  _ctx.strokeStyle='#1a0a00'; _ctx.lineWidth=2.5;
  _ctx.beginPath(); _ctx.moveTo(x+4,y+7); _ctx.lineTo(x+10,y+10); _ctx.stroke();
  _ctx.beginPath(); _ctx.moveTo(x+W-4,y+7); _ctx.lineTo(x+W-10,y+10); _ctx.stroke();
  _ctx.fillStyle='#FFF';
  _ctx.beginPath(); _ctx.arc(x+8,y+12,3.5,0,Math.PI*2); _ctx.fill();
  _ctx.beginPath(); _ctx.arc(x+W-8,y+12,3.5,0,Math.PI*2); _ctx.fill();
  _ctx.fillStyle='#111';
  _ctx.beginPath(); _ctx.arc(x+9,y+13,2,0,Math.PI*2); _ctx.fill();
  _ctx.beginPath(); _ctx.arc(x+W-9,y+13,2,0,Math.PI*2); _ctx.fill();
  const ft=_frame%20<10;
  _ctx.fillStyle='#5D3008';
  _ctx.fillRect(x+(ft?0:3),y+H-6,9,6); _ctx.fillRect(x+W-9-(ft?3:0),y+H-6,9,6);
}

function _drawClouds(W,H) {
  const cx=[70,250,450,680,920,1160,1420,1700,1960,2220,2490,2750];
  const cy=[38,55,30,48,35,60,40,52,33,45,38,55];
  cx.forEach((bx,i)=>{
    const x=((bx-_camX*.28+W*5)%(W+320))-120;
    const y=cy[i%cy.length];
    _ctx.fillStyle='rgba(255,255,255,0.9)';
    _ctx.beginPath();
    _ctx.arc(x,    y,    24,0,Math.PI*2);
    _ctx.arc(x+28, y-10, 19,0,Math.PI*2);
    _ctx.arc(x+56, y,    22,0,Math.PI*2);
    _ctx.arc(x+28, y+10, 30,0,Math.PI*2);
    _ctx.fill();
  });
}

function _drawHUD(W,H) {
  _ctx.fillStyle='rgba(0,0,0,0.65)';
  _ctx.fillRect(0,0,W,48);
  _ctx.font='bold 18px "Noto Sans KR",monospace';
  _ctx.textBaseline='middle';
  _ctx.fillStyle='#FFD700'; _ctx.textAlign='left';
  _ctx.fillText(`🪙 ${_mario.coins} / ${GOAL_C}`,16,24);
  _ctx.fillStyle='#ef9a9a';
  _ctx.fillText(`❤️ × ${_mario.lives}`,210,24);
  _ctx.fillStyle='#80deea';
  _ctx.fillText(`⭐ ${_mario.score}`,390,24);

  // 코인 진행바
  const pct=Math.min(1,_mario.coins/GOAL_C);
  _ctx.fillStyle='#333'; _ctx.fillRect(W-200,16,170,16);
  _ctx.fillStyle=pct>=1?'#4ade80':'#FFD700'; _ctx.fillRect(W-200,16,170*pct,16);
  _ctx.strokeStyle='#fff'; _ctx.lineWidth=1; _ctx.strokeRect(W-200,16,170,16);
  _ctx.fillStyle='#fff'; _ctx.font='10px monospace'; _ctx.textAlign='center';
  _ctx.fillText('코인 진행도',W-115,24);

  // 조작 안내 (처음 5초만)
  if(_state==='playing' && _frame<300) {
    const alpha=Math.min(1,1-(_frame-240)/60);
    if(alpha>0) {
      _ctx.globalAlpha=Math.max(0,alpha);
      _ctx.fillStyle='rgba(0,0,0,0.5)';
      _ctx.fillRect(W/2-160,H-44,320,36);
      _ctx.fillStyle='#fff'; _ctx.font='13px "Noto Sans KR",sans-serif';
      _ctx.textAlign='center';
      _ctx.fillText('← → / A D: 이동  |  Space / ↑ / W: 점프',W/2,H-22);
      _ctx.globalAlpha=1;
    }
  }
  _ctx.textBaseline='alphabetic';
}

function _drawOverlay(W,H,type) {
  _ctx.fillStyle='rgba(0,0,0,0.6)'; _ctx.fillRect(0,0,W,H);
  _ctx.textAlign='center'; _ctx.textBaseline='middle';

  if(type==='ready') {
    _ctx.fillStyle='#FFD700'; _ctx.font='bold 30px "Noto Sans KR",sans-serif';
    _ctx.fillText('🎮 마리오 플랫포머!',W/2,H/2-70);
    _ctx.fillStyle='#fff'; _ctx.font='17px "Noto Sans KR",sans-serif';
    _ctx.fillText('← → / A D  이동      Space / ↑ / W  점프',W/2,H/2-20);
    _ctx.fillText('굼바 머리 밟기 = 처치   2단 점프 가능!',W/2,H/2+18);
    _ctx.fillText('깃대를 잡으면 주르륵 미끄러져 내려와 성으로 클리어!',W/2,H/2+54);
    _ctx.fillStyle='#4ade80'; _ctx.font='bold 22px "Noto Sans KR",sans-serif';
    _ctx.fillText('▶  클릭 또는 아무 키나 눌러 시작!',W/2,H/2+104);
  }
  if(type==='dying') {
    _ctx.fillStyle='#ef5350'; _ctx.font='bold 28px "Noto Sans KR",sans-serif';
    _ctx.fillText('💀  추락!',W/2,H/2-30);
    _ctx.fillStyle='#fff'; _ctx.font='18px "Noto Sans KR",sans-serif';
    _ctx.fillText(`남은 목숨: ❤️ × ${_mario.lives}`,W/2,H/2+14);
    _ctx.fillStyle='#FFD700'; _ctx.font='15px "Noto Sans KR",sans-serif';
    _ctx.fillText('아무 키 / 클릭으로 계속',W/2,H/2+50);
  }
  if(type==='gameover') {
    _ctx.fillStyle='#b71c1c'; _ctx.font='bold 42px "Noto Sans KR",sans-serif';
    _ctx.fillText('GAME  OVER',W/2,H/2-30);
    _ctx.fillStyle='#fff'; _ctx.font='18px "Noto Sans KR",sans-serif';
    _ctx.fillText('아무 키 / 클릭으로 처음부터',W/2,H/2+24);
  }
  if(type==='won') {
    _ctx.fillStyle='#FFD700'; _ctx.font='bold 40px "Noto Sans KR",sans-serif';
    _ctx.fillText('🏰  스테이지 클리어!',W/2,H/2-68);
    _ctx.fillStyle='#fff'; _ctx.font='19px "Noto Sans KR",sans-serif';
    _ctx.fillText(`🪙 코인 ${_mario.coins}개    ⭐ 점수 ${_mario.score}점`,W/2,H/2-18);
    if(_flagBonus>0) {
      _ctx.fillStyle='#80deea'; _ctx.font='15px "Noto Sans KR",sans-serif';
      _ctx.fillText(`깃대 보너스 +${_flagBonus}점!`,W/2,H/2+12);
    }
    _ctx.fillStyle='#4ade80'; _ctx.font='15px "Noto Sans KR",sans-serif';
    _ctx.fillText('"닫기" 버튼으로 수학 문제로 돌아가세요 📚',W/2,H/2+48);
  }
  _ctx.textAlign='left'; _ctx.textBaseline='alphabetic';
}

// ── 게임 이벤트 ───────────────────────────────────────────────
function _doJump() {
  SFX.resume();
  if(_state==='ready')    { _startPlaying(); return; }
  if(_state==='dying')    { _mario.lives>0 ? _respawn() : (_state='gameover'); return; }
  if(_state==='gameover') { _fullRestart(); return; }
  if(_state==='won')      return;
  if(_state!=='playing'||_mario.dead) return;

  if(_mario.jumps===0) {
    _mario.vy=JUMP_V; _mario.jumps=1; SFX.jump();
  } else if(_mario.jumps===1) {
    _mario.vy=DJ_V;   _mario.jumps=2; SFX.djump();
  }
}

function _doAnyKey() {
  if(_state==='ready')    { _startPlaying(); return; }
  if(_state==='dying')    { _mario.lives>0 ? _respawn() : (_state='gameover'); return; }
  if(_state==='gameover') { _fullRestart(); return; }
}

function _triggerDeath() {
  if(_mario.dead) return;
  _mario.dead=true; _mario.lives--;
  SFX.die();
  setTimeout(()=>{ _state=_mario.lives<=0?'gameover':'dying'; },900);
}

function _triggerWin() {
  if(_state==='won') return;
  _state='won'; SFX.victory();
}

function _respawn() {
  const lives=_mario.lives;
  _initMario(); _camX=0;
  _mario.lives=lives;
  for(const c of _coins) c.collected=false;
  _state='playing';
}

function _startPlaying() {
  _state='playing'; SFX.startBg();
}

function _fullRestart() {
  SFX.stopBg(); _initMario(); _buildLevel(); _camX=0; _frame=0;
  _flagBonus=0; _walkTimer=0;
  _state='ready';
}

// ── 파티클 ────────────────────────────────────────────────────
function _burst(x,y,color,n) {
  for(let i=0;i<n;i++) {
    const a=Math.random()*Math.PI*2, sp=Math.random()*4+1;
    _parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,color,life:28,maxLife:28});
  }
}

// ── 메인 루프 ─────────────────────────────────────────────────
function _loop() {
  _update(); _draw();
  _animId=requestAnimationFrame(_loop);
}

// ── 이벤트 리스너 관리 ────────────────────────────────────────
let _keyDownH, _keyUpH, _pointerH;

function _bindEvents() {
  _keyDownH = e => {
    _keys[e.code]=true;
    if(['Space','ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); _doJump(); }
    else if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){ e.preventDefault(); }
    else { _doAnyKey(); }
  };
  _keyUpH = e => { _keys[e.code]=false; };
  _pointerH = e => { e.preventDefault(); _doJump(); };

  window.addEventListener('keydown', _keyDownH);
  window.addEventListener('keyup',   _keyUpH);
  _canvas.addEventListener('pointerdown', _pointerH);

  // 모바일 터치 버튼
  const btnL=document.getElementById('mCtrlLeft');
  const btnR=document.getElementById('mCtrlRight');
  const btnJ=document.getElementById('mCtrlJump');

  if(btnL){
    btnL.addEventListener('touchstart',e=>{e.preventDefault();_tLeft=true;},{passive:false});
    btnL.addEventListener('touchend',  e=>{e.preventDefault();_tLeft=false;},{passive:false});
    btnL.addEventListener('mousedown', ()=>_tLeft=true);
    btnL.addEventListener('mouseup',   ()=>_tLeft=false);
  }
  if(btnR){
    btnR.addEventListener('touchstart',e=>{e.preventDefault();_tRight=true;},{passive:false});
    btnR.addEventListener('touchend',  e=>{e.preventDefault();_tRight=false;},{passive:false});
    btnR.addEventListener('mousedown', ()=>_tRight=true);
    btnR.addEventListener('mouseup',   ()=>_tRight=false);
  }
  if(btnJ){
    btnJ.addEventListener('touchstart',e=>{e.preventDefault();_doJump();},{passive:false});
    btnJ.addEventListener('mousedown', ()=>_doJump());
  }
}

function _unbindEvents() {
  window.removeEventListener('keydown', _keyDownH);
  window.removeEventListener('keyup',   _keyUpH);
  _canvas?.removeEventListener('pointerdown', _pointerH);
  Object.keys(_keys).forEach(k=>delete _keys[k]);
  _tLeft=false; _tRight=false;
}

// ── Public API ────────────────────────────────────────────────
window.MarioGame = {
  init(canvasEl) {
    _canvas=canvasEl; _ctx=_canvas.getContext('2d');
    SFX.init(); _initMario(); _buildLevel();
    _camX=0; _frame=0; _flagBonus=0; _walkTimer=0; _state='ready';
    _bindEvents();
    if(_animId) cancelAnimationFrame(_animId);
    _loop();
  },
  destroy() {
    if(_animId){ cancelAnimationFrame(_animId); _animId=null; }
    SFX.stopBg(); _unbindEvents(); _state='idle';
  }
};
