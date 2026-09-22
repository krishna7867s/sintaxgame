import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { MetaBadge } from '../ui/MetaBadge';

export function GameModeCard({ mode, active, onSelect }) {
  const navigate = useNavigate();
  const { audio, setSelectedMode, setActiveLevel } = useGame();

  const handle = (e) => {
    e.stopPropagation();
    audio.sfx.select();
    setSelectedMode(mode.id);
    onSelect?.(mode.id);
    if (mode.kind === 'arcade' && mode.level) {
      setActiveLevel(mode.level);
      navigate(`/nivel/${mode.level}`);
    }
  };

  return (
    <button type="button" className={`mode-card${active ? ' mode-card--active' : ''}`} onClick={handle}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="mode-index">{mode.id}</span>
        <MetaBadge tone={mode.kind === 'arcade' ? 'cyan' : mode.kind === 'pvp' ? 'amber' : 'magenta'}>
          {mode.badge}
        </MetaBadge>
      </div>
      <div className="mode-title">{mode.title}</div>
      <div className="mode-meta">{mode.meta}</div>
      <div className="mode-cta">
        {mode.kind === 'arcade' ? (
          <span className="mono tiny text-cyan">▸ INICIAR RUN →</span>
        ) : (
          <span className="mono tiny text-dim">▸ SELECCIONAR</span>
        )}
      </div>
    </button>
  );
}