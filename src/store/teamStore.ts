import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team, TeamMember } from '../types/team';
import { newId, MAX_MEMBERS } from '../types/team';

interface TeamStore {
  teams: Team[];
  createTeam: (name?: string) => string;
  deleteTeam: (id: string) => void;
  duplicateTeam: (id: string) => string | null;
  renameTeam: (id: string, name: string) => void;
  importTeam: (name: string, members: TeamMember[]) => string;
  addMember: (teamId: string, member: TeamMember) => void;
  updateMember: (teamId: string, memberId: string, patch: Partial<TeamMember>) => void;
  removeMember: (teamId: string, memberId: string) => void;
}

function touch(team: Team): Team {
  return { ...team, updatedAt: Date.now() };
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],

      createTeam: (name) => {
        const id = newId();
        const now = Date.now();
        const team: Team = {
          id,
          name: name?.trim() || `Time ${get().teams.length + 1}`,
          members: [],
          createdAt: now,
          updatedAt: now,
        };
        set({ teams: [team, ...get().teams] });
        return id;
      },

      deleteTeam: (id) => set({ teams: get().teams.filter((t) => t.id !== id) }),

      duplicateTeam: (id) => {
        const original = get().teams.find((t) => t.id === id);
        if (!original) return null;
        const newTeamId = newId();
        const copy: Team = {
          ...original,
          id: newTeamId,
          name: `${original.name} (cópia)`,
          members: original.members.map((m) => ({ ...m, id: newId() })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ teams: [copy, ...get().teams] });
        return newTeamId;
      },

      renameTeam: (id, name) =>
        set({
          teams: get().teams.map((t) => (t.id === id ? touch({ ...t, name }) : t)),
        }),

      importTeam: (name, members) => {
        const id = newId();
        const now = Date.now();
        set({
          teams: [
            { id, name: name.trim() || 'Time importado', members: members.slice(0, MAX_MEMBERS), createdAt: now, updatedAt: now },
            ...get().teams,
          ],
        });
        return id;
      },

      addMember: (teamId, member) =>
        set({
          teams: get().teams.map((t) =>
            t.id === teamId && t.members.length < MAX_MEMBERS
              ? touch({ ...t, members: [...t.members, member] })
              : t,
          ),
        }),

      updateMember: (teamId, memberId, patch) =>
        set({
          teams: get().teams.map((t) =>
            t.id === teamId
              ? touch({
                  ...t,
                  members: t.members.map((m) => (m.id === memberId ? { ...m, ...patch } : m)),
                })
              : t,
          ),
        }),

      removeMember: (teamId, memberId) =>
        set({
          teams: get().teams.map((t) =>
            t.id === teamId
              ? touch({ ...t, members: t.members.filter((m) => m.id !== memberId) })
              : t,
          ),
        }),
    }),
    { name: 'pkdx-teams' },
  ),
);
