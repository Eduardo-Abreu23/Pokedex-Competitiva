import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, SlidersHorizontal, History, Flame } from 'lucide-react';
import { SearchBar } from '../components/layout/SearchBar';
import { PokemonCard } from '../components/pokemon/PokemonCard';
import { PokemonCardSkeleton } from '../components/ui/Skeleton';
import { MiniPokemonRow } from '../components/pokemon/MiniPokemonRow';
import { FilterPanel } from '../components/filters/FilterPanel';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchPokemon, usePokemonPage, PAGE_SIZE } from '../hooks/usePokemonList';
import { usePokedexIndex } from '../hooks/usePokedexIndex';
import { useHistoryStore, selectMostViewed } from '../store/historyStore';
import {
  type FilterState,
  DEFAULT_FILTERS,
  isFilterActive,
  applyFilters,
} from '../types/filters';

const FILTER_PAGE_SIZE = 30;

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [filterPage, setFilterPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(query, 300);

  const filtersOn = isFilterActive(filters);
  const isSearching = debouncedQuery.trim().length > 0;

  // Search + default pagination (PokéAPI)
  const { results: searchResults, isLoading: searchLoading } = useSearchPokemon(debouncedQuery);
  const { data: pageData, isLoading: pageLoading } = usePokemonPage(page);

  // Filter index (lazy: only once the panel is opened)
  const { data: index, isLoading: indexLoading } = usePokedexIndex(showFilters || filtersOn);

  const filteredAll = useMemo(() => {
    if (!index || !filtersOn) return [];
    return applyFilters(index, filters);
  }, [index, filters, filtersOn]);

  // History sections
  const recent = useHistoryStore((s) => s.recent);
  const counts = useHistoryStore((s) => s.counts);
  const mostViewed = useMemo(() => selectMostViewed(counts, 8), [counts]);

  function handleQueryChange(q: string) {
    setQuery(q);
    setPage(0);
  }

  function handleFilterChange(next: FilterState) {
    setFilters(next);
    setFilterPage(0);
  }

  // Decide what the grid shows: search > filters > default pagination
  let gridItems;
  let gridLoading = false;
  let filterTotalPages = 0;

  if (isSearching) {
    gridItems = searchResults;
    gridLoading = searchLoading;
  } else if (filtersOn) {
    filterTotalPages = Math.ceil(filteredAll.length / FILTER_PAGE_SIZE);
    gridItems = filteredAll.slice(filterPage * FILTER_PAGE_SIZE, (filterPage + 1) * FILTER_PAGE_SIZE);
    gridLoading = indexLoading;
  } else {
    gridItems = pageData?.items ?? [];
    gridLoading = pageLoading;
  }

  const defaultTotalPages = pageData ? Math.ceil(pageData.total / PAGE_SIZE) : 0;
  const showDiscovery = !isSearching && !filtersOn;

  return (
    <>
      <Helmet>
        <title>Pokédex Competitiva</title>
        <meta name="description" content="Consulte stats, habilidades, evoluções e dados competitivos de todos os Pokémon." />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2 py-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pokédex Competitiva</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Stats, habilidades, evoluções e dados competitivos por formato
          </p>
        </div>

        {/* Search + filter toggle */}
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <SearchBar value={query} onChange={handleQueryChange} />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-colors shrink-0 ${
              showFilters || filtersOn
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {filtersOn && <span className="w-2 h-2 rounded-full bg-white" />}
          </button>
        </div>

        {showFilters && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onClear={() => { setFilters(DEFAULT_FILTERS); setFilterPage(0); }}
              resultCount={index ? filteredAll.length : 0}
            />
          </div>
        )}

        {/* Discovery: recent + most viewed (only on the default view) */}
        {showDiscovery && (
          <>
            <MiniPokemonRow title="Vistos recentemente" icon={<History size={16} />} entries={recent} />
            <MiniPokemonRow title="Mais pesquisados" icon={<Flame size={16} />} entries={mostViewed} />
          </>
        )}

        {/* Result count */}
        {isSearching && !searchLoading && searchResults.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-lg">Nenhum Pokémon encontrado para "{debouncedQuery}"</p>
          </div>
        )}
        {isSearching && searchResults.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para "{debouncedQuery}"
          </p>
        )}
        {filtersOn && !indexLoading && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {filteredAll.length} Pokémon{filteredAll.length === 0 ? ' — nenhum corresponde aos filtros' : ''}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {gridLoading
            ? [...Array(PAGE_SIZE)].map((_, i) => <PokemonCardSkeleton key={i} />)
            : gridItems.map((p) => <PokemonCard key={p.id} pokemon={p} />)}
        </div>

        {/* Pagination: default */}
        {!isSearching && !filtersOn && defaultTotalPages > 1 && (
          <Pagination page={page} totalPages={defaultTotalPages} onChange={setPage} />
        )}
        {/* Pagination: filtered */}
        {filtersOn && filterTotalPages > 1 && (
          <Pagination page={filterPage} totalPages={filterTotalPages} onChange={setFilterPage} />
        )}
      </div>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft size={16} /> Anterior
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Página {page + 1} de {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Próxima <ChevronRight size={16} />
      </button>
    </div>
  );
}
