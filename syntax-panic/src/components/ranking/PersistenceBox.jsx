import { useState, useEffect } from 'react';
import { SAMPLE_CODE_PERSISTENCE } from '../../data/staticData';

export function PersistenceBox() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 350);
    return () => clearTimeout(t);
  }, []);
  const lines = SAMPLE_CODE_PERSISTENCE.split('\n');

  return (
    <div className="pixel-panel pixel-panel--green" style={{ padding: 16 }}>
      <div className="row gap-1 wrap" style={{ justifyContent: 'space-between' }}>
        <span className="badge badge--green">CRITERIO TÉCNICO 2.4 – PERSISTENCIA</span>
        <span className="badge badge--cyan">
          hook: <span className="text-cyan">src/hooks/useApiScores.ts</span>
        </span>
      </div>
      <div className="console mt-1" style={{ maxHeight: 420 }}>
        {lines.map((ln, i) => (
          <div key={i} className="ln">
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <span style={{ color: ln.startsWith('//') ? 'var(--dim)' : ln.includes("'") ? 'var(--amber)' : 'var(--white)' }}>
              {ln || ' '}
            </span>
          </div>
        ))}
        {show && (
          <div className="ln">
            <span className="n">--</span>
            <span className="text-green cursor-block">TS PERSISTENCE LOADED ✔</span>
          </div>
        )}
      </div>
    </div>
  );
}