import React, { useState } from 'react';
import { TaskCard, type KanbanTaskItem } from './TaskCard';
import { Plus, MoreHorizontal } from 'lucide-react';

export interface KanbanColumnData {
  id: string;
  name: string;
  wipLimit?: number;
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  tasks: KanbanTaskItem[];
  onSelectTask: (displayId: string) => void;
  onDropTask: (taskId: string, targetColumnId: string, targetIndex?: number) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onSelectTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, column.id);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, task: KanbanTaskItem) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  const isWipExceeded = column.wipLimit && tasks.length > column.wipLimit;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 shrink-0 flex flex-col bg-slate-100/70 rounded-xl p-3 border transition-colors ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-50/30'
          : 'border-slate-200/60'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            {column.name}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              isWipExceeded
                ? 'bg-red-100 text-red-700'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {tasks.length}
            {column.wipLimit ? ` / ${column.wipLimit}` : ''}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-600 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards Scrollable Area */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-14rem)] pr-0.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelectTask={onSelectTask}
            onDragStart={handleCardDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
};
