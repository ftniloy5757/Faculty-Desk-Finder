"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";

interface FacultyItem {
  deskId: string;
  initial: string;
  name: string;
  position: string;
  zone: string;
}

interface SearchBarProps {
  faculty: FacultyItem[];
  onSelectFaculty?: (item: FacultyItem) => void;
}

export default function SearchBar({ faculty, onSelectFaculty }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter out empty entries and rooms
  const searchableFaculty = useMemo(
    () => faculty.filter((f) => f.initial && f.position !== "Room"),
    [faculty]
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchableFaculty, {
        keys: ["initial", "name", "deskId"],
        threshold: 0.3,
        includeScore: true,
      }),
    [searchableFaculty]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 8);
  }, [query, fuse]);

  const [prevQuery, setPrevQuery] = useState("");
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(-1);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: FacultyItem) {
    setQuery("");
    setIsOpen(false);
    if (onSelectFaculty) {
      onSelectFaculty(item);
    } else {
      router.push(`/desk/${item.deskId}?initial=${item.initial}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex].item);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative w-full z-50">
      {/* Search input container */}
      <div className="relative flex items-center bg-[#0a1226]/95 backdrop-blur-xl border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl shadow-lg transition-all overflow-hidden">
        <svg
          className="w-4.5 h-4.5 text-slate-400 ml-3.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search faculty by initial, name, or desk..."
          className="w-full px-3.5 py-2.5 bg-transparent text-white placeholder-slate-400 outline-none text-xs sm:text-sm font-medium"
          id="search-faculty"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="mr-3 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <span className="hidden xl:inline-block mr-3 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 rounded">
            ESC
          </span>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1.5 w-full bg-[#080f24]/98 backdrop-blur-2xl border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800/60"
        >
          {results.map((result, index) => {
            const item = result.item;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${item.deskId}-${item.initial}-${index}`}
                onClick={() => handleSelect(item)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-blue-900/35 border-l-4 border-blue-500 text-white"
                    : "hover:bg-slate-800/40 text-slate-200"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm"
                  style={{
                    background:
                      item.zone === "4K"
                        ? "#ef4444"
                        : item.zone === "4J"
                          ? "#22c55e"
                          : item.zone === "4L"
                            ? "#a855f7"
                            : item.zone === "4M"
                              ? "#facc15"
                              : item.zone === "4N"
                                ? "#b45309"
                                : item.zone === "4P"
                                  ? "#e2b17a"
                                  : "#64748b",
                    color: item.zone === "4M" || item.zone === "4P" ? "#1a1a1a" : "#fff",
                  }}
                >
                  {item.zone}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">
                      {item.name}
                    </p>
                    <span className="text-[11px] font-mono font-bold text-blue-300 bg-blue-950/80 border border-blue-800/60 px-1.5 py-0.2 rounded">
                      {item.initial}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                    Desk <span className="text-slate-200 font-semibold">{item.deskId}</span> &bull; {item.position || "Faculty"}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-slate-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
