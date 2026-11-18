import React, { useState } from 'react';
import { KanbanColumn, type KanbanColumnData } from './KanbanColumn';
import type { KanbanTaskItem } from './TaskCard';
import { Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

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

  const handleDropTask = (taskId: string, targetColumnId: string) => {
    setTasks((prevTasks) => {
      return prevTasks.map((t) => {
        if (t.id === taskId) {
          // Fractional order update: simulates LexoRank midpoint update
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

  return (
    <div className="space-y-4">
      {/* Board Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 px-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-slate-800">Sprint 1 Board</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Active Sprint</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>View Options</span>
          </button>
        </div>
      </div>

      {/* Columns Horizontal Scroll Area */}
      <div className="flex items-start space-x-4 overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.columnId === column.id)}
            onSelectTask={onSelectTask}
            onDropTask={handleDropTask}
          />
        ))}
      </div>
    </div>
  );
};
