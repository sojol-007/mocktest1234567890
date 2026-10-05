import { BuildingData, DijkstraPathResult, BuildingEdge } from '../types';

/**
 * Compare two node paths lexicographically, element by element.
 * Tie-Breaker 2: "lexicographically smallest sequence of node IDs (compared node by node)"
 */
export function compareNodePaths(pathA: string[], pathB: string[]): number {
  const minLen = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < minLen; i++) {
    if (pathA[i] !== pathB[i]) {
      return pathA[i].localeCompare(pathB[i]);
    }
  }
  return pathA.length - pathB.length;
}

export interface DijkstraOptions {
  buildingData: BuildingData;
  startNodeId: string;
  blockedNodes: Set<string>;
  blockedEdges: Set<string>;
  closedExits: Set<string>;
}

export function computeShortestEvacuationRoute({
  buildingData,
  startNodeId,
  blockedNodes,
  blockedEdges,
  closedExits
}: DijkstraOptions): DijkstraPathResult {
  const { nodes, edges } = buildingData;

  // Find start node info
  const startNode = nodes.find(n => n.id === startNodeId);

  // All exit nodes in the building
  const allExitNodes = nodes.filter(n => n.type === 'exit');

  // Check 1: If start node doesn't exist or is blocked
  if (!startNode || blockedNodes.has(startNodeId)) {
    return {
      status: 'START_BLOCKED',
      statusMessageEn: 'Starting location blocked',
      statusMessageBn: 'শুরু করার স্থানটি অবরুদ্ধ',
      startNodeId,
      targetExitId: null,
      totalCost: null,
      nodePath: [],
      edgePath: [],
      allExitCosts: allExitNodes.map(ex => ({
        exitId: ex.id,
        label: ex.label,
        cost: null,
        isClosed: closedExits.has(ex.id),
        isReachable: false
      }))
    };
  }

  // Active Graph Construction:
  // - Exclude any node listed in blocked_nodes and all edges connected to it.
  // - Exclude any edge listed in blocked_edges.
  // - Exclude any exit listed in closed_exits (closed exits cannot act as final destinations or intermediate nodes).
  const isNodeActive = (nodeId: string): boolean => {
    if (blockedNodes.has(nodeId)) return false;
    if (closedExits.has(nodeId)) return false;
    return true;
  };

  const isEdgeActive = (edge: BuildingEdge): boolean => {
    if (blockedEdges.has(edge.id)) return false;
    if (!isNodeActive(edge.from)) return false;
    if (!isNodeActive(edge.to)) return false;
    return true;
  };

  // Build active adjacency list
  // Map node -> array of { neighborId, cost, edgeId }
  type NeighborEdge = { neighborId: string; cost: number; edgeId: string };
  const adj = new Map<string, NeighborEdge[]>();
  for (const node of nodes) {
    if (isNodeActive(node.id)) {
      adj.set(node.id, []);
    }
  }

  for (const edge of edges) {
    if (isEdgeActive(edge)) {
      adj.get(edge.from)?.push({ neighborId: edge.to, cost: edge.cost, edgeId: edge.id });
      adj.get(edge.to)?.push({ neighborId: edge.from, cost: edge.cost, edgeId: edge.id });
    }
  }

  // Dijkstra's Algorithm
  const dist = new Map<string, number>();
  const visited = new Set<string>();

  dist.set(startNodeId, 0);

  while (true) {
    let u: string | null = null;
    let minDist = Infinity;

    for (const [nodeId, d] of dist.entries()) {
      if (!visited.has(nodeId) && d < minDist) {
        minDist = d;
        u = nodeId;
      }
    }

    if (u === null || minDist === Infinity) {
      break;
    }

    visited.add(u);

    const neighbors = adj.get(u) || [];
    for (const { neighborId, cost } of neighbors) {
      if (!visited.has(neighborId)) {
        const alt = minDist + cost;
        const currentBest = dist.get(neighborId) ?? Infinity;
        if (alt < currentBest) {
          dist.set(neighborId, alt);
        }
      }
    }
  }

  // Find reachable open exits
  const openExitNodes = allExitNodes.filter(ex => !closedExits.has(ex.id) && !blockedNodes.has(ex.id));

  // Shortest Path DAG & Lexicographically smallest path calculation
  // Collect all reachable nodes sorted by distance
  const reachableNodes = Array.from(visited).sort((a, b) => {
    const da = dist.get(a)!;
    const db = dist.get(b)!;
    return da - db;
  });

  const bestPath = new Map<string, string[]>();
  bestPath.set(startNodeId, [startNodeId]);

  for (const v of reachableNodes) {
    if (v === startNodeId) continue;
    const dv = dist.get(v)!;
    const vNeighbors = adj.get(v) || [];

    // Find all parents u such that dist[u] + cost(u, v) === dist[v]
    let smallestPathForV: string[] | null = null;

    for (const { neighborId: u, cost } of vNeighbors) {
      if (visited.has(u) && dist.has(u)) {
        const du = dist.get(u)!;
        if (du + cost === dv && bestPath.has(u)) {
          const candPath = [...bestPath.get(u)!, v];
          if (smallestPathForV === null || compareNodePaths(candPath, smallestPathForV) < 0) {
            smallestPathForV = candPath;
          }
        }
      }
    }

    if (smallestPathForV) {
      bestPath.set(v, smallestPathForV);
    }
  }

  // Populate exit costs metadata
  const allExitCosts = allExitNodes.map(ex => {
    const isClosed = closedExits.has(ex.id) || blockedNodes.has(ex.id);
    const d = dist.get(ex.id);
    const isReachable = !isClosed && d !== undefined && Number.isFinite(d);
    return {
      exitId: ex.id,
      label: ex.label,
      cost: isReachable ? d! : null,
      isClosed,
      isReachable
    };
  });

  // Evaluate candidate exits
  const reachableExits = openExitNodes
    .filter(ex => dist.has(ex.id) && Number.isFinite(dist.get(ex.id)!))
    .map(ex => ({
      node: ex,
      cost: dist.get(ex.id)!,
      path: bestPath.get(ex.id) || []
    }));

  if (reachableExits.length === 0) {
    return {
      status: 'NO_ROUTE',
      statusMessageEn: 'No route available',
      statusMessageBn: 'কোনো পথ পাওয়া যায়নি',
      startNodeId,
      targetExitId: null,
      totalCost: null,
      nodePath: [],
      edgePath: [],
      allExitCosts
    };
  }

  // 1. Pick exit with MINIMUM path cost
  let minCost = Math.min(...reachableExits.map(e => e.cost));
  let tiedExits = reachableExits.filter(e => e.cost === minCost);

  // Tie-Breaker 1: If multiple exits tie with lowest cost, choose lexicographically smallest exit ID
  tiedExits.sort((a, b) => a.node.id.localeCompare(b.node.id));
  const chosenExitEntry = tiedExits[0];

  // Tie-Breaker 2 is already strictly guaranteed by our Shortest Path DAG lexicographic parent relaxation above.
  const finalNodePath = chosenExitEntry.path;

  // Determine edge IDs traversed in finalNodePath
  const finalEdgePath: string[] = [];
  for (let i = 0; i < finalNodePath.length - 1; i++) {
    const u = finalNodePath[i];
    const v = finalNodePath[i + 1];
    const matchingEdge = edges.find(
      e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );
    if (matchingEdge) {
      finalEdgePath.push(matchingEdge.id);
    }
  }

  return {
    status: 'OK',
    statusMessageEn: 'Safe evacuation route calculated',
    statusMessageBn: 'নিরাপদ উদ্ধার পথ নির্ণয় করা হয়েছে',
    startNodeId,
    targetExitId: chosenExitEntry.node.id,
    totalCost: chosenExitEntry.cost,
    nodePath: finalNodePath,
    edgePath: finalEdgePath,
    allExitCosts
  };
}
