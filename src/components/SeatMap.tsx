"use client";

import React from "react";

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
}

import { DESK_OVERLAYS, getDeskCenter } from "@/lib/pathfinding";

export default function SeatMap({
  desks,
  selectedDeskId,
  onDeskClick,
}: SeatMapProps) {
  // Build a set of occupied desk IDs for quick lookup
  const occupiedDesks = new Map<string, DeskData>();
  for (const d of desks) {
    if (d.initial && d.initial.trim()) {
      occupiedDesks.set(d.deskId, d);
    }
  }

  return (
    <svg
      viewBox="0 0 4095 2487"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <style>{`
          .overlay-rect {
            transition: opacity 0.2s ease, stroke-width 0.2s ease;
          }
          .overlay-rect:hover {
            opacity: 0.25 !important;
            cursor: pointer;
          }
          @keyframes pulse-ring {
            0% { opacity: 0.6; stroke-width: 6; }
            50% { opacity: 1; stroke-width: 10; }
            100% { opacity: 0.6; stroke-width: 6; }
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
            {/* Invisible clickable area */}
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
              onClick={() => hasOccupant && onDeskClick?.(ov.id)}
            />
            {/* Pulse ring for selected desk */}
            {isSelected && (
              <rect
                x={ov.x - 3}
                y={ov.y - 3}
                width={ov.w + 6}
                height={ov.h + 6}
                rx={6}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={6}
                className="desk-pulse"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
