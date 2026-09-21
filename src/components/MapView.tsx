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
  const [is3D, setIs3D] = useState(false);
  const [loggedCoords, setLoggedCoords] = useState<{ x: number; y: number } | null>(null);

  const [pathD, setPathD] = useState<string>("");
  const [shouldAnimatePath, setShouldAnimatePath] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Smoothly zoom in to the target desk
  const zoomToDesk = useCallback((deskId: string) => {
    if (transformRef.current) {
      // Zoom directly to the element ID (desk-ID)
      transformRef.current.zoomToElement(`desk-${deskId}`, 2.9, 850);
    }
  }, []);

  // Fired when the 2.3s hallway path drawing finishes
  const handlePathAnimationComplete = useCallback(() => {
    if (selectedDeskId) {
      zoomToDesk(selectedDeskId);
      // Reveal the compact modal after the zoom settling period (~850ms)
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

      // Halfway through path drawing (~1.2s), seamlessly tilt camera into 3D Isometric View
      setTimeout(() => {
        setIs3D(true);
      }, 1200);
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

  // Reset viewport zoom/pan, return to flat 2D, and clear faculty state
  const handleReset = useCallback(() => {
    setIs3D(false);
    setSelectedDeskId(null);
    setSelectedFaculty(null);
    setShowModal(false);
    setPathD("");
    setShouldAnimatePath(false);
    transformRef.current?.resetTransform(800);
    window.history.pushState(null, "", "/");
  }, []);

  // Handle desk click from SeatMap
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
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-8 py-3.5 flex-shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
            <img src="/logo.png" alt="BRACU CSE Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-base sm:text-lg tracking-tight leading-tight">
                Faculty Desk Finder
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-all duration-700 ${
                  is3D
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "bg-white/10 text-slate-400 border border-white/10"
                }`}
              >
                {is3D ? "3D Isometric" : "2D Map"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">BRACU CSE Department</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedDeskId && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Full Map (2D)</span>
            </button>
          )}

          {session?.user && (
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 text-xs hidden sm:block">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Floating Search Bar */}
      <div className="relative z-30 px-6 sm:px-8 py-3 flex-shrink-0">
        <SearchBar faculty={facultyData} onSelectFaculty={(item) => selectDesk(item.deskId, item.initial)} />
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 min-h-0 px-4 sm:px-6 pb-4 sm:pb-6 overflow-hidden flex items-center justify-center">
        <div className="w-full h-full border border-white/10 rounded-3xl overflow-hidden bg-slate-950/60 backdrop-blur-md relative shadow-2xl">
          {/* 3D Perspective Wrapper */}
          <div
            className="w-full h-full"
            style={{
              perspective: "1400px",
              perspectiveOrigin: "50% 50%",
            }}
          >
            {/* Dynamic Isometric Tilt Container */}
            <div
              className="w-full h-full transition-transform duration-1000 ease-out"
              style={{
                transformStyle: "preserve-3d",
                transform: is3D
                  ? "rotateX(26deg) rotateZ(-7deg)"
                  : "rotateX(0deg) rotateZ(0deg)",
              }}
            >
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
                    is3D={is3D}
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
        </div>
      </div>

      {/* Compact, Non-Blocking Faculty Details Modal */}
      <FacultyModal
        faculty={selectedFaculty}
        isOpen={showModal}
        onClose={handleReset}
      />

      {/* Dev Mode Coordinate Logger */}
      {loggedCoords && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900/95 border border-white/15 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl text-xs font-mono">
          <div>
            <span className="text-slate-400 mr-1.5">X:</span>{loggedCoords.x}
            <span className="text-slate-400 ml-2.5 mr-1.5">Y:</span>{loggedCoords.y}
          </div>
          <button
            onClick={() => setLoggedCoords(null)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Zone Legend */}
      <div className="fixed bottom-5 left-5 z-20 hidden md:flex flex-wrap gap-1.5 p-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl">
        {[
          { zone: "4K", color: "#dc2626", label: "4K" },
          { zone: "4J", color: "#16a34a", label: "4J" },
          { zone: "4L", color: "#9333ea", label: "4L" },
          { zone: "4M", color: "#eab308", label: "4M" },
          { zone: "4N", color: "#92400e", label: "4N" },
          { zone: "4P", color: "#d4a574", label: "4P" },
          { zone: "4G", color: "#6b7280", label: "4G" },
        ].map((z) => (
          <div key={z.zone} className="flex items-center gap-1 px-1.5 py-0.5 rounded">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: z.color }} />
            <span className="text-[10px] text-slate-400 font-medium">{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
