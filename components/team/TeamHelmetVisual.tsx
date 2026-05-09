"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getTeamDisplayName,
  getTeamHelmetSrc,
  type VisualTeam,
} from "@/lib/teamVisuals";

type HelmetSize = "xs" | "sm" | "md" | "lg" | "xl" | "card";

type TeamVisualIdentity = {
  primaryColor?: string;
  secondaryColor?: string;
  helmetBaseSrc?: string;
  helmetGlowSrc?: string;
  selectedLogoId?: string;
  logoSrc?: string;
  customLogoDataUrl?: string | null;
  cardBgSrc?: string;
  cardBgId?: string;
  builderVersion?: number;
};

type CustomVisualTeam = VisualTeam & {
  visualIdentity?: TeamVisualIdentity;
};

const fallbackBuilderAssets = {
  baseHelmet: "/assets/franchise-builder/helmets/base-white-helmet.png",
  helmetGlow: "/assets/franchise-builder/helmets/helmet-shadow-glow.png",
};

function getSizeClass(size: HelmetSize) {
  if (size === "xs") return "h-10 w-12";
  if (size === "sm") return "h-12 w-16";
  if (size === "md") return "h-16 w-20";
  if (size === "lg") return "h-24 w-32";
  if (size === "xl") return "h-32 w-44";
  return "h-48 w-64";
}

function getLogoSizeClass(size: HelmetSize) {
  if (size === "xs") return "left-[47%] top-[29%] h-4 w-4";
  if (size === "sm") return "left-[47%] top-[29%] h-5 w-5";
  if (size === "md") return "left-[47%] top-[29%] h-7 w-7";
  if (size === "lg") return "left-[47%] top-[29%] h-11 w-11";
  if (size === "xl") return "left-[47%] top-[29%] h-16 w-16";
  return "left-[47%] top-[29%] h-24 w-24";
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

function hasCustomVisualIdentity(team?: CustomVisualTeam) {
  return Boolean(
    team?.visualIdentity?.helmetBaseSrc &&
      team?.visualIdentity?.logoSrc &&
      team?.visualIdentity?.primaryColor
  );
}

export function TeamHelmetVisual({
  team,
  size = "md",
  className,
  showGlow = true,
}: {
  team?: CustomVisualTeam;
  size?: HelmetSize;
  className?: string;
  showGlow?: boolean;
}) {
  const visualIdentity = team?.visualIdentity;

  const sizeClass = getSizeClass(size);
  const logoSizeClass = getLogoSizeClass(size);

  if (!hasCustomVisualIdentity(team)) {
    return (
      <div className={cn("relative shrink-0 overflow-visible", sizeClass, className)}>
        <AssetImage
          src={getTeamHelmetSrc(team)}
          alt={`${getTeamDisplayName(team)} helmet`}
          className="h-full w-full object-contain drop-shadow-2xl"
          fallbackClassName="h-full w-full"
        />
      </div>
    );
  }

  const helmetBaseSrc =
    visualIdentity?.helmetBaseSrc ?? fallbackBuilderAssets.baseHelmet;

  const helmetGlowSrc =
    visualIdentity?.helmetGlowSrc ?? fallbackBuilderAssets.helmetGlow;

  const logoSrc =
    visualIdentity?.customLogoDataUrl ??
    visualIdentity?.logoSrc ??
    "/assets/franchise-builder/logos/bulldog.png";

  const primaryColor = visualIdentity?.primaryColor ?? "#0B1A2A";
  const secondaryColor = visualIdentity?.secondaryColor ?? "#F5C542";

  return (
    <div className={cn("relative shrink-0 overflow-visible", sizeClass, className)}>
      {showGlow ? (
        <AssetImage
          src={helmetGlowSrc}
          alt={`${getTeamDisplayName(team)} helmet glow`}
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-contain opacity-75"
          fallbackClassName="hidden"
        />
      ) : null}

      <AssetImage
        src={helmetBaseSrc}
        alt={`${getTeamDisplayName(team)} helmet base`}
        className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
        fallbackClassName="h-full w-full"
      />

      <div
        className="absolute inset-0 opacity-90 mix-blend-multiply"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          WebkitMaskImage: `url('${helmetBaseSrc}')`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: `url('${helmetBaseSrc}')`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />

      <AssetImage
        src={logoSrc}
        alt={`${getTeamDisplayName(team)} helmet logo`}
        className={cn("absolute object-contain drop-shadow-2xl", logoSizeClass)}
        fallbackClassName="hidden"
      />

      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_20%,rgba(255,255,255,0.28),transparent_22%)]" />
    </div>
  );
}

export default TeamHelmetVisual;