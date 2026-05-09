"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Crown,
  Gamepad2,
  Plus,
  Radio,
  Shield,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  StoredFranchiseTeam,
  getNflSyncSummary,
  getTeamBusyReason,
  getUserFranchises,
  isTeamBusy,
} from "@/lib/gameHub";
import { formatRecord } from "@/lib/utils";

function FranchiseCard({ team }: { team: StoredFranchiseTeam }) {
  const busy = isTeamBusy(team.id);
  const busyReason = getTeamBusyReason(team.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 text-lg font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
            }}
          >
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="h-full w-full rounded-3xl object-cover" />
            ) : (
              team.abbreviation
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              {team.city}
            </p>

            <h2 className="truncate text-2xl font-black uppercase text-white">
              {team.nickname}
            </h2>

            <p className="text-sm font-semibold text-text-muted">
              {formatRecord(team.record.wins, team.record.losses, team.record.ties)} · OVR{" "}
              {team.overallRating} · {team.division}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {team.nflSync.enabled && (
                <Badge variant="success">
                  <Shield className="mr-1 h-3 w-3" />
                  Synced: {team.nflSync.nflTeam}
                </Badge>
              )}

              {busy ? (
                <Badge variant="danger">
                  <Radio className="mr-1 h-3 w-3" />
                  Busy
                </Badge>
              ) : (
                <Badge variant="info">Available</Badge>
              )}
            </div>
          </div>
        </div>

        <Badge variant="gold">
          <Crown className="mr-1 h-3 w-3" />
          {team.prestige}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <p className="text-xs font-black text-text-muted">OFF</p>
          <p className="text-2xl font-black text-white">{team.offensiveRating}</p>
        </div>
        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <p className="text-xs font-black text-text-muted">DEF</p>
          <p className="text-2xl font-black text-white">{team.defensiveRating}</p>
        </div>
        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <p className="text-xs font-black text-text-muted">ST</p>
          <p className="text-2xl font-black text-white">{team.specialTeamsRating}</p>
        </div>
      </div>

      {busyReason && (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">
          {busyReason}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href={`/teams/${team.id}`}>
          <Button variant="secondary" className="w-full gap-2">
            <Shield className="h-4 w-4" />
            Details
          </Button>
        </Link>

        <Link href={`/create-challenge?team=${team.id}`}>
          <Button variant="gold" className="w-full gap-2" disabled={busy}>
            <Swords className="h-4 w-4" />
            Create Challenge
          </Button>
        </Link>

        <Link href={`/challenge-hub?team=${team.id}`}>
          <Button variant="primary" className="w-full gap-2" disabled={busy}>
            <Bot className="h-4 w-4" />
            Play AI
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);

  useEffect(() => {
    setTeams(getUserFranchises());
  }, []);

  const synced = useMemo(() => getNflSyncSummary(), [teams]);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_36%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="gold">
                  <Trophy className="mr-1 h-3 w-3" />
                  My Franchises
                </Badge>
                <Badge variant="info">
                  <Users className="mr-1 h-3 w-3" />
                  {teams.length} Owned
                </Badge>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                My Franchises
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium text-text-muted md:text-base">
                Only franchises you own are shown here. Create as many franchises
                as you want, then use each one for challenges or AI games.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/challenge-hub">
                <Button variant="secondary" className="gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Challenge Hub
                </Button>
              </Link>

              <Link href="/team-create">
                <Button variant="gold" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Franchise
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {synced.length > 0 && (
          <section className="rounded-3xl border border-gold/30 bg-gold/10 p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-gold">
              NFL City Sync
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {synced.map((item) => (
                <div key={item.team.id} className="rounded-2xl border border-navy-border bg-navy-card p-4">
                  <p className="text-lg font-black uppercase text-white">{item.city}</p>
                  <p className="text-sm text-text-muted">{item.nflTeam}</p>
                  <p className={`mt-2 text-2xl font-black ${item.points >= 0 ? "text-success" : "text-danger"}`}>
                    {item.points >= 0 ? "+" : ""}
                    {item.points} pts
                  </p>
                  <p className="text-xs text-text-muted">{item.note}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {teams.map((team) => (
            <FranchiseCard key={team.id} team={team} />
          ))}
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 text-center shadow-xl">
          <Zap className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-3 text-2xl font-black uppercase text-white">
            Ready to play?
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Select one of your franchises and either create a challenge or play
            computer teams instantly.
          </p>

          <Link href="/challenge-hub">
            <Button variant="gold" className="mt-5 gap-2">
              <Bot className="h-4 w-4" />
              Play AI Teams
            </Button>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}