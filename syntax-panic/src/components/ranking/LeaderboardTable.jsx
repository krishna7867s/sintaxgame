import { useState } from 'react';

function rankClass(rank) {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-cyan';
  if (rank === 3) return 'rank-magenta';
  return 'rank-dim';
}

const PAGE = 10;

export function LeaderboardTable({ scores, isLoading }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(scores.length / PAGE));
  const start = (page - 1) * PAGE;
  const slice = scores.slice(start, start + PAGE);

  return (
    <div>
      <div className="px-table-wrap">
        <table className="px-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>PLAYER / IDENTIFIER</th>
              <th>OPERATOR</th>
              <th>NIVEL</th>
              <th>BUGS FIXED</th>
              <th>TOTAL POINTS</th>
            </tr>
          </thead>
          <tbody>
            {slice.length ? (
              slice.map((s, i) => (
                <tr key={s.id || s.player_identifier}>
                  <td className={rankClass(s.rank)}>
                    {String(start + i + 1).padStart(2, '0')}
                    {s.rank === 1 && ' ★'}
                  </td>
                  <td>
                    <div>
                      {s.player_identifier}
                      <div className="mono tiny text-dim">TAG: {s.user_tag}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--${s.operator === 'SANGWOO' ? 'magenta' : 'cyan'}`}>
                      {s.operator}
                    </span>
                  </td>
                  <td className="mono text-cyan">{s.level}</td>
                  <td className="mono">
                    <span className="text-green">{s.bugs_fixed}</span>
                  </td>
                  <td className="mono text-amber">{Number(s.total_points).toLocaleString('en-US')} PTS</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="mono text-dim">
                  {isLoading ? 'LOADING SCORES FROM REST...' : 'NO SCORES REGISTRADOS'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="row gap-1 mt-1" style={{ justifyContent: 'space-between' }}>
          <span className="mono tiny text-dim">
            PAGE {String(page).padStart(2, '0')} / {String(pages).padStart(2, '0')}
          </span>
          <div className="row gap-1">
            <button className="px-btn px-btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀ PREV
            </button>
            <button className="px-btn px-btn--sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              NEXT ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}