import { ActiveTimer } from '../../models/ActiveTimer.js';
import { TimeEntry } from '../../models/TimeEntry.js';
import { Task } from '../../models/Task.js';
import { AppError } from '../../utils/errors.js';
import { getIO } from '../../real-time/socketServer.js';
import { StartTimerInput, StopTimerInput, ManualTimeEntryInput } from './time.schemas.js';

export class TimeTrackingService {
  static async startTimer(orgId: string, userId: string, input: StartTimerInput) {
    const task = await Task.findOne({
      _id: input.taskId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!task) {
      throw new AppError('Task not found in this organization.', 404, 'TASK_NOT_FOUND');
    }

    // 1. Single-Active-Timer Constraint: If an existing timer is running, stop and commit it first
    const existingTimer = await ActiveTimer.findOne({ userId });
    if (existingTimer) {
      await this.stopTimer(orgId, userId, { notes: 'Auto-saved when starting new timer session' });
    }

    // 2. Start new timer session
    const timer = await ActiveTimer.create({
      organizationId: orgId,
      projectId: task.projectId,
      taskId: task._id,
      userId,
      startTime: new Date(),
      isRunning: true,
      isBillable: input.isBillable,
      notes: input.notes,
    });

    await timer.populate('taskId', 'displayId title');

    // 3. Multi-Device Real-Time Sync: Emit to user's private channel
    try {
      getIO().to(`user:${userId}`).emit('timer:sync', {
        action: 'started',
        timer,
      });
    } catch {
      // Ignore in test context
    }

    return timer;
  }

  static async getActiveTimer(userId: string) {
    return ActiveTimer.findOne({ userId, isRunning: true }).populate('taskId', 'displayId title');
  }

  static async stopTimer(orgId: string, userId: string, input?: StopTimerInput) {
    const timer = await ActiveTimer.findOne({ userId, isRunning: true });
    if (!timer) {
      throw new AppError('No active running timer found for this user.', 404, 'NO_ACTIVE_TIMER');
    }

    const endTime = new Date();
    const durationSeconds = Math.max(1, Math.round((endTime.getTime() - timer.startTime.getTime()) / 1000));
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    // Flush to permanent TimeEntry record
    const timeEntry = await TimeEntry.create({
      organizationId: timer.organizationId,
      projectId: timer.projectId,
      taskId: timer.taskId,
      userId,
      date: new Date(),
      durationMinutes,
      isBillable: timer.isBillable,
      notes: input?.notes || timer.notes,
    });

    // Remove active timer lock
    await ActiveTimer.findByIdAndDelete(timer._id);

    // Multi-Device Real-Time Sync: Emit stop event
    try {
      getIO().to(`user:${userId}`).emit('timer:sync', {
        action: 'stopped',
        timeEntry,
      });
    } catch {
      // Ignore in test context
    }

    return timeEntry;
  }

  static async createManualEntry(orgId: string, userId: string, input: ManualTimeEntryInput) {
    const task = await Task.findOne({
      _id: input.taskId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!task) {
      throw new AppError('Task not found in this organization.', 404, 'TASK_NOT_FOUND');
    }

    const timeEntry = await TimeEntry.create({
      organizationId: orgId,
      projectId: task.projectId,
      taskId: task._id,
      userId,
      date: input.date,
      durationMinutes: input.durationMinutes,
      isBillable: input.isBillable,
      notes: input.notes,
    });

    return timeEntry;
  }

  static async listUserTimeEntries(orgId: string, userId: string) {
    return TimeEntry.find({
      organizationId: orgId,
      userId,
      isDeleted: false,
    })
      .populate('taskId', 'displayId title')
      .populate('projectId', 'name key')
      .sort({ date: -1 });
  }
}
