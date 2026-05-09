"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, ChevronRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getPlayersByTeamId } from "@/lib/mockData";

export function RosterLeaders() {
  const players = getPlayersByTeamId("team_001")
    .filter((p) => p.isStarter)
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 5);

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      QB: "Quarterback",
      RB: "Running Back",
      WR: "Wide Receiver",
      TE: "Tight End",
      LE: "Defensive End",
      MLB: "Linebacker",
      CB: "Cornerback",
    };
    return labels[position] || position;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-electric" />
            <span className="section-title">Top Players</span>
          </div>
          <Link href="/roster" className="text-xs text-electric hover:text-cyan-glow transition-colors flex items-center gap-1">
            View Roster
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y divide-navy-border">
            {players.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-4 px-6 py-3 hover:bg-navy-secondary/30 transition-colors"
              >
                {/* Player Avatar Placeholder */}
                {/* IMAGE PLACEHOLDER: Replace with /public/assets/players/{player.id}.png */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-secondary to-navy-border flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-text-light">
                    {player.firstName[0]}{player.lastName[0]}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {player.firstName} {player.lastName}
                    </p>
                    <span className="text-sm font-bold text-gold tabular-nums">{player.overallRating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{getPositionLabel(player.position)}</span>
                    {player.specialSkill && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-medium">
                        {player.specialSkill}
                      </span>
                    )}
                  </div>
                  <ProgressBar 
                    value={player.overallRating} 
                    max={100} 
                    color="gold" 
                    size="sm" 
                    className="mt-2"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}