"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MomentumIndicatorProps {
  momentum: number;
  homeTeam: Team;
  awayTeam: Team;
  className?: string;
}

export function MomentumIndicator({
  momentum,
  homeTeam,
  awayTeam,
  className,
}: MomentumIndicatorProps) {
  const clamped = Math.max(-100, Math.min(100, momentum));
  const marker = ((clamped + 100) / 200) * 100;
  const leader = clamped > 8 ? homeTeam : clamped < -8 ? awayTeam : null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-border bg-white p-4 text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Momentum
          </p>
          <h3 className="text-xl font-black uppercase">
            {leader ? `${leader.nickname} control` : "Even battle"}
          </h3>
        </div>

        <Flame className={cn("h-7 w-7", leader ? "text-gold" : "text-slate-400")} />
      </div>

      <div className="relative h-5 rounded-full bg-gradient-to-r from-wine via-slate-300 to-electric">
        <div className="absolute left-1/2 top-[-5px] h-8 w-px bg-navy-primary/50" />

        <motion.div
          className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-4 border-white bg-navy-primary shadow-xl"
          initial={false}
          animate={{ left: `calc(${marker}% - 18px)` }}
          transition={{ type: "spring", stiffness: 110, damping: 18 }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-black uppercase text-slate-500">
        <span>{awayTeam.abbreviation}</span>
        <span>{Math.abs(Math.round(clamped))}% pressure</span>
        <span>{homeTeam.abbreviation}</span>
      </div>
    </section>
  );
}

export default MomentumIndicator;