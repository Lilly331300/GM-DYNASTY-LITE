"use client";

import React from "react";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export type SimulationSpeedValue = "normal" | "fast" | "skip";

interface SimulationSpeedProps {
  value: SimulationSpeedValue;
  onChange: (value: SimulationSpeedValue) => void;
  className?: string;
}

const speeds: { value: SimulationSpeedValue; label: string; helper: string }[] = [
  { value: "normal", label: "Normal", helper: "1.8s" },
  { value: "fast", label: "Fast", helper: "0.8s" },
  { value: "skip", label: "Skip", helper: "0.25s" },
];

export function SimulationSpeed({ value, onChange, className }: SimulationSpeedProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-border bg-white p-4 text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Gauge className="h-5 w-5 text-electric" />

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Simulation Speed
          </p>
          <h3 className="text-lg font-black uppercase">Tempo Control</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
        {speeds.map((speed) => (
          <button
            key={speed.value}
            type="button"
            onClick={() => onChange(speed.value)}
            className={cn(
              "rounded-lg px-3 py-2 text-center transition",
              value === speed.value
                ? "bg-navy-primary text-white shadow"
                : "text-slate-500 hover:bg-white"
            )}
          >
            <span className="block text-sm font-black">{speed.label}</span>
            <span className="block text-[11px] font-bold opacity-70">{speed.helper}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default SimulationSpeed;