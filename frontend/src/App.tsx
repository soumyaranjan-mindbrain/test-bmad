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
  Plus,
  Kanban as KanbanIcon,
  LayoutGrid,
  Clock,
  Calendar as CalendarIcon,
  CreditCard,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const App: React.FC = () => {
  const initialTask = new URLSearchParams(window.location.search).get('task');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTask);
  const [activeView, setActiveView] = useState<'kanban' | 'timesheets' | 'calendar' | 'billing' | 'admin' | 'overview'>('kanban');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* 1. Fixed Header (sticky top-0) */}
      <Navbar />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. Fixed Sidebar (h-[calc(100vh-3.5rem)] sticky) */}
        <Sidebar />

        {/* 3. Main Scrollable Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          {/* Subheader Toolbar with View Switcher */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            {/* Breadcrumb Context */}
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span className="hover:text-slate-800 cursor-pointer">Nexus Engineering</span>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Mobile App Platform v2.0</span>
            </div>

            {/* Navigation Tabs Pill Control */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveView('kanban')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'kanban'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KanbanIcon className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>

                <button
                  onClick={() => setActiveView('timesheets')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'timesheets'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timesheets</span>
                </button>

                <button
                  onClick={() => setActiveView('calendar')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'calendar'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>

                <button
                  onClick={() => setActiveView('billing')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'billing'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Billing & Quotas</span>
                </button>

                <button
                  onClick={() => setActiveView('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'admin'
                      ? 'bg-white text-red-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control</span>
                </button>

                <button
                  onClick={() => setActiveView('overview')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'overview'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>
              </div>

              <button 
                onClick={() => setSelectedTaskId('FE-104')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Active View Display Container */}
          <div className="flex-1">
            {activeView === 'kanban' && (
              <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Board Page Title */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sprint 1 Execution Board</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag cards across columns to update LexoRank indexes in real-time.
                    </p>
                  </div>
                </div>
                <KanbanBoard onSelectTask={(id) => setSelectedTaskId(id)} />
              </div>
            )}

            {activeView === 'timesheets' && <TimesheetsView />}

            {activeView === 'calendar' && <CalendarView />}

            {activeView === 'billing' && <BillingPortal />}

            {activeView === 'admin' && <AdminPortal />}

            {activeView === 'overview' && (
              <div className="p-8 max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Sprint Velocity & Health Analytics</h2>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto">
                    Aggregated MongoDB telemetry across cycle times, WIP bottlenecks, and completed user stories.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Velocity</span>
                      <div className="text-2xl font-bold text-slate-900 mt-1">26 Story Points</div>
                      <span className="text-xs text-emerald-600 font-medium">92% of committed sprint scope</span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Cycle Time</span>
                      <div className="text-2xl font-bold text-slate-900 mt-1">1.8 Days</div>
                      <span className="text-xs text-slate-500">From In Progress to Done</span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Team</span>
                      <div className="text-2xl font-bold text-slate-900 mt-1">5 Contributors</div>
                      <span className="text-xs text-indigo-600 font-medium">100% seat utilization</span>
                    </div>
                  </div>
                </div>
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
