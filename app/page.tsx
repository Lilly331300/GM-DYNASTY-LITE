"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Crown,
  Eye,
  Gamepad2,
  Gauge,
  Globe2,
  Lock,
  Menu,
  Play,
  Radio,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { brandAssets, landingAssets, teamAssets } from "@/lib/assets";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: 34 },
  show: { opacity: 1, x: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const teamShowcase = [
  {
    name: "Kansas City Kings",
    city: "Kansas City",
    nickname: "Kings",
    rating: 88,
    record: "8-2",
    color: "from-red-500/30",
    helmet: teamAssets.helmets.kansasCityKings,
    card: teamAssets.cards.kansasCityKings,
  },
  {
    name: "Dallas Storm",
    city: "Dallas",
    nickname: "Storm",
    rating: 84,
    record: "7-3",
    color: "from-blue-500/30",
    helmet: teamAssets.helmets.dallasStorm,
    card: teamAssets.cards.dallasStorm,
  },
  {
    name: "Miami Sharks",
    city: "Miami",
    nickname: "Sharks",
    rating: 81,
    record: "6-4",
    color: "from-cyan-400/30",
    helmet: teamAssets.helmets.miamiSharks,
    card: teamAssets.cards.miamiSharks,
  },
  {
    name: "Chicago Bruisers",
    city: "Chicago",
    nickname: "Bruisers",
    rating: 79,
    record: "5-5",
    color: "from-orange-500/30",
    helmet: teamAssets.helmets.chicagoBruisers,
    card: teamAssets.cards.chicagoBruisers,
  },
];

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
          "flex items-center justify-center rounded-3xl border border-dashed border-gold/20 bg-gradient-to-br from-navy-secondary via-navy-card to-navy-primary text-center text-xs font-black uppercase tracking-[0.24em] text-gold/70",
          fallbackClassName,
          className
        )}
      >
        Add Image
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

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge: string;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      <motion.div variants={fadeUp}>
        <Badge variant="gold" className="mb-4">
          <Sparkles className="mr-1 h-3 w-3" />
          {badge}
        </Badge>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="gmdl-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={fadeUp}
        className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-text-muted md:text-base"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

function FloatingStat({
  label,
  value,
  icon: Icon,
  className,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay }}
      className={cn(
        "rounded-3xl border border-white/10 bg-navy-card/80 p-4 shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="gmdl-number text-xl font-black text-white">{value}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FranchiseFeatureVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.16),transparent_44%),linear-gradient(135deg,#16283A,#0B1A2A)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,197,66,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,197,66,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[6%] top-[18%] z-10 w-[42%] rotate-[-10deg] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      >
        <AssetImage
          src={teamAssets.cards.chicagoBruisers}
          alt="Chicago Bruisers franchise card"
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="absolute left-[27%] top-[8%] z-20 w-[45%] rotate-[-3deg] overflow-hidden rounded-2xl border border-gold/25 shadow-2xl"
      >
        <AssetImage
          src={teamAssets.cards.kansasCityKings}
          alt="Kansas City Kings franchise card"
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
        className="absolute right-[7%] top-[16%] z-30 w-[42%] rotate-[8deg] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      >
        <AssetImage
          src={teamAssets.cards.dallasStorm}
          alt="Dallas Storm franchise card"
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[8%] left-[35%] z-40 w-[38%] rotate-[4deg] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      >
        <AssetImage
          src={teamAssets.cards.miamiSharks}
          alt="Miami Sharks franchise card"
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
        />
      </motion.div>

      <div className="absolute inset-x-5 bottom-4 z-50 flex items-center justify-between rounded-2xl border border-white/10 bg-navy-primary/80 px-4 py-3 backdrop-blur-lg">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">
            Team Collection
          </p>
          <p className="text-sm font-black uppercase text-white">
            Franchise Ownership
          </p>
        </div>
        <div className="rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase text-navy-primary">
          4 Teams
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  image,
  visual,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  image?: string;
  visual?: React.ReactNode;
}) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -7 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="group min-w-0 overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card shadow-2xl transition hover:border-gold/30"
    >
      <div className="relative h-52 overflow-hidden border-b border-navy-border bg-navy-secondary">
        {visual ? (
          visual
        ) : image ? (
          <AssetImage
            src={image}
            alt={title}
            className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
            fallbackClassName="h-full w-full"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.18),transparent_45%),linear-gradient(135deg,#16283A,#0B1A2A)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-navy-card via-navy-card/20 to-transparent" />

        <div className="absolute bottom-4 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/15 text-gold backdrop-blur">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="p-5">
        <h3 className="gmdl-display text-xl font-black uppercase text-white">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-text-muted">{description}</p>

        <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gold">
          Explore System
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </motion.article>
  );
}

function FranchiseCardShowcase() {
  return (
    <div className="relative mx-auto h-[530px] max-w-4xl overflow-visible">
      <div className="absolute inset-0 rounded-[3rem] bg-gold/10 blur-3xl" />

      {teamShowcase.map((team, index) => {
        const positions = [
          "left-[2%] top-[44px] rotate-[-8deg] z-10",
          "left-[23%] top-[8px] rotate-[-2deg] z-20",
          "right-[22%] top-[38px] rotate-[5deg] z-30",
          "right-[2%] top-[90px] rotate-[10deg] z-10",
        ];

        return (
          <motion.div
            key={team.name}
            initial={{ opacity: 0, y: 50, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: index * 0.08 }}
            whileHover={{ y: -18, scale: 1.04, rotate: 0, zIndex: 40 }}
            className={cn(
              "absolute hidden w-[250px] overflow-hidden rounded-[2rem] border border-white/10 bg-navy-card shadow-2xl lg:block",
              positions[index]
            )}
          >
            <AssetImage
              src={team.card}
              alt={`${team.name} franchise card`}
              className="h-[360px] w-full object-cover"
              fallbackClassName="h-[360px] w-full"
            />

            <div className="border-t border-navy-border bg-navy-primary/95 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase text-white">
                    {team.nickname}
                  </p>
                  <p className="text-xs text-text-muted">{team.city}</p>
                </div>

                <div className="rounded-xl bg-gold px-3 py-1 text-sm font-black text-navy-primary">
                  {team.rating}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75 }}
        className="relative z-30 mx-auto block w-full max-w-[360px] overflow-hidden rounded-[2.4rem] border border-gold/30 bg-navy-card shadow-2xl lg:hidden"
      >
        <AssetImage
          src={teamAssets.cards.kansasCityKings}
          alt="Kansas City Kings franchise card"
          className="h-[440px] w-full object-cover"
          fallbackClassName="h-[440px] w-full"
        />
      </motion.div>
    </div>
  );
}

function HelmetStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {teamShowcase.map((team) => (
        <motion.div
          key={team.name}
          variants={fadeUp}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="group relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl hover:border-gold/30"
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br to-transparent opacity-80",
              team.color
            )}
          />

          <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-white/10 blur-2xl" />

          <div className="relative mx-auto flex h-36 items-center justify-center">
            <AssetImage
              src={team.helmet}
              alt={`${team.name} helmet`}
              className="h-32 w-32 object-contain drop-shadow-2xl transition duration-500 group-hover:scale-110"
              fallbackClassName="h-32 w-32"
            />
          </div>

          <p className="relative mt-3 truncate text-center text-sm font-black uppercase text-white">
            {team.name}
          </p>

          <div className="relative mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-navy-primary/70 px-3 py-1 text-[10px] font-black uppercase text-text-muted">
              {team.record}
            </span>
            <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase text-navy-primary">
              OVR {team.rating}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PlayerPortraitStrip() {
  const players = [
    {
      title: "Quarterback",
      src: landingAssets.players.qb,
      role: "Field General",
      icon: Gauge,
    },
    {
      title: "Running Back",
      src: landingAssets.players.rb,
      role: "Power Runner",
      icon: Zap,
    },
    {
      title: "Wide Receiver",
      src: landingAssets.players.wr,
      role: "Deep Threat",
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {players.map((player, index) => {
        const Icon = player.icon;

        return (
          <motion.div
            key={player.title}
            variants={fadeUp}
            whileHover={{ y: -8 }}
            className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card shadow-2xl hover:border-gold/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.18),transparent_45%),linear-gradient(180deg,#16283A,#0B1A2A)]" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.25,
              }}
              className="absolute inset-x-0 bottom-0 h-[270px]"
            >
              <AssetImage
                src={player.src}
                alt={player.title}
                className="h-full w-full object-contain object-bottom drop-shadow-2xl"
                fallbackClassName="h-full w-full"
              />
            </motion.div>

            <div className="absolute left-5 right-5 top-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gold">
                    Player Face Asset
                  </p>
                  <h3 className="mt-1 text-xl font-black uppercase text-white">
                    {player.title}
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-2 text-sm font-semibold text-text-muted">
                {player.role}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -7 }}
      className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-6 shadow-xl hover:border-gold/25"
    >
      <div className="absolute right-[-50px] top-[-50px] h-32 w-32 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <Icon className="h-7 w-7" />
        </div>

        <span className="gmdl-number text-4xl font-black text-white/10">
          {step}
        </span>
      </div>

      <h3 className="gmdl-display relative text-xl font-black uppercase text-white">
        {title}
      </h3>
      <p className="relative mt-3 text-sm leading-6 text-text-muted">
        {description}
      </p>
    </motion.div>
  );
}

function LivePreview() {
  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-navy-border bg-navy-card shadow-2xl">
      <div className="relative h-[440px] overflow-hidden">
        <AssetImage
          src={landingAssets.sections.liveGamePreview}
          alt="Live game field preview"
          className="absolute inset-0 h-full w-full object-cover opacity-65"
          fallbackClassName="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,197,66,0.12),transparent_35%),linear-gradient(180deg,rgba(11,26,42,0.18),#0B1A2A)]" />

        <div className="absolute left-5 right-5 top-5 rounded-3xl border border-white/10 bg-navy-primary/82 p-4 backdrop-blur-xl">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <AssetImage
                src={teamAssets.helmets.kansasCityKings}
                alt="Kansas City Kings helmet"
                className="h-12 w-12 object-contain"
                fallbackClassName="h-12 w-12 rounded-2xl"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase text-white">
                  Kings
                </p>
                <p className="text-xs text-text-muted">Home</p>
              </div>
            </div>

            <div className="text-center">
              <p className="gmdl-score text-3xl font-black text-white">
                24 - 17
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-gold">
                Q4 · 02:18
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-black uppercase text-white">
                  Storm
                </p>
                <p className="text-xs text-text-muted">Away</p>
              </div>
              <AssetImage
                src={teamAssets.helmets.dallasStorm}
                alt="Dallas Storm helmet"
                className="h-12 w-12 object-contain"
                fallbackClassName="h-12 w-12 rounded-2xl"
              />
            </div>
          </div>
        </div>

        <motion.div
          animate={{ x: ["-15%", "82%", "-15%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-0 h-1 w-48 rounded-full bg-gold/80 blur-sm"
        />

        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.96, 1.05, 0.96] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[45%] top-[48%] h-5 w-5 rounded-full border-2 border-gold bg-gold/40 shadow-[0_0_28px_rgba(245,197,66,0.8)]"
        />

        <div className="absolute bottom-5 left-5 right-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: "Possession", value: "KC 38" },
            { label: "Last Play", value: "18 yd pass" },
            { label: "Win Prob.", value: "68%" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-navy-primary/80 p-4 backdrop-blur-xl"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                {item.label}
              </p>
              <p className="gmdl-number mt-1 text-xl font-black text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EconomyCard() {
  return (
    <motion.div
      variants={fadeLeft}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="rounded-[2rem] border border-navy-border bg-navy-card p-6 shadow-2xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">
            Wallet Preview
          </p>
          <h3 className="gmdl-display mt-2 text-2xl font-black uppercase text-white">
            MVP Crowns
          </h3>
        </div>

        <Wallet className="h-9 w-9 text-gold" />
      </div>

      <div className="rounded-3xl border border-gold/25 bg-gold/10 p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-gold">
          Available Balance
        </p>
        <p className="gmdl-score mt-2 text-5xl font-black text-white">12,450</p>
        <p className="mt-2 text-sm text-text-muted">
          1 MVP Crown = $1.00 / 1 USDT equivalent
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-navy-border bg-navy-secondary p-4">
          <Lock className="mb-2 h-5 w-5 text-text-muted" />
          <p className="text-sm font-black text-white">Deposit</p>
          <p className="text-xs text-text-muted">Coming soon</p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-secondary p-4">
          <Lock className="mb-2 h-5 w-5 text-text-muted" />
          <p className="text-sm font-black text-white">Withdraw</p>
          <p className="text-xs text-text-muted">Coming soon</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-navy-primary text-white">
      <style jsx global>{`
        .gmdl-display {
          font-family: "Bebas Neue", "Oswald", "Arial Narrow", Arial, sans-serif;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-shadow: none !important;
          filter: none !important;
        }

        .gmdl-score,
        .gmdl-number {
          font-family: "Arial Black", "Oswald", Arial, sans-serif;
          letter-spacing: -0.03em;
          text-shadow: none !important;
        }

        .gmdl-grid {
          background-image: linear-gradient(
              rgba(245, 197, 66, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(245, 197, 66, 0.06) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        .gmdl-light-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 35%,
            rgba(255, 255, 255, 0.08) 45%,
            rgba(245, 197, 66, 0.1) 50%,
            transparent 62%,
            transparent 100%
          );
          transform: translateX(-120%);
          animation: gmdlSweep 7s ease-in-out infinite;
        }

        @keyframes gmdlSweep {
          0% {
            transform: translateX(-120%);
          }
          48% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        .gmdl-marquee {
          animation: gmdlMarquee 28s linear infinite;
        }

        @keyframes gmdlMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-navy-primary/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold via-electric to-cyan-glow shadow-[0_0_30px_rgba(245,197,66,0.18)]">
              <AssetImage
                src={brandAssets.mark}
                alt="GM Dynasty logo"
                className="h-full w-full object-cover"
                fallbackClassName="h-full w-full"
              />
            </div>

            <div className="min-w-0">
              <p className="gmdl-display truncate text-sm font-black uppercase tracking-[0.26em] text-white">
                GM Dynasty
              </p>
              <p className="truncate text-[10px] font-black uppercase tracking-[0.36em] text-gold">
                Lite
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {[
              ["Features", "#features"],
              ["Live Games", "#live"],
              ["Teams", "#teams"],
              ["Players", "#players"],
              ["Economy", "#economy"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm font-semibold text-text-muted transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>

            <Link href="/signup">
              <Button variant="gold" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Toggle mobile navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-navy-primary/95 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="grid gap-2">
              {[
                ["Features", "#features"],
                ["Live Games", "#live"],
                ["Teams", "#teams"],
                ["Players", "#players"],
                ["Economy", "#economy"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-navy-border bg-navy-card px-4 py-3 text-sm font-bold text-white"
                >
                  {label}
                </a>
              ))}

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="gold" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen overflow-hidden pt-28">
        <div className="absolute inset-0">
          <AssetImage
            src={landingAssets.hero.stadiumBg}
            alt="Premium football stadium background"
            className="h-full w-full object-cover opacity-45"
            fallbackClassName="h-full w-full"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(245,197,66,0.18),transparent_32%),linear-gradient(90deg,#0B1A2A_0%,rgba(11,26,42,0.9)_42%,rgba(11,26,42,0.5)_100%)]" />
          <div className="absolute inset-0 gmdl-grid opacity-50" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-navy-primary to-transparent" />
          <div className="gmdl-light-sweep" />
        </div>

        <div className="absolute left-1/2 top-28 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute right-10 top-40 h-80 w-80 rounded-full bg-electric/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="mb-6 flex flex-wrap gap-3">
              <Badge variant="gold" size="md">
                <Zap className="mr-1 h-4 w-4" />
                Premium Football Simulation
              </Badge>

              <Badge variant="info" size="md">
                <Radio className="mr-1 h-4 w-4" />
                Live Match Control Room
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="gmdl-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Build the Team.
              <span className="block bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">
                Call the Strategy.
              </span>
              Watch the Dynasty Rise.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base font-medium leading-8 text-text-light/80 md:text-lg"
            >
              GM Dynasty Lite is a premium American football franchise simulation
              platform where owners create teams, build rosters, set tactics, accept
              challenges, watch live games, and compete for MVP Crowns.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/signup">
                <Button variant="gold" size="lg" className="w-full gap-2 sm:w-auto">
                  <Shield className="h-5 w-5" />
                  Create Franchise
                </Button>
              </Link>

              <Link href="/games-in-progress">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full gap-2 sm:w-auto"
                >
                  <Play className="h-5 w-5" />
                  Watch Live Games
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 grid max-w-2xl grid-cols-3 gap-3"
            >
              {[
                { label: "Franchises", value: "2.8K+" },
                { label: "Games Simmed", value: "156K" },
                { label: "Crowns Earned", value: "4.2M" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                >
                  <p className="gmdl-number text-2xl font-black text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative min-h-[560px]"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 bottom-0 mx-auto h-[520px] max-w-[520px]"
            >
              <AssetImage
                src={landingAssets.hero.coachPlayers}
                alt="GM Dynasty coach and football players"
                className="h-full w-full object-contain object-bottom drop-shadow-[0_35px_70px_rgba(0,0,0,0.55)]"
                fallbackClassName="h-full w-full"
              />
            </motion.div>

            <FloatingStat
              label="Team OVR"
              value="87"
              icon={Gauge}
              className="absolute left-0 top-20 hidden w-44 md:block"
            />

            <FloatingStat
              label="Live Games"
              value="142"
              icon={Radio}
              delay={0.35}
              className="absolute right-0 top-32 hidden w-48 md:block"
            />

            <FloatingStat
              label="MVP Crowns"
              value="12.4K"
              icon={Crown}
              delay={0.7}
              className="absolute bottom-24 left-8 hidden w-52 md:block"
            />

            <motion.div
              animate={{ rotate: [0, 3, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 right-2 hidden w-32 md:block"
            >
              <AssetImage
                src={teamAssets.helmets.kansasCityKings}
                alt="Kansas City Kings helmet"
                className="h-32 w-32 object-contain drop-shadow-2xl"
                fallbackClassName="h-32 w-32"
              />
            </motion.div>

            <div className="absolute bottom-0 left-1/2 h-20 w-[78%] -translate-x-1/2 rounded-[100%] bg-gold/20 blur-3xl" />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-navy-border bg-navy-secondary/35 py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: "Franchise Control", icon: Shield },
            { label: "Game Plan Logic", icon: ClipboardList },
            { label: "Live Simulation", icon: Radio },
            { label: "Crown Economy", icon: Crown },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-3">
              <item.icon className="h-5 w-5 text-gold" />
              <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Core Platform"
            title={
              <>
                One Product.{" "}
                <span className="bg-gradient-to-r from-gold to-amber-200 bg-clip-text text-transparent">
                  Full Football Loop.
                </span>
              </>
            }
            description="From franchise creation to scouting, game plan, challenge listing, live match, box score, wallet, and history — every page connects into a real product loop."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <FeatureCard
              icon={Shield}
              title="Franchise Ownership"
              description="Create custom teams, control city identity, manage team profile, and build a recognizable football brand."
              visual={<FranchiseFeatureVisual />}
            />

            <FeatureCard
              icon={ClipboardList}
              title="Game Plan System"
              description="Set offensive, defensive, and special teams strategy using football personnel and tactical sliders."
              image={landingAssets.sections.gamePlanPreview}
            />

            <FeatureCard
              icon={Swords}
              title="Challenge Hub"
              description="Create public, invite, free, paid, and AI matchups while preventing busy teams from being reused."
              image={landingAssets.sections.challengeHubPreview}
            />

            <FeatureCard
              icon={Radio}
              title="Live Games"
              description="Watch dynamic live game states, drive updates, scoreboards, and spectator-ready match presentation."
              image={landingAssets.sections.liveGamePreview}
            />

            <FeatureCard
              icon={Wallet}
              title="MVP Crown Economy"
              description="Paid challenges use a clean winner-takes-pool logic with platform maintenance fee handling."
              image={landingAssets.sections.walletPreview}
            />

            <FeatureCard
              icon={Eye}
              title="Scouting Reports"
              description="Study opponent strengths, tendencies, threats, and coaching notes before kickoff."
            />
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,197,66,0.12),transparent_34%),linear-gradient(180deg,#0B1A2A,#101F33,#0B1A2A)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Franchise Cards"
            title={
              <>
                Collectible Team Identity,{" "}
                <span className="text-gold">Modernized.</span>
              </>
            }
            description="Your generated franchise cards are now part of the landing page. This section shows the card direction: helmet, logo, city skyline, rating, and premium team identity."
          />

          <FranchiseCardShowcase />
        </div>
      </section>

      <section id="live" className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-primary via-navy-card/50 to-navy-primary" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge variant="gold" className="mb-4">
                <Radio className="mr-1 h-3 w-3" />
                Live Broadcast Feel
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="gmdl-display text-3xl font-black uppercase leading-tight text-white md:text-5xl"
            >
              Make the Match Feel Like a{" "}
              <span className="text-gold">Premium Control Room.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-sm leading-7 text-text-muted md:text-base"
            >
              The visual direction is broadcast-inspired: premium field images, animated
              possession lines, live score cards, helmets, player faces, and matchup
              overlays.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {[
                { icon: Radio, text: "Spectator mode" },
                { icon: Trophy, text: "Post-game analysis" },
                { icon: BarChart3, text: "Team comparison" },
                { icon: Gamepad2, text: "AI and PvP flow" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-2xl border border-navy-border bg-navy-card p-4"
                >
                  <item.icon className="h-5 w-5 text-gold" />
                  <span className="text-sm font-bold text-white">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <LivePreview />
          </motion.div>
        </div>
      </section>

      <section id="teams" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Team Identity"
            title={
              <>
                Every Franchise Needs a{" "}
                <span className="text-gold">Helmet, Logo, and Card.</span>
              </>
            }
            description="The landing page now uses your real generated helmet files. Later, these same asset paths can power dashboard cards, team pages, live game scoreboards, and box scores."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <HelmetStrip />
          </motion.div>
        </div>
      </section>

      <section id="players" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_32%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Player Faces"
            title={
              <>
                Roster Screens Should Feel{" "}
                <span className="text-gold">Alive.</span>
              </>
            }
            description="Player portraits make the product feel deeper. Quarterbacks, running backs, receivers, defenders, and prospects can all get face assets later."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <PlayerPortraitStrip />
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0">
          <AssetImage
            src={landingAssets.hero.tunnel}
            alt="Football stadium tunnel"
            className="h-full w-full object-cover opacity-30"
            fallbackClassName="h-full w-full"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,197,66,0.14),transparent_34%),linear-gradient(180deg,#0B1A2A,rgba(11,26,42,0.86),#0B1A2A)]" />
          <div className="gmdl-light-sweep" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="How It Works"
            title={
              <>
                From Signup to Kickoff in{" "}
                <span className="text-gold">Four Steps.</span>
              </>
            }
            description="The landing page explains the product clearly while using cinematic football visuals to make the experience feel premium."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            <StepCard
              step="01"
              icon={Shield}
              title="Create Team"
              description="Choose a city, nickname, identity, and prepare your first franchise."
            />
            <StepCard
              step="02"
              icon={Users}
              title="Set Roster"
              description="Review players, depth chart roles, position rooms, and key threats."
            />
            <StepCard
              step="03"
              icon={ClipboardList}
              title="Build Strategy"
              description="Set game plans, scouting reports, aggression, coverage, and special teams."
            />
            <StepCard
              step="04"
              icon={Trophy}
              title="Compete"
              description="Play AI, list challenges, watch live games, and review box scores."
            />
          </motion.div>
        </div>
      </section>

      <section id="economy" className="py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="rounded-[2rem] border border-gold/25 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_36%),linear-gradient(135deg,#101F33,#16283A)] p-6 shadow-2xl md:p-8"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="gold" className="mb-4">
                <Crown className="mr-1 h-3 w-3" />
                MVP Crown Economy
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="gmdl-display text-3xl font-black uppercase text-white md:text-5xl"
            >
              Competitive Matches With Clear Reward Logic.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-sm leading-7 text-text-muted md:text-base"
            >
              Free matches support growth and testing. Paid challenge matches can use MVP
              Crowns, where both players stake equally and the winner receives the pool
              minus a platform maintenance fee.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {[
                { label: "Stake", value: "Equal" },
                { label: "Winner", value: "Takes Pool" },
                { label: "Fee", value: "5%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-navy-border bg-navy-primary/60 p-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {item.label}
                  </p>
                  <p className="gmdl-number mt-1 text-2xl font-black text-gold">
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <EconomyCard />
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,197,66,0.16),transparent_34%),linear-gradient(135deg,#101F33,#0B1A2A)]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="gold" size="md">
            <Star className="mr-1 h-4 w-4" />
            Ready to Build?
          </Badge>

          <h2 className="gmdl-display mt-6 text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
            Start Your Football Dynasty.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-text-muted md:text-base">
            Create a franchise, build your roster identity, set your strategy, and enter
            the next generation of football management simulation.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button variant="gold" size="lg" className="w-full gap-2 sm:w-auto">
                <Shield className="h-5 w-5" />
                Create Franchise
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
                className="w-full gap-2 sm:w-auto"
              >
                <Globe2 className="h-5 w-5" />
                Enter Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-border bg-navy-primary py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <p className="gmdl-display text-sm font-black uppercase tracking-[0.24em] text-white">
              GM Dynasty Lite
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Premium football franchise simulation platform.
            </p>
          </div>

          <p className="text-xs text-text-muted">
            Built for franchise owners, strategists, spectators, and dynasty builders.
          </p>
        </div>
      </footer>
    </main>
  );
}