import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  Search,
  CheckSquare,
  FolderKanban,
  Play,
  Square,
  Users,
  Settings,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, timerRunning, stopTimer } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search tasks, projects..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Actions
          </div>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
          >
            <CheckSquare className="w-4 h-4 mr-3 text-slate-400" />
            Create New Task
          </button>
          <button
            onClick={() => {
              if (timerRunning) stopTimer();
              setCommandPaletteOpen(false);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
          >
            {timerRunning ? (
              <Square className="w-4 h-4 mr-3 text-red-500" />
            ) : (
              <Play className="w-4 h-4 mr-3 text-emerald-500" />
            )}
            {timerRunning ? 'Stop Active Stopwatch Timer' : 'Start Stopwatch Timer'}
          </button>

          <div className="px-3 py-1 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
          >
            <FolderKanban className="w-4 h-4 mr-3 text-slate-400" />
            Go to Project: Mobile App v2
          </button>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4 mr-3 text-slate-400" />
            Go to Team Directory
          </button>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-3 text-slate-400" />
            Go to Organization Settings
          </button>
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Navigation: <kbd className="px-1 py-0.5 bg-white border rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-white border rounded">↓</kbd></span>
          <span>Close: <kbd className="px-1 py-0.5 bg-white border rounded">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
