export interface RoomDoor {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RoomZone {
  id: string;
  name: string;
  code: string;
  category: string;
  x: number;
  y: number;
  w: number;
  h: number;
  doors: RoomDoor[];
  badgeX: number;
  badgeY: number;
  color: string;
  accentColor: string;
}

export const ROOM_ZONES: RoomZone[] = [
  {
    id: "zone-4m",
    name: "Faculty Hall North-West",
    code: "Zone 4M",
    category: "Faculty Workstations",
    x: 1240,
    y: 25,
    w: 735,
    h: 795,
    doors: [
      { x1: 1550, y1: 820, x2: 1660, y2: 820 } // South doorway onto Main Corridor
    ],
    badgeX: 1605,
    badgeY: 820,
    color: "rgba(234, 179, 8, 0.08)",
    accentColor: "#eab308"
  },
  {
    id: "zone-4n",
    name: "Faculty Hall North-East",
    code: "Zone 4N",
    category: "Faculty Workstations",
    x: 1990,
    y: 25,
    w: 730,
    h: 795,
    doors: [
      { x1: 2290, y1: 820, x2: 2400, y2: 820 } // South doorway onto Main Corridor
    ],
    badgeX: 2345,
    badgeY: 820,
    color: "rgba(146, 64, 14, 0.08)",
    accentColor: "#b45309"
  },
  {
    id: "zone-4k",
    name: "West Faculty Wing",
    code: "Zone 4K",
    category: "Faculty Office Suites",
    x: 25,
    y: 475,
    w: 535,
    h: 475,
    doors: [
      { x1: 560, y1: 670, x2: 560, y2: 780 } // East doorway onto West Corridor
    ],
    badgeX: 560,
    badgeY: 725,
    color: "rgba(220, 38, 38, 0.08)",
    accentColor: "#dc2626"
  },
  {
    id: "zone-4l",
    name: "Inner West Suites",
    code: "Zone 4L",
    category: "Faculty Desks",
    x: 610,
    y: 475,
    w: 515,
    h: 285,
    doors: [
      { x1: 820, y1: 760, x2: 920, y2: 760 } // South doorway
    ],
    badgeX: 870,
    badgeY: 760,
    color: "rgba(147, 51, 234, 0.08)",
    accentColor: "#9333ea"
  },
  {
    id: "zone-4j",
    name: "South-West Wing",
    code: "Zone 4J",
    category: "Faculty Suites",
    x: 25,
    y: 1010,
    w: 535,
    h: 625,
    doors: [
      { x1: 560, y1: 1250, x2: 560, y2: 1360 } // East doorway onto South-West Corridor
    ],
    badgeX: 560,
    badgeY: 1305,
    color: "rgba(22, 163, 74, 0.08)",
    accentColor: "#16a34a"
  },
  {
    id: "zone-4p",
    name: "Research & Workstations",
    code: "Zone 4P",
    category: "Research Faculty",
    x: 2490,
    y: 980,
    w: 840,
    h: 920,
    doors: [
      { x1: 2490, y1: 1380, x2: 2490, y2: 1490 } // West doorway
    ],
    badgeX: 2490,
    badgeY: 1435,
    color: "rgba(212, 165, 116, 0.08)",
    accentColor: "#d4a574"
  }
];
