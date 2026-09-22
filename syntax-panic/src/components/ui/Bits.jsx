import { MetaBadge } from './MetaBadge';

export function SectionTitle({ label, extra, tone = 'magenta' }) {
  return (
    <div className="section-title">
      <MetaBadge tone={tone}>{label}</MetaBadge>
      {extra ? <span className="mono tiny text-dim flex-1">{extra}</span> : <span className="rule" />}
    </div>
  );
}

export function HpHearts({ hp, max = 3 }) {
  return (
    <span className="mono" style={{ letterSpacing: '2px' }}>
      {'♥'.repeat(Math.max(0, hp))}
      <span className="text-dim">{'♥'.repeat(Math.max(0, max - hp))}</span>
    </span>
  );
}

export function StatBar({ label, value, max = 100, tone = 'magenta' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="row gap-1" style={{ width: '100%' }}>
      <span className="mono tiny text-cyan" style={{ minWidth: 90 }}>
        {label}
      </span>
      <div className="affinity-track flex-1">
        <div className="affinity-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="mono tiny" style={{ color: `var(--${tone})` }}>
        {value}%
      </span>
    </div>
  );
}