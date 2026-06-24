import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { PokemonListItem } from '../../types/pokemon';
import { formatPokemonNumber, formatPokemonName } from '../../utils/formatters';
import { useFavoritesStore } from '../../store/favoritesStore';

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(pokemon.id);

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg transition-all duration-200 overflow-hidden">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(pokemon.id);
        }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:scale-110 transition-transform"
        aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart
          size={16}
          className={fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}
        />
      </button>

      <Link to={`/pokemon/${pokemon.name}`} className="block p-4">
        <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
          <img
            src={pokemon.artworkUrl}
            alt={formatPokemonName(pokemon.name)}
            className="h-32 w-32 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = pokemon.spriteUrl;
            }}
          />
        </div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
          {formatPokemonNumber(pokemon.id)}
        </p>
        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
          {formatPokemonName(pokemon.name)}
        </p>
      </Link>
    </div>
  );
}
