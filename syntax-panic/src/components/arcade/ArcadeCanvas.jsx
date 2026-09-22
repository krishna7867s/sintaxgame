import { useEffect, useMemo, useRef } from 'react';
import { CANVAS_W, CANVAS_H, RENDER_W, RENDER_H, GROUND_Y, PLAYER_X, PLAYER_H, PLAYER_DUCK_H, ATTACK_COOLDOWN } from '../../hooks/useArcadeGame';
import { MetaBadge } from '../ui/MetaBadge';
import { HpHearts } from '../ui/Bits';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function drawBuildingLayer(ctx, s, layer, tint, y0, baseH, seed) {
  ctx.save();
  ctx.fillStyle = tint;
  const off = (s.dist * layer) % 240;
  for (let bx = -240; bx < CANVAS_W + 240; bx += 240) {
    const x = bx - off;
    const h = baseH + ((seed * (bx + 37) * 7919) % (baseH * 0.7));
    ctx.fillRect(x, y0 - h, 205, h);
  }
  ctx.restore();
}

function drawMoon(ctx) {
  const mx = 812;
  const my = 66;
  ctx.save();
  ctx.fillStyle = 'rgba(255,179,71,0.14)';
  ctx.fillRect(mx - 34, my - 34, 100, 100);
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(mx, my, 90, 90);
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(mx + 12, my + 12, 60, 60);
  ctx.fillStyle = '#180d2e';
  ctx.fillRect(mx + 30, my + 30, 60, 60);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(mx + 18, my + 20, 6, 6);
  ctx.fillRect(mx + 56, my + 46, 5, 5);
  ctx.restore();
}

function drawStars(ctx, s) {
  const rand = Math.sin(s.dist * 0.01) * 10000;
  ctx.save();
  for (let i = 0; i < 60; i += 1) {
    const sx = (i * 157) % CANVAS_W;
    const sy = (i * 73) % 180;
    const tw = Math.sin(s.time * 3 + i * 1.7) > 0.2 ? 1.6 : 1;
    ctx.fillStyle = i % 3 ? 'rgba(245,240,255,0.6)' : 'rgba(0,240,255,0.7)';
    ctx.fillRect(sx, sy, tw, tw);
  }
  ctx.restore();
  void rand;
}

function drawRoad(ctx, s) {
  ctx.fillStyle = '#0d0719';
  ctx.fillRect(0, 296, CANVAS_W, 64);
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(0, 296, CANVAS_W, 3);
  ctx.save();
  const off = (s.dist * 1) % 60;
  ctx.fillStyle = 'rgba(255,179,71,0.85)';
  for (let x = -60 + off; x < CANVAS_W + 60; x += 60) {
    ctx.fillRect(x, 330, 30, 3);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(0,240,255,0.08)';
  ctx.fillRect(0, 358, CANVAS_W, 2);
}

function drawSignPost(ctx, x, seed) {
  ctx.fillStyle = seed % 2 ? '#ff2e93' : '#00f0ff';
  ctx.fillRect(x, 210, 32, 8);
  ctx.fillStyle = '#241442';
  ctx.fillRect(x, 218, 4, 84);
}

function drawRansomware(ctx, o, s) {
  const bob = Math.sin(o.phase * 2) * o.floatAmp;
  const x = o.x;
  const y = o.y + bob;

  ctx.fillStyle = 'rgba(255,46,147,0.18)';
  ctx.fillRect(x + 6, GROUND_Y - 4, 34, 6);

  ctx.fillStyle = '#a0115c';
  ctx.fillRect(x + 2, y + 50, 5, 22);
  ctx.fillRect(x + 39, y + 48, 5, 24);
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(x + 2, y + 68, 5, 3);
  ctx.fillRect(x + 39, y + 68, 5, 3);

  ctx.fillStyle = '#e0202f';
  ctx.fillRect(x, y, 46, 50);
  ctx.fillStyle = '#a0115c';
  ctx.fillRect(x + 4, y + 6, 38, 38);
  ctx.fillStyle = '#ff5c6c';
  ctx.fillRect(x + 6, y + 8, 34, 8);

  ctx.fillStyle = '#0c0718';
  ctx.fillRect(x + 8, y + 20, 8, 8);
  ctx.fillRect(x + 30, y + 20, 8, 8);
  ctx.fillStyle = Math.floor(s.time * 9) % 2 ? '#39ff14' : '#ffb347';
  ctx.fillRect(x + 10, y + 22, 4, 4);
  ctx.fillRect(x + 32, y + 22, 4, 4);

  ctx.fillStyle = '#0c0718';
  ctx.fillRect(x + 10, y + 34, 26, 3);
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(x + 19, y + 29, 8, 6);
  ctx.fillStyle = '#241442';
  ctx.fillRect(x + 21, y + 27, 4, 3);

  if (o.flash > 0) {
    ctx.fillStyle = 'rgba(245,240,255,0.65)';
    ctx.fillRect(x, y, 46, 54);
  }
}

function drawNullptr(ctx, o, s) {
  const hop = Math.abs(Math.sin(o.phase * 3)) * 12;
  const x = o.x;
  const y = GROUND_Y - 20 - hop;
  const flick = Math.floor(s.time * 12 + o.phase) % 2;

  ctx.fillStyle = 'rgba(57,255,20,0.12)';
  ctx.fillRect(x + 1, GROUND_Y - 3, 24, 4);

  ctx.fillStyle = '#0c0718';
  ctx.fillRect(x + 5, y - 4, 2, 4);
  ctx.fillRect(x + 19, y - 4, 2, 4);
  ctx.fillStyle = '#ff2e93';
  ctx.fillRect(x + 4, y - 6, 4, 3);
  ctx.fillRect(x + 18, y - 6, 4, 3);

  ctx.fillStyle = '#0c0718';
  ctx.fillRect(x, y, 26, 20);
  ctx.fillStyle = flick ? '#39ff14' : '#00f0ff';
  ctx.fillRect(x + 2, y + 2, 22, 16);

  ctx.fillStyle = '#0c0718';
  ctx.fillRect(x + 6, y + 6, 4, 4);
  ctx.fillRect(x + 16, y + 6, 4, 4);
  ctx.fillRect(x + 6, y + 13, 14, 3);
  ctx.fillStyle = '#ff2e93';
  ctx.fillRect(x + 8, y + 13, 3, 3);
  ctx.fillRect(x + 15, y + 13, 3, 3);

  ctx.fillStyle = 'rgba(245,240,255,0.8)';
  ctx.font = 'bold 5px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NULL', x + 13, y + 2);

  if (o.flash > 0) {
    ctx.fillStyle = 'rgba(245,240,255,0.7)';
    ctx.fillRect(x, y, 26, 20);
  }
}

function drawMonster(ctx, o, s) {
  if (o.kind === 'ransomware') drawRansomware(ctx, o, s);
  else drawNullptr(ctx, o, s);
}

function drawLoot(ctx, o) {
  const bob = Math.abs(Math.sin(o.phase)) * 4;
  const x = o.x;
  const y = o.y - bob;

  ctx.fillStyle = 'rgba(255,179,71,0.2)';
  ctx.fillRect(x - 3, y + 8, o.w + 6, o.h + 6);

  ctx.fillStyle = '#241442';
  ctx.fillRect(x, y, o.w, o.h);
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(x + 1, y + 1, o.w - 2, 3);
  ctx.fillStyle = '#f5f0ff';
  ctx.fillRect(x + 2, y + 4, o.w - 4, o.h - 6);
  ctx.fillStyle = '#241442';
  ctx.fillRect(x + 3, y + 6, 4, o.h - 9);
  ctx.fillStyle = '#ff2e93';
  ctx.fillRect(x + 7, y + 1, 2, 2);

  if (Math.random() < 0.06) {
    ctx.fillStyle = 'rgba(245,240,255,0.6)';
    ctx.fillRect(x - 1, y - 2, o.w + 2, o.h + 2);
  }
}

function drawPlayer(ctx, s, frames) {
  const { avatar } = frames;
  const bob = s.grounded && s.game === 'PLAYING' ? Math.abs(Math.sin(s.time * 13)) * 3 : 0;
  const h = s.duck ? PLAYER_DUCK_H : PLAYER_H;
  const feetY = s.y - bob * 0.3;
  const top = feetY - h;
  const px = PLAYER_X + 2;

  // estela de píxeles
  s.path.forEach((p, i) => {
    const a = (i / s.path.length) * 0.28;
    ctx.fillStyle = i % 2 ? `rgba(255,46,147,${a})` : `rgba(0,240,255,${a})`;
    ctx.fillRect(p.x - 4 + i * 2, p.y, 4, 4);
  });

  if (s.invincible > 0 && Math.floor(s.time * 14) % 2 === 0) return;

  const bodyTint = s.hitFlash > 0 ? '#ff5c6c' : '#ff2e93';

  if (s.duck) {
    ctx.fillStyle = bodyTint;
    ctx.fillRect(px, top, 24, 14);
    ctx.fillStyle = '#a0115c';
    ctx.fillRect(px + 2, top + 14, 20, 6);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(px + 20, top + 2, 6, 6);
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(px + 18, top + 14, 8, 4);
    return;
  }

  // piernas
  const step = Math.floor(s.time * 12);
  const legA = step % 2 === 0;
  if (s.grounded) {
    ctx.fillStyle = '#a0115c';
    ctx.fillRect(px + 3, top + 36, 7, legA ? 6 : 0);
    ctx.fillRect(px + 13, top + 36, 7, legA ? 0 : 6);
    ctx.fillStyle = '#241442';
    ctx.fillRect(px + 2, top + 35, 8, 3);
    ctx.fillRect(px + 13, top + 35, 8, 3);
  } else {
    ctx.fillStyle = '#a0115c';
    ctx.fillRect(px + 4, top + 34, 7, 6);
    ctx.fillRect(px + 13, top + 36, 7, 5);
  }

  // torso
  ctx.fillStyle = bodyTint;
  ctx.fillRect(px, top + 14, 22, 24);
  ctx.fillStyle = '#a0115c';
  ctx.fillRect(px + 2, top + 18, 18, 14);
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(px + 2, top + 26, 18, 3);
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(px + 18, top + 16, 6, 10);

  // cabeza: avatar placeholder o pixel-skull
  if (avatar) {
    ctx.save();
    ctx.drawImage(avatar, px, top - 2, 24, 22);
    ctx.restore();
  } else {
    ctx.fillStyle = '#f5f0ff';
    ctx.fillRect(px + 3, top - 2, 18, 16);
    ctx.fillStyle = '#241442';
    ctx.fillRect(px + 6, top + 2, 5, 4);
    ctx.fillRect(px + 14, top + 2, 5, 4);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(px + 5, top + 10, 14, 3);
  }

  // estela de espada al atacar con [F]
  if (s.attacking > 0 && !s.duck) {
    const prog = 1 - s.attacking / ATTACK_COOLDOWN;
    const base = prog * 1.5 - 0.7;
    const armY = top + 22;
    const colors = ['#00f0ff', '#f5f0ff', '#ffb347'];
    for (let i = 0; i < 9; i += 1) {
      const ang = -base - i * 0.16;
      const r = 24 + ((i * 37) % 22);
      const sx = px + 22 + Math.cos(ang) * r;
      const sy = armY + Math.sin(ang) * r * 0.75;
      ctx.fillStyle = colors[i % 3];
      ctx.fillRect(sx, sy, 4, 4);
    }
    ctx.fillStyle = '#f5f0ff';
    ctx.fillRect(px + 23 + Math.cos(-base) * 34, armY + Math.sin(-base) * 34 * 0.75, 3, 14);
  }
}

function drawVignette(ctx, s) {
  ctx.fillStyle = 'rgba(7,3,15,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, 26);
  ctx.fillRect(0, 322, CANVAS_W, 38);
  ctx.fillStyle = 'rgba(7,3,15,0.4)';
  ctx.fillRect(0, 0, 26, CANVAS_H);
  ctx.fillRect(934, 0, 26, CANVAS_H);
  if (s.lives === 1 && s.game === 'PLAYING') {
    ctx.fillStyle = `rgba(255,92,108,${0.08 + Math.sin(s.time * 6) * 0.05})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

function drawScene(ctx, s, t, frames) {
  // La cuadrÃ­cula retro se adapta a un viewport de juego 16:9.
  ctx.save();
  ctx.setTransform(RENDER_W / CANVAS_W, 0, 0, RENDER_H / CANVAS_H, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  if (frames.bg && frames.bg.complete && frames.bg.naturalWidth) {
    ctx.drawImage(frames.bg, 0, 0, CANVAS_W, CANVAS_H);
    drawBuildingLayer(ctx, s, 0.6, 'rgba(18,11,40,0.55)', 300, 120, 3);
    drawRoad(ctx, s);
  } else {
    ctx.fillStyle = '#07030f';
    ctx.fillRect(0, 0, CANVAS_W, 360);
    drawStars(ctx, s);
    drawBuildingLayer(ctx, s, 0.25, '#120b28', 296, 130, 7);
    drawBuildingLayer(ctx, s, 0.5, '#171031', 296, 100, 11);
    ctx.fillStyle = '#241442';
    ctx.fillRect(0, 250, CANVAS_W, 50);
    drawRoad(ctx, s);
  }

  drawMoon(ctx);
  drawSignPost(ctx, 300 + ((s.dist * 0.5) % 700), 4);
  drawSignPost(ctx, 620 + ((s.dist * 0.5) % 900), 9);

  s.obstacles.forEach((o) => {
    drawMonster(ctx, o, s);
  });

  s.loot.forEach((l) => {
    drawLoot(ctx, l);
  });

  drawPlayer(ctx, s, frames);

  s.particles.forEach((p) => {
    ctx.globalAlpha = clamp(p.life / 0.6, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  if (s.speed > 320 && s.game === 'PLAYING') {
    const alpha = clamp((s.speed - 320) / 180, 0, 0.3);
    ctx.fillStyle = `rgba(0,240,255,${alpha})`;
    const rand = Math.sin(t * 0.001) * 10000;
    for (let i = 0; i < 6; i += 1) {
      const yy = (i * 53 + Math.floor(rand)) % 280;
      ctx.fillRect(((t * 0.02 + i * 140) % CANVAS_W) - CANVAS_W, yy, 60, 2);
    }
  }

  drawVignette(ctx, s);
  ctx.restore();
}

export default function ArcadeCanvas({ setDraw, canvasRef, hud, gameState, operatorId, onStart, onResume, onExit, onRanking, submitting }) {
  const framesRef = useRef({});

  useEffect(() => {
    const frames = framesRef.current;
    const img = new Image();
    img.src = '/images/levels/campus_bg.png';
    img.onload = () => {
      frames.bg = img;
    };
    return () => {
      frames.bg = null;
    };
  }, []);

  useEffect(() => {
    const frames = framesRef.current;
    const img = new Image();
    const src =
      operatorId === 'P2' ? '/images/avatars/jaeyoung-reference.jpeg' : '/images/avatars/sangwoo-reference.jpeg';
    img.src = src;
    img.onload = () => {
      frames.avatar = img;
    };
    return () => {
      frames.avatar = null;
    };
  }, [operatorId]);

  useEffect(() => {
    setDraw((ctx, s, t) => drawScene(ctx, s, t, framesRef.current));
  }, [setDraw]);

  const overlay = useMemo(() => {
    if (gameState === 'IDLE') {
      return {
        title: 'SISTEMA LISTO // CAMPUS NIGHT RUN',
        tone: 'cyan',
        body: (
          <div className="keycaps" style={{ justifyContent: 'center' }}>
            <span className="key key--cyan">SPACE</span> SALTAR
            <span className="key key--magenta">F</span> ATACAR MONSTRUO
            <span className="key key--amber">ESC</span> PAUSA
          </div>
        ),
        action: (
          <button className="px-btn px-btn--primary px-btn--lg" onClick={onStart}>
            ▶ INICIAR RUN
          </button>
        ),
      };
    }
    if (gameState === 'PAUSED') {
      return {
        title: 'PAUSA // ESC',
        tone: 'amber',
        body: <div className="mono tiny text-dim">El loop del runner queda congelado en el buffer de física (useRef 60 FPS).</div>,
        action: (
          <div className="row gap-1" style={{ justifyContent: 'center' }}>
            <button className="px-btn px-btn--primary" onClick={onResume}>REANUDAR</button>
            <button className="px-btn" onClick={onExit}>SALIR</button>
          </div>
        ),
      };
    }
    if (gameState === 'GAMEOVER') {
      return {
        title: 'GAME OVER // MEMORY SEGFAULT',
        tone: 'danger',
        body: (
          <div className="mono tiny">
            PTS FINAL: <span className="text-amber">{hud.score.toLocaleString('en-US')}</span> · KILLS:{' '}
            <span className="text-green">{hud.bugs}</span>
          </div>
        ),
        action: null,
      };
    }
    if (gameState === 'VICTORY') {
      return {
        title: 'RANK ACK // VICTORIA',
        tone: 'green',
        body: (
          <div className="mono tiny">
            PTS: <span className="text-amber">{hud.score.toLocaleString('en-US')}</span> (+5000 BONUS) · KILLS:{' '}
            <span className="text-green">{hud.bugs}</span>
          </div>
        ),
        action: (
          <span className="mono tiny text-green">{submitting ? 'POST /scores + N8N EN CURSO...' : 'PUNTAJE REGISTRADO AUTOMÁTICAMENTE'}</span>
        ),
      };
    }
    return null;
  }, [gameState, hud, onStart, onResume, onExit, submitting]);

  const mm = String(Math.floor(hud.elapsed / 60)).padStart(2, '0');
  const ss = String(Math.floor(hud.elapsed % 60)).padStart(2, '0');

  return (
    <div className="arcade-frame scanlines">
      <canvas ref={canvasRef} width={RENDER_W} height={RENDER_H} className="arcade-canvas" />

      <div className="arcade-hud">
        <div className="row gap-1 wrap" style={{ pointerEvents: 'none' }}>
          <span className="hud-block hud-block--magenta">PTS {hud.score.toLocaleString('en-US')}</span>
          <span className="hud-block">KILLS {String(hud.bugs).padStart(3, '0')}</span>
          <span className="hud-block hud-block--cyan">
            {mm}:{ss}
          </span>
          <span className="hud-block">DIST {Math.floor(hud.dist)}m</span>
        </div>
        <div className="row gap-1 wrap" style={{ pointerEvents: 'none' }}>
          <span className="hud-block">
            HP <HpHearts hp={hud.lives} />
          </span>
          {hud.combo > 1 && <span className="hud-block" style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}>COMBO×{hud.combo}</span>}
          <span className="hud-block">
            VEL <span className="text-cyan">{Math.floor(hud.speed)}</span>
          </span>
        </div>
      </div>

      {overlay && (
        <div className="overlay-msg">
          <MetaBadge tone={overlay.tone} doBlink>
            {overlay.title}
          </MetaBadge>
          {overlay.body}
          {overlay.action}
          {gameState === 'GAMEOVER' && (
            <div className="row gap-1" style={{ marginTop: 4 }}>
              <button className="px-btn" onClick={onStart}>
                ↻ REVANCHA [SPACE]
              </button>
              <button className="px-btn px-btn--primary" onClick={onRanking}>IR AL RANKING</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
