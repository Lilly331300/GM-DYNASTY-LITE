"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Goal, Radio, ShieldAlert, Zap } from "lucide-react";
import { Team, Play } from "@/lib/types";
import { SimulationState, getFieldPositionLabel } from "@/lib/simulation";
import { cn } from "@/lib/utils";

interface FieldVisualizationProps {
  homeTeam: Team;
  awayTeam: Team;
  state: SimulationState;
  lastPlay?: Play;
  className?: string;
}

function hashMarks() {
  return Array.from({ length: 21 }, (_, index) => index * 5);
}

function yardLabel(yard: number) {
  if (yard === 50) return "50";
  const display = yard < 50 ? yard : 100 - yard;
  if (display === 0) return "";
  return String(display);
}

function getPlayAction(play?: Play) {
  if (!play) return null;

  const result = play.result.toLowerCase();
  const commentary = play.commentary;

  if (play.isScore && play.scoreType === "touchdown") {
    return {
      label: "TOUCHDOWN",
      sub: `${commentary} The stadium is alive.`,
      tone: "text-gold border-gold/50 bg-gold/20",
    };
  }

  if (result.includes("made") || play.scoreType === "field_goal") {
    return {
      label: "FIELD GOAL",
      sub: `${commentary} Special teams delivers.`,
      tone: "text-gold border-gold/50 bg-gold/20",
    };
  }

  if (result.includes("fumble")) {
    return {
      label: "FUMBLE",
      sub: `${commentary} Momentum just flipped.`,
      tone: "text-danger border-danger/50 bg-danger/20",
    };
  }

  if (result.includes("interception")) {
    return {
      label: "INTERCEPTION",
      sub: `${commentary} The defense makes a statement.`,
      tone: "text-danger border-danger/50 bg-danger/20",
    };
  }

  if (result.includes("sack")) {
    return {
      label: "SACK",
      sub: `${commentary} Pressure gets home.`,
      tone: "text-electric border-electric/50 bg-electric/20",
    };
  }

  if (result.includes("penalty")) {
    return {
      label: "PENALTY",
      sub: `${commentary} Discipline matters in big moments.`,
      tone: "text-danger border-danger/50 bg-danger/20",
    };
  }

  if (play.yards >= 25) {
    return {
      label: `${play.yards} YARDS`,
      sub: `${commentary} Explosive gain from the offense.`,
      tone: "text-success border-success/50 bg-success/20",
    };
  }

  if (play.yards <= -5) {
    return {
      label: "LOSS OF YARDS",
      sub: `${commentary} Defense wins the snap.`,
      tone: "text-electric border-electric/50 bg-electric/20",
    };
  }

  return null;
}

function getQuarterEventAction(state: SimulationState) {
  if (!state.gameEvent) return null;

  const tone =
    state.gameEvent.tone === "gold"
      ? "text-gold border-gold/50 bg-gold/20"
      : state.gameEvent.tone === "danger"
        ? "text-danger border-danger/50 bg-danger/20"
        : state.gameEvent.tone === "success"
          ? "text-success border-success/50 bg-success/20"
          : state.gameEvent.tone === "electric"
            ? "text-electric border-electric/50 bg-electric/20"
            : "text-white border-white/30 bg-white/10";

  return {
    label: state.gameEvent.label,
    sub: state.gameEvent.sub,
    tone,
  };
}

export function FieldVisualization({
  homeTeam,
  awayTeam,
  state,
  lastPlay,
  className,
}: FieldVisualizationProps) {
  const ballPercent = Math.max(2, Math.min(98, state.fieldPosition));
  const firstDownPercent = Math.max(2, Math.min(98, state.fieldPosition + state.distance));
  const isRedZone = state.fieldPosition >= 80;
  const possessionTeam = state.possession === "home" ? homeTeam : awayTeam;
  const quarterAction = getQuarterEventAction(state);
  const playAction = getPlayAction(lastPlay);
  const bigAction = quarterAction ?? playAction;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-navy-border bg-navy-primary shadow-2xl",
        className
      )}
    >
      <div className="relative min-h-[390px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.22),rgba(4,17,29,0.95)_70%)] p-3 sm:min-h-[430px] md:min-h-[470px] lg:min-h-[520px] xl:min-h-[560px]">
        {/* Replace this visual field later with local asset: /public/assets/fields/football-field.png */}
        {/* Optional stadium background path: /public/assets/stadiums/live-game-stadium.png */}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.25))]" />

        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-white/70 sm:text-xs">
          <span className="inline-flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-danger sm:h-4 sm:w-4" />
            Live Broadcast Field
          </span>
          <span>{getFieldPositionLabel(state.fieldPosition)}</span>
        </div>

        <div className="absolute inset-x-3 bottom-5 top-14 overflow-hidden rounded-xl border-2 border-white/80 bg-green-800 shadow-inner sm:inset-x-4 md:border-4">
          <div className="absolute inset-0 opacity-35 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_5%)]" />
          <div className="absolute inset-0 [background-image:repeating-linear-gradient(0deg,rgba(0,0,0,0.12)_0,rgba(0,0,0,0.12)_24px,rgba(255,255,255,0.03)_25px,rgba(255,255,255,0.03)_48px)]" />

          <div
            className="absolute left-0 top-0 flex h-full w-[9%] items-center justify-center"
            style={{ backgroundColor: homeTeam.primaryColor }}
          >
            <span className="rotate-[-90deg] whitespace-nowrap text-sm font-black uppercase tracking-widest text-white/90 sm:text-base md:text-2xl xl:text-4xl">
              {homeTeam.nickname}
            </span>
          </div>

          <div
            className="absolute right-0 top-0 flex h-full w-[9%] items-center justify-center"
            style={{ backgroundColor: awayTeam.primaryColor }}
          >
            <span className="rotate-90 whitespace-nowrap text-sm font-black uppercase tracking-widest text-white/90 sm:text-base md:text-2xl xl:text-4xl">
              {awayTeam.nickname}
            </span>
          </div>

          {hashMarks().map((yard) => {
            const isMajorLine = yard % 10 === 0;
            const isMidfield = yard === 50;

            return (
              <div
                key={yard}
                className={cn(
                  "absolute top-0 h-full",
                  isMajorLine ? "border-l border-white/70" : "border-l border-white/25"
                )}
                style={{ left: `${yard}%` }}
              >
                {isMajorLine && (
                  <>
                    <span
                      className={cn(
                        "absolute left-1 top-[26%] -translate-x-1/2 font-black text-white/75",
                        "text-[8px] sm:text-[10px] md:text-xs lg:text-base xl:text-xl",
                        !isMidfield && "hidden sm:block"
                      )}
                    >
                      {yardLabel(yard)}
                    </span>

                    <span
                      className={cn(
                        "absolute left-1 top-[62%] -translate-x-1/2 rotate-180 font-black text-white/75",
                        "text-[8px] sm:text-[10px] md:text-xs lg:text-base xl:text-xl",
                        !isMidfield && "hidden sm:block"
                      )}
                    >
                      {yardLabel(yard)}
                    </span>
                  </>
                )}
              </div>
            );
          })}

          <motion.div
            className="absolute top-0 h-full w-1 bg-electric shadow-[0_0_18px_rgba(59,130,246,0.9)]"
            initial={false}
            animate={{ left: `${ballPercent}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 16 }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-electric px-2 py-1 text-[10px] font-black uppercase text-white shadow-lg sm:text-xs">
              Ball
            </div>
          </motion.div>

          {!state.isFinished && (
            <motion.div
              className="absolute top-0 h-full w-1 bg-gold shadow-[0_0_18px_rgba(245,197,66,0.9)]"
              initial={false}
              animate={{ left: `${firstDownPercent}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 16 }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-gold px-2 py-1 text-[10px] font-black uppercase text-navy-primary shadow-lg sm:text-xs">
                1st
              </div>
            </motion.div>
          )}

          <motion.div
            className="absolute top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-sm shadow-2xl sm:h-10 sm:w-10 sm:border-4 sm:text-lg"
            initial={false}
            animate={{ left: `calc(${ballPercent}% - 20px)` }}
            transition={{ type: "spring", stiffness: 110, damping: 17 }}
          >
            🏈
          </motion.div>

          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-lg font-black text-white/20 sm:h-20 sm:w-20 md:h-24 md:w-24 md:text-2xl">
            GM
          </div>

          <div className="absolute left-3 top-3 rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-white shadow-xl sm:left-4 sm:top-4 sm:px-4">
            <p className="text-[10px] font-bold uppercase text-white/60 sm:text-xs">
              Possession
            </p>
            <p className="text-sm font-black uppercase sm:text-base">
              {possessionTeam.nickname}
            </p>
          </div>

          {isRedZone && (
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-danger/50 bg-danger/20 px-3 py-2 text-danger shadow-xl backdrop-blur sm:right-4 sm:top-4 sm:px-4">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-black uppercase sm:text-sm">Red Zone</span>
            </div>
          )}

          <AnimatePresence>
            {bigAction && (
              <motion.div
                key={`${bigAction.label}-${lastPlay?.id ?? state.gameEvent?.id}`}
                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.15 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[1px]"
              >
                <motion.div
                  initial={{ rotate: -2 }}
                  animate={{ rotate: [0, -1.2, 1.2, 0] }}
                  transition={{ duration: 0.45 }}
                  className={cn(
                    "max-w-3xl rounded-3xl border px-5 py-4 text-center shadow-2xl md:px-8 md:py-6",
                    bigAction.tone
                  )}
                >
                  <p className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl xl:text-7xl">
                    {bigAction.label}
                  </p>
                  <p className="mt-2 text-xs font-bold text-white/85 sm:text-sm md:text-base">
                    {bigAction.sub}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {lastPlay && (
            <motion.div
              key={lastPlay.id}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute bottom-4 left-1/2 z-30 w-[min(720px,92%)] -translate-x-1/2 rounded-xl border border-white/25 bg-navy-primary/92 px-4 py-3 text-center text-white shadow-2xl backdrop-blur"
            >
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-gold sm:text-xs">
                {lastPlay.isScore ? (
                  <Goal className="h-4 w-4" />
                ) : lastPlay.isTurnover ? (
                  <Zap className="h-4 w-4" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                Broadcast Subtitle
              </div>

              <p className="mt-1 text-sm font-black uppercase sm:text-base md:text-lg">
                {lastPlay.result}
              </p>
              <p className="text-xs text-text-muted sm:text-sm">
                {lastPlay.commentary}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FieldVisualization;