import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, Ruler, Weight, Egg, Star } from 'lucide-react';
import { usePokemonDetail } from '../hooks/usePokemon';
import { useFavoritesStore } from '../store/favoritesStore';
import { useHistoryStore } from '../store/historyStore';
import { TypeBadge } from '../components/ui/TypeBadge';
import { StatsPanel } from '../components/pokemon/StatsPanel';
import { EvolutionChain } from '../components/pokemon/EvolutionChain';
import { WeaknessGrid } from '../components/pokemon/WeaknessGrid';
import { CompetitiveSection } from '../components/competitive/CompetitiveSection';
import { DetailSkeleton } from '../components/ui/Skeleton';
import {
  formatPokemonName,
  formatPokemonNumber,
  formatGeneration,
  formatEggGroup,
  formatHeight,
  formatWeight,
} from '../utils/formatters';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function PokemonDetailPage() {
  const { nameOrId = '' } = useParams<{ nameOrId: string }>();
  const navigate = useNavigate();
  const { pokemon, species, evolutionChain, encounters, isLoading, isError } =
    usePokemonDetail(nameOrId);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const recordView = useHistoryStore((s) => s.recordView);

  // Record the view once the Pokémon resolves (feeds recent + most-viewed).
  useEffect(() => {
    if (pokemon) recordView(pokemon.id, pokemon.name);
  }, [pokemon?.id, pokemon?.name, recordView]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
          <ArrowLeft size={16} /> Voltar
        </button>
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !pokemon) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 space-y-4">
        <p className="text-6xl">😢</p>
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Pokémon não encontrado</h1>
        <p className="text-gray-400">"{nameOrId}" não existe ou houve um erro na busca.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
          <ArrowLeft size={16} /> Voltar à lista
        </Link>
      </div>
    );
  }

  const fav = isFavorite(pokemon.id);
  const displayName = formatPokemonName(pokemon.name);

  return (
    <>
      <Helmet>
        <title>{displayName} — Pokédex Competitiva</title>
        <meta
          name="description"
          content={`Stats, habilidades, evoluções e dados competitivos de ${displayName} (${formatPokemonNumber(pokemon.id)}).`}
        />
        <link rel="canonical" href={`/pokemon/${pokemon.name}`} />
        {/* Open Graph / social previews */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${displayName} — Pokédex Competitiva`} />
        <meta
          property="og:description"
          content={`Stats, habilidades, evoluções e builds competitivas de ${displayName}.`}
        />
        <meta property="og:image" content={pokemon.artworkUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${displayName} — Pokédex Competitiva`} />
        <meta name="twitter:image" content={pokemon.artworkUrl} />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        {/* Back + favorite */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <button
            onClick={() => toggleFavorite(pokemon.id)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={16} className={fav ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            {fav ? 'Favoritado' : 'Favoritar'}
          </button>
        </div>

        {/* Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Artwork */}
            <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-2xl w-56 h-56">
              <img
                src={pokemon.artworkUrl}
                alt={displayName}
                className="w-44 h-44 object-contain drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = pokemon.spriteUrl;
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  {formatPokemonNumber(pokemon.id)}
                  {species?.isLegendary && (
                    <span className="ml-2 inline-flex items-center gap-1 text-yellow-500">
                      <Star size={12} className="fill-yellow-500" /> Lendário
                    </span>
                  )}
                  {species?.isMythical && (
                    <span className="ml-2 inline-flex items-center gap-1 text-purple-500">
                      <Star size={12} className="fill-purple-500" /> Mítico
                    </span>
                  )}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {displayName}
                </h1>
                {species && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatGeneration(species.generation)}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                {pokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="lg" />
                ))}
              </div>

              {species?.flavorText && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed max-w-md">
                  "{species.flavorText}"
                </p>
              )}

              <div className="flex gap-6 justify-center md:justify-start text-sm">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Ruler size={14} />
                  <span>{formatHeight(pokemon.height)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Weight size={14} />
                  <span>{formatWeight(pokemon.weight)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitive data (Phase 2) — auto-selected recommended build */}
        <CompetitiveSection pokemonName={pokemon.name} displayName={displayName} />

        {/* Stats (bars / radar toggle) */}
        <StatsPanel stats={pokemon.stats} />

        {/* Abilities */}
        <SectionCard title="Habilidades">
          <div className="flex flex-wrap gap-2">
            {pokemon.abilities.map((a) => (
              <span
                key={a.name}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  a.isHidden
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {a.displayName}
                {a.isHidden && (
                  <span className="ml-1.5 text-[10px] font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide">
                    Oculta
                  </span>
                )}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Egg Groups */}
        {species && (
          <SectionCard title="Egg Groups">
            <div className="flex gap-2 flex-wrap">
              {species.eggGroups.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800"
                >
                  <Egg size={13} />
                  {formatEggGroup(g)}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Weaknesses */}
        <SectionCard title="Fraquezas e Resistências">
          <WeaknessGrid types={pokemon.types} />
        </SectionCard>

        {/* Evolution Chain */}
        {evolutionChain && (
          <SectionCard title="Linha Evolutiva">
            <EvolutionChain root={evolutionChain} currentName={pokemon.name} />
          </SectionCard>
        )}

        {/* Encounters */}
        <SectionCard title="Localizações de Encontro">
          {!encounters || encounters.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              Nenhuma localização de encontro disponível para este Pokémon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {encounters.slice(0, 20).map((e, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200">{e.locationArea}</span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">{e.versions.join(', ')}</span>
                </div>
              ))}
              {encounters.length > 20 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 col-span-full pt-1">
                  +{encounters.length - 20} localizações adicionais…
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
