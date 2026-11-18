import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Calendar, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Briefcase, 
  BarChart3
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
  const [selectedTask, setSelectedTask] = useState('TASK-101');
  const [hoursInput, setHoursInput] = useState('2.5');
  const [descriptionInput, setDescriptionInput] = useState('Implemented optimistic LexoRank update in Kanban');
  const [isBillableInput, setIsBillableInput] = useState(true);
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);

  // Demo initial entries
  const [entries, setEntries] = useState<TimeEntryItem[]>([
    {
      _id: 'entry-1',
      taskId: 'FE-101',
      taskTitle: 'Implement Dual-Token Auth',
      projectKey: 'PROJ-1',
      startTime: '2026-11-16T09:00:00Z',
      endTime: '2026-11-16T12:30:00Z',
      durationSeconds: 12600, // 3.5 hrs
      description: 'JWT validation and cookie refresh cycle',
      isBillable: true,
      source: 'manual',
      loggedDate: '2026-11-16',
    },
    {
      _id: 'entry-2',
      taskId: 'FE-102',
      taskTitle: 'Active Stopwatch Timer Lock',
      projectKey: 'PROJ-1',
      startTime: '2026-11-17T14:00:00Z',
      endTime: '2026-11-17T16:15:00Z',
      durationSeconds: 8100, // 2.25 hrs
      description: 'Single active timer race prevention lock',
      isBillable: true,
      source: 'stopwatch',
      loggedDate: '2026-11-17',
    },
    {
      _id: 'entry-3',
      taskId: 'BE-204',
      taskTitle: 'Cycle Detection DFS algorithm',
      projectKey: 'PROJ-1',
      startTime: '2026-11-18T10:00:00Z',
      endTime: '2026-11-18T14:00:00Z',
      durationSeconds: 14400, // 4.0 hrs
      description: 'DFS cycle detector on task dependencies',
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
      taskTitle: 'General Sprint Development',
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
    <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Timesheets & Hours Matrix</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Weekly aggregated time tracking, billable utilization, and manual activity logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-medium text-slate-300">
              Week of {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Log Time
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Hours Logged</span>
            <div className="text-2xl font-bold text-white mt-1">{totalWeeklyHours.toFixed(1)}h</div>
            <span className="text-xs text-slate-500">Across 7 days</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billable Ratio</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{billableRatePercent}%</div>
            <span className="text-xs text-slate-500">{totalWeeklyBillable.toFixed(1)}h billable hours</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Utilization</span>
            <div className="text-2xl font-bold text-indigo-300 mt-1">{Math.min(100, Math.round((totalWeeklyHours / 40) * 100))}%</div>
            <span className="text-xs text-slate-500">Standard 40h workweek target</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Weekly Matrix Bar Visualization */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Weekly Workload Matrix (Mon - Sun)
        </h3>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const heightPercent = Math.min(100, Math.round((day.totalHours / 10) * 100));
            const isToday = day.isoDate === new Date().toISOString().split('T')[0];

            return (
              <div 
                key={day.isoDate} 
                className={`flex flex-col items-center bg-slate-800/80 rounded-lg p-3 border ${
                  isToday ? 'border-indigo-500/60 bg-indigo-950/20' : 'border-slate-700/60'
                }`}
              >
                <span className="text-xs font-medium text-slate-400">{day.dayName}</span>
                <span className={`text-sm font-bold my-1 ${isToday ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {day.dateNumber}
                </span>

                {/* Progress bar container */}
                <div className="w-full h-24 bg-slate-900 rounded-md my-2 flex flex-col justify-end p-1 overflow-hidden relative">
                  <div 
                    className="w-full bg-indigo-500 rounded-sm transition-all duration-300" 
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.totalHours.toFixed(1)}h logged`}
                  />
                  {day.billableHours > 0 && (
                    <div 
                      className="w-full bg-emerald-500/80 rounded-sm absolute bottom-1 left-1 right-1" 
                      style={{ height: `${Math.min(heightPercent, Math.round((day.billableHours / 10) * 100))}%`, width: 'calc(100% - 8px)' }}
                      title={`${day.billableHours.toFixed(1)}h billable`}
                    />
                  )}
                </div>

                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-200">{day.totalHours.toFixed(1)}h</span>
                  <div className="text-[10px] text-slate-400">
                    {day.billableHours > 0 ? `${day.billableHours.toFixed(1)}h billable` : '0h billable'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Entries List */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Logged Activities</h3>
          <span className="text-xs text-slate-400">{entries.length} recorded entries</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {entries.map((entry) => (
            <div key={entry._id} className="p-4 hover:bg-slate-800/30 transition flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${
                  entry.source === 'stopwatch' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-700/40 text-slate-400'
                }`}>
                  {entry.source === 'stopwatch' ? <Clock className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">{entry.taskId}</span>
                    <span className="text-sm font-medium text-white">{entry.taskTitle}</span>
                    {entry.isBillable ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Billable
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/30 text-slate-400">
                        Non-billable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{entry.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-sm font-bold text-slate-200">
                    {(entry.durationSeconds / 3600).toFixed(2)} hrs
                  </div>
                  <div className="text-xs text-slate-500">{entry.loggedDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Time Logging Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">Manual Time Entry</h3>
            <p className="text-xs text-slate-400 mb-4">Record hours worked directly into project timesheets.</p>

            <form onSubmit={handleCreateManualEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Identifier</label>
                <input 
                  type="text" 
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0.25"
                    max="24"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Description</label>
                <textarea 
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="billableCheck" className="text-xs text-slate-300 select-none cursor-pointer">
                  Mark this entry as billable work
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
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
