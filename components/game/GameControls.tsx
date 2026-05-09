"use client";

import React from "react";
import {
  Bot,
  FastForward,
  Film,
  Link2,
  MessageSquareWarning,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  matchType: "pvp" | "ai";
  isFinished?: boolean;
  skipRequested?: boolean;
  replayAvailable?: boolean;
  inviteCopied?: boolean;
  onRequestSkip: () => void;
  onEndAiGame: () => void;
  onWatchReplay: () => void;
  onCopyInvite: () => void;
  onResetDemo?: () => void;
  className?: string;
}

export function GameControls({
  matchType,
  isFinished = false,
  skipRequested = false,
  replayAvailable = false,
  inviteCopied = false,
  onRequestSkip,
  onEndAiGame,
  onWatchReplay,
  onCopyInvite,
  onResetDemo,
  className,
}: GameControlsProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-border bg-white p-4 text-navy-primary shadow-xl",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Broadcast Actions
          </p>
          <h3 className="text-xl font-black uppercase">
            {matchType === "pvp" ? "Live PvP Match" : "Live AI Match"}
          </h3>
        </div>

        <span
          className={cn(
            "w-fit rounded-full px-3 py-1 text-xs font-black uppercase",
            isFinished ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}
        >
          {isFinished ? "Completed" : "Simulation Running"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Button
          variant="secondary"
          className="gap-2"
          onClick={onCopyInvite}
          disabled={isFinished}
        >
          {inviteCopied ? <Link2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {inviteCopied ? "Link Copied" : "Invite Viewers"}
        </Button>

        {matchType === "pvp" ? (
          <Button
            variant={skipRequested ? "gold" : "outline"}
            className="gap-2"
            onClick={onRequestSkip}
            disabled={isFinished || skipRequested}
          >
            <MessageSquareWarning className="h-4 w-4" />
            {skipRequested ? "Skip Requested" : "Request Skip"}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="gap-2"
            onClick={onEndAiGame}
            disabled={isFinished}
          >
            <Bot className="h-4 w-4" />
            End AI Game
          </Button>
        )}

        <Button
          variant="outline"
          className="gap-2"
          onClick={onWatchReplay}
          disabled={!replayAvailable}
        >
          <Film className="h-4 w-4" />
          Watch Replay
        </Button>

        <Button
          variant="ghost"
          className="gap-2"
          onClick={onResetDemo}
          disabled={!onResetDemo}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Demo
        </Button>

        <Button
          variant="ghost"
          className="gap-2 cursor-default opacity-80"
          disabled
        >
          <FastForward className="h-4 w-4" />
          Auto Live Feed
        </Button>
      </div>

      <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
        PvP games cannot be manually ended by one user. A skip request must be accepted
        by the other player before the engine instantly resolves the final result.
      </p>
    </section>
  );
}

export default GameControls;