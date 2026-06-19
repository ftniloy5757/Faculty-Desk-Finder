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
}

export default function SearchBar({ faculty }: SearchBarProps) {
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

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

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
    router.push(`/desk/${item.deskId}?initial=${item.initial}`);
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
    <div className="relative w-full max-w-lg mx-auto z-50">
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-md" />
        <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <svg
            className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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
            placeholder="Search faculty by initial, name, or desk ID..."
            className="w-full px-4 py-3.5 bg-transparent text-white placeholder-slate-500 outline-none text-sm font-medium"
            id="search-faculty"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="mr-3 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {results.map((result, index) => {
            const item = result.item;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${item.deskId}-${item.initial}-${index}`}
                onClick={() => handleSelect(item)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  isSelected
                    ? "bg-indigo-600/30 text-white"
                    : "hover:bg-white/5 text-slate-300"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background:
                      item.zone === "4K"
                        ? "#dc2626"
                        : item.zone === "4J"
                          ? "#16a34a"
                          : item.zone === "4L"
                            ? "#9333ea"
                            : item.zone === "4M"
                              ? "#eab308"
                              : item.zone === "4N"
                                ? "#92400e"
                                : item.zone === "4P"
                                  ? "#d4a574"
                                  : "#6b7280",
                    color: item.zone === "4M" || item.zone === "4P" ? "#1a1a1a" : "#fff",
                  }}
                >
                  {item.zone}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {item.initial}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Desk {item.deskId} &bull; {item.position || "Faculty"}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-slate-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 text-center text-slate-500 text-sm">
          No faculty found matching &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
