"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const recentGames = [
  { id: 1, opponent: "Sea Rats", result: "W", score: "28-21", week: "Week 17", isHome: true },
  { id: 2, opponent: "Grid Kings", result: "W", score: "31-14", week: "Week 16", isHome: false },
  { id: 3, opponent: "Blitz City", result: "L", score: "17-24", week: "Week 15", isHome: true },
  { id: 4, opponent: "Iron Wolves", result: "W", score: "24-20", week: "Week 14", isHome: false },
  { id: 5, opponent: "Storm", result: "W", score: "35-10", week: "Week 13", isHome: true },
];

export function RecentResults() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="section-title">Recent Games</span>
          </div>
          <Link href="/game-history" className="text-xs text-electric hover:text-cyan-glow transition-colors flex items-center gap-1">
            View All
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y divide-navy-border">
            {recentGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-navy-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={game.result === "W" ? "success" : "danger"}
                    className="w-6 h-6 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {game.result}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {game.isHome ? "vs" : "@"} {game.opponent}
                    </p>
                    <p className="text-xs text-text-muted">{game.week}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white tabular-nums">{game.score}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}