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

// Desk dimensions
const DESK_W = 54;
const DESK_H = 28;
const DESK_GAP = 2;

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

// Helper to render a single desk rectangle
function DeskRect({
  x,
  y,
  w,
  h,
  deskId,
  initial,
  zone,
  isSelected,
  onClick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  deskId: string;
  initial: string;
  zone: string;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const colors = ZONE_COLORS[zone] || ZONE_COLORS["4G"];

  return (
    <g
      id={`desk-${deskId}`}
      className="desk-group"
      onClick={onClick}
      style={{ cursor: initial ? "pointer" : "default" }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill={isSelected ? "#3b82f6" : colors.bg}
        stroke={isSelected ? "#60a5fa" : colors.border}
        strokeWidth={isSelected ? 2 : 1}
        className={initial ? "desk-rect" : ""}
      />
      {isSelected && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={3}
          fill="none"
          stroke="#93c5fd"
          strokeWidth={3}
          className="desk-pulse"
        />
      )}
      <text
        x={x + w / 2}
        y={y + h / 2 - 5}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isSelected ? "#fff" : colors.text}
        fontSize={7}
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
        style={{ pointerEvents: "none" }}
      >
        {deskId}
      </text>
      {initial && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isSelected ? "#dbeafe" : colors.text}
          fontSize={6}
          fontFamily="Inter, sans-serif"
          opacity={0.85}
          style={{ pointerEvents: "none" }}
        >
          {initial}
        </text>
      )}
    </g>
  );
}

// Zone block: renders a grid of desks
function ZoneBlock({
  x,
  y,
  desks,
  cols,
  selectedDeskId,
  onDeskClick,
  direction = "vertical",
}: {
  x: number;
  y: number;
  desks: { deskId: string; initial: string; zone: string }[];
  cols: number;
  selectedDeskId?: string | null;
  onDeskClick?: (deskId: string) => void;
  direction?: "vertical" | "horizontal";
}) {
  return (
    <>
      {desks.map((desk, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const dx = direction === "vertical" ? x + col * (DESK_W + DESK_GAP) : x + row * (DESK_W + DESK_GAP);
        const dy = direction === "vertical" ? y + row * (DESK_H + DESK_GAP) : y + col * (DESK_H + DESK_GAP);

        return (
          <DeskRect
            key={`${desk.deskId}-${desk.initial}-${i}`}
            x={dx}
            y={dy}
            w={DESK_W}
            h={DESK_H}
            deskId={desk.deskId}
            initial={desk.initial}
            zone={desk.zone}
            isSelected={selectedDeskId === desk.deskId || (selectedDeskId !== null && desk.initial !== "" && selectedDeskId === desk.initial)}
            onClick={() => desk.initial && onDeskClick?.(desk.deskId)}
          />
        );
      })}
    </>
  );
}

// Cabin: a single 4G cabin with border
function Cabin({
  x,
  y,
  w,
  h,
  deskId,
  occupants,
  selectedDeskId,
  onDeskClick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  deskId: string;
  occupants: { initial: string }[];
  selectedDeskId?: string | null;
  onDeskClick?: (deskId: string) => void;
}) {
  const isAnySelected = occupants.some(
    (o) => selectedDeskId === deskId || selectedDeskId === o.initial
  );
  const colors = ZONE_COLORS["4G"];

  return (
    <g id={`desk-${deskId}`} className="desk-group">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={isAnySelected ? "#1e40af" : "#374151"}
        stroke={isAnySelected ? "#60a5fa" : "#6b7280"}
        strokeWidth={isAnySelected ? 2 : 1}
        className={occupants.length > 0 ? "desk-rect" : ""}
        style={{ cursor: occupants.length > 0 ? "pointer" : "default" }}
        onClick={() => occupants.length > 0 && onDeskClick?.(deskId)}
      />
      {isAnySelected && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={4}
          fill="none"
          stroke="#93c5fd"
          strokeWidth={3}
          className="desk-pulse"
        />
      )}
      <text
        x={x + w / 2}
        y={y + 12}
        textAnchor="middle"
        fill={isAnySelected ? "#fff" : colors.text}
        fontSize={8}
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
        style={{ pointerEvents: "none" }}
      >
        {deskId}
      </text>
      {occupants.map((occ, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={y + 24 + i * 12}
          textAnchor="middle"
          fill={isAnySelected ? "#dbeafe" : "#d1d5db"}
          fontSize={7}
          fontFamily="Inter, sans-serif"
          style={{ pointerEvents: "none" }}
        >
          {occ.initial}
        </text>
      ))}
    </g>
  );
}

export default function SeatMap({
  desks,
  selectedDeskId,
  onDeskClick,
}: SeatMapProps) {
  // Organize desks by zone
  const desksByZone: Record<string, DeskData[]> = {};
  for (const d of desks) {
    if (!desksByZone[d.zone]) desksByZone[d.zone] = [];
    desksByZone[d.zone].push(d);
  }

  // Group 4G desks by cabin
  const gCabins: Record<string, { initial: string }[]> = {};
  for (const d of desksByZone["4G"] || []) {
    if (!gCabins[d.deskId]) gCabins[d.deskId] = [];
    if (d.initial) gCabins[d.deskId].push({ initial: d.initial });
  }

  // ── 4M desks (yellow) ───────────────────────────
  // Left column pairs: 4M107/4M116, 4M106/4M115, 4M105/4M114, 4M104/4M113, 4M103/4M112, 4M102/4M111
  const m_left = [
    { deskId: "4M107", initial: "SBB", zone: "4M" },
    { deskId: "4M116", initial: "AJA", zone: "4M" },
    { deskId: "4M106", initial: "DFD", zone: "4M" },
    { deskId: "4M115", initial: "", zone: "4M" },
    { deskId: "4M105", initial: "SHRR", zone: "4M" },
    { deskId: "4M114", initial: "SULT", zone: "4M" },
    { deskId: "4M104", initial: "AQU", zone: "4M" },
    { deskId: "4M113", initial: "MVH", zone: "4M" },
    { deskId: "4M103", initial: "FGZ", zone: "4M" },
    { deskId: "4M112", initial: "TVRR", zone: "4M" },
    { deskId: "4M102", initial: "ASAK", zone: "4M" },
    { deskId: "4M111", initial: "ZLNM", zone: "4M" },
  ];

  // Right column pairs
  const m_right = [
    { deskId: "4M125", initial: "NZRF", zone: "4M" },
    { deskId: "4M134", initial: "MHDE", zone: "4M" },
    { deskId: "4M124", initial: "SHAH", zone: "4M" },
    { deskId: "4M133", initial: "RFF", zone: "4M" },
    { deskId: "4M123", initial: "NLH", zone: "4M" },
    { deskId: "4M132", initial: "NDT", zone: "4M" },
    { deskId: "4M122", initial: "KKS", zone: "4M" },
    { deskId: "4M131", initial: "SVKG", zone: "4M" },
    { deskId: "4M121", initial: "NZU", zone: "4M" },
    { deskId: "4M130", initial: "BJS", zone: "4M" },
    { deskId: "4M120", initial: "QUZA", zone: "4M" },
    { deskId: "4M129", initial: "ARD", zone: "4M" },
    { deskId: "4M101", initial: "PLN", zone: "4M" },
    { deskId: "4M110", initial: "MSMA", zone: "4M" },
    { deskId: "4M100", initial: "FFU", zone: "4M" },
    { deskId: "4M109", initial: "SWG", zone: "4M" },
    { deskId: "4M99", initial: "MTSM", zone: "4M" },
    { deskId: "4M108", initial: "PBK", zone: "4M" },
    { deskId: "4M119", initial: "TWK", zone: "4M" },
    { deskId: "4M128", initial: "RKBM", zone: "4M" },
    { deskId: "4M118", initial: "AVB", zone: "4M" },
    { deskId: "4M127", initial: "RHD", zone: "4M" },
    { deskId: "4M117", initial: "FEK", zone: "4M" },
    { deskId: "4M126", initial: "ART", zone: "4M" },
  ];

  // ── 4N desks (brown) ───────────────────────────
  const n_left = [
    { deskId: "4N143", initial: "SDS", zone: "4N" },
    { deskId: "4N152", initial: "SDQ", zone: "4N" },
    { deskId: "4N142", initial: "SDAS", zone: "4N" },
    { deskId: "4N151", initial: "TSE", zone: "4N" },
    { deskId: "4N141", initial: "UPM", zone: "4N" },
    { deskId: "4N150", initial: "AQT", zone: "4N" },
    { deskId: "4N140", initial: "PDS", zone: "4N" },
    { deskId: "4N149", initial: "RAS", zone: "4N" },
    { deskId: "4N139", initial: "SDU", zone: "4N" },
    { deskId: "4N148", initial: "", zone: "4N" },
    { deskId: "4N138", initial: "NAFR", zone: "4N" },
    { deskId: "4N147", initial: "", zone: "4N" },
    { deskId: "4N137", initial: "AFQ", zone: "4N" },
    { deskId: "4N146", initial: "ANWE", zone: "4N" },
    { deskId: "4N136", initial: "LBBH", zone: "4N" },
    { deskId: "4N145", initial: "FARS", zone: "4N" },
    { deskId: "4N135", initial: "KZMN", zone: "4N" },
    { deskId: "4N144", initial: "HFN", zone: "4N" },
  ];

  const n_right = [
    { deskId: "4N161", initial: "AKJ", zone: "4N" },
    { deskId: "4N170", initial: "UTS", zone: "4N" },
    { deskId: "4N160", initial: "ZAZ", zone: "4N" },
    { deskId: "4N169", initial: "FFR", zone: "4N" },
    { deskId: "4N159", initial: "TAV", zone: "4N" },
    { deskId: "4N168", initial: "EHQ", zone: "4N" },
    { deskId: "4N158", initial: "MOM", zone: "4N" },
    { deskId: "4N167", initial: "HMH", zone: "4N" },
    { deskId: "4N157", initial: "SDL", zone: "4N" },
    { deskId: "4N166", initial: "", zone: "4N" },
    { deskId: "4N156", initial: "ZYH", zone: "4N" },
    { deskId: "4N165", initial: "SZZ", zone: "4N" },
    { deskId: "4N155", initial: "FZN", zone: "4N" },
    { deskId: "4N164", initial: "RFR", zone: "4N" },
    { deskId: "4N154", initial: "RSS", zone: "4N" },
    { deskId: "4N163", initial: "NLAM", zone: "4N" },
    { deskId: "4N153", initial: "AYO", zone: "4N" },
    { deskId: "4N162", initial: "MAO", zone: "4N" },
  ];

  // ── 4K desks (red) ─────────────────────────────
  const k_desks_left = [
    { deskId: "4K78", initial: "IBU", zone: "4K" },
    { deskId: "4K77", initial: "", zone: "4K" },
    { deskId: "4K79", initial: "ATY", zone: "4K" },
    { deskId: "4K76", initial: "SMYA", zone: "4K" },
    { deskId: "4K75", initial: "TNF", zone: "4K" },
    { deskId: "4K80", initial: "UJT", zone: "4K" },
    { deskId: "4K84", initial: "FBAW", zone: "4K" },
    { deskId: "4K85", initial: "MAU", zone: "4K" },
    { deskId: "4K81", initial: "FIC", zone: "4K" },
    { deskId: "4K83", initial: "TAP", zone: "4K" },
    { deskId: "4K82", initial: "SUE", zone: "4K" },
  ];

  const k_desks_right = [
    { deskId: "4K74", initial: "TNMF", zone: "4K" },
    { deskId: "4K73", initial: "LRK", zone: "4K" },
    { deskId: "4K72", initial: "ANKH", zone: "4K" },
    { deskId: "4K71", initial: "MAJU", zone: "4K" },
    { deskId: "4K86", initial: "KNI", zone: "4K" },
    { deskId: "4K70", initial: "STNM", zone: "4K" },
    { deskId: "4K69", initial: "RFTS", zone: "4K" },
  ];

  // ── 4L desks (purple) ─────────────────────────
  const l_desks = [
    { deskId: "4L89", initial: "YND", zone: "4L" },
    { deskId: "4L92", initial: "NAHC", zone: "4L" },
    { deskId: "4L95", initial: "MUNR", zone: "4L" },
    { deskId: "4L98", initial: "LT11", zone: "4L" },
    { deskId: "4L88", initial: "ALB", zone: "4L" },
    { deskId: "4L91", initial: "SHBK", zone: "4L" },
    { deskId: "4L94", initial: "RKN", zone: "4L" },
    { deskId: "4L97", initial: "", zone: "4L" },
    { deskId: "4L87", initial: "MZG", zone: "4L" },
    { deskId: "4L90", initial: "MNP", zone: "4L" },
    { deskId: "4L93", initial: "ADU", zone: "4L" },
    { deskId: "4L96", initial: "", zone: "4L" },
  ];

  // ── 4J desks (green) ─────────────────────────
  const j_desks_left = [
    { deskId: "4J60", initial: "RBR", zone: "4J" },
    { deskId: "4J59", initial: "AIB", zone: "4J" },
    { deskId: "4J61", initial: "ZMD", zone: "4J" },
    { deskId: "4J58", initial: "ANK", zone: "4J" },
    { deskId: "4J57", initial: "KKP", zone: "4J" },
    { deskId: "4J62", initial: "TMD", zone: "4J" },
    { deskId: "4J66", initial: "TSM", zone: "4J" },
    { deskId: "4J67", initial: "BDH", zone: "4J" },
    { deskId: "4J63", initial: "DPU", zone: "4J" },
    { deskId: "4J65", initial: "SZD", zone: "4J" },
    { deskId: "4J64", initial: "RRH", zone: "4J" },
  ];

  const j_desks_right = [
    { deskId: "4J55", initial: "SMUR", zone: "4J" },
    { deskId: "4J56", initial: "RDW", zone: "4J" },
    { deskId: "4J54", initial: "SBHN", zone: "4J" },
    { deskId: "4J53", initial: "SRU", zone: "4J" },
    { deskId: "4J52", initial: "MDF", zone: "4J" },
    { deskId: "4J68", initial: "ZHS", zone: "4J" },
    { deskId: "4J51", initial: "SADF", zone: "4J" },
  ];

  // ── 4P desks (tan) ────────────────────────────
  const p_desks = [
    { deskId: "4P194", initial: "NMMR", zone: "4P" },
    { deskId: "4P171", initial: "NKMA", zone: "4P" },
    { deskId: "4P172", initial: "", zone: "4P" },
    { deskId: "4P193", initial: "ASRF", zone: "4P" },
    { deskId: "4P192", initial: "NARC", zone: "4P" },
    { deskId: "4P173", initial: "", zone: "4P" },
    { deskId: "4P191", initial: "NRHB", zone: "4P" },
    { deskId: "4P174", initial: "SKIB", zone: "4P" },
    { deskId: "4P175", initial: "RKBR", zone: "4P" },
    { deskId: "4P184", initial: "", zone: "4P" },
    { deskId: "4P183", initial: "", zone: "4P" },
    { deskId: "4P189", initial: "NFMK", zone: "4P" },
    { deskId: "4P190", initial: "NRZR", zone: "4P" },
    { deskId: "4P185", initial: "", zone: "4P" },
    { deskId: "4P188", initial: "", zone: "4P" },
    { deskId: "4P187", initial: "", zone: "4P" },
    { deskId: "4P186", initial: "NNTN", zone: "4P" },
    { deskId: "4P194", initial: "NKBS", zone: "4P" },
    { deskId: "4P176", initial: "MAHS", zone: "4P" },
    { deskId: "4P177", initial: "NHBN", zone: "4P" },
    { deskId: "4P178", initial: "RAHA", zone: "4P" },
    { deskId: "4P179", initial: "WHMJ", zone: "4P" },
    { deskId: "4P180", initial: "MRIA", zone: "4P" },
    { deskId: "4P182", initial: "", zone: "4P" },
    { deskId: "4P181", initial: "", zone: "4P" },
  ];

  const p_south = [
    { deskId: "4P195", initial: "NAST", zone: "4P" },
    { deskId: "4P196", initial: "ITTSC", zone: "4P" },
    { deskId: "4P197", initial: "SADA", zone: "4P" },
    { deskId: "4P198", initial: "SOSB", zone: "4P" },
    { deskId: "4P199", initial: "UTKR", zone: "4P" },
  ];

  return (
    <svg
      viewBox="0 0 1400 920"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: "#1e1e2e" }}
    >
      <defs>
        <style>{`
          .desk-rect:hover {
            filter: brightness(1.3);
            transition: filter 0.2s;
          }
          .desk-group:hover .desk-rect {
            filter: brightness(1.3);
          }
          @keyframes pulse-ring {
            0% { opacity: 1; stroke-width: 3; }
            50% { opacity: 0.4; stroke-width: 5; }
            100% { opacity: 1; stroke-width: 3; }
          }
          .desk-pulse {
            animation: pulse-ring 1.5s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Floor background */}
      <rect x="0" y="0" width="1400" height="920" fill="#1e1e2e" rx="8" />

      {/* Title */}
      <text x="20" y="24" fill="#e2e8f0" fontSize="14" fontWeight="bold" fontFamily="Inter, sans-serif">
        DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
      </text>
      <text x="20" y="42" fill="#94a3b8" fontSize="10" fontFamily="Inter, sans-serif">
        DYNAMIC SEAT MAP — Summer 2026
      </text>

      {/* ═══ 4M Zone (Yellow) ═══ */}
      <ZoneBlock x={410} y={20} desks={m_left} cols={2} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <ZoneBlock x={530} y={20} desks={m_right} cols={2} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* ═══ 4N Zone (Brown) ═══ */}
      <ZoneBlock x={690} y={20} desks={n_left} cols={2} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <ZoneBlock x={830} y={20} desks={n_right} cols={2} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* ═══ 4K Zone (Red) ═══ */}
      <ZoneBlock x={14} y={210} desks={k_desks_left} cols={2} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <ZoneBlock x={180} y={210} desks={k_desks_right} cols={1} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* ═══ 4L Zone (Purple) ═══ */}
      <ZoneBlock x={260} y={210} desks={l_desks} cols={4} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* ═══ 4J Zone (Green) ═══ */}
      <ZoneBlock x={14} y={430} desks={j_desks_left} cols={2} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <ZoneBlock x={180} y={430} desks={j_desks_right} cols={1} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* ═══ 4P Zone (Tan) ═══ */}
      <ZoneBlock x={895} y={430} desks={p_desks} cols={5} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <ZoneBlock x={920} y={650} desks={p_south} cols={1} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* ═══ 4G Cabins (Grey) ═══ */}
      {/* Row 1: 4G01-4G06 */}
      <Cabin x={280} y={460} w={70} h={44} deskId="4G01" occupants={gCabins["4G01"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={280} y={416} w={70} h={44} deskId="4G02" occupants={gCabins["4G02"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={370} y={416} w={70} h={44} deskId="4G03" occupants={gCabins["4G03"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={370} y={460} w={70} h={44} deskId="4G04" occupants={gCabins["4G04"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={470} y={416} w={70} h={44} deskId="4G05" occupants={gCabins["4G05"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={470} y={460} w={70} h={44} deskId="4G06" occupants={gCabins["4G06"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* Main Conference Room */}
      <rect x={570} y={440} width={180} height={90} rx={6} fill="#2d2d3d" stroke="#4b5563" strokeWidth={1.5} />
      <text x={660} y={475} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight="bold" fontFamily="Inter, sans-serif">MAIN</text>
      <text x={660} y={490} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight="bold" fontFamily="Inter, sans-serif">CONFERENCE/MEETING</text>
      <text x={660} y={505} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight="bold" fontFamily="Inter, sans-serif">ROOM</text>

      {/* 4G13, 4G14 */}
      <Cabin x={780} y={416} w={70} h={44} deskId="4G13" occupants={gCabins["4G13"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={780} y={460} w={70} h={44} deskId="4G14" occupants={gCabins["4G14"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* Right column: 4G08-4G12 */}
      <Cabin x={990} y={36} w={70} h={44} deskId="4G08" occupants={gCabins["4G08"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={990} y={86} w={70} h={44} deskId="4G09" occupants={gCabins["4G09"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={990} y={136} w={70} h={44} deskId="4G10" occupants={gCabins["4G10"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={990} y={186} w={70} h={44} deskId="4G11" occupants={gCabins["4G11"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={990} y={236} w={70} h={44} deskId="4G12" occupants={gCabins["4G12"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* Right column: 4G22-4G25 */}
      <Cabin x={1080} y={36} w={70} h={44} deskId="4G25" occupants={gCabins["4G25"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={86} w={70} h={44} deskId="4G24" occupants={gCabins["4G24"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={136} w={70} h={44} deskId="4G23" occupants={gCabins["4G23"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={186} w={70} h={44} deskId="4G22" occupants={gCabins["4G22"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={236} w={70} h={44} deskId="4G21" occupants={gCabins["4G21"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* Far right column */}
      <Cabin x={1250} y={36} w={110} h={44} deskId="4G26" occupants={gCabins["4G26"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      {/* Praying Room */}
      <rect x={1250} y={86} width={110} height={44} rx={4} fill="#2d2d3d" stroke="#6b7280" strokeWidth={1} />
      <text x={1305} y={108} textAnchor="middle" fill="#94a3b8" fontSize={7} fontWeight="bold" fontFamily="Inter, sans-serif">PRAYING ROOM (M)</text>
      <Cabin x={1250} y={136} w={110} h={44} deskId="4G28" occupants={gCabins["4G28"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1250} y={186} w={110} h={44} deskId="4G29" occupants={gCabins["4G29"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1250} y={236} w={110} h={44} deskId="4G30" occupants={gCabins["4G30"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* Small Conference Room */}
      <rect x={1250} y={420} width={110} height={70} rx={4} fill="#2d2d3d" stroke="#6b7280" strokeWidth={1} />
      <text x={1305} y={450} textAnchor="middle" fill="#94a3b8" fontSize={7} fontWeight="bold" fontFamily="Inter, sans-serif">SMALL</text>
      <text x={1305} y={462} textAnchor="middle" fill="#94a3b8" fontSize={7} fontWeight="bold" fontFamily="Inter, sans-serif">CONFERENCE/MEETING</text>
      <text x={1305} y={474} textAnchor="middle" fill="#94a3b8" fontSize={7} fontWeight="bold" fontFamily="Inter, sans-serif">ROOM</text>

      {/* 4G31 label */}
      <Cabin x={1250} y={370} w={110} h={44} deskId="4G31" occupants={[]} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* SDS Dean & CSE Chair */}
      <Cabin x={1250} y={590} w={110} h={44} deskId="4G33" occupants={gCabins["4G33"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <text x={1305} y={608} textAnchor="middle" fill="#fbbf24" fontSize={6} fontFamily="Inter, sans-serif" style={{ pointerEvents: "none" }}>SDS DEAN</text>

      <Cabin x={1250} y={700} w={110} h={44} deskId="4G32" occupants={gCabins["4G32"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <text x={1305} y={718} textAnchor="middle" fill="#fbbf24" fontSize={6} fontFamily="Inter, sans-serif" style={{ pointerEvents: "none" }}>CSE CHAIRPERSON</text>

      {/* 4G15-4G20 south */}
      <Cabin x={780} y={630} w={70} h={44} deskId="4G15" occupants={gCabins["4G15"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={780} y={680} w={70} h={44} deskId="4G16" occupants={gCabins["4G16"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={780} y={730} w={70} h={44} deskId="4G17" occupants={gCabins["4G17"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={630} w={70} h={44} deskId="4G20" occupants={gCabins["4G20"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={700} w={70} h={44} deskId="4G19" occupants={gCabins["4G19"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />
      <Cabin x={1080} y={770} w={70} h={44} deskId="4G18" occupants={gCabins["4G18"] || []} selectedDeskId={selectedDeskId} onDeskClick={onDeskClick} />

      {/* School Reception Area */}
      <rect x={520} y={640} width={200} height={140} rx={8} fill="#2d2d3d" stroke="#4b5563" strokeWidth={1.5} />
      <text x={620} y={700} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="bold" fontFamily="Inter, sans-serif">SCHOOL</text>
      <text x={620} y={716} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="bold" fontFamily="Inter, sans-serif">RECEPTION AREA</text>

      {/* ENTRANCE */}
      <rect x={590} y={860} width={100} height={36} rx={6} fill="#3b82f6" stroke="#60a5fa" strokeWidth={2} />
      <text x={640} y={882} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="bold" fontFamily="Inter, sans-serif">ENTRANCE</text>

      {/* Zone labels */}
      <text x={500} y={14} fill="#eab30888" fontSize={20} fontWeight="bold" fontFamily="Inter, sans-serif">4M</text>
      <text x={760} y={14} fill="#92400e88" fontSize={20} fontWeight="bold" fontFamily="Inter, sans-serif">4N</text>
      <text x={60} y={202} fill="#dc262688" fontSize={20} fontWeight="bold" fontFamily="Inter, sans-serif">4K</text>
      <text x={330} y={202} fill="#9333ea88" fontSize={20} fontWeight="bold" fontFamily="Inter, sans-serif">4L</text>
      <text x={60} y={422} fill="#16a34a88" fontSize={20} fontWeight="bold" fontFamily="Inter, sans-serif">4J</text>
      <text x={980} y={422} fill="#d4a57488" fontSize={20} fontWeight="bold" fontFamily="Inter, sans-serif">4P</text>
    </svg>
  );
}
