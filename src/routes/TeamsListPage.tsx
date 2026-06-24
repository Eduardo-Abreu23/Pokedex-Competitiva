import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Copy, Trash2, Upload, Users } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { ImportExportModal } from '../components/team/ImportExportModal';
import { importShowdownTeam } from '../services/showdownTeam';
import { spriteUrl } from '../utils/formatters';
import { MAX_MEMBERS } from '../types/team';

export default function TeamsListPage() {
  const navigate = useNavigate();
  const { teams, createTeam, deleteTeam, duplicateTeam, importTeam } = useTeamStore();
  const [importing, setImporting] = useState(false);

  function handleCreate() {
    const id = createTeam();
    navigate(`/teams/${id}`);
  }

  async function handleImport(text: string) {
    const members = await importShowdownTeam(text);
    const id = importTeam('Time importado', members);
    navigate(`/teams/${id}`);
  }

  return (
    <>
      <Helmet>
        <title>Meus Times — Pokédex Competitiva</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Users size={24} className="text-red-500" /> Meus Times
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setImporting(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Upload size={16} /> Importar
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <Plus size={16} /> Novo time
            </button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Users size={48} className="mx-auto text-gray-200 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400">Você ainda não tem times.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
              <Plus size={16} /> Criar meu primeiro time
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                <Link to={`/teams/${team.id}`} className="block">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-900 dark:text-white truncate">{team.name}</h2>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {team.members.length}/{MAX_MEMBERS}
                    </span>
                  </div>
                  <div className="flex gap-1.5 min-h-[3rem] items-center">
                    {team.members.length === 0 ? (
                      <span className="text-sm text-gray-300 dark:text-gray-600 italic">Time vazio</span>
                    ) : (
                      team.members.map((m) => (
                        <img key={m.id} src={spriteUrl(m.num)} alt={m.species} title={m.species} className="w-11 h-11 object-contain" />
                      ))
                    )}
                  </div>
                </Link>
                <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => duplicateTeam(team.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Duplicar time"
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
                    aria-label="Excluir time"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {importing && (
        <ImportExportModal mode="import" onClose={() => setImporting(false)} onImport={handleImport} />
      )}
    </>
  );
}
