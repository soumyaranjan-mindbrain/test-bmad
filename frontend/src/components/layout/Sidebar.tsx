import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  CheckCircle2,
  Kanban,
  Calendar,
  Clock,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, activeView, setActiveView } = useAppStore();

  const navItems = [
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'timesheets', label: 'Timesheets', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'overview', label: 'Sprint Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing & Quotas', icon: CreditCard },
    { id: 'admin', label: 'Admin Control', icon: ShieldCheck },
    { id: 'my_work', label: 'My Assigned Work', icon: CheckCircle2, badge: '4' },
    { id: 'team', label: 'Team Directory', icon: Users },
    { id: 'settings', label: 'Workspace Settings', icon: Settings },
  ] as const;

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-white border-r border-slate-200 flex flex-col justify-between select-none z-20 shrink-0 overflow-hidden ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Nav Items - Non-scrolling pinned layout */}
      <div className="p-3 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between px-2 py-1.5 mb-2">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                TF
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-800">
                TaskFlow
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors mx-auto"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!sidebarCollapsed && 'badge' in item && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer: Plan Quota Progress Indicators */}
      {!sidebarCollapsed ? (
        <div className="p-3 m-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Free Plan</span>
            </span>
            <button
              onClick={() => setActiveView('billing')}
              className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Upgrade
            </button>
          </div>

          {/* Active Projects quota */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Active Projects</span>
              <span className="font-bold text-slate-700">1 / 3</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '33%' }} />
            </div>
          </div>

          {/* Team Members quota */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Team Seats</span>
              <span className="font-bold text-slate-700">1 / 5</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 text-center border-t border-slate-100">
          <button 
            onClick={() => setActiveView('billing')}
            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto hover:bg-indigo-100 transition"
            title="Manage Plan Quotas"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
