import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/command/CommandPalette';
import { TaskDetailsDrawer } from './components/drawer/TaskDetailsDrawer';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { TimesheetsView } from './components/timesheets/TimesheetsView';
import { CalendarView } from './components/calendar/CalendarView';
import { BillingPortal } from './components/billing/BillingPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import {
  FolderKanban,
  Plus,
  Kanban as KanbanIcon,
  LayoutGrid,
  Clock,
  Calendar as CalendarIcon,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const App: React.FC = () => {
  // Read active task from URL query if present (e.g. ?task=FE-104)
  const initialTask = new URLSearchParams(window.location.search).get('task');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTask);
  const [activeView, setActiveView] = useState<'kanban' | 'timesheets' | 'calendar' | 'billing' | 'admin' | 'overview'>('kanban');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col antialiased">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Top Control Bar with View Switcher */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xs">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="hover:text-slate-300 cursor-pointer">Nexus Engineering</span>
              <span>/</span>
              <span className="text-indigo-400 font-medium">TaskFlow Platform</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/80">
                <button
                  onClick={() => setActiveView('kanban')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'kanban'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KanbanIcon className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setActiveView('timesheets')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'timesheets'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timesheets</span>
                </button>
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'calendar'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setActiveView('billing')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'billing'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Billing & Quotas</span>
                </button>
                <button
                  onClick={() => setActiveView('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'admin'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control</span>
                </button>
                <button
                  onClick={() => setActiveView('overview')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'overview'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>
              </div>

              <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Active View Display */}
          <div className="flex-1 overflow-y-auto">
            {activeView === 'kanban' && (
              <div className="p-6">
                <KanbanBoard onSelectTask={(id) => setSelectedTaskId(id)} />
              </div>
            )}
            {activeView === 'timesheets' && <TimesheetsView />}
            {activeView === 'calendar' && <CalendarView />}
            {activeView === 'billing' && <BillingPortal />}
            {activeView === 'admin' && <AdminPortal />}
            {activeView === 'overview' && (
              <div className="p-12 text-center text-slate-400">
                <FolderKanban className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-80" />
                <h3 className="text-base font-medium text-white">Project Analytics & Velocity Overview</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Burndown charts, cycle time distributions, and milestone completion metrics are updated in real-time.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Slide-Over Task Details Drawer */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Global Command Palette Modal */}
      <CommandPalette />
    </div>
  );
};
export default App;
