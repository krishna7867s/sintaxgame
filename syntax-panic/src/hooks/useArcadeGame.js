import { useCallback, useEffect, useRef, useState } from 'react';

// Coordenadas internas pixeladas y tamanio de salida responsivo 16:9.
export const CANVAS_W = 960;
export const CANVAS_H = 360;
export const RENDER_W = 800;
export const RENDER_H = 450;
export const GROUND_Y = 302;

const PLAYER_X = 150;
const PLAYER_W = 26;
const PLAYER_H = 44;
const PLAYER_DUCK_H = 24;
const GRAVITY = 2160;
const JUMP_V = -720;
const BASE_SPEED = 300;
const MAX_SPEED = 570;
const LEVEL_DURATION = 102;
const INVINCIBLE_MS = 1400;
const COMBO_WINDOW = 2.2;
const ATTACK_RANGE = 96;
const ATTACK_COOLDOWN = 0.26;

export const GAME_STATES = ['IDLE', 'PLAYING', 'PAUSED', 'GAMEOVER', 'VICTORY'];

const rand = (min, max) => min + Math.random() * (max - min);

// Monstruos informaticos en lugar de sodas / senales de error.
function makeObstacle(kind, x) {
  const base = {
    x,
    kind,
    id: `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    phase: rand(0, Math.PI * 2),
    flash: 0,
  };
  if (kind === 'ransomware') {
    return { ...base, w: 46, h: 58, y: GROUND_Y - 78, score: 200, hp: 2, floatAmp: 9, speedMul: 0.6 };
  }
  if (kind === 'nullptr') {
    return { ...base, w: 26, h: 20, y: GROUND_Y - 20, score: 120, hp: 1, hopping: true, speedMul: 1 };
  }
  return { ...base, w: 26, h: 20, y: GROUND_Y - 20, score: 120, hp: 1, hopping: true, speedMul: 1 };
}

function spawnLoot(s, x, baseScore) {
  s.loot.push({
    kind: 'loot',
    x,
    y: GROUND_Y - 16,
    w: 10,
    h: 10,
    phase: Math.random() * Math.PI * 2,
    value: Math.max(40, Math.round(baseScore * 0.6)),
  });
}

function initialPhysics(targetDistance) {
  return {
    game: 'IDLE',
    time: 0,
    lastT: 0,
    elapsed: 0,
    y: GROUND_Y,
    vy: 0,
    grounded: true,
    duck: false,
    speed: BASE_SPEED,
    dist: 0,
    obstacles: [],
    loot: [],
    particles: [],
    path: [],
    spawnT: 1.0,
    score: 0,
    lives: 3,
    bugs: 0,
    combo: 0,
    comboT: 0,
    invincible: 0,
    hitFlash: 0,
    attacking: 0,
    hudT: 0,
    targetDistance,
    jumps: 0,
  };
}

/**
 * Bucle principal del runner a 60 FPS sobre un `useRef`.
 * El estado de fisicas mutable vive en `stateRef` para no disparar
 * re-renderizados; el HUD se sincroniza a React de forma throttled.
 */
export function useArcadeGame({ sfx, targetDistance = 2000, operatorId = 'P1' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(initialPhysics(targetDistance));
  const drawRef = useRef(() => {});
  const eventsRef = useRef([]);

  const [gameState, setGameState] = useState('IDLE');
  const [hud, setHud] = useState({
    score: 0,
    lives: 3,
    bugs: 0,
    dist: 0,
    speed: BASE_SPEED,
    elapsed: 0,
    combo: 0,
  });
  const [lastEvents, setLastEvents] = useState([]);
  const sfxRef = useRef(sfx);
  useEffect(() => {
    sfxRef.current = sfx;
  }, [sfx]);

  const pushEvent = useCallback((label) => {
    eventsRef.current = [...eventsRef.current.slice(-7), { id: `${label}_${Date.now()}`, label, t: Date.now() }];
    setLastEvents(eventsRef.current);
  }, []);

  const setDraw = useCallback((fn) => {
    drawRef.current = fn;
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    if (s.game === 'PLAYING' || s.game === 'PAUSED') return;
    const fresh = initialPhysics(targetDistance);
    fresh.game = 'PLAYING';
    fresh.lastT = performance.now();
    stateRef.current = fresh;
    setGameState('PLAYING');
    pushEvent('BOOT [START]');
    if (sfxRef.current) sfxRef.current.click();
  }, [pushEvent, targetDistance]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.game !== 'PLAYING') return;
    const mayDoubleJump = operatorId === 'P2' && s.jumps < 2;
    if (s.grounded || mayDoubleJump) {
      s.vy = JUMP_V;
      s.grounded = false;
      s.jumps += 1;
      for (let i = 0; i < 6; i += 1) {
        s.particles.push({ x: PLAYER_X + 6, y: s.y, vx: rand(-60, 60), vy: rand(-20, 10), life: 0.4, size: 3, color: '#00f0ff' });
      }
      if (sfxRef.current) sfxRef.current.jump();
    }
  }, [operatorId]);

  const attack = useCallback(() => {
    const s = stateRef.current;
    if (s.game !== 'PLAYING' || s.attacking > 0) return;
    s.attacking = ATTACK_COOLDOWN;
    const sb = swordHitbox();
    let killed = 0;

    for (let i = s.obstacles.length - 1; i >= 0; i -= 1) {
      const o = s.obstacles[i];
      if (!overlap(sb, obstacleHitbox(o))) continue;
      o.hp -= 1;
      o.flash = 0.14;
      for (let p = 0; p < 7; p += 1) {
        s.particles.push({
          x: o.x + o.w / 2,
          y: (o.kind === 'ransomware' ? o.y : o.y) + o.h / 2,
          vx: rand(-170, 170),
          vy: rand(-220, 30),
          life: rand(0.2, 0.5),
          size: rand(2, 4),
          color: p % 2 ? '#ffb347' : '#f5f0ff',
        });
      }
      if (o.hp > 0) continue;

      killed += 1;
      s.obstacles.splice(i, 1);
      const now = s.time;
      s.combo = now - s.comboT < COMBO_WINDOW ? s.combo + 1 : 1;
      s.comboT = now;
      s.bugs += 1;
      s.score += o.score;
      spawnLoot(s, o.x + o.w / 2, o.score);
      for (let p = 0; p < 16; p += 1) {
        s.particles.push({
          x: o.x + o.w / 2,
          y: o.y + o.h / 2,
          vx: rand(-190, 190),
          vy: rand(-240, 40),
          life: rand(0.3, 0.8),
          size: rand(2, 5),
          color: ['#39ff14', '#00f0ff', '#ff2e93', '#ffb347'][p % 4],
        });
      }
    }

    if (sfxRef.current) sfxRef.current.slash();
    if (killed > 0 && sfxRef.current) sfxRef.current.monsterHit();
  }, []);

  // Compat alias: el "catch" anterior de bugs ahora es el ataque con [F].
  const tryResolveBug = attack;

  const reset = useCallback(() => {
    stateRef.current = initialPhysics(targetDistance);
    setGameState('IDLE');
    setHud({ score: 0, lives: 3, bugs: 0, dist: 0, speed: BASE_SPEED, elapsed: 0, combo: 0 });
    pushEvent('RESET [RESTART]');
  }, [pushEvent, targetDistance]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.game === 'PLAYING') {
      s.game = 'PAUSED';
      setGameState('PAUSED');
      pushEvent('PAUSE [ESC]');
    } else if (s.game === 'PAUSED') {
      s.game = 'PLAYING';
      setGameState('PLAYING');
      pushEvent('RESUME [ESC]');
    }
  }, [pushEvent]);

  // -------- fisicas --------
  const update = useCallback((s, dt, d) => {
    if (s.game !== 'PLAYING') {
      s.time += dt;
      return;
    }

    s.time += dt;
    s.elapsed += dt;
    s.speed = Math.min(MAX_SPEED, BASE_SPEED + Math.floor(s.elapsed / 10) * 30);
    s.dist += s.speed * dt;

    // salto / gravedad
    if (!s.grounded) {
      s.vy += GRAVITY * dt;
      s.y += s.vy * dt;
      if (s.y >= GROUND_Y) {
        s.y = GROUND_Y;
        s.grounded = true;
        s.vy = 0;
        s.jumps = 0;
        for (let i = 0; i < 4; i += 1) {
          s.particles.push({ x: PLAYER_X + 6, y: GROUND_Y, vx: rand(-70, -10), vy: rand(-30, -5), life: 0.3, size: 2, color: '#2a2744' });
        }
      }
    }

    if (s.invincible > 0) s.invincible -= dt;
    if (s.hitFlash > 0) s.hitFlash -= dt;
    if (s.attacking > 0) s.attacking -= dt;
    if (s.comboT > 0 && s.time - s.comboT > COMBO_WINDOW) s.combo = 0;

    // spawn de monstruos
    s.spawnT -= dt;
    if (s.spawnT <= 0) {
      const kinds = ['ransomware', 'nullptr'];
      const weights = [0.55, 0.45];
      let r = Math.random();
      const kind = kinds[r < weights[0] ? 0 : 1];
      s.obstacles.push(makeObstacle(kind, CANVAS_W + 60));
      s.spawnT = rand(1.2, 2.4);
    }

    // mover monstruos (el ransomware avanza mas lento: es un tanque de 2 golpes)
    for (let i = s.obstacles.length - 1; i >= 0; i -= 1) {
      const o = s.obstacles[i];
      o.x -= s.speed * dt * o.speedMul;
      o.phase += dt * 5;
      if (o.flash > 0) o.flash -= dt;
      if (o.x + o.w < -30) s.obstacles.splice(i, 1);
    }

    // mover loot
    for (let i = s.loot.length - 1; i >= 0; i -= 1) {
      const l = s.loot[i];
      l.x -= s.speed * dt;
      l.phase += dt * 6;
      if (l.x + l.w < -30) {
        s.loot.splice(i, 1);
        continue;
      }
      const lb = { x: l.x, y: l.y, w: l.w, h: l.h };
      if (!overlap(playerHitbox(s), lb)) continue;
      s.loot.splice(i, 1);
      const now = s.time;
      s.combo = now - s.comboT < COMBO_WINDOW ? s.combo + 1 : 1;
      s.comboT = now;
      const gained = l.value * Math.max(1, s.combo);
      s.score += gained;
      for (let p = 0; p < 12; p += 1) {
        s.particles.push({
          x: l.x + l.w / 2,
          y: l.y,
          vx: rand(-120, 120),
          vy: rand(-160, 40),
          life: rand(0.3, 0.7),
          size: rand(2, 4),
          color: ['#ffb347', '#00f0ff', '#39ff14'][p % 3],
        });
      }
      if (sfxRef.current) sfxRef.current.lootCollect();
    }

    // colisiones (embestida sin ataque = perdida de HP)
    if (s.invincible <= 0) {
      const pb = playerHitbox(s);
      for (let i = 0; i < s.obstacles.length; i += 1) {
        const o = s.obstacles[i];
        const ob = obstacleHitbox(o);
        if (!overlap(pb, ob)) continue;
        s.obstacles.splice(i, 1);
        s.lives -= 1;
        s.combo = 0;
        s.invincible = INVINCIBLE_MS / 1000;
        s.hitFlash = 0.35;
        if (sfxRef.current) sfxRef.current.hit();
        if (s.lives <= 0) {
          s.game = 'GAMEOVER';
          setGameState('GAMEOVER');
          if (sfxRef.current) sfxRef.current.gameover();
        }
        break;
      }
    }

    // estela del runner
    s.path.push({ x: PLAYER_X + 13, y: s.y - (s.duck ? PLAYER_DUCK_H : PLAYER_H) + 6 });
    if (s.path.length > 14) s.path.shift();

    // particulas
    for (let i = s.particles.length - 1; i >= 0; i -= 1) {
      const p = s.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.life -= dt;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    // El nivel termina con el temporizador de 01:42.
    if (s.elapsed >= LEVEL_DURATION) {
      s.game = 'VICTORY';
      s.score += 5000;
      s.score = Math.min(s.score, 999999);
      for (let i = 0; i < 72; i += 1) {
        s.particles.push({
          x: rand(90, 870), y: rand(20, 150), vx: rand(-150, 150), vy: rand(-40, 180),
          life: rand(1.1, 2.1), size: rand(3, 7), color: ['#ff2e93', '#00f0ff', '#ffb347', '#39ff14'][i % 4],
        });
      }
      setGameState('VICTORY');
      if (sfxRef.current) sfxRef.current.victory();
    }

    s.score = Math.min(s.score, 999999);
    s.hudT += dt;
    if (s.hudT >= 0.12) {
      s.hudT = 0;
      d({
        score: s.score,
        lives: s.lives,
        bugs: s.bugs,
        dist: s.dist,
        speed: s.speed,
        elapsed: s.elapsed,
        combo: s.combo,
      });
    }
    if (s.game === 'VICTORY') {
      d({ score: s.score, lives: s.lives, bugs: s.bugs, dist: s.dist, speed: s.speed, elapsed: s.elapsed, combo: s.combo });
    }
  }, []);

  // -------- loop principal --------
  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;
    const s = stateRef.current;
    s.lastT = performance.now();

    const loop = (t) => {
      const dt = Math.min((t - s.lastT) / 1000, 0.05);
      s.lastT = t;
      update(s, dt, setHud);
      drawRef.current(ctx, s, t, canvas);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update]);

  // -------- teclado --------
  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        if (s.game === 'GAMEOVER' || s.game === 'VICTORY') {
          reset();
          start();
        } else if (s.game === 'IDLE' || s.game === 'PAUSED') {
          if (s.game === 'PAUSED') togglePause();
          else start();
        } else if (s.game === 'PLAYING') {
          jump();
          pushEvent('JUMP  [SPACE]');
        }
        return;
      }
      if (e.code === 'KeyF') {
        attack();
        pushEvent('ATTACK [F]');
        return;
      }
      if (e.code === 'Escape') {
        togglePause();
        return;
      }
      if (e.code === 'ArrowDown') {
        s.duck = true;
        pushEvent('DUCK  [↓]');
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'ArrowDown') stateRef.current.duck = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [jump, pushEvent, reset, start, togglePause, attack]);

  const dispatchInput = useCallback(
    (label) => {
      pushEvent(label);
      if (label.includes('JUMP')) jump();
      else if (label.includes('ATTACK')) attack();
      else if (label.includes('PAUSE')) togglePause();
    },
    [jump, pushEvent, togglePause, attack],
  );

  return {
    canvasRef,
    setDraw,
    gameState,
    hud,
    lastEvents,
    start,
    reset,
    togglePause,
    jump,
    attack,
    tryResolveBug,
    dispatchInput,
  };
}

export function playerHitbox(s) {
  const h = s.duck ? PLAYER_DUCK_H : PLAYER_H;
  const inset = 5;
  return {
    x: PLAYER_X + inset,
    y: s.y - h + 5,
    w: PLAYER_W - inset * 1.6,
    h: h - 8,
  };
}

export function obstacleHitbox(o) {
  if (o.kind === 'ransomware') {
    const bob = Math.sin(o.phase * 2) * o.floatAmp;
    return { x: o.x + 5, y: o.y + bob + 4, w: o.w - 10, h: o.h - 8 };
  }
  if (o.kind === 'nullptr' || o.hopping) {
    const bob = Math.abs(Math.sin(o.phase * 3)) * 12;
    return { x: o.x + 3, y: GROUND_Y - 20 - bob + 4, w: o.w - 6, h: 12 };
  }
  return { x: o.x, y: o.y, w: o.w, h: o.h };
}

export function swordHitbox() {
  return { x: PLAYER_X + 14, y: GROUND_Y - 118, w: ATTACK_RANGE, h: 118 };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export { PLAYER_X, PLAYER_W, PLAYER_H, PLAYER_DUCK_H, GRAVITY, JUMP_V, BASE_SPEED, MAX_SPEED, ATTACK_COOLDOWN };