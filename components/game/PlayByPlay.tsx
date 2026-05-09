"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play } from "@/lib/types";
import { getTeamById } from "@/lib/mockData";
import { Zap, Shield, Star, AlertTriangle } from "lucide-react";

interface PlayByPlayProps {
  plays: Play[];
  homeTeamId: string;
  awayTeamId: string;
}

export function PlayByPlay({ plays, homeTeamId, awayTeamId }: PlayByPlayProps) {
  const homeTeam = getTeamById(homeTeamId);
  const awayTeam = getTeamById(awayTeamId);
  
  const getPlayIcon = (play: Play) => {
    if (play.isScore) return <Star className="w-4 h-4 text-gold" />;
    if (play.isTurnover) return <AlertTriangle className="w-4 h-4 text-danger" />;
    if (play.playType === "sack") return <Shield className="w-4 h-4 text-success" />;
    if (play.playType === "pass") return <Zap className="w-4 h-4 text-electric" />;
    return <Zap className="w-4 h-4 text-text-muted" />;
  };

  const getPlayColor = (play: Play) => {
    if (play.isScore) return "border-gold/30 bg-gold/5";
    if (play.isTurnover) return "border-danger/30 bg-danger/5";
    if (play.playType === "sack") return "border-success/30 bg-success/5";
    return "border-navy-border bg-transparent";
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {plays.length === 0 && (
        <div className="text-center py-8 text-text-muted text-sm">
          Game hasn't started yet. Click "Simulate Next Play" to begin.
        </div>
      )}
      
      {[...plays].reverse().map((play, i) => (
        <motion.div
          key={play.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02 }}
          className={`flex items-start gap-3 p-3 rounded-lg border ${getPlayColor(play)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getPlayIcon(play)}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-text-muted">
                Q{play.quarter} {play.time}
              </span>
              <span className="text-xs text-navy-border">|</span>
              <span className={`text-xs font-bold ${play.possession === "home" ? "text-electric" : "text-success"}`}>
                {play.possession === "home" ? homeTeam?.abbreviation : awayTeam?.abbreviation}
              </span>
              {play.isScore && (
                <span className="text-xs font-bold text-gold">
                  {play.homeScore}-{play.awayScore}
                </span>
              )}
            </div>
            
            <p className="text-sm text-text-light leading-relaxed">
              {play.commentary}
            </p>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
              <span>{play.down === 0 ? "Kickoff" : `${play.down}st & ${play.distance}`}</span>
              <span>{play.yards > 0 ? `+${play.yards}` : play.yards} yds</span>
              {play.playerName && <span>{play.playerName}</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}