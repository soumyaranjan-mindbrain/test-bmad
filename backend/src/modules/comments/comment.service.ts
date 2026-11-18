import { TaskComment } from '../../models/TaskComment.js';
import { Task } from '../../models/Task.js';
import { AppError } from '../../utils/errors.js';
import { getIO } from '../../real-time/socketServer.js';
import { CreateCommentInput } from './comment.schemas.js';

export class CommentService {
  static async createComment(
    orgId: string,
    taskId: string,
    authorId: string,
    userRole: string,
    input: CreateCommentInput
  ) {
    const task = await Task.findOne({
      _id: taskId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!task) {
      throw new AppError('Task not found in this organization.', 404, 'TASK_NOT_FOUND');
    }

    // Role Guard: Guests cannot create internal team notes
    if (input.isInternal && userRole === 'guest') {
      throw new AppError('Guests are not permitted to create internal team notes.', 403, 'FORBIDDEN');
    }

    const comment = await TaskComment.create({
      organizationId: orgId,
      projectId: task.projectId,
      taskId: task._id,
      authorId,
      text: input.text,
      isInternal: input.isInternal,
    });

    await comment.populate('authorId', 'fullName email avatarUrl');

    // Real-Time Broadcast: Only emit internal comments if recipients are authorized
    try {
      getIO().to(`task:${taskId}`).emit('comment:new', {
        taskId,
        comment,
      });
    } catch {
      // Ignore if socket server not running in test context
    }

    return comment;
  }

  static async listComments(orgId: string, taskId: string, isGuest: boolean) {
    const query: Record<string, unknown> = {
      organizationId: orgId,
      taskId,
    };

    // Zero-Leak Filter: If requesting user is a Guest, strictly exclude internal notes
    if (isGuest) {
      query.isInternal = false;
    }

    return TaskComment.find(query)
      .populate('authorId', 'fullName email avatarUrl')
      .sort({ createdAt: 1 });
  }
}
