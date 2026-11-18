import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface CalendarTask {
  id: string;
  key: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
}

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [tasks] = useState<CalendarTask[]>([
    {
      id: 'task-1',
      key: 'FE-101',
      title: 'Implement Dual-Token Auth',
      dueDate: new Date(year, month, 12).toISOString().split('T')[0],
      priority: 'high',
      status: 'done'
    },
    {
      id: 'task-2',
      key: 'FE-102',
      title: 'Active Stopwatch Single Lock',
      dueDate: new Date(year, month, 18).toISOString().split('T')[0],
      priority: 'urgent',
      status: 'in_progress'
    },
    {
      id: 'task-3',
      key: 'BE-204',
      title: 'DFS Dependency Cycle Check',
      dueDate: new Date(year, month, 22).toISOString().split('T')[0],
      priority: 'medium',
      status: 'todo'
    },
    {
      id: 'task-4',
      key: 'BILL-301',
      title: 'Simulated Payment Gateway',
      dueDate: new Date(year, month, 25).toISOString().split('T')[0],
      priority: 'high',
      status: 'backlog'
    }
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startingDayIndex = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-700/60 text-slate-300 border-slate-600',
    medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    urgent: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Project Calendar & Milestones</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track deliverables, sprint deadlines, and task completions.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-semibold text-white">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mt-6 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-slate-800/80 border-b border-slate-800 text-center py-2.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/20">
          {/* Leading blank days */}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[110px] bg-slate-900/20 p-2 opacity-30" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayIso = new Date(year, month, dayNum).toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dayIso;
            const dayTasks = tasks.filter((t) => t.dueDate === dayIso);

            return (
              <div 
                key={`day-${dayNum}`} 
                className={`min-h-[110px] p-2 transition flex flex-col justify-between ${
                  isToday ? 'bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/40' : 'hover:bg-slate-800/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                  }`}>
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-medium text-slate-500">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day tasks badges */}
                <div className="space-y-1.5 mt-2 flex-1">
                  {dayTasks.map((t) => (
                    <div 
                      key={t.id}
                      className={`text-[11px] p-1.5 rounded-md border flex flex-col gap-0.5 shadow-sm ${priorityColors[t.priority]}`}
                      title={t.title}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] opacity-90">{t.key}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-75">{t.status.replace('_', ' ')}</span>
                      </div>
                      <span className="truncate font-medium">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
