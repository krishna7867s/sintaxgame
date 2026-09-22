export function PixelButton({
  children,
  tone = 'default',
  size,
  block = false,
  className = '',
  onClick,
  disabled,
  type = 'button',
  ...rest
}) {
  const cls = ['px-btn'];
  if (tone !== 'default') cls.push(`px-btn--${tone}`);
  if (size) cls.push(`px-btn--${size}`);
  if (block) cls.push('px-btn--block');
  if (className) cls.push(className);
  return (
    <button type={type} className={cls.join(' ')} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

export function KeyCap({ label, tone = 'default', children }) {
  const cls = ['key'];
  if (tone !== 'default') cls.push(`key--${tone}`);
  return (
    <span className="keycap">
      <span className={cls.join(' ')}>{label}</span>
      <span className="text-dim">{children}</span>
    </span>
  );
}