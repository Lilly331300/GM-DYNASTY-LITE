"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Crown,
  Eye,
  Gamepad2,
  Lock,
  Mail,
  Moon,
  Radio,
  Save,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import { mockUser } from "@/lib/mockData";
import { getUserFranchises, type StoredFranchiseTeam } from "@/lib/gameHub";
import { deleteFranchiseEverywhere } from "@/lib/franchiseDelete";
import { cn } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
} from "@/lib/teamVisuals";

const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";

function getPrimaryFranchiseId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(PRIMARY_FRANCHISE_KEY) ?? undefined;
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
  team?: StoredFranchiseTeam;
  size?: "sm" | "md" | "lg" | "xl" | "card";
}) {
  const shellClass =
    size === "card"
      ? "h-48 w-64"
      : size === "xl"
        ? "h-32 w-44"
        : size === "lg"
          ? "h-24 w-32"
          : size === "sm"
            ? "h-12 w-16"
            : "h-16 w-20";

  const visualSize =
    size === "card"
      ? "card"
      : size === "xl"
        ? "xl"
        : size === "lg"
          ? "lg"
          : size === "sm"
            ? "sm"
            : "md";

  return (
    <div className={cn("relative shrink-0 overflow-visible", shellClass)}>
      <TeamHelmetVisual team={team} size={visualSize} />
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition",
        enabled ? "bg-success" : "bg-navy-border"
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow-md transition",
          enabled ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-navy-border bg-navy-secondary/60 p-4 transition hover:border-gold/25 hover:bg-navy-secondary/75"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/15 bg-navy-card">
          <Icon className="h-5 w-5 text-gold" />
        </div>

        <div className="min-w-0">
          <p className="break-words font-black uppercase text-white">{title}</p>
          <p className="mt-1 break-words text-sm leading-5 text-text-muted">
            {description}
          </p>
        </div>
      </div>

      <Toggle enabled={enabled} onChange={onChange} />
    </motion.div>
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
  value: string | number;
  tone?: "gold" | "success" | "electric" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "electric"
        ? "border-electric/20 bg-electric/10 text-electric"
        : tone === "danger"
          ? "border-danger/20 bg-danger/10 text-danger"
          : "border-gold/20 bg-gold/10 text-gold";

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
          className={cn(
            "mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border",
            toneClass
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-text-muted">
          {label}
        </p>

        <p className="mt-2 text-3xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function ProfileFranchiseCard({
  primaryTeam,
}: {
  primaryTeam?: StoredFranchiseTeam;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gold/10 p-5 shadow-xl">
      <AssetImage
        src={
          primaryTeam
            ? getTeamCardSrc(primaryTeam)
            : teamVisualAssets.backgrounds.field
        }
        alt="Primary franchise background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      {primaryTeam ? (
        <div className="pointer-events-none absolute bottom-[-28px] right-[-28px] opacity-12">
          <TeamHelmetVisual team={primaryTeam} size="card" />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_38%),linear-gradient(180deg,rgba(11,26,42,0.62),rgba(11,26,42,0.96))]" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
          Primary Franchise
        </p>

        {primaryTeam ? (
          <div className="mt-4 flex min-w-0 items-center gap-4">
            <TeamHelmet team={primaryTeam} size="lg" />

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="gold">{getTeamInitials(primaryTeam)}</Badge>
                <Badge variant="info">OVR {primaryTeam.overallRating}</Badge>
                {primaryTeam.nflSync?.enabled ? (
                  <Badge variant="success">NFL Synced</Badge>
                ) : (
                  <Badge variant="gold">Manual</Badge>
                )}
              </div>

              <h2 className="break-words text-2xl font-black uppercase leading-tight text-white">
                {getTeamDisplayName(primaryTeam)}
              </h2>

              <p className="mt-1 text-sm font-semibold text-text-muted">
                {primaryTeam.record.wins}-{primaryTeam.record.losses}
                {primaryTeam.record.ties ? `-${primaryTeam.record.ties}` : ""} ·
                OFF {primaryTeam.offensiveRating} · DEF{" "}
                {primaryTeam.defensiveRating}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-gold/30 bg-navy-card/60 p-4 text-center">
            <Shield className="mx-auto h-9 w-9 text-text-muted" />
            <p className="mt-3 font-black uppercase text-white">
              No primary franchise
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Create a franchise to personalize this settings panel.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AppearanceButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-center transition",
        active
          ? "border-gold/60 bg-gold/10 text-gold shadow-lg shadow-gold/10"
          : "border-navy-border bg-navy-secondary text-text-muted hover:border-gold/25 hover:text-white"
      )}
    >
      <Icon className="mx-auto mb-2 h-5 w-5" />
      <p className="text-sm font-black uppercase">{label}</p>
    </button>
  );
}

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [challengeAlerts, setChallengeAlerts] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [rewardAlerts, setRewardAlerts] = useState(true);
  const [showWallet, setShowWallet] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [allowInvites, setAllowInvites] = useState(true);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [saved, setSaved] = useState(false);
  const [franchises, setFranchises] = useState<StoredFranchiseTeam[]>([]);

  const [teamToDelete, setTeamToDelete] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    const refresh = () => {
      setFranchises(getUserFranchises());
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

  const primaryTeam = useMemo(() => {
    const primaryId = getPrimaryFranchiseId();
    return franchises.find((team) => team.id === primaryId) ?? franchises[0];
  }, [franchises]);

  const selectedDeleteTeam = useMemo(() => {
    return franchises.find((team) => team.id === teamToDelete);
  }, [franchises, teamToDelete]);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const deleteSelectedFranchise = () => {
    if (!selectedDeleteTeam) {
      setDeleteMessage("Select a franchise first.");
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteMessage('Type "DELETE" to confirm.');
      return;
    }

    const deletedName =
      selectedDeleteTeam.name ??
      `${selectedDeleteTeam.city} ${selectedDeleteTeam.nickname}`;

    deleteFranchiseEverywhere(selectedDeleteTeam.id);

    setFranchises((current) =>
      current.filter((team) => team.id !== selectedDeleteTeam.id)
    );

    setTeamToDelete("");
    setDeleteConfirmText("");
    setDeleteMessage(`${deletedName} has been deleted.`);

    window.setTimeout(() => {
      setDeleteMessage("");
    }, 2500);
  };

  const enabledNotificationCount = [
    emailNotifications,
    pushNotifications,
    challengeAlerts,
    matchAlerts,
    rewardAlerts,
  ].filter(Boolean).length;

  const enabledPrivacyCount = [showWallet, showStats, allowInvites].filter(
    Boolean
  ).length;

  const enabledGamePreferenceCount = [autoSimulate, showPredictions].filter(
    Boolean
  ).length;

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_36%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={
              primaryTeam
                ? getTeamCardSrc(primaryTeam)
                : teamVisualAssets.backgrounds.commandCenter
            }
            alt="Settings command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-24"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Settings command texture"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
            fallbackClassName="hidden"
          />

          {primaryTeam ? (
            <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-18 xl:block">
              <TeamHelmetVisual team={primaryTeam} size="card" />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.74),rgba(11,26,42,0.94))]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="gold">
                  <Shield className="mr-1 h-3 w-3" />
                  Account Controls
                </Badge>

                <Badge variant="info">
                  <Bell className="mr-1 h-3 w-3" />
                  Alerts
                </Badge>

                <Badge variant="success">
                  <Lock className="mr-1 h-3 w-3" />
                  Privacy
                </Badge>

                <Badge variant="gold">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Premium UI
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Settings
              </h1>

              <p className="mt-2 max-w-3xl break-words text-sm font-medium leading-6 text-text-muted md:text-base">
                Manage notifications, privacy, game preferences, wallet display,
                appearance, franchise deletion, and profile settings.
              </p>
            </div>

            <Button variant="gold" className="gap-2" onClick={saveSettings}>
              {saved ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved" : "Save Settings"}
            </Button>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Bell}
            label="Alert Toggles"
            value={`${enabledNotificationCount}/5`}
            tone="gold"
          />

          <MetricCard
            icon={Lock}
            label="Privacy Active"
            value={`${enabledPrivacyCount}/3`}
            tone="success"
          />

          <MetricCard
            icon={Gamepad2}
            label="Game Options"
            value={`${enabledGamePreferenceCount}/2`}
            tone="electric"
          />

          <MetricCard
            icon={Trophy}
            label="Franchises"
            value={franchises.length}
            tone="gold"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={
                  primaryTeam
                    ? getTeamCardSrc(primaryTeam)
                    : teamVisualAssets.backgrounds.stadiumFlare
                }
                alt="Coach profile background"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 shadow-lg shadow-gold/10">
                    <User className="h-8 w-8 text-gold" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                      Coach Profile
                    </p>
                    <h2 className="break-words text-2xl font-black uppercase text-white">
                      {mockUser.displayName}
                    </h2>
                    <p className="break-words text-sm text-text-muted">
                      @{mockUser.username}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                      Display Name
                    </label>
                    <input
                      defaultValue={mockUser.displayName}
                      className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                      Email
                    </label>
                    <input
                      defaultValue={mockUser.email}
                      className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
                    />
                  </div>
                </div>
              </div>
            </section>

            <ProfileFranchiseCard primaryTeam={primaryTeam} />

            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.stadiumFlare}
                alt="Appearance glow"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-gold">
                  Appearance
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <AppearanceButton
                    active={theme === "dark"}
                    icon={Moon}
                    label="Dark"
                    onClick={() => setTheme("dark")}
                  />

                  <AppearanceButton
                    active={theme === "light"}
                    icon={Sun}
                    label="Light"
                    onClick={() => setTheme("light")}
                  />

                  <AppearanceButton
                    active={theme === "system"}
                    icon={Eye}
                    label="System"
                    onClick={() => setTheme("system")}
                  />
                </div>

                <p className="mt-4 rounded-2xl border border-gold/20 bg-gold/10 p-3 text-xs leading-5 text-text-muted">
                  Current selection:{" "}
                  <span className="font-black uppercase text-white">
                    {theme}
                  </span>
                  . The landing page stays separate; signed-in pages can use
                  this setting when theme persistence is connected.
                </p>
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.stadiumFlare}
                alt="Notifications settings glow"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                      Notifications
                    </p>
                    <h2 className="mt-1 text-2xl font-black uppercase text-white">
                      Alert Control
                    </h2>
                  </div>

                  <Bell className="h-7 w-7 text-gold" />
                </div>

                <div className="space-y-3">
                  <SettingRow
                    icon={Mail}
                    title="Email Notifications"
                    description="Receive important alerts by email."
                    enabled={emailNotifications}
                    onChange={() =>
                      setEmailNotifications((current) => !current)
                    }
                  />

                  <SettingRow
                    icon={Bell}
                    title="Push Notifications"
                    description="Receive real-time platform notifications."
                    enabled={pushNotifications}
                    onChange={() =>
                      setPushNotifications((current) => !current)
                    }
                  />

                  <SettingRow
                    icon={Shield}
                    title="Challenge Alerts"
                    description="Notify me when challenges are accepted or created."
                    enabled={challengeAlerts}
                    onChange={() =>
                      setChallengeAlerts((current) => !current)
                    }
                  />

                  <SettingRow
                    icon={Radio}
                    title="Match Alerts"
                    description="Notify me when games enter pregame or go live."
                    enabled={matchAlerts}
                    onChange={() => setMatchAlerts((current) => !current)}
                  />

                  <SettingRow
                    icon={Wallet}
                    title="Reward Alerts"
                    description="Notify me when MVP Crowns settle."
                    enabled={rewardAlerts}
                    onChange={() => setRewardAlerts((current) => !current)}
                  />
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.field}
                alt="Privacy field"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                      Privacy
                    </p>
                    <h2 className="mt-1 text-2xl font-black uppercase text-white">
                      Public Visibility
                    </h2>
                  </div>

                  <Lock className="h-7 w-7 text-gold" />
                </div>

                <div className="space-y-3">
                  <SettingRow
                    icon={Wallet}
                    title="Show Wallet Balance"
                    description="Allow others to see your public MVP Crowns balance."
                    enabled={showWallet}
                    onChange={() => setShowWallet((current) => !current)}
                  />

                  <SettingRow
                    icon={Eye}
                    title="Show Team Stats"
                    description="Allow others to view your team analytics."
                    enabled={showStats}
                    onChange={() => setShowStats((current) => !current)}
                  />

                  <SettingRow
                    icon={Shield}
                    title="Allow Invites"
                    description="Let online coaches send you instant match invites."
                    enabled={allowInvites}
                    onChange={() => setAllowInvites((current) => !current)}
                  />
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.stadiumFlare}
                alt="Game preferences glow"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                      Game Preferences
                    </p>
                    <h2 className="mt-1 text-2xl font-black uppercase text-white">
                      Simulation Controls
                    </h2>
                  </div>

                  <Gamepad2 className="h-7 w-7 text-gold" />
                </div>

                <div className="space-y-3">
                  <SettingRow
                    icon={Gamepad2}
                    title="Auto Simulate AI Games"
                    description="Allow AI matches to resolve without live broadcast."
                    enabled={autoSimulate}
                    onChange={() => setAutoSimulate((current) => !current)}
                  />

                  <SettingRow
                    icon={Radio}
                    title="Show Prediction Markets"
                    description="Display spectator prediction panels during live games."
                    enabled={showPredictions}
                    onChange={() => setShowPredictions((current) => !current)}
                  />
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-danger/30 bg-danger/10 p-5 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_38%)]" />

          <div className="relative">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-danger/25 bg-danger/10 text-danger">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-danger">
                  Danger Zone
                </p>

                <h2 className="mt-1 text-2xl font-black uppercase text-white">
                  Delete Franchise
                </h2>

                <p className="mt-1 text-sm leading-6 text-text-muted">
                  This removes the franchise from your teams, active games,
                  completed game references, game plan data, depth chart data,
                  and primary franchise selection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px_220px]">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                  Select Franchise
                </label>

                <select
                  value={teamToDelete}
                  onChange={(event) => {
                    setTeamToDelete(event.target.value);
                    setDeleteConfirmText("");
                    setDeleteMessage("");
                  }}
                  className="w-full rounded-2xl border border-danger/25 bg-navy-secondary px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-danger/50"
                >
                  <option value="">Choose franchise...</option>

                  {franchises.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name ?? `${team.city} ${team.nickname}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                  Type DELETE
                </label>

                <input
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-2xl border border-danger/25 bg-navy-secondary px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-text-muted focus:border-danger/50"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  className="w-full gap-2 border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                  onClick={deleteSelectedFranchise}
                  disabled={!teamToDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {selectedDeleteTeam ? (
              <div className="mt-4 rounded-2xl border border-danger/20 bg-navy-card/70 p-4">
                <div className="flex items-center gap-3">
                  <TeamHelmetVisual team={selectedDeleteTeam} size="sm" />

                  <div className="min-w-0">
                    <p className="break-words text-sm font-black uppercase text-white">
                      Selected:{" "}
                      {selectedDeleteTeam.name ??
                        `${selectedDeleteTeam.city} ${selectedDeleteTeam.nickname}`}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      City: {selectedDeleteTeam.city} · OVR{" "}
                      {selectedDeleteTeam.overallRating} · Record{" "}
                      {selectedDeleteTeam.record.wins}-
                      {selectedDeleteTeam.record.losses}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {deleteMessage ? (
              <p className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-sm font-bold text-danger">
                {deleteMessage}
              </p>
            ) : null}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
          <AssetImage
            src={teamVisualAssets.backgrounds.field}
            alt="Settings note field"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
            fallbackClassName="hidden"
          />

          <div className="relative flex items-start gap-3">
            <Zap className="mt-1 h-5 w-5 shrink-0 text-gold" />
            <p className="break-words text-sm leading-6 text-text-muted">
              Settings now use your primary franchise card plus the custom
              layered helmet renderer. The Danger Zone can remove a franchise
              from local storage and trigger updates across the app.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}