import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { PokemonDetail } from '../../types/pokemon';
import { TypeBadge } from '../ui/TypeBadge';
import { formatPokemonName, formatPokemonNumber } from '../../utils/formatters';

interface CompareColumnProps {
  pokemon: PokemonDetail;
  onClear: () => void;
}

export function CompareColumn({ pokemon, onClear }: CompareColumnProps) {
  return (
    <div className="text-center space-y-2 relative">
      <button
        onClick={onClear}
        className="absolute top-0 right-0 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Remover"
      >
        <X size={16} />
      </button>
      <Link to={`/pokemon/${pokemon.name}`} className="inline-block">
        <div className="flex items-center justify-center h-28 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <img
            src={pokemon.artworkUrl}
            alt={formatPokemonName(pokemon.name)}
            className="h-24 w-24 object-contain drop-shadow"
            onError={(e) => { (e.target as HTMLImageElement).src = pokemon.spriteUrl; }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{formatPokemonNumber(pokemon.id)}</p>
        <p className="font-bold text-gray-900 dark:text-white">{formatPokemonName(pokemon.name)}</p>
      </Link>
      <div className="flex gap-1 justify-center flex-wrap">
        {pokemon.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </div>
  );
}
