import { MetaBadge } from './MetaBadge';

export function PixelBox({ tone = 'panel', as: Tag = 'div', children, className = '', style, title }) {
  const cls = ['pixel-panel'];
  if (tone !== 'panel') cls.push(`pixel-panel--${tone}`);
  if (className) cls.push(className);
  return (
    <Tag className={cls.join(' ')} style={style}>
      {title ? (
        <div className="row gap-1 mb-1" style={{ padding: '8px 10px 0' }}>
          <MetaBadge tone="cyan">{title}</MetaBadge>
        </div>
      ) : null}
      {children}
    </Tag>
  );
}