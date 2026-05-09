"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, ChevronRight, Shield, Swords, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockGamePlan } from "@/lib/mockData";

export function GamePlanSummary() {
  const { offense, defense, specialTeams } = mockGamePlan;

  const personnelLabels: Record<string, string> = {
    "22": "22 Personnel (2 RB, 2 TE, 1 WR)",
    "21": "21 Personnel (2 RB, 1 TE, 2 WR)",
    "12": "12 Personnel (1 RB, 2 TE, 2 WR)",
    "11": "11 Personnel (1 RB, 1 TE, 3 WR)",
    "10": "10 Personnel (1 RB, 0 TE, 4 WR)",
  };

  const schemeLabels: Record<string, string> = {
    "4-3": "4-3 Defense",
    "3-4": "3-4 Defense",
    Nickel: "Nickel",
    Dime: "Dime",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-wine" />
            <span className="section-title">Game Plan</span>
          </div>
          <Link href="/game-plan" className="text-xs text-electric hover:text-cyan-glow transition-colors flex items-center gap-1">
            Edit Plan
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Offense */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-electric" />
              <span className="text-sm font-bold text-white">Offense</span>
              <Badge variant="info" className="text-[10px]">
                {personnelLabels[offense.basePersonnel]}
              </Badge>
            </div>
            <div className="space-y-2">
              <ProgressBar 
                value={offense.runPassTendency} 
                max={100} 
                color="electric" 
                size="sm" 
                label="Run/Pass Balance"
                showValue
              />
              <ProgressBar 
                value={offense.tempo} 
                max={100} 
                color="gold" 
                size="sm" 
                label="Tempo"
                showValue
              />
            </div>
          </div>
          
          {/* Defense */}
          <div className="space-y-3 pt-3 border-t border-navy-border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-sm font-bold text-white">Defense</span>
              <Badge variant="success" className="text-[10px]">
                {schemeLabels[defense.baseScheme]}
              </Badge>
            </div>
            <div className="space-y-2">
              <ProgressBar 
                value={defense.blitzFrequency} 
                max={100} 
                color="success" 
                size="sm" 
                label="Blitz Frequency"
                showValue
              />
              <ProgressBar 
                value={defense.coveragePreference} 
                max={100} 
                color="electric" 
                size="sm" 
                label="Coverage (Man/Zone)"
                showValue
              />
            </div>
          </div>
          
          {/* Special Teams */}
          <div className="space-y-3 pt-3 border-t border-navy-border">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" />
              <span className="text-sm font-bold text-white">Special Teams</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-secondary rounded-lg p-3 border border-navy-border">
                <p className="text-xs text-text-muted mb-1">FG Range</p>
                <p className="text-lg font-bold text-white">{specialTeams.maxFieldGoalRange} YDS</p>
              </div>
              <div className="bg-navy-secondary rounded-lg p-3 border border-navy-border">
                <p className="text-xs text-text-muted mb-1">2-PT Aggression</p>
                <p className="text-lg font-bold text-white">{specialTeams.twoPointConversionAggression}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}