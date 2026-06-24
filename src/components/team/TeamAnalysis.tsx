import { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, Swords, Gauge, Lightbulb, Info } from 'lucide-react';
import type { TeamMember } from '../../types/team';
import { analyzeTeam } from '../../lib/teamAnalysis';
import { useDex } from '../../hooks/useDex';
import { TYPE_COLORS } from '../../utils/typeColors';
import { spriteUrl, formatPokemonName } from '../../utils/formatters';
import { Skeleton } from '../ui/Skeleton';
import type { PokemonTypeName } from '../../types/pokemon';

interface TeamAnalysisProps {
  members: TeamMember[];
}

function multLabel(m: number): string {
  if (m === 0) return '0×';
  if (m === 0.25) return '¼×';
  if (m === 0.5) return '½×';
  if (m === 1) return '1×';
  if (m === 4) return '4×';
  return `${m}×`;
}

function TypeChip({ type, faded }: { type: PokemonTypeName; faded?: boolean }) {
  return (
    <span
      className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded text-center block"
      style={{ backgroundColor: TYPE_COLORS[type], opacity: faded ? 0.4 : 1 }}
    >
      {formatPokemonName(type)}
    </span>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
        <span className="text-gray-400">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

const GRADE_COLORS: Record<string, string> = {
  S: 'text-yellow-500',
  A: 'text-green-500',
  B: 'text-blue-500',
  C: 'text-amber-500',
  D: 'text-red-500',
};

export function TeamAnalysis({ members }: TeamAnalysisProps) {
  const dex = useDex();
  const analysis = useMemo(() => (dex ? analyzeTeam(members, dex) : null), [dex, members]);

  if (!analysis) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }
  if (analysis.size === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500">
        Adicione Pokémon ao time para ver a análise.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Heuristic disclaimer */}
      <p className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        <Info size={12} /> Análise heurística — referência de construção, não veredito competitivo oficial.
      </p>

      {/* Overall rating */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-5">
        <div className={`text-5xl font-black ${GRADE_COLORS[analysis.rating.grade]}`}>
          {analysis.rating.grade}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.rating.score}</span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{analysis.rating.summary}</p>
        </div>
      </div>

      {/* Weakness alerts */}
      {analysis.weaknessAlerts.length > 0 && (
        <Section title="Fraquezas compartilhadas" icon={<AlertTriangle size={16} />}>
          <div className="space-y-2">
            {analysis.weaknessAlerts.map((alert) => (
              <div
                key={alert.type}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                    : 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                }`}
              >
                <div className="w-16 shrink-0">
                  <TypeChip type={alert.type} />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    alert.severity === 'high'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {alert.count} fracos
                </span>
                <div className="flex gap-1 ml-auto">
                  {alert.members.map((m) => (
                    <img key={m.num} src={spriteUrl(m.num)} alt={m.species} title={m.species} className="w-8 h-8 object-contain" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Vermelho: 3+ membros (risco alto) · Âmbar: 2 membros (risco menor)
          </p>
        </Section>
      )}

      {/* Defensive grid */}
      <Section title="Cobertura defensiva (por tipo atacante)" icon={<ShieldCheck size={16} />}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {analysis.defensive.map((row) => (
            <div key={row.type} className="flex flex-col gap-1 items-center">
              <TypeChip type={row.type} />
              <div className="flex gap-1.5 text-[10px] font-bold">
                <span className={row.weak > 0 ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}>
                  ▲{row.weak}
                </span>
                <span className={row.resist + row.immune > 0 ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}>
                  ▼{row.resist + row.immune}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">▲ membros fracos · ▼ membros que resistem/imunes</p>
      </Section>

      {/* Offensive grid */}
      <Section title="Cobertura ofensiva" icon={<Swords size={16} />}>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="font-bold text-gray-800 dark:text-gray-100">{analysis.coveredCount}/18</span> tipos
          atingidos super-efetivamente
          {!analysis.hasDamagingMoves && ' — adicione golpes de ataque'}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {analysis.offensive.map((cell) => {
            const color =
              cell.bestMult >= 2 ? 'text-green-600 dark:text-green-400'
                : cell.bestMult === 1 ? 'text-gray-400'
                : cell.bestMult === 0 ? 'text-gray-500'
                : 'text-red-500';
            return (
              <div key={cell.type} className="flex flex-col gap-1 items-center">
                <TypeChip type={cell.type} faded={cell.bestMult < 2} />
                <span className={`text-[11px] font-bold ${color}`}>{multLabel(cell.bestMult)}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Speed */}
        <Section title="Velocidade média" icon={<Gauge size={16} />}>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.avgSpeed}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-medium">
              {analysis.speedTier}
            </span>
            <span className="text-[11px] text-gray-400">Speed real (com EV/IV/nature/nível)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.memberSpeeds.map((m) => (
              <div key={m.num} className="flex flex-col items-center">
                <img src={spriteUrl(m.num)} alt={m.species} className="w-8 h-8 object-contain" />
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{m.speed}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Resistances */}
        <Section title="Resistências importantes" icon={<ShieldCheck size={16} />}>
          {analysis.resistances.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              Nenhum tipo é resistido por 3+ membros.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {analysis.resistances.map((r) => (
                <div key={r.type} className="flex flex-col gap-1 items-center">
                  <TypeChip type={r.type} />
                  <span className="text-[11px] font-bold text-blue-500">{r.count}×</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Section title="Sugestões" icon={<Lightbulb size={16} />}>
          <ul className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
