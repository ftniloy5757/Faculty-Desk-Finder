"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import SeatMap from "./SeatMap";
import FacultyModal from "./FacultyModal";
import SearchBar from "./SearchBar";
import facultyData from "@/data/faculty.json";
import { signOut, useSession } from "next-auth/react";
import { getDeskCenter } from "@/data/deskOverlays";

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

  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Zoom to a specific desk's SVG element coordinates using react-zoom-pan-pinch zoomToElement
  const zoomToDesk = useCallback((deskId: string) => {
    if (transformRef.current) {
      // Zoom directly to the element ID (desk-ID)
      // The element must be rendered inside TransformComponent
      // Scaling: 3.2, Duration: 800ms
      transformRef.current.zoomToElement(`desk-${deskId}`, 3.2, 800);
    }
  }, []);

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

      setSelectedDeskId(deskId);
      setSelectedFaculty(faculty);
      setShowModal(false);

      // Update browser URL history without causing layout/route refresh glitches
      window.history.pushState(null, "", `/desk/${deskId}?initial=${faculty.initial}`);

      // Smoothly pan & zoom to the selected desk, then slide in the modal
      setTimeout(() => {
        zoomToDesk(deskId);
        setTimeout(() => {
          setShowModal(true);
        }, 900);
      }, 100);
    },
    [zoomToDesk]
  );

  // Auto-select on mount if provided (e.g. from deep link)
  useEffect(() => {
    if (autoSelectDeskId) {
      const timer = setTimeout(() => {
        selectDesk(autoSelectDeskId, autoSelectInitial);
      }, 800); // 800ms delay to let the map component settle in DOM
      return () => clearTimeout(timer);
    }
  }, [autoSelectDeskId, autoSelectInitial, selectDesk]);

  // Reset viewport zoom/pan and clear faculty state
  const handleReset = useCallback(() => {
    setSelectedDeskId(null);
    setSelectedFaculty(null);
    setShowModal(false);
    transformRef.current?.resetTransform(800);
    // Reset browser URL to base path
    window.history.pushState(null, "", "/");
  }, []);

  // Handle desk click from SeatMap
  const handleDeskClick = useCallback(
    (deskId: string) => {
      if (selectedDeskId === deskId) {
        // Toggle off if clicking the same desk
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
              className="px-5 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer"
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
                className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Floating Search bar container */}
      <div className="relative z-30 px-6 sm:px-8 pb-4 flex-shrink-0">
        <SearchBar faculty={facultyData} onSelectFaculty={(item) => selectDesk(item.deskId, item.initial)} />
      </div>

      {/* Main Map Viewer — Fits perfectly inside the remaining viewport without screen scrolls */}
      <div className="relative flex-1 min-h-0 px-6 pb-6 overflow-hidden flex items-center justify-center">
        <div className="w-full h-full border border-white/10 rounded-3xl overflow-hidden bg-slate-950/50 backdrop-blur-md relative shadow-2xl">
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.8}
            maxScale={8}
            centerOnInit={true}
            limitToBounds={true}
            doubleClick={{ disabled: false }}
            panning={{ velocityDisabled: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <SeatMap
                desks={facultyData}
                selectedDeskId={selectedDeskId}
                onDeskClick={handleDeskClick}
                onMapClick={handleMapClick}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* Fixed details side panel card (Z-50, sits outside zoom component, prevents distortion) */}
      <FacultyModal
        faculty={selectedFaculty}
        isOpen={showModal}
        onClose={handleReset}
      />

      {/* Dev Mode Coordinate Logger Indicator */}
      {loggedCoords && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-slate-900/95 border border-white/15 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl">
          <div className="text-xs font-mono">
            <div className="text-[10px] text-indigo-400 font-sans font-bold uppercase tracking-wider mb-0.5">Dev Mode Click Coordinates</div>
            <span className="text-slate-400 mr-2">x:</span>{loggedCoords.x}
            <span className="text-slate-400 ml-3 mr-2">y:</span>{loggedCoords.y}
          </div>
          <button
            onClick={() => setLoggedCoords(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Zone legend */}
      <div className="fixed bottom-6 left-6 z-20 flex flex-wrap gap-2 p-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl max-w-[calc(100%-3rem)] sm:max-w-xs">
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
            className="flex items-center gap-1.5 px-2 py-1 rounded-md"
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
