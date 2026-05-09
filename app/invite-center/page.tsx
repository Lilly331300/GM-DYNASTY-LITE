"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Crown,
  Link2,
  Mail,
  MessageCircle,
  Plus,
  Radio,
  Send,
  Share2,
  Shield,
  Swords,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockTeams } from "@/lib/mockData";
import { formatRecord } from "@/lib/utils";

const onlineCoaches = [
  {
    id: "coach_001",
    name: "Coach Ray",
    team: mockTeams[1],
    status: "Ready",
    mode: "PvP",
  },
  {
    id: "coach_002",
    name: "Gridiron Queen",
    team: mockTeams[2],
    status: "Scouting",
    mode: "Free",
  },
  {
    id: "coach_003",
    name: "Barry GM",
    team: mockTeams[3],
    status: "Ready",
    mode: "Paid",
  },
  {
    id: "coach_004",
    name: "North Star",
    team: mockTeams[4],
    status: "Online",
    mode: "AI Practice",
  },
];

const sentInvites = [
  {
    id: "invite_001",
    to: "Coach Ray",
    match: "50 MVP Paid Challenge",
    status: "Pending",
    time: "2 mins ago",
  },
  {
    id: "invite_002",
    to: "Gridiron Queen",
    match: "Free Scrimmage",
    status: "Accepted",
    time: "12 mins ago",
  },
  {
    id: "invite_003",
    to: "Barry GM",
    match: "100 MVP Rivalry",
    status: "Expired",
    time: "Yesterday",
  },
];

function statusBadge(status: string) {
  if (status === "Accepted") return "success" as const;
  if (status === "Pending") return "warning" as const;
  return "outline" as const;
}

export default function InviteCenterPage() {
  const [copied, setCopied] = useState(false);
  const [selectedStake, setSelectedStake] = useState(50);
  const [inviteMessage, setInviteMessage] = useState(
    "You’ve been invited to a GM Dynasty Lite matchup. Accept the challenge and enter the pregame lobby."
  );

  const inviteLink =
    typeof window === "undefined"
      ? "/pregame?invite=demo"
      : `${window.location.origin}/pregame?invite=demo`;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      console.log(inviteLink);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

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
                  <Share2 className="mr-1 h-3 w-3" />
                  Invite Center
                </Badge>

                <Badge variant="success">
                  <Users className="mr-1 h-3 w-3" />
                  Coaches Online
                </Badge>

                <Badge variant="info">
                  <Radio className="mr-1 h-3 w-3" />
                  Pregame Links
                </Badge>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Invite Center
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium text-text-muted md:text-base">
                Generate challenge links, invite online coaches, share spectator
                links, and send players directly into the pregame lobby.
              </p>
            </div>

            <Link href="/create-challenge">
              <Button variant="gold" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Challenge
              </Button>
            </Link>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                  Generate Link
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  Challenge Invite
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Create a private link that sends another coach to the pregame lobby.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Match Type
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="gold">
                      <Crown className="mr-1 h-3 w-3" />
                      Paid
                    </Badge>
                    <Badge variant="danger">
                      <Radio className="mr-1 h-3 w-3" />
                      Live
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Stake
                  </p>
                  <input
                    type="range"
                    min={10}
                    max={250}
                    step={5}
                    value={selectedStake}
                    onChange={(event) => setSelectedStake(Number(event.target.value))}
                    className="mt-4 w-full accent-[#F5C542]"
                  />
                  <p className="mt-2 text-2xl font-black text-gold">
                    {selectedStake} MVP
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Pool
                  </p>
                  <p className="mt-4 text-3xl font-black text-white">
                    {selectedStake * 2} MVP
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Winner receives {selectedStake * 2 - Math.round(selectedStake * 2 * 0.05)} MVP
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                  Invite Message
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(event) => setInviteMessage(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus:border-gold/50"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-4">
                <p className="mb-2 text-xs font-black uppercase text-gold">
                  Generated Link
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 truncate rounded-xl border border-navy-border bg-navy-primary px-4 py-3 text-sm font-semibold text-text-muted">
                    {inviteLink}
                  </div>

                  <Button variant="gold" className="gap-2" onClick={copyInvite}>
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                  Online Coaches
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  Send Instant Invite
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {onlineCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-sm font-black text-white"
                        style={{
                          background: `linear-gradient(135deg, ${coach.team.primaryColor}, ${coach.team.secondaryColor})`,
                        }}
                      >
                        {coach.team.abbreviation}
                      </div>

                      <div className="min-w-0">
                        <p className="font-black uppercase text-white">{coach.name}</p>
                        <p className="text-xs font-semibold text-text-muted">
                          {coach.team.nickname} · OVR {coach.team.overallRating} ·{" "}
                          {formatRecord(
                            coach.team.record.wins,
                            coach.team.record.losses,
                            coach.team.record.ties
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Badge variant={coach.status === "Ready" ? "success" : "info"}>
                        {coach.status}
                      </Badge>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                        onClick={() => alert(`Invite sent to ${coach.name}.`)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Invite
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-gold/30 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_36%),#101F33] p-5 shadow-xl">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-gold">
                Share Options
              </p>

              <div className="space-y-3">
                <Button variant="gold" className="w-full gap-2" onClick={copyInvite}>
                  <Link2 className="h-4 w-4" />
                  Copy Pregame Link
                </Button>

                <Button variant="secondary" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Email Invite
                </Button>

                <Button variant="secondary" className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Share to Chat
                </Button>
              </div>
            </section>

            <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-text-muted">
                Sent Invites
              </p>

              <div className="space-y-3">
                {sentInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-black uppercase text-white">{invite.to}</p>
                      <Badge variant={statusBadge(invite.status)}>
                        {invite.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-text-muted">{invite.match}</p>
                    <p className="mt-1 text-xs text-text-muted">{invite.time}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-text-muted">
                Invite Rules
              </p>

              <div className="space-y-3 text-sm text-text-muted">
                <div className="flex gap-2">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <p>Only eligible teams can enter a new challenge.</p>
                </div>

                <div className="flex gap-2">
                  <Swords className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <p>Accepted invites move both coaches into pregame.</p>
                </div>

                <div className="flex gap-2">
                  <Radio className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <p>Live games start after countdown or readiness lock.</p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}