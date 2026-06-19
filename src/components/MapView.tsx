"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SeatMap from "./SeatMap";
import AnimatedPath from "./AnimatedPath";
import FacultyModal from "./FacultyModal";
import SearchBar from "./SearchBar";
import { getPathToDesk } from "@/lib/pathfinding";
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

  // Get the zoom transform for a zone
  const getZoomForZone = useCallback((zone: string) => {
    const zoomTargets: Record<string, { x: number; y: number; scale: number }> = {
      "4K": { x: -50, y: -350, scale: 2.2 },
      "4J": { x: -50, y: -700, scale: 2.2 },
      "4L": { x: -500, y: -350, scale: 2.5 },
      "4M": { x: -650, y: 0, scale: 2 },
      "4N": { x: -1100, y: 0, scale: 2 },
      "4P": { x: -1400, y: -650, scale: 2.2 },
      "4G": { x: -400, y: -550, scale: 2 },
    };
    return zoomTargets[zone] || { x: 0, y: 0, scale: 1 };
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

      // Set zoom target for this zone
      setZoomTarget(getZoomForZone(faculty.zone));
    },
    [getZoomForZone]
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

  // When path animation completes → zoom in
  const handlePathComplete = useCallback(() => {
    setIsZoomed(true);
    // After zoom animation → show modal
    setTimeout(() => {
      setShowModal(true);
    }, 800);
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
      // If already showing something, reset first
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-tight">
              Faculty Desk Finder
            </h1>
            <p className="text-slate-500 text-xs">BRACU CSE Department</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedDeskId && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all"
            >
              ← Full Map
            </button>
          )}
          {session?.user && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs hidden sm:block">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search bar */}
      <div className="relative z-30 px-4 sm:px-6 pb-4">
        <SearchBar faculty={facultyData} />
      </div>

      {/* Map container with zoom */}
      <div className="relative flex-1 px-2 sm:px-4 pb-4 overflow-hidden">
        <motion.div
          className="relative w-full"
          animate={
            isZoomed
              ? {
                  scale: zoomTarget.scale,
                  x: zoomTarget.x,
                  y: zoomTarget.y,
                }
              : { scale: 1, x: 0, y: 0 }
          }
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 200,
            duration: 0.8,
          }}
          style={{ transformOrigin: "top left" }}
        >
          {/* The SVG map */}
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

      {/* Faculty modal */}
      <FacultyModal
        faculty={selectedFaculty}
        isOpen={showModal}
        onClose={handleReset}
      />

      {/* Zone legend */}
      <div className="fixed bottom-4 left-4 z-20 flex flex-wrap gap-1.5 p-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl">
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
            className="flex items-center gap-1 px-2 py-1 rounded-md"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: z.color }}
            />
            <span className="text-[10px] text-slate-400 font-medium">
              {z.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
