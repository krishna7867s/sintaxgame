import { StatBar } from '../ui/Bits';

export function AffinityBar() {
  return (
    <div className="row gap-2 wrap" style={{ alignItems: 'stretch', width: '100%' }}>
      <span className="mono tiny text-cyan" style={{ whiteSpace: 'nowrap' }}>
        AFINIDAD: <span className="text-magenta">♥ ♥ ♥</span> <span className="text-dim">60%</span>
      </span>
      <StatBar label="SANGWOO↔JAEYOUNG" value={60} tone="magenta" />
    </div>
  );
}