"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, ChevronRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const liveGames = [
  { id: 1, home: "NYC", away: "RIV", homeScore: 21, awayScore: 17, quarter: "Q3", time: "08:45", viewers: 128 },
  { id: 2, home: "DAL", away: "BRK", homeScore: 14, awayScore: 10, quarter: "Q2", time: "04:12", viewers: 93 },
  { id: 3, home: "SEA", away: "LV", homeScore: 31, awayScore: 28, quarter: "Q4", time: "01:30", viewers: 247 },
  { id: 4, home: "COL", away: "TB", homeScore: 7, awayScore: 3, quarter: "Q1", time: "11:20", viewers: 64 },
];

export function LiveGamesWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-danger animate-pulse" />
            <span className="section-title">Live Games</span>
          </div>
          <Link href="/games-in-progress" className="text-xs text-electric hover:text-cyan-glow transition-colors flex items-center gap-1">
            View All
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y divide-navy-border">
            {liveGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-navy-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="danger" className="text-[10px] px-1.5 py-0.5">
                    {game.quarter}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white w-8">{game.home}</span>
                    <span className="text-sm text-text-muted">vs</span>
                    <span className="text-sm font-bold text-white w-8">{game.away}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white tabular-nums">
                    {game.homeScore}-{game.awayScore}
                  </span>
                  <span className="text-xs text-text-muted w-10">{game.time}</span>
                  <div className="flex items-center gap-1 text-xs text-text-muted w-16 justify-end">
                    <Users className="w-3 h-3" />
                    {game.viewers}
                  </div>
                  <Link href="/live-game">
                    <Badge variant="outline" className="text-[10px] cursor-pointer hover:border-electric hover:text-electric transition-colors">
                      Watch
                    </Badge>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}