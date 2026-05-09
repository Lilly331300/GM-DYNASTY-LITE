"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightCircle, Goal, ShieldAlert, Timer, Zap } from "lucide-react";
import { Play, Team } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlayByPlayProps {
  plays: Play[];
  homeTeam: Team;
  awayTeam: Team;
  className?: string;
  maxHeight?: string;
}

function iconForPlay(play: Play) {
  if (play.isScore) return Goal;
  if (play.isTurnover) return Zap;
  if (play.playType === "sack") return ShieldAlert;
  return ArrowRightCircle;
}

export function PlayByPlay({
  plays,
  homeTeam,
  awayTeam,
  className,
  maxHeight = "max-h-[620px]",
}: PlayByPlayProps) {
  const ordered = [...plays].reverse();

  return (
    <aside
      className={cn(
        "rounded-2xl border border-navy-border bg-white text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-lg font-black uppercase">Play-by-Play</h3>
          <p className="text-xs font-semibold text-slate-500">Live simulation feed</p>
        </div>

        <span className="rounded-full bg-danger/10 px-2 py-1 text-xs font-black uppercase text-danger">
          Live
        </span>
      </div>

      <div className={cn("overflow-y-auto p-2", maxHeight)}>
        {ordered.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Timer className="h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-500">No plays yet.</p>
            <p className="text-xs text-slate-400">
              Start the simulation to generate the broadcast feed.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {ordered.map((play, index) => {
              const Icon = iconForPlay(play);
              const team = play.possession === "home" ? homeTeam : awayTeam;

              return (
                <motion.div
                  key={play.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, delay: index === 0 ? 0 : 0.01 }}
                  className={cn(
                    "mb-2 rounded-xl border p-3",
                    index === 0 ? "border-gold/40 bg-gold/5" : "border-slate-200 bg-slate-50",
                    play.isScore && "border-success/40 bg-success/5",
                    play.isTurnover && "border-danger/40 bg-danger/5"
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Q{play.quarter} · {play.time}
                        </p>
                        <p className="text-xs font-black text-slate-500">
                          {team.abbreviation}
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-black uppercase text-navy-primary">
                        {play.down} & {play.distance} · {play.result}
                      </p>

                      <p className="mt-1 text-sm leading-snug text-slate-600">
                        {play.commentary}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span>{play.yards >= 0 ? `+${play.yards}` : play.yards} yds</span>
                        <span>•</span>
                        <span>
                          {play.homeScore} - {play.awayScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}

export default PlayByPlay;