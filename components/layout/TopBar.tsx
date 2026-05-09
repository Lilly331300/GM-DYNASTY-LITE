"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Crown,
  Menu,
  Radio,
  Search,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getActiveGameAlerts } from "@/lib/gameHub";

interface TopBarProps {
  onMenuClick: () => void;
  unreadNotifications?: number;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<ReturnType<typeof getActiveGameAlerts>>([]);

  useEffect(() => {
    const refresh = () => setAlerts(getActiveGameAlerts());

    refresh();

    const interval = window.setInterval(refresh, 500);
    window.addEventListener("storage", refresh);
    window.addEventListener("gmdl-storage-change", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("gmdl-storage-change", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const unreadCount = alerts.length;

  const getPageTitle = () => {
    const path = pathname.split("/")[1];

    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      teams: "Franchises",
      "team-profile": "Team Profile",
      roster: "Roster",
      "game-plan": "Game Plan",
      "depth-chart": "Depth Chart",
      scouting: "Scouting",
      "challenge-hub": "Challenge Hub",
      "games-in-progress": "Games in Progress",
      wallet: "Wallet",
      settings: "Settings",
      "team-create": "Create Franchise",
      "create-challenge": "Create Challenge",
      pregame: "Pregame Lobby",
      "live-game": "Live Game",
      "box-score": "Box Score",
      "game-history": "Game History",
      standings: "Standings",
      notifications: "Notifications",
      "invite-center": "Invite Center",
    };

    return titles[path] || "GM Dynasty Lite";
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-navy-border bg-navy-primary/95 px-4 backdrop-blur-md lg:left-80 lg:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-navy-secondary hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold uppercase tracking-wide text-white sm:text-lg">
            {getPageTitle()}
          </h1>
          <p className="hidden text-xs text-text-muted lg:block">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden w-64 items-center rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 md:flex">
          <Search className="mr-2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search players, teams..."
            className="w-full bg-transparent text-sm text-text-light outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="group relative">
          <Link
            href="/notifications"
            className="relative flex rounded-lg p-2 text-text-muted transition-colors hover:bg-navy-secondary hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="invisible fixed right-3 top-16 z-[70] w-[calc(100vw-1.5rem)] max-w-[390px] translate-y-2 rounded-2xl border border-navy-border bg-navy-card p-3 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 sm:absolute sm:right-0 sm:top-11">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-gold">
                Active Game Switcher
              </p>

              <Badge variant={alerts.length > 0 ? "danger" : "success"}>
                {alerts.length}
              </Badge>
            </div>

            {alerts.length > 0 ? (
              <div className="max-h-[360px] space-y-2 overflow-y-auto">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={alert.href}
                    className="block rounded-xl border border-navy-border bg-navy-secondary/70 p-3 transition hover:border-gold/40"
                  >
                    <div className="flex items-start gap-3">
                      <Radio
                        className={`mt-1 h-4 w-4 ${
                          alert.status === "live" ? "text-danger" : "text-gold"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-black uppercase text-white">
                            {alert.title}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              alert.status === "live"
                                ? "bg-danger/15 text-danger"
                                : alert.status === "pregame"
                                  ? "bg-gold/15 text-gold"
                                  : "bg-electric/15 text-electric"
                            }`}
                          >
                            {alert.status}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-text-muted">
                          {alert.description}
                        </p>

                        <p className="mt-2 text-[10px] font-black uppercase text-gold">
                          {alert.status === "live"
                            ? "Switch to live game"
                            : "Open pregame lobby"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-navy-border bg-navy-secondary/50 p-4 text-center">
                <p className="text-sm font-bold text-white">No active games</p>
                <p className="text-xs text-text-muted">
                  Your notifications reset when games end.
                </p>
              </div>
            )}

            <Link
              href="/notifications"
              className="mt-3 block text-center text-xs font-black uppercase text-gold"
            >
              Open notification center
            </Link>
          </div>
        </div>

        <Link
          href="/wallet"
          className="hidden items-center gap-2 rounded-lg border border-gold/20 bg-gold/10 px-3 py-2 transition-colors hover:bg-gold/20 sm:flex"
        >
          <Crown className="h-4 w-4 text-gold" />
          <span className="text-sm font-bold tabular-nums text-gold">12,450</span>
          <span className="text-[10px] font-medium text-gold/70">MVP</span>
        </Link>

        <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-navy-secondary">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-electric to-cyan-glow">
            <User className="h-4 w-4 text-white" />
          </div>
          <ChevronDown className="hidden h-4 w-4 text-text-muted sm:block" />
        </button>
      </div>
    </header>
  );
}