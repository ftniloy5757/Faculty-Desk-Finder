"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SeatMap from "./SeatMap";
import AnimatedPath from "./AnimatedPath";
import FacultyModal from "./FacultyModal";
import SearchBar from "./SearchBar";
import { getPathToDesk, getDeskCenter } from "@/lib/pathfinding";
import type { Point } from "@/lib/pathfinding";
import facultyData from "@/data/faculty.json";
import { signOut, useSession } from "next-auth/react";

interface MapViewProps {
  autoSelectDeskId?: string;
  autoSelectInitial?: string;
}

export default function MapView({
  autoSelectDeskId,
  autoSelectInitial,
}: MapViewProps) {
  const { data: session } = useSession();
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<
    (typeof facultyData)[0] | null
  >(null);
  const [pathPoints, setPathPoints] = useState<Point[]>([]);
  const [showPath, setShowPath] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomTarget, setZoomTarget] = useState({ x: 0, y: 0, scale: 1 });

  // Compute zoom transform to center a desk on screen
  // The viewBox is 4095×2487, the map uses object-contain so it
  // fills the container proportionally.
  const getZoomForDesk = useCallback((deskId: string) => {
    const center = getDeskCenter(deskId);
    if (!center) {
      return { x: 0, y: 0, scale: 1 };
    }
    const scale = 2.8;
    const xPct = center.x / 4095; // 0..1
    const yPct = center.y / 2487; // 0..1
    // Translate in % of element dimensions to center the desk
    const tx = (0.5 - xPct) * 100 * scale;
    const ty = (0.5 - yPct) * 100 * scale;
    return { x: tx, y: ty, scale };
  }, []);

  // Handle desk selection (from click or auto-select)
  const selectDesk = useCallback(
    (deskId: string, initial?: string) => {
      // Find the faculty member
      let faculty = facultyData.find(
        (f) =>
          f.deskId === deskId &&
          f.initial &&
          f.position !== "Room" &&
          (initial ? f.initial === initial : true)
      );

      if (!faculty) {
        faculty = facultyData.find(
          (f) => f.deskId === deskId && f.initial && f.position !== "Room"
        );
      }

      if (!faculty) return;

      setSelectedDeskId(deskId);
      setSelectedFaculty(faculty);

      // Calculate path
      const points = getPathToDesk(deskId, faculty.zone);
      setPathPoints(points);
      setShowPath(true);
      setShowModal(false);
      setIsZoomed(false);

      // Set zoom target for this desk
      setZoomTarget(getZoomForDesk(deskId));
    },
    [getZoomForDesk]
  );

  // Auto-select on mount if provided
  useEffect(() => {
    if (autoSelectDeskId) {
      const timer = setTimeout(() => {
        selectDesk(autoSelectDeskId, autoSelectInitial);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSelectDeskId, autoSelectInitial, selectDesk]);

  // When path animation completes → zoom in → then show modal
  const handlePathComplete = useCallback(() => {
    setIsZoomed(true);
    // After zoom animation completes (~800ms spring), show modal
    setTimeout(() => {
      setShowModal(true);
    }, 900);
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    setSelectedDeskId(null);
    setSelectedFaculty(null);
    setShowPath(false);
    setShowModal(false);
    setIsZoomed(false);
    setZoomTarget({ x: 0, y: 0, scale: 1 });
  }, []);

  // Handle desk click from map
  const handleDeskClick = useCallback(
    (deskId: string) => {
      if (selectedDeskId) {
        handleReset();
        setTimeout(() => selectDesk(deskId), 300);
      } else {
        selectDesk(deskId);
      }
    },
    [selectedDeskId, handleReset, selectDesk]
  );

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-8 py-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
            <img src="/logo.png" alt="BRACU CSE Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-tight">
              Faculty Desk Finder
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">BRACU CSE Department</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {selectedDeskId && (
            <button
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all"
            >
              ← Full Map
            </button>
          )}
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs hidden sm:block">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search bar */}
      <div className="relative z-30 px-6 sm:px-8 pb-4 flex-shrink-0">
        <SearchBar faculty={facultyData} />
      </div>

      {/* Map container — fills remaining viewport, no scroll.
          The SVG inside uses preserveAspectRatio="xMidYMid meet" so it
          will always show the FULL map without cropping or stretching. */}
      <div className="relative flex-1 min-h-0 px-4 sm:px-6 pb-4 overflow-hidden flex items-center justify-center">
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          animate={
            isZoomed
              ? {
                  scale: zoomTarget.scale,
                  x: `${zoomTarget.x}%`,
                  y: `${zoomTarget.y}%`,
                }
              : { scale: 1, x: "0%", y: "0%" }
          }
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 200,
            duration: 0.8,
          }}
          style={{ transformOrigin: "center center" }}
        >
          {/* The SVG map with image background */}
          <SeatMap
            desks={facultyData}
            selectedDeskId={selectedDeskId}
            onDeskClick={handleDeskClick}
          />

          {/* Animated path overlay */}
          <AnimatePresence>
            {showPath && pathPoints.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <AnimatedPath
                  points={pathPoints}
                  onComplete={handlePathComplete}
                  duration={2}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Faculty modal — floating bottom-right, NO blur backdrop */}
      <FacultyModal
        faculty={selectedFaculty}
        isOpen={showModal}
        onClose={handleReset}
      />

      {/* Zone legend */}
      <div className="fixed bottom-6 left-6 z-20 flex flex-wrap gap-2 p-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl">
        {[
          { zone: "4K", color: "#dc2626", label: "4K" },
          { zone: "4J", color: "#16a34a", label: "4J" },
          { zone: "4L", color: "#9333ea", label: "4L" },
          { zone: "4M", color: "#eab308", label: "4M" },
          { zone: "4N", color: "#92400e", label: "4N" },
          { zone: "4P", color: "#d4a574", label: "4P" },
          { zone: "4G", color: "#6b7280", label: "4G" },
        ].map((z) => (
          <div
            key={z.zone}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
          >
            <div
              className="w-3.5 h-3.5 rounded-sm"
              style={{ background: z.color }}
            />
            <span className="text-[11px] text-slate-400 font-medium">
              {z.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
