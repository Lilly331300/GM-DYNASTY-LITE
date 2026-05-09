"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface MomentumIndicatorProps {
  momentum: number; // -100 to 100
}

export function MomentumIndicator({ momentum }: MomentumIndicatorProps) {
  const normalizedMomentum = Math.max(-100, Math.min(100, momentum));
  const homeAdvantage = normalizedMomentum > 0;
  const intensity = Math.abs(normalizedMomentum) / 100;
  
  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-gold" />
          Momentum
        </h4>
        <span className={`text-xs font-bold ${homeAdvantage ? "text-electric" : "text-success"}`}>
          {homeAdvantage ? "Home Advantage" : "Away Advantage"}
        </span>
      </div>
      
      <div className="relative h-4 bg-navy-secondary rounded-full overflow-hidden">
        {/* Center marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-10" />
        
        {/* Home momentum (left side, actually extends right from center when positive) */}
        <motion.div
          className="absolute top-0 bottom-0 bg-gradient-to-r from-electric to-cyan-glow rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${homeAdvantage ? intensity * 50 : 0}%`,
            left: "50%",
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
        
        {/* Away momentum */}
        <motion.div
          className="absolute top-0 bottom-0 bg-gradient-to-l from-success to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${!homeAdvantage ? intensity * 50 : 0}%`,
            right: "50%",
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-electric font-medium">HOME</span>
        <span className="text-[10px] text-text-muted">{Math.abs(normalizedMomentum)}%</span>
        <span className="text-[10px] text-success font-medium">AWAY</span>
      </div>
    </div>
  );
}