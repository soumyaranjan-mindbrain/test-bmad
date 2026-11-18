import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  Search,
  Bell,
  Clock,
  Square,
  ChevronDown,
  Building2,
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentOrg,
    organizations,
    setCurrentOrg,
    setCommandPaletteOpen,
    timerRunning,
    activeTaskId,
    elapsedSeconds,
    tickTimer,
    stopTimer,
    currentUser,
  } = useAppStore();

  const [orgDropdownOpen, setOrgDropdownOpen] = React.useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (timerRunning) {
      interval = window.setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval !== null) window.clearInterval(interval);
    };
  }, [timerRunning, tickTimer]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? '0' + v : v))
      .join(':');
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Organization Switcher */}
      <div className="relative">
        <button
          onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200/60"
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm text-slate-800">
            {currentOrg?.name || 'Select Workspace'}
          </span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
            {currentOrg?.role || 'Member'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {orgDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-40">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setCurrentOrg(org);
                  setOrgDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="truncate">{org.name}</span>
                {currentOrg?.id === org.id && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center: Global Search Trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center space-x-2 w-72 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search or jump to...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-500 font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Right: Active Stopwatch, Notifications & User */}
      <div className="flex items-center space-x-3">
        {/* Active Timer Widget */}
        {timerRunning ? (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-900">{activeTaskId}</span>
            <span className="font-mono text-emerald-700">{formatDuration(elapsedSeconds)}</span>
            <button
              onClick={stopTimer}
              title="Stop timer"
              className="p-1 hover:bg-emerald-100 rounded-full text-emerald-700 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => useAppStore.getState().startTimer('TASK-105', 'Quick Task')}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-dashed border-slate-300 rounded-full transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Start Timer</span>
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {currentUser?.fullName.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
