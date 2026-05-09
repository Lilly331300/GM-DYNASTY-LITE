"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Crown,
  Lock,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type PredictionPanelProps = {
  homeTeam: any;
  awayTeam: any;
  homeWinProbability: number;
  spectators: number;
  pool: number;
};

function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-navy-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge variant="gold">
              <Zap className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>

            <h2 className="mt-3 text-2xl font-black uppercase text-white">
              Prediction Coming Soon
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Live game predictions are not active yet. Soon, spectators will be
              able to predict winners, key plays, momentum swings, and earn
              rewards from prediction pools.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-navy-border bg-navy-secondary p-2 text-text-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Button variant="gold" className="w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
}

export function PredictionPanel({
  homeTeam,
  awayTeam,
  homeWinProbability,
  spectators,
  pool,
}: PredictionPanelProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const safeProbability = Math.min(100, Math.max(0, Math.round(homeWinProbability)));
  const awayWinProbability = 100 - safeProbability;

  return (
    <>
      {showComingSoon ? (
        <ComingSoonModal onClose={() => setShowComingSoon(false)} />
      ) : null}

      <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="gold">
                <TrendingUp className="mr-1 h-3 w-3" />
                Prediction Pool
              </Badge>

              <Badge variant="info">
                <Lock className="mr-1 h-3 w-3" />
                Coming Soon
              </Badge>
            </div>

            <h2 className="break-words text-2xl font-black uppercase text-white">
              Live Predictions
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-muted">
              Spectator predictions will unlock later.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-gold/10 p-3 text-gold">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-black uppercase text-white">
                {homeTeam?.city} {homeTeam?.nickname}
              </p>
              <p className="shrink-0 text-sm font-black text-gold">
                {safeProbability}%
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-navy-primary">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${safeProbability}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-black uppercase text-white">
                {awayTeam?.city} {awayTeam?.nickname}
              </p>
              <p className="shrink-0 text-sm font-black text-gold">
                {awayWinProbability}%
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-navy-primary">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${awayWinProbability}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
            <Users className="mx-auto mb-2 h-4 w-4 text-electric" />
            <p className="text-xs font-black uppercase text-text-muted">
              Spectators
            </p>
            <p className="text-lg font-black text-white">
              {spectators.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
            <Crown className="mx-auto mb-2 h-4 w-4 text-gold" />
            <p className="text-xs font-black uppercase text-text-muted">Pool</p>
            <p className="text-lg font-black text-white">{pool} MVP</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <Button
            variant="gold"
            className="w-full gap-2"
            onClick={() => setShowComingSoon(true)}
          >
            <Trophy className="h-4 w-4" />
            Predict Winner
          </Button>

          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => setShowComingSoon(true)}
          >
            <Zap className="h-4 w-4" />
            Predict Next Big Play
          </Button>
        </div>
      </section>
    </>
  );
}

export default PredictionPanel;