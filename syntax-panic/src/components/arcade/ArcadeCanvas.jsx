import { useEffect, useMemo, useRef } from 'react';
import {
  CANVAS_W, CANVAS_H, RENDER_W, RENDER_H, GROUND_Y,
  PLAYER_X, ATTACK_COOLDOWN
} from '../../hooks/useArcadeGame';
import { MetaBadge } from '../ui/MetaBadge';
import { HpHearts } from '../ui/Bits';

// ─── SPRITESHEET LAYOUT ──────────────────────────────────────────────────────
// Las imágenes son ~1034×512 px
// Fila 0 (y=0): 6 frames de carrera, cada uno ~172×256
// Fila 1 (y=256): 2 frames de acción, cada uno ~517×256
// P1 (default) = Jaeyoung (sudadera ROJA)  → jaeyoung_spritesheet.png
// P2           = Sangwoo  (gorra NEGRA)    → sangwoo_spritesheet.png
const SRUN_W   = 172;   // ancho de cada frame de carrera
const SRUN_H   = 256;   // alto de cada frame de carrera
const SRUN_Y   = 0;     // y de inicio fila carrera
const SACT_W   = 517;   // ancho de cada frame de acción
const SACT_H   = 256;   // alto de cada frame de acción
const SACT_Y   = 256;   // y de inicio fila acciones

// Destino en canvas (escalado cómodo)
const DST_W  = 80;
const DST_H  = 96;

// ─── DIBUJO DE LA ESCENA ─────────────────────────────────────────────────────
function drawScene(ctx, s, t, frames, operatorId) {
  const runFrame  = Math.floor(t / 90) % 6;   // ciclo 0‑5 cada 90 ms

  ctx.save();
  ctx.scale(RENDER_W / CANVAS_W, RENDER_H / CANVAS_H);
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.imageSmoothingEnabled = false;

  // ── FONDO SYNTHWAVE ──────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0,   '#0b0318');
  bg.addColorStop(0.5, '#2e0a56');
  bg.addColorStop(1,   '#9b1459');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Estrellas parpadeantes
  for (let i = 0; i < 55; i++) {
    const sx = (i * 283) % CANVAS_W;
    const sy = (i * 119) % 150;
    const sz = Math.sin(t * 0.002 + i * 2.1) > 0.4 ? 2 : 1;
    ctx.fillStyle = i % 4 === 0 ? 'rgba(0,240,255,0.7)' : 'rgba(255,255,255,0.45)';
    ctx.fillRect(sx, sy, sz, sz);
  }

  // Luna con halo neon
  const moonX = ((CANVAS_W + 200) - (s.dist * 0.025) % (CANVAS_W + 200));
  ctx.fillStyle = 'rgba(255,249,214,0.07)';
  ctx.beginPath(); ctx.arc(moonX, 72, 62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff9d6';
  ctx.beginPath(); ctx.arc(moonX, 72, 44, 0, Math.PI * 2); ctx.fill();

  // ── EDIFICIOS PARALLAX (capa lenta 0.3×) ─────────────────────────────────
  const offB = (s.dist * 0.3) % CANVAS_W;
  const bldgs = [
    [55, 95, 68, 205], [160, 68, 115, 232], [325, 88, 88, 212],
    [478, 108, 82, 192], [618, 58, 102, 242], [798, 92, 78, 208],
  ];
  const bldgCols = ['#14093a', '#1b0d44', '#0e0630'];
  for (let rep = -CANVAS_W; rep < CANVAS_W * 2; rep += CANVAS_W) {
    bldgs.forEach(([bx, by, bw, bh], bi) => {
      const rx = rep + bx - offB;
      ctx.fillStyle = bldgCols[bi % 3];
      ctx.fillRect(rx, by, bw, bh);
      // ventanas
      for (let wy = by + 8; wy < by + bh - 16; wy += 16) {
        for (let wx = rx + 6; wx < rx + bw - 6; wx += 12) {
          if ((wx + wy) % 5 !== 0) {
            ctx.fillStyle = Math.sin(t * 0.001 + wx + wy) > 0.98
              ? '#ff2e93' : 'rgba(0,240,255,0.12)';
            ctx.fillRect(wx, wy, 7, 9);
          }
        }
      }
    });
  }

  // ── MURO (capa media 0.7×) ────────────────────────────────────────────────
  const offW = (s.dist * 0.7) % CANVAS_W;
  ctx.fillStyle = '#280e18';
  ctx.fillRect(0, 240, CANVAS_W, 62);
  ctx.fillStyle = '#ff2e93';
  ctx.fillRect(0, 240, CANVAS_W, 2);          // línea neon techo
  ctx.fillStyle = 'rgba(0,240,255,0.18)';
  ctx.fillRect(0, 300, CANVAS_W, 1);          // línea neon piso

  for (let rep = -CANVAS_W; rep < CANVAS_W * 2; rep += CANVAS_W) {
    const bx = rep - offW;
    // Árboles pixel
    ctx.fillStyle = '#0b2a1a';
    ctx.fillRect(bx + 50, 208, 20, 34); ctx.fillRect(bx + 38, 195, 44, 18);
    ctx.fillRect(bx + 390, 208, 20, 34); ctx.fillRect(bx + 378, 195, 44, 18);
    // Vending machines
    ctx.fillStyle = '#7a0000';
    ctx.fillRect(bx + 502, 208, 28, 52);
    ctx.fillStyle = '#c40000';
    ctx.fillRect(bx + 505, 217, 22, 18);
    ctx.fillStyle = '#005f87';
    ctx.fillRect(bx + 568, 208, 28, 52);
    ctx.fillStyle = '#00a8d8';
    ctx.fillRect(bx + 571, 217, 22, 18);
    // Gato pixel
    ctx.fillStyle = '#111';
    ctx.fillRect(bx + 682, 228, 18, 12);
    ctx.fillRect(bx + 681, 222, 4, 7);
    ctx.fillRect(bx + 695, 222, 4, 7);
    ctx.fillStyle = '#ff004c'; ctx.fillRect(bx + 683, 232, 7, 3);
  }

  // ── SUELO (capa rápida 1.8×) ──────────────────────────────────────────────
  ctx.fillStyle = '#380a1e';
  ctx.fillRect(0, 300, CANVAS_W, 60);
  const offF = (s.dist * 1.8) % 110;
  for (let bx = -110; bx < CANVAS_W + 110; bx += 110) {
    ctx.fillStyle = 'rgba(255,46,147,0.28)';
    ctx.fillRect(bx - offF, 318, 55, 2);
  }

  // ── ÍTEMS/LOOT ────────────────────────────────────────────────────────────
  const ISRC = 128; // cada sprite de item es 128×128
  ctx.globalCompositeOperation = 'screen';
  if (frames.items) {
    // Obstáculos: row 3 = bugs/monedas, row 2 = RAM
    s.obstacles.forEach((o) => {
      const row = o.kind === 'ransomware' ? 3 : 2;
      const bob = o.kind === 'ransomware' ? Math.sin(o.phase * 2) * (o.floatAmp || 6) : 0;
      ctx.drawImage(frames.items,
        0, ISRC * row, ISRC, ISRC,
        o.x - 5, o.y + bob - 4, 44, 44);
    });
    // Loot flotante: row 0 = corazones, row 1 = latas
    s.loot.forEach((l) => {
      const row = l.value > 100 ? 0 : 1;
      const bob = Math.abs(Math.sin(l.phase)) * 7;
      ctx.drawImage(frames.items,
        0, ISRC * row, ISRC, ISRC,
        l.x - 10, l.y - 8 - bob, 40, 40);
    });
  }
  ctx.globalCompositeOperation = 'source-over';

  // flash de impacto en obstáculo
  s.obstacles.forEach((o) => {
    if (o.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, o.flash * 4)})`;
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  });

  // ── PARTÍCULAS ────────────────────────────────────────────────────────────
  s.particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.5));
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  // ── JUGADOR ───────────────────────────────────────────────────────────────
  // P1 = Jaeyoung (rojo), P2 = Sangwoo (negro)
  const sprite = operatorId === 'P2' ? frames.sangwoo : frames.jaeyoung;

  // Posición: pies del jugador están en s.y (GROUND_Y cuando está en el suelo)
  // Dibujamos el sprite de DST_H px de alto, con los pies tocando s.y
  const px  = PLAYER_X - 28;
  const py  = s.y - DST_H;

  // Seleccionar frame del spritesheet
  let srcX, srcY, srcW, srcH, dstW = DST_W, dstH = DST_H;

  if (s.attacking > 0) {
    // Fila 1, frame 1 = atacar/agarrar lata
    srcX = 0; srcY = SACT_Y; srcW = SACT_W; srcH = SACT_H;
    dstW = 100; dstH = 90;
  } else if (s.comboT > 0 && s.time - s.comboT < 0.5) {
    // Fila 1, frame 2 = coger corazón (reacción de colecta)
    srcX = SACT_W; srcY = SACT_Y; srcW = SACT_W; srcH = SACT_H;
    dstW = 100; dstH = 90;
  } else {
    // Fila 0 = carrera (6 frames) — frame fijo en salto
    const frame = s.grounded ? runFrame : 3;
    srcX = SRUN_W * frame; srcY = SRUN_Y; srcW = SRUN_W; srcH = SRUN_H;
  }

  // Parpadeo de invencibilidad
  const blink = s.invincible > 0 && Math.floor(s.time * 14) % 2 === 0;
  if (!blink && sprite) {
    ctx.globalCompositeOperation = 'screen'; // elimina fondo negro del jpg
    ctx.drawImage(sprite, srcX, srcY, srcW, srcH,
      px, s.y - dstH, dstW, dstH);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Estela de ataque
  if (s.attacking > 0 && !s.duck) {
    const prog = 1 - s.attacking / ATTACK_COOLDOWN;
    for (let i = 0; i < 10; i++) {
      const ang = -0.4 - i * 0.15 + prog * 1.3;
      const r   = 25 + i * 6;
      ctx.fillStyle = i % 2 ? '#00f0ff' : '#ffffff';
      ctx.fillRect(
        px + 72 + Math.cos(ang) * r,
        s.y - 55 + Math.sin(ang) * r * 0.55,
        4, 4
      );
    }
  }

  ctx.restore();
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
export default function ArcadeCanvas({
  setDraw, canvasRef, hud, gameState,
  operatorId, onStart, onResume, onExit, onRanking, submitting
}) {
  const framesRef = useRef({});

  useEffect(() => {
    const frames = framesRef.current;
    const load = (key, src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { frames[key] = img; };
    };
    load('jaeyoung', '/images/sprites/jaeyoung_spritesheet.png');
    load('sangwoo',  '/images/sprites/sangwoo_spritesheet.png');
    load('items',    '/images/sprites/items_spritesheet.png');
    return () => { frames.jaeyoung = frames.sangwoo = frames.items = null; };
  }, []);

  useEffect(() => {
    setDraw((ctx, s, t) => drawScene(ctx, s, t, framesRef.current, operatorId));
  }, [setDraw, operatorId]);

  const overlay = useMemo(() => {
    if (gameState === 'IDLE') return {
      title: 'SISTEMA LISTO // CAMPUS NIGHT RUN', tone: 'cyan',
      body: (
        <div className="keycaps" style={{ justifyContent: 'center' }}>
          <span className="key key--cyan">SPACE</span> SALTAR &nbsp;
          <span className="key key--magenta">F</span> ATACAR &nbsp;
          <span className="key key--amber">ESC</span> PAUSA
        </div>
      ),
      action: <button className="px-btn px-btn--primary px-btn--lg" onClick={onStart}>▶ INICIAR RUN</button>,
    };
    if (gameState === 'PAUSED') return {
      title: 'PAUSA // ESC', tone: 'amber',
      body: <div className="mono tiny text-dim">Loop congelado — física en buffer.</div>,
      action: (
        <div className="row gap-1" style={{ justifyContent: 'center' }}>
          <button className="px-btn px-btn--primary" onClick={onResume}>REANUDAR</button>
          <button className="px-btn" onClick={onExit}>SALIR</button>
        </div>
      ),
    };
    if (gameState === 'GAMEOVER') return {
      title: 'GAME OVER // MEMORY SEGFAULT', tone: 'danger',
      body: (
        <div className="mono tiny">
          PTS: <span className="text-amber">{hud?.score?.toLocaleString('en-US') || 0}</span> ·
          KILLS: <span className="text-green">{hud?.bugs || 0}</span>
        </div>
      ),
      action: null,
    };
    if (gameState === 'VICTORY') return {
      title: 'RANK ACK // VICTORIA', tone: 'green',
      body: (
        <div className="mono tiny">
          PTS: <span className="text-amber">{hud?.score?.toLocaleString('en-US') || 0}</span> (+5000) ·
          KILLS: <span className="text-green">{hud?.bugs || 0}</span>
        </div>
      ),
      action: <span className="mono tiny text-green">{submitting ? 'ENVIANDO...' : 'PUNTAJE REGISTRADO ✓'}</span>,
    };
    return null;
  }, [gameState, hud, onStart, onResume, onExit, submitting]);

  const mm = String(Math.floor((hud?.elapsed || 0) / 60)).padStart(2, '0');
  const ss = String(Math.floor((hud?.elapsed || 0) % 60)).padStart(2, '0');

  return (
    <div className="arcade-frame scanlines">
      <canvas ref={canvasRef} width={RENDER_W} height={RENDER_H} className="arcade-canvas" />

      {hud && (
        <div className="arcade-hud">
          <div className="row gap-1 wrap" style={{ pointerEvents: 'none' }}>
            <span className="hud-block hud-block--magenta">PTS {hud.score.toLocaleString('en-US')}</span>
            <span className="hud-block">KILLS {String(hud.bugs).padStart(3, '0')}</span>
            <span className="hud-block hud-block--cyan">{mm}:{ss}</span>
            <span className="hud-block">DIST {Math.floor(hud.dist)}m</span>
          </div>
          <div className="row gap-1 wrap" style={{ pointerEvents: 'none' }}>
            <span className="hud-block">HP <HpHearts hp={hud.lives} /></span>
            {hud.combo > 1 && (
              <span className="hud-block" style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}>
                COMBO×{hud.combo}
              </span>
            )}
            <span className="hud-block">VEL <span className="text-cyan">{Math.floor(hud.speed)}</span></span>
          </div>
        </div>
      )}

      {overlay && (
        <div className="overlay-msg">
          <MetaBadge tone={overlay.tone} doBlink>{overlay.title}</MetaBadge>
          {overlay.body}
          {overlay.action}
          {gameState === 'GAMEOVER' && (
            <div className="row gap-1" style={{ marginTop: 4 }}>
              <button className="px-btn" onClick={onStart}>↻ REVANCHA [SPACE]</button>
              <button className="px-btn px-btn--primary" onClick={onRanking}>IR AL RANKING</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
