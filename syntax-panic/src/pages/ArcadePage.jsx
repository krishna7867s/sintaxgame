import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/staticData';
import { useArcadeGame } from '../hooks/useArcadeGame';
import { useApiScores } from '../hooks/useApiScores';
import { MetaBadge } from '../components/ui/MetaBadge';
import { KeyCap } from '../components/ui/PixelButton';
import { useToasts, ToastStack } from '../components/ui/Toast';
import ArcadeCanvas from '../components/arcade/ArcadeCanvas';
import { StateInspector } from '../components/arcade/StateInspector';
import { ArcadeController } from '../components/arcade/ArcadeController';

export default function ArcadePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const level = LEVELS.find((l) => l.id === Number(id));
  const { selectedOperator, audio, addPoints, setLevelHp } = useGame();
  const { addScore } = useApiScores();
  const { items: toasts, push, dismiss } = useToasts();
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  const game = useArcadeGame({
    sfx: audio.sfx,
    targetDistance: level ? level.winDistance : 2000,
    operatorId: selectedOperator,
  });

  const submitScore = useCallback(async () => {
    if (submittedRef.current || !level) return;
    submittedRef.current = true;
    setSubmitted(true);
    const operatorName = selectedOperator === 'P2' ? 'JAEYOUNG' : 'SANGWOO';
    const identifier = selectedOperator === 'P2' ? 'Jaeyoung_Dev' : 'Sangwoo_Dev';
    const payload = {
      player_identifier: identifier,
      user_tag: `DEV_PILOT_${String(level.id).padStart(2, '0')}`,
      operator: operatorName,
      level: `/nivel/${level.id}`,
      bugs_fixed: game.hud.bugs,
      total_points: game.hud.score,
    };
    const res = await addScore(payload);
    if (res.ok) {
      addPoints(game.hud.score);
      setLevelHp(game.hud.lives);
      push(res.target === 'n8n-simulation' ? 'WEBHOOK N8N SIMULADO (offline) + POST /scores OK' : 'POST /scores → json-server + webhook N8N DISPARADO', 'magenta');
      navigate('/ranking');
    } else {
      push(`POST falló: ${res.error}`, 'danger');
      submittedRef.current = false;
      setSubmitted(false);
    }
  }, [addPoints, addScore, game.hud.bugs, game.hud.lives, game.hud.score, level, navigate, push, selectedOperator, setLevelHp]);

  useEffect(() => {
    if (game.gameState !== 'VICTORY') return undefined;
    const persistTimer = window.setTimeout(() => submitScore(), 0);
    return () => window.clearTimeout(persistTimer);
  }, [game.gameState, submitScore]);

  if (!level) return <Navigate to="/nivel/1" replace />;

  return (
    <div className="mt-1">
      <div className="row wrap gap-1 mb-2" style={{ justifyContent: 'space-between' }}>
        <span className="mono tiny text-dim">
          <span className="text-cyan">ROUTE:</span> /nivel/:id <span className="text-magenta">→</span> /nivel/
          {level.id} {level.title}
        </span>
        <div className="row gap-1">
          <MetaBadge tone="cyan">DIFICULTAD {level.difficulty}</MetaBadge>
          <MetaBadge tone="magenta">OP {selectedOperator}</MetaBadge>
          <MetaBadge tone="green">OBJ {level.winDistance}m</MetaBadge>
        </div>
      </div>

      <ArcadeCanvas
        setDraw={game.setDraw}
        canvasRef={game.canvasRef}
        hud={game.hud}
        gameState={game.gameState}
        operatorId={selectedOperator}
        onStart={game.start}
        onResume={game.togglePause}
        onExit={() => navigate('/')}
        onRanking={() => navigate('/ranking')}
        submitting={submitted}
      />

      <div className="row wrap gap-1 mt-1 mono tiny text-dim">
        <KeyCap label="SPACE" tone="cyan">
          Saltar
        </KeyCap>
        <KeyCap label="F" tone="magenta">
          Atacar monstruo
        </KeyCap>
        <KeyCap label="ESC" tone="amber">
          Pausa
        </KeyCap>
      </div>

      <div className="grid grid--main mt-2">
        <StateInspector
          gameState={game.gameState}
          hud={game.hud}
          operatorId={selectedOperator}
          modeId="02"
          levelId={level.id}
        />
        <ArcadeController events={game.lastEvents} onDispatch={game.dispatchInput} />
      </div>

      <div className="mono tiny text-dim mt-2">
        ▸ FONDO = MINIATURA DEL VIDEO · MODE ARCADE COMBAT: [SPACE] saltar, [F] atacar, loot en cadena × COMBO.
      </div>

      <ToastStack items={toasts} onDismiss={dismiss} />
    </div>
  );
}
