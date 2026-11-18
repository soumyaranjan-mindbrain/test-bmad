import React, { useState } from 'react';
import { KanbanColumn, type KanbanColumnData } from './KanbanColumn';
import { type KanbanTaskItem } from './TaskCard';
import { Filter, Sparkles, Plus } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

interface KanbanBoardProps {
  onSelectTask: (displayId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onSelectTask }) => {
  const [columns] = useState<KanbanColumnData[]>([
    { id: 'backlog', name: 'Backlog' },
    { id: 'todo', name: 'To Do' },
    { id: 'in_progress', name: 'In Progress', wipLimit: 4 },
    { id: 'review', name: 'In Review' },
    { id: 'done', name: 'Done' },
  ]);

  const [tasks, setTasks] = useState<KanbanTaskItem[]>([
    {
      id: 'task_1',
      displayId: 'FE-101',
      title: 'Initialize React 19 + Tailwind CSS design system tokens',
      columnId: 'done',
      order: '0|i00000:',
      version: 1,
      priority: 'high',
      storyPoints: 5,
      commentCount: 2,
      attachmentCount: 1,
      assigneeName: 'Alex Morgan',
    },
    {
      id: 'task_2',
      displayId: 'FE-102',
      title: 'Setup MongoDB Atlas test database connection with Mongoose ODM',
      columnId: 'done',
      order: '0|i00010:',
      version: 1,
      priority: 'urgent',
      storyPoints: 5,
      commentCount: 1,
      attachmentCount: 0,
      assigneeName: 'Alex Morgan',
    },
    {
      id: 'task_3',
      displayId: 'FE-103',
      title: 'Implement Multi-Tenant Organization Isolation middleware',
      columnId: 'done',
      order: '0|i00020:',
      version: 1,
      priority: 'urgent',
      storyPoints: 8,
      commentCount: 4,
      attachmentCount: 0,
      assigneeName: 'Winston Architect',
    },
    {
      id: 'task_4',
      displayId: 'FE-104',
      title: 'Design Kanban drag-and-drop LexoRank indexing',
      columnId: 'in_progress',
      order: '0|i00030:',
      version: 2,
      priority: 'urgent',
      storyPoints: 8,
      commentCount: 3,
      attachmentCount: 2,
      assigneeName: 'Alex Morgan',
    },
    {
      id: 'task_5',
      displayId: 'FE-105',
      title: 'Active Stopwatch timer concurrency lock across devices',
      columnId: 'todo',
      order: '0|i00040:',
      version: 1,
      priority: 'high',
      storyPoints: 5,
      commentCount: 0,
      attachmentCount: 0,
      assigneeName: 'Sarah Developer',
    },
    {
      id: 'task_6',
      displayId: 'FE-106',
      title: 'Socket.IO Room-Based Event Dispatcher for multi-user sync',
      columnId: 'backlog',
      order: '0|i00050:',
      version: 1,
      priority: 'medium',
      storyPoints: 8,
      commentCount: 0,
      attachmentCount: 0,
    },
  ]);

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskPoints, setNewTaskPoints] = useState(3);

  // Real-time synchronization over WebSocket
  useSocket('proj_nexus_1', (data: any) => {
    if (data?.taskId && data?.newColumnId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === data.taskId
            ? { ...t, columnId: data.newColumnId, order: data.orderKey || t.order, version: data.version || t.version + 1 }
            : t
        )
      );
    }
  });

  const handleDropTask = (taskId: string, targetColumnId: string) => {
    setTasks((prevTasks) => {
      return prevTasks.map((t) => {
        if (t.id === taskId) {
          const newOrder = t.order.replace(/:$/, 'm:');
          return {
            ...t,
            columnId: targetColumnId,
            order: newOrder,
            version: t.version + 1,
          };
        }
        return t;
      });
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: KanbanTaskItem = {
      id: `task_${Date.now()}`,
      displayId: `FE-${Math.floor(107 + tasks.length)}`,
      title: newTaskTitle.trim(),
      columnId: 'todo',
      order: `0|i${(tasks.length * 10).toString().padStart(5, '0')}:`,
      version: 1,
      priority: newTaskPriority,
      storyPoints: newTaskPoints,
      commentCount: 0,
      attachmentCount: 0,
      assigneeName: 'Alex Morgan',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setIsNewTaskModalOpen(false);
  };

  const filteredTasks = filterPriority === 'all' 
    ? tasks 
    : tasks.filter(t => t.priority === filterPriority);

  return (
    <div className="space-y-4">
      {/* Board Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 px-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-slate-900">Sprint 1 Execution Board</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Active Sprint</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">({filteredTasks.length} tasks)</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Priority Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['all', 'urgent', 'high', 'medium'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-0.5 text-xs font-semibold rounded capitalize transition ${
                  filterPriority === p ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Columns Horizontal Scroll Area */}
      <div className="flex items-start space-x-4 overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={filteredTasks.filter((t) => t.columnId === column.id)}
            onSelectTask={onSelectTask}
            onDropTask={handleDropTask}
          />
        ))}
      </div>

      {/* Quick Create Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Sprint Task</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new deliverable to the active sprint backlog.</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket heartbeat reconnection"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Story Points</label>
                  <input 
                    type="number"
                    min="1"
                    max="21"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
