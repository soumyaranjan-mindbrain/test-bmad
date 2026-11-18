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
import { useAppStore } from './stores/useAppStore';
import {
  Plus,
  Kanban as KanbanIcon,
  LayoutGrid,
  Clock,
  Calendar as CalendarIcon,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Users,
  Settings,
  CheckCircle2
} from 'lucide-react';

export const App: React.FC = () => {
  const initialTask = new URLSearchParams(window.location.search).get('task');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTask);
  const { activeView, setActiveView } = useAppStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* 1. Fixed Header (h-14 fixed at top) */}
      <Navbar />

      {/* Main Layout Body - Fixed viewport */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* 2. Completely Fixed Sidebar (never scrolls, static height) */}
        <Sidebar />

        {/* 3. Main Content Area - Only this container scrolls */}
        <main className="flex-1 h-full flex flex-col overflow-y-auto bg-slate-50 overscroll-contain">
          {/* Subheader Toolbar with View Switcher */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            {/* Breadcrumb Context */}
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span className="hover:text-slate-800 cursor-pointer">Nexus Engineering</span>
              <span>/</span>
              <span className="text-slate-900 font-semibold capitalize">{activeView.replace('_', ' ')}</span>
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
                  <span>Analytics</span>
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

            {activeView === 'my_work' && (
              <div className="p-8 max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">My Assigned Tasks</h2>
                        <p className="text-xs text-slate-500">Tasks directly assigned to Alex Morgan in active sprint</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      4 Tasks Active
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {[
                      { key: 'FE-101', title: 'Initialize React 19 + Tailwind CSS design system tokens', status: 'Done', priority: 'High' },
                      { key: 'FE-102', title: 'Setup MongoDB Atlas test database connection with Mongoose ODM', status: 'Done', priority: 'Urgent' },
                      { key: 'FE-104', title: 'Design Kanban drag-and-drop LexoRank indexing', status: 'In Progress', priority: 'Urgent' },
                      { key: 'FE-105', title: 'Active Stopwatch timer concurrency lock across devices', status: 'To Do', priority: 'High' }
                    ].map((item) => (
                      <div 
                        key={item.key} 
                        onClick={() => setSelectedTaskId(item.key)}
                        className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {item.key}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">{item.status}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'team' && (
              <div className="p-8 max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Workspace Member Directory</h2>
                        <p className="text-xs text-slate-500">Active team members and role privileges in Nexus Engineering</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Invite member modal opened')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Invite Member
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {[
                      { name: 'Alex Morgan', email: 'alex@taskflow.com', role: 'Owner', status: 'Active' },
                      { name: 'Winston Architect', email: 'winston@taskflow.com', role: 'Admin', status: 'Active' },
                      { name: 'Sarah Developer', email: 'sarah@taskflow.com', role: 'Member', status: 'Active' },
                      { name: 'External Auditor', email: 'auditor@partner.org', role: 'Guest', status: 'Active' },
                    ].map((member) => (
                      <div key={member.email} className="py-3 px-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {member.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                            <div className="text-xs text-slate-400">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {member.role}
                          </span>
                          <span className="text-xs font-medium text-emerald-600">{member.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="p-8 max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Workspace Settings</h2>
                      <p className="text-xs text-slate-500">Configure organization identifiers, security policies, and integrations</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
                      <input 
                        type="text" 
                        defaultValue="Nexus Engineering" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Slug (URL Subdomain)</label>
                      <input 
                        type="text" 
                        defaultValue="nexus-eng" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => alert('Settings saved successfully!')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Save Changes
                      </button>
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
