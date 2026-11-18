import { TaskDependency } from '../models/TaskDependency.js';

/**
 * Validates whether adding a dependency (predecessorId -> successorId)
 * introduces a circular loop in the project DAG using Depth-First Search (DFS).
 * 
 * Returns true if a cycle WOULD be created (invalid), false if safe (valid).
 */
export async function wouldCreateCycle(
  projectId: string,
  predecessorId: string,
  successorId: string
): Promise<boolean> {
  // Direct self-dependency loop (A -> A)
  if (predecessorId === successorId) {
    return true;
  }

  // Fetch all existing dependency edges for this project
  const dependencies = await TaskDependency.find({ projectId }).select('predecessorTaskId successorTaskId');

  // Build adjacency list: node -> outgoing edges (successors)
  const adj = new Map<string, string[]>();

  for (const dep of dependencies) {
    const from = dep.predecessorTaskId.toString();
    const to = dep.successorTaskId.toString();
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
  }

  // Add the proposed edge: predecessorId -> successorId
  if (!adj.has(predecessorId)) adj.set(predecessorId, []);
  adj.get(predecessorId)!.push(successorId);

  // DFS to detect if any path exists from successorId back to predecessorId
  const visited = new Set<string>();

  function dfs(curr: string): boolean {
    if (curr === predecessorId) return true; // Cycle found!
    visited.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      }
    }
    return false;
  }

  return dfs(successorId);
}
