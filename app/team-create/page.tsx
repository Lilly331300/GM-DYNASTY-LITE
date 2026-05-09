"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Crown,
  ImagePlus,
  Palette,
  RefreshCw,
  Shield,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getUserFranchises, type StoredFranchiseTeam } from "@/lib/gameHub";
import { cn } from "@/lib/utils";

type LogoOption = {
  id: string;
  label: string;
  src: string;
};

type CardBgOption = {
  id: string;
  label: string;
  src: string;
};

type CityOption = {
  city: string;
  abbreviation: string;
  conference: string;
  division: string;
  marketValue: number;
};

type VisualIdentity = {
  primaryColor: string;
  secondaryColor: string;
  helmetBaseSrc: string;
  helmetGlowSrc: string;
  selectedLogoId: string;
  logoSrc: string;
  customLogoDataUrl: string | null;
  cardBgSrc: string;
  cardBgId: string;
  builderVersion: number;
};

const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";

const FRANCHISE_STORAGE_KEYS = [
  "gmdl_user_franchises",
  "gmdl_franchises",
  "gmdl_owned_franchises",
];

const builderAssets = {
  baseHelmet: "/assets/franchise-builder/helmets/base-white-helmet.png",
  helmetGlow: "/assets/franchise-builder/helmets/helmet-shadow-glow.png",
  cardBackgrounds: {
    premiumCity: "/assets/franchise-builder/cards/card-bg-premium-city.png",
    stadium: "/assets/franchise-builder/cards/card-bg-stadium.png",
    cityNight: "/assets/franchise-builder/cards/card-bg-city-night.png",
    grunge: "/assets/franchise-builder/cards/card-bg-grunge.png",
  },
};

const logoOptions: LogoOption[] = [
  {
    id: "bulldog",
    label: "Bulldog",
    src: "/assets/franchise-builder/logos/bulldog.png",
  },
  {
    id: "hawk",
    label: "Hawk",
    src: "/assets/franchise-builder/logos/hawk.png",
  },
  {
    id: "wolf",
    label: "Wolf",
    src: "/assets/franchise-builder/logos/wolf.png",
  },
  {
    id: "shark",
    label: "Shark",
    src: "/assets/franchise-builder/logos/shark.png",
  },
  {
    id: "storm",
    label: "Storm",
    src: "/assets/franchise-builder/logos/storm.png",
  },
  {
    id: "crown",
    label: "Crown",
    src: "/assets/franchise-builder/logos/crown.png",
  },
  {
    id: "titan",
    label: "Titan",
    src: "/assets/franchise-builder/logos/titan.png",
  },
  {
    id: "dragon",
    label: "Dragon",
    src: "/assets/franchise-builder/logos/dragon.png",
  },
  {
    id: "panther",
    label: "Panther",
    src: "/assets/franchise-builder/logos/panther.png",
  },
  {
    id: "knight",
    label: "Knight",
    src: "/assets/franchise-builder/logos/knight.png",
  },
];

const cardBgOptions: CardBgOption[] = [
  {
    id: "premium-city",
    label: "Premium City",
    src: builderAssets.cardBackgrounds.premiumCity,
  },
  {
    id: "stadium",
    label: "Stadium",
    src: builderAssets.cardBackgrounds.stadium,
  },
  {
    id: "city-night",
    label: "City Night",
    src: builderAssets.cardBackgrounds.cityNight,
  },
  {
    id: "grunge",
    label: "Grunge",
    src: builderAssets.cardBackgrounds.grunge,
  },
];

const cityOptions: CityOption[] = [
  {
    city: "Milwaukee",
    abbreviation: "MIL",
    conference: "NFC",
    division: "NFC North",
    marketValue: 49,
  },
  {
    city: "Memphis",
    abbreviation: "MEM",
    conference: "AFC",
    division: "AFC South",
    marketValue: 51,
  },
  {
    city: "Kansas City",
    abbreviation: "KC",
    conference: "AFC",
    division: "AFC West",
    marketValue: 88,
  },
  {
    city: "Dallas",
    abbreviation: "DAL",
    conference: "NFC",
    division: "NFC East",
    marketValue: 96,
  },
  {
    city: "Miami",
    abbreviation: "MIA",
    conference: "AFC",
    division: "AFC East",
    marketValue: 82,
  },
  {
    city: "Chicago",
    abbreviation: "CHI",
    conference: "NFC",
    division: "NFC North",
    marketValue: 76,
  },
  {
    city: "New Orleans",
    abbreviation: "NO",
    conference: "NFC",
    division: "NFC South",
    marketValue: 73,
  },
  {
    city: "Houston",
    abbreviation: "HOU",
    conference: "AFC",
    division: "AFC South",
    marketValue: 74,
  },
  {
    city: "Seattle",
    abbreviation: "SEA",
    conference: "NFC",
    division: "NFC West",
    marketValue: 79,
  },
  {
    city: "Denver",
    abbreviation: "DEN",
    conference: "AFC",
    division: "AFC West",
    marketValue: 77,
  },
];

const colorPresets = [
  ["#0B1A2A", "#F5C542"],
  ["#102A43", "#38BDF8"],
  ["#3B0A45", "#B8F500"],
  ["#7A1E2C", "#F5C542"],
  ["#101820", "#D6D6D6"],
  ["#064E3B", "#A7F3D0"],
  ["#1D4ED8", "#CBD5E1"],
  ["#581C87", "#FACC15"],
  ["#831843", "#F9A8D4"],
  ["#172554", "#FB923C"],
];

const firstNames = [
  "Jalen",
  "Marcus",
  "Derrick",
  "Trevor",
  "Austin",
  "Malik",
  "Jordan",
  "Carter",
  "Rashad",
  "Tyler",
  "Noah",
  "Caleb",
  "Bryce",
  "Roman",
  "Eli",
  "Devin",
  "Miles",
  "Aaron",
  "Cole",
  "Justin",
];

const lastNames = [
  "Maddox",
  "King",
  "Vaughn",
  "Cooper",
  "Harris",
  "Walker",
  "Brooks",
  "Taylor",
  "Stone",
  "Reed",
  "Wright",
  "Porter",
  "Hayes",
  "Carter",
  "Bennett",
  "Moore",
  "Fields",
  "Collins",
  "Ward",
  "Owens",
];

const rosterSlots = [
  "QB",
  "RB",
  "FB",
  "WR",
  "WR",
  "WR",
  "TE",
  "LT",
  "LG",
  "C",
  "RG",
  "RT",
  "LE",
  "DT",
  "DT",
  "RE",
  "LOLB",
  "MLB",
  "ROLB",
  "CB",
  "CB",
  "CB",
  "FS",
  "SS",
  "K",
  "P",
  "KR",
  "PR",
];

const traits = [
  "Clutch",
  "Power Runner",
  "Route Technician",
  "Coverage Anchor",
  "Field General",
  "Deep Threat",
  "Pass Rush Specialist",
  "Core Player",
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

function safeWriteString(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log(`Unable to save ${key}`);
  }
}

function seededValue(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const normalized = x - Math.floor(x);
  return Math.floor(normalized * (max - min + 1)) + min;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getInitials(city: string, nickname: string) {
  const cityLetter = city.trim()[0] ?? "G";
  const nameLetter = nickname.trim()[0] ?? "M";
  return `${cityLetter}${nameLetter}`.toUpperCase();
}

function generatePlayers(teamId: string, baseRating: number) {
  const seedBase = teamId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return rosterSlots.map((position, index) => {
    const seed = seedBase + index * 17;
    const overall = seededValue(
      seed,
      Math.max(48, baseRating - 12),
      Math.min(91, baseRating + 14)
    );

    return {
      id: `${teamId}_player_${index + 1}`,
      teamId,
      name: `${firstNames[seededValue(seed + 1, 0, firstNames.length - 1)]} ${
        lastNames[seededValue(seed + 2, 0, lastNames.length - 1)]
      }`,
      firstName: firstNames[seededValue(seed + 1, 0, firstNames.length - 1)],
      lastName: lastNames[seededValue(seed + 2, 0, lastNames.length - 1)],
      number:
        position === "QB"
          ? seededValue(seed + 3, 1, 19)
          : position === "K" || position === "P"
            ? seededValue(seed + 4, 2, 19)
            : seededValue(seed + 5, 20, 99),
      position,
      age: seededValue(seed + 6, 21, 31),
      height: "6'1\"",
      weight: seededValue(seed + 7, 185, 325),
      overall,
      overallRating: overall,
      speed: seededValue(seed + 8, Math.max(45, overall - 12), Math.min(99, overall + 12)),
      strength: seededValue(seed + 9, Math.max(45, overall - 12), Math.min(99, overall + 12)),
      intelligence: seededValue(seed + 10, Math.max(45, overall - 10), Math.min(99, overall + 10)),
      consistency: seededValue(seed + 11, Math.max(45, overall - 10), Math.min(99, overall + 10)),
      stamina: seededValue(seed + 12, Math.max(45, overall - 8), Math.min(99, overall + 10)),
      agility: seededValue(seed + 13, Math.max(45, overall - 10), Math.min(99, overall + 12)),
      explosiveness: seededValue(seed + 14, Math.max(45, overall - 10), Math.min(99, overall + 12)),
      experience: seededValue(seed + 15, 0, 8),
      college: "GM Academy",
      status: "Healthy",
      trait: traits[seededValue(seed + 16, 0, traits.length - 1)],
      specialSkill: traits[seededValue(seed + 17, 0, traits.length - 1)],
      isStarter: index < 24,
      depthPosition: index + 1,
      workEthic: seededValue(seed + 18, 55, 95),
      desire: seededValue(seed + 19, 55, 95),
      intangibles: seededValue(seed + 20, 55, 95),
      durability: seededValue(seed + 21, 55, 95),
    };
  });
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

function DynamicHelmet({
  primaryColor,
  secondaryColor,
  logoSrc,
  size = "lg",
}: {
  primaryColor: string;
  secondaryColor: string;
  logoSrc: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass =
    size === "xl"
      ? "h-72 w-80"
      : size === "lg"
        ? "h-48 w-60"
        : size === "md"
          ? "h-28 w-36"
          : "h-16 w-20";

  return (
    <div className={cn("relative shrink-0", sizeClass)}>
      <AssetImage
        src={builderAssets.helmetGlow}
        alt="Helmet glow"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-contain opacity-80"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={builderAssets.baseHelmet}
        alt="Base helmet"
        className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
        fallbackClassName="h-full w-full"
      />

      <div
        className="absolute inset-0 opacity-90 mix-blend-multiply"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          WebkitMaskImage: `url('${builderAssets.baseHelmet}')`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: `url('${builderAssets.baseHelmet}')`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />

      <AssetImage
        src={logoSrc}
        alt="Helmet logo"
        className={cn(
          "absolute object-contain drop-shadow-2xl",
          size === "xl"
            ? "left-[47%] top-[29%] h-24 w-24"
            : size === "lg"
              ? "left-[47%] top-[29%] h-16 w-16"
              : size === "md"
                ? "left-[47%] top-[29%] h-10 w-10"
                : "left-[47%] top-[29%] h-6 w-6"
        )}
        fallbackClassName="hidden"
      />

      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_20%,rgba(255,255,255,0.30),transparent_22%)]" />
    </div>
  );
}

function FranchiseCardPreview({
  city,
  nickname,
  rating,
  cardBgSrc,
  primaryColor,
  secondaryColor,
  logoSrc,
}: {
  city: string;
  nickname: string;
  rating: number;
  cardBgSrc: string;
  primaryColor: string;
  secondaryColor: string;
  logoSrc: string;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[620px] overflow-hidden rounded-[2rem] border border-gold/30 bg-navy-card shadow-2xl">
      <AssetImage
        src={cardBgSrc}
        alt="Franchise card background"
        className="absolute inset-0 h-full w-full object-cover"
        fallbackClassName="h-full w-full"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_24%),linear-gradient(180deg,rgba(11,26,42,0.08),rgba(11,26,42,0.44)_55%,rgba(0,0,0,0.82))]" />

      <div className="absolute left-5 right-5 top-6 text-center">
        <h2 className="break-words text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_5px_0_rgba(0,0,0,0.35)] md:text-6xl">
          {city || "City"}
        </h2>
      </div>

      <div className="absolute inset-x-0 top-[22%] flex justify-center">
        <DynamicHelmet
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          logoSrc={logoSrc}
          size="xl"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gold/30 bg-black/76 px-6 py-7 text-center backdrop-blur">
        <p className="text-3xl font-black uppercase tracking-[0.12em] text-white md:text-5xl">
          {nickname || "Franchise"}
        </p>

        <div className="mx-auto mt-5 flex h-20 w-28 items-center justify-center rounded-t-[2rem] border border-gold/40 bg-gold text-4xl font-black text-navy-primary shadow-[0_0_32px_rgba(245,197,66,0.28)]">
          {rating}
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-navy-card p-3 text-left transition hover:-translate-y-0.5 hover:border-gold/40",
        active
          ? "border-gold/60 shadow-[0_0_0_1px_rgba(245,197,66,0.25),0_18px_40px_rgba(0,0,0,0.24)]"
          : "border-navy-border",
        className
      )}
    >
      {active ? (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-gold p-1 text-navy-primary">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      ) : null}
      {children}
    </button>
  );
}

function saveFranchise(team: StoredFranchiseTeam) {
  const current = getUserFranchises();
  const next = [...current.filter((item) => item.id !== team.id), team];

  FRANCHISE_STORAGE_KEYS.forEach((key) => {
    const existing = safeReadJson<StoredFranchiseTeam[]>(key, current);
    const merged = [...existing.filter((item) => item.id !== team.id), team];
    safeWriteJson(key, merged);
  });

  safeWriteJson("gmdl_user_franchises", next);

  if (!window.localStorage.getItem(PRIMARY_FRANCHISE_KEY)) {
    safeWriteString(PRIMARY_FRANCHISE_KEY, team.id);
  }

  window.dispatchEvent(new Event("gmdl-storage-change"));
}

export default function TeamCreatePage() {
  const router = useRouter();

  const [city, setCity] = useState(cityOptions[0].city);
  const [nickname, setNickname] = useState("Bulldogs");
  const [primaryColor, setPrimaryColor] = useState("#0B1A2A");
  const [secondaryColor, setSecondaryColor] = useState("#F5C542");
  const [selectedLogoId, setSelectedLogoId] = useState("bulldog");
  const [customLogoDataUrl, setCustomLogoDataUrl] = useState<string | null>(null);
  const [selectedCardBgId, setSelectedCardBgId] = useState("premium-city");
  const [nflSync, setNflSync] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedCity = useMemo(
    () => cityOptions.find((item) => item.city === city) ?? cityOptions[0],
    [city]
  );

  const selectedLogo = useMemo(
    () => logoOptions.find((item) => item.id === selectedLogoId) ?? logoOptions[0],
    [selectedLogoId]
  );

  const selectedCardBg = useMemo(
    () =>
      cardBgOptions.find((item) => item.id === selectedCardBgId) ??
      cardBgOptions[0],
    [selectedCardBgId]
  );

  const logoSrc = customLogoDataUrl ?? selectedLogo.src;

  const rating = useMemo(() => {
    const base = Math.round(selectedCity.marketValue * 0.55);
    const nicknameBonus = Math.min(8, nickname.trim().length);
    return Math.max(49, Math.min(84, base + nicknameBonus + 18));
  }, [nickname, selectedCity.marketValue]);

  const offensiveRating = Math.max(45, Math.min(90, rating + 1));
  const defensiveRating = Math.max(45, Math.min(90, rating + 2));
  const specialTeamsRating = Math.max(45, Math.min(90, rating - 1));

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const value = String(reader.result ?? "");
      setCustomLogoDataUrl(value);
      setSelectedLogoId("custom");
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const resetCustomLogo = () => {
    setCustomLogoDataUrl(null);
    setSelectedLogoId("bulldog");
  };

  const createFranchise = () => {
    setError("");

    const cleanCity = city.trim();
    const cleanNickname = nickname.trim();

    if (!cleanCity) {
      setError("Choose a franchise city.");
      return;
    }

    if (!cleanNickname || cleanNickname.length < 2) {
      setError("Enter a team nickname with at least 2 characters.");
      return;
    }

    const id = `team_${slugify(cleanCity)}_${slugify(cleanNickname)}_${Date.now()}`;

    const visualIdentity: VisualIdentity = {
      primaryColor,
      secondaryColor,
      helmetBaseSrc: builderAssets.baseHelmet,
      helmetGlowSrc: builderAssets.helmetGlow,
      selectedLogoId,
      logoSrc,
      customLogoDataUrl,
      cardBgSrc: selectedCardBg.src,
      cardBgId: selectedCardBg.id,
      builderVersion: 1,
    };

    const players = generatePlayers(id, rating);

    const newTeam = {
      id,
      ownerId: "user",
      name: `${cleanCity} ${cleanNickname}`,
      city: cleanCity,
      nickname: cleanNickname,
      abbreviation: selectedCity.abbreviation,
      primaryColor,
      secondaryColor,
      logoUrl: logoSrc,
      helmetUrl: builderAssets.baseHelmet,
      helmetAssetPath: builderAssets.baseHelmet,
      logoAssetPath: logoSrc,
      cardAssetPath: selectedCardBg.src,
      visualIdentity,
      overallRating: rating,
      offensiveRating,
      defensiveRating,
      specialTeamsRating,
      record: { wins: 0, losses: 0, ties: 0 },
      prestige: 500 + selectedCity.marketValue * 10,
      fanBase: 12000 + selectedCity.marketValue * 420,
      leagueRank: 32,
      division: selectedCity.division,
      conference: selectedCity.conference,
      nflSync: {
        enabled: nflSync,
        nflTeam: nflSync ? `${cleanCity} NFL Sync` : undefined,
        lastSync: nflSync ? new Date().toISOString() : undefined,
      },
      createdAt: new Date().toISOString(),
      isActive: true,
      players,
    } as unknown as StoredFranchiseTeam;

    saveFranchise(newTeam);
    setSaved(true);

    window.setTimeout(() => {
      router.push("/teams");
    }, 700);
  };

  return (
    <AppShell>
      <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={selectedCardBg.src}
            alt="Franchise builder background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            fallbackClassName="hidden"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.94),rgba(11,26,42,0.78),rgba(11,26,42,0.94))]" />

          <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px] xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Shield className="mr-1 h-3 w-3" />
                  Franchise Builder
                </Badge>

                <Badge variant="info">
                  <Palette className="mr-1 h-3 w-3" />
                  Custom Helmet
                </Badge>

                <Badge variant="success">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Dynamic Identity
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Create Franchise Identity
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-text-muted md:text-base">
                Build a complete franchise card using a custom helmet color,
                preset or uploaded logo, city identity, nickname, and premium
                football card background.
              </p>
            </div>

            <div className="rounded-3xl border border-gold/25 bg-gold/10 p-5">
              <div className="flex items-center gap-4">
                <DynamicHelmet
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  logoSrc={logoSrc}
                  size="md"
                />

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Live Helmet Mark
                  </p>
                  <h2 className="mt-2 break-words text-2xl font-black uppercase text-white">
                    {city} {nickname || "Franchise"}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    This helmet/logo identity is saved with the franchise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {error ? (
          <section className="rounded-3xl border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
            {error}
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_680px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Franchise Details
                  </h2>
                </div>

                <BadgeCheck className="h-7 w-7 text-gold" />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                    City
                  </label>

                  <div className="relative">
                    <select
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-bold text-white outline-none transition focus:border-gold/50"
                    >
                      {cityOptions.map((item) => (
                        <option key={item.city} value={item.city}>
                          {item.city} — ${item.marketValue}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                    Team Nickname
                  </label>

                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="Bulldogs"
                    className="w-full rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-text-muted focus:border-gold/50"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Abbrev
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {selectedCity.abbreviation}
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Value
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    ${selectedCity.marketValue}
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Rating
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {rating}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNflSync((current) => !current)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    nflSync
                      ? "border-success/35 bg-success/10"
                      : "border-navy-border bg-navy-secondary/60"
                  )}
                >
                  <p className="text-xs font-black uppercase text-text-muted">
                    NFL Sync
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-black",
                      nflSync ? "text-success" : "text-white"
                    )}
                  >
                    {nflSync ? "On" : "Off"}
                  </p>
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Step 2
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Helmet Colors
                  </h2>
                </div>

                <Palette className="h-7 w-7 text-gold" />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                    Primary Helmet Color
                  </label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className="h-14 w-full cursor-pointer rounded-2xl border border-navy-border bg-navy-secondary p-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                    Secondary Accent Color
                  </label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(event) => setSecondaryColor(event.target.value)}
                    className="h-14 w-full cursor-pointer rounded-2xl border border-navy-border bg-navy-secondary p-2"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                {colorPresets.map(([primary, secondary]) => (
                  <button
                    key={`${primary}-${secondary}`}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(primary);
                      setSecondaryColor(secondary);
                    }}
                    className={cn(
                      "h-14 rounded-2xl border transition hover:-translate-y-0.5 hover:border-gold/50",
                      primaryColor === primary && secondaryColor === secondary
                        ? "border-gold/70"
                        : "border-navy-border"
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    }}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Step 3
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Logo Selection
                  </h2>
                </div>

                <ImagePlus className="h-7 w-7 text-gold" />
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {logoOptions.map((logo) => (
                  <OptionCard
                    key={logo.id}
                    active={!customLogoDataUrl && selectedLogoId === logo.id}
                    onClick={() => {
                      setCustomLogoDataUrl(null);
                      setSelectedLogoId(logo.id);
                    }}
                  >
                    <div className="flex h-20 items-center justify-center">
                      <AssetImage
                        src={logo.src}
                        alt={logo.label}
                        className="h-16 w-16 object-contain"
                        fallbackClassName="h-16 w-16"
                      />
                    </div>
                    <p className="mt-2 truncate text-center text-xs font-black uppercase text-white">
                      {logo.label}
                    </p>
                  </OptionCard>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-dashed border-gold/25 bg-gold/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black uppercase text-white">
                      Upload Custom Logo
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      PNG with transparent background works best.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-black uppercase text-gold transition hover:border-gold/60">
                      <Upload className="h-4 w-4" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>

                    {customLogoDataUrl ? (
                      <Button
                        variant="secondary"
                        className="gap-2"
                        onClick={resetCustomLogo}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Use Presets
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Step 4
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Card Background
                  </h2>
                </div>

                <Crown className="h-7 w-7 text-gold" />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {cardBgOptions.map((bg) => (
                  <OptionCard
                    key={bg.id}
                    active={selectedCardBgId === bg.id}
                    onClick={() => setSelectedCardBgId(bg.id)}
                    className="p-0"
                  >
                    <div className="relative h-32 overflow-hidden rounded-2xl">
                      <AssetImage
                        src={bg.src}
                        alt={bg.label}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <p className="absolute bottom-3 left-3 text-sm font-black uppercase text-white">
                        {bg.label}
                      </p>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="sticky top-6 rounded-[2rem] border border-gold/30 bg-navy-card p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Live Preview
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Franchise Card
                  </h2>
                </div>

                <Sparkles className="h-7 w-7 text-gold" />
              </div>

              <FranchiseCardPreview
                city={city}
                nickname={nickname}
                rating={rating}
                cardBgSrc={selectedCardBg.src}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                logoSrc={logoSrc}
              />

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
                  <p className="text-xs font-black uppercase text-text-muted">
                    OFF
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {offensiveRating}
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
                  <p className="text-xs font-black uppercase text-text-muted">
                    DEF
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {defensiveRating}
                  </p>
                </div>

                <div className="rounded-2xl border border-gold/20 bg-gold/10 p-3 text-center">
                  <p className="text-xs font-black uppercase text-gold">ST</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {specialTeamsRating}
                  </p>
                </div>
              </div>

              <Button
                variant="gold"
                className="mt-5 w-full gap-2"
                onClick={createFranchise}
              >
                {saved ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {saved ? "Franchise Created" : "Create Franchise"}
              </Button>

              <p className="mt-4 text-center text-xs leading-5 text-text-muted">
                This saves the helmet color, logo, card background, ratings, and
                generated roster with the franchise.
              </p>
            </section>
          </aside>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gold/10 p-5 shadow-xl">
          <div className="flex items-start gap-3">
            <Users className="mt-1 h-5 w-5 shrink-0 text-gold" />
            <p className="text-sm leading-6 text-text-muted">
              The created team stores a `visualIdentity` object with the helmet
              base, selected colors, logo source, and franchise card background.
              Next, we can update the shared helmet renderer so Pregame, Live
              Game, Teams, Dashboard, Notifications, and Box Score display this
              custom layered helmet instead of only static helmet PNGs.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}