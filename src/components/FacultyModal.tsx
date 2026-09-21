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

const ZONE_BADGE_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  "4K": { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/35", dot: "bg-red-400", label: "Zone 4K • Lecturers" },
  "4J": { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/35", dot: "bg-emerald-400", label: "Zone 4J • Lecturers" },
  "4L": { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/35", dot: "bg-purple-400", label: "Zone 4L • Lecturers" },
  "4M": { bg: "bg-yellow-500/15", text: "text-yellow-300", border: "border-yellow-500/35", dot: "bg-yellow-400", label: "Zone 4M • Professors" },
  "4N": { bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-500/35", dot: "bg-orange-400", label: "Zone 4N • Chair / Dean" },
  "4P": { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/35", dot: "bg-amber-400", label: "Zone 4P • Operations" },
  "4G": { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-500/35", dot: "bg-slate-400", label: "Zone 4G • General" },
};

export default function FacultyModal({
  faculty,
  isOpen,
  onClose,
}: FacultyModalProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const avatarGradients: Record<string, string> = {
    "4K": "from-red-600 to-red-800",
    "4J": "from-emerald-600 to-teal-800",
    "4L": "from-purple-600 to-indigo-800",
    "4M": "from-yellow-600 to-amber-700",
    "4N": "from-orange-600 to-amber-800",
    "4P": "from-amber-600 to-orange-800",
    "4G": "from-slate-600 to-zinc-800",
  };

  const [prevFacultyKey, setPrevFacultyKey] = useState("");
  const currentKey = `${faculty?.initial}-${faculty?.imageUrl}`;
  if (currentKey !== prevFacultyKey) {
    setPrevFacultyKey(currentKey);
    setImageError(false);
    setCopiedEmail(false);
  }

  if (!faculty) return null;

  const profileUrl = faculty.profileUrl || faculty.sdsLink || DEFAULT_PROFILE_URL;
  const classUrl = faculty.classScheduleLink || DEFAULT_CLASS_SCHEDULE_URL;
  const displayName = faculty.name && faculty.name !== faculty.initial ? faculty.name : faculty.initial;
  const hasPhoto = !!faculty.imageUrl && !imageError;
  const zoneConfig = ZONE_BADGE_CONFIG[faculty.zone] || ZONE_BADGE_CONFIG["4G"];

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (faculty.email) {
      try {
        await navigator.clipboard.writeText(faculty.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } catch {
        // fallback
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20, x: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20, x: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 360 }}
          className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 w-[92vw] sm:w-[430px] md:w-[460px] z-40 pointer-events-auto"
          style={{ maxWidth: "calc(100vw - 2.5rem)" }}
        >
          {/* Subtle Ambient Navy Glow */}
          <div className="absolute -inset-1 bg-blue-950/40 rounded-3xl blur-xl opacity-90 pointer-events-none" />

          {/* Symmetrical Glassmorphic Card Container */}
          <div className="relative bg-[#080e22]/98 backdrop-blur-3xl border border-slate-700/90 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all">
            {/* Top Navy Accent Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-600 to-slate-400" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close faculty details"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-md border border-slate-700/70"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4 sm:p-5">
              {/* Header: Photo + Name + Badges */}
              <div className="flex items-start gap-3.5">
                {/* Photo / Avatar */}
                <div className="flex-shrink-0">
                  {hasPhoto ? (
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-blue-600/50 shadow-xl bg-slate-900 flex items-center justify-center ring-2 ring-blue-500/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={faculty.imageUrl}
                        alt={displayName}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br ${
                        avatarGradients[faculty.zone] || avatarGradients["4G"]
                      } flex items-center justify-center text-2xl font-black text-white shadow-xl border border-white/20 tracking-wider`}
                    >
                      {faculty.initial.slice(0, 3)}
                    </div>
                  )}
                </div>

                {/* Name, Position & Badges */}
                <div className="flex-1 min-w-0 pr-6">
                  {/* Badges Row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-200 bg-blue-950/90 border border-blue-800/60 px-2 py-0.5 rounded tracking-wider shadow-sm">
                      {faculty.initial}
                    </span>
                    <span className="text-xs font-bold text-white bg-slate-800 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Desk {faculty.deskId}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${zoneConfig.bg} ${zoneConfig.text} ${zoneConfig.border} shadow-sm`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${zoneConfig.dot}`} />
                      {zoneConfig.label}
                    </span>
                  </div>

                  {/* Faculty Full Name */}
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug mt-1.5 truncate">
                    {displayName}
                  </h2>

                  {/* Faculty Position / Designation */}
                  {faculty.position && faculty.position !== "Room" && (
                    <p className="text-xs sm:text-sm font-medium text-slate-300 mt-0.5 leading-tight truncate">
                      {faculty.position}
                    </p>
                  )}
                </div>
              </div>

              {/* Official Email Box with Copy Feature */}
              {faculty.email && (
                <div className="mt-3.5 p-2.5 sm:p-3 rounded-xl bg-[#0a1226] border border-slate-800/90 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-300 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Official Email</div>
                      <a
                        href={`mailto:${faculty.email}`}
                        className="text-xs sm:text-sm font-mono text-blue-300 hover:text-white font-medium truncate block transition-colors mt-0.5"
                        title={faculty.email}
                      >
                        {faculty.email}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-800 grid grid-cols-2 gap-2.5">
                <a
                  href={classUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 border border-blue-500/40 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Class Schedule
                </a>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
