import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GitCompareArrows } from 'lucide-react';
import { usePokemonDetail } from '../hooks/usePokemon';
import { ComparePicker } from '../components/compare/ComparePicker';
import { CompareColumn } from '../components/compare/CompareColumn';
import { Skeleton } from '../components/ui/Skeleton';
import type { PokemonDetail, Stat } from '../types/pokemon';

const MAX_STAT = 255;

function StatRow({ label, a, b }: { label: string; a: number; b: number }) {
  const aWins = a > b;
  const bWins = b > a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1.5">
      {/* Left (A) */}
      <div className="flex items-center gap-2 justify-end">
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden" dir="rtl">
          <div
            className={`h-full rounded-full ${aWins ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'}`}
            style={{ width: `${(a / MAX_STAT) * 100}%` }}
          />
        </div>
        <span className={`w-8 text-sm font-bold tabular-nums ${aWins ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
          {a}
        </span>
      </div>
      {/* Label */}
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-16 text-center">{label}</span>
      {/* Right (B) */}
      <div className="flex items-center gap-2">
        <span className={`w-8 text-sm font-bold tabular-nums ${bWins ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
          {b}
        </span>
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${bWins ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'}`}
            style={{ width: `${(b / MAX_STAT) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatComparison({ a, b }: { a: PokemonDetail; b: PokemonDetail }) {
  const bstA = a.stats.reduce((s, x) => s + x.value, 0);
  const bstB = b.stats.reduce((s, x) => s + x.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      <div className="space-y-1">
        {a.stats.map((stat: Stat, i) => (
          <StatRow key={stat.name} label={stat.label} a={stat.value} b={b.stats[i]?.value ?? 0} />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className={`text-right font-bold tabular-nums ${bstA > bstB ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'}`}>{bstA}</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-16 text-center">BST</span>
        <span className={`font-bold tabular-nums ${bstB > bstA ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'}`}>{bstB}</span>
      </div>
    </div>
  );
}

function Slot({ name, onSelect, onClear, label }: {
  name: string | null;
  onSelect: (n: string) => void;
  onClear: () => void;
  label: string;
}) {
  const { pokemon, isLoading } = usePokemonDetail(name ?? '');

  if (!name) return <ComparePicker label={label} onSelect={onSelect} />;
  if (isLoading || !pokemon) return <Skeleton className="h-48 w-full rounded-xl" />;
  return <CompareColumn pokemon={pokemon} onClear={onClear} />;
}

export default function ComparePage() {
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);

  const { pokemon: pa } = usePokemonDetail(a ?? '');
  const { pokemon: pb } = usePokemonDetail(b ?? '');
  const bothReady = pa && pb;

  return (
    <>
      <Helmet>
        <title>Comparar Pokémon — Pokédex Competitiva</title>
        <meta name="description" content="Compare dois Pokémon lado a lado: stats base, tipos e total." />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1 py-2">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <GitCompareArrows size={24} className="text-red-500" /> Comparar Pokémon
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Escolha dois Pokémon para comparar stats e tipos lado a lado
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <Slot name={a} label="Pokémon 1…" onSelect={setA} onClear={() => setA(null)} />
          <Slot name={b} label="Pokémon 2…" onSelect={setB} onClear={() => setB(null)} />
        </div>

        {bothReady ? (
          <StatComparison a={pa} b={pb} />
        ) : (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
            {pa || pb ? 'Escolha o segundo Pokémon para comparar.' : 'Selecione dois Pokémon acima.'}
          </p>
        )}
      </div>
    </>
  );
}
