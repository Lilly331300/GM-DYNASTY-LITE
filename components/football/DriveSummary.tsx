"use client";

import React from "react";
import { Gauge, MapPin, Route, TimerReset } from "lucide-react";
import { Team } from "@/lib/types";
import { SimulationState, getDownLabel, getFieldPositionLabel } from "@/lib/simulation";
import { cn } from "@/lib/utils";

interface DriveSummaryProps {
  state: SimulationState;
  homeTeam: Team;
  awayTeam: Team;
  className?: string;
}

export function DriveSummary({ state, homeTeam, awayTeam, className }: DriveSummaryProps) {
  const possessionTeam = state.possession === "home" ? homeTeam : awayTeam;
  const driveDirection =
    state.possession === "home" ? `${awayTeam.nickname} end zone` : `${homeTeam.nickname} end zone`;
  const yardsToGoal = Math.max(0, 100 - state.fieldPosition);

  const stats = [
    { label: "Drive Plays", value: state.drivePlays, icon: Route },
    { label: "Drive Yards", value: state.driveYards, icon: Gauge },
    { label: "Started", value: getFieldPositionLabel(state.driveStartPosition), icon: MapPin },
    { label: "To Goal", value: `${yardsToGoal} yds`, icon: TimerReset },
  ];

  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-border bg-white p-4 text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Current Drive
          </p>
          <h3 className="text-2xl font-black uppercase">{possessionTeam.nickname}</h3>
          <p className="text-sm font-semibold text-slate-500">
            Driving toward {driveDirection}
          </p>
        </div>

        <div
          className="rounded-xl px-3 py-2 text-center text-white"
          style={{ backgroundColor: possessionTeam.primaryColor }}
        >
          <p className="text-xs font-bold uppercase opacity-80">Down</p>
          <p className="text-lg font-black">
            {getDownLabel(state.down)} & {state.distance}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <Icon className="mb-2 h-5 w-5 text-electric" />
              <p className="text-xs font-black uppercase text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-navy-primary">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DriveSummary;