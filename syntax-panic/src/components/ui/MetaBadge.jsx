export function MetaBadge({ children, tone = 'default', blink: doBlink = false, className = '' }) {
  const cls = ['badge'];
  if (tone !== 'default') cls.push(`badge--${tone}`);
  if (doBlink) cls.push('blink');
  if (className) cls.push(className);
  return <span className={cls.join(' ')}>{children}</span>;
}

export function StatusDot({ tone = 'green', pulse: doPulse = false }) {
  return <span className={`status-dot ${doPulse ? 'pulse' : ''}`} style={{ color: `var(--${tone})` }} />;
}