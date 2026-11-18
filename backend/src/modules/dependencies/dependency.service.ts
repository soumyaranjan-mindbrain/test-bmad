import { TaskDependency } from '../../models/TaskDependency.js';
import { Task } from '../../models/Task.js';
import { AppError } from '../../utils/errors.js';
import { wouldCreateCycle } from '../../utils/cycleDetector.js';

export class DependencyService {
  static async addDependency(
    orgId: string,
    successorTaskId: string,
    predecessorTaskId: string
  ) {
    if (successorTaskId === predecessorTaskId) {
      throw new AppError('A task cannot depend on itself.', 400, 'SELF_DEPENDENCY_FORBIDDEN');
    }

    const successor = await Task.findOne({
      _id: successorTaskId,
      organizationId: orgId,
      isDeleted: false,
    });

    const predecessor = await Task.findOne({
      _id: predecessorTaskId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!successor || !predecessor) {
      throw new AppError('One or both tasks not found in this organization.', 404, 'TASK_NOT_FOUND');
    }

    if (successor.projectId.toString() !== predecessor.projectId.toString()) {
      throw new AppError('Dependencies can only be linked between tasks in the same project.', 400, 'CROSS_PROJECT_FORBIDDEN');
    }

    // Graph Cycle Detection Guard (DFS traversal)
    const isCycle = await wouldCreateCycle(
      successor.projectId.toString(),
      predecessorTaskId,
      successorTaskId
    );

    if (isCycle) {
      throw new AppError(
        'Circular dependency detected. Linking these tasks would create an infinite dependency loop.',
        400,
        'CIRCULAR_DEPENDENCY_DETECTED'
      );
    }

    const dependency = await TaskDependency.create({
      organizationId: orgId,
      projectId: successor.projectId,
      predecessorTaskId: predecessor._id,
      successorTaskId: successor._id,
      dependencyType: 'finish_to_start',
    });

    return dependency;
  }

  static async getTaskDependencies(orgId: string, taskId: string) {
    const predecessors = await TaskDependency.find({
      organizationId: orgId,
      successorTaskId: taskId,
    }).populate('predecessorTaskId', 'displayId title status priority dueDate');

    const successors = await TaskDependency.find({
      organizationId: orgId,
      predecessorTaskId: taskId,
    }).populate('successorTaskId', 'displayId title status priority dueDate');

    return {
      predecessors: predecessors.map(p => p.predecessorTaskId),
      successors: successors.map(s => s.successorTaskId),
    };
  }

  static async removeDependency(orgId: string, predecessorTaskId: string, successorTaskId: string) {
    const result = await TaskDependency.findOneAndDelete({
      organizationId: orgId,
      predecessorTaskId,
      successorTaskId,
    });

    if (!result) {
      throw new AppError('Dependency not found.', 404, 'DEPENDENCY_NOT_FOUND');
    }

    return result;
  }
}
