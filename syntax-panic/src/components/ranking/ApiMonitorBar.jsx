import { MetaBadge } from '../ui/MetaBadge';
import { PixelButton } from '../ui/PixelButton';

export function ApiMonitorBar({ source, isLoading, isError, lastRefresh, onRefresh }) {
  const ms = lastRefresh?.ms ?? '--';
  return (
    <div className="row wrap gap-1 mb-2 pixel-panel" style={{ padding: 12, alignItems: 'center' }}>
      <span className="mono tiny text-cyan">
        GET <span className="text-white">https://api.syntaxpanic.dev/v1/scores</span>
      </span>
      <MetaBadge tone="green">200 OK ({isLoading ? '--' : `${ms}ms`})</MetaBadge>
      <MetaBadge tone={isError ? 'danger' : 'cyan'}>
        isLoading: {String(isLoading)} | isError: {isError ? 'ERROR' : 'null'}
      </MetaBadge>
      <MetaBadge tone={source === 'rest' ? 'green' : 'amber'}>
        {source === 'rest' ? 'REST_API_LIVE :3000' : 'CACHÉ_FALLBACK'}
      </MetaBadge>
      <PixelButton tone="primary" onClick={onRefresh} disabled={isLoading} style={{ marginLeft: 'auto' }}>
        REFRESCAR HOOK
      </PixelButton>
    </div>
  );
}