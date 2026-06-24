import type { PokemonTypeName } from '../../types/pokemon';
import { getTypeStyle } from '../../utils/typeColors';
import { formatPokemonName } from '../../utils/formatters';

interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm:  'px-2 py-0.5 text-xs',
  md:  'px-3 py-1 text-sm',
  lg:  'px-4 py-1.5 text-base',
};

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full font-semibold tracking-wide ${sizeClasses[size]}`}
      style={getTypeStyle(type)}
    >
      {formatPokemonName(type)}
    </span>
  );
}
