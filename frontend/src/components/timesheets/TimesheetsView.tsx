import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Calendar, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Briefcase, 
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

interface TimeEntryItem {
  _id: string;
  taskId: string;
  taskTitle: string;
  projectKey: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  description: string;
  isBillable: boolean;
  source: 'stopwatch' | 'manual';
  loggedDate: string; // YYYY-MM-DD
}

export const TimesheetsView: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState('FE-104');
  const [hoursInput, setHoursInput] = useState('2.5');
  const [descriptionInput, setDescriptionInput] = useState('Implemented optimistic LexoRank update in Kanban');
  const [isBillableInput, setIsBillableInput] = useState(true);
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);

  const [entries, setEntries] = useState<TimeEntryItem[]>([
    {
      _id: 'entry-1',
      taskId: 'FE-101',
      taskTitle: 'Initialize React 19 + Tailwind CSS design system tokens',
      projectKey: 'PROJ-1',
      startTime: '2026-11-16T09:00:00Z',
      endTime: '2026-11-16T12:30:00Z',
      durationSeconds: 12600, // 3.5 hrs
      description: 'JWT validation, cookie refresh cycle, and tailwind color palettes',
      isBillable: true,
      source: 'manual',
      loggedDate: '2026-11-16',
    },
    {
      _id: 'entry-2',
      taskId: 'FE-104',
      taskTitle: 'Design Kanban drag-and-drop LexoRank indexing',
      projectKey: 'PROJ-1',
      startTime: '2026-11-17T14:00:00Z',
      endTime: '2026-11-17T16:15:00Z',
      durationSeconds: 8100, // 2.25 hrs
      description: 'Single active timer race prevention lock and optimistic conflict handling',
      isBillable: true,
      source: 'stopwatch',
      loggedDate: '2026-11-17',
    },
    {
      _id: 'entry-3',
      taskId: 'FE-103',
      taskTitle: 'Implement Multi-Tenant Organization Isolation middleware',
      projectKey: 'PROJ-1',
      startTime: '2026-11-18T10:00:00Z',
      endTime: '2026-11-18T14:00:00Z',
      durationSeconds: 14400, // 4.0 hrs
      description: 'DFS cycle detector on task dependencies and compound indexes',
      isBillable: false,
      source: 'manual',
      loggedDate: '2026-11-18',
    }
  ]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + index);
    const isoDate = d.toISOString().split('T')[0];
    const dayEntries = entries.filter((e) => e.loggedDate === isoDate);
    const totalSeconds = dayEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
    const billableSeconds = dayEntries.filter((e) => e.isBillable).reduce((sum, e) => sum + e.durationSeconds, 0);
    return {
      dayName: daysOfWeek[index],
      dateNumber: d.getDate(),
      isoDate,
      totalHours: (totalSeconds / 3600),
      billableHours: (billableSeconds / 3600),
      entries: dayEntries,
    };
  });

  const totalWeeklyHours = weekDays.reduce((acc, d) => acc + d.totalHours, 0);
  const totalWeeklyBillable = weekDays.reduce((acc, d) => acc + d.billableHours, 0);
  const billableRatePercent = totalWeeklyHours > 0 ? Math.round((totalWeeklyBillable / totalWeeklyHours) * 100) : 0;

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHours = parseFloat(hoursInput);
    if (isNaN(parsedHours) || parsedHours <= 0) return;

    const newEntry: TimeEntryItem = {
      _id: `entry-${Date.now()}`,
      taskId: selectedTask,
      taskTitle: 'Active Sprint Development',
      projectKey: 'PROJ-1',
      startTime: `${dateInput}T09:00:00Z`,
      endTime: `${dateInput}T${(9 + Math.floor(parsedHours)).toString().padStart(2, '0')}:00:00Z`,
      durationSeconds: Math.round(parsedHours * 3600),
      description: descriptionInput,
      isBillable: isBillableInput,
      source: 'manual',
      loggedDate: dateInput,
    };

    setEntries([newEntry, ...entries]);
    setIsLogModalOpen(false);
    setDescriptionInput('');
    setHoursInput('2.0');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Nexus Engineering</span>
            <span>/</span>
            <span className="text-indigo-600">Time & Productivity</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Timesheets & Resource Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly logged hours, client billability ratios, and manual activity logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Week Selector */}
          <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={handlePrevWeek}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-medium text-slate-700">
              Week of {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Metric Cards in Light Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hours Logged</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalWeeklyHours.toFixed(1)} hrs</div>
            <span className="text-xs text-slate-500 mt-0.5 block">Recorded across 7 days</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billable Ratio</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{billableRatePercent}%</div>
            <span className="text-xs text-slate-500 mt-0.5 block">{totalWeeklyBillable.toFixed(1)}h billable work</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workweek Utilization</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{Math.min(100, Math.round((totalWeeklyHours / 40) * 100))}%</div>
            <span className="text-xs text-slate-500 mt-0.5 block">Based on 40h standard target</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Weekly Matrix Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Weekly Workload Allocation (Monday – Sunday)
          </h3>
          <span className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span> Total Hours</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Billable</span>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const heightPercent = Math.min(100, Math.round((day.totalHours / 8) * 100));
            const isToday = day.isoDate === new Date().toISOString().split('T')[0];

            return (
              <div 
                key={day.isoDate} 
                className={`flex flex-col items-center bg-slate-50/70 rounded-xl p-3 border transition-all ${
                  isToday ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20' : 'border-slate-200/70'
                }`}
              >
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{day.dayName}</span>
                <span className={`text-sm font-bold my-1 ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {day.dateNumber}
                </span>

                {/* Progress bar container */}
                <div className="w-full h-28 bg-slate-200/60 rounded-lg my-2 flex flex-col justify-end p-1 overflow-hidden relative">
                  <div 
                    className="w-full bg-indigo-600 rounded-sm transition-all duration-300" 
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.totalHours.toFixed(1)}h logged`}
                  />
                  {day.billableHours > 0 && (
                    <div 
                      className="w-full bg-emerald-500 rounded-sm absolute bottom-1 left-1 right-1" 
                      style={{ height: `${Math.min(heightPercent, Math.round((day.billableHours / 8) * 100))}%`, width: 'calc(100% - 8px)' }}
                      title={`${day.billableHours.toFixed(1)}h billable`}
                    />
                  )}
                </div>

                <div className="text-center">
                  <span className="text-xs font-bold text-slate-800">{day.totalHours.toFixed(1)}h</span>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {day.billableHours > 0 ? `${day.billableHours.toFixed(1)}h billable` : '0h billable'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Entries List */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Logged Activities & Tasks</h3>
          </div>
          <span className="text-xs font-medium text-slate-500">{entries.length} recorded entries</span>
        </div>

        <div className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <div key={entry._id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${
                  entry.source === 'stopwatch' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {entry.source === 'stopwatch' ? <Clock className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {entry.taskId}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{entry.taskTitle}</span>
                    {entry.isBillable ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Billable
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        Non-billable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{entry.description}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {(entry.durationSeconds / 3600).toFixed(2)} hrs
                </div>
                <div className="text-xs text-slate-400 font-medium">{entry.loggedDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Time Logging Modal in Clean Light Mode */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Manual Time Entry</h3>
            <p className="text-xs text-slate-500 mb-4">Record hours worked directly into project timesheets.</p>

            <form onSubmit={handleCreateManualEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Identifier</label>
                <input 
                  type="text" 
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0.25"
                    max="24"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Description</label>
                <textarea 
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="billableCheck"
                  checked={isBillableInput}
                  onChange={(e) => setIsBillableInput(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-0"
                />
                <label htmlFor="billableCheck" className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                  Mark this entry as billable work
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
