import { MetaBadge } from '../ui/MetaBadge';

const ACTIONS = [
  { label: 'SPACE', fn: 'JUMP' },
  { label: 'F', fn: 'ATTACK' },
  { label: 'ESC', fn: 'PAUSE' },
];

export function ArcadeController({ events, onDispatch }) {
  return (
    <div className="pixel-panel" style={{ padding: 12, height: '100%' }}>
      <div className="row gap-1 mb-1">
        <MetaBadge tone="amber">ARCADE CONTROLLER</MetaBadge>
        <span className="mono tiny text-dim" style={{ marginLeft: 'auto' }}>
          INPUT DISPATCH QUEUE
        </span>
      </div>

      <div className="row gap-1 mb-1 wrap">
        {ACTIONS.map((a) => (
          <button key={a.label} className="px-btn px-btn--sm" onClick={() => onDispatch(a.fn)}>
            <span className="key key--cyan" style={{ minWidth: 22, height: 22 }}>
              {a.label}
            </span>
            {a.fn}
          </button>
        ))}
      </div>

      <div className="dispatch-queue" style={{ height: 78, flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
          {[...events].reverse().map((e) => (
            <span key={e.id} className="dispatch-item">
              {e.label}
            </span>
          ))}
          {!events.length && <span className="mono tiny text-dim">SIN INPUTS DISPARADOS...</span>}
        </div>
        <div className="row gap-1 flex-1" style={{ alignItems: 'flex-end' }}>
          {events.slice(-10).map((e, i) => (
            <span
              key={e.id}
              className="dispatch-bar"
              style={{ height: `${8 + (i * 4) % 40}px`, opacity: 0.4 + (i / 10) * 0.6 }}
            />
          ))}
        </div>
      </div>

      <div className="mono tiny text-dim mt-1">
        ▸ QUEUE LEN: {events.length} · UI EVENTS ENVIADOS AL useRef DEL RUNNER
      </div>
    </div>
  );
}