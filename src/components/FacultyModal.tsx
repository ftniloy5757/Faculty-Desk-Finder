"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FacultyInfo {
  deskId: string;
  initial: string;
  name: string;
  position: string;
  zone: string;
  email?: string;
  status?: string;
  sdsLink?: string;
  classScheduleLink?: string;
  boundingBox?: {
    top: string;
    left: string;
    width: string;
    height: string;
  } | null;
}

interface FacultyModalProps {
  faculty: FacultyInfo | null;
  isOpen: boolean;
  onClose: () => void;
  deskScreenPos?: { x: number; y: number } | null;
}

const DEFAULT_CLASS_SCHEDULE_URL =
  "https://docs.google.com/spreadsheets/d/1uCpxARIPFmkhL1BdzCL5dXmxO5CbNbFkKrgOCmUM6cA/edit?usp=drivesdk";

const DEFAULT_SDS_URL = "https://cse.sds.bracu.ac.bd/faculty_list";

export default function FacultyModal({
  faculty,
  isOpen,
  onClose,
}: FacultyModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgIndex, setImgIndex] = useState(0);
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

  const sources = useMemo(() => {
    if (!faculty) return [];
    const prefix = faculty.email ? faculty.email.split("@")[0].toLowerCase() : "";
    const init = faculty.initial ? faculty.initial.toUpperCase() : "";
    return [
      `https://cse.sds.bracu.ac.bd/assets/images/faculty/${init}.jpg`,
      `https://cse.sds.bracu.ac.bd/assets/images/faculty/${init}.png`,
      `https://www.bracu.ac.bd/sites/default/files/styles/medium/public/about/people/photos/${prefix}.jpg`,
      `https://www.bracu.ac.bd/sites/default/files/styles/medium/public/about/people/photos/${prefix}.jpeg`
    ];
  }, [faculty]);

  // Reset image states when faculty changes
  useEffect(() => {
    if (sources.length > 0) {
      setImgSrc(sources[0]);
      setImgIndex(0);
      setImageError(false);
    } else {
      setImgSrc("");
      setImageError(true);
    }
  }, [sources]);

  const handleImageError = () => {
    if (imgIndex + 1 < sources.length) {
      setImgIndex(imgIndex + 1);
      setImgSrc(sources[imgIndex + 1]);
    } else {
      setImageError(true);
    }
  };

  if (!faculty) return null;

  // Use per-faculty links when available; fall back to defaults
  const sdsUrl = faculty.sdsLink || DEFAULT_SDS_URL;
  const classUrl = faculty.classScheduleLink || DEFAULT_CLASS_SCHEDULE_URL;

  // Get the display name — prefer full name, fallback to initial
  const displayName = faculty.name && faculty.name !== faculty.initial
    ? faculty.name
    : faculty.initial;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent click-catcher to close modal on background click */}
          <div
            className="fixed inset-0 z-30 pointer-events-auto"
            onClick={onClose}
          />

          {/* Floating Card Panel - Bottom Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-[calc(100%-3rem)] sm:w-96 z-40 pointer-events-auto"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" />

            <div className="relative bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header gradient */}
              <div className="h-20 bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-cyan-600/20" />

              <div className="px-6 pb-6 -mt-10">
                {/* Avatar / Faculty Photo */}
                {imageError || !imgSrc ? (
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                      avatarColors[faculty.zone] || avatarColors["4G"]
                    } flex items-center justify-center text-2xl font-bold text-white shadow-xl border-4 border-slate-950 mx-auto`}
                  >
                    {faculty.initial.slice(0, 2)}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-slate-950 shadow-xl mx-auto bg-slate-800 flex items-center justify-center">
                    <img
                      src={imgSrc}
                      alt={faculty.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="text-center mt-4 space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {faculty.initial}
                  </h2>
                  <p className="text-slate-400 text-sm">{displayName}</p>
                  {faculty.position && faculty.position !== "Room" && (
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {faculty.position}
                    </span>
                  )}
                </div>

                {/* Desk info */}
                <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Desk</span>
                    <span className="text-white font-mono font-semibold">
                      {faculty.deskId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500">Zone</span>
                    <span className="text-white font-semibold">
                      {faculty.zone}
                    </span>
                  </div>
                  {faculty.email && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-slate-500">Email</span>
                      <a
                        href={`mailto:${faculty.email}`}
                        className="text-indigo-400 hover:text-indigo-300 text-xs truncate max-w-[180px] transition-colors"
                      >
                        {faculty.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action links */}
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={classUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 underline decoration-1 underline-offset-4 font-semibold text-sm w-fit transition-colors"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    View Class Schedule
                  </a>

                  <a
                    href={sdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 underline decoration-1 underline-offset-4 font-semibold text-sm w-fit transition-colors"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    BRACU SDS Profile
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
