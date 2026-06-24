import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Upload, Download, BarChart3, ChevronDown } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { useTeamBuilderData } from '../hooks/useTeamBuilderData';
import { MemberEditor } from '../components/team/MemberEditor';
import { TeamAnalysis } from '../components/team/TeamAnalysis';
import { ComparePicker } from '../components/compare/ComparePicker';
import { ImportExportModal } from '../components/team/ImportExportModal';
import { Skeleton } from '../components/ui/Skeleton';
import { resolveSpeciesForTeam } from '../services/teamData';
import { exportShowdownTeam, importShowdownTeam } from '../services/showdownTeam';
import {
  type TeamMember,
  newId,
  ZERO_EVS,
  MAX_IVS,
  MAX_MEMBERS,
} from '../types/team';

export default function TeamEditorPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { teams, renameTeam, addMember, updateMember, removeMember, importTeam } = useTeamStore();
  const team = teams.find((t) => t.id === id);

  const { data: builderData, isLoading: dataLoading } = useTeamBuilderData();
  const [modal, setModal] = useState<null | { mode: 'import' | 'export'; text?: string }>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  if (!team) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 space-y-4">
        <p className="text-xl text-gray-600 dark:text-gray-300">Time não encontrado.</p>
        <Link to="/teams" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium">
          <ArrowLeft size={16} /> Voltar aos times
        </Link>
      </div>
    );
  }

  async function handleAddMember(pokeApiName: string, num: number) {
    if (!team || team.members.length >= MAX_MEMBERS) return;
    const resolved = await resolveSpeciesForTeam(pokeApiName, num);
    const member: TeamMember = {
      id: newId(),
      species: resolved.species,
      num: resolved.num,
      ability: resolved.abilityOptions[0] ?? null,
      abilityOptions: resolved.abilityOptions,
      item: null,
      nature: 'Hardy',
      moves: [],
      evs: { ...ZERO_EVS },
      ivs: { ...MAX_IVS },
      teraType: null,
      level: 100,
    };
    addMember(team.id, member);
  }

  async function handleExport() {
    if (!team) return;
    const text = await exportShowdownTeam(team.members);
    setModal({ mode: 'export', text });
  }

  async function handleImportIntoNew(text: string) {
    const members = await importShowdownTeam(text);
    importTeam('Time importado', members);
  }

  const canAdd = team.members.length < MAX_MEMBERS;

  return (
    <>
      <Helmet>
        <title>{team.name} — Pokédex Competitiva</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/teams" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <ArrowLeft size={16} /> Times
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setModal({ mode: 'import' })}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Upload size={16} /> Importar
            </button>
            <button
              onClick={handleExport}
              disabled={team.members.length === 0}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <Download size={16} /> Exportar
            </button>
          </div>
        </div>

        {/* Team name */}
        <input
          value={team.name}
          onChange={(e) => renameTeam(team.id, e.target.value)}
          className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-red-400 dark:focus:border-red-500 focus:outline-none text-gray-900 dark:text-white w-full pb-1 transition-colors"
          aria-label="Nome do time"
        />

        {/* Members */}
        {dataLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {team.members.map((m) => (
              <MemberEditor
                key={m.id}
                member={m}
                natures={builderData?.natures ?? []}
                items={builderData?.items ?? []}
                onChange={(patch) => updateMember(team.id, m.id, patch)}
                onRemove={() => removeMember(team.id, m.id)}
              />
            ))}

            {canAdd && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-center gap-3 min-h-[12rem]">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <Plus size={16} /> Adicionar Pokémon ({team.members.length}/{MAX_MEMBERS})
                </div>
                <ComparePicker label="Buscar Pokémon…" onSelect={handleAddMember} />
              </div>
            )}
          </div>
        )}

        {/* Team analysis */}
        {team.members.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowAnalysis((v) => !v)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              aria-expanded={showAnalysis}
            >
              <span className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100">
                <BarChart3 size={18} className="text-red-500" /> Análise do time
              </span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${showAnalysis ? 'rotate-180' : ''}`} />
            </button>
            {showAnalysis && (
              <div className="mt-4 animate-fade-in">
                <TeamAnalysis members={team.members} />
              </div>
            )}
          </div>
        )}
      </div>

      {modal?.mode === 'export' && (
        <ImportExportModal mode="export" initialText={modal.text} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'import' && (
        <ImportExportModal
          mode="import"
          onClose={() => setModal(null)}
          onImport={handleImportIntoNew}
        />
      )}
    </>
  );
}
