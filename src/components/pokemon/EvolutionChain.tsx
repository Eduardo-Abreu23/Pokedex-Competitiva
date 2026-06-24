import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { EvolutionNode } from '../../types/pokemon';
import { formatPokemonName } from '../../utils/formatters';

interface EvolutionChainProps {
  root: EvolutionNode;
  currentName: string;
}

interface NodeProps {
  node: EvolutionNode;
  currentName: string;
  /** False only for the chain root — omits the leading arrow. */
  showTrigger: boolean;
}

/** Mini-card for one Pokémon in the chain + its subtree (recursive). */
function EvoTreeNode({ node, currentName, showTrigger }: NodeProps) {
  const isCurrent = node.name === currentName;

  return (
    // items-start: parent aligns with the first child row (cleaner for many branches).
    <div className="flex items-start">

      {/* ── Arrow + condition label ── */}
      {showTrigger && (
        <div className="flex flex-col items-center self-center mx-4 shrink-0 min-w-[68px]">
          {node.triggerLabel && (
            <span className="text-[10px] leading-snug text-center text-gray-500 dark:text-gray-400 mb-1 max-w-[68px]">
              {node.triggerLabel}
            </span>
          )}
          <ArrowRight
            size={22}
            strokeWidth={2.5}
            className="text-red-400 dark:text-red-500"
          />
        </div>
      )}

      {/* ── Pokémon mini-card ── */}
      <Link
        to={`/pokemon/${node.name}`}
        className={[
          'flex flex-col items-center gap-2 p-3 rounded-2xl border shrink-0 transition-all duration-200',
          isCurrent
            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400 shadow-md'
            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md',
        ].join(' ')}
      >
        <img
          src={node.spriteUrl}
          alt={formatPokemonName(node.name)}
          className="w-20 h-20 object-contain drop-shadow-sm"
          loading="lazy"
        />
        <span
          className={[
            'text-xs text-center leading-tight w-[72px]',
            isCurrent
              ? 'font-bold text-blue-700 dark:text-blue-300'
              : 'font-semibold text-gray-600 dark:text-gray-300',
          ].join(' ')}
        >
          {formatPokemonName(node.name)}
        </span>
      </Link>

      {/* ── Children ── */}
      {node.children.length === 1 && (
        // Single next-stage: extend inline → horizontal chain
        <EvoTreeNode
          node={node.children[0]}
          currentName={currentName}
          showTrigger
        />
      )}

      {node.children.length > 1 && (
        // Multiple options: stack in a column, each with its own trigger.
        // The same species can appear more than once (forme variants reached
        // by different methods), so the key includes the condition + index.
        <div className="flex flex-col gap-3">
          {node.children.map((child, i) => (
            <EvoTreeNode
              key={`${child.name}-${child.triggerLabel ?? ''}-${i}`}
              node={child}
              currentName={currentName}
              showTrigger
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EvolutionChain({ root, currentName }: EvolutionChainProps) {
  if (root.children.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        Sem evoluções conhecidas.
      </p>
    );
  }

  return (
    /*
     * overflow-x-auto  → smooth horizontal scroll when chain is wider than the card
     * min-w-max        → prevents the inner content from collapsing
     * justify-center   → centers the chain when it fits within the card width
     */
    <div className="overflow-x-auto">
      <div className="flex justify-center min-w-max py-1 px-2">
        <EvoTreeNode node={root} currentName={currentName} showTrigger={false} />
      </div>
    </div>
  );
}
