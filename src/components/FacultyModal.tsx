"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FacultyInfo {
  deskId: string;
  initial: string;
  name: string;
  position: string;
  zone: string;
  email?: string;
  status?: string;
  imageUrl?: string;
  profileUrl?: string;
  sdsLink?: string;
  classScheduleLink?: string;
  x?: number;
  y?: number;
}

interface FacultyModalProps {
  faculty: FacultyInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CLASS_SCHEDULE_URL =
  "https://docs.google.com/spreadsheets/d/1uCpxARIPFmkhL1BdzCL5dXmxO5CbNbFkKrgOCmUM6cA/edit?usp=drivesdk";

const DEFAULT_PROFILE_URL = "https://cse.bracu.ac.bd/faculty_list";

export default function FacultyModal({
  faculty,
  isOpen,
  onClose,
}: FacultyModalProps) {
  const [imageError, setImageError] = useState(false);

  const avatarColors: Record<string, string> = {
    "4K": "from-red-500 to-red-700",
    "4J": "from-green-500 to-green-700",
    "4L": "from-purple-500 to-purple-700",
    "4M": "from-yellow-400 to-amber-600",
    "4N": "from-amber-700 to-amber-900",
    "4P": "from-orange-300 to-orange-500",
    "4G": "from-gray-400 to-gray-600",
  };

  const [prevFacultyKey, setPrevFacultyKey] = useState("");
  const currentKey = `${faculty?.initial}-${faculty?.imageUrl}`;
  if (currentKey !== prevFacultyKey) {
    setPrevFacultyKey(currentKey);
    setImageError(false);
  }

  if (!faculty) return null;

  const profileUrl = faculty.profileUrl || faculty.sdsLink || DEFAULT_PROFILE_URL;
  const classUrl = faculty.classScheduleLink || DEFAULT_CLASS_SCHEDULE_URL;
  const displayName = faculty.name && faculty.name !== faculty.initial ? faculty.name : faculty.initial;
  const hasPhoto = !!faculty.imageUrl && !imageError;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20, x: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 360 }}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-80 sm:w-88 z-40 pointer-events-auto shadow-2xl"
          style={{ maxWidth: "calc(100vw - 2.5rem)" }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 rounded-2xl blur-lg" />

          {/* Compact Glassmorphic Card (Does not block screen) */}
          <div className="relative bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
            {/* Top Accent Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all z-10 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4 sm:p-5">
              {/* Header: Photo + Name + Designation */}
              <div className="flex items-start gap-3.5">
                {/* Photo / Avatar */}
                <div className="flex-shrink-0">
                  {hasPhoto ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-md bg-slate-900 flex items-center justify-center">
                      <img
                        src={faculty.imageUrl}
                        alt={displayName}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${
                        avatarColors[faculty.zone] || avatarColors["4G"]
                      } flex items-center justify-center text-lg font-bold text-white shadow-md border-2 border-white/20`}
                    >
                      {faculty.initial.slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                      {faculty.initial}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                      Desk {faculty.deskId}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug mt-1 truncate">
                    {displayName}
                  </h2>
                  {faculty.position && faculty.position !== "Room" && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                      {faculty.position}
                    </p>
                  )}
                </div>
              </div>

              {/* Details & Email */}
              <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5 text-xs">
                {faculty.email && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">Email</span>
                    <a
                      href={`mailto:${faculty.email}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium truncate max-w-[200px] transition-colors"
                      title={faculty.email}
                    >
                      {faculty.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Zone</span>
                  <span className="text-slate-300 font-medium">{faculty.zone}</span>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                <a
                  href={classUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium underline decoration-1 underline-offset-3 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Class Schedule
                </a>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium underline decoration-1 underline-offset-3 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  BRACU Profile
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
