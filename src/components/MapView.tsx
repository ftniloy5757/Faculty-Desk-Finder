"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import SeatMap from "./SeatMap";
import FacultyModal from "./FacultyModal";
import SearchBar from "./SearchBar";
import facultyData from "@/data/facultyData.json";
import waypointsData from "@/data/waypoints.json";
import { calculateOrthogonalPath } from "@/lib/pathfinding";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

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
  const [showModal, setShowModal] = useState(false);
  const [loggedCoords, setLoggedCoords] = useState<{ x: number; y: number } | null>(null);

  const [pathD, setPathD] = useState<string>("");
  const [shouldAnimatePath, setShouldAnimatePath] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Smoothly zoom in to the target desk
  const zoomToDesk = useCallback((deskId: string) => {
    if (transformRef.current) {
      transformRef.current.zoomToElement(`desk-${deskId}`, 2.8, 850);
    }
  }, []);

  // Fired when the 2.3s hallway path drawing finishes
  const handlePathAnimationComplete = useCallback(() => {
    if (selectedDeskId) {
      zoomToDesk(selectedDeskId);
      setTimeout(() => {
        setShowModal(true);
      }, 850);
    }
  }, [selectedDeskId, zoomToDesk]);

  // Handle desk selection (from click or search)
  const selectDesk = useCallback(
    (deskId: string, initial?: string) => {
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

      // Reset state for new navigation sequence
      setShouldAnimatePath(false);
      setShowModal(false);
      setSelectedDeskId(deskId);
      setSelectedFaculty(faculty);

      // Update browser URL history without reload
      window.history.pushState(null, "", `/desk/${deskId}?initial=${faculty.initial}`);

      // Scale percentage coordinates to pixels (viewBox 4095x2487)
      const pixelWaypoints = waypointsData.map((w) => ({
        ...w,
        x: (w.x * 4095) / 100,
        y: (w.y * 2487) / 100,
      }));
      const desksList = facultyData.map((f) => ({
        deskId: f.deskId,
        x: (f.x * 4095) / 100,
        y: (f.y * 2487) / 100,
      }));

      // Calculate strictly routed orthogonal hallway path
      const path = calculateOrthogonalPath("ENTRANCE", deskId, pixelWaypoints, desksList);
      setPathD(path);

      // Trigger line drawing animation after brief DOM register
      setTimeout(() => {
        setShouldAnimatePath(true);
      }, 60);
    },
    []
  );

  // Auto-select on mount if provided (e.g. from deep link)
  useEffect(() => {
    if (autoSelectDeskId) {
      const timer = setTimeout(() => {
        selectDesk(autoSelectDeskId, autoSelectInitial);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoSelectDeskId, autoSelectInitial, selectDesk]);

  // Reset viewport zoom/pan and clear faculty state
  const handleReset = useCallback(() => {
    setSelectedDeskId(null);
    setSelectedFaculty(null);
    setShowModal(false);
    setPathD("");
    setShouldAnimatePath(false);

    if (transformRef.current) {
      transformRef.current.resetTransform(900, "easeInOutCubic");
    }
  }, []);

  const handleDeskClick = useCallback(
    (deskId: string) => {
      if (selectedDeskId === deskId) {
        handleReset();
      } else {
        selectDesk(deskId);
      }
    },
    [selectedDeskId, selectDesk, handleReset]
  );

  // Log clicked coordinates in Dev Mode (bubbled from SeatMap)
  const handleMapClick = useCallback((x: number, y: number) => {
    setLoggedCoords({ x, y });
    console.log(`Dev Mode - Clicked Coordinates: x=${x}, y=${y}`);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#060b18] flex flex-col">
      {/* Symmetrical Executive Navigation Header */}
      <header className="relative z-30 px-6 py-3 sm:py-3.5 flex-shrink-0 border-b border-slate-800/90 bg-[#080e22]/95 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 max-w-[1920px] mx-auto">
          {/* Left Column: Branding */}
          <div className="flex items-center gap-3.5 flex-shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden border border-slate-700/50 flex-shrink-0">
                <Image src="/logo.png" alt="BRACU CSE Logo" width={40} height={40} className="w-full h-full object-contain p-1" priority />
              </div>
              <div>
                <h1 className="text-white font-bold text-base sm:text-lg tracking-tight leading-tight">
                  Faculty Desk Finder
                </h1>
                <p className="text-slate-400 text-xs font-medium">Department of Computer Science & Engineering</p>
              </div>
            </div>

            {/* Mobile-only Reset button */}
            {selectedDeskId && (
              <button
                onClick={handleReset}
                className="md:hidden px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 border border-blue-500/40 rounded-lg transition-all shadow-sm"
              >
                ← Full Map
              </button>
            )}
          </div>

          {/* Center Column: Perfectly Symmetrical Search Bar */}
          <div className="w-full md:flex-1 md:max-w-md lg:max-w-lg xl:max-w-xl">
            <SearchBar faculty={facultyData} onSelectFaculty={(item) => selectDesk(item.deskId, item.initial)} />
          </div>

          {/* Right Column: Controls & Profile */}
          <div className="hidden md:flex items-center justify-end gap-3 flex-shrink-0 min-w-[200px]">
            {selectedDeskId && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 border border-blue-500/40 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Full Map</span>
              </button>
            )}

            {session?.user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0">
                    {session.user.email ? session.user.email[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-slate-300 text-xs font-mono font-medium max-w-[150px] truncate">
                    {session.user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Sign out of your session"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Map Canvas Area with Symmetrical Borders */}
      <div className="relative flex-1 min-h-0 px-4 sm:px-6 pt-3 pb-4 sm:pb-6 overflow-hidden flex items-center justify-center">
        <div className="w-full h-full border border-slate-800/90 rounded-2xl overflow-hidden bg-[#060b18] relative shadow-2xl">
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.8}
            maxScale={8}
            centerOnInit={true}
            limitToBounds={false}
            doubleClick={{ disabled: false }}
            panning={{ velocityDisabled: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SeatMap
                desks={facultyData}
                selectedDeskId={selectedDeskId}
                onDeskClick={handleDeskClick}
                onMapClick={handleMapClick}
                pathD={pathD}
                shouldAnimatePath={shouldAnimatePath}
                onPathAnimationComplete={handlePathAnimationComplete}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* Symmetrical Non-Blocking Faculty Details Modal */}
      <FacultyModal
        faculty={selectedFaculty}
        isOpen={showModal}
        onClose={handleReset}
      />

      {/* Developer Courtesy Notice - Exact Bottom Center */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <div className="px-4 py-1.5 rounded-full bg-[#080e22]/95 backdrop-blur-md border border-slate-700/80 shadow-xl flex items-center gap-2 text-xs font-medium text-slate-300">
          <span>© 2026 - Farhan T. Niloy</span>
        </div>
      </div>

      {/* Symmetrical Floating Zone Legend - Bottom Left */}
      <div className="fixed bottom-4 left-16 z-20 hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-[#080e22]/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">Zones:</span>
        {[
          { zone: "4K", color: "#ef4444", label: "4K" },
          { zone: "4J", color: "#22c55e", label: "4J" },
          { zone: "4L", color: "#a855f7", label: "4L" },
          { zone: "4M", color: "#facc15", label: "4M" },
          { zone: "4N", color: "#b45309", label: "4N" },
          { zone: "4P", color: "#e2b17a", label: "4P" },
          { zone: "4G", color: "#64748b", label: "4G Offices" },
        ].map((z) => (
          <div key={z.zone} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: z.color }} />
            <span className="text-xs text-slate-200 font-semibold">{z.label}</span>
          </div>
        ))}
      </div>

      {/* Dev Mode Coordinate Logger */}
      {loggedCoords && (
        <div className="fixed bottom-14 left-6 z-50 bg-[#080e22]/95 border border-slate-800 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl text-xs font-mono">
          <div>
            <span className="text-slate-400 mr-1.5">X:</span>{loggedCoords.x}
            <span className="text-slate-400 ml-2.5 mr-1.5">Y:</span>{loggedCoords.y}
          </div>
          <button
            onClick={() => setLoggedCoords(null)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
