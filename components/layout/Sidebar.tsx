"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LogOut,
  Radio,
  Search,
  Settings,
  Shield,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import {
  getActiveGameAlerts,
  getUserFranchises,
  type StoredFranchiseTeam,
} from "@/lib/gameHub";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
} from "@/lib/teamVisuals";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const READ_ALERTS_KEY = "gmdl_read_alerts";
const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";

const sidebarAssets = {
  logo: "/assets/brand/gm-logo.png",
  logoMark: "/assets/brand/gm-logo-mark.png",
  badge: "/assets/dashboard/sidebar-franchise-badge.png",
};

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Command center",
  },
  {
    href: "/teams",
    label: "Franchises",
    icon: Shield,
    description: "Owned teams",
  },
  {
    href: "/roster",
    label: "Roster",
    icon: Users,
    description: "Player room",
  },
  {
    href: "/game-plan",
    label: "Game Plan",
    icon: ClipboardList,
    description: "Strategy board",
  },
  {
    href: "/depth-chart",
    label: "Depth Chart",
    icon: BarChart3,
    description: "Starters & backups",
  },
  {
    href: "/scouting",
    label: "Scouting",
    icon: Search,
    description: "Opponent intel",
  },
  {
    href: "/challenge-hub",
    label: "Challenge Hub",
    icon: Trophy,
    description: "Find matchups",
  },
  {
    href: "/games-in-progress",
    label: "Live Games",
    icon: Radio,
    description: "Spectator hub",
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: Wallet,
    description: "MVP Crowns",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Controls",
  },
];

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

function safeWriteJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log(`Unable to save ${key}`);
  }
}

function getReadAlertIds() {
  return safeReadJson<string[]>(READ_ALERTS_KEY, []);
}

function setReadAlertIds(ids: string[]) {
  safeWriteJson(READ_ALERTS_KEY, ids);
}

function getPrimaryFranchiseIdLocal() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(PRIMARY_FRANCHISE_KEY) ?? undefined;
}

function savePrimaryFranchiseIdLocal(teamId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PRIMARY_FRANCHISE_KEY, teamId);
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log("Unable to save primary franchise.");
  }
}

function AssetImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback ?? null}</>;

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

function MultiAssetImage({
  sources,
  alt,
  className,
  fallback,
}: {
  sources: string[];
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) return <>{fallback ?? null}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIndex((current) => current + 1)}
      draggable={false}
    />
  );
}

function SidebarLogo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "group flex min-w-0 items-center gap-3",
        isCollapsed && "justify-center"
      )}
    >
      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-navy-card via-navy-secondary to-navy-primary shadow-[0_0_28px_rgba(245,197,66,0.18)]">
        <MultiAssetImage
          sources={[
            sidebarAssets.logo,
            sidebarAssets.logoMark,
            sidebarAssets.badge,
          ]}
          alt="GM Dynasty logo"
          className="h-full w-full object-contain p-1.5"
          fallback={<Crown className="relative h-6 w-6 text-gold drop-shadow" />}
        />
      </div>

      {!isCollapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black uppercase tracking-[0.18em] text-white">
            GM Dynasty
          </p>
          <p className="truncate text-[9px] font-black uppercase tracking-[0.24em] text-gold">
            Lite Control Room
          </p>
        </div>
      )}
    </Link>
  );
}

function PrimaryFranchiseCard({
  team,
  isCollapsed,
}: {
  team?: StoredFranchiseTeam;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <div className="px-2 pb-2">
        <Link
          href={team ? "/teams" : "/team-create"}
          className="mx-auto flex h-11 w-11 items-center justify-center overflow-visible rounded-2xl border border-navy-border bg-navy-card text-xs font-black text-white shadow-lg transition hover:border-gold/40"
          title={team ? getTeamDisplayName(team) : "Create Franchise"}
        >
          {team ? (
            <TeamHelmetVisual team={team} size="xs" showGlow={false} />
          ) : (
            <Shield className="h-5 w-5" />
          )}
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="px-3 pb-2">
        <Link
          href="/team-create"
          className="block overflow-hidden rounded-2xl border border-dashed border-gold/30 bg-gradient-to-br from-gold/10 via-navy-card to-navy-secondary p-3 transition hover:border-gold/60 hover:bg-gold/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy-primary text-gold">
              <Shield className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-white">
                Create Franchise
              </p>
              <p className="mt-0.5 text-[10px] text-text-muted">
                Build your team
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 pb-2">
      <Link
        href="/teams"
        className="group relative block overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-navy-card via-navy-secondary/80 to-navy-primary p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition hover:border-gold/35"
      >
        <AssetImage
          src={getTeamCardSrc(team)}
          alt={`${getTeamDisplayName(team)} card background`}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
          fallback={null}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.10),transparent_40%)]" />

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-11 w-12 flex-shrink-0 items-center justify-center overflow-visible rounded-2xl bg-navy-primary text-sm font-black text-white">
            <TeamHelmetVisual team={team} size="sm" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <p className="truncate text-xs font-black uppercase tracking-wide text-white">
                {team.nickname ?? team.name}
              </p>
              <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[9px] font-black text-gold">
                OVR {team.overallRating}
              </span>
            </div>

            <p className="truncate text-[10px] text-text-muted">
              {team.city} Franchise
            </p>

            <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
              <div className="rounded-lg bg-navy-primary/70 px-1 py-0.5">
                <p className="text-[8px] font-bold uppercase text-text-muted">
                  Rec
                </p>
                <p className="text-[10px] font-black text-white">
                  {team.record.wins}-{team.record.losses}
                </p>
              </div>

              <div className="rounded-lg bg-navy-primary/70 px-1 py-0.5">
                <p className="text-[8px] font-bold uppercase text-text-muted">
                  Sync
                </p>
                <p className="text-[10px] font-black text-white">
                  {team.nflSync?.enabled ? "On" : "Off"}
                </p>
              </div>

              <div className="rounded-lg bg-navy-primary/70 px-1 py-0.5">
                <p className="text-[8px] font-bold uppercase text-text-muted">
                  Status
                </p>
                <p className="text-[10px] font-black text-success">Ready</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-default bg-black/70 backdrop-blur-sm"
              onClick={onToggle}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="fixed left-0 top-0 z-50 h-full w-[305px] max-w-[86vw] overflow-hidden border-r border-navy-border bg-navy-primary shadow-2xl"
            >
              <SidebarContent
                pathname={pathname}
                isCollapsed={false}
                isMobile
                onToggle={onToggle}
                onItemClick={onToggle}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.24, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-30 hidden h-full flex-col overflow-hidden border-r border-navy-border bg-navy-primary shadow-[16px_0_40px_rgba(0,0,0,0.16)] lg:flex"
    >
      <SidebarContent
        pathname={pathname}
        isCollapsed={!isOpen}
        isMobile={false}
        onToggle={onToggle}
      />
    </motion.aside>
  );
}

function SidebarContent({
  pathname,
  isCollapsed = false,
  isMobile = false,
  onToggle,
  onItemClick,
}: {
  pathname: string;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [primaryId, setPrimaryId] = useState<string | undefined>();

  const refreshSidebar = () => {
    const userTeams = getUserFranchises();

    const savedPrimary = getPrimaryFranchiseIdLocal();
    const primaryStillExists = userTeams.some(
      (team) => team.id === savedPrimary
    );
    const nextPrimaryId = primaryStillExists ? savedPrimary : userTeams[0]?.id;

    if (!savedPrimary && nextPrimaryId) {
      savePrimaryFranchiseIdLocal(nextPrimaryId);
    }

    setTeams(userTeams);
    setPrimaryId(nextPrimaryId);

    const activeAlerts = getActiveGameAlerts();
    const readIds = getReadAlertIds();
    const unreadAlerts = activeAlerts.filter(
      (alert) => !readIds.includes(alert.id)
    );

    setUnreadCount(unreadAlerts.length);
  };

  useEffect(() => {
    setMounted(true);
    refreshSidebar();

    const handleRefresh = () => {
      refreshSidebar();
    };

    window.addEventListener("storage", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("gmdl-storage-change", handleRefresh);

    return () => {
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("gmdl-storage-change", handleRefresh);
    };
  }, []);

  const primaryTeam = useMemo(() => {
    return teams.find((team) => team.id === primaryId) ?? teams[0];
  }, [teams, primaryId]);

  const activeAlerts = mounted ? getActiveGameAlerts() : [];

  const markNotificationsRead = () => {
    const currentRead = getReadAlertIds();
    const merged = Array.from(
      new Set([...currentRead, ...activeAlerts.map((alert) => alert.id)])
    );

    setReadAlertIds(merged);
    setUnreadCount(0);
    onItemClick?.();
  };

  const signOut = () => {
    try {
      window.sessionStorage.clear();
    } catch {
      console.log("Session storage clear skipped.");
    }

    window.location.href = "/";
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.08),transparent_34%),linear-gradient(180deg,#0B1A2A_0%,#081522_100%)]">
      <div
        className={cn(
          "flex h-16 flex-shrink-0 items-center border-b border-navy-border/80",
          isCollapsed ? "justify-center px-2" : "justify-between px-3"
        )}
      >
        <SidebarLogo isCollapsed={isCollapsed} />

        {!isCollapsed && isMobile && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-navy-border bg-navy-card text-text-muted transition hover:border-gold/40 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {!isMobile && onToggle && !isCollapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-navy-border bg-navy-card text-text-muted transition hover:border-gold/40 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {!isMobile && onToggle && isCollapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-[-14px] top-5 flex h-8 w-8 items-center justify-center rounded-full border border-navy-border bg-navy-card text-text-muted shadow-xl transition hover:border-gold/40 hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-shrink-0 pt-2">
        {mounted ? (
          <PrimaryFranchiseCard team={primaryTeam} isCollapsed={isCollapsed} />
        ) : (
          <div className={cn("pb-2", isCollapsed ? "px-2" : "px-3")}>
            <div
              className={cn(
                "animate-pulse rounded-2xl bg-navy-card",
                isCollapsed ? "h-11 w-11" : "h-[92px] w-full"
              )}
            />
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-shrink-0 px-3 pb-2">
          <div className="flex items-center justify-between rounded-2xl border border-navy-border/80 bg-navy-card/60 px-3 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                Platform Status
              </p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-white">
                {activeAlerts.length > 0
                  ? `${activeAlerts.length} active alert${
                      activeAlerts.length === 1 ? "" : "s"
                    }`
                  : "No active alerts"}
              </p>
            </div>

            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success">
              <Radio className="h-4 w-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-success" />
              )}
            </div>
          </div>
        </div>
      )}

      <nav
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-1 pr-2",
          "[scrollbar-width:thin] [scrollbar-color:rgba(245,197,66,0.25)_transparent]",
          isCollapsed && "px-2 pr-2"
        )}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl px-3 py-1.5 transition-all duration-200",
                isActive
                  ? "border border-gold/25 bg-gradient-to-r from-gold/15 via-wine/20 to-navy-card text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
                  : "border border-transparent text-text-muted hover:border-navy-border hover:bg-navy-card/80 hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebarActiveGlow"
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gold"
                />
              )}

              <div
                className={cn(
                  "relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition",
                  isActive
                    ? "bg-gold/15 text-gold"
                    : "bg-navy-secondary/60 text-text-muted group-hover:text-gold"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold leading-4">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[9px] leading-3",
                      isActive ? "text-gold/80" : "text-text-muted"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto flex-shrink-0 border-t border-navy-border/80 py-2",
          isCollapsed ? "px-2" : "px-3"
        )}
      >
        {!isCollapsed && (
          <Link
            href="/wallet"
            className="mb-2 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/10 via-navy-card to-navy-secondary px-3 py-1.5 transition hover:border-gold/35"
          >
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center gap-2">
                <Crown className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gold">
                  MVP Crowns
                </span>
              </div>

              <p className="text-lg font-black tabular-nums text-white">12,450</p>
            </div>

            <span className="rounded-full bg-navy-primary px-2 py-0.5 text-[9px] font-black text-text-muted">
              Demo
            </span>
          </Link>
        )}

        <div className="space-y-1">
          <Link
            href="/notifications"
            onClick={markNotificationsRead}
            title={isCollapsed ? "Notifications" : undefined}
            className={cn(
              "group flex min-w-0 items-center gap-3 rounded-2xl border border-transparent px-3 py-1.5 text-text-muted transition hover:border-navy-border hover:bg-navy-card hover:text-white",
              pathname === "/notifications" &&
                "border-gold/25 bg-gold/10 text-white",
              isCollapsed && "justify-center px-2"
            )}
          >
            <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-navy-secondary/60 group-hover:text-gold">
              <Bell className="h-4 w-4" />

              {mounted && unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-navy-primary bg-danger px-1 text-[10px] font-black text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold leading-4">
                  Notifications
                </p>
                <p className="truncate text-[9px] leading-3 text-text-muted">
                  Active games and alerts
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={signOut}
            title={isCollapsed ? "Sign Out" : undefined}
            className={cn(
              "group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-transparent px-3 py-1.5 text-text-muted transition hover:border-danger/20 hover:bg-danger/10 hover:text-danger",
              isCollapsed && "justify-center px-2"
            )}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-navy-secondary/60">
              <LogOut className="h-4 w-4" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="truncate text-[13px] font-bold leading-4">
                  Sign Out
                </p>
                <p className="truncate text-[9px] leading-3 text-text-muted">
                  Return to landing page
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;