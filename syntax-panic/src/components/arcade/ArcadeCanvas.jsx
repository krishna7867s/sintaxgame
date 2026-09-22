import { useEffect, useMemo, useRef } from 'react';
import { CANVAS_W, CANVAS_H, RENDER_W, RENDER_H, GROUND_Y, PLAYER_X, PLAYER_H, PLAYER_DUCK_H, ATTACK_COOLDOWN } from '../../hooks/useArcadeGame';
import { MetaBadge } from '../ui/MetaBadge';
import { HpHearts } from '../ui/Bits';

// Spritesheet layout:
// Personajes: Fila 0 = 6 frames de carrera (128px cada uno), Fila 1 = 2 frames de acción (128px cada uno)
//   - media_1790111150895.jpg = Jaeyoung (sudadera ROJA) -> jaeyoung_spritesheet.png
//   - media_1790111150836.jpg = Sangwoo (gorra NEGRA)   -> sangwoo_spritesheet.png
// Items:  Fila 0=Corazones, Fila 1=Latas, Fila 2=RAMs, Fila 3=Bugs/Monedas, Fila 4=Gato

const SPRITE_FRAME_W = 170;  // ancho real de cada frame: imagen ~1024px / 6 cols ≈ 170px
const SPRITE_FRAME_H = 180;  // alto de fila de carrera aprox
const SPRITE_ACTION_Y = 180; // y-offset para fila de acciones
const SPRITE_ACTION_W = 256; // cada frame de acción ocupa ~mitad de la imagen
const SPRITE_ACTION_H = 220;

function drawScene(ctx, s, t, frames, operatorId) {
  const ms = performance.now();
  const currentFrame = Math.floor(ms / 90) % 6;

  ctx.save();
  ctx.scale(RENDER_W / CANVAS_W, RENDER_H / CANVAS_H);
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Fondo Degradado Synthwave
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bgGrad.addColorStop(0, '#0d0520');
  bgGrad.addColorStop(0.5, '#3b1060');
  bgGrad.addColorStop(1, '#c0186a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Estrellas estáticas
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 50; i++) {
    const stx = ((i * 293) % CANVAS_W);
    const sty = ((i * 137) % 160);
    const blink = Math.sin(t * 0.003 + i * 1.7) > 0.3 ? 2 : 1;
    ctx.fillRect(stx, sty, blink, blink);
  }

  // Luna
  const moonX = CANVAS_W - 130 - ((s.dist * 0.03) % (CANVAS_W + 260));
  ctx.fillStyle = '#fff9d6';
  ctx.beginPath();
  ctx.arc(moonX, 70, 42, 0, Math.PI * 2);
  ctx.fill();
  // Brillo neon de la luna
  ctx.fillStyle = 'rgba(255,249,214,0.08)';
  ctx.beginPath();
  ctx.arc(moonX, 70, 60, 0, Math.PI * 2);
  ctx.fill();

  // Edificios Parallax (capa lenta)
  const offBuildings = (s.dist * 0.35) % CANVAS_W;
  const buildingColors = ['#1a0b3d', '#1e0e44', '#150830'];
  for (let bx = -CANVAS_W; bx < CANVAS_W * 2; bx += CANVAS_W) {
    const baseX = bx - offBuildings;
    // Ventanas encendidas aleatorias
    [[baseX + 50, 100, 70, 200], [baseX + 160, 70, 110, 230], [baseX + 320, 90, 90, 210],
     [baseX + 480, 110, 80, 190], [baseX + 620, 60, 100, 240], [baseX + 800, 95, 75, 205]].forEach(([bxp, by, bw, bh], bi) => {
      ctx.fillStyle = buildingColors[bi % 3];
      ctx.fillRect(bxp, by, bw, bh);
      // Ventanas
      ctx.fillStyle = Math.random() < 0.005 ? '#ff2e93' : 'rgba(0,240,255,0.15)';
      for (let wy = by + 10; wy < by + bh - 20; wy += 18) {
        for (let wx = bxp + 8; wx < bxp + bw - 8; wx += 14) {
          if ((wx + wy) % 3 !== 0) ctx.fillRect(wx, wy, 8, 10);
        }
      }
    });
  }

  // Muro parallax medio
  const offWall = (s.dist * 0.8) % CANVAS_W;
  ctx.fillStyle = '#2e1520';
  ctx.fillRect(0, 238, CANVAS_W, 65);
  // Línea neon techo muro
  ctx.fillStyle = '#ff2e93';
  ctx.fillRect(0, 238, CANVAS_W, 2);

  // Decoraciones sobre el muro (se mueven con él)
  for (let bx = -CANVAS_W; bx < CANVAS_W * 2; bx += CANVAS_W) {
    const baseX = bx - offWall;
    // Árboles pixel art
    ctx.fillStyle = '#0d2e1e';
    ctx.fillRect(baseX + 55, 200, 22, 38);
    ctx.fillRect(baseX + 42, 185, 48, 20);
    ctx.fillStyle = '#0f3d27';
    ctx.fillRect(baseX + 390, 200, 22, 38);
    ctx.fillRect(baseX + 377, 185, 48, 20);
    // Vending machines
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(baseX + 500, 205, 30, 55);
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(baseX + 503, 215, 24, 20);
    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(baseX + 570, 205, 30, 55);
    ctx.fillStyle = '#48cae4';
    ctx.fillRect(baseX + 573, 215, 24, 20);
    // Gato pixel
    ctx.fillStyle = '#111';
    ctx.fillRect(baseX + 680, 225, 20, 14);
    ctx.fillRect(baseX + 679, 219, 5, 7);
    ctx.fillRect(baseX + 694, 219, 5, 7);
    ctx.fillStyle = '#ff0044';
    ctx.fillRect(baseX + 682, 230, 8, 3);
  }

  // Suelo con rayas de velocidad (parallax rápido)
  ctx.fillStyle = '#3d0d22';
  ctx.fillRect(0, 300, CANVAS_W, 60);
  ctx.fillStyle = '#6a0dad';
  ctx.fillRect(0, 300, CANVAS_W, 3);
  // Rayas horizontales
  const offFloor = (s.dist * 2) % 120;
  for (let bx = -120; bx < CANVAS_W + 120; bx += 120) {
    ctx.fillStyle = 'rgba(255,46,147,0.35)';
    ctx.fillRect(bx - offFloor, 316, 60, 2);
  }

  // Items (spritesheet 128x128 por frame)
  const itemSrcW = 128;
  const itemSrcH = 128;
  const itemDstW = 42;
  const itemDstH = 42;

  // Obstáculos — usar globalCompositeOperation 'screen' para quitar fondo negro
  ctx.globalCompositeOperation = 'screen';
  if (frames.items) {
    s.obstacles.forEach((o) => {
      const row = o.kind === 'ransomware' ? 3 : 2;
      const bob = o.kind === 'ransomware' ? Math.sin(o.phase * 2) * (o.floatAmp || 6) : 0;
      ctx.drawImage(frames.items, 0, itemSrcH * row, itemSrcW, itemSrcH,
        o.x - 6, o.y + bob - 8, itemDstW, itemDstH);
    });
  }
  // Loot flotante
  if (frames.items) {
    s.loot.forEach((l) => {
      const row = l.value > 100 ? 0 : 1;
      const bob = Math.abs(Math.sin(l.phase)) * 6;
      ctx.drawImage(frames.items, 0, itemSrcH * row, itemSrcW, itemSrcH,
        l.x - 10, l.y - 10 - bob, itemDstW, itemDstH);
    });
  }
  ctx.globalCompositeOperation = 'source-over';

  // Flash de golpe en obstáculo (renderizado en source-over)
  s.obstacles.forEach((o) => {
    if (o.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${o.flash * 3})`;
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  });

  // Partículas
  s.particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.5));
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  // ---- DIBUJAR JUGADOR con sprite ----
  // Jaeyoung = P1 (sudadera ROJA) por defecto,  Sangwoo = P2 (gorra NEGRA)
  // P1 = operatorId 'P1' → jaeyoung (rojo)
  // P2 = operatorId 'P2' → sangwoo (negro)
  const sprite = operatorId === 'P2' ? frames.sangwoo : frames.jaeyoung;

  const playerDstW = 96;
  const playerDstH = 96;
  const px = PLAYER_X - 30;
  const py = s.y - playerDstH + 8;

  // Decidir qué fila y qué columna del spritesheet usar
  let srcX, srcY, srcW, srcH;

  if (s.attacking > 0) {
    // Fila 2, frame 1 = Atacar/coger lata (columna 0)
    srcX = 0;
    srcY = SPRITE_ACTION_Y;
    srcW = SPRITE_ACTION_W;
    srcH = SPRITE_ACTION_H;
  } else if (s.comboT > 0 && s.time - s.comboT < 0.5) {
    // Fila 2, frame 2 = Coger corazón (columna 1)
    srcX = SPRITE_ACTION_W;
    srcY = SPRITE_ACTION_Y;
    srcW = SPRITE_ACTION_W;
    srcH = SPRITE_ACTION_H;
  } else if (!s.grounded) {
    // Salto: frame 3 de la fila de carrera (en el aire, piernas extendidas)
    srcX = SPRITE_FRAME_W * 3;
    srcY = 0;
    srcW = SPRITE_FRAME_W;
    srcH = SPRITE_FRAME_H;
  } else {
    // Carrera normal: ciclo de frames 0-5
    srcX = SPRITE_FRAME_W * currentFrame;
    srcY = 0;
    srcW = SPRITE_FRAME_W;
    srcH = SPRITE_FRAME_H;
  }

  // Parpadeo de invencibilidad
  if (s.invincible > 0 && Math.floor(s.time * 14) % 2 === 0) {
    // skip draw = efecto de parpadeo
  } else if (sprite) {
    // 'screen' para eliminar el fondo negro del JPG
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(sprite, srcX, srcY, srcW, srcH, px, py, playerDstW, playerDstH);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Estela de espada al atacar
  if (s.attacking > 0 && !s.duck) {
    const prog = 1 - s.attacking / ATTACK_COOLDOWN;
    for (let i = 0; i < 8; i++) {
      const ang = -0.5 - i * 0.18 + prog * 1.2;
      const r = 28 + i * 5;
      const ex = px + 80 + Math.cos(ang) * r;
      const ey = py + 50 + Math.sin(ang) * r * 0.6;
      ctx.fillStyle = i % 2 ? '#00f0ff' : '#ffffff';
      ctx.fillRect(ex, ey, 4, 4);
    }
  }

  ctx.restore();
}

export default function ArcadeCanvas({ setDraw, canvasRef, hud, gameState, operatorId, onStart, onResume, onExit, onRanking, submitting }) {
  const framesRef = useRef({});

  useEffect(() => {
    const frames = framesRef.current;
    
    const imgJaeyoung = new Image();
    imgJaeyoung.src = '/images/sprites/jaeyoung_spritesheet.png';
    imgJaeyoung.onload = () => { frames.jaeyoung = imgJaeyoung; };

    const imgSangwoo = new Image();
    imgSangwoo.src = '/images/sprites/sangwoo_spritesheet.png';
    imgSangwoo.onload = () => { frames.sangwoo = imgSangwoo; };

    const imgItems = new Image();
    imgItems.src = '/images/sprites/items_spritesheet.png';
    imgItems.onload = () => { frames.items = imgItems; };

    return () => {
      frames.jaeyoung = null;
      frames.sangwoo = null;
      frames.items = null;
    };
  }, []);

  useEffect(() => {
    // Delegamos el ciclo `requestAnimationFrame` al game loop en useArcadeGame,
    // que llamará a setDraw(ctx, s, t)
    setDraw((ctx, s, t) => {
      drawScene(ctx, s, t, framesRef.current, operatorId);
    });
  }, [setDraw, operatorId]);

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
        body: <div className="mono tiny text-dim">El loop del runner queda congelado.</div>,
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
            PTS FINAL: <span className="text-amber">{hud?.score?.toLocaleString('en-US') || 0}</span> · KILLS:{' '}
            <span className="text-green">{hud?.bugs || 0}</span>
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
            PTS: <span className="text-amber">{hud?.score?.toLocaleString('en-US') || 0}</span> (+5000 BONUS) · KILLS:{' '}
            <span className="text-green">{hud?.bugs || 0}</span>
          </div>
        ),
        action: (
          <span className="mono tiny text-green">{submitting ? 'POST /scores + N8N EN CURSO...' : 'PUNTAJE REGISTRADO AUTOMÁTICAMENTE'}</span>
        ),
      };
    }
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
      )}

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
