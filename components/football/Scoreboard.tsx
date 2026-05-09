"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, CircleDot } from "lucide-react";
import { Team } from "@/lib/types";
import {
  SimulationState,
  formatGameTime,
  getDownLabel,
  getFieldPositionLabel,
} from "@/lib/simulation";
import { cn, formatRecord } from "@/lib/utils";

interface ScoreboardProps {
  homeTeam: Team;
  awayTeam: Team;
  state: SimulationState;
  className?: string;
}

function TeamPanel({
  team,
  score,
  align = "left",
  active,
}: {
  team: Team;
  score: number;
  align?: "left" | "right";
  active: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.82, scale: active ? 1.01 : 1 }}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border p-3 md:p-4",
        active
          ? "border-gold/40 bg-navy-card shadow-lg shadow-gold/5"
          : "border-navy-border bg-navy-secondary/70",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/15 text-xs font-black text-white shadow-inner md:h-16 md:w-16"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
        }}
      >
        {team.abbreviation}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {active && <CircleDot className="h-3 w-3 animate-pulse text-gold" />}
          <p className="truncate text-xs font-bold uppercase tracking-wider text-text-muted">
            {team.city}
          </p>
        </div>

        <h2 className="truncate text-xl font-black uppercase leading-none text-white md:text-3xl">
          {team.nickname}
        </h2>

        <p className="mt-1 text-xs font-semibold text-text-muted">
          {formatRecord(team.record.wins, team.record.losses, team.record.ties)} · OVR{" "}
          {team.overallRating}
        </p>
      </div>

      <div className="min-w-[62px] text-center text-4xl font-black tabular-nums text-white md:min-w-[86px] md:text-6xl">
        {score}
      </div>
    </motion.div>
  );
}

export function Scoreboard({ homeTeam, awayTeam, state, className }: ScoreboardProps) {
  const possessionTeam = state.possession === "home" ? homeTeam : awayTeam;
  const gameClock = state.isFinished ? "FINAL" : formatGameTime(state.timeRemaining);

  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-border bg-white p-3 text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_230px_1fr]">
        <TeamPanel
          team={homeTeam}
          score={state.homeScore}
          active={state.possession === "home"}
        />

        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-wine">
            <Activity className="h-4 w-4" />
            {state.isFinished ? "Game Complete" : `Q${state.quarter}`}
          </div>

          <div className="mt-1 text-4xl font-black tabular-nums text-navy-primary">
            {gameClock}
          </div>

          <div className="mt-1 text-sm font-black uppercase text-navy-primary">
            {state.isFinished ? "Final Score" : `${getDownLabel(state.down)} & ${state.distance}`}
          </div>

          <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Ball on {getFieldPositionLabel(state.fieldPosition)}
          </div>

          <div className="mt-3 rounded-full bg-navy-primary px-3 py-1 text-xs font-black uppercase text-white">
            Possession: {possessionTeam.abbreviation}
          </div>
        </div>

        <TeamPanel
          team={awayTeam}
          score={state.awayScore}
          align="right"
          active={state.possession === "away"}
        />
      </div>
    </section>
  );
}

export default Scoreboard;