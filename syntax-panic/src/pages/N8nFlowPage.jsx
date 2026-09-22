import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { WORKFLOW_NODES } from '../data/staticData';
import { MetaBadge } from '../components/ui/MetaBadge';
import { N8nFlowDiagram, WebhookSimulator } from '../components/n8n/N8nFlowDiagram';
import { useToasts, ToastStack } from '../components/ui/Toast';

const METRICS = [
  { k: 'LATENCIA N8N', v: '36 ms', tone: 'green' },
  { k: 'TASA ÉXITO', v: '99.94%', tone: 'green' },
  { k: 'BUFFER COLA', v: '0 msgs', tone: 'cyan' },
];

export default function N8nFlowPage() {
  const { audio } = useGame();
  const [stepStatus, setStepStatus] = useState(Array(WORKFLOW_NODES.length).fill('pending'));
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState(null);
  const [tick, setTick] = useState(0);
  const timers = useRef([]);
  const { items, push, dismiss } = useToasts();

  const runFlow = () => {
    if (running) return;
    audio.sfx.click();
    setResponse(null);
    setRunning(true);
    setStepStatus(Array(WORKFLOW_NODES.length).fill('pending'));
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let tickCount = 0;
    const bump = () => {
      tickCount += 1;
      setTick(tickCount);
    };
    WORKFLOW_NODES.forEach((_, i) => {
      const t1 = setTimeout(() => {
        setStepStatus((prev) => prev.map((s, idx) => (idx === i ? 'running' : s)));
        audio.sfx.select();
        bump();
      }, 250 * i + 200);
      const t2 = setTimeout(() => {
        setStepStatus((prev) => prev.map((s, idx) => (idx === i ? 'done' : s)));
        audio.sfx.resolve();
        if (i === WORKFLOW_NODES.length - 1) {
          const resp = {
            ok: true,
            latencyMs: 36,
            final: {
              rank: 1,
              token: `jwt.${Math.random().toString(16).slice(2, 14)}`,
              xp: 250,
              ts: new Date().toISOString(),
            },
          };
          setResponse(resp);
          setRunning(false);
          audio.sfx.victory();
          push('FLUJO WF-SYNTAX-998 COMPLETADO → { rank, token, xp }', 'magenta');
        }
        bump();
      }, 250 * i + 400);
      timers.current.push(t1, t2);
    });
  };

  return (
    <div className="mt-1">
      <div className="row wrap gap-1 mb-2" style={{ justifyContent: 'space-between' }}>
        <MetaBadge tone="cyan">PIPELINE DE INTEGRACIÓN WEBHOOKS & TELEMETRÍA EN TIEMPO REAL</MetaBadge>
        <div className="row gap-1 wrap">
          {METRICS.map((m) => (
            <span key={m.k} className="metric-chip">
              {m.k} <span className={`text-${m.tone} mono`}>{m.v}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="row wrap gap-1 mb-2" style={{ alignItems: 'center' }}>
        <MetaBadge tone="amber" doBlink>
          ENDPOINT ACTIVO
        </MetaBadge>
        <span className="mono tiny text-cyan">
          POST https://n8n.syntaxpanic.internal/webhook/game-events
        </span>
        <MetaBadge tone="magenta">AUTH: BEARER JWT</MetaBadge>
      </div>

      <SectionTitleLike label="DAG AUTOMATOR · WORKFLOW WF-SYNTAX-998" tick={tick} />

      <N8nFlowDiagram stepStatus={stepStatus} />

      <div className="mt-2">
        <WebhookSimulator running={running} onTrigger={runFlow} />
      </div>

      {response && (
        <div className="pixel-panel pixel-panel--green mt-2" style={{ padding: 14 }}>
          <MetaBadge tone="green">HOOK RESPONSE // ACK SIMULADO</MetaBadge>
          <div className="console mt-1" style={{ minHeight: 60 }}>
            <div className="ln">
              <span className="text-green">RETURN OK</span>
              <span className="text-white"> {JSON.stringify(response.final)}</span>
            </div>
            <div className="ln">
              <span className="text-dim">↳ webhook.render: n8n.local.simulation · ms={response.latencyMs}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mono tiny text-dim mt-2">
        ▸ EJECUTA <span className="text-cyan">npm run dev:all</span> PARA LEVANTAR json-server (:3000) + Vite. El
        webhook /game-events se simula localmente si el bridge n8n no responde.
      </div>

      <ToastStack items={items} onDismiss={dismiss} />
    </div>
  );
}

function SectionTitleLike({ label, tick }) {
  return (
    <div className="section-title" style={{ marginBottom: 16 }}>
      <span className="badge badge--magenta">{label}</span>
      <span className="rule" />
      <span className="mono tiny text-green">SEQ #{String(tick).padStart(3, '0')}</span>
    </div>
  );
}
