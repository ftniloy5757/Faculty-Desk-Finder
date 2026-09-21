"use client";

import React from "react";
import { DESK_OVERLAYS } from "@/data/deskOverlays";
import { ROOM_ZONES } from "@/data/roomZones";
import { motion } from "framer-motion";

export const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; hoverBg: string; bevel: string }> = {
  "4K": { bg: "#ef4444", border: "#b91c1c", text: "#fff", hoverBg: "#f87171", bevel: "#991b1b" },
  "4J": { bg: "#22c55e", border: "#15803d", text: "#fff", hoverBg: "#4ade80", bevel: "#166534" },
  "4L": { bg: "#a855f7", border: "#7e22ce", text: "#fff", hoverBg: "#c084fc", bevel: "#6b21a8" },
  "4M": { bg: "#facc15", border: "#ca8a04", text: "#1a1a1a", hoverBg: "#fde047", bevel: "#a16207" },
  "4N": { bg: "#b45309", border: "#78350f", text: "#fff", hoverBg: "#d97706", bevel: "#542307" },
  "4P": { bg: "#e2b17a", border: "#b08455", text: "#1a1a1a", hoverBg: "#ebd2b4", bevel: "#8c6036" },
  "4G": { bg: "#64748b", border: "#334155", text: "#fff", hoverBg: "#94a3b8", bevel: "#1e293b" },
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
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 3D Drop Shadow */}
        <filter id="desk-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity="0.45" />
        </filter>

        {/* Wall Top Glow */}
        <filter id="wall-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients for 3D Desks */}
        <linearGradient id="selected-desk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="glass-wall-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
        </linearGradient>

        <style>{`
          .overlay-rect {
            transition: opacity 0.2s ease, fill 0.2s ease;
          }
          .overlay-rect:hover {
            fill: #38bdf8 !important;
            opacity: 0.3 !important;
            cursor: pointer;
          }
          .desk-3d-top {
            transition: filter 0.2s ease, transform 0.2s ease;
          }
          .desk-3d-top:hover {
            filter: brightness(1.2);
            cursor: pointer;
          }
          @keyframes beacon-float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          @keyframes ripple-pulse {
            0% { r: 20px; opacity: 0.85; stroke-width: 7; }
            50% { r: 56px; opacity: 0.25; stroke-width: 4; }
            100% { r: 20px; opacity: 0.85; stroke-width: 7; }
          }
          @keyframes badge-hover {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          .beacon-marker {
            animation: beacon-float 2s ease-in-out infinite;
            transform-origin: center;
          }
          .ripple-ring {
            animation: ripple-pulse 1.8s ease-in-out infinite;
          }
          .room-badge {
            animation: badge-hover 3s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Layer 1: Background Blueprint Image */}
      <image
        href="/map.png"
        x="0"
        y="0"
        width="4095"
        height="2487"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Layer 2: Architectural Glass Room Partitions (3D Mode) */}
      {is3D && (
        <g id="architectural-rooms" className="transition-opacity duration-700">
          {ROOM_ZONES.map((zone) => {
            const wallH = 110; // Prominent architectural wall height in SVG units
            const hasDoorOnSouth = zone.doors.length > 0 && Math.abs(zone.doors[0].y1 - (zone.y + zone.h)) < 50;

            return (
              <g key={zone.id} id={zone.id} className="pointer-events-none">
                {/* Zone Floor Tint Wash */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx={20}
                  fill={zone.color}
                  stroke={zone.accentColor}
                  strokeWidth="3.5"
                  strokeDasharray="24 12"
                  opacity={0.75}
                />

                {/* Translucent Glass Wall - North Wall (Top) */}
                <polygon
                  points={`${zone.x},${zone.y - wallH} ${zone.x + zone.w},${zone.y - wallH} ${zone.x + zone.w},${zone.y} ${zone.x},${zone.y}`}
                  fill="url(#glass-wall-grad)"
                  stroke={zone.accentColor}
                  strokeWidth="2.5"
                  opacity={0.6}
                />
                {/* Glowing Top Rim Rail */}
                <line
                  x1={zone.x}
                  y1={zone.y - wallH}
                  x2={zone.x + zone.w}
                  y2={zone.y - wallH}
                  stroke={zone.accentColor}
                  strokeWidth="5"
                  filter="url(#wall-glow)"
                />

                {/* Translucent Glass Wall - West Wall (Left) */}
                <polygon
                  points={`${zone.x},${zone.y - wallH} ${zone.x},${zone.y} ${zone.x},${zone.y + zone.h} ${zone.x},${zone.y + zone.h - wallH}`}
                  fill="url(#glass-wall-grad)"
                  stroke={zone.accentColor}
                  strokeWidth="2"
                  opacity={0.45}
                />
                <line
                  x1={zone.x}
                  y1={zone.y - wallH}
                  x2={zone.x}
                  y2={zone.y + zone.h - wallH}
                  stroke={zone.accentColor}
                  strokeWidth="4"
                  opacity={0.8}
                />

                {/* Translucent Glass Wall - East Wall (Right) */}
                <polygon
                  points={`${zone.x + zone.w},${zone.y - wallH} ${zone.x + zone.w},${zone.y} ${zone.x + zone.w},${zone.y + zone.h} ${zone.x + zone.w},${zone.y + zone.h - wallH}`}
                  fill="url(#glass-wall-grad)"
                  stroke={zone.accentColor}
                  strokeWidth="2"
                  opacity={0.45}
                />
                <line
                  x1={zone.x + zone.w}
                  y1={zone.y - wallH}
                  x2={zone.x + zone.w}
                  y2={zone.y + zone.h - wallH}
                  stroke={zone.accentColor}
                  strokeWidth="4"
                  opacity={0.8}
                />

                {/* Translucent Glass Wall - South Wall with Doorway Cutout */}
                {hasDoorOnSouth ? (
                  <>
                    {/* Left segment */}
                    <polygon
                      points={`${zone.x},${zone.y + zone.h - wallH} ${zone.doors[0].x1},${zone.y + zone.h - wallH} ${zone.doors[0].x1},${zone.y + zone.h} ${zone.x},${zone.y + zone.h}`}
                      fill="url(#glass-wall-grad)"
                      stroke={zone.accentColor}
                      strokeWidth="2.5"
                      opacity={0.65}
                    />
                    <line
                      x1={zone.x}
                      y1={zone.y + zone.h - wallH}
                      x2={zone.doors[0].x1}
                      y2={zone.y + zone.h - wallH}
                      stroke={zone.accentColor}
                      strokeWidth="5"
                    />
                    {/* Right segment */}
                    <polygon
                      points={`${zone.doors[0].x2},${zone.y + zone.h - wallH} ${zone.x + zone.w},${zone.y + zone.h - wallH} ${zone.x + zone.w},${zone.y + zone.h} ${zone.doors[0].x2},${zone.y + zone.h}`}
                      fill="url(#glass-wall-grad)"
                      stroke={zone.accentColor}
                      strokeWidth="2.5"
                      opacity={0.65}
                    />
                    <line
                      x1={zone.doors[0].x2}
                      y1={zone.y + zone.h - wallH}
                      x2={zone.x + zone.w}
                      y2={zone.y + zone.h - wallH}
                      stroke={zone.accentColor}
                      strokeWidth="5"
                    />
                  </>
                ) : (
                  <>
                    <polygon
                      points={`${zone.x},${zone.y + zone.h - wallH} ${zone.x + zone.w},${zone.y + zone.h - wallH} ${zone.x + zone.w},${zone.y + zone.h} ${zone.x},${zone.y + zone.h}`}
                      fill="url(#glass-wall-grad)"
                      stroke={zone.accentColor}
                      strokeWidth="2.5"
                      opacity={0.6}
                    />
                    <line
                      x1={zone.x}
                      y1={zone.y + zone.h - wallH}
                      x2={zone.x + zone.w}
                      y2={zone.y + zone.h - wallH}
                      stroke={zone.accentColor}
                      strokeWidth="5"
                    />
                  </>
                )}

                {/* Corner Architectural Columns */}
                <rect x={zone.x - 5} y={zone.y - wallH} width={10} height={wallH + 5} rx={3} fill={zone.accentColor} opacity={0.9} />
                <rect x={zone.x + zone.w - 5} y={zone.y - wallH} width={10} height={wallH + 5} rx={3} fill={zone.accentColor} opacity={0.9} />
                <rect x={zone.x - 5} y={zone.y + zone.h - wallH} width={10} height={wallH + 5} rx={3} fill={zone.accentColor} opacity={0.9} />
                <rect x={zone.x + zone.w - 5} y={zone.y + zone.h - wallH} width={10} height={wallH + 5} rx={3} fill={zone.accentColor} opacity={0.9} />
              </g>
            );
          })}
        </g>
      )}

      {/* Layer 3: Desks (Volumetric 3D with Harmonious Zone Palettes) */}
      <g id="desks-layer">
        {DESK_OVERLAYS.filter((ov) => ov.w > 0 && ov.h > 0).map((ov) => {
          const isSelected = selectedDeskId === ov.id;
          const deskData = occupiedDesks.get(ov.id);
          const hasOccupant = !!deskData;
          const colors = ZONE_COLORS[ov.zone] || ZONE_COLORS["4G"];
          const centerX = ov.x + ov.w / 2;

          // In 3D Mode: render volumetric architectural cubicle
          if (is3D) {
            const H = isSelected ? 36 : 18; // Extrusion height
            const topY = ov.y - H;
            const deskFill = isSelected ? "url(#selected-desk-grad)" : hasOccupant ? colors.bg : "rgba(30, 41, 59, 0.55)";
            const bevelFill = isSelected ? "#0284c7" : hasOccupant ? colors.bevel : "#0f172a";
            const sideFill = isSelected ? "#0369a1" : hasOccupant ? colors.bevel : "#090d16";
            const strokeColor = isSelected ? "#38bdf8" : hasOccupant ? colors.border : "#334155";
            const textColor = isSelected ? "#ffffff" : colors.text;

            return (
              <g
                key={ov.id}
                id={`desk-${ov.id}`}
                className="cursor-pointer"
                onClick={(e) => {
                  if (hasOccupant) {
                    e.stopPropagation();
                    onDeskClick?.(ov.id);
                  }
                }}
              >
                {/* Floor Drop Shadow */}
                <rect
                  x={ov.x + 4}
                  y={ov.y + 6}
                  width={ov.w}
                  height={ov.h}
                  rx={5}
                  fill="rgba(0,0,0,0.4)"
                  filter="url(#desk-shadow)"
                  className="pointer-events-none"
                />

                {/* 3D Front Bevel Face */}
                <polygon
                  points={`${ov.x},${topY + ov.h} ${ov.x + ov.w},${topY + ov.h} ${ov.x + ov.w},${ov.y + ov.h} ${ov.x},${ov.y + ov.h}`}
                  fill={bevelFill}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />

                {/* 3D Right Side Face */}
                <polygon
                  points={`${ov.x + ov.w},${topY} ${ov.x + ov.w},${ov.y} ${ov.x + ov.w},${ov.y + ov.h} ${ov.x + ov.w},${topY + ov.h}`}
                  fill={sideFill}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />

                {/* Cubicle Privacy Screen / Partition at Back Edge */}
                <rect
                  x={ov.x + 3}
                  y={topY - 11}
                  width={ov.w - 6}
                  height={12}
                  rx={3}
                  fill={isSelected ? "#38bdf8" : colors.border}
                  opacity={isSelected ? 1 : 0.85}
                  stroke={isSelected ? "#bae6fd" : "#ffffff20"}
                  strokeWidth="1"
                />

                {/* 3D Top Desk Surface */}
                <rect
                  x={ov.x}
                  y={topY}
                  width={ov.w}
                  height={ov.h}
                  rx={5}
                  fill={deskFill}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 4 : 2}
                  className="desk-3d-top"
                  opacity={hasOccupant || isSelected ? 0.96 : 0.6}
                />

                {/* Miniature Computer Display on Desk */}
                {hasOccupant && (
                  <>
                    <rect
                      x={centerX - 18}
                      y={topY + 6}
                      width={36}
                      height={6}
                      rx={2}
                      fill={isSelected ? "#e0f2fe" : "#1e293b"}
                      stroke={isSelected ? "#38bdf8" : "#475569"}
                      strokeWidth="1"
                      opacity={0.9}
                    />
                    <rect
                      x={centerX - 5}
                      y={topY + 12}
                      width={10}
                      height={3}
                      rx={1}
                      fill={isSelected ? "#38bdf8" : "#334155"}
                    />
                  </>
                )}

                {/* Faculty Initials Badge on Desk */}
                {hasOccupant && (
                  <text
                    x={centerX}
                    y={topY + ov.h / 2 + 13}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={ov.w > 130 ? "19" : "15"}
                    fontWeight="800"
                    fontFamily="monospace"
                    className="pointer-events-none"
                    style={{ letterSpacing: "0.8px" }}
                  >
                    {deskData.initial}
                  </text>
                )}
              </g>
            );
          }

          // In 2D Mode: Clean blueprint overlay
          return (
            <g key={ov.id} id={`desk-${ov.id}`}>
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
            </g>
          );
        })}
      </g>

      {/* Layer 4: Orthogonal Hallway Path - Glow Layer */}
      {pathD && shouldAnimatePath && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#0284c7"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
          filter="url(#neon-glow)"
          style={{ vectorEffect: "non-scaling-stroke" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.3, ease: "easeInOut" }}
        />
      )}

      {/* Layer 5: Orthogonal Hallway Path - Core Laser Line (2.3s animation) */}
      {pathD && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="7"
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

      {/* Layer 6: Selected Desk Indicator & 3D Floating Beacon */}
      {selectedDeskId && (() => {
        const ov = DESK_OVERLAYS.find((d) => d.id === selectedDeskId);
        if (!ov) return null;
        const centerX = ov.x + ov.w / 2;
        const centerY = ov.y + ov.h / 2;

        return (
          <g className="pointer-events-none">
            {/* Ground Ripple Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={26}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={7}
              className="ripple-ring"
            />

            {/* 3D Elevated Pin Beacon when in 3D mode */}
            {is3D ? (
              <g className="beacon-marker" filter="url(#desk-shadow)">
                {/* Downward light beam */}
                <line
                  x1={centerX}
                  y1={centerY - 110}
                  x2={centerX}
                  y2={centerY}
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeDasharray="5 3"
                  opacity="0.9"
                />
                {/* Floating 3D Map Pin */}
                <circle cx={centerX} cy={centerY - 115} r={34} fill="#0284c7" stroke="#fff" strokeWidth={6} />
                <circle cx={centerX} cy={centerY - 115} r={15} fill="#fff" />
                <polygon
                  points={`${centerX - 20},${centerY - 98} ${centerX + 20},${centerY - 98} ${centerX},${centerY - 55}`}
                  fill="#0284c7"
                  stroke="#fff"
                  strokeWidth={3.5}
                />
              </g>
            ) : (
              /* 2D High-Visibility Target Ring */
              <circle
                cx={centerX}
                cy={centerY}
                r={40}
                fill="none"
                stroke="#60a5fa"
                strokeWidth={9}
                className="desk-pulse"
              />
            )}
          </g>
        );
      })()}

      {/* Layer 7: Floating Holographic Room Badges (Hovering above entrances) */}
      {is3D && (
        <g id="room-badges" className="pointer-events-none">
          {ROOM_ZONES.map((zone) => (
            <g
              key={`badge-${zone.id}`}
              transform={`translate(${zone.badgeX}, ${zone.badgeY - 140})`}
              className="room-badge"
              filter="url(#desk-shadow)"
            >
              {/* Vertical Mounting Beam */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={140}
                stroke={zone.accentColor}
                strokeWidth="4"
                strokeDasharray="6 4"
                opacity={0.8}
              />
              {/* Ground Anchor Disc */}
              <ellipse cx={0} cy={140} rx={22} ry={9} fill="none" stroke={zone.accentColor} strokeWidth="2.5" opacity={0.7} />

              {/* Badge Glass Container */}
              <rect
                x={-170}
                y={-40}
                width={340}
                height={80}
                rx={40}
                fill="#090d16f0"
                stroke={zone.accentColor}
                strokeWidth="4.5"
              />
              {/* Status Indicator Dot */}
              <circle cx={-125} cy={0} r={9} fill={zone.accentColor} />
              {/* Primary Code */}
              <text
                x={-100}
                y={9}
                fill="#f8fafc"
                fontSize="32"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                letterSpacing="1.2"
              >
                {zone.code}
              </text>
              {/* Sub-label */}
              <text
                x={55}
                y={8}
                fill="#94a3b8"
                fontSize="20"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                letterSpacing="1"
              >
                ZONE
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
