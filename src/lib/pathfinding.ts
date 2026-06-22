// Waypoint-based pathfinding for the faculty desk map
// Uses Dijkstra's algorithm on the 4095×2487 coordinate system
// All paths are orthogonal (90-degree turns only)

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

// ═══════════════════════════════════════════════════════════════════
// DESK OVERLAY COORDINATES
// Mapped to SVG viewBox 0 0 4095 2487
// ═══════════════════════════════════════════════════════════════════

export interface DeskOverlay {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zone: string;
}

export const DESK_OVERLAYS: DeskOverlay[] = [
  // ── 4M Zone (Yellow) ── Top center-left
  // Left block: pairs 4M107/4M116 down to 4M102/4M111
  { id: "4M107", x: 1290, y: 48, w: 140, h: 70, zone: "4M" },
  { id: "4M116", x: 1435, y: 48, w: 140, h: 70, zone: "4M" },
  { id: "4M106", x: 1290, y: 122, w: 140, h: 70, zone: "4M" },
  { id: "4M115", x: 1435, y: 122, w: 140, h: 70, zone: "4M" },
  { id: "4M105", x: 1290, y: 196, w: 140, h: 70, zone: "4M" },
  { id: "4M114", x: 1435, y: 196, w: 140, h: 70, zone: "4M" },
  // Second sub-block
  { id: "4M104", x: 1290, y: 310, w: 140, h: 70, zone: "4M" },
  { id: "4M113", x: 1435, y: 310, w: 140, h: 70, zone: "4M" },
  { id: "4M103", x: 1290, y: 384, w: 140, h: 70, zone: "4M" },
  { id: "4M112", x: 1435, y: 384, w: 140, h: 70, zone: "4M" },
  { id: "4M102", x: 1290, y: 458, w: 140, h: 70, zone: "4M" },
  { id: "4M111", x: 1435, y: 458, w: 140, h: 70, zone: "4M" },

  // Right block: 4M125/4M134 down to 4M117/4M126
  { id: "4M125", x: 1660, y: 48, w: 140, h: 70, zone: "4M" },
  { id: "4M134", x: 1805, y: 48, w: 140, h: 70, zone: "4M" },
  { id: "4M124", x: 1660, y: 122, w: 140, h: 70, zone: "4M" },
  { id: "4M133", x: 1805, y: 122, w: 140, h: 70, zone: "4M" },
  { id: "4M123", x: 1660, y: 196, w: 140, h: 70, zone: "4M" },
  { id: "4M132", x: 1805, y: 196, w: 140, h: 70, zone: "4M" },
  { id: "4M122", x: 1660, y: 310, w: 140, h: 70, zone: "4M" },
  { id: "4M131", x: 1805, y: 310, w: 140, h: 70, zone: "4M" },
  { id: "4M121", x: 1660, y: 384, w: 140, h: 70, zone: "4M" },
  { id: "4M130", x: 1805, y: 384, w: 140, h: 70, zone: "4M" },
  { id: "4M120", x: 1660, y: 458, w: 140, h: 70, zone: "4M" },
  { id: "4M129", x: 1805, y: 458, w: 140, h: 70, zone: "4M" },

  // Bottom sub-block
  { id: "4M101", x: 1290, y: 570, w: 140, h: 70, zone: "4M" },
  { id: "4M110", x: 1435, y: 570, w: 140, h: 70, zone: "4M" },
  { id: "4M100", x: 1290, y: 644, w: 140, h: 70, zone: "4M" },
  { id: "4M109", x: 1435, y: 644, w: 140, h: 70, zone: "4M" },
  { id: "4M99",  x: 1290, y: 718, w: 140, h: 70, zone: "4M" },
  { id: "4M108", x: 1435, y: 718, w: 140, h: 70, zone: "4M" },
  { id: "4M119", x: 1660, y: 570, w: 140, h: 70, zone: "4M" },
  { id: "4M128", x: 1805, y: 570, w: 140, h: 70, zone: "4M" },
  { id: "4M118", x: 1660, y: 644, w: 140, h: 70, zone: "4M" },
  { id: "4M127", x: 1805, y: 644, w: 140, h: 70, zone: "4M" },
  { id: "4M117", x: 1660, y: 718, w: 140, h: 70, zone: "4M" },
  { id: "4M126", x: 1805, y: 718, w: 140, h: 70, zone: "4M" },

  // ── 4N Zone (Brown) ── Top center-right
  // Left block: 4N143/4N152 down to 4N135/4N144
  { id: "4N143", x: 2030, y: 48, w: 140, h: 70, zone: "4N" },
  { id: "4N152", x: 2175, y: 48, w: 140, h: 70, zone: "4N" },
  { id: "4N142", x: 2030, y: 122, w: 140, h: 70, zone: "4N" },
  { id: "4N151", x: 2175, y: 122, w: 140, h: 70, zone: "4N" },
  { id: "4N141", x: 2030, y: 196, w: 140, h: 70, zone: "4N" },
  { id: "4N150", x: 2175, y: 196, w: 140, h: 70, zone: "4N" },
  { id: "4N140", x: 2030, y: 310, w: 140, h: 70, zone: "4N" },
  { id: "4N149", x: 2175, y: 310, w: 140, h: 70, zone: "4N" },
  { id: "4N139", x: 2030, y: 384, w: 140, h: 70, zone: "4N" },
  { id: "4N148", x: 2175, y: 384, w: 140, h: 70, zone: "4N" },
  { id: "4N138", x: 2030, y: 458, w: 140, h: 70, zone: "4N" },
  { id: "4N147", x: 2175, y: 458, w: 140, h: 70, zone: "4N" },
  { id: "4N137", x: 2030, y: 570, w: 140, h: 70, zone: "4N" },
  { id: "4N146", x: 2175, y: 570, w: 140, h: 70, zone: "4N" },
  { id: "4N136", x: 2030, y: 644, w: 140, h: 70, zone: "4N" },
  { id: "4N145", x: 2175, y: 644, w: 140, h: 70, zone: "4N" },
  { id: "4N135", x: 2030, y: 718, w: 140, h: 70, zone: "4N" },
  { id: "4N144", x: 2175, y: 718, w: 140, h: 70, zone: "4N" },

  // Right block: 4N161/4N170 down to 4N153/4N162
  { id: "4N161", x: 2400, y: 48, w: 140, h: 70, zone: "4N" },
  { id: "4N170", x: 2545, y: 48, w: 140, h: 70, zone: "4N" },
  { id: "4N160", x: 2400, y: 122, w: 140, h: 70, zone: "4N" },
  { id: "4N169", x: 2545, y: 122, w: 140, h: 70, zone: "4N" },
  { id: "4N159", x: 2400, y: 196, w: 140, h: 70, zone: "4N" },
  { id: "4N168", x: 2545, y: 196, w: 140, h: 70, zone: "4N" },
  { id: "4N158", x: 2400, y: 310, w: 140, h: 70, zone: "4N" },
  { id: "4N167", x: 2545, y: 310, w: 140, h: 70, zone: "4N" },
  { id: "4N157", x: 2400, y: 384, w: 140, h: 70, zone: "4N" },
  { id: "4N166", x: 2545, y: 384, w: 140, h: 70, zone: "4N" },
  { id: "4N156", x: 2400, y: 458, w: 140, h: 70, zone: "4N" },
  { id: "4N165", x: 2545, y: 458, w: 140, h: 70, zone: "4N" },
  { id: "4N155", x: 2400, y: 570, w: 140, h: 70, zone: "4N" },
  { id: "4N164", x: 2545, y: 570, w: 140, h: 70, zone: "4N" },
  { id: "4N154", x: 2400, y: 644, w: 140, h: 70, zone: "4N" },
  { id: "4N163", x: 2545, y: 644, w: 140, h: 70, zone: "4N" },
  { id: "4N153", x: 2400, y: 718, w: 140, h: 70, zone: "4N" },
  { id: "4N162", x: 2545, y: 718, w: 140, h: 70, zone: "4N" },

  // ── 4K Zone (Red) ── Left side, upper half
  { id: "4K78", x: 45, y: 510, w: 100, h: 65, zone: "4K" },
  { id: "4K77", x: 150, y: 510, w: 100, h: 65, zone: "4K" },
  { id: "4K79", x: 45, y: 580, w: 100, h: 65, zone: "4K" },
  { id: "4K76", x: 150, y: 580, w: 100, h: 65, zone: "4K" },
  { id: "4K75", x: 150, y: 650, w: 100, h: 65, zone: "4K" },
  { id: "4K80", x: 45, y: 650, w: 100, h: 65, zone: "4K" },
  { id: "4K81", x: 45, y: 760, w: 100, h: 65, zone: "4K" },
  { id: "4K84", x: 150, y: 720, w: 100, h: 65, zone: "4K" },
  { id: "4K85", x: 255, y: 720, w: 100, h: 65, zone: "4K" },
  { id: "4K83", x: 150, y: 790, w: 100, h: 65, zone: "4K" },
  { id: "4K82", x: 45, y: 830, w: 100, h: 65, zone: "4K" },
  { id: "4K74", x: 430, y: 510, w: 100, h: 65, zone: "4K" },
  { id: "4K73", x: 430, y: 580, w: 100, h: 65, zone: "4K" },
  { id: "4K72", x: 430, y: 650, w: 100, h: 65, zone: "4K" },
  { id: "4K71", x: 430, y: 720, w: 100, h: 65, zone: "4K" },
  { id: "4K86", x: 360, y: 790, w: 100, h: 65, zone: "4K" },
  { id: "4K70", x: 430, y: 790, w: 100, h: 65, zone: "4K" },
  { id: "4K69", x: 430, y: 860, w: 100, h: 65, zone: "4K" },

  // ── 4L Zone (Purple) ── Center-left, below 4K
  { id: "4L89", x: 640, y: 510, w: 110, h: 70, zone: "4L" },
  { id: "4L92", x: 755, y: 510, w: 110, h: 70, zone: "4L" },
  { id: "4L95", x: 870, y: 510, w: 110, h: 70, zone: "4L" },
  { id: "4L98", x: 985, y: 510, w: 110, h: 70, zone: "4L" },
  { id: "4L88", x: 640, y: 585, w: 110, h: 70, zone: "4L" },
  { id: "4L91", x: 755, y: 585, w: 110, h: 70, zone: "4L" },
  { id: "4L94", x: 870, y: 585, w: 110, h: 70, zone: "4L" },
  { id: "4L97", x: 985, y: 585, w: 110, h: 70, zone: "4L" },
  { id: "4L87", x: 640, y: 660, w: 110, h: 70, zone: "4L" },
  { id: "4L90", x: 755, y: 660, w: 110, h: 70, zone: "4L" },
  { id: "4L93", x: 870, y: 660, w: 110, h: 70, zone: "4L" },
  { id: "4L96", x: 985, y: 660, w: 110, h: 70, zone: "4L" },

  // ── 4J Zone (Green) ── Left side, lower half
  { id: "4J60", x: 45, y: 1048, w: 100, h: 65, zone: "4J" },
  { id: "4J59", x: 45, y: 1118, w: 100, h: 65, zone: "4J" },
  { id: "4J61", x: 45, y: 1188, w: 100, h: 65, zone: "4J" },
  { id: "4J58", x: 150, y: 1258, w: 100, h: 65, zone: "4J" },
  { id: "4J57", x: 255, y: 1258, w: 100, h: 65, zone: "4J" },
  { id: "4J62", x: 45, y: 1258, w: 100, h: 65, zone: "4J" },
  { id: "4J66", x: 150, y: 1328, w: 100, h: 65, zone: "4J" },
  { id: "4J67", x: 255, y: 1328, w: 100, h: 65, zone: "4J" },
  { id: "4J63", x: 45, y: 1328, w: 100, h: 65, zone: "4J" },
  { id: "4J65", x: 150, y: 1398, w: 100, h: 65, zone: "4J" },
  { id: "4J64", x: 45, y: 1398, w: 100, h: 65, zone: "4J" },
  { id: "4J55", x: 430, y: 1048, w: 100, h: 65, zone: "4J" },
  { id: "4J56", x: 430, y: 1118, w: 100, h: 65, zone: "4J" },
  { id: "4J54", x: 430, y: 1188, w: 100, h: 65, zone: "4J" },
  { id: "4J53", x: 430, y: 1258, w: 100, h: 65, zone: "4J" },
  { id: "4J52", x: 430, y: 1398, w: 100, h: 65, zone: "4J" },
  { id: "4J68", x: 430, y: 1468, w: 100, h: 65, zone: "4J" },
  { id: "4J51", x: 430, y: 1538, w: 100, h: 65, zone: "4J" },

  // ── 4G Cabins (Grey) ──
  { id: "4G02", x: 650, y: 1020, w: 160, h: 95, zone: "4G" },
  { id: "4G03", x: 820, y: 1020, w: 160, h: 95, zone: "4G" },
  { id: "4G05", x: 1090, y: 1020, w: 160, h: 95, zone: "4G" },
  { id: "4G07", x: 1350, y: 1020, w: 310, h: 95, zone: "4G" },
  { id: "4G13", x: 1920, y: 1020, w: 160, h: 95, zone: "4G" },
  { id: "4G01", x: 650, y: 1180, w: 160, h: 95, zone: "4G" },
  { id: "4G04", x: 820, y: 1180, w: 160, h: 95, zone: "4G" },
  { id: "4G06", x: 1090, y: 1180, w: 160, h: 95, zone: "4G" },
  { id: "4G14", x: 1920, y: 1180, w: 160, h: 95, zone: "4G" },
  { id: "4G08", x: 2790, y: 48, w: 160, h: 95, zone: "4G" },
  { id: "4G09", x: 2790, y: 148, w: 160, h: 95, zone: "4G" },
  { id: "4G10", x: 2790, y: 286, w: 160, h: 95, zone: "4G" },
  { id: "4G11", x: 2790, y: 386, w: 160, h: 95, zone: "4G" },
  { id: "4G12", x: 2790, y: 520, w: 160, h: 95, zone: "4G" },
  { id: "4G25", x: 2980, y: 48, w: 160, h: 95, zone: "4G" },
  { id: "4G24", x: 2980, y: 148, w: 160, h: 95, zone: "4G" },
  { id: "4G23", x: 2980, y: 286, w: 160, h: 95, zone: "4G" },
  { id: "4G22", x: 2980, y: 386, w: 160, h: 95, zone: "4G" },
  { id: "4G21", x: 2980, y: 520, w: 160, h: 95, zone: "4G" },
  { id: "4G26", x: 3550, y: 48, w: 200, h: 95, zone: "4G" },
  { id: "4G27", x: 3550, y: 148, w: 200, h: 95, zone: "4G" },
  { id: "4G28", x: 3550, y: 286, w: 200, h: 95, zone: "4G" },
  { id: "4G29", x: 3550, y: 386, w: 200, h: 95, zone: "4G" },
  { id: "4G30", x: 3550, y: 520, w: 200, h: 95, zone: "4G" },
  { id: "4G15", x: 2160, y: 1420, w: 160, h: 100, zone: "4G" },
  { id: "4G16", x: 2160, y: 1570, w: 160, h: 100, zone: "4G" },
  { id: "4G17", x: 2160, y: 1720, w: 160, h: 100, zone: "4G" },
  { id: "4G20", x: 2920, y: 1420, w: 160, h: 100, zone: "4G" },
  { id: "4G19", x: 2920, y: 1610, w: 160, h: 100, zone: "4G" },
  { id: "4G18", x: 2920, y: 1780, w: 160, h: 100, zone: "4G" },
  { id: "4G31", x: 3550, y: 1020, w: 200, h: 95, zone: "4G" },
  { id: "4G33", x: 3550, y: 1420, w: 200, h: 100, zone: "4G" },
  { id: "4G32", x: 3550, y: 1650, w: 200, h: 100, zone: "4G" },

  // ── 4P Zone (Tan/Orange) ──
  { id: "4P194", x: 2690, y: 1020, w: 100, h: 65, zone: "4P" },
  { id: "4P171", x: 2790, y: 1020, w: 100, h: 65, zone: "4P" },
  { id: "4P172", x: 2890, y: 1020, w: 100, h: 65, zone: "4P" },
  { id: "4P173", x: 2990, y: 1020, w: 100, h: 65, zone: "4P" },
  { id: "4P193", x: 2690, y: 1090, w: 100, h: 65, zone: "4P" },
  { id: "4P192", x: 2790, y: 1090, w: 100, h: 65, zone: "4P" },
  { id: "4P191", x: 2690, y: 1160, w: 100, h: 65, zone: "4P" },
  { id: "4P174", x: 2890, y: 1160, w: 100, h: 65, zone: "4P" },
  { id: "4P175", x: 2990, y: 1160, w: 100, h: 65, zone: "4P" },
  { id: "4P189", x: 2690, y: 1230, w: 100, h: 65, zone: "4P" },
  { id: "4P190", x: 2790, y: 1230, w: 100, h: 65, zone: "4P" },
  { id: "4P188", x: 2690, y: 1300, w: 100, h: 65, zone: "4P" },
  { id: "4P187", x: 2690, y: 1370, w: 100, h: 65, zone: "4P" },
  { id: "4P186", x: 2790, y: 1370, w: 100, h: 65, zone: "4P" },
  { id: "4P176", x: 3200, y: 1020, w: 100, h: 65, zone: "4P" },
  { id: "4P178", x: 3200, y: 1160, w: 100, h: 65, zone: "4P" },
  { id: "4P184", x: 2890, y: 1230, w: 100, h: 65, zone: "4P" },
  { id: "4P183", x: 2990, y: 1230, w: 100, h: 65, zone: "4P" },
  { id: "4P179", x: 3200, y: 1230, w: 100, h: 65, zone: "4P" },
  { id: "4P185", x: 2990, y: 1300, w: 100, h: 65, zone: "4P" },
  { id: "4P182", x: 3200, y: 1300, w: 100, h: 65, zone: "4P" },
  { id: "4P180", x: 3100, y: 1370, w: 100, h: 65, zone: "4P" },
  { id: "4P181", x: 3200, y: 1370, w: 100, h: 65, zone: "4P" },
  { id: "4P195", x: 2530, y: 1480, w: 140, h: 70, zone: "4P" },
  { id: "4P196", x: 2530, y: 1560, w: 140, h: 70, zone: "4P" },
  { id: "4P197", x: 2530, y: 1640, w: 140, h: 70, zone: "4P" },
  { id: "4P198", x: 2530, y: 1720, w: 140, h: 70, zone: "4P" },
  { id: "4P199", x: 2530, y: 1800, w: 140, h: 70, zone: "4P" },
];

const overlayMap = new Map<string, DeskOverlay>();
for (const ov of DESK_OVERLAYS) {
  overlayMap.set(ov.id, ov);
}

export function getDeskCenter(deskId: string): { x: number; y: number } | null {
  const ov = overlayMap.get(deskId);
  if (!ov) return null;
  return { x: ov.x + ov.w / 2, y: ov.y + ov.h / 2 };
}

// ═══════════════════════════════════════════════════════════════════
// WAYPOINTS — hallway intersections on the 4095×2487 map
// All corridors run strictly horizontal or vertical.
// ═══════════════════════════════════════════════════════════════════

const waypoints: WaypointNode[] = [
  // ENTRANCE (bottom-center of the map, between 4J and 4G cabins)
  { id: "entrance", x: 600, y: 2400 },

  // ── Main vertical corridor (runs roughly x≈600) ──
  { id: "main-v1", x: 600, y: 2100 },
  { id: "main-v2", x: 600, y: 1900 },
  { id: "main-v3", x: 600, y: 1500 },
  { id: "main-v4", x: 600, y: 1350 },
  { id: "main-v5", x: 600, y: 960 },  // corridor between 4K/4J desks and 4G/4L cabins

  // ── Left vertical corridor (x≈380, between left desk columns) ──
  { id: "left-v1", x: 380, y: 960 },
  { id: "left-v2", x: 380, y: 480 },

  // ── Upper horizontal corridor (y≈960, below the upper zones) ──
  { id: "upper-h1", x: 130, y: 960 },   // left end near 4K
  { id: "upper-h2", x: 380, y: 960 },   // connects to left-v1
  { id: "upper-h3", x: 600, y: 960 },   // connects to main-v5
  { id: "upper-h4", x: 1200, y: 960 },  // near 4G mid cabins
  { id: "upper-h5", x: 1700, y: 960 },  // near 4G07/4G13
  { id: "upper-h6", x: 2100, y: 960 },  // near 4G13/4G14
  { id: "upper-h7", x: 2700, y: 960 },  // near 4P zone start

  // ── Top horizontal corridor (y≈830, runs along the top of the building) ──
  { id: "top-h1", x: 130, y: 830 },
  { id: "top-h2", x: 380, y: 830 },
  { id: "top-h3", x: 600, y: 830 },
  { id: "top-h4", x: 1200, y: 830 },
  { id: "top-h5", x: 1700, y: 830 },
  { id: "top-h6", x: 2100, y: 830 },
  { id: "top-h7", x: 2700, y: 830 },

  // ── 4K Zone (Red) — upper left ──
  { id: "4k-junction", x: 130, y: 960 },
  { id: "4k-inner", x: 280, y: 700 },

  // ── 4J Zone (Green) — lower left ──
  { id: "4j-junction", x: 130, y: 1350 },
  { id: "4j-inner", x: 280, y: 1250 },

  // ── Left corridor for 4J access ──
  { id: "left-j1", x: 130, y: 1350 },
  { id: "left-j2", x: 130, y: 1100 },

  // ── 4L Zone (Purple) ──
  { id: "4l-junction", x: 800, y: 830 },
  { id: "4l-inner", x: 800, y: 600 },

  // ── 4M Zone (Yellow) ──
  { id: "4m-junction", x: 1570, y: 830 },
  { id: "4m-inner", x: 1570, y: 400 },

  // ── 4N Zone (Brown) ──
  { id: "4n-junction", x: 2300, y: 830 },
  { id: "4n-inner", x: 2300, y: 400 },

  // ── Right vertical corridor (x≈2700) for right-side cabins ──
  { id: "right-v1", x: 2700, y: 830 },
  { id: "right-v2", x: 2700, y: 620 },
  { id: "right-v3", x: 2700, y: 400 },
  { id: "right-v4", x: 2700, y: 250 },
  { id: "right-v5", x: 2700, y: 48 },

  // ── Far-right vertical corridor (x≈3200) ──
  { id: "far-right-v1", x: 3200, y: 960 },
  { id: "far-right-v2", x: 3200, y: 620 },
  { id: "far-right-v3", x: 3200, y: 400 },
  { id: "far-right-v4", x: 3200, y: 250 },
  { id: "far-right-v5", x: 3200, y: 48 },

  // ── Extreme-right column (x≈3500) for 4G26-30 ──
  { id: "extreme-right-v1", x: 3500, y: 960 },
  { id: "extreme-right-v2", x: 3500, y: 620 },
  { id: "extreme-right-v3", x: 3500, y: 400 },
  { id: "extreme-right-v4", x: 3500, y: 250 },
  { id: "extreme-right-v5", x: 3500, y: 48 },

  // ── 4G cabins — middle row (y≈960-1300) ──
  { id: "4g-mid-1", x: 730, y: 960 },    // 4G02,4G01
  { id: "4g-mid-2", x: 900, y: 960 },    // 4G03,4G04
  { id: "4g-mid-3", x: 1170, y: 960 },   // 4G05,4G06
  { id: "4g-mid-4", x: 1500, y: 960 },   // 4G07
  { id: "4g-mid-5", x: 2000, y: 960 },   // 4G13,4G14

  // ── 4P zone junctions ──
  { id: "4p-junction", x: 2700, y: 960 },
  { id: "4p-inner", x: 2900, y: 1150 },
  { id: "4p-south", x: 2600, y: 1420 },

  // ── South corridor for 4G south cabins ──
  { id: "south-h1", x: 2100, y: 1350 },
  { id: "south-h2", x: 2200, y: 1350 },
  { id: "south-h3", x: 2700, y: 1350 },
  { id: "south-h4", x: 3000, y: 1350 },
  { id: "south-h5", x: 3500, y: 1350 },

  // ── South vertical corridors ──
  { id: "south-v1", x: 2200, y: 1700 },  // 4G15-17
  { id: "south-v2", x: 3000, y: 1700 },  // 4G18-20
  { id: "south-v3", x: 3500, y: 1700 },  // 4G31-33
];

// ═══════════════════════════════════════════════════════════════════
// GRAPH EDGES — connect waypoints (orthogonal corridors only)
// ═══════════════════════════════════════════════════════════════════

const edges: Record<string, GraphEdge[]> = {};

function addEdge(from: string, to: string) {
  const a = waypoints.find((w) => w.id === from);
  const b = waypoints.find((w) => w.id === to);
  if (!a || !b) return;

  const dist = Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance

  if (!edges[from]) edges[from] = [];
  if (!edges[to]) edges[to] = [];
  edges[from].push({ to, weight: dist });
  edges[to].push({ to: from, weight: dist });
}

// Main vertical corridor
addEdge("entrance", "main-v1");
addEdge("main-v1", "main-v2");
addEdge("main-v2", "main-v3");
addEdge("main-v3", "main-v4");
addEdge("main-v4", "main-v5");

// Left corridor
addEdge("main-v4", "left-j1");
addEdge("left-j1", "left-j2");
addEdge("left-j2", "upper-h1");

// Upper horizontal corridor
addEdge("upper-h1", "upper-h2");
addEdge("upper-h2", "upper-h3");
addEdge("upper-h3", "upper-h4");
addEdge("upper-h4", "upper-h5");
addEdge("upper-h5", "upper-h6");
addEdge("upper-h6", "upper-h7");

// Top horizontal corridor
addEdge("top-h1", "top-h2");
addEdge("top-h2", "top-h3");
addEdge("top-h3", "top-h4");
addEdge("top-h4", "top-h5");
addEdge("top-h5", "top-h6");
addEdge("top-h6", "top-h7");

// Connect upper corridor to top corridor (vertical links)
addEdge("upper-h1", "top-h1");
addEdge("upper-h2", "top-h2");
addEdge("upper-h3", "top-h3");
addEdge("upper-h4", "top-h4");
addEdge("upper-h5", "top-h5");
addEdge("upper-h6", "top-h6");
addEdge("upper-h7", "top-h7");

// Main corridor connects to upper horizontal
addEdge("main-v5", "upper-h3");

// 4K zone (upper left)
addEdge("upper-h1", "4k-junction");
addEdge("top-h1", "4k-inner");

// 4J zone (lower left)
addEdge("main-v4", "4j-junction");
addEdge("4j-junction", "4j-inner");

// 4L zone
addEdge("top-h3", "4l-junction");
addEdge("4l-junction", "4l-inner");

// 4M zone
addEdge("top-h4", "4m-junction");
addEdge("4m-junction", "4m-inner");

// 4N zone
addEdge("top-h6", "4n-junction");
addEdge("4n-junction", "4n-inner");

// Right vertical corridor
addEdge("top-h7", "right-v1");
addEdge("right-v1", "right-v2");
addEdge("right-v2", "right-v3");
addEdge("right-v3", "right-v4");
addEdge("right-v4", "right-v5");
addEdge("upper-h7", "4p-junction");

// Far-right vertical corridor
addEdge("far-right-v1", "far-right-v2");
addEdge("far-right-v2", "far-right-v3");
addEdge("far-right-v3", "far-right-v4");
addEdge("far-right-v4", "far-right-v5");

// Extreme-right vertical corridor
addEdge("extreme-right-v1", "extreme-right-v2");
addEdge("extreme-right-v2", "extreme-right-v3");
addEdge("extreme-right-v3", "extreme-right-v4");
addEdge("extreme-right-v4", "extreme-right-v5");

// Horizontal cross-links between right corridors
addEdge("right-v1", "far-right-v2");
addEdge("right-v2", "far-right-v2");
addEdge("right-v3", "far-right-v3");
addEdge("right-v4", "far-right-v4");
addEdge("right-v5", "far-right-v5");
addEdge("far-right-v2", "extreme-right-v2");
addEdge("far-right-v3", "extreme-right-v3");
addEdge("far-right-v4", "extreme-right-v4");
addEdge("far-right-v5", "extreme-right-v5");

// 4G mid cabins (horizontal connections along y=960)
addEdge("upper-h3", "4g-mid-1");
addEdge("4g-mid-1", "4g-mid-2");
addEdge("4g-mid-2", "4g-mid-3");
addEdge("4g-mid-3", "4g-mid-4");
addEdge("4g-mid-4", "4g-mid-5");
addEdge("4g-mid-5", "upper-h7");

// 4P zone
addEdge("4p-junction", "4p-inner");
addEdge("4p-junction", "4p-south");

// South corridor
addEdge("upper-h6", "south-h1");
addEdge("south-h1", "south-h2");
addEdge("south-h2", "south-h3");
addEdge("south-h3", "south-h4");
addEdge("south-h4", "south-h5");

// South verticals
addEdge("south-h2", "south-v1");
addEdge("south-h4", "south-v2");
addEdge("south-h5", "south-v3");

// Connect far-right/extreme-right corridors to south
addEdge("far-right-v1", "south-h4");
addEdge("extreme-right-v1", "south-h5");
addEdge("upper-h7", "south-h3");

// ═══════════════════════════════════════════════════════════════════
// ZONE / DESK → WAYPOINT MAPPING
// ═══════════════════════════════════════════════════════════════════

const zoneWaypoints: Record<string, string> = {
  "4K": "4k-inner",
  "4J": "4j-inner",
  "4L": "4l-inner",
  "4M": "4m-inner",
  "4N": "4n-inner",
  "4P": "4p-inner",
  "4G": "4g-mid-1",
};

// Specific desk overrides for scattered 4G cabins
const deskWaypointOverrides: Record<string, string> = {
  "4G01": "4g-mid-1",
  "4G02": "4g-mid-1",
  "4G03": "4g-mid-2",
  "4G04": "4g-mid-2",
  "4G05": "4g-mid-3",
  "4G06": "4g-mid-3",
  "4G07": "4g-mid-4",
  "4G08": "right-v5",
  "4G09": "right-v4",
  "4G10": "right-v3",
  "4G11": "right-v3",
  "4G12": "right-v2",
  "4G13": "4g-mid-5",
  "4G14": "4g-mid-5",
  "4G15": "south-v1",
  "4G16": "south-v1",
  "4G17": "south-v1",
  "4G18": "south-v2",
  "4G19": "south-v2",
  "4G20": "south-v2",
  "4G21": "far-right-v2",
  "4G22": "far-right-v3",
  "4G23": "far-right-v3",
  "4G24": "far-right-v4",
  "4G25": "far-right-v5",
  "4G26": "extreme-right-v5",
  "4G27": "extreme-right-v4",
  "4G28": "extreme-right-v3",
  "4G29": "extreme-right-v3",
  "4G30": "extreme-right-v2",
  "4G31": "extreme-right-v1",
  "4G32": "south-v3",
  "4G33": "south-v3",
};

// ═══════════════════════════════════════════════════════════════════
// DIJKSTRA
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// GEOMETRIC HELPERS FOR DESK COLLISION & EDGE INTERSECTION
// ═══════════════════════════════════════════════════════════════════

function segmentIntersectsDeskInterior(p1: Point, p2: Point, d: DeskOverlay): boolean {
  const xMin = d.x;
  const xMax = d.x + d.w;
  const yMin = d.y;
  const yMax = d.y + d.h;

  if (p1.y === p2.y) {
    // Horizontal segment
    const sy = p1.y;
    const sxMin = Math.min(p1.x, p2.x);
    const sxMax = Math.max(p1.x, p2.x);
    // Overlaps interior if y is inside (yMin, yMax) and x-intervals overlap
    return sy > yMin + 1 && sy < yMax - 1 && sxMax > xMin + 1 && sxMin < xMax - 1;
  } else if (p1.x === p2.x) {
    // Vertical segment
    const sx = p1.x;
    const syMin = Math.min(p1.y, p2.y);
    const syMax = Math.max(p1.y, p2.y);
    // Overlaps interior if x is inside (xMin, xMax) and y-intervals overlap
    return sx > xMin + 1 && sx < xMax - 1 && syMax > yMin + 1 && syMin < yMax - 1;
  }
  return false;
}

function isExtensionValid(lastWp: Point, path: Point[], targetDeskId: string): boolean {
  let prev = lastWp;
  for (const pt of path) {
    for (const d of DESK_OVERLAYS) {
      if (d.id === targetDeskId || d.w === 0 || d.h === 0) continue;
      if (segmentIntersectsDeskInterior(prev, pt, d)) {
        return false;
      }
    }
    prev = pt;
  }
  return true;
}

function getPathDistance(lastWp: Point, path: Point[]): number {
  let dist = 0;
  let prev = lastWp;
  for (const pt of path) {
    dist += Math.abs(prev.x - pt.x) + Math.abs(prev.y - pt.y);
    prev = pt;
  }
  return dist;
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * Returns an array of orthogonal waypoints from the entrance to the
 * nearest corridor node for the given desk/zone, all in the 4095×2487
 * coordinate space.
 */
export function getPathToDesk(deskId: string, zone: string): Point[] {
  const targetWaypoint =
    deskWaypointOverrides[deskId] || zoneWaypoints[zone] || "main-v3";
  const { path } = dijkstra("entrance", targetWaypoint);

  // Convert waypoint IDs to (x,y) points
  const pts = path.map((nodeId) => {
    const wp = waypoints.find((w) => w.id === nodeId);
    return wp ? { x: wp.x, y: wp.y } : { x: 0, y: 0 };
  });

  // Make sure each segment is strictly horizontal or vertical
  // by inserting elbow points where needed
  const orthogonal: Point[] = [];
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) {
      orthogonal.push(pts[i]);
      continue;
    }
    const prev = orthogonal[orthogonal.length - 1];
    const curr = pts[i];
    if (prev.x !== curr.x && prev.y !== curr.y) {
      // Insert an elbow: go horizontal first, then vertical
      orthogonal.push({ x: curr.x, y: prev.y });
    }
    orthogonal.push(curr);
  }

  // Extend the path from the last waypoint to the edge of the destination desk.
  const lastWp = orthogonal[orthogonal.length - 1];
  const targetDesk = DESK_OVERLAYS.find((d) => d.id === deskId);

  if (targetDesk && targetDesk.w > 0 && targetDesk.h > 0) {
    const cx = targetDesk.x + targetDesk.w / 2;
    const cy = targetDesk.y + targetDesk.h / 2;

    const candidates = [
      // Top edge midpoint
      { target: { x: cx, y: targetDesk.y }, elbowFirst: "horizontal" },
      { target: { x: cx, y: targetDesk.y }, elbowFirst: "vertical" },
      // Bottom edge midpoint
      { target: { x: cx, y: targetDesk.y + targetDesk.h }, elbowFirst: "horizontal" },
      { target: { x: cx, y: targetDesk.y + targetDesk.h }, elbowFirst: "vertical" },
      // Left edge midpoint
      { target: { x: targetDesk.x, y: cy }, elbowFirst: "horizontal" },
      { target: { x: targetDesk.x, y: cy }, elbowFirst: "vertical" },
      // Right edge midpoint
      { target: { x: targetDesk.x + targetDesk.w, y: cy }, elbowFirst: "horizontal" },
      { target: { x: targetDesk.x + targetDesk.w, y: cy }, elbowFirst: "vertical" },
    ];

    let bestPath: Point[] | null = null;
    let shortestDist = Infinity;

    for (const c of candidates) {
      const pathSegment: Point[] = [];
      if (c.elbowFirst === "horizontal") {
        // Horizontal first, then vertical
        if (c.target.x !== lastWp.x) {
          pathSegment.push({ x: c.target.x, y: lastWp.y });
        }
        if (c.target.y !== lastWp.y || pathSegment.length === 0) {
          pathSegment.push(c.target);
        }
      } else {
        // Vertical first, then horizontal
        if (c.target.y !== lastWp.y) {
          pathSegment.push({ x: lastWp.x, y: c.target.y });
        }
        if (c.target.x !== lastWp.x || pathSegment.length === 0) {
          pathSegment.push(c.target);
        }
      }

      if (isExtensionValid(lastWp, pathSegment, deskId)) {
        const d = getPathDistance(lastWp, pathSegment);
        if (d < shortestDist) {
          shortestDist = d;
          bestPath = pathSegment;
        }
      }
    }

    if (bestPath) {
      orthogonal.push(...bestPath);
    } else {
      // Fallback: draw a straight line to the nearest point on the bounding box if all blocked
      const bx = Math.max(targetDesk.x, Math.min(targetDesk.x + targetDesk.w, lastWp.x));
      const by = Math.max(targetDesk.y, Math.min(targetDesk.y + targetDesk.h, lastWp.y));
      orthogonal.push({ x: bx, y: by });
    }
  }

  return orthogonal;
}

/** Convert a list of points to an SVG path `d` attribute. */
export function pathToSvgD(points: Point[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}
