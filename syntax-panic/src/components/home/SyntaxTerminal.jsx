import { MetaBadge } from '../ui/MetaBadge';

const METRICS = [
  { k: 'TOTAL RUNNERS', v: '14,209' },
  { k: 'SEMÁNTICA LIMPIA', v: '98.4%' },
  { k: 'WEBHOOK BRIDGE', v: 'ACTIVE [N8N]' },
];

export function SyntaxTerminal() {
  return (
    <div className="terminal-box" style={{ border: '2px solid var(--muted)', flex: 1, minWidth: 240 }}>
      <div className="row gap-1 mb-1">
        <MetaBadge tone="green">SYNTAX ENGINE v2.4 ONLINE</MetaBadge>
        <span className="mono tiny text-green blink" style={{ marginLeft: 'auto' }}>
          ● LIVE
        </span>
      </div>
      <div className="mono tiny">
        {METRICS.map((m) => (
          <div key={m.k} className="inspector-row" style={{ borderColor: 'var(--muted)', paddingLeft: 0 }}>
            <span className="inspector-key">{m.k}:</span>
            <span className="text-white">{m.v}</span>
          </div>
        ))}
        <div className="mt-1 text-green" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {'while (sangwoo.rage > 0) {\n  avoid(jaeyoung.trolling);\n}'}
          <span className="cursor-block" />
        </div>
      </div>
    </div>
  );
}