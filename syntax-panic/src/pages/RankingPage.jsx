import { useGame } from '../context/GameContext';
import { useApiScores } from '../hooks/useApiScores';
import { SectionTitle } from '../components/ui/Bits';
import { ApiMonitorBar } from '../components/ranking/ApiMonitorBar';
import { LeaderboardTable } from '../components/ranking/LeaderboardTable';
import { ScoreMutationPanel } from '../components/ranking/ScoreMutationPanel';
import { PersistenceBox } from '../components/ranking/PersistenceBox';

export default function RankingPage() {
  const { audio, totalPoints } = useGame();
  const { scores, isLoading, isError, source, lastRefresh, refresh, addScore } = useApiScores();

  return (
    <div className="mt-1">
      <ApiMonitorBar
        source={source}
        isLoading={isLoading}
        isError={isError}
        lastRefresh={lastRefresh}
        onRefresh={() => {
          audio.sfx.click();
          refresh();
        }}
      />

      {isError && (
        <div className="console mb-2" style={{ borderColor: 'var(--danger)', minHeight: 24 }}>
          <div className="ln">
            <span className="text-danger">▸ {isError.code}:</span>
            <span className="text-white"> {isError.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid--main">
        <section>
          <SectionTitle label="LEADERBOARD GLOBAL DEL CAMPUS" extra={`TU TOTAL: ${totalPoints.toLocaleString('en-US')} PTS`} tone="amber" />
          <LeaderboardTable scores={scores} isLoading={isLoading} />
          <div className="mono tiny text-dim mt-1">
            ▸ FUENTE: <span className={source === 'rest' ? 'text-green' : 'text-amber'}>{source === 'rest' ? 'json-server GET localhost:3000/scores' : 'localStorage cache (resilience fallback)'}</span>
          </div>
        </section>

        <section>
          <SectionTitle label="MUTATION TESTBED" extra="AXIOS POST /scores" tone="magenta" />
          <ScoreMutationPanel addScore={addScore} />
        </section>
      </div>

      <div className="mt-2">
        <PersistenceBox />
      </div>
    </div>
  );
}