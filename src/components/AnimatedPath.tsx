"use client";

import { motion } from "framer-motion";
import { pathToSvgD, type Point } from "@/lib/pathfinding";

interface AnimatedPathProps {
  points: Point[];
  onComplete?: () => void;
  duration?: number;
}

export default function AnimatedPath({
  points,
  onComplete,
  duration = 2,
}: AnimatedPathProps) {
  if (points.length < 2) return null;

  const d = pathToSvgD(points);

  return (
    <svg
      viewBox="0 0 4095 2487"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Glow layer */}
      <motion.path
        d={d}
        fill="none"
        stroke="url(#pathGradient)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        opacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration, ease: "easeInOut" }}
      />

      {/* Main path */}
      <motion.path
        d={d}
        fill="none"
        stroke="url(#pathGradient)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration, ease: "easeInOut" }}
        onAnimationComplete={onComplete}
      />

      {/* Moving dot at the end of path */}
      <motion.circle
        r={12}
        fill="#06b6d4"
        filter="url(#glow)"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration, ease: "easeInOut" }}
        style={{
          offsetPath: `path('${d}')`,
        }}
      />
    </svg>
  );
}
