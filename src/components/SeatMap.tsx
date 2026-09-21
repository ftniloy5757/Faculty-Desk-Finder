"use client";

import React from "react";
import { DESK_OVERLAYS } from "@/data/deskOverlays";
import { motion } from "framer-motion";

export const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  "4K": { bg: "#dc2626", border: "#991b1b", text: "#fff", hoverBg: "#ef4444" },
  "4J": { bg: "#16a34a", border: "#166534", text: "#fff", hoverBg: "#22c55e" },
  "4L": { bg: "#9333ea", border: "#6b21a8", text: "#fff", hoverBg: "#a855f7" },
  "4M": { bg: "#eab308", border: "#a16207", text: "#1a1a1a", hoverBg: "#facc15" },
  "4N": { bg: "#92400e", border: "#78350f", text: "#fff", hoverBg: "#b45309" },
  "4P": { bg: "#d4a574", border: "#a0845c", text: "#1a1a1a", hoverBg: "#deb887" },
  "4G": { bg: "#6b7280", border: "#4b5563", text: "#fff", hoverBg: "#9ca3af" },
};

interface DeskData {
  deskId: string;
  initial: string;
  zone: string;
}

interface SeatMapProps {
  desks: DeskData[];
  selectedDeskId?: string | null;
  is3D?: boolean;
  onDeskClick?: (deskId: string) => void;
  onMapClick?: (x: number, y: number) => void;
  pathD?: string;
  shouldAnimatePath?: boolean;
  onPathAnimationComplete?: () => void;
}

export default function SeatMap({
  desks,
  selectedDeskId,
  is3D = false,
  onDeskClick,
  onMapClick,
  pathD,
  shouldAnimatePath = false,
  onPathAnimationComplete,
}: SeatMapProps) {
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
      className="w-full h-full select-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      onClick={handleSvgClick}
    >
      <defs>
        {/* Neon Path Glow Filter */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 3D Drop Shadow */}
        <filter id="desk-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
        </filter>

        <style>{`
          .overlay-rect {
            transition: opacity 0.2s ease, fill 0.2s ease;
          }
          .overlay-rect:hover {
            fill: #3b82f6 !important;
            opacity: 0.25 !important;
            cursor: pointer;
          }
          @keyframes beacon-float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-16px); }
            100% { transform: translateY(0px); }
          }
          @keyframes ripple-pulse {
            0% { r: 18px; opacity: 0.8; stroke-width: 6; }
            50% { r: 48px; opacity: 0.3; stroke-width: 4; }
            100% { r: 18px; opacity: 0.8; stroke-width: 6; }
          }
          .beacon-marker {
            animation: beacon-float 2s ease-in-out infinite;
            transform-origin: center;
          }
          .ripple-ring {
            animation: ripple-pulse 1.8s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Background Map Image */}
      <image
        href="/map.png"
        x="0"
        y="0"
        width="4095"
        height="2487"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Orthogonal Hallway Path - Glow Layer */}
      {pathD && shouldAnimatePath && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#0284c7"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
          filter="url(#neon-glow)"
          style={{ vectorEffect: "non-scaling-stroke" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.3, ease: "easeInOut" }}
        />
      )}

      {/* Orthogonal Hallway Path - Core Laser Line (2.3s animation) */}
      {pathD && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: "non-scaling-stroke" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: shouldAnimatePath ? 1 : 0 }}
          transition={{ duration: 2.3, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (shouldAnimatePath && onPathAnimationComplete) {
              onPathAnimationComplete();
            }
          }}
        />
      )}

      {/* Transparent Clickable Overlays */}
      {DESK_OVERLAYS.filter((ov) => ov.w > 0 && ov.h > 0).map((ov) => {
        const isSelected = selectedDeskId === ov.id;
        const deskData = occupiedDesks.get(ov.id);
        const hasOccupant = !!deskData;
        const colors = ZONE_COLORS[ov.zone] || ZONE_COLORS["4G"];
        const centerX = ov.x + ov.w / 2;
        const centerY = ov.y + ov.h / 2;

        return (
          <g key={ov.id} id={`desk-${ov.id}`}>
            {/* Clickable Desk Rectangle */}
            <rect
              x={ov.x}
              y={ov.y}
              width={ov.w}
              height={ov.h}
              rx={6}
              fill={isSelected ? colors.bg : "transparent"}
              opacity={isSelected ? 0.4 : 0}
              stroke={isSelected ? "#38bdf8" : "none"}
              strokeWidth={isSelected ? 5 : 0}
              className={hasOccupant ? "overlay-rect" : ""}
              style={{ cursor: hasOccupant ? "pointer" : "default" }}
              onClick={(e) => {
                if (hasOccupant) {
                  e.stopPropagation();
                  onDeskClick?.(ov.id);
                }
              }}
            />

            {/* Selected Desk Indicator */}
            {isSelected && (
              <g className="pointer-events-none">
                {/* Ground Ripple Ring */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={24}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={6}
                  className="ripple-ring"
                />

                {/* 3D Elevated Pin Beacon when in 3D mode */}
                {is3D ? (
                  <g className="beacon-marker" filter="url(#desk-shadow)">
                    {/* Downward light beam */}
                    <line
                      x1={centerX}
                      y1={centerY - 80}
                      x2={centerX}
                      y2={centerY}
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeDasharray="4 2"
                      opacity="0.8"
                    />
                    {/* Floating 3D Map Pin */}
                    <circle cx={centerX} cy={centerY - 85} r={28} fill="#0284c7" stroke="#fff" strokeWidth={5} />
                    <circle cx={centerX} cy={centerY - 85} r={12} fill="#fff" />
                    <polygon
                      points={`${centerX - 16},${centerY - 72} ${centerX + 16},${centerY - 72} ${centerX},${centerY - 38}`}
                      fill="#0284c7"
                      stroke="#fff"
                      strokeWidth={3}
                    />
                  </g>
                ) : (
                  /* 2D High-Visibility Target Ring */
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={36}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth={8}
                    className="desk-pulse"
                  />
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
