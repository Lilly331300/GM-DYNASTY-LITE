"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  Link2,
  Lock,
  Radio,
  Shield,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChallengeView, createMockInviteLink, getChallengeStatusMeta } from "@/lib/challenges";
import { formatRecord } from "@/lib/utils";

interface ChallengeCardProps {
  view: ChallengeView;
  compact?: boolean;
}

function TeamIdentity({
  abbreviation,
  primaryColor,
  secondaryColor,
}: {
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-sm font-black text-white shadow-inner"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      }}
    >
      {abbreviation}
    </div>
  );
}

export function ChallengeCard({ view, compact = false }: ChallengeCardProps) {
  const { challenge, creatorTeam, opponentTeam, ownerName, isMine, isLocked } = view;
  const [copied, setCopied] = useState(false);

  const status = getChallengeStatusMeta(challenge.status);
  const isPaid = challenge.type === "paid";
  const isAi = challenge.isAiMatch;
  const canAccept = challenge.status === "pending" && !isMine && !isLocked;
  const canEnterPregame = challenge.status === "accepted" || isMine;
  const canWatch = challenge.status === "live";

  const copyInvite = async () => {
    const link = createMockInviteLink(challenge.id);

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      console.log(link);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border bg-navy-card shadow-xl ${status.ringClass}`}
    >
      <div className="relative p-4 md:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_34%)]" />

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status.badgeVariant}>
                {status.pulse && (
                  <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-current" />
                )}
                {status.label}
              </Badge>

              <Badge variant={isPaid ? "gold" : "info"}>
                {isPaid ? (
                  <Crown className="mr-1 h-3 w-3" />
                ) : (
                  <Trophy className="mr-1 h-3 w-3" />
                )}
                {isPaid ? `${challenge.stake} MVP` : "FREE"}
              </Badge>

              <Badge variant={isAi ? "warning" : "outline"}>
                {isAi ? (
                  <Bot className="mr-1 h-3 w-3" />
                ) : (
                  <Swords className="mr-1 h-3 w-3" />
                )}
                {isAi ? "AI" : "PvP"}
              </Badge>

              {challenge.predictionsEnabled && (
                <Badge variant="success">
                  <Eye className="mr-1 h-3 w-3" />
                  Predictions
                </Badge>
              )}
            </div>

            {isMine && (
              <Badge variant="outline">
                <Shield className="mr-1 h-3 w-3" />
                Mine
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <TeamIdentity
                abbreviation={creatorTeam.abbreviation}
                primaryColor={creatorTeam.primaryColor}
                secondaryColor={creatorTeam.secondaryColor}
              />

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                  {creatorTeam.city}
                </p>

                <h3 className="truncate text-2xl font-black uppercase text-white">
                  {creatorTeam.nickname}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-text-muted">
                  <span>@{ownerName}</span>
                  <span>•</span>
                  <span>{formatRecord(creatorTeam.record.wins, creatorTeam.record.losses, creatorTeam.record.ties)}</span>
                  <span>•</span>
                  <span>OVR {creatorTeam.overallRating}</span>
                  <span>•</span>
                  <span>{creatorTeam.division}</span>
                </div>
              </div>
            </div>

            {!compact && (
              <div className="grid grid-cols-3 gap-2 lg:w-[260px]">
                <div className="rounded-xl border border-navy-border bg-navy-secondary/70 p-3 text-center">
                  <p className="text-[10px] font-black uppercase text-text-muted">OFF</p>
                  <p className="text-xl font-black text-white">{creatorTeam.offensiveRating}</p>
                </div>
                <div className="rounded-xl border border-navy-border bg-navy-secondary/70 p-3 text-center">
                  <p className="text-[10px] font-black uppercase text-text-muted">DEF</p>
                  <p className="text-xl font-black text-white">{creatorTeam.defensiveRating}</p>
                </div>
                <div className="rounded-xl border border-navy-border bg-navy-secondary/70 p-3 text-center">
                  <p className="text-[10px] font-black uppercase text-text-muted">ST</p>
                  <p className="text-xl font-black text-white">{creatorTeam.specialTeamsRating}</p>
                </div>
              </div>
            )}
          </div>

          {opponentTeam && (
            <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
                Matched Opponent
              </p>

              <div className="flex items-center gap-3">
                <TeamIdentity
                  abbreviation={opponentTeam.abbreviation}
                  primaryColor={opponentTeam.primaryColor}
                  secondaryColor={opponentTeam.secondaryColor}
                />

                <div>
                  <h4 className="text-lg font-black uppercase text-white">
                    {opponentTeam.nickname}
                  </h4>
                  <p className="text-xs font-semibold text-text-muted">
                    OVR {opponentTeam.overallRating} · {formatRecord(opponentTeam.record.wins, opponentTeam.record.losses, opponentTeam.record.ties)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLocked && (
            <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="font-semibold">
                {view.lockReason ?? "This team is already committed to another match."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 border-t border-navy-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-navy-secondary/60 p-3">
              <p className="text-[10px] font-black uppercase text-text-muted">Pool</p>
              <p className="mt-1 text-lg font-black text-gold">
                {challenge.stake > 0 ? `${challenge.stake * 2} MVP` : "Practice"}
              </p>
            </div>

            <div className="rounded-xl bg-navy-secondary/60 p-3">
              <p className="text-[10px] font-black uppercase text-text-muted">Predictions</p>
              <p className="mt-1 text-lg font-black text-white">
                {challenge.predictionsEnabled ? `${challenge.predictionCount}/${challenge.maxPredictions}` : "Off"}
              </p>
            </div>

            <div className="rounded-xl bg-navy-secondary/60 p-3">
              <p className="text-[10px] font-black uppercase text-text-muted">Mode</p>
              <p className="mt-1 text-lg font-black text-white">
                {isAi ? challenge.aiDifficulty?.toUpperCase() ?? "AI" : "PUBLIC"}
              </p>
            </div>

            <div className="rounded-xl bg-navy-secondary/60 p-3">
              <p className="text-[10px] font-black uppercase text-text-muted">Created</p>
              <p className="mt-1 text-lg font-black text-white">
                {new Date(challenge.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            {canAccept && (
              <Link href="/pregame">
                <Button variant="gold" className="w-full gap-2 sm:w-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  Accept Challenge
                </Button>
              </Link>
            )}

            {canEnterPregame && !canWatch && (
              <Link href="/pregame">
                <Button variant="primary" className="w-full gap-2 sm:w-auto">
                  <Radio className="h-4 w-4" />
                  Enter Pregame
                </Button>
              </Link>
            )}

            {canWatch && (
              <Link href="/live-game">
                <Button variant="danger" className="w-full gap-2 sm:w-auto">
                  <Radio className="h-4 w-4 animate-pulse" />
                  Watch Live
                </Button>
              </Link>
            )}

            {isAi && challenge.status === "pending" && (
              <Link href="/pregame">
                <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                  <Bot className="h-4 w-4" />
                  Play AI
                </Button>
              </Link>
            )}

            <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={copyInvite}>
              {copied ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Invite"}
            </Button>

            <Link href="/games-in-progress">
              <Button variant="ghost" className="w-full gap-2 sm:w-auto">
                <Users className="h-4 w-4" />
                Game Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default ChallengeCard;