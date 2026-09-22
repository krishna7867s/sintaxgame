import { useGame } from '../../context/GameContext';

export function OperatorCard({ operator, active, onClick }) {
  const { audio } = useGame();
  const select = () => {
    audio.sfx.select();
    onClick(operator.id);
  };
  return (
    <button
      type="button"
      className={`operator-card${active ? ' operator-card--active' : ''}`}
      onClick={select}
      aria-pressed={active}
      style={{ textAlign: 'left' }}
    >
      <span className="operator-check">✓</span>
      <div className="operator-avatar">
        <img src={operator.avatar} alt={operator.name} loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
      </div>
      <div className="flex-1">
        <div className="operator-name">
          {operator.name} <span className="text-magenta">[</span>
          <span className={`text-${operator.palette}`}>{operator.role}</span>
          <span className="text-magenta">]</span>
        </div>
        <div className="operator-role">PLAYER_{operator.id} · {operator.role}</div>
        <div className="operator-stats">
          {operator.stats.map((s) => (
            <span key={s.key} className="stat-tag">
              {s.key} {s.value}
            </span>
          ))}
          <span className="stat-tag">PASSIVE ✓</span>
        </div>
        <div className="passive-box">{operator.passive}</div>
      </div>
      {active && <span className="mode-index" style={{ fontSize: 16, color: 'var(--magenta)' }}>ACTIVE</span>}
    </button>
  );
}