export function AvatarSlot({ src, tag, tagTone = 'magenta', alt, slotLabel, size = 'normal' }) {
  const isLarge = size === 'large';
  return (
    <div className={`dialog-avatar${isLarge ? ' dialog-avatar--lg' : ''}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="slot-label">{slotLabel}</div>
      )}
      <span className={`dialog-tag${tagTone === 'cyan' ? ' dialog-tag--cyan' : ''}`}>{tag}</span>
    </div>
  );
}

export function DialogBubble({ side = 'left', speaker, text, label }) {
  return (
    <div className={`dialog-bubble${side === 'right' ? ' dialog-bubble--right' : ''}`}>
      <div className="dialog-speaker">
        {side === 'right' ? 'V.S.' : 'RIVAL ▸'} {label}
      </div>
      <div className="dialog-speaker">{speaker}</div>
      <div className="dialog-text">“{text}”</div>
    </div>
  );
}