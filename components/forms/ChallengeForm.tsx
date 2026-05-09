"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  Lock,
  Radio,
  Shield,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  createChallengeGame,
  getTeamBusyReason,
  getUserFranchises,
  isTeamBusy,
  toPregameHref,
} from "@/lib/gameHub";
import { Team } from "@/lib/types";
import { formatRecord } from "@/lib/utils";

type MatchType = "free" | "paid";
type OpponentType = "public" | "invite" | "ai";
type SimulationMode = "live" | "instant";
type ScheduleMode = "instant" | "scheduled";

function TeamOption({ team, active, busy }: { team: Team; active: boolean; busy: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 ${
        active ? "border-gold/60 bg-gold/10" : "border-navy-border bg-navy-secondary/60"
      }`}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-xs font-black text-white"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
        }}
      >
        {team.abbreviation}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-black uppercase text-white">{team.nickname}</p>
        <p className="text-xs text-text-muted">
          {team.city} · OVR {team.overallRating} ·{" "}
          {formatRecord(team.record.wins, team.record.losses, team.record.ties)}
        </p>
      </div>

      {busy && (
        <Badge variant="danger">
          <Lock className="mr-1 h-3 w-3" />
          Busy
        </Badge>
      )}
    </div>
  );
}

export function ChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("paid");
  const [opponentType, setOpponentType] = useState<OpponentType>("public");
  const [stake, setStake] = useState(50);
  const [predictionsEnabled, setPredictionsEnabled] = useState(true);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("live");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("instant");
  const [scheduledFor, setScheduledFor] = useState("");
  const [createdMessage, setCreatedMessage] = useState("");

  useEffect(() => {
    const franchises = getUserFranchises();
    setTeams(franchises);

    const teamFromUrl = searchParams.get("team");
    const fallback = franchises.find((team) => !isTeamBusy(team.id)) ?? franchises[0];

    setTeamId(teamFromUrl ?? fallback?.id ?? "");
  }, [searchParams]);

  const selectedTeam = teams.find((team) => team.id === teamId);
  const selectedBusy = teamId ? isTeamBusy(teamId) : false;
  const busyReason = teamId ? getTeamBusyReason(teamId) : undefined;

  const pool = matchType === "paid" ? stake * 2 : 0;
  const platformFee = Math.round(pool * 0.05);
  const winnerGets = pool - platformFee;

  const canCreate =
    Boolean(selectedTeam) &&
    !selectedBusy &&
    (scheduleMode === "instant" || Boolean(scheduledFor));

  const createGame = () => {
    if (!canCreate) return;

    const game = createChallengeGame({
      teamId,
      matchType,
      opponentType,
      stake,
      predictionsEnabled,
      simulationMode,
      scheduledFor: scheduleMode === "scheduled" ? scheduledFor : undefined,
    });

    setCreatedMessage(
      opponentType === "ai"
        ? "AI game created. Opening pregame lobby..."
        : "Challenge listed. It now appears in Challenge Hub and Games in Progress."
    );

    window.setTimeout(() => {
      if (opponentType === "ai") {
        router.push(toPregameHref(game));
      } else {
        router.push("/challenge-hub");
      }
    }, 900);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Step 1
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Choose Your Franchise
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Pick one of your existing franchises. Busy franchises cannot be listed again.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
              Franchise Dropdown
            </label>
            <select
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus:border-gold/50"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.city} {team.nickname} — OVR {team.overallRating}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setTeamId(team.id)}
                className="text-left"
              >
                <TeamOption team={team} active={team.id === teamId} busy={isTeamBusy(team.id)} />
              </button>
            ))}
          </div>

          {selectedBusy && (
            <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
              {busyReason}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Step 2
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Match Settings
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Match Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMatchType("free")}
                  className={`rounded-2xl border p-4 text-left ${
                    matchType === "free" ? "border-electric/60 bg-electric/10" : "border-navy-border bg-navy-secondary/60"
                  }`}
                >
                  <Trophy className="mb-2 h-5 w-5 text-electric" />
                  <p className="font-black uppercase text-white">Free</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMatchType("paid")}
                  className={`rounded-2xl border p-4 text-left ${
                    matchType === "paid" ? "border-gold/60 bg-gold/10" : "border-navy-border bg-navy-secondary/60"
                  }`}
                >
                  <Crown className="mb-2 h-5 w-5 text-gold" />
                  <p className="font-black uppercase text-white">Paid</p>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Opponent Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "public", label: "Public", icon: Swords },
                  { value: "invite", label: "Invite", icon: Shield },
                  { value: "ai", label: "AI", icon: Bot },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = opponentType === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setOpponentType(item.value as OpponentType)}
                      className={`rounded-2xl border p-4 text-center ${
                        active ? "border-gold/60 bg-gold/10" : "border-navy-border bg-navy-secondary/60"
                      }`}
                    >
                      <Icon className="mx-auto mb-2 h-5 w-5 text-gold" />
                      <p className="text-sm font-black uppercase text-white">{item.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Simulation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSimulationMode("live")}
                  className={`rounded-2xl border p-4 text-left ${
                    simulationMode === "live" ? "border-danger/60 bg-danger/10" : "border-navy-border bg-navy-secondary/60"
                  }`}
                >
                  <Radio className="mb-2 h-5 w-5 text-danger" />
                  <p className="font-black uppercase text-white">Live</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationMode("instant")}
                  className={`rounded-2xl border p-4 text-left ${
                    simulationMode === "instant" ? "border-electric/60 bg-electric/10" : "border-navy-border bg-navy-secondary/60"
                  }`}
                >
                  <Zap className="mb-2 h-5 w-5 text-electric" />
                  <p className="font-black uppercase text-white">Instant</p>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Schedule
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleMode("instant")}
                  className={`rounded-2xl border p-4 text-left ${
                    scheduleMode === "instant" ? "border-success/60 bg-success/10" : "border-navy-border bg-navy-secondary/60"
                  }`}
                >
                  <Zap className="mb-2 h-5 w-5 text-success" />
                  <p className="font-black uppercase text-white">Instant</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleMode("scheduled")}
                  className={`rounded-2xl border p-4 text-left ${
                    scheduleMode === "scheduled" ? "border-gold/60 bg-gold/10" : "border-navy-border bg-navy-secondary/60"
                  }`}
                >
                  <CalendarClock className="mb-2 h-5 w-5 text-gold" />
                  <p className="font-black uppercase text-white">Scheduled</p>
                </button>
              </div>
            </div>
          </div>

          {scheduleMode === "scheduled" && (
            <div className="mt-5">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Date and Time
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus:border-gold/50"
              />
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
              Stake in MVP Crowns
            </label>

            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={stake}
              disabled={matchType === "free"}
              onChange={(event) => setStake(Number(event.target.value))}
              className="w-full accent-[#F5C542]"
            />

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-bold text-text-muted">
                {matchType === "free" ? "Free match" : "Your stake"}
              </p>
              <p className="text-2xl font-black text-gold">
                {matchType === "free" ? 0 : stake} MVP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPredictionsEnabled((current) => !current)}
            className="mt-5 flex w-full items-center justify-between rounded-2xl border border-navy-border bg-navy-secondary/60 p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-success" />
              <div>
                <p className="font-black uppercase text-white">Enable Predictions</p>
                <p className="text-sm text-text-muted">Allow spectators to predict the winner.</p>
              </div>
            </div>

            <Badge variant={predictionsEnabled ? "success" : "outline"}>
              {predictionsEnabled ? "On" : "Off"}
            </Badge>
          </button>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-gold/30 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_36%),#101F33] p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Preview
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            {selectedTeam ? selectedTeam.nickname : "Select Team"}
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-navy-secondary/70 p-4">
              <p className="text-xs text-text-muted">Match</p>
              <p className="text-xl font-black uppercase text-white">
                {opponentType === "ai" ? "AI" : matchType}
              </p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/70 p-4">
              <p className="text-xs text-text-muted">Mode</p>
              <p className="text-xl font-black uppercase text-white">{simulationMode}</p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/70 p-4">
              <p className="text-xs text-text-muted">Pool</p>
              <p className="text-xl font-black text-gold">
                {matchType === "free" ? 0 : stake * 2} MVP
              </p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/70 p-4">
              <p className="text-xs text-text-muted">Winner Gets</p>
              <p className="text-xl font-black text-success">
                {matchType === "free" ? 0 : winnerGets} MVP
              </p>
            </div>
          </div>

          {scheduleMode === "scheduled" && scheduledFor && (
            <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4">
              <p className="text-xs font-black uppercase text-gold">Scheduled For</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {new Date(scheduledFor).toLocaleString()}
              </p>
            </div>
          )}

          {createdMessage && (
            <div className="mt-4 rounded-2xl border border-success/30 bg-success/10 p-4">
              <p className="flex items-center gap-2 font-black uppercase text-success">
                <CheckCircle2 className="h-5 w-5" />
                {createdMessage}
              </p>
            </div>
          )}

          <Button
            variant="gold"
            className="mt-5 w-full gap-2"
            onClick={createGame}
            disabled={!canCreate}
          >
            <Crown className="h-4 w-4" />
            {opponentType === "ai" ? "Create AI Game" : "Create Challenge"}
          </Button>

          <Link href="/challenge-hub">
            <Button variant="secondary" className="mt-3 w-full gap-2">
              <Swords className="h-4 w-4" />
              Back to Challenge Hub
            </Button>
          </Link>
        </section>
      </aside>
    </div>
  );
}

export default ChallengeForm;