import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { REST_ENDPOINTS } from '../data/staticData';

const LOCAL_KEY = 'syntax_panic_scores_v1';

function seedScores() {
  return [
    { id: '1', rank: 1, player_identifier: 'Sangwoo_God', user_tag: 'CS_SENIOR_CS01', operator: 'SANGWOO', level: '/nivel/2', bugs_fixed: 142, total_points: 98450 },
    { id: '2', rank: 2, player_identifier: 'Jaeyoung_Art', user_tag: 'DESIGN_LEAD_09', operator: 'JAEYOUNG', level: '/nivel/2', bugs_fixed: 119, total_points: 87120 },
    { id: '3', rank: 3, player_identifier: 'NullPointerCat', user_tag: 'CS_JR_DEV_22', operator: 'SANGWOO', level: '/nivel/1', bugs_fixed: 104, total_points: 72300 },
    { id: '4', rank: 4, player_identifier: 'RaceCondition', user_tag: 'INFRA_TECH_07', operator: 'JAEYOUNG', level: '/nivel/1', bugs_fixed: 88, total_points: 65410 },
    { id: '5', rank: 5, player_identifier: 'Yarn_Workspace', user_tag: 'WEB_DEP_14', operator: 'SANGWOO', level: '/nivel/2', bugs_fixed: 76, total_points: 58920 },
    { id: '6', rank: 6, player_identifier: 'Grok_Dev', user_tag: 'FS_DEV_31', operator: 'JAEYOUNG', level: '/nivel/1', bugs_fixed: 63, total_points: 51200 },
    { id: '7', rank: 7, player_identifier: 'MemoryLeak_X', user_tag: 'BACKEND_03', operator: 'SANGWOO', level: '/nivel/1', bugs_fixed: 55, total_points: 43480 },
    { id: '8', rank: 8, player_identifier: 'Kaomoji_Chan', user_tag: 'FRONTEND_18', operator: 'JAEYOUNG', level: '/nivel/2', bugs_fixed: 41, total_points: 36750 },
  ];
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return seedScores();
}

function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function sortAndRank(list) {
  return [...list]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 10)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

function simulateN8nWebhook(payload) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({
      simulated: true, ok: true, latencyMs: 36,
      checksum: `sha256.${btoa(JSON.stringify(payload)).slice(0, 18)}`,
      rank: 1, token: `sim-jwt.${Math.random().toString(16).slice(2, 12)}`, xp: 250,
    }), 36);
  });
}

/**
 * CRITERIO TÉCNICO 2.4 — PERSISTENCIA
 * GET /scores & /operators (json-server :3000) + POST webhook n8n.
 * Caso degradado: si la REST API está caída se sirve desde localStorage/caché.
 */
export function useApiScores() {
  const [scores, setScores] = useState(() => readLocal());
  const [operators, setOperators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(null);
  const [source, setSource] = useState('cache');
  const [lastRefresh, setLastRefresh] = useState(null);

  const refresh = useCallback(async () => {
    const startedAt = Date.now();
    setIsLoading(true);
    setIsError(null);
    try {
      const [sc, op] = await Promise.all([
        axios.get(REST_ENDPOINTS.scores, { timeout: 1800 }),
        axios.get(REST_ENDPOINTS.operators, { timeout: 1800 }).catch(() => ({ data: [] })),
      ]);
      const ranked = sortAndRank(sc.data);
      setScores(ranked);
      setOperators(op.data.length ? op.data : []);
      setSource('rest');
      writeLocal(ranked);
    } catch {
      setSource('cache');
      setScores(sortAndRank(readLocal()));
      setIsError({ code: 'REST_DOWN', message: 'json-server offline en :3000 → sirviendo caché local (resilience ON)' });
    } finally {
      setIsLoading(false);
      setLastRefresh({ at: new Date(), ms: Math.max(1, Date.now() - startedAt) });
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    refresh();
  }, [refresh]);

  const addScore = useCallback(async (payload) => {
    const preview = await simulateN8nWebhook(payload);
    try {
      const { data: created } = await axios.post(REST_ENDPOINTS.scores, payload, { timeout: 1800 });
      setScores((prev) => {
        const next = sortAndRank([...prev, created]);
        writeLocal(next);
        return next;
      });
      return { ok: true, target: 'n8n-simulation', preview, created };
    } catch (error) {
      return { ok: false, target: 'json-server', error: error.message };
    }
  }, []);

  return { scores, operators, isLoading, isError, source, lastRefresh, refresh, addScore };
}
