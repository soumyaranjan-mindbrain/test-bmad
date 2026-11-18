import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  LayoutDashboard,
  CheckCircle2,
  FolderKanban,
  Kanban,
  Calendar,
  Clock,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'My Work', icon: CheckCircle2, badge: '4' },
    { label: 'Projects', icon: FolderKanban },
    { label: 'Kanban Board', icon: Kanban },
    { label: 'Calendar', icon: Calendar },
    { label: 'Timesheets', icon: Clock },
    { label: 'Reports', icon: BarChart3 },
    { label: 'Team', icon: Users },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Nav Items */}
      <div className="p-3 space-y-1">
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
          return (
            <button
              key={item.label}
              className={`w-full flex items-center px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
              {!sidebarCollapsed && item.badge && (
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
        <div className="p-3 m-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Free Plan</span>
            </span>
            <span className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer">
              Upgrade
            </span>
          </div>

          {/* Project Quota Meter: 2/3 (66% - Slate) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Projects</span>
              <span>2 / 3</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-600 rounded-full w-[66%]"></div>
            </div>
          </div>

          {/* Member Quota Meter: 4/5 (80% - Amber Warning) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-amber-700 font-medium">
              <span>Members</span>
              <span className="font-semibold">4 / 5</span>
            </div>
            <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[80%]"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 flex justify-center text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
      )}
    </aside>
  );
};
