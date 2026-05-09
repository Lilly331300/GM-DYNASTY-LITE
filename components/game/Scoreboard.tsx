"use client";

import React from "react";
import { motion } from "framer-motion";
import { getTeamById } from "@/lib/mockData";
import { SimulationState } from "@/lib/simulation";
import { getDownLabel, formatGameTime, getFieldPositionLabel } from "@/lib/simulation";

interface ScoreboardProps {
  state: SimulationState;
}

export function Scoreboard({ state }: ScoreboardProps) {
  const homeTeam = getTeamById(state.homeTeamId);
  const awayTeam = getTeamById(state.awayTeamId);
  
  if (!homeTeam || !awayTeam) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden"
    >
      <div className="grid grid-cols-3 items-center">
        {/* Home Team */}
        <div className="p-4 lg:p-6 text-center">
          <div 
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl lg:text-2xl"
            style={{
              background: `linear-gradient(135deg, ${homeTeam.primaryColor}, ${homeTeam.secondaryColor})`,
            }}
          >
            {homeTeam.abbreviation}
          </div>
          <p className="text-sm lg:text-base font-bold text-white truncate">{homeTeam.name}</p>
          <p className="text-xs text-text-muted">OVR {homeTeam.overallRating}</p>
        </div>

        {/* Score & Game Info */}
        <div className="bg-navy-primary/50 p-4 lg:p-6 text-center border-x border-navy-border">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-3xl lg:text-5xl font-bold text-white tabular-nums">{state.homeScore}</span>
            <span className="text-xl lg:text-2xl text-text-muted">-</span>
            <span className="text-3xl lg:text-5xl font-bold text-white tabular-nums">{state.awayScore}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm lg:text-base font-bold text-gold">Q{state.quarter}</span>
              <span className="text-sm lg:text-base text-white tabular-nums">{formatGameTime(state.timeRemaining)}</span>
            </div>
            <div className="text-xs lg:text-sm text-text-muted">
              {getDownLabel(state.down)} & {state.distance} • {getFieldPositionLabel(state.fieldPosition)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${state.possession === "home" ? "bg-electric animate-pulse" : "bg-navy-border"}`} />
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Possession</span>
              <div className={`w-2 h-2 rounded-full ${state.possession === "away" ? "bg-electric animate-pulse" : "bg-navy-border"}`} />
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="p-4 lg:p-6 text-center">
          <div 
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl lg:text-2xl"
            style={{
              background: `linear-gradient(135deg, ${awayTeam.primaryColor}, ${awayTeam.secondaryColor})`,
            }}
          >
            {awayTeam.abbreviation}
          </div>
          <p className="text-sm lg:text-base font-bold text-white truncate">{awayTeam.name}</p>
          <p className="text-xs text-text-muted">OVR {awayTeam.overallRating}</p>
        </div>
      </div>
    </motion.div>
  );
}