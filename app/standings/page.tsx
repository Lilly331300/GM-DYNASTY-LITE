"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  Crown,
  Medal,
  Radio,
  Search,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockTeams } from "@/lib/mockData";
import { calculateWinPercentage, formatRecord } from "@/lib/utils";

type SortKey = "rank" | "wins" | "winPercentage" | "pointsFor" | "crowns";

const standings = mockTeams.map((team, index) => {
  const winPercentage = calculateWinPercentage(
    team.record.wins,
    team.record.losses,
    team.record.ties
  );

  return {
    team,
    rank: index + 1,
    wins: team.record.wins,
    losses: team.record.losses,
    ties: team.record.ties,
    winPercentage,
    pointsFor: 310 + team.offensiveRating * 3 + index * 11,
    pointsAgainst: 280 + (75 - team.defensiveRating) * 3 + index * 7,
    streak: index % 3 === 0 ? "W3" : index % 3 === 1 ? "W1" : "L1",
    crowns: 1200 + team.prestige + team.record.wins * 45,
  };
});

export default function StandingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");

  const sorted = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return [...standings]
      .filter((row) => {
        return (
          !search ||
          row.team.nickname.toLowerCase().includes(search) ||
          row.team.city.toLowerCase().includes(search) ||
          row.team.division.toLowerCase().includes(search) ||
          row.team.conference.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if (sortKey === "rank") return a.rank - b.rank;
        if (sortKey === "wins") return b.wins - a.wins;
        if (sortKey === "winPercentage") return b.winPercentage - a.winPercentage;
        if (sortKey === "pointsFor") return b.pointsFor - a.pointsFor;
        return b.crowns - a.crowns;
      });
  }, [searchTerm, sortKey]);

  const topTeam = sorted[0];

  return (
    <AppShell>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_36%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="gold">
                  <Trophy className="mr-1 h-3 w-3" />
                  League Table
                </Badge>

                <Badge variant="success">
                  <Medal className="mr-1 h-3 w-3" />
                  Ranked Standings
                </Badge>

                <Badge variant="info">
                  <Crown className="mr-1 h-3 w-3" />
                  MVP Crowns
                </Badge>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Standings
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium text-text-muted md:text-base">
                Sort teams by record, win percentage, scoring output, and MVP
                Crowns earned across the platform.
              </p>
            </div>

            {topTeam && (
              <div className="rounded-3xl border border-gold/30 bg-gold/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                  Current Leader
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase text-white">
                  {topTeam.team.nickname}
                </h2>
                <p className="text-sm font-semibold text-text-muted">
                  {topTeam.team.city} · {formatRecord(topTeam.wins, topTeam.losses, topTeam.ties)}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <section className="rounded-2xl border border-navy-border bg-navy-card p-4 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search teams, divisions, conferences..."
                className="w-full rounded-xl border border-navy-border bg-navy-secondary px-10 py-3 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "rank", label: "Rank" },
                { key: "wins", label: "Wins" },
                { key: "winPercentage", label: "Win %" },
                { key: "pointsFor", label: "PF" },
                { key: "crowns", label: "Crowns" },
              ].map((item) => {
                const active = sortKey === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSortKey(item.key as SortKey)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black uppercase transition ${
                      active
                        ? "border-gold/60 bg-gold/15 text-gold"
                        : "border-navy-border bg-navy-secondary text-text-muted hover:border-gold/30 hover:text-white"
                    }`}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-navy-border bg-navy-card shadow-xl">
          <div className="hidden grid-cols-[70px_1.6fr_120px_110px_110px_110px_130px_140px] gap-3 border-b border-navy-border bg-navy-secondary/80 px-5 py-4 text-xs font-black uppercase tracking-widest text-text-muted xl:grid">
            <span>Rank</span>
            <span>Team</span>
            <span>Record</span>
            <span>Win %</span>
            <span>PF</span>
            <span>PA</span>
            <span>Streak</span>
            <span>MVPC</span>
          </div>

          <div className="divide-y divide-navy-border">
            {sorted.map((row, index) => (
              <motion.div
                key={row.team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-1 gap-4 px-5 py-5 xl:grid-cols-[70px_1.6fr_120px_110px_110px_110px_130px_140px] xl:items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${
                      index === 0
                        ? "bg-gold text-navy-primary"
                        : "bg-navy-secondary text-white"
                    }`}
                  >
                    #{index + 1}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-sm font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, ${row.team.primaryColor}, ${row.team.secondaryColor})`,
                    }}
                  >
                    {row.team.abbreviation}
                  </div>

                  <div>
                    <h2 className="text-xl font-black uppercase text-white">
                      {row.team.nickname}
                    </h2>
                    <p className="text-xs font-semibold text-text-muted">
                      {row.team.city} · {row.team.division} · OVR {row.team.overallRating}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-text-muted xl:hidden">Record</p>
                  <p className="text-lg font-black text-white">
                    {formatRecord(row.wins, row.losses, row.ties)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-text-muted xl:hidden">Win %</p>
                  <p className="text-lg font-black text-white">
                    {(row.winPercentage * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-text-muted xl:hidden">PF</p>
                  <p className="text-lg font-black text-white">{row.pointsFor}</p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-text-muted xl:hidden">PA</p>
                  <p className="text-lg font-black text-white">{row.pointsAgainst}</p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-text-muted xl:hidden">Streak</p>
                  <Badge variant={row.streak.startsWith("W") ? "success" : "danger"}>
                    {row.streak}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-text-muted xl:hidden">MVPC</p>
                  <p className="flex items-center gap-2 text-lg font-black text-gold">
                    <Crown className="h-4 w-4" />
                    {row.crowns.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/games-in-progress">
            <Button variant="secondary" className="gap-2">
              <Radio className="h-4 w-4" />
              Games in Progress
            </Button>
          </Link>

          <Link href="/game-history">
            <Button variant="gold" className="gap-2">
              <Users className="h-4 w-4" />
              Game History
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}