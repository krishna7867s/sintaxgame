import { WORKFLOW_NODES } from '../../data/staticData';
import { MetaBadge } from '../ui/MetaBadge';

function connectorStyle(status) {
  if (status === 'done') return { background: 'var(--green)', boxShadow: '0 0 6px var(--green)' };
  if (status === 'running') return { background: 'var(--amber)', boxShadow: '0 0 10px var(--amber)' };
  return {};
}

export function N8nFlowDiagram({ stepStatus }) {
  const getStepStatus = (idx) => stepStatus[idx] || 'pending';

  return (
    <div className="grid gap-0" style={{ alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
      {WORKFLOW_NODES.map((node, i) => {
        const st = getStepStatus(i);
        return (
          <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`n8n-node${st === 'running' ? ' n8n-node--running' : ''}${st === 'done' ? ' n8n-node--done' : ''}`} style={{ position: 'relative', padding: 14 }}>
              <div className="row gap-1" style={{ justifyContent: 'space-between' }}>
                <span className="n8n-node-index">{String(node.id).padStart(2, '0')}</span>
                <MetaBadge tone={st === 'done' ? 'green' : st === 'running' ? 'amber' : 'cyan'}>
                  {node.kind}
                </MetaBadge>
              </div>
              <div className="n8n-node-title">{node.title}</div>
              <div className="mono tiny text-dim">{node.subtitle}</div>
              {st === 'done' && (
                <div className="mono tiny text-green mt-1" style={{ border: '1px dashed var(--green)', padding: 6, background: 'rgba(57,255,20,0.06)' }}>
                  ✔ {node.desc}
                </div>
              )}
              {st === 'running' && (
                <div className="mono tiny text-amber mt-1" style={{ border: '1px dashed var(--amber)', padding: 6, background: 'rgba(255,179,71,0.08)' }}>
                  … procesando: {node.subtitle}
                </div>
              )}
            </div>
            {i < WORKFLOW_NODES.length - 1 && (
              <div className="flow-line" style={{ ...connectorStyle(getStepStatus(i + 1)), height: 28 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WebhookSimulator({ running, onTrigger }) {
  return (
    <div className="pixel-panel pixel-panel--amber" style={{ padding: 14 }}>
      <MetaBadge tone="amber">SIMULADOR DE DISPARO DE WEBHOOK</MetaBadge>
      <div className="mono tiny text-dim mt-1">
        POST https://n8n.syntaxpanic.internal/webhook/game-events · Auth: BEARER JWT (simulated) · 200 OK
      </div>
      <button
        className="px-btn px-btn--amber px-btn--lg mt-2"
        onClick={onTrigger}
        disabled={running}
      >
        {running ? '▸ PROCESSING WORKFLOW...' : '▸ DISPARAR WEBHOOK N8N (SIM)'}
      </button>
    </div>
  );
}