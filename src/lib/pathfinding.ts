// Waypoint-based pathfinding for the faculty desk map
// Uses Dijkstra's algorithm to find shortest path from ENTRANCE to any zone

export interface Point {
  x: number;
  y: number;
}

export interface WaypointNode {
  id: string;
  x: number;
  y: number;
}

interface GraphEdge {
  to: string;
  weight: number;
}

// The SVG viewBox is 1400 x 900
// Define waypoints at hallway intersections
const waypoints: WaypointNode[] = [
  // ENTRANCE
  { id: "entrance", x: 640, y: 880 },

  // Main vertical corridor (center)
  { id: "main-v1", x: 640, y: 820 },
  { id: "main-v2", x: 640, y: 720 },
  { id: "main-v3", x: 640, y: 620 },
  { id: "main-v4", x: 640, y: 480 },
  { id: "main-v5", x: 640, y: 380 },

  // Reception area junction
  { id: "reception-j", x: 560, y: 720 },

  // Lower horizontal corridor (4G cabins south)
  { id: "lower-h1", x: 780, y: 720 },
  { id: "lower-h2", x: 780, y: 620 },

  // 4G south cabins (15-17)
  { id: "4g-south", x: 780, y: 780 },

  // 4P zone junction
  { id: "4p-junction", x: 920, y: 620 },
  { id: "4p-inner", x: 980, y: 560 },
  { id: "4p-south", x: 920, y: 750 },

  // Right corridor (4G right cabins)
  { id: "right-v1", x: 1060, y: 780 },
  { id: "right-v2", x: 1060, y: 620 },
  { id: "right-v3", x: 1060, y: 480 },
  { id: "right-v4", x: 1060, y: 380 },
  { id: "right-v5", x: 1060, y: 280 },
  { id: "right-v6", x: 1060, y: 180 },

  // Far right column (4G26-4G33)
  { id: "far-right-v1", x: 1280, y: 780 },
  { id: "far-right-v2", x: 1280, y: 620 },
  { id: "far-right-v3", x: 1280, y: 480 },
  { id: "far-right-v4", x: 1280, y: 280 },
  { id: "far-right-v5", x: 1280, y: 180 },

  // Upper horizontal corridor
  { id: "upper-h1", x: 250, y: 380 },
  { id: "upper-h2", x: 400, y: 380 },
  { id: "upper-h3", x: 500, y: 380 },

  // 4G cabins middle row
  { id: "4g-mid-left", x: 320, y: 480 },
  { id: "4g-mid-right", x: 500, y: 480 },

  // 4J zone junction (lower left)
  { id: "4j-junction", x: 130, y: 480 },
  { id: "4j-inner", x: 130, y: 560 },

  // 4K zone junction (upper left)
  { id: "4k-junction", x: 130, y: 290 },
  { id: "4k-inner", x: 130, y: 240 },

  // 4L zone junction
  { id: "4l-junction", x: 330, y: 290 },
  { id: "4l-inner", x: 330, y: 240 },

  // 4M zone junction (upper center-left)
  { id: "4m-junction", x: 500, y: 290 },
  { id: "4m-inner-left", x: 450, y: 180 },
  { id: "4m-inner-right", x: 580, y: 180 },

  // 4N zone junction (upper center-right)
  { id: "4n-junction", x: 750, y: 290 },
  { id: "4n-inner-left", x: 710, y: 180 },
  { id: "4n-inner-right", x: 830, y: 180 },

  // Top horizontal corridor connecting zones
  { id: "top-h1", x: 130, y: 290 },
  { id: "top-h2", x: 330, y: 290 },
  { id: "top-h3", x: 500, y: 290 },
  { id: "top-h4", x: 640, y: 290 },
  { id: "top-h5", x: 750, y: 290 },
  { id: "top-h6", x: 900, y: 290 },
];

// Build adjacency list
const edges: Record<string, GraphEdge[]> = {};

function addEdge(from: string, to: string) {
  const a = waypoints.find((w) => w.id === from);
  const b = waypoints.find((w) => w.id === to);
  if (!a || !b) return;

  const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  if (!edges[from]) edges[from] = [];
  if (!edges[to]) edges[to] = [];
  edges[from].push({ to, weight: dist });
  edges[to].push({ to: from, weight: dist });
}

// Connect the graph
// Main vertical corridor
addEdge("entrance", "main-v1");
addEdge("main-v1", "main-v2");
addEdge("main-v2", "main-v3");
addEdge("main-v3", "main-v4");
addEdge("main-v4", "main-v5");
addEdge("main-v5", "top-h4");

// Reception
addEdge("main-v2", "reception-j");

// Lower horizontal
addEdge("main-v2", "lower-h1");
addEdge("lower-h1", "lower-h2");
addEdge("lower-h1", "4g-south");

// 4P junction
addEdge("lower-h2", "4p-junction");
addEdge("4p-junction", "4p-inner");
addEdge("4p-junction", "4p-south");

// Right corridor
addEdge("4p-junction", "right-v2");
addEdge("right-v1", "right-v2");
addEdge("right-v2", "right-v3");
addEdge("right-v3", "right-v4");
addEdge("right-v4", "right-v5");
addEdge("right-v5", "right-v6");
addEdge("4p-south", "right-v1");

// Far right
addEdge("right-v1", "far-right-v1");
addEdge("right-v2", "far-right-v2");
addEdge("right-v3", "far-right-v3");
addEdge("right-v5", "far-right-v4");
addEdge("right-v6", "far-right-v5");
addEdge("far-right-v1", "far-right-v2");
addEdge("far-right-v2", "far-right-v3");
addEdge("far-right-v3", "far-right-v4");
addEdge("far-right-v4", "far-right-v5");

// Upper horizontal
addEdge("main-v5", "upper-h3");
addEdge("upper-h1", "upper-h2");
addEdge("upper-h2", "upper-h3");
addEdge("upper-h3", "main-v5");

// 4G mid
addEdge("upper-h1", "4g-mid-left");
addEdge("upper-h3", "4g-mid-right");
addEdge("main-v4", "4g-mid-right");

// 4J zone
addEdge("upper-h1", "4j-junction");
addEdge("4j-junction", "4j-inner");

// Top corridor
addEdge("4k-junction", "top-h2");
addEdge("top-h2", "top-h3");
addEdge("top-h3", "top-h4");
addEdge("top-h4", "top-h5");
addEdge("top-h5", "top-h6");
addEdge("top-h6", "right-v5");

// Zone connections from top corridor
addEdge("4k-junction", "4k-inner");
addEdge("4l-junction", "4l-inner");
addEdge("top-h3", "4m-junction");
addEdge("4m-junction", "4m-inner-left");
addEdge("4m-junction", "4m-inner-right");
addEdge("top-h5", "4n-junction");
addEdge("4n-junction", "4n-inner-left");
addEdge("4n-junction", "4n-inner-right");

// Connect upper corridor to top corridor
addEdge("upper-h1", "4k-junction");
addEdge("upper-h2", "4l-junction");

// Zone-to-waypoint mapping: which waypoint is closest to each zone
const zoneWaypoints: Record<string, string> = {
  "4K": "4k-inner",
  "4J": "4j-inner",
  "4L": "4l-inner",
  "4M": "4m-inner-left",
  "4N": "4n-inner-left",
  "4P": "4p-inner",
  "4G": "4g-mid-left",
};

// Special desk-level waypoint overrides for 4G cabins
const deskWaypointOverrides: Record<string, string> = {
  "4G01": "4g-mid-left",
  "4G02": "4g-mid-left",
  "4G03": "4g-mid-left",
  "4G04": "4g-mid-left",
  "4G05": "4g-mid-right",
  "4G06": "4g-mid-right",
  "4G07": "main-v3",
  "4G08": "right-v6",
  "4G09": "right-v5",
  "4G10": "right-v4",
  "4G11": "right-v3",
  "4G12": "right-v3",
  "4G13": "lower-h2",
  "4G14": "lower-h2",
  "4G15": "4g-south",
  "4G16": "4g-south",
  "4G17": "4g-south",
  "4G18": "far-right-v1",
  "4G19": "far-right-v1",
  "4G20": "far-right-v2",
  "4G21": "far-right-v3",
  "4G22": "right-v3",
  "4G23": "right-v4",
  "4G24": "right-v5",
  "4G25": "right-v6",
  "4G26": "far-right-v5",
  "4G27": "far-right-v4",
  "4G28": "far-right-v4",
  "4G29": "far-right-v3",
  "4G30": "far-right-v3",
  "4G31": "far-right-v2",
  "4G32": "far-right-v1",
  "4G33": "far-right-v2",
};

function dijkstra(
  start: string,
  end: string
): { path: string[]; distance: number } {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const wp of waypoints) {
    dist[wp.id] = Infinity;
    prev[wp.id] = null;
  }
  dist[start] = 0;

  while (true) {
    let minDist = Infinity;
    let current: string | null = null;

    for (const wp of waypoints) {
      if (!visited.has(wp.id) && dist[wp.id] < minDist) {
        minDist = dist[wp.id];
        current = wp.id;
      }
    }

    if (current === null || current === end) break;
    visited.add(current);

    for (const edge of edges[current] || []) {
      if (!visited.has(edge.to)) {
        const newDist = dist[current] + edge.weight;
        if (newDist < dist[edge.to]) {
          dist[edge.to] = newDist;
          prev[edge.to] = current;
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let node: string | null = end;
  while (node !== null) {
    path.unshift(node);
    node = prev[node];
  }

  return { path, distance: dist[end] };
}

export function getPathToDesk(deskId: string, zone: string): Point[] {
  const targetWaypoint = deskWaypointOverrides[deskId] || zoneWaypoints[zone] || "main-v3";
  const { path } = dijkstra("entrance", targetWaypoint);

  return path.map((nodeId) => {
    const wp = waypoints.find((w) => w.id === nodeId);
    return wp ? { x: wp.x, y: wp.y } : { x: 0, y: 0 };
  });
}

export function pathToSvgD(points: Point[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}
