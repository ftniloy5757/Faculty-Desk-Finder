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
  "4K": { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/40", dot: "bg-red-400", label: "Zone 4K • Lecturers" },
  "4J": { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40", dot: "bg-emerald-400", label: "Zone 4J • Lecturers" },
  "4L": { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40", dot: "bg-purple-400", label: "Zone 4L • Lecturers" },
  "4M": { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/40", dot: "bg-yellow-400", label: "Zone 4M • Professors" },
  "4N": { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/40", dot: "bg-orange-400", label: "Zone 4N • Chair / Dean" },
  "4P": { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40", dot: "bg-amber-400", label: "Zone 4P • Operations" },
  "4G": { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/40", dot: "bg-slate-400", label: "Zone 4G • General" },
};

export default function FacultyModal({
  faculty,
  isOpen,
  onClose,
}: FacultyModalProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const avatarGradients: Record<string, string> = {
    "4K": "from-red-600 via-rose-600 to-red-800",
    "4J": "from-emerald-600 via-green-600 to-teal-800",
    "4L": "from-purple-600 via-violet-600 to-indigo-800",
    "4M": "from-amber-500 via-yellow-600 to-amber-700",
    "4N": "from-orange-600 via-amber-700 to-orange-800",
    "4P": "from-amber-600 via-orange-600 to-red-700",
    "4G": "from-slate-600 via-gray-700 to-zinc-800",
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
          initial={{ opacity: 0, scale: 0.88, y: 36, x: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 36, x: 24 }}
          transition={{ type: "spring", damping: 24, stiffness: 340 }}
          className="fixed bottom-7 right-7 sm:bottom-10 sm:right-10 w-[94vw] sm:w-[480px] md:w-[520px] z-40 pointer-events-auto"
          style={{ maxWidth: "calc(100vw - 3rem)" }}
        >
          {/* Ambient High-Visibility Outer Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/30 via-indigo-500/35 to-blue-600/35 rounded-[32px] blur-2xl opacity-95" />

          {/* Premium Glassmorphic Card Container */}
          <div className="relative bg-slate-950/98 backdrop-blur-3xl border-2 border-white/20 hover:border-cyan-500/40 rounded-[28px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] transition-all">
            {/* Top Cyan-Indigo Gradient Accent Header */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

            {/* Prominent Close Button */}
            <button
              onClick={onClose}
              aria-label="Close faculty details"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg border border-white/15"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-7">
              {/* Header: Large Photo + Name + Badges */}
              <div className="flex items-start gap-5">
                {/* Large Photo / High-Contrast Avatar */}
                <div className="flex-shrink-0">
                  {hasPhoto ? (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl bg-slate-900 flex items-center justify-center ring-4 ring-cyan-500/20">
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
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br ${
                        avatarGradients[faculty.zone] || avatarGradients["4G"]
                      } flex items-center justify-center text-3xl font-black text-white shadow-2xl border-2 border-white/30 ring-4 ring-white/10 tracking-wider`}
                    >
                      {faculty.initial.slice(0, 3)}
                    </div>
                  )}
                </div>

                {/* Name, Position & Badges */}
                <div className="flex-1 min-w-0 pr-8">
                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-black text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-1 rounded-lg tracking-wider shadow-sm">
                      {faculty.initial}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-100 bg-slate-800/90 border border-white/15 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Desk {faculty.deskId}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${zoneConfig.bg} ${zoneConfig.text} ${zoneConfig.border} shadow-sm`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${zoneConfig.dot}`} />
                      {zoneConfig.label}
                    </span>
                  </div>

                  {/* Faculty Full Name */}
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mt-2.5">
                    {displayName}
                  </h2>

                  {/* Faculty Position / Designation */}
                  {faculty.position && faculty.position !== "Room" && (
                    <p className="text-sm sm:text-base font-semibold text-slate-300 mt-1 leading-snug">
                      {faculty.position}
                    </p>
                  )}
                </div>
              </div>

              {/* Official Email Box with Copy Feature */}
              {faculty.email && (
                <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-white/15 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center text-indigo-300 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Official Email</div>
                      <a
                        href={`mailto:${faculty.email}`}
                        className="text-sm sm:text-base font-mono text-cyan-300 hover:text-cyan-200 font-semibold truncate block transition-colors mt-0.5"
                        title={faculty.email}
                      >
                        {faculty.email}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Prominent High-Contrast Action Buttons */}
              <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-2 gap-3.5">
                <a
                  href={classUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-2xl bg-blue-600/30 hover:bg-blue-600/50 border-2 border-blue-500/50 text-blue-200 hover:text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4.5 h-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Class Schedule
                </a>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-2xl bg-cyan-500/25 hover:bg-cyan-500/45 border-2 border-cyan-400/50 text-cyan-200 hover:text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4.5 h-4.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
