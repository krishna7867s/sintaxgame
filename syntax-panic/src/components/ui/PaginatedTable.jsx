import { useState } from 'react';

/** Rows achiev-arcade paginated table with n8n-style page rings */
export function PaginatedTable({ rows, renderRow, pageSize = 6, empty = 'NO DATA' }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * pageSize;
  const slice = rows.slice(start, start + pageSize);
  return (
    <div>
      {slice.length ? (
        slice.map((r, i) => renderRow(r, start + i))
      ) : (
        <div className="mono text-dim tiny" style={{ padding: 14 }}>
          {empty}
        </div>
      )}
      {pages > 1 && (
        <div className="row gap-1 mt-1" style={{ justifyContent: 'space-between' }}>
          <span className="mono tiny text-dim">
            PAGE {String(cur).padStart(2, '0')} / {String(pages).padStart(2, '0')}
          </span>
          <div className="row gap-1">
            <button className="px-btn px-btn--sm" disabled={cur <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀ PREV
            </button>
            <button
              className="px-btn px-btn--sm"
              disabled={cur >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              NEXT ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}