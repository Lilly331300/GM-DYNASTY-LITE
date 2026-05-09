"use client";

import React from "react";
import { SimulationState } from "@/lib/simulation";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface DriveSummaryProps {
  state: SimulationState;
}

export function DriveSummary({ state }: DriveSummaryProps) {
  const driveProgress = state.driveStartPosition > 0 
    ? ((state.fieldPosition - state.driveStartPosition) / (100 - state.driveStartPosition)) * 100 
    : 0;

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-white">Current Drive</h4>
        <span className="text-xs text-text-muted">
          {state.drivePlays} plays, {state.driveYards} yards
        </span>
      </div>
      
      <div className="space-y-3">
        <ProgressBar 
          value={Math.max(0, Math.min(100, driveProgress))} 
          max={100} 
          color="electric" 
          size="sm" 
        />
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-navy-secondary rounded-lg p-2">
            <p className="text-lg font-bold text-white">{state.drivePlays}</p>
            <p className="text-[10px] text-text-muted uppercase">Plays</p>
          </div>
          <div className="bg-navy-secondary rounded-lg p-2">
            <p className="text-lg font-bold text-electric">{state.driveYards}</p>
            <p className="text-[10px] text-text-muted uppercase">Yards</p>
          </div>
          <div className="bg-navy-secondary rounded-lg p-2">
            <p className="text-lg font-bold text-gold">
              {state.driveStartPosition < 50 ? `Own ${state.driveStartPosition}` : `Opp ${100 - state.driveStartPosition}`}
            </p>
            <p className="text-[10px] text-text-muted uppercase">Started</p>
          </div>
        </div>
      </div>
    </div>
  );
}