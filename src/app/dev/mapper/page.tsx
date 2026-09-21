"use client";

import React, { useState, useEffect, useRef } from "react";
import facultyData from "@/data/facultyData.json";
import initialWaypoints from "@/data/waypoints.json";
import initialFacultyData from "@/data/facultyData.json";
import { Trash2, Link as LinkIcon, Download, Upload, RefreshCw, Plus, X, Sun, Moon, Image as ImageIcon } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface Waypoint extends Point {
  id: string;
  neighbors: string[];
}

interface DeskNode extends Point {
  deskId: string;
}

export default function DeveloperMapper() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // View preferences
  const [usePng, setUsePng] = useState(true);
  const [lightBg, setLightBg] = useState(true);

  // Coordinate mapping state
  const [clickCoord, setClickCoord] = useState<Point | null>(null);
  
  const [desks, setDesks] = useState<DeskNode[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dev-mapper-desks");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved desks", e);
        }
      }
    }
    const seen = new Set<string>();
    const unique: DeskNode[] = [];
    for (const f of initialFacultyData) {
      if (f.x !== undefined && f.y !== undefined && !seen.has(f.deskId)) {
        seen.add(f.deskId);
        unique.push({ deskId: f.deskId, x: f.x, y: f.y });
      }
    }
    return unique;
  });
  
  const [waypoints, setWaypoints] = useState<Waypoint[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dev-mapper-waypoints");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved waypoints", e);
        }
      }
    }
    return initialWaypoints;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<"desk" | "waypoint" | null>(null);
  
  // Inputs
  const [customDeskId, setCustomDeskId] = useState("");
  const [waypointIdInput, setWaypointIdInput] = useState("ENTRANCE");
  const [importDesksText, setImportDesksText] = useState(() => {
    const seen = new Set<string>();
    const unique: DeskNode[] = [];
    for (const f of initialFacultyData) {
      if (f.x !== undefined && f.y !== undefined && !seen.has(f.deskId)) {
        seen.add(f.deskId);
        unique.push({ deskId: f.deskId, x: f.x, y: f.y });
      }
    }
    return JSON.stringify(unique, null, 2);
  });
  const [importWaypointsText, setImportWaypointsText] = useState(() => JSON.stringify(initialWaypoints, null, 2));
  const [showImportExport, setShowImportExport] = useState(false);
  
  // Get all unique desk IDs from existing facultyData.json to assist selection
  const availableDeskIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const f of facultyData) {
      if (f.deskId) ids.add(f.deskId);
    }
    // Filter out already mapped desks
    const mapped = new Set(desks.map((d) => d.deskId));
    return Array.from(ids).filter((id) => !mapped.has(id)).sort();
  }, [desks]);

  // Save desks to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined" && desks.length > 0) {
      localStorage.setItem("dev-mapper-desks", JSON.stringify(desks));
    }
  }, [desks]);

  // Save waypoints to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined" && waypoints.length > 0) {
      localStorage.setItem("dev-mapper-waypoints", JSON.stringify(waypoints));
    }
  }, [waypoints]);

  // Click on the SVG using Screen CTM for perfect mathematical coordinate translation
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    
    // Ignore clicks on marker buttons inside the SVG to avoid clearing active click coordinates
    const target = e.target as SVGElement;
    if (target.closest(".svg-marker-btn")) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const svgPoint = point.matrixTransform(ctm.inverse());
      
      // Translate SVG pixels to percentages (relative to 4095 x 2487 space)
      const pctX = parseFloat(((svgPoint.x / 4095) * 100).toFixed(2));
      const pctY = parseFloat(((svgPoint.y / 2487) * 100).toFixed(2));
      
      // Clamp values between 0 and 100
      const clampedX = Math.max(0, Math.min(100, pctX));
      const clampedY = Math.max(0, Math.min(100, pctY));

      setClickCoord({ x: clampedX, y: clampedY });
    }
  };

  // Add a desk node
  const handleAddDesk = () => {
    if (!clickCoord) {
      alert("Click on the map first to select a coordinate.");
      return;
    }
    const deskId = customDeskId.trim().toUpperCase();
    if (!deskId) {
      alert("Please enter or select a Desk ID.");
      return;
    }
    if (desks.some((d) => d.deskId === deskId)) {
      if (!confirm(`Desk ${deskId} already exists. Overwrite?`)) return;
      setDesks(desks.map((d) => d.deskId === deskId ? { deskId, ...clickCoord } : d));
    } else {
      setDesks([...desks, { deskId, ...clickCoord }]);
    }
    
    // Auto-advance selection
    setClickCoord(null);
    const nextIdx = availableDeskIds.indexOf(customDeskId) + 1;
    if (nextIdx < availableDeskIds.length) {
      setCustomDeskId(availableDeskIds[nextIdx]);
    }
  };

  // Add a waypoint
  const handleAddWaypoint = () => {
    if (!clickCoord) {
      alert("Click on the map first to select a coordinate.");
      return;
    }
    const id = waypointIdInput.trim();
    if (!id) {
      alert("Please enter a Waypoint ID.");
      return;
    }
    if (waypoints.some((w) => w.id === id)) {
      alert(`Waypoint ${id} already exists.`);
      return;
    }
    
    const newWaypoint: Waypoint = {
      id,
      ...clickCoord,
      neighbors: []
    };
    
    setWaypoints([...waypoints, newWaypoint]);
    setClickCoord(null);
  };

  // Select node
  const selectNode = (id: string, type: "desk" | "waypoint") => {
    if (selectedNodeId === id && selectedNodeType === type) {
      setSelectedNodeId(null);
      setSelectedNodeType(null);
    } else {
      setSelectedNodeId(id);
      setSelectedNodeType(type);
    }
  };

  // Toggle connection between selected waypoint and another waypoint
  const toggleConnection = (targetId: string) => {
    if (!selectedNodeId || selectedNodeType !== "waypoint") return;
    if (selectedNodeId === targetId) return;

    setWaypoints(waypoints.map(w => {
      if (w.id === selectedNodeId) {
        const neighbors = w.neighbors.includes(targetId)
          ? w.neighbors.filter(n => n !== targetId)
          : [...w.neighbors, targetId];
        return { ...w, neighbors };
      }
      if (w.id === targetId) {
        const neighbors = w.neighbors.includes(selectedNodeId)
          ? w.neighbors.filter(n => n !== selectedNodeId)
          : [...w.neighbors, selectedNodeId];
        return { ...w, neighbors };
      }
      return w;
    }));
  };

  // Delete selected node
  const handleDeleteSelected = () => {
    if (!selectedNodeId || !selectedNodeType) return;

    if (selectedNodeType === "desk") {
      setDesks(desks.filter(d => d.deskId !== selectedNodeId));
    } else {
      // Remove waypoint and filter it from all neighbors
      setWaypoints(waypoints
        .filter(w => w.id !== selectedNodeId)
        .map(w => ({
          ...w,
          neighbors: w.neighbors.filter(n => n !== selectedNodeId)
        }))
      );
    }
    setSelectedNodeId(null);
    setSelectedNodeType(null);
  };

  // Export JSON logs
  const handleExport = () => {
    console.log("=== DESKS COORDINATES JSON ===");
    console.log(JSON.stringify(desks, null, 2));
    console.log("=== WAYPOINTS GRAPH JSON ===");
    console.log(JSON.stringify(waypoints, null, 2));
    
    setImportDesksText(JSON.stringify(desks, null, 2));
    setImportWaypointsText(JSON.stringify(waypoints, null, 2));
    alert("Data exported to console and text areas in the slide-out panel.");
  };

  // Import JSON
  const handleImport = () => {
    try {
      if (importDesksText.trim()) {
        const parsedDesks = JSON.parse(importDesksText);
        if (Array.isArray(parsedDesks)) {
          setDesks(parsedDesks);
        } else {
          alert("Desks JSON must be an array.");
          return;
        }
      }
      if (importWaypointsText.trim()) {
        const parsedWaypoints = JSON.parse(importWaypointsText);
        if (Array.isArray(parsedWaypoints)) {
          setWaypoints(parsedWaypoints);
        } else {
          alert("Waypoints JSON must be an array.");
          return;
        }
      }
      alert("Data successfully imported!");
      setShowImportExport(false);
    } catch (e: unknown) {
      alert("Error parsing JSON: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex overflow-hidden font-sans select-none">
      {/* Map display area */}
      <div className="flex-1 h-full flex items-center justify-center p-6 relative overflow-hidden bg-slate-900">
        <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 4095 2487"
            onClick={handleSvgClick}
            preserveAspectRatio="xMidYMid meet"
            className={`w-full h-full max-w-full max-h-full shadow-2xl rounded-2xl border border-slate-700/50 transition-colors duration-200 cursor-crosshair ${
              lightBg ? "bg-white" : "bg-slate-950"
            }`}
          >
            {/* Background map image */}
            <image
              href={usePng ? "/map.png" : "/map.jpg"}
              x="0"
              y="0"
              width="4095"
              height="2487"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* SVG Overlay for Connections */}
            {waypoints.map((w) => 
              w.neighbors.map((neighborId) => {
                const neighbor = waypoints.find(n => n.id === neighborId);
                if (!neighbor) return null;
                // Avoid double drawing lines
                if (w.id > neighbor.id) return null;
                return (
                  <line
                    key={`${w.id}-${neighbor.id}`}
                    x1={(w.x * 4095) / 100}
                    y1={(w.y * 2487) / 100}
                    x2={(neighbor.x * 4095) / 100}
                    y2={(neighbor.y * 2487) / 100}
                    stroke="#059669"
                    strokeWidth="10"
                    strokeOpacity="0.85"
                  />
                );
              })
            )}
            
            {/* Draw temporary line from selected waypoint to click position */}
            {selectedNodeType === "waypoint" && clickCoord && (
              (() => {
                const selNode = waypoints.find(w => w.id === selectedNodeId);
                if (!selNode) return null;
                return (
                  <line
                    x1={(selNode.x * 4095) / 100}
                    y1={(selNode.y * 2487) / 100}
                    x2={(clickCoord.x * 4095) / 100}
                    y2={(clickCoord.y * 2487) / 100}
                    stroke="#2563eb"
                    strokeWidth="8"
                    strokeDasharray="15,15"
                  />
                );
              })()
            )}

            {/* Render Clicked Temp Coordinate */}
            {clickCoord && (
              <g>
                <circle
                  cx={(clickCoord.x * 4095) / 100}
                  cy={(clickCoord.y * 2487) / 100}
                  r="30"
                  fill="#eab308"
                  stroke="#ffffff"
                  strokeWidth="8"
                  className="animate-pulse"
                />
                <circle
                  cx={(clickCoord.x * 4095) / 100}
                  cy={(clickCoord.y * 2487) / 100}
                  r="10"
                  fill="#000000"
                />
              </g>
            )}

            {/* Render Waypoints */}
            {waypoints.map((w) => {
              const isSelected = selectedNodeId === w.id && selectedNodeType === "waypoint";
              return (
                <g
                  key={w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedNodeType === "waypoint" && selectedNodeId !== w.id) {
                      toggleConnection(w.id);
                    } else {
                      selectNode(w.id, "waypoint");
                    }
                  }}
                  className="svg-marker-btn cursor-pointer group"
                >
                  <circle
                    cx={(w.x * 4095) / 100}
                    cy={(w.y * 2487) / 100}
                    r={isSelected ? "45" : "32"}
                    fill={isSelected ? "#2563eb" : w.id === "ENTRANCE" ? "#059669" : "#10b981"}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "12" : "6"}
                    className="transition-all hover:scale-110 shadow-lg"
                  />
                  <text
                    x={(w.x * 4095) / 100}
                    y={(w.y * 2487) / 100 + 10}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="24"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {w.id === "ENTRANCE" ? "ENT" : w.id}
                  </text>
                </g>
              );
            })}

            {/* Render Desks */}
            {desks.map((d) => {
              const isSelected = selectedNodeId === d.deskId && selectedNodeType === "desk";
              return (
                <g
                  key={d.deskId}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(d.deskId, "desk");
                  }}
                  className="svg-marker-btn cursor-pointer group"
                >
                  <circle
                    cx={(d.x * 4095) / 100}
                    cy={(d.y * 2487) / 100}
                    r={isSelected ? "45" : "32"}
                    fill={isSelected ? "#4f46e5" : "#ef4444"}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "12" : "6"}
                    className="transition-all hover:scale-110 shadow-lg"
                  />
                  <text
                    x={(d.x * 4095) / 100}
                    y={(d.y * 2487) / 100 + 8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="18"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {d.deskId.replace("4", "")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Control panel sidebar */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl relative z-30">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-white">Dev Coordinate Mapper</h2>
            <p className="text-slate-400 text-xs mt-0.5">Calibrate floor plans</p>
          </div>
          <button
            onClick={() => setShowImportExport(!showImportExport)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Import/Export Panel"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* View Controls */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Map Preferences</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLightBg(!lightBg)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-colors cursor-pointer"
              title={lightBg ? "Toggle Dark Mode background" : "Toggle Light Mode background"}
            >
              {lightBg ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setUsePng(!usePng)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Toggle PNG vs JPG map image"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{usePng ? "PNG" : "JPG"}</span>
            </button>
          </div>
        </div>

        {/* Selected Coordinates Readout */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/30">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Active Target Point
          </h3>
          {clickCoord ? (
            <div className="grid grid-cols-2 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-sm text-indigo-300">
              <div>
                <span className="text-slate-500 text-xs block mb-0.5">X (Left)</span>
                {clickCoord.x}%
              </div>
              <div>
                <span className="text-slate-500 text-xs block mb-0.5">Y (Top)</span>
                {clickCoord.y}%
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-3 text-center border border-dashed border-slate-800 rounded-xl">
              Click anywhere on the map image to select a location coordinate
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Desk Node Logger */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              1. Log Desk Node
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <select
                  value={customDeskId}
                  onChange={(e) => setCustomDeskId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {availableDeskIds.map((id) => (
                    <option key={id} value={id}>
                      {id} (Available)
                    </option>
                  ))}
                  {desks.map(d => (
                    <option key={d.deskId} value={d.deskId}>
                      {d.deskId} (Mapped)
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or type ID"
                  value={customDeskId}
                  onChange={(e) => setCustomDeskId(e.target.value.toUpperCase())}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                disabled={!clickCoord}
                onClick={handleAddDesk}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 disabled:text-slate-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg"
              >
                <Plus className="w-4 h-4" /> Save Desk Location
              </button>
            </div>
          </div>

          {/* Waypoint Logger */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              2. Log Hallway Waypoint
            </h4>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Waypoint ID (e.g. ENTRANCE, W1)"
                value={waypointIdInput}
                onChange={(e) => setWaypointIdInput(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                disabled={!clickCoord}
                onClick={handleAddWaypoint}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/40 disabled:text-slate-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg"
              >
                <Plus className="w-4 h-4" /> Save Waypoint Node
              </button>
            </div>
          </div>

          {/* Node Selection Stats & Linking instructions */}
          {selectedNodeId && (
            <div className="p-4 border border-slate-800 bg-slate-950/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Selected Node</span>
                  <div className="font-mono font-bold text-white text-base">
                    {selectedNodeId} ({selectedNodeType})
                  </div>
                </div>
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-300 rounded-lg transition-colors cursor-pointer"
                  title="Delete Selected Node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {selectedNodeType === "waypoint" && (
                <div className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <LinkIcon className="w-3.5 h-3.5" /> Waypoint Linker Mode
                  </div>
                  <div>
                    Click another waypoint dot on the map to toggle a bi-directional connection.
                  </div>
                  <div className="mt-1 max-h-20 overflow-y-auto font-mono text-[10px] text-indigo-300">
                    Connections: {waypoints.find(w => w.id === selectedNodeId)?.neighbors.join(", ") || "None"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-5 border-t border-slate-800 flex flex-col gap-2 bg-slate-950/50">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export to Console
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all nodes? This cannot be undone.")) {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("dev-mapper-desks");
                    localStorage.removeItem("dev-mapper-waypoints");
                  }
                  setDesks([]);
                  setWaypoints([]);
                  setSelectedNodeId(null);
                  setSelectedNodeType(null);
                  setWaypointIdInput("ENTRANCE");
                }
              }}
              className="flex-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs py-2 rounded-lg transition-all cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="flex-1 bg-slate-950 border border-slate-855 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs py-2 rounded-lg transition-all cursor-pointer"
            >
              Clear Sel
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out panel for import/export text */}
      {showImportExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-11/12 max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Import & Export Workspace</h3>
                <p className="text-slate-400 text-xs mt-0.5">Import previously saved JSON or copy exported results</p>
              </div>
              <button
                onClick={() => setShowImportExport(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Desks JSON Array
                </label>
                <textarea
                  value={importDesksText}
                  onChange={(e) => setImportDesksText(e.target.value)}
                  placeholder="Paste desks JSON here..."
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Waypoints JSON Array
                </label>
                <textarea
                  value={importWaypointsText}
                  onChange={(e) => setImportWaypointsText(e.target.value)}
                  placeholder="Paste waypoints JSON here..."
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button
                onClick={() => setShowImportExport(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
