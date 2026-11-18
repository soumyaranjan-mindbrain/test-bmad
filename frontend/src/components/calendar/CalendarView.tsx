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
      title: 'Initialize React 19 + Tailwind CSS design system tokens',
      dueDate: new Date(year, month, 12).toISOString().split('T')[0],
      priority: 'high',
      status: 'done'
    },
    {
      id: 'task-2',
      key: 'FE-104',
      title: 'Design Kanban drag-and-drop LexoRank indexing',
      dueDate: new Date(year, month, 18).toISOString().split('T')[0],
      priority: 'urgent',
      status: 'in_progress'
    },
    {
      id: 'task-3',
      key: 'FE-105',
      title: 'Active Stopwatch timer concurrency lock',
      dueDate: new Date(year, month, 22).toISOString().split('T')[0],
      priority: 'medium',
      status: 'todo'
    },
    {
      id: 'task-4',
      key: 'BILL-301',
      title: 'Simulated Payment Gateway & Checkout Harness',
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

  const priorityStyles: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    urgent: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Nexus Engineering</span>
            <span>/</span>
            <span className="text-indigo-600">Roadmap & Milestones</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Project Schedule & Sprint Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual milestone tracking, scheduled deliverables, and release targets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-slate-800">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-white">
          {/* Leading blank days */}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[120px] bg-slate-50/40 p-2" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayIso = new Date(year, month, dayNum).toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dayIso;
            const dayTasks = tasks.filter((t) => t.dueDate === dayIso);

            return (
              <div 
                key={`day-${dayNum}`} 
                className={`min-h-[120px] p-2.5 transition flex flex-col justify-between ${
                  isToday ? 'bg-indigo-50/20 ring-1 ring-inset ring-indigo-400' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                  }`}>
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day Tasks Pills */}
                <div className="space-y-1.5 flex-1">
                  {dayTasks.map((t) => (
                    <div 
                      key={t.id}
                      className={`text-[11px] p-1.5 rounded-lg border flex flex-col gap-0.5 shadow-2xs transition hover:scale-[1.02] cursor-pointer ${priorityStyles[t.priority]}`}
                      title={t.title}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px]">{t.key}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">{t.status.replace('_', ' ')}</span>
                      </div>
                      <span className="truncate font-medium text-slate-800">{t.title}</span>
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
