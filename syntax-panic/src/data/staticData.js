export const REST_ENDPOINTS = {
  scores: 'http://localhost:3000/scores',
  operators: 'http://localhost:3000/operators',
  webhook:
    'https://n8n.syntaxpanic.internal/webhook/game-events',
  apiScores: 'https://api.syntaxpanic.dev/v1/scores',
};

export const OPERATORS = [
  {
    id: 'P1',
    name: 'Chu Sangwoo',
    role: 'LOGIC GOD',
    avatar: '/images/avatars/sangwoo-reference.jpeg',
    stats: [
      { key: 'PRECISIÓN', value: '+10% CRIT' },
      { key: 'CONTROL GIT', value: 'STRICT' },
    ],
    passive: '> AUTO-FORMAT LINTER (INMUNIDAD A TYPOS)',
    palette: 'magenta',
    sfxTag: 'LOGIC_ENGINE',
  },
  {
    id: 'P2',
    name: 'Jang Jaeyoung',
    role: 'CREATIVE REBEL',
    avatar: '/images/avatars/jaeyoung-reference.jpeg',
    stats: [
      { key: 'VELOCIDAD SPRINT', value: '+15% VEL' },
      { key: 'REFLEJO VISUAL', value: 'AGILE' },
    ],
    passive: '> RED HOODIE DRIFT (DOBLE SALTO AÉREO)',
    palette: 'cyan',
    sfxTag: 'CREATIVE_REBEL',
  },
  {
    id: 'P3',
    name: 'Chibi Runner',
    role: 'SPEED CODER',
    avatar: '/images/sprites/chibi-runner-reference.jpeg',
    stats: [
      { key: 'AGILIDAD', value: '+20% VEL' },
      { key: 'EVASIÓN', value: 'ALTA' },
    ],
    passive: '> QUICK ESCAPE (DODGE BUGS)',
    palette: 'yellow',
    sfxTag: 'CHIBI_RUN',
  },
  {
    id: 'P4',
    name: 'Chibi Actions',
    role: 'MULTI-TASKER',
    avatar: '/images/sprites/chibi-actions-reference.jpeg',
    stats: [
      { key: 'EFICIENCIA', value: '+15% EXP' },
      { key: 'FOCUS', value: 'STEADY' },
    ],
    passive: '> PARALLEL THREADS (MULTI-ACTION)',
    palette: 'green',
    sfxTag: 'CHIBI_ACT',
  }
];

export const GAME_MODES = [
  {
    id: '01',
    title: 'Sprint Universitario',
    meta: 'NOVELA VISUAL • ~12 MIN • 3 FINALES',
    badge: 'CANON',
    kind: 'visual',
    level: null,
  },
  {
    id: '02',
    title: 'Campus Night Run',
    meta: 'ARCADE RUNNER 2D • DIFICULTAD ALTA • TECLADO/GAMEPAD',
    badge: 'NIVEL 1 LIVE',
    kind: 'arcade',
    level: 1,
  },
  {
    id: '03',
    title: 'Duelo de Código PvP',
    meta: 'RANKING TELEGRAM & WEBHOOK BRIDGE',
    badge: 'SYNC: N8N',
    kind: 'pvp',
    level: null,
  },
];

export const LEVELS = [
  {
    id: 1,
    route: '/nivel/1',
    title: 'CAMPUS NIGHT RUN',
    subtitle: 'SEOUL GROUNDS // 12:47 AM',
    bg: '/images/levels/campus_bg.png',
    difficulty: 'ALTA',
    winDistance: 2000,
  },
  {
    id: 2,
    route: '/nivel/2',
    title: 'SEOLINGUN DRAFT ROOM',
    subtitle: 'DRAFT ROOM // 02:13 AM',
    bg: '/images/levels/campus_bg.png',
    difficulty: 'CRÍTICA',
    winDistance: 2600,
  },
];

export const MAX_LIVES = 3;
export const WIN_SCORE_BONUS = 5000;

export const SEED_SCORES = [
  { id: '1', rank: 1, player_identifier: 'Sangwoo_God', user_tag: 'CS_SENIOR_CS01', operator: 'SANGWOO', level: '/nivel/2', bugs_fixed: 142, total_points: 98450 },
  { id: '2', rank: 2, player_identifier: 'Jaeyoung_Art', user_tag: 'DESIGN_LEAD_09', operator: 'JAEYOUNG', level: '/nivel/2', bugs_fixed: 119, total_points: 87120 },
  { id: '3', rank: 3, player_identifier: 'NullPointerCat', user_tag: 'CS_JR_DEV_22', operator: 'SANGWOO', level: '/nivel/1', bugs_fixed: 104, total_points: 72300 },
  { id: '4', rank: 4, player_identifier: 'RaceCondition', user_tag: 'INFRA_TECH_07', operator: 'JAEYOUNG', level: '/nivel/1', bugs_fixed: 88, total_points: 65410 },
  { id: '5', rank: 5, player_identifier: 'Yarn_Workspace', user_tag: 'WEB_DEP_14', operator: 'SANGWOO', level: '/nivel/2', bugs_fixed: 76, total_points: 58920 },
  { id: '6', rank: 6, player_identifier: 'Grok_Dev', user_tag: 'FS_DEV_31', operator: 'JAEYOUNG', level: '/nivel/1', bugs_fixed: 63, total_points: 51200 },
  { id: '7', rank: 7, player_identifier: 'MemoryLeak_X', user_tag: 'BACKEND_03', operator: 'SANGWOO', level: '/nivel/1', bugs_fixed: 55, total_points: 43480 },
  { id: '8', rank: 8, player_identifier: 'Kaomoji_Chan', user_tag: 'FRONTEND_18', operator: 'JAEYOUNG', level: '/nivel/2', bugs_fixed: 41, total_points: 36750 },
];

export const WORKFLOW_NODES = [
  {
    id: 1,
    kind: 'TRIGGER',
    title: 'Webhook POST',
    subtitle: '/game_session_end',
    desc: 'Recibe el evento de fin de sesión con el payload del jugador (identifier, operator, level, score, bugs_fixed).',
    payload: '{ "event": "game_session_end", "score": 6120, "operator": "SANGWOO" }',
  },
  {
    id: 2,
    kind: 'IF BRANCH',
    title: 'Highscore Gate',
    subtitle: 'score > 5000 ?',
    desc: 'Compuerta condicional: si el score supera 5000 pasa a la rama de persistencia, si no, responde ack sin puntear.',
    payload: '{ "dup": true, "gate": "score = 6120 > 5000" }',
  },
  {
    id: 3,
    kind: 'JS CODE',
    title: 'Checksum Hash',
    subtitle: 'crypto.hmac SHA256',
    desc: 'Firma el payload con HMAC-SHA256 usando el secreto del bridge para prevenir spoofing de puntajes.',
    payload: '{ "hmac": "9f2d...e71a", "secret_id": "wb-bridge-v1" }',
  },
  {
    id: 4,
    kind: 'STORAGE',
    title: 'Postgres / db.json',
    subtitle: 'UPSERT player_sessions',
    desc: 'Inserta o actualiza la sesión del jugador en la tabla player_sessions (rank recomputado en vivo).',
    payload: '{ "op": "UPSERT", "table": "player_sessions", "rows": 1 }',
  },
  {
    id: 5,
    kind: 'NOTIFIER',
    title: 'Discord Bot Embed',
    subtitle: '#arcade-achievements',
    desc: 'Publica embed de logro en el canal #arcade-achievements con el nuevo récord y la insignia desbloqueada.',
    payload: '{ "channel": "#arcade-achievements", "embed": { "title": "NEW HIGHSCORE" } }',
  },
  {
    id: 6,
    kind: 'RESPONSE',
    title: 'Respond Webhook',
    subtitle: '{ rank, token, xp }',
    desc: 'Responde al cliente con el rank actual, un token JWT de sesión y la XP ganada en la partida.',
    payload: '{ "rank": 1, "token": "jwt...", "xp": 250 }',
  },
];

export const FLOW_CONNECTORS = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
];

export const SENDED_TOAST_MS = 2600;

export const SAMPLE_CODE_PERSISTENCE = `// src/hooks/useApiScores.ts
import axios from 'axios';

export interface ScorePayload {
  player_identifier: string;
  user_tag: string;
  operator: 'SANGWOO' | 'JAEYOUNG';
  level: string;
  bugs_fixed: number;
  total_points: number;
}

const SCORES_URL = 'http://localhost:3000/scores';
const N8N_WEBHOOK = 'https://n8n.syntaxpanic.internal/webhook/game-events';

export async function persistScore(payload: ScorePayload) {
  try {
    const { data } = await axios.post(N8N_WEBHOOK, payload, {
      headers: { Authorization: 'Bearer JWT' },
    });
    const created = await axios.post(SCORES_URL, payload);
    return { ok: true, n8n: data, created: created.data };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}`;
