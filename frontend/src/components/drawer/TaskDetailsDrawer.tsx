import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertCircle,
  User,
  Lock,
  Send,
  AlertTriangle,
  Play,
  Square,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export interface TaskDetail {
  id: string;
  displayId: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
  dueDate?: string;
  assigneeName?: string;
  reporterName: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  comments: {
    id: string;
    author: string;
    text: string;
    isInternal: boolean;
    createdAt: string;
  }[];
}

interface TaskDetailsDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ taskId, onClose }) => {
  const { timerRunning, activeTaskId, startTimer, stopTimer } = useAppStore();

  // Task data state (initialized with representative task for immediate UI validation)
  const [task, setTask] = useState<TaskDetail>({
    id: 'tsk_104',
    displayId: 'FE-104',
    title: 'Design Kanban drag-and-drop LexoRank indexing',
    description: 'Implement fractional string midpoint calculations to allow atomic single-document card reordering over Socket.IO without reindexing entire columns.',
    status: 'in_progress',
    priority: 'urgent',
    storyPoints: 8,
    dueDate: '2026-11-28',
    assigneeName: 'Alex Morgan',
    reporterName: 'Winston Architect',
    subtasks: [
      { id: 'sub_1', title: 'Author lexorank.ts utility with midpoint math', completed: true },
      { id: 'sub_2', title: 'Add optimistic concurrency version locks on Task schema', completed: true },
      { id: 'sub_3', title: 'Connect front-end pointer sensors to TanStack Query optimistic mutations', completed: false },
    ],
    comments: [
      {
        id: 'c_1',
        author: 'Alex Morgan',
        text: 'LexoRank midpoint math completed and tested on MongoDB Atlas. Concurrency version increments working cleanly.',
        isInternal: false,
        createdAt: '10m ago',
      },
      {
        id: 'c_2',
        author: 'Winston Architect',
        text: 'Internal Note: Ensure we add background rebalancing once key length hits 32 chars.',
        isInternal: true,
        createdAt: '5m ago',
      },
    ],
  });

  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDirtyWarning, setShowDirtyWarning] = useState(false);

  // Sync taskId with URL query parameter & handle browser back/forward buttons
  useEffect(() => {
    if (taskId) {
      const url = new URL(window.location.href);
      url.searchParams.set('task', taskId);
      window.history.pushState({}, '', url.toString());
    }

    const handlePopState = () => {
      const currentTaskInUrl = new URL(window.location.href).searchParams.get('task');
      if (!currentTaskInUrl) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [taskId, onClose]);

  const handleSafeClose = () => {
    if (isDirty) {
      setShowDirtyWarning(true);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('task');
      window.history.pushState({}, '', url.toString());
      onClose();
    }
  };

  const handleForceClose = () => {
    setShowDirtyWarning(false);
    setIsDirty(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('task');
    window.history.pushState({}, '', url.toString());
    onClose();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setTask((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: 'c_' + Date.now(),
          author: 'Alex Morgan',
          text: commentText,
          isInternal: isInternalComment,
          createdAt: 'Just now',
        },
      ],
    }));

    setCommentText('');
    setIsInternalComment(false);
    setIsDirty(false);
  };

  if (!taskId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleSafeClose}
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[640px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              {task.displayId}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium capitalize">
              Column: {task.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSafeClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body (Split layout: 65% Main content, 35% Metadata rail) */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Main Left Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={task.title}
                onChange={(e) => {
                  setTask({ ...task, title: e.target.value });
                  setIsDirty(true);
                }}
                className="w-full text-lg font-bold text-slate-900 tracking-tight focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1 -ml-1"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={task.description}
                onChange={(e) => {
                  setTask({ ...task, description: e.target.value });
                  setIsDirty(true);
                }}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Subtasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                </label>
              </div>
              <div className="space-y-1.5">
                {task.subtasks.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer text-sm text-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => {
                        setTask({
                          ...task,
                          subtasks: task.subtasks.map((s) =>
                            s.id === sub.id ? { ...s, completed: !s.completed } : s
                          ),
                        });
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments & Activity Stream */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Activity & Discussion
              </label>

              {/* Comments Feed */}
              <div className="space-y-3">
                {task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl border text-sm transition-colors ${
                      comment.isInternal
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-white border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comment.author}</span>
                        {comment.isInternal && (
                          <span className="flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Internal Note</span>
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">{comment.createdAt}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Write a comment or internal note..."
                  className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-1.5 text-xs text-amber-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">Mark as Internal Team Note</span>
                  </label>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Metadata Rail */}
          <div className="w-full md:w-56 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-100 p-6 space-y-5 text-xs">
            {/* Active Stopwatch Card */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 shadow-xs">
              <span className="font-semibold text-slate-700 block">Stopwatch Timer</span>
              {timerRunning && activeTaskId === task.displayId ? (
                <button
                  onClick={stopTimer}
                  className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md font-semibold hover:bg-red-100 transition-colors"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Active Timer</span>
                </button>
              ) : (
                <button
                  onClick={() => startTimer(task.displayId, task.title)}
                  className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Timer on Task</span>
                </button>
              )}
            </div>

            {/* Assignee */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Assignee</span>
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                  {task.assigneeName ? task.assigneeName.charAt(0) : <User className="w-3 h-3" />}
                </div>
                <span>{task.assigneeName || 'Unassigned'}</span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Priority</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
                <AlertCircle className="w-3 h-3" />
                <span>{task.priority}</span>
              </span>
            </div>

            {/* Due Date */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Due Date</span>
              <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.dueDate || 'No deadline'}</span>
              </div>
            </div>

            {/* Story Points */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Estimate</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                {task.storyPoints ? `${task.storyPoints} pts` : 'Not estimated'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dirty Warning Dialog */}
      {showDirtyWarning && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Unsaved Changes</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have uncommitted modifications in this task. Are you sure you want to discard your edits?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowDirtyWarning(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleForceClose}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
