"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Crown,
  Dice5,
  MapPin,
  Palette,
  Plus,
  RefreshCcw,
  Shield,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { saveCreatedTeam } from "@/lib/gameHub";

interface CityOption {
  name: string;
  state: string;
  value: number;
  nflTeam?: string;
}

const cities: CityOption[] = [
  { name: "Kansas City", state: "MO", value: 100, nflTeam: "Kansas City Chiefs" },
  { name: "Dallas", state: "TX", value: 100, nflTeam: "Dallas Cowboys" },
  { name: "Philadelphia", state: "PA", value: 95, nflTeam: "Philadelphia Eagles" },
  { name: "San Francisco", state: "CA", value: 95, nflTeam: "San Francisco 49ers" },
  { name: "New York", state: "NY", value: 90, nflTeam: "New York Giants" },
  { name: "Los Angeles", state: "CA", value: 90, nflTeam: "Los Angeles Rams" },
  { name: "Miami", state: "FL", value: 85, nflTeam: "Miami Dolphins" },
  { name: "Chicago", state: "IL", value: 80, nflTeam: "Chicago Bears" },
  { name: "Seattle", state: "WA", value: 75, nflTeam: "Seattle Seahawks" },
  { name: "Detroit", state: "MI", value: 70, nflTeam: "Detroit Lions" },
  { name: "Atlanta", state: "GA", value: 65, nflTeam: "Atlanta Falcons" },
  { name: "New Orleans", state: "LA", value: 60, nflTeam: "New Orleans Saints" },
  { name: "Denver", state: "CO", value: 60, nflTeam: "Denver Broncos" },
  { name: "Cleveland", state: "OH", value: 55, nflTeam: "Cleveland Browns" },
  { name: "Las Vegas", state: "NV", value: 55, nflTeam: "Las Vegas Raiders" },
  { name: "Nashville", state: "TN", value: 50, nflTeam: "Tennessee Titans" },
];

const colorPresets = [
  { name: "Wine & Gold", primary: "#7A1E2C", secondary: "#F5C542" },
  { name: "Navy & Lime", primary: "#002244", secondary: "#69BE28" },
  { name: "Forest & Gold", primary: "#203731", secondary: "#FFB612" },
  { name: "Purple & Gold", primary: "#4F2683", secondary: "#FFC62F" },
  { name: "Cream & Black", primary: "#D3BC8D", secondary: "#101820" },
  { name: "Aqua & Orange", primary: "#008E97", secondary: "#FC4C02" },
];

function makeAbbreviation(value: string) {
  return value
    .split(" ")
    .map((item) => item[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

export function TeamCreationForm() {
  const router = useRouter();

  const [selectedCity, setSelectedCity] = useState<CityOption>(cities[0]);
  const [teamName, setTeamName] = useState("Kansas City Thunderbolts");
  const [nickname, setNickname] = useState("Thunderbolts");
  const [abbreviation, setAbbreviation] = useState("KCT");
  const [primaryColor, setPrimaryColor] = useState("#7A1E2C");
  const [secondaryColor, setSecondaryColor] = useState("#F5C542");
  const [nflSyncEnabled, setNflSyncEnabled] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [created, setCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const canCreate =
    !created &&
    !isCreating &&
    teamName.trim().length >= 2 &&
    nickname.trim().length >= 2 &&
    abbreviation.trim().length >= 2;

  const priceLabel = useMemo(() => {
    return selectedCity.value >= 90
      ? "Premium market"
      : selectedCity.value >= 70
        ? "Strong market"
        : "Value market";
  }, [selectedCity.value]);

  const randomCity = () => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    setSelectedCity(city);
    setTeamName(`${city.name} Franchise`);
    setNickname("Franchise");
    setAbbreviation(makeAbbreviation(city.name));
    setNflSyncEnabled(Boolean(city.nflTeam));
  };

  const handleLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createTeam = () => {
    if (!canCreate) return;

    setIsCreating(true);

    saveCreatedTeam({
      name: teamName.trim(),
      city: selectedCity.name,
      nickname: nickname.trim(),
      abbreviation: abbreviation.trim().toUpperCase(),
      primaryColor,
      secondaryColor,
      nflSyncEnabled,
      nflTeam: selectedCity.nflTeam,
      logoUrl,
    });

    setCreated(true);
    setIsCreating(false);
  };

  const createAnother = () => {
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-gold" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Step 1
              </p>
              <h2 className="text-2xl font-black uppercase text-white">
                Choose City
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={randomCity}
            disabled={created || isCreating}
            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-gold/30 bg-gold/10 p-4 text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Dice5 className="h-6 w-6 text-gold" />
              <div>
                <p className="font-black uppercase text-white">Take a Chance</p>
                <p className="text-sm text-text-muted">Random city option · $30</p>
              </div>
            </div>
            <Badge variant="gold">Random</Badge>
          </button>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {cities.map((city) => {
              const active = selectedCity.name === city.name;

              return (
                <button
                  key={city.name}
                  type="button"
                  disabled={created || isCreating}
                  onClick={() => {
                    setSelectedCity(city);
                    setTeamName(`${city.name} Franchise`);
                    setNickname("Franchise");
                    setAbbreviation(makeAbbreviation(city.name));
                    setNflSyncEnabled(Boolean(city.nflTeam));
                  }}
                  className={`rounded-2xl border p-4 text-left transition disabled:opacity-50 ${
                    active
                      ? "border-gold/60 bg-gold/10"
                      : "border-navy-border bg-navy-secondary/60 hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black uppercase text-white">{city.name}</p>
                      <p className="text-sm text-text-muted">
                        {city.state} · {city.nflTeam ?? "No sync team"}
                      </p>
                    </div>
                    <p className="text-xl font-black text-gold">${city.value}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <Shield className="h-6 w-6 text-gold" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Step 2
              </p>
              <h2 className="text-2xl font-black uppercase text-white">
                Team Identity
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Team Name
              </label>
              <input
                value={teamName}
                disabled={created || isCreating}
                onChange={(event) => {
                  setTeamName(event.target.value);
                  setAbbreviation(makeAbbreviation(event.target.value));
                }}
                className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus:border-gold/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Abbreviation
              </label>
              <input
                value={abbreviation}
                maxLength={3}
                disabled={created || isCreating}
                onChange={(event) => setAbbreviation(event.target.value.toUpperCase())}
                className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold uppercase text-white outline-none focus:border-gold/50 disabled:opacity-50"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-text-muted">
                Nickname
              </label>
              <input
                value={nickname}
                disabled={created || isCreating}
                onChange={(event) => setNickname(event.target.value)}
                className="w-full rounded-xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus:border-gold/50 disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <Palette className="h-6 w-6 text-gold" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Step 3
              </p>
              <h2 className="text-2xl font-black uppercase text-white">
                Colors & Logo
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                disabled={created || isCreating}
                onClick={() => {
                  setPrimaryColor(preset.primary);
                  setSecondaryColor(preset.secondary);
                }}
                className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4 text-left hover:border-gold/40 disabled:opacity-50"
              >
                <div className="mb-3 flex gap-2">
                  <span
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <p className="text-sm font-black uppercase text-white">{preset.name}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-gold/40 bg-gold/10 p-5 text-gold">
              <Upload className="h-5 w-5" />
              <span className="font-black uppercase">Upload Logo</span>
              <input
                type="file"
                accept="image/*"
                disabled={created || isCreating}
                className="hidden"
                onChange={handleLogo}
              />
            </label>

            <button
              type="button"
              disabled={created || isCreating}
              onClick={() => setNflSyncEnabled((current) => !current)}
              className={`rounded-2xl border p-5 text-left disabled:opacity-50 ${
                nflSyncEnabled
                  ? "border-success/40 bg-success/10"
                  : "border-navy-border bg-navy-secondary/60"
              }`}
            >
              <p className="font-black uppercase text-white">Sync with NFL</p>
              <p className="text-sm text-text-muted">
                {nflSyncEnabled
                  ? `Synced to ${selectedCity.nflTeam ?? selectedCity.name}`
                  : "Turn sync on to receive city performance points."}
              </p>
            </button>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-gold/30 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_36%),#101F33] p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Live Preview
          </p>

          <div className="mt-5 rounded-3xl border border-navy-border bg-navy-secondary/70 p-5">
            <div
              className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 text-2xl font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Team logo" className="h-full w-full rounded-3xl object-cover" />
              ) : (
                abbreviation || "GM"
              )}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              {selectedCity.name}
            </p>
            <h2 className="text-3xl font-black uppercase text-white">{nickname || "Franchise"}</h2>
            <p className="mt-1 text-sm text-text-muted">{teamName}</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-navy-card p-3 text-center">
                <p className="text-xs text-text-muted">OVR</p>
                <p className="text-2xl font-black text-white">55</p>
              </div>
              <div className="rounded-2xl bg-navy-card p-3 text-center">
                <p className="text-xs text-text-muted">Fans</p>
                <p className="text-2xl font-black text-white">12K</p>
              </div>
              <div className="rounded-2xl bg-navy-card p-3 text-center">
                <p className="text-xs text-text-muted">Price</p>
                <p className="text-2xl font-black text-gold">${selectedCity.value}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-navy-border bg-navy-card p-4">
              <p className="text-xs font-black uppercase text-text-muted">
                {priceLabel}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Created franchises will appear on the franchise page and can be selected for challenges.
              </p>
            </div>
          </div>

          {created && (
            <div className="mt-4 rounded-2xl border border-success/30 bg-success/10 p-4">
              <p className="flex items-center gap-2 font-black uppercase text-success">
                <CheckCircle2 className="h-5 w-5" />
                Franchise Created
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Your franchise has been saved with a random roster.
              </p>
            </div>
          )}

          {!created ? (
            <Button
              variant="gold"
              className="mt-5 w-full gap-2"
              onClick={createTeam}
              disabled={!canCreate}
            >
              {isCreating ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              {isCreating ? "Creating..." : "Create Franchise"}
            </Button>
          ) : (
            <div className="mt-5 space-y-3">
              <Button
                variant="gold"
                className="w-full gap-2"
                onClick={() => router.push("/teams")}
              >
                <Shield className="h-4 w-4" />
                View Franchises
              </Button>

              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={createAnother}
              >
                <Plus className="h-4 w-4" />
                Create Another Franchise
              </Button>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}