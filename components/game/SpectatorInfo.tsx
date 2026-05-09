"use client";

import React from "react";
import { Eye, Radio, Users } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface SpectatorInfoProps {
  spectators: number;
  peak?: number;
  className?: string;
}

export function SpectatorInfo({ spectators, peak = 1982, className }: SpectatorInfoProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-border bg-white p-4 text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Spectator Info
          </p>
          <h3 className="text-xl font-black uppercase">Broadcast Reach</h3>
        </div>

        <Radio className="h-6 w-6 animate-pulse text-danger" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Eye className="mb-2 h-5 w-5 text-electric" />
          <p className="text-xs font-black uppercase text-slate-500">Watching</p>
          <p className="text-2xl font-black tabular-nums">{formatNumber(spectators)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Users className="mb-2 h-5 w-5 text-gold" />
          <p className="text-xs font-black uppercase text-slate-500">Peak</p>
          <p className="text-2xl font-black tabular-nums">{formatNumber(peak)}</p>
        </div>
      </div>
    </section>
  );
}

export default SpectatorInfo;