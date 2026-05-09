"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Radio,
  Shield,
  Swords,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import { getActiveGameAlerts, getTeamFromHub } from "@/lib/gameHub";
import { cn } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

type Alert = ReturnType<typeof getActiveGameAlerts>[number];

const READ_ALERTS_KEY = "gmdl_read_alerts";

function readIds() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(READ_ALERTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("gmdl-storage-change"));
}

function extractTeamIdFromHref(href: string, key: "home" | "away") {
  try {
    const url = new URL(href, "http://localhost");
    return url.searchParams.get(key);
  } catch {
    return null;
  }
}

function getAlertTeams(alert: Alert) {
  const homeId = extractTeamIdFromHref(alert.href, "home");
  const awayId = extractTeamIdFromHref(alert.href, "away");

  return {
    homeTeam: homeId ? getTeamFromHub(homeId) : undefined,
    awayTeam: awayId ? getTeamFromHub(awayId) : undefined,
  };
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

function TeamHelmet({
  team,
  size = "md",
}: {
  team?: VisualTeam;
  size?: "sm" | "md" | "lg" | "card";
}) {
  const shellClass =
    size === "card"
      ? "h-40 w-56"
      : size === "lg"
        ? "h-24 w-32"
        : size === "sm"
          ? "h-12 w-16"
          : "h-16 w-20";

  const visualSize =
    size === "card" ? "card" : size === "lg" ? "lg" : size === "sm" ? "sm" : "md";

  return (
    <div className={cn("relative shrink-0 overflow-visible", shellClass)}>
      <TeamHelmetVisual team={team} size={visualSize} />
    </div>
  );
}

function TeamMiniIdentity({
  team,
  label,
  align = "left",
}: {
  team?: VisualTeam;
  label: string;
  align?: "left" | "right";
}) {
  if (!team) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-navy-border bg-navy-secondary/45 p-3",
          align === "right" && "text-right"
        )}
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p className="mt-1 text-sm font-black uppercase text-white">
          Awaiting Team
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-2xl border border-navy-border bg-navy-secondary/55 p-3",
        align === "right" && "text-right"
      )}
    >
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} card`}
        className={cn(
          "pointer-events-none absolute top-0 h-full w-40 object-cover opacity-12",
          align === "right" ? "left-0" : "right-0"
        )}
        fallbackClassName="hidden"
      />

      <div
        className={cn(
          "pointer-events-none absolute bottom-[-18px] opacity-10",
          align === "right" ? "left-[-22px]" : "right-[-22px]"
        )}
      >
        <TeamHelmetVisual team={team} size="card" />
      </div>

      <div
        className={cn(
          "relative flex min-w-0 items-center gap-3",
          align === "right" && "flex-row-reverse"
        )}
      >
        <TeamHelmet team={team} size="sm" />

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            {label}
          </p>

          <p className="truncate text-sm font-black uppercase text-white">
            {getTeamDisplayName(team)}
          </p>

          <div
            className={cn(
              "mt-1 flex flex-wrap items-center gap-2",
              align === "right" && "justify-end"
            )}
          >
            <span className="text-[11px] font-semibold text-text-muted">
              OVR {team.overallRating ?? "--"}
            </span>

            <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[9px] font-black uppercase text-gold">
              {getTeamInitials(team)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Alert["status"] }) {
  const Icon =
    status === "live" ? Radio : status === "pregame" ? Clock : Swords;

  return <Icon className="h-5 w-5" />;
}

function AlertCard({
  alert,
  isRead,
  onMarkRead,
}: {
  alert: Alert;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}) {
  const Icon =
    alert.status === "live"
      ? Radio
      : alert.status === "pregame"
        ? Clock
        : Swords;

  const { homeTeam, awayTeam } = getAlertTeams(alert);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative min-w-0 overflow-hidden rounded-3xl border p-5 shadow-xl transition",
        isRead
          ? "border-navy-border bg-navy-card hover:border-gold/25"
          : "border-gold/40 bg-gold/10 hover:border-gold/60"
      )}
    >
      <AssetImage
        src={
          homeTeam
            ? getTeamCardSrc(homeTeam)
            : teamVisualAssets.backgrounds.stadiumFlare
        }
        alt="Notification background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      {homeTeam ? (
        <div className="pointer-events-none absolute bottom-[-34px] right-[-24px] hidden opacity-12 lg:block">
          <TeamHelmetVisual team={homeTeam} size="card" />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_34%),linear-gradient(180deg,rgba(11,26,42,0.66),rgba(11,26,42,0.96))]" />

      {!isRead && (
        <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-gold shadow-[0_0_18px_rgba(245,197,66,0.85)]" />
      )}

      <div className="relative">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={alert.status === "live" ? "danger" : "gold"}>
                <Icon className="mr-1 h-3 w-3" />
                {alert.title}
              </Badge>

              {isRead ? (
                <Badge variant="info">Read</Badge>
              ) : (
                <Badge variant="gold">Unread</Badge>
              )}

              <Badge variant="info">
                {alert.status === "live"
                  ? "Live Match"
                  : alert.status === "pregame"
                    ? "Pregame Lobby"
                    : "Listed Challenge"}
              </Badge>
            </div>

            <div className="flex min-w-0 items-start gap-4">
              <div
                className={cn(
                  "hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-lg md:flex",
                  alert.status === "live"
                    ? "border-danger/30 bg-danger/10 text-danger"
                    : alert.status === "pregame"
                      ? "border-gold/30 bg-gold/10 text-gold"
                      : "border-electric/30 bg-electric/10 text-electric"
                )}
              >
                <StatusIcon status={alert.status} />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black uppercase text-white">
                  {alert.title}
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-text-muted">
                  {alert.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
            <Link href={alert.href}>
              <Button
                variant="gold"
                className="w-full gap-2"
                onClick={() => onMarkRead(alert.id)}
              >
                <Eye className="h-4 w-4" />
                Open
              </Button>
            </Link>

            {!isRead ? (
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => onMarkRead(alert.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Read
              </Button>
            ) : null}
          </div>
        </div>

        {(homeTeam || awayTeam) && (
          <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_90px_1fr] xl:items-center">
            <TeamMiniIdentity team={homeTeam} label="Home" />

            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3 text-center">
              <p className="text-2xl font-black text-gold">VS</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                {alert.status}
              </p>
            </div>

            <TeamMiniIdentity team={awayTeam} label="Away" align="right" />
          </div>
        )}
      </div>
    </motion.article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "gold",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  tone?: "gold" | "danger" | "electric" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger bg-danger/10 border-danger/20"
      : tone === "electric"
        ? "text-electric bg-electric/10 border-electric/20"
        : tone === "success"
          ? "text-success bg-success/10 border-success/20"
          : "text-gold bg-gold/10 border-gold/20";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt={`${label} glow`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        fallbackClassName="hidden"
      />

      <div className="relative">
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass}`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-text-muted">
          {label}
        </p>

        <p className="mt-2 text-4xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !readAlertIds.includes(alert.id)).length,
    [alerts, readAlertIds]
  );

  const liveCount = useMemo(
    () => alerts.filter((alert) => alert.status === "live").length,
    [alerts]
  );

  const pregameCount = useMemo(
    () => alerts.filter((alert) => alert.status === "pregame").length,
    [alerts]
  );

  const listedCount = useMemo(
    () => alerts.filter((alert) => alert.status === "listed").length,
    [alerts]
  );

  useEffect(() => {
    setMounted(true);

    const refresh = () => {
      setAlerts(getActiveGameAlerts());
      setReadAlertIds(readIds());
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("gmdl-storage-change", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("gmdl-storage-change", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const markRead = (id: string) => {
    const merged = Array.from(new Set([...readAlertIds, id]));
    setReadAlertIds(merged);
    saveReadIds(merged);
  };

  const markAllRead = () => {
    const merged = Array.from(
      new Set([...readAlertIds, ...alerts.map((alert) => alert.id)])
    );
    setReadAlertIds(merged);
    saveReadIds(merged);
  };

  const clearReadMemory = () => {
    setReadAlertIds([]);
    saveReadIds([]);
  };

  if (!mounted) {
    return (
      <AppShell>
        <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
          <div className="h-44 rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-80 rounded-3xl border border-navy-border bg-navy-card" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Notification command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.field}
            alt="Notification field"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[520px] object-cover opacity-16 xl:block"
            fallbackClassName="hidden"
          />

          {alerts[0] ? (
            <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-18 xl:block">
              <TeamHelmetVisual
                team={getAlertTeams(alerts[0]).homeTeam}
                size="card"
              />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.74),rgba(11,26,42,0.94))]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Bell className="mr-1 h-3 w-3" />
                  Notifications
                </Badge>

                <Badge variant={unreadCount > 0 ? "danger" : "info"}>
                  {unreadCount} Unread
                </Badge>

                <Badge variant="info">{alerts.length} Active Alerts</Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Notification Center
              </h1>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-text-muted md:text-base">
                Track listed challenges, pregame lobbies, and live games. Once a
                game is completed, it disappears from active notifications.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[420px]">
              <Button
                variant="gold"
                className="w-full gap-2"
                onClick={markAllRead}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark All Read
              </Button>

              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={clearReadMemory}
              >
                <Trash2 className="h-4 w-4" />
                Reset Read State
              </Button>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Bell}
            label="Active"
            value={alerts.length}
            tone="gold"
          />

          <MetricCard
            icon={Radio}
            label="Live"
            value={liveCount}
            tone="danger"
          />

          <MetricCard
            icon={Clock}
            label="Pregame"
            value={pregameCount}
            tone="success"
          />

          <MetricCard
            icon={Trophy}
            label="Listed"
            value={listedCount}
            tone="electric"
          />
        </section>

        <section className="space-y-5">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isRead={readAlertIds.includes(alert.id)}
                onMarkRead={markRead}
              />
            ))
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-navy-border bg-navy-card p-10 text-center shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.field}
                alt="No notifications field"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <Shield className="mx-auto h-12 w-12 text-text-muted" />

                <h2 className="mt-4 text-2xl font-black uppercase text-white">
                  No active notifications
                </h2>

                <p className="mt-2 text-sm text-text-muted">
                  You have no listed, pregame, or live games right now.
                </p>

                <Link href="/challenge-hub">
                  <Button variant="gold" className="mt-5 gap-2">
                    <Swords className="h-4 w-4" />
                    Open Challenge Hub
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
          <AssetImage
            src={teamVisualAssets.backgrounds.stadiumFlare}
            alt="Notification note glow"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
            fallbackClassName="hidden"
          />

          <div className="relative flex items-start gap-3">
            <Zap className="mt-1 h-5 w-5 shrink-0 text-gold" />
            <p className="break-words text-sm leading-6 text-text-muted">
              Notification cards now read team IDs from their game links and
              display custom layered helmets, team cards, and matchup identity
              when the alert includes home and away teams.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}