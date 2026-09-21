interface Point {
  x: number;
  y: number;
}

interface Waypoint extends Point {
  id: string;
  neighbors: string[];
}

interface DeskNode extends Point {
  deskId: string;
}

/**
 * Finds the shortest path between waypoints using Dijkstra's algorithm.
 */
function findShortestWaypointPath(
  startId: string,
  endId: string,
  waypoints: Waypoint[]
): Waypoint[] | null {
  const waypointMap = new Map<string, Waypoint>();
  for (const w of waypoints) {
    waypointMap.set(w.id, w);
  }

  if (!waypointMap.has(startId) || !waypointMap.has(endId)) {
    return null;
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const queue = new Set<string>();

  for (const w of waypoints) {
    distances.set(w.id, Infinity);
    previous.set(w.id, null);
    queue.add(w.id);
  }

  distances.set(startId, 0);

  while (queue.size > 0) {
    let minNodeId: string | null = null;
    let minDist = Infinity;
    for (const nodeId of queue) {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < minDist) {
        minDist = dist;
        minNodeId = nodeId;
      }
    }

    if (minNodeId === null || minNodeId === endId) {
      break;
    }

    queue.delete(minNodeId);
    const minNode = waypointMap.get(minNodeId);
    if (!minNode) continue;

    for (const neighborId of minNode.neighbors) {
      if (!queue.has(neighborId)) continue;
      const neighbor = waypointMap.get(neighborId);
      if (!neighbor) continue;

      const dx = minNode.x - neighbor.x;
      const dy = minNode.y - neighbor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const alt = (distances.get(minNodeId) ?? 0) + dist;
      if (alt < (distances.get(neighborId) ?? Infinity)) {
        distances.set(neighborId, alt);
        previous.set(neighborId, minNodeId);
      }
    }
  }

  if (distances.get(endId) === Infinity) {
    return null;
  }

  const path: Waypoint[] = [];
  let current: string | null = endId;
  while (current !== null) {
    const node = waypointMap.get(current);
    if (node) {
      path.unshift(node);
    }
    current = previous.get(current) ?? null;
  }

  return path;
}

/**
 * Calculates an orthogonal SVG path from the starting waypoint (e.g. ENTRANCE)
 * to the target desk, navigating exclusively through predefined hallway waypoints.
 * Every turn is a sharp 90-degree turn following corridor logic.
 */
export function calculateOrthogonalPath(
  startNodeId: string,
  targetDeskId: string,
  waypoints: Waypoint[],
  desks: DeskNode[]
): string {
  const desk = desks.find((d) => d.deskId === targetDeskId);
  if (!desk) {
    console.error(`Desk not found for pathfinding: ${targetDeskId}`);
    return "";
  }

  // Find waypoint closest to the target desk
  let closestWaypoint: Waypoint | null = null;
  let minDist = Infinity;

  for (const w of waypoints) {
    const dx = w.x - desk.x;
    const dy = w.y - desk.y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closestWaypoint = w;
    }
  }

  if (!closestWaypoint) {
    console.error("No waypoints available for routing.");
    return "";
  }

  // Get path from start waypoint (e.g. ENTRANCE) to the closest waypoint
  const waypointPath = findShortestWaypointPath(startNodeId, closestWaypoint.id, waypoints);
  if (!waypointPath || waypointPath.length === 0) {
    console.warn(`Could not find a path from ${startNodeId} to ${closestWaypoint.id}`);
    return `M ${waypoints.find((w) => w.id === startNodeId)?.x || 50} 95 H ${desk.x} V ${desk.y}`;
  }

  // Build the list of all points in the path
  const points: Point[] = [...waypointPath];

  // Determine whether the closest waypoint belongs to a vertical aisle or horizontal hallway
  const isVerticalAisle =
    closestWaypoint.id.startsWith("AISLE_") ||
    closestWaypoint.id.startsWith("SPINE_") ||
    closestWaypoint.id.startsWith("CORR_");

  // Generate the orthogonal SVG path string (using M, H, V commands)
  let pathString = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (Math.abs(prev.x - curr.x) < 0.01) {
      // Purely vertical segment
      pathString += ` V ${curr.y}`;
    } else if (Math.abs(prev.y - curr.y) < 0.01) {
      // Purely horizontal segment
      pathString += ` H ${curr.x}`;
    } else {
      // Turn segment
      pathString += ` H ${curr.x} V ${curr.y}`;
    }
  }

  // Final step: approach the target desk from the hallway
  if (isVerticalAisle) {
    // Walk vertically along the aisle to desk's Y, then turn 90-degrees horizontally into desk
    pathString += ` V ${desk.y} H ${desk.x}`;
  } else {
    // Walk horizontally along the corridor to desk's X, then turn 90-degrees vertically into desk
    pathString += ` H ${desk.x} V ${desk.y}`;
  }

  return pathString;
}
