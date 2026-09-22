/* oxlint-disable react/only-export-components */
import { useEffect, useState } from 'react';

export function ToastStack({ items, onDismiss }) {
  return (
    <div className="toast-stack">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast${t.tone ? ` toast--${t.tone}` : ''}`}
          onClick={() => onDismiss && onDismiss(t.id)}
          role="status"
        >
          <span className="mono text-cyan">▸ </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function useToasts() {
  const [items, setItems] = useState([]);

  const push = (message, tone = '', ms = 2800) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
    setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), ms);
  };

  const dismiss = (id) => setItems((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const timers = items.map((t) =>
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3800),
    );
    return () => timers.forEach((tm) => clearTimeout(tm));
  }, [items]);

  return { items, push, dismiss };
}