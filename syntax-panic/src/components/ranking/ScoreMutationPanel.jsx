import { useEffect, useRef, useState } from 'react';
import { MetaBadge } from '../ui/MetaBadge';
import { PixelButton } from '../ui/PixelButton';
import { useToasts, ToastStack } from '../ui/Toast';

export function ScoreMutationPanel({ addScore, onPosted }) {
  const [form, setForm] = useState({
    player_identifier: '',
    user_tag: 'DEV_PILOT_08',
    operator: 'SANGWOO',
    level: '/nivel/1',
    bugs_fixed: 0,
    total_points: '',
  });
  const [consoleLines, setConsoleLines] = useState([
    { n: 1, text: `> POST_ACK · esperando mutación...`, tone: 'text-dim' },
    { n: 2, text: `> target: https://n8n.syntaxpanic.internal/webhook/game-events`, tone: 'text-dim' },
  ]);
  const [pending, setPending] = useState(false);
  const consoleRef = useRef(null);
  const { items, push, dismiss } = useToasts();
  const lineCount = useRef(3);

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleLines]);

  const log = (text, tone = 'text-white') => {
    setConsoleLines((prev) => [...prev.slice(-30), { n: lineCount.current++, text, tone }]);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const pts = Number(form.total_points);
    if (!form.player_identifier.trim()) {
      log('> ERR: PLAYER IDENTIFIER REQUERIDO', 'text-danger');
      push('PLAYER IDENTIFIER requerido', 'danger');
      return;
    }
    if (!Number.isFinite(pts) || pts < 0 || pts > 999999) {
      log('> ERR: SCORE FUERA DE RANGO (0..999999)', 'text-danger');
      push('Score inválido: rango 0..999999', 'danger');
      return;
    }
    setPending(true);
    log(`> POST /scores <- ${JSON.stringify({ ...form, total_points: pts })}`, 'text-cyan');
    log('> → webhook N8N [BEARER JWT]...', 'text-amber');
    const res = await addScore({ ...form, total_points: pts, bugs_fixed: Number(form.bugs_fixed) || 0 });
    setPending(false);
    if (res.ok) {
      log(`> 200 OK · target=${res.target}`, 'text-green');
      log(`> n8n=${JSON.stringify(res.preview)}`, 'text-green');
      log(`> persistida en db.json (json-server :3000) id=${res.created.id}`, 'text-green');
      push('Score persistido en db.json ✔ (json-server)', '');
      onPosted?.(res.created);
      setForm((f) => ({ ...f, player_identifier: '', total_points: '' }));
    } else {
      log(`> ERR ${res.error}`, 'text-danger');
      push(`POST falló: ${res.error}`, 'danger');
    }
  };

  return (
    <div className="pixel-panel pixel-panel--magenta" style={{ padding: 16 }}>
      <MetaBadge tone="magenta">POST /SCORES MUTATION TESTBED</MetaBadge>

      <form className="grid gap-1 mt-2" onSubmit={onSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="pid">PLAYER IDENTIFIER</label>
          <input
            id="pid"
            className="px-input"
            value={form.player_identifier}
            onChange={set('player_identifier')}
            placeholder="p.ej. Sangwoo_God"
            maxLength={24}
          />
        </div>
        <div className="grid grid--3 gap-1">
          <div className="field">
            <label className="field-label" htmlFor="nivel">NIVEL ENDPOINT</label>
            <select id="nivel" className="px-select" value={form.level} onChange={set('level')}>
              <option value="/nivel/1">/nivel/1 CAMPUS</option>
              <option value="/nivel/2">/nivel/2 DRAFT</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="op">OPERATOR</label>
            <select id="op" className="px-select" value={form.operator} onChange={set('operator')}>
              <option value="SANGWOO">Chu Sangwoo</option>
              <option value="JAEYOUNG">Jang Jaeyoung</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="bugs">BUGS FIXED</label>
            <input
              id="bugs"
              className="px-input"
              type="number"
              min={0}
              value={form.bugs_fixed}
              onChange={set('bugs_fixed')}
            />
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="score">SCORE OBTENIDO (max 999999)</label>
          <input
            id="score"
            className="px-input"
            type="number"
            min={0}
            max={999999}
            value={form.total_points}
            onChange={set('total_points')}
            placeholder="98450"
          />
        </div>
        <PixelButton type="submit" tone="primary" block disabled={pending}>
          {pending ? 'DISPARANDO...' : 'DISPARAR POST /SCORES (AXIOS MUTATION)'}
        </PixelButton>
      </form>

      <div className="mono tiny text-dim mt-2 mb-1">CONSOLA DE RESPUESTA // POST_ACK</div>
      <div className="console" ref={consoleRef}>
        {consoleLines.map((l) => (
          <div key={l.n} className="ln">
            <span className="n">{String(l.n).padStart(2, '0')}</span>
            <span className={l.tone}>{l.text}</span>
          </div>
        ))}
        <span className="cursor-block text-green" />
      </div>

      <ToastStack items={items} onDismiss={dismiss} />
    </div>
  );
}