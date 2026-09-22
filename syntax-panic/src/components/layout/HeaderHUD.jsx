import { NavLink, Link } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { MetaBadge } from '../ui/MetaBadge';
import { HpHearts } from '../ui/Bits';

const navRoutes = [
  { to: '/', label: 'INICIO' },
  { to: '/nivel/1', label: 'JUGAR NIVEL' },
  { to: '/ranking', label: 'RANKING & API' },
  { to: '/flujo-n8n', label: 'FLUJO N8N' },
];

export function HeaderHUD() {
  const { totalPoints, levelHp, audio, selectedOperator } = useGame();
  return (
    <header className="hud-header">
      <div className="hud-inner">
        <Link to="/" className="hud-logo" title="SYNTAX PANIC">
          <img
            src="/images/logo_nuevo.png"
            alt="SYNTAX PANIC"
            className="hud-logo-img"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
          <MetaBadge tone="cyan">SYS: ROM v1.4</MetaBadge>
        </Link>

        <nav className="hud-nav">
          {navRoutes.map((r) => (
            <NavLink
              key={r.to}
              to={r.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {r.label}
            </NavLink>
          ))}
        </nav>

        <div className="hud-metrics">
          <span className="metric-chip metric-chip--live">
            <span className="status-dot" /> N8N: SYNCED
          </span>
          <span className="metric-chip">
            <span className="text-magenta">HP:</span>
            <HpHearts hp={levelHp} />
          </span>
          <span className="metric-chip">
            <span className="text-amber">PTS:</span> {totalPoints.toLocaleString('en-US')}
          </span>
          <span className="metric-chip">
            <span className="text-cyan">◈</span> DEV_PILOT LVL 08
            <span className="text-dim mono">[{selectedOperator === 'P1' ? 'SW' : 'JY'}]</span>
          </span>
          <button
            className="px-btn px-btn--sm"
            onClick={() => {
              audio.toggleMute();
              audio.sfx.click();
            }}
            title={audio.muted ? 'Desmutear sonido' : 'Mutear sonido'}
          >
            {audio.muted ? (
              <>
                <span className="text-danger">[X]</span> SND OFF
              </>
            ) : (
              <>
                <span className="text-cyan">(=)</span> SND ON
              </>
            )}
          </button>
          <button
            className="px-btn px-btn--sm"
            onClick={() => {
              audio.toggleMusic();
              audio.sfx.click();
            }}
            title={audio.musicOn ? 'Detener música' : 'Iniciar música (chipsynth loop)'}
          >
            {audio.musicOn ? 'MUSIC ON' : 'MUSIC OFF'}
          </button>
        </div>
      </div>
    </header>
  );
}