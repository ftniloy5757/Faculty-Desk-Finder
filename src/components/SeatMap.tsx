"use client";

import React from "react";
import { DESK_OVERLAYS } from "@/data/deskOverlays";

// Zone color definitions matching the seat map
export const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  "4K": { bg: "#dc2626", border: "#991b1b", text: "#fff", hoverBg: "#ef4444" },     // Red
  "4J": { bg: "#16a34a", border: "#166534", text: "#fff", hoverBg: "#22c55e" },     // Green
  "4L": { bg: "#9333ea", border: "#6b21a8", text: "#fff", hoverBg: "#a855f7" },     // Purple
  "4M": { bg: "#eab308", border: "#a16207", text: "#1a1a1a", hoverBg: "#facc15" }, // Yellow
  "4N": { bg: "#92400e", border: "#78350f", text: "#fff", hoverBg: "#b45309" },     // Brown
  "4P": { bg: "#d4a574", border: "#a0845c", text: "#1a1a1a", hoverBg: "#deb887" }, // Tan
  "4G": { bg: "#6b7280", border: "#4b5563", text: "#fff", hoverBg: "#9ca3af" },     // Grey
};

interface DeskData {
  deskId: string;
  initial: string;
  zone: string;
}

interface SeatMapProps {
  desks: DeskData[];
  selectedDeskId?: string | null;
  onDeskClick?: (deskId: string) => void;
  onMapClick?: (x: number, y: number) => void;
}

export default function SeatMap({
  desks,
  selectedDeskId,
  onDeskClick,
  onMapClick,
}: SeatMapProps) {
  // Build a set of occupied desk IDs for quick lookup
  const occupiedDesks = React.useMemo(() => {
    const map = new Map<string, DeskData>();
    for (const d of desks) {
      if (d.initial && d.initial.trim()) {
        map.set(d.deskId, d);
      }
    }
    return map;
  }, [desks]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const svgPoint = point.matrixTransform(ctm.inverse());
      const absX = Math.round(svgPoint.x);
      const absY = Math.round(svgPoint.y);
      onMapClick?.(absX, absY);
    }
  };

  return (
    <svg
      viewBox="0 0 4095 2487"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      onClick={handleSvgClick}
    >
      <defs>
        <style>{`
          .overlay-rect {
            transition: opacity 0.2s ease, fill 0.2s ease;
          }
          .overlay-rect:hover {
            fill: #3b82f6 !important;
            opacity: 0.25 !important;
            cursor: pointer;
          }
          @keyframes pulse-ring {
            0% { opacity: 0.5; stroke-width: 6; r: 25; }
            50% { opacity: 1; stroke-width: 10; r: 35; }
            100% { opacity: 0.5; stroke-width: 6; r: 25; }
          }
          .desk-pulse {
            animation: pulse-ring 1.5s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Background map image */}
      <image
        href="/map.png"
        x="0"
        y="0"
        width="4095"
        height="2487"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Transparent clickable overlays */}
      {DESK_OVERLAYS.filter(ov => ov.w > 0 && ov.h > 0).map((ov) => {
        const isSelected = selectedDeskId === ov.id;
        const deskData = occupiedDesks.get(ov.id);
        const hasOccupant = !!deskData;
        const colors = ZONE_COLORS[ov.zone] || ZONE_COLORS["4G"];

        return (
          <g key={ov.id} id={`desk-${ov.id}`}>
            {/* Clickable desk area */}
            <rect
              x={ov.x}
              y={ov.y}
              width={ov.w}
              height={ov.h}
              rx={4}
              fill={isSelected ? colors.bg : "transparent"}
              opacity={isSelected ? 0.35 : 0}
              stroke={isSelected ? colors.bg : "none"}
              strokeWidth={isSelected ? 4 : 0}
              className={hasOccupant ? "overlay-rect" : ""}
              style={{ cursor: hasOccupant ? "pointer" : "default" }}
              onClick={(e) => {
                if (hasOccupant) {
                  e.stopPropagation(); // Prevent triggering map click coordinate logger
                  onDeskClick?.(ov.id);
                }
              }}
            />
            {/* Pulse ring for selected desk */}
            {isSelected && (
              <circle
                cx={ov.x + ov.w / 2}
                cy={ov.y + ov.h / 2}
                r={30}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={8}
                className="desk-pulse"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
