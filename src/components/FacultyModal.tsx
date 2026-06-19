"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FacultyInfo {
  deskId: string;
  initial: string;
  name: string;
  position: string;
  zone: string;
  sdsLink: string;
}

interface FacultyModalProps {
  faculty: FacultyInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_SCHEDULE_URL =
  "https://docs.google.com/spreadsheets/d/1uCpxARIPFmkhL1BdzCL5dXmxO5CbNbFkKrgOCmUM6cA/edit?usp=drivesdk";

export default function FacultyModal({
  faculty,
  isOpen,
  onClose,
}: FacultyModalProps) {
  if (!faculty) return null;

  const avatarColors: Record<string, string> = {
    "4K": "from-red-500 to-red-700",
    "4J": "from-green-500 to-green-700",
    "4L": "from-purple-500 to-purple-700",
    "4M": "from-yellow-400 to-amber-600",
    "4N": "from-amber-700 to-amber-900",
    "4P": "from-orange-300 to-orange-500",
    "4G": "from-gray-400 to-gray-600",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-sm pointer-events-auto">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-3xl blur-xl" />

              <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
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
                  {/* Avatar */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                      avatarColors[faculty.zone] || avatarColors["4G"]
                    } flex items-center justify-center text-2xl font-bold text-white shadow-xl border-4 border-slate-900 mx-auto`}
                  >
                    {faculty.initial.slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="text-center mt-4 space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {faculty.initial}
                    </h2>
                    <p className="text-slate-400 text-sm">{faculty.name || faculty.initial}</p>
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
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 space-y-2.5">
                    <a
                      href={CLASS_SCHEDULE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      View Class Schedule
                    </a>

                    <a
                      href={faculty.sdsLink || "https://cse.sds.bracu.ac.bd/faculty_list"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      BRACU SDS Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
