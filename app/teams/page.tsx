"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Crown,
  Gamepad2,
  Plus,
  Radio,
  Search,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import {
  StoredFranchiseTeam,
  getNflSyncSummary,
  getTeamBusyReason,
  getUserFranchises,
  isTeamBusy,
} from "@/lib/gameHub";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  getTeamPrimaryColor,
  getTeamSecondaryColor,
  teamVisualAssets,
} from "@/lib/teamVisuals";
import {
  calculateWinPercentage,
  cn,
  formatNumber,
  formatRecord,
  getRatingColor,
} from "@/lib/utils";

const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";
const TEAM_GAME_PLANS_V2_KEY = "gmdl_team_game_plans_v2";
const TEAM_DEPTH_CHARTS_V2_KEY = "gmdl_team_depth_charts_v2";

type TeamSetupStatus = {
  hasGamePlan: boolean;
  hasDepthChart: boolean;
};

type TeamFilter = "all" | "available" | "busy" | "synced";

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteString(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log(`Unable to save ${key}`);
  }
}

function getPrimaryFranchiseId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(PRIMARY_FRANCHISE_KEY) ?? undefined;
}

function getSetupStatus(teamId: string): TeamSetupStatus {
  const gamePlans = safeReadJson<Record<string, unknown>>(
    TEAM_GAME_PLANS_V2_KEY,
    {}
  );

  const depthCharts = safeReadJson<Record<string, unknown>>(
    TEAM_DEPTH_CHARTS_V2_KEY,
    {}
  );

  return {
    hasGamePlan: Boolean(gamePlans[teamId]),
    hasDepthChart: Boolean(depthCharts[teamId]),
  };
}

function getPlayerOverall(player: any) {
  return Number(player.overall ?? player.overallRating ?? 60);
}

function getBestPlayers(team: StoredFranchiseTeam) {
  return [...(team.players ?? [])]
    .sort((a: any, b: any) => getPlayerOverall(b) - getPlayerOverall(a))
    .slice(0, 3);
}

function getPlayerSpecialSkill(player: unknown) {
  const anyPlayer = player as {
    specialSkill?: string;
    trait?: string;
    developmentTrait?: string;
    ability?: string;
  };

  return (
    anyPlayer.specialSkill ??
    anyPlayer.trait ??
    anyPlayer.developmentTrait ??
    anyPlayer.ability ??
    "Core Player"
  );
}

function getTeamTier(rating: number) {
  if (rating >= 90) return "Elite";
  if (rating >= 80) return "Contender";
  if (rating >= 70) return "Competitive";
  if (rating >= 60) return "Developing";
  return "Expansion";
}

function getWinPctLabel(team: StoredFranchiseTeam) {
  const pct = calculateWinPercentage(
    team.record.wins,
    team.record.losses,
    team.record.ties
  );

  return `${Math.round(pct * 100)}%`;
}

function AssetImage({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-gold/20 bg-navy-secondary text-xs font-black uppercase tracking-widest text-gold/70",
          fallbackClassName,
          className
        )}
      >
        —
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "gold" | "success" | "danger" | "info";
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-secondary/60 p-3">
      <p className="truncate text-[11px] font-black uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <p
        className={cn(
          "mt-1 truncate text-xl font-black text-white",
          tone === "gold" && "text-gold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
          tone === "info" && "text-electric"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "gold" | "success" | "danger" | "info";
}) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "danger"
        ? "border-danger/20 bg-danger/10 text-danger"
        : tone === "info"
          ? "border-electric/20 bg-electric/10 text-electric"
          : "border-gold/20 bg-gold/10 text-gold";

  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt={`${label} glow`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        fallbackClassName="hidden"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">
            {label}
          </p>
          <p className="mt-2 truncate text-4xl font-black tabular-nums text-white">
            {value}
          </p>
        </div>

        <div className={cn("rounded-2xl border p-3", toneClass)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function SetupItem({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition",
        active
          ? "border-success/25 bg-success/10 hover:border-success/40"
          : "border-gold/25 bg-gold/10 hover:border-gold/45"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {active ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
        )}

        <span className="truncate text-xs font-black uppercase tracking-wide text-white">
          {label}
        </span>
      </div>

      <span
        className={cn(
          "shrink-0 text-[10px] font-black uppercase tracking-widest",
          active ? "text-success" : "text-gold"
        )}
      >
        {active ? "Saved" : "Setup"}
      </span>
    </Link>
  );
}

function DisabledActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button variant="secondary" className="w-full gap-2" disabled>
      {icon}
      {label}
    </Button>
  );
}

function FranchiseCardPoster({
  team,
}: {
  team: StoredFranchiseTeam;
}) {
  const cardBg = getTeamCardSrc(team);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-gold/25 bg-navy-primary shadow-2xl">
      <AssetImage
        src={cardBg}
        alt={`${getTeamDisplayName(team)} card background`}
        className="absolute inset-0 h-full w-full object-cover"
        fallbackClassName="h-full w-full"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_26%),linear-gradient(180deg,rgba(11,26,42,0.12),rgba(11,26,42,0.50)_58%,rgba(0,0,0,0.86))]" />

      <div className="absolute left-4 right-4 top-5 text-center">
        <h3 className="break-words text-3xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] md:text-4xl">
          {team.city}
        </h3>
      </div>

      <div className="absolute inset-x-0 top-[22%] flex justify-center">
        <TeamHelmetVisual team={team} size="card" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gold/25 bg-black/75 px-4 py-5 text-center backdrop-blur">
        <p className="break-words text-2xl font-black uppercase tracking-[0.12em] text-white md:text-3xl">
          {team.nickname}
        </p>

        <div className="mx-auto mt-4 flex h-16 w-24 items-center justify-center rounded-t-[1.5rem] border border-gold/40 bg-gold text-3xl font-black text-navy-primary shadow-[0_0_32px_rgba(245,197,66,0.28)]">
          {team.overallRating}
        </div>
      </div>
    </div>
  );
}

function FranchiseIdentityHeader({
  team,
  isPrimary,
}: {
  team: StoredFranchiseTeam;
  isPrimary: boolean;
}) {
  return (
    <div className="flex min-w-0 gap-4">
      <div className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-visible rounded-3xl border border-white/15 bg-navy-primary/60 shadow-xl">
        <TeamHelmetVisual team={team} size="md" />
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {isPrimary && (
            <Badge variant="gold">
              <Star className="mr-1 h-3 w-3" />
              Primary
            </Badge>
          )}

          <Badge variant={isTeamBusy(team.id) ? "danger" : "success"}>
            {isTeamBusy(team.id) ? (
              <Radio className="mr-1 h-3 w-3" />
            ) : (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            )}
            {isTeamBusy(team.id) ? "Busy" : "Available"}
          </Badge>

          <Badge variant="info">{getTeamTier(team.overallRating)}</Badge>

          <Badge variant="gold">{getTeamInitials(team)}</Badge>
        </div>

        <p className="truncate text-xs font-black uppercase tracking-[0.28em] text-text-muted">
          {team.city}
        </p>

        <h2 className="mt-1 break-words text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
          {team.nickname}
        </h2>

        <p className="mt-1 break-words text-sm font-semibold text-text-muted">
          {formatRecord(team.record.wins, team.record.losses, team.record.ties)}{" "}
          Record · {team.division} · {team.conference}
        </p>
      </div>
    </div>
  );
}

function FranchiseCard({
  team,
  isPrimary,
  onMakePrimary,
}: {
  team: StoredFranchiseTeam;
  isPrimary: boolean;
  onMakePrimary: (teamId: string) => void;
}) {
  const busy = isTeamBusy(team.id);
  const busyReason = getTeamBusyReason(team.id);
  const setup = getSetupStatus(team.id);
  const bestPlayers = getBestPlayers(team);
  const rosterCount = team.players?.length ?? 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group min-w-0 overflow-hidden rounded-[2rem] border bg-navy-card shadow-2xl transition",
        isPrimary
          ? "border-gold/40 shadow-gold/10"
          : "border-navy-border hover:border-gold/25"
      )}
    >
      <div className="relative overflow-hidden p-5 md:p-6">
        <AssetImage
          src={getTeamCardSrc(team)}
          alt={`${getTeamDisplayName(team)} background`}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
          fallbackClassName="hidden"
        />

        <div
          className="absolute inset-0 opacity-24"
          style={{
            background: `radial-gradient(circle at top right, ${getTeamPrimaryColor(
              team
            )}, transparent 34%)`,
          }}
        />

        <div className="absolute bottom-[-120px] left-[20%] h-72 w-72 rounded-full bg-electric/5 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0">
            <FranchiseCardPoster team={team} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <FranchiseIdentityHeader team={team} isPrimary={isPrimary} />

              <div className="flex shrink-0 flex-wrap gap-2">
                {!isPrimary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => onMakePrimary(team.id)}
                  >
                    <Star className="h-4 w-4" />
                    Make Primary
                  </Button>
                )}

                <Link href={`/teams/${team.id}`}>
                  <Button variant="gold" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Open Team
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatPill label="Overall" value={team.overallRating} tone="gold" />
              <StatPill label="Offense" value={team.offensiveRating} />
              <StatPill label="Defense" value={team.defensiveRating} />
              <StatPill label="Special" value={team.specialTeamsRating} />
              <StatPill label="Win Rate" value={getWinPctLabel(team)} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div
                className="rounded-2xl border border-navy-border bg-navy-secondary/55 p-3"
                style={{
                  borderColor: `${getTeamPrimaryColor(team)}55`,
                }}
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">
                  Primary Color
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ backgroundColor: getTeamPrimaryColor(team) }}
                  />
                  <p className="truncate text-sm font-black text-white">
                    {getTeamPrimaryColor(team)}
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl border border-navy-border bg-navy-secondary/55 p-3"
                style={{
                  borderColor: `${getTeamSecondaryColor(team)}55`,
                }}
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">
                  Accent Color
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ backgroundColor: getTeamSecondaryColor(team) }}
                  />
                  <p className="truncate text-sm font-black text-white">
                    {getTeamSecondaryColor(team)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gold/20 bg-gold/10 p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-gold">
                  Identity
                </p>
                <p className="mt-2 truncate text-sm font-black uppercase text-white">
                  {"visualIdentity" in team && (team as any).visualIdentity
                    ? "Custom Builder"
                    : "Default Team"}
                </p>
              </div>
            </div>

            {busyReason && (
              <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">
                {busyReason}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                      Roster Preview
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatNumber(rosterCount)} players available
                    </p>
                  </div>

                  <Link href={`/roster?team=${team.id}`}>
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Users className="h-4 w-4" />
                      Roster
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {bestPlayers.length > 0 ? (
                    bestPlayers.map((player: any) => (
                      <div
                        key={player.id}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-navy-border bg-navy-primary/70 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white">
                            {player.name}
                          </p>
                          <p className="text-xs font-semibold text-text-muted">
                            {player.position} · {getPlayerSpecialSkill(player)}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "shrink-0 rounded-xl border border-navy-border bg-navy-card px-3 py-1 text-sm font-black",
                            getRatingColor(getPlayerOverall(player))
                          )}
                        >
                          {getPlayerOverall(player)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-navy-border bg-navy-primary/50 p-4 text-sm text-text-muted">
                      No roster loaded yet. Open the team page to generate or
                      review players.
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/40 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                  Coaching Setup
                </p>

                <div className="space-y-2">
                  <SetupItem
                    label="Game Plan"
                    active={setup.hasGamePlan}
                    href={`/game-plan?team=${team.id}`}
                  />

                  <SetupItem
                    label="Depth Chart"
                    active={setup.hasDepthChart}
                    href={`/depth-chart?team=${team.id}`}
                  />

                  <Link
                    href={`/scouting?team=${team.id}`}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-electric/25 bg-electric/10 px-3 py-2.5 transition hover:border-electric/45"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Search className="h-4 w-4 shrink-0 text-electric" />
                      <span className="truncate text-xs font-black uppercase tracking-wide text-white">
                        Scouting
                      </span>
                    </div>

                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-electric">
                      Review
                    </span>
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  {busy ? (
                    <DisabledActionButton
                      icon={<Swords className="h-4 w-4" />}
                      label="Create Challenge"
                    />
                  ) : (
                    <Link href={`/create-challenge?team=${team.id}`}>
                      <Button variant="gold" className="w-full gap-2">
                        <Swords className="h-4 w-4" />
                        Create Challenge
                      </Button>
                    </Link>
                  )}

                  {busy ? (
                    <DisabledActionButton
                      icon={<Bot className="h-4 w-4" />}
                      label="Play AI"
                    />
                  ) : (
                    <Link href={`/challenge-hub?team=${team.id}`}>
                      <Button variant="primary" className="w-full gap-2">
                        <Bot className="h-4 w-4" />
                        Play AI / Find Match
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PrimaryFranchiseHero({
  team,
}: {
  team: StoredFranchiseTeam;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-gold/35 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_32%),linear-gradient(135deg,rgba(245,197,66,0.08),rgba(22,40,58,0.72))] p-5 shadow-2xl md:p-6">
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} hero card`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
        fallbackClassName="hidden"
      />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at top left, ${getTeamPrimaryColor(
            team
          )}, transparent 34%)`,
        }}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-24 w-32 shrink-0 items-center justify-center rounded-[2rem] border border-gold/20 bg-navy-primary/60 shadow-2xl">
            <TeamHelmetVisual team={team} size="lg" />
          </div>

          <div className="min-w-0">
            <Badge variant="gold">
              <Star className="mr-1 h-3 w-3" />
              Primary Franchise
            </Badge>

            <h2 className="mt-3 break-words text-2xl font-black uppercase text-white md:text-4xl">
              {getTeamDisplayName(team)}
            </h2>

            <p className="mt-1 break-words text-sm font-semibold text-text-muted">
              OVR {team.overallRating} ·{" "}
              {formatRecord(
                team.record.wins,
                team.record.losses,
                team.record.ties
              )}{" "}
              · {team.division}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[520px]">
          <Link href={`/game-plan?team=${team.id}`}>
            <Button variant="secondary" className="w-full gap-2">
              <ClipboardList className="h-4 w-4" />
              Game Plan
            </Button>
          </Link>

          <Link href={`/create-challenge?team=${team.id}`}>
            <Button
              variant="gold"
              className="w-full gap-2"
              disabled={isTeamBusy(team.id)}
            >
              <Swords className="h-4 w-4" />
              Challenge
            </Button>
          </Link>

          <Link href={`/challenge-hub?team=${team.id}`}>
            <Button
              variant="primary"
              className="w-full gap-2"
              disabled={isTeamBusy(team.id)}
            >
              <Bot className="h-4 w-4" />
              Play AI
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [primaryId, setPrimaryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TeamFilter>("all");

  const refreshTeams = () => {
    const userTeams = getUserFranchises();
    const savedPrimary = getPrimaryFranchiseId();
    const primaryStillExists = userTeams.some(
      (team) => team.id === savedPrimary
    );
    const nextPrimaryId = primaryStillExists ? savedPrimary : userTeams[0]?.id;

    if (!savedPrimary && nextPrimaryId) {
      safeWriteString(PRIMARY_FRANCHISE_KEY, nextPrimaryId);
    }

    setTeams(userTeams);
    setPrimaryId(nextPrimaryId);
  };

  useEffect(() => {
    refreshTeams();

    const handleRefresh = () => refreshTeams();

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("gmdl-storage-change", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("gmdl-storage-change", handleRefresh);
    };
  }, []);

  const primaryTeam = useMemo(() => {
    return teams.find((team) => team.id === primaryId) ?? teams[0];
  }, [teams, primaryId]);

  const synced = useMemo(() => getNflSyncSummary(), [teams]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const name = getTeamDisplayName(team);

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        team.city?.toLowerCase().includes(query) ||
        team.nickname?.toLowerCase().includes(query) ||
        team.abbreviation?.toLowerCase().includes(query);

      const busy = isTeamBusy(team.id);

      const matchesFilter =
        filter === "all" ||
        (filter === "available" && !busy) ||
        (filter === "busy" && busy) ||
        (filter === "synced" && Boolean(team.nflSync?.enabled));

      return matchesSearch && matchesFilter;
    });
  }, [teams, search, filter]);

  const availableCount = teams.filter((team) => !isTeamBusy(team.id)).length;
  const busyCount = teams.length - availableCount;
  const syncedCount = teams.filter((team) => team.nflSync?.enabled).length;
  const totalPrestige = teams.reduce(
    (sum, team) => sum + (team.prestige ?? 0),
    0
  );

  const makePrimary = (teamId: string) => {
    safeWriteString(PRIMARY_FRANCHISE_KEY, teamId);
    setPrimaryId(teamId);
  };

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_50%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Franchise command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-32"
            fallbackClassName="hidden"
          />

          {primaryTeam ? (
            <div className="pointer-events-none absolute bottom-[-38px] right-8 hidden opacity-20 xl:block">
              <TeamHelmetVisual team={primaryTeam} size="card" />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.74),rgba(11,26,42,0.94))]" />
          <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[20%] h-72 w-72 rounded-full bg-electric/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="gold">
                  <Trophy className="mr-1 h-3 w-3" />
                  Franchise Control
                </Badge>

                <Badge variant="info">
                  <Users className="mr-1 h-3 w-3" />
                  {teams.length} Owned
                </Badge>

                <Badge variant={availableCount > 0 ? "success" : "gold"}>
                  <Radio className="mr-1 h-3 w-3" />
                  {availableCount} Available
                </Badge>

                <Badge variant="gold">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Custom Identity Ready
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                My Franchises
              </h1>

              <p className="mt-3 max-w-3xl break-words text-sm font-medium leading-6 text-text-muted md:text-base">
                Manage your owned franchises, set a primary team, review roster
                strength, prepare game plans, build depth charts, create challenges,
                or jump into AI matchups from one premium control page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <Link href="/team-create">
                <Button variant="gold" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Create Franchise
                </Button>
              </Link>

              <Link href="/challenge-hub">
                <Button variant="secondary" className="w-full gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Challenge Hub
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard
            label="Owned Teams"
            value={teams.length}
            icon={Shield}
            tone="gold"
          />
          <MetricCard
            label="Available"
            value={availableCount}
            icon={CheckCircle2}
            tone="success"
          />
          <MetricCard
            label="Busy Teams"
            value={busyCount}
            icon={Radio}
            tone={busyCount > 0 ? "danger" : "info"}
          />
          <MetricCard
            label="Prestige"
            value={formatNumber(totalPrestige)}
            icon={Crown}
            tone="gold"
          />
        </section>

        {primaryTeam && <PrimaryFranchiseHero team={primaryTeam} />}

        {synced.length > 0 && (
          <section className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gold/10 p-5 shadow-xl md:p-6">
            <AssetImage
              src={teamVisualAssets.backgrounds.stadiumFlare}
              alt="NFL sync glow"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    NFL City Sync
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-white">
                    Real-World Impact Tracker
                  </h2>
                </div>

                <Badge variant="gold">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {syncedCount} Synced
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {synced.map((item) => (
                  <div
                    key={item.team.id}
                    className="min-w-0 rounded-3xl border border-navy-border bg-navy-card p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black uppercase text-white">
                          {item.city}
                        </p>
                        <p className="truncate text-sm text-text-muted">
                          {item.nflTeam}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "shrink-0 rounded-2xl border px-3 py-2 text-xl font-black",
                          item.points >= 0
                            ? "border-success/25 bg-success/10 text-success"
                            : "border-danger/25 bg-danger/10 text-danger"
                        )}
                      >
                        {item.points >= 0 ? "+" : ""}
                        {item.points}
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-text-muted">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[2rem] border border-navy-border bg-navy-card p-4 shadow-xl md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by city, nickname, abbreviation..."
                className="w-full rounded-2xl border border-navy-border bg-navy-secondary py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-text-muted focus:border-gold/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              {[
                { id: "all", label: "All" },
                { id: "available", label: "Available" },
                { id: "busy", label: "Busy" },
                { id: "synced", label: "Synced" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id as TeamFilter)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wide transition",
                    filter === item.id
                      ? "border-gold/40 bg-gold/15 text-gold"
                      : "border-navy-border bg-navy-secondary text-text-muted hover:border-gold/30 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {filteredTeams.length > 0 ? (
          <section className="grid grid-cols-1 gap-5">
            {filteredTeams.map((team) => (
              <FranchiseCard
                key={team.id}
                team={team}
                isPrimary={team.id === primaryTeam?.id}
                onMakePrimary={makePrimary}
              />
            ))}
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-[2rem] border border-dashed border-navy-border bg-navy-card p-8 text-center shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.field}
              alt="Empty franchise field"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <Shield className="mx-auto h-10 w-10 text-gold" />

              <h2 className="mt-4 text-2xl font-black uppercase text-white">
                No franchise found
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
                Try a different search/filter, or create a new franchise if your
                team room is empty.
              </p>

              <Link href="/team-create">
                <Button variant="gold" className="mt-5 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Franchise
                </Button>
              </Link>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.stadiumFlare}
              alt="AI game glow"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <Zap className="h-8 w-8 text-gold" />
              <h3 className="mt-4 text-xl font-black uppercase text-white">
                Quick AI Game
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Use an available franchise and test your strategy against AI teams
                from the Challenge Hub.
              </p>

              <Link href="/challenge-hub">
                <Button variant="gold" className="mt-5 w-full gap-2">
                  <Bot className="h-4 w-4" />
                  Play AI Teams
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.field}
              alt="Challenge field"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <CalendarClock className="h-8 w-8 text-electric" />
              <h3 className="mt-4 text-xl font-black uppercase text-white">
                Public Challenge
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                List an available franchise for a free or paid matchup. The game
                only starts after another user accepts.
              </p>

              <Link href="/create-challenge">
                <Button variant="secondary" className="mt-5 w-full gap-2">
                  <Swords className="h-4 w-4" />
                  Create Challenge
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.stadiumFlare}
              alt="Crowns glow"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <Crown className="h-8 w-8 text-gold" />
              <h3 className="mt-4 text-xl font-black uppercase text-white">
                Crown Economy
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Paid matches use MVP Crowns. Winner takes the pool minus the
                platform maintenance fee.
              </p>

              <Link href="/wallet">
                <Button variant="secondary" className="mt-5 w-full gap-2">
                  <Crown className="h-4 w-4" />
                  Open Wallet
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}