"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationState, getFieldPositionLabel } from "@/lib/simulation";

interface FieldVisualizationProps {
  state: SimulationState;
}

export function FieldVisualization({ state }: FieldVisualizationProps) {
  const fieldPosition = Math.max(0, Math.min(100, state.fieldPosition));
  const possession = state.possession;
  
  // Convert field position to percentage for ball placement
  // Field goes from 0 (left/endzone) to 100 (right/endzone)
  const ballPosition = fieldPosition;

  return (
    <div className="relative w-full aspect-[2.5/1] bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 rounded-xl overflow-hidden border-2 border-navy-border">
      {/* Field markings */}
      <div className="absolute inset-0">
        {/* Yard lines */}
        {Array.from({ length: 11 }).map((_, i) => {
          const yardLine = i * 10;
          const leftPos = yardLine;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-white/30"
              style={{ left: `${leftPos}%` }}
            >
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-white/60 font-medium">
                {i <= 5 ? i * 10 : (10 - i) * 10}
              </span>
            </div>
          );
        })}
        
        {/* 50 yard line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50" />
        
        {/* Endzones */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-red-900/30 border-r-2 border-white/20" />
        <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-red-900/30 border-l-2 border-white/20" />
        
        {/* Hash marks */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={`hash-${i}`}
            className="absolute w-px h-2 bg-white/20"
            style={{ left: `${20 + i * 1.2}%`, top: "45%" }}
          />
        ))}
      </div>

      {/* Ball Marker */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.quarter}-${state.down}-${state.fieldPosition}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${ballPosition}%` }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 w-8 h-8 bg-electric/30 rounded-full blur-md" />
            
            {/* Ball */}
            <div className="relative w-8 h-8 bg-gradient-to-br from-electric to-cyan-glow rounded-full border-2 border-white flex items-center justify-center shadow-lg">
              <span className="text-[10px] font-bold text-white">
                {state.down === 0 ? "K" : state.down}
              </span>
            </div>
            
            {/* Direction arrow */}
            <motion.div
              initial={{ x: possession === "home" ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-[10px] font-bold text-white bg-navy-primary/80 px-2 py-0.5 rounded-full">
                {possession === "home" ? "→" : "←"} {getFieldPositionLabel(fieldPosition)}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* First down marker */}
      {state.down > 0 && state.down < 4 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/50"
          style={{
            left: `${Math.min(100, fieldPosition + (state.distance / 100) * 100)}%`,
          }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-yellow-400 font-bold">
            1st
          </span>
        </div>
      )}

      {/* Team labels */}
      <div className="absolute bottom-2 left-4 text-[10px] text-white/40 font-medium">HOME</div>
      <div className="absolute bottom-2 right-4 text-[10px] text-white/40 font-medium">AWAY</div>
    </div>
  );
}