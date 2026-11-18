import mongoose from 'mongoose';
import { Task } from '../../models/Task.js';
import { Project } from '../../models/Project.js';
import { AppError } from '../../utils/errors.js';
import { generateInitialOrder } from '../../utils/lexorank.js';
import { getIO } from '../../real-time/socketServer.js';
import { CreateTaskInput, UpdateTaskInput } from './task.schemas.js';

export class TaskService {
  static async createTask(orgId: string, projectId: string, reporterId: string, input: CreateTaskInput) {
    const project = await Project.findOne({
      _id: projectId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!project) {
      throw new AppError('Project not found in this organization.', 404, 'PROJECT_NOT_FOUND');
    }

    if (project.status === 'archived_read_only') {
      throw new AppError('Cannot create tasks in an archived read-only project.', 403, 'PROJECT_ARCHIVED');
    }

    // 1. Calculate auto-incrementing taskNumber for this project
    const latestTask = await Task.findOne({ projectId }).sort({ taskNumber: -1 });
    const nextTaskNumber = latestTask ? latestTask.taskNumber + 1 : 101;
    const displayId = `${project.key}-${nextTaskNumber}`;

    // 2. Calculate LexoRank order string
    const taskCountInColumn = await Task.countDocuments({ projectId, columnId: input.columnId });
    const order = generateInitialOrder(taskCountInColumn);

    // 3. Create Task
    const task = await Task.create({
      organizationId: orgId,
      projectId,
      taskNumber: nextTaskNumber,
      displayId,
      title: input.title,
      description: input.description,
      columnId: input.columnId,
      status: input.status,
      order,
      priority: input.priority,
      assigneeId: input.assigneeId ? new mongoose.Types.ObjectId(input.assigneeId) : undefined,
      reporterId,
      labels: input.labels,
      storyPoints: input.storyPoints,
      startDate: input.startDate,
      dueDate: input.dueDate,
      estimatedHours: input.estimatedHours,
      version: 1,
    });

    // 4. Broadcast Real-Time Task Creation Event
    try {
      getIO().to(`project:${projectId}`).emit('task:created', {
        projectId,
        task,
      });
    } catch {
      // Ignore if socket server not running in test context
    }

    return task;
  }

  static async listTasks(orgId: string, projectId: string, filters: { columnId?: string; assigneeId?: string; status?: string }) {
    const query: Record<string, unknown> = {
      organizationId: orgId,
      projectId,
      isDeleted: false,
    };

    if (filters.columnId) query.columnId = filters.columnId;
    if (filters.assigneeId) query.assigneeId = filters.assigneeId;
    if (filters.status) query.status = filters.status;

    return Task.find(query)
      .populate('assigneeId', 'fullName email avatarUrl')
      .populate('reporterId', 'fullName email avatarUrl')
      .sort({ order: 1 });
  }

  static async getTaskById(orgId: string, taskId: string) {
    const task = await Task.findOne({
      _id: taskId,
      organizationId: orgId,
      isDeleted: false,
    })
      .populate('assigneeId', 'fullName email avatarUrl')
      .populate('reporterId', 'fullName email avatarUrl');

    if (!task) {
      throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');
    }

    return task;
  }

  static async updateTask(orgId: string, taskId: string, input: UpdateTaskInput) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, organizationId: orgId, isDeleted: false },
      { $set: input, $inc: { version: 1 } },
      { new: true }
    )
      .populate('assigneeId', 'fullName email avatarUrl')
      .populate('reporterId', 'fullName email avatarUrl');

    if (!task) {
      throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');
    }

    // Broadcast Real-Time Task Update Event
    try {
      getIO().to(`project:${task.projectId}`).emit('task:updated', {
        projectId: task.projectId,
        task,
      });
    } catch {
      // Ignore if socket server not running in test context
    }

    return task;
  }

  static async reorderTask(orgId: string, taskId: string, input: { newColumnId: string; orderKey: string; version: number }) {
    // Optimistic Concurrency Update on single document
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        organizationId: orgId,
        version: input.version,
        isDeleted: false,
      },
      {
        $set: {
          columnId: input.newColumnId,
          order: input.orderKey,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!task) {
      // Concurrency conflict check
      const currentTask = await Task.findOne({ _id: taskId, organizationId: orgId });
      if (!currentTask) {
        throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');
      }
      throw new AppError(
        'Concurrent card movement detected. The board has been updated by another action. Please refresh.',
        409,
        'ORDER_CONFLICT'
      );
    }

    // Broadcast Real-Time Card Movement Event to all connected members in this project room
    try {
      getIO().to(`project:${task.projectId}`).emit('card:moved', {
        projectId: task.projectId,
        taskId: task._id,
        displayId: task.displayId,
        newColumnId: task.columnId,
        orderKey: task.order,
        version: task.version,
      });
    } catch {
      // Ignore if socket server not running in test context
    }

    return task;
  }

  static async deleteTask(orgId: string, taskId: string) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, organizationId: orgId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!task) {
      throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');
    }

    return task;
  }
}
