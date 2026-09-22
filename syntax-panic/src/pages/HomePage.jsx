import { useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { OPERATORS, GAME_MODES } from '../data/staticData';
import { useApiScores } from '../hooks/useApiScores';
import { MetaBadge } from '../components/ui/MetaBadge';
import { SectionTitle } from '../components/ui/Bits';
import { AffinityBar } from '../components/home/AffinityBar';
import { DialogBubble, AvatarSlot } from '../components/home/DialogScene';
import { SyntaxTerminal } from '../components/home/SyntaxTerminal';
import { OperatorCard } from '../components/home/OperatorCard';
import { GameModeCard } from '../components/home/GameModeCard';

export default function HomePage() {
  const { selectedOperator, setSelectedOperator, selectedMode, setSelectedMode, audio } = useGame();
  const { operators: restOperators } = useApiScores();

  const operators = useMemo(() => {
    if (restOperators.length) {
      return OPERATORS.map((o) => {
        const remote = restOperators.find((r) => r.id === o.id);
        return remote ? { ...o, ...remote, stats: o.stats } : o;
      });
    }
    return OPERATORS;
  }, [restOperators]);

  useEffect(() => {
    if (!audio.musicOn && !audio.muted) {
      audio.startMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-1">
      {/* Banner de acto */}
      <div className="row wrap gap-1 mb-2" style={{ justifyContent: 'space-between' }}>
        <MetaBadge tone="magenta" doBlink>
          ACT I: SEMANTIC_CONFLICT.ERR
        </MetaBadge>
        <AffinityBar />
      </div>

      {/* Diálogo Manhwa */}
      <div className="row gap-2 wrap mb-3" style={{ alignItems: 'stretch' }}>
        <div className="dialog-scene flex-1">
          <AvatarSlot src="/images/avatars/sangwoo-reference.jpeg" tag="ERROR 404" tagTone="magenta" alt="Sangwoo" />
          <DialogBubble
            side="left"
            label="CHU SANGWOO"
            speaker="LOGIC GOD [ROJO]"
            text="Eliminaré tu nombre de los créditos del proyecto. No cumpliste con el cronograma de git commit ni aportaste una sola línea válida."
          />
          <DialogBubble
            side="right"
            label="JANG JAEYOUNG"
            speaker="CREATIVE REBEL [AZUL]"
            text="Ni una sola línea válida… ¿y tu branch main sigue rebasada de hotfixes a las 3 AM? Cuida tu tech-debt, hyung."
          />
          <AvatarSlot src="/images/avatars/jaeyoung-reference.jpeg" tag="REBEL" tagTone="cyan" alt="Jaeyoung" />
        </div>
        <SyntaxTerminal />
      </div>

      {/* SELECCIÓN DE OPERADOR Y MODALIDADES */}
      <div className="grid grid--main">
        <section>
          <SectionTitle label="SELECCIONAR OPERADOR" extra="PLAYER_ID_P1 · SYNCED_WITH_ROM" tone="magenta" />
          <div className="grid gap-1">
            {operators.map((op) => (
              <OperatorCard
                key={op.id}
                operator={op}
                active={selectedOperator === op.id}
                onClick={setSelectedOperator}
              />
            ))}
          </div>
          <div className="mono tiny text-dim mt-2">
            ▸ INSERTA LOS PNG REALES EN <span className="text-cyan">/public/images/avatars/*.png</span> PARA REEMPLAZAR
            LOS PLACEHOLDERS.
          </div>
        </section>

        <section>
          <SectionTitle label="MODALIDADES DE PARTIDA" extra="3 MODOS DISPONIBLES" tone="cyan" />
          <div className="grid gap-1">
            {GAME_MODES.map((mode) => (
              <GameModeCard
                key={mode.id}
                mode={mode}
                active={selectedMode === mode.id}
                onSelect={setSelectedMode}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
