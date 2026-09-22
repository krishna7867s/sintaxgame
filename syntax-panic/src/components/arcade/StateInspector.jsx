import { MetaBadge } from '../ui/MetaBadge';

export function StateInspector({ gameState, hud, operatorId, modeId, levelId }) {
  const rows = [
    ['gameState', gameState],
    ['score', hud.score],
    ['lives', hud.lives],
    ['selectedOperator', operatorId],
    ['selectedMode', modeId],
    ['activeLevel', `/nivel/${levelId}`],
    ['monsters_killed', hud.bugs],
    ['dist (m)', Math.floor(hud.dist)],
    ['vel', Math.floor(hud.speed)],
  ];
  return (
    <div className="pixel-panel" style={{ padding: 12 }}>
      <div className="row gap-1 mb-1">
        <MetaBadge tone="cyan">REACT HOOKS STATE INSPECTOR</MetaBadge>
        <span className="mono tiny text-green" style={{ marginLeft: 'auto' }}>
          ● useRef sync
        </span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="inspector-row">
          <span className="inspector-key">{k}</span>
          <span className={typeof v === 'number' ? 'text-amber mono' : 'text-white mono'}>{String(v)}</span>
        </div>
      ))}
    </div>
  );
}