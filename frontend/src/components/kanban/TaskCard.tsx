import React from 'react';
import { AlertCircle, MessageSquare, Paperclip } from 'lucide-react';

export interface KanbanTaskItem {
  id: string;
  displayId: string;
  title: string;
  columnId: string;
  order: string;
  version: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
  commentCount: number;
  attachmentCount: number;
  assigneeName?: string;
}

interface TaskCardProps {
  task: KanbanTaskItem;
  onSelectTask: (displayId: string) => void;
  onDragStart: (e: React.DragEvent, task: KanbanTaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask, onDragStart }) => {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onSelectTask(task.displayId)}
      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2.5 select-none"
    >
      {/* Card Header: Task ID & Priority */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
          {task.displayId}
        </span>
        <span
          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border flex items-center space-x-1 ${getPriorityBadge(
            task.priority
          )}`}
        >
          {task.priority === 'urgent' && <AlertCircle className="w-2.5 h-2.5 mr-0.5 text-red-500" />}
          <span>{task.priority}</span>
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Card Footer: Metadata indicators & Assignee Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2.5">
          {task.commentCount > 0 && (
            <span className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.commentCount}</span>
            </span>
          )}
          {task.attachmentCount > 0 && (
            <span className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachmentCount}</span>
            </span>
          )}
          {task.storyPoints && (
            <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono font-bold text-[10px]">
              {task.storyPoints}pt
            </span>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px]">
            {task.assigneeName ? task.assigneeName.charAt(0) : 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};
