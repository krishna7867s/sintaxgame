import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const NOTE_FREQ = {
  A1: 55,
  B2: 123.47,
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98,
  A2: 110,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  Fs3: 185,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.26,
  G5: 783.99,
  A5: 880,
};

// ─── ESCALA & ACORDES SYNTHWAVE ────────────────────────────────────────────
const CHORDS = [
  // Am  — "Night Drive"
  {
    bass: ['A1', 'A1', 'E2', 'A1'],
    arp:  ['A3','C4','E4','A4', 'G4','E4','C4','A3', 'E4','A4','C5','E5', 'A4','E4','C4','A3'],
    lead: ['E4',null,'A4',null, 'C5',null,'E5',null, 'G5',null,'E5',null, 'C5',null,'A4',null],
  },
  // F   — "Neon Blvd"
  {
    bass: ['F2','F2','C3','F2'],
    arp:  ['F3','A3','C4','F4', 'E4','C4','A3','F3', 'C4','F4','A4','C5', 'F4','C4','A3','F3'],
    lead: ['C4',null,'F4',null, 'A4',null,'C5',null, 'F5',null,'C5',null, 'A4',null,'F4',null],
  },
  // G   — "Rooftop Run"
  {
    bass: ['G2','G2','D3','G2'],
    arp:  ['G3','B3','D4','G4', 'Fs4','D4','B3','G3', 'D4','G4','B4','D5', 'G4','D4','B3','G3'],
    lead: ['B4',null,'D5',null, 'G5',null,'B4',null, 'D5',null,'G5',null, 'Fs4',null,'D5',null],
  },
  // E   — "Code Rush"
  {
    bass: ['E2','E2','B2','E2'],
    arp:  ['E3','G3','B3','E4', 'D4','B3','G3','E3', 'B3','E4','G4','B4', 'E4','B3','G3','E3'],
    lead: ['G4',null,'B4',null, 'E5',null,'G5',null, 'B4',null,'E5',null, 'G4',null,'B4',null],
  },
];

const BPM       = 175;          // más veloz y energético
const STEP_DUR  = 60 / BPM / 4;

function makeNoiseBuffer(ctx, seconds = 0.2, gain = 0.5) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * gain;
  }
  return buffer;
}

function tone(
  ctx,
  dest,
  { type = 'square', freq = 440, freqEnd = null, dur = 0.12, vol = 0.22, attack = 0.005, slide = 0 },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), ctx.currentTime + dur);
  }
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(ctx.currentTime + slide);
  osc.stop(ctx.currentTime + dur + slide);
}

/**
 * Global Web Audio system: chiptune/synthwave loop + retro 8-bit SFX.
 */
export function useAudio() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const musicGainRef = useRef(null);
  const schedRef = useRef(null);
  const noiseRef = useRef(null);

  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('sp_muted') === '1';
    } catch {
      return false;
    }
  });
  const [musicOn, setMusicOn] = useState(false);

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    const musicGain = ctx.createGain();
    musicGain.gain.value = 0.62;
    musicGain.connect(master);
    ctxRef.current = ctx;
    masterRef.current = master;
    musicGainRef.current = musicGain;
    noiseRef.current = makeNoiseBuffer(ctx);
    return ctx;
  }, [muted]);

  const resume = useCallback(() => {
    const ctx = ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }, [ensure]);

  useEffect(() => {
    const handler = () => {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [ensure]);

  const scheduleStep = useCallback((ctx, stepIndex, when) => {
    const dest = musicGainRef.current;
    if (!dest) return;
    const bar   = Math.floor(stepIndex / 16) % 4;
    const step  = stepIndex % 16;
    const chord = CHORDS[bar];
    const t     = when - ctx.currentTime;

    // ── BAJO con slide synthwave ──────────────────────────────────────────
    const bassF = NOTE_FREQ[chord.bass[Math.floor(step / 4)]];
    const bassNext = NOTE_FREQ[chord.bass[Math.min(3, Math.floor(step / 4) + 1)]];
    tone(ctx, dest, {
      type: 'sawtooth', freq: bassF, freqEnd: bassNext * 0.998,
      dur: 0.28, vol: 0.18, slide: t, attack: 0.004,
    });
    // sub-bass punch
    tone(ctx, dest, {
      type: 'sine', freq: bassF * 0.5, freqEnd: bassF * 0.48,
      dur: 0.22, vol: 0.22, slide: t, attack: 0.002,
    });

    // ── ARPEGIO (lead pad tipo DX7) ───────────────────────────────────────
    const arpF = NOTE_FREQ[chord.arp[step]];
    tone(ctx, dest, { type: 'triangle', freq: arpF, dur: STEP_DUR * 0.85, vol: 0.13, slide: t, attack: 0.003 });
    // capa sawth para el brillo synthwave
    tone(ctx, dest, { type: 'sawtooth', freq: arpF * 1.003, dur: STEP_DUR * 0.8, vol: 0.04, slide: t, attack: 0.005 });

    // ── MELODÍA LEAD ─────────────────────────────────────────────────────
    const leadNote = chord.lead[step];
    if (leadNote) {
      const lf = NOTE_FREQ[leadNote];
      tone(ctx, dest, { type: 'square', freq: lf, freqEnd: lf * 0.997, dur: STEP_DUR * 1.8, vol: 0.09, slide: t, attack: 0.004 });
      // vibrato: segunda capa levemente desafinada
      tone(ctx, dest, { type: 'square', freq: lf * 1.007, dur: STEP_DUR * 1.8, vol: 0.05, slide: t + 0.002, attack: 0.005 });
    }

    // ── CHORD PAD cada 4 pasos ────────────────────────────────────────────
    if (step % 4 === 0) {
      const root = NOTE_FREQ[chord.bass[0]];
      [1, 1.26, 1.498].forEach((ratio, ri) => {
        tone(ctx, dest, {
          type: 'sawtooth', freq: root * ratio,
          dur: STEP_DUR * 4, vol: 0.028, slide: t + ri * 0.002, attack: 0.06,
        });
      });
    }

    // ── BATERÍA ───────────────────────────────────────────────────────────
    // Kick (paso 0, 8)
    if (step === 0 || step === 8) {
      tone(ctx, dest, { type: 'sine', freq: 160, freqEnd: 38, dur: 0.18, vol: 0.65, slide: t, attack: 0.001 });
      // click de ataque
      tone(ctx, dest, { type: 'square', freq: 220, freqEnd: 55, dur: 0.04, vol: 0.22, slide: t, attack: 0.001 });
    }
    // Snare / clap (paso 4, 12)
    if (step === 4 || step === 12) {
      const src = ctx.createBufferSource();
      src.buffer = noiseRef.current;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1600; bp.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.28, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.14);
      src.connect(bp); bp.connect(g); g.connect(dest);
      src.start(when); src.stop(when + 0.15);
      // cuerpo del snare
      tone(ctx, dest, { type: 'sine', freq: 210, freqEnd: 140, dur: 0.1, vol: 0.16, slide: t, attack: 0.001 });
    }
    // Hi-hat abierto (pasos pares)
    if (step % 2 === 0) {
      const src = ctx.createBufferSource();
      src.buffer = noiseRef.current;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
      const g = ctx.createGain();
      const vol = step % 4 === 0 ? 0.10 : 0.06;
      g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + (step % 4 === 0 ? 0.06 : 0.04));
      src.connect(hp); hp.connect(g); g.connect(dest);
      src.start(when); src.stop(when + 0.07);
    }
    // Hi-hat cerrado off-beat (pasos impares)
    if (step % 2 === 1) {
      const src = ctx.createBufferSource();
      src.buffer = noiseRef.current;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 9000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.04, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.025);
      src.connect(hp); hp.connect(g); g.connect(dest);
      src.start(when); src.stop(when + 0.03);
    }
  }, []);

  const startMusic = useCallback(() => {
    const ctx = ensure();
    if (!ctx) return;
    if (schedRef.current) return;
    const begin = () => {
      if (schedRef.current) return;
      let nextTime = ctx.currentTime + 0.12;
      let stepIndex = 0;
      schedRef.current = setInterval(() => {
        while (nextTime < ctx.currentTime + 0.2) {
          scheduleStep(ctx, stepIndex, nextTime);
          nextTime += STEP_DUR;
          stepIndex += 1;
        }
      }, 55);
      setMusicOn(true);
    };
    if (ctx.state === 'running') {
      begin();
    } else {
      ctx.resume();
      const onState = () => {
        if (ctx.state === 'running') {
          begin();
          ctx.removeEventListener('statechange', onState);
        }
      };
      ctx.addEventListener('statechange', onState);
    }
  }, [ensure, scheduleStep]);

  const stopMusic = useCallback(() => {
    if (schedRef.current) {
      clearInterval(schedRef.current);
      schedRef.current = null;
    }
    setMusicOn(false);
  }, []);

  const toggleMusic = useCallback(() => {
    if (schedRef.current) stopMusic();
    else startMusic();
  }, [startMusic, stopMusic]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sp_muted', next ? '1' : '0');
      } catch {
        /* noop */
      }
      const master = masterRef.current;
      if (master) master.gain.setTargetAtTime(next ? 0 : 0.5, ctxRef.current.currentTime, 0.02);
      return next;
    });
  }, []);

  const sfx = useMemo(() => {
    return {
      click() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'square', freq: 720, freqEnd: 300, dur: 0.06, vol: 0.14 });
      },
      select() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'square', freq: 523, dur: 0.05, vol: 0.12 });
        tone(ctx, masterRef.current, { type: 'square', freq: 784, dur: 0.06, vol: 0.12, slide: 0.06 });
      },
      jump() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'square', freq: 240, freqEnd: 680, dur: 0.16, vol: 0.16 });
      },
      resolve() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'square', freq: 392, dur: 0.06, vol: 0.14 });
        tone(ctx, masterRef.current, { type: 'square', freq: 587, dur: 0.06, vol: 0.14, slide: 0.06 });
        tone(ctx, masterRef.current, { type: 'square', freq: 784, dur: 0.09, vol: 0.14, slide: 0.12 });
      },
      collect() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'triangle', freq: 988, dur: 0.05, vol: 0.12 });
        tone(ctx, masterRef.current, { type: 'triangle', freq: 1319, dur: 0.08, vol: 0.12, slide: 0.05 });
      },
      hit() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'sawtooth', freq: 180, freqEnd: 55, dur: 0.28, vol: 0.2 });
        const src = ctx.createBufferSource();
        src.buffer = noiseRef.current;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        src.connect(g);
        g.connect(masterRef.current);
        src.start();
        src.stop(ctx.currentTime + 0.2);
      },
      slash() {
        const ctx = ensure();
        if (!ctx || muted) return;
        const src = ctx.createBufferSource();
        src.buffer = noiseRef.current;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2800;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.22, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        src.connect(hp);
        hp.connect(g);
        g.connect(masterRef.current);
        src.start();
        src.stop(ctx.currentTime + 0.13);
        tone(ctx, masterRef.current, { type: 'square', freq: 980, freqEnd: 220, dur: 0.09, vol: 0.12 });
      },
      monsterHit() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'sawtooth', freq: 150, freqEnd: 42, dur: 0.24, vol: 0.26 });
        const src = ctx.createBufferSource();
        src.buffer = noiseRef.current;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
        src.connect(g);
        g.connect(masterRef.current);
        src.start();
        src.stop(ctx.currentTime + 0.18);
      },
      lootCollect() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'triangle', freq: 880, dur: 0.05, vol: 0.12 });
        tone(ctx, masterRef.current, { type: 'triangle', freq: 1174, dur: 0.07, vol: 0.12, slide: 0.05 });
        tone(ctx, masterRef.current, { type: 'triangle', freq: 1568, dur: 0.1, vol: 0.12, slide: 0.1 });
      },
      victory() {
        const ctx = ensure();
        if (!ctx || muted) return;
        const seq = [440, 554, 659, 880, 1109];
        seq.forEach((f, i) => {
          tone(ctx, masterRef.current, { type: 'square', freq: f, dur: 0.14, vol: 0.16, slide: i * 0.09 });
        });
        tone(ctx, masterRef.current, { type: 'triangle', freq: 1760, dur: 0.4, vol: 0.12, slide: 0.5 });
      },
      gameover() {
        const ctx = ensure();
        if (!ctx || muted) return;
        const seq = [392, 330, 262, 196];
        seq.forEach((f, i) => {
          tone(ctx, masterRef.current, { type: 'sawtooth', freq: f, dur: 0.22, vol: 0.14, slide: i * 0.16 });
        });
      },
      error() {
        const ctx = ensure();
        if (!ctx || muted) return;
        tone(ctx, masterRef.current, { type: 'square', freq: 180, freqEnd: 70, dur: 0.12, vol: 0.15 });
      },
    };
  }, [ensure, muted]);

  useEffect(() => {
    return () => {
      if (schedRef.current) clearInterval(schedRef.current);
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);

  return { muted, musicOn, toggleMute, toggleMusic, startMusic, stopMusic, sfx, resume };
}