import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
}

interface AppState {
  // Navigation & UI state
  activeView: 'kanban' | 'timesheets' | 'calendar' | 'billing' | 'admin' | 'overview' | 'my_work' | 'team' | 'settings';
  setActiveView: (view: 'kanban' | 'timesheets' | 'calendar' | 'billing' | 'admin' | 'overview' | 'my_work' | 'team' | 'settings') => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Active Timer state
  timerRunning: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  elapsedSeconds: number;
  startTimer: (taskId: string, taskTitle: string) => void;
  stopTimer: () => void;
  tickTimer: () => void;

  // Active User & Organization
  currentUser: User | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  setCurrentOrg: (org: Organization) => void;
  setAuth: (user: User, organizations: Organization[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'kanban',
  setActiveView: (view) => set({ activeView: view }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  timerRunning: true,
  activeTaskId: 'TASK-104',
  activeTaskTitle: 'Design Kanban drag-and-drop LexoRank indexing',
  elapsedSeconds: 5052, // 01:24:12 initial preview
  startTimer: (taskId, taskTitle) =>
    set({ timerRunning: true, activeTaskId: taskId, activeTaskTitle: taskTitle, elapsedSeconds: 0 }),
  stopTimer: () => set({ timerRunning: false, activeTaskId: null, activeTaskTitle: null }),
  tickTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  currentUser: {
    id: 'usr_default',
    email: 'admin@taskflow.com',
    fullName: 'Alex Morgan',
  },
  currentOrg: {
    id: 'org_nexus',
    name: 'Nexus Engineering',
    slug: 'nexus-eng',
    role: 'owner',
  },
  organizations: [
    { id: 'org_nexus', name: 'Nexus Engineering', slug: 'nexus-eng', role: 'owner' },
    { id: 'org_acme', name: 'Acme Mobile Labs', slug: 'acme-mobile', role: 'member' },
  ],
  setCurrentOrg: (org) => set({ currentOrg: org }),
  setAuth: (user, organizations) =>
    set({ currentUser: user, organizations, currentOrg: organizations[0] || null }),
}));
