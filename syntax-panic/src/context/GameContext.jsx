/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAudio } from '../hooks/useAudio';

const GameContext = createContext(null);

const PTS_KEY = 'syntax_panic_total_pts';
const HP_KEY = 'syntax_panic_level_hp';

function readNum(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return Number(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

export function GameProvider({ children }) {
  const audio = useAudio();
  const [selectedOperator, setSelectedOperator] = useState('P1');
  const [selectedMode, setSelectedMode] = useState('02');
  const [activeLevel, setActiveLevel] = useState(() => readNum('sp_level', 1));
  const [levelHp, setLevelHp] = useState(() => readNum(HP_KEY, 3));
  const [totalPoints, setTotalPoints] = useState(() => readNum(PTS_KEY, 84920));

  useEffect(() => {
    try {
      localStorage.setItem(PTS_KEY, String(totalPoints));
    } catch {
      /* ignore */
    }
  }, [totalPoints]);

  useEffect(() => {
    try {
      localStorage.setItem(HP_KEY, String(levelHp));
    } catch {
      /* ignore */
    }
  }, [levelHp]);

  const value = useMemo(
    () => ({
      audio,
      selectedOperator,
      setSelectedOperator,
      selectedMode,
      setSelectedMode,
      activeLevel,
      setActiveLevel,
      levelHp,
      setLevelHp,
      totalPoints,
      addPoints: (pts) => setTotalPoints((p) => Math.max(0, p + pts)),
      resetHp: () => setLevelHp(3),
    }),
    [audio, selectedOperator, selectedMode, activeLevel, levelHp, totalPoints],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}