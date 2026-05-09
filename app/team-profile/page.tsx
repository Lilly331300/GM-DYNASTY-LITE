"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  Edit3,
  TrendingUp,
  Trophy,
  Users,
  Crown,
  Star,
  Zap,
  ClipboardList,
  Swords,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/cards/StatCard";
import { getTeamById, mockTeams } from "@/lib/mockData";

const recentForm = [
  { result: "W", opponent: "Sea Rats", score: "28-21", date: "May 18" },
  { result: "W", opponent: "Grid Kings", score: "31-14", date: "May 11" },
  { result: "L", opponent: "Blitz City", score: "17-24", date: "May 4" },
  { result: "W", opponent: "Iron Wolves", score: "24-20", date: "Apr 27" },
  { result: "W", opponent: "Storm", score: "35-10", date: "Apr 20" },
];

const achievements = [
  { name: "First Victory", desc: "Win your first match", unlocked: true },
  { name: "Winning Streak", desc: "Win 5 matches in a row", unlocked: true },
  { name: "Playoff Bound", desc: "Reach the playoffs", unlocked: true },
  { name: "Champion", desc: "Win the championship", unlocked: false },
  { name: "Dynasty Builder", desc: "Win 3 championships", unlocked: false },
];

export default function TeamProfilePage() {
  const team = getTeamById("team_001");
  const [nflSyncEnabled, setNflSyncEnabled] = useState(team?.nflSync.enabled || false);

  if (!team) return null;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
            }}
          />
          
          <CardContent className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Team Logo */}
              <div
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl flex items-center justify-center text-white font-bold text-3xl lg:text-4xl shadow-xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
                }}
              >
                {team.abbreviation}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{team.name}</h1>
                  <button className="p-1.5 rounded-lg hover:bg-navy-secondary transition-colors">
                    <Edit3 className="w-4 h-4 text-text-muted" />
                  </button>
                  <Badge variant="outline" className="text-xs">
                    {team.conference}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {team.division}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {team.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team.fanBase.toLocaleString()} fans
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Est. 2024
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {team.record.wins}-{team.record.losses} Record
                  </Badge>
                  <Badge variant="gold" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Rank #{team.leagueRank}
                  </Badge>
                  <Badge variant="info" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Prestige {team.prestige.toLocaleString()}
                  </Badge>
                </div>
              </div>
              
              {/* Overall Rating */}
              <div className="flex flex-col items-center bg-navy-secondary/80 rounded-xl p-4 border border-navy-border">
                <span className="text-xs text-text-muted uppercase tracking-wider mb-1">Overall</span>
                <span className="text-4xl font-bold text-gold tabular-nums">{team.overallRating}</span>
                <ProgressBar value={team.overallRating} max={100} color="gold" size="sm" className="w-24 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Offense"
          value={team.offensiveRating}
          subtitle="Team Rating"
          icon={Zap}
          color="electric"
          delay={0.1}
        />
        <StatCard
          title="Defense"
          value={team.defensiveRating}
          subtitle="Team Rating"
          icon={Shield}
          color="success"
          delay={0.15}
        />
        <StatCard
          title="Special Teams"
          value={team.specialTeamsRating}
          subtitle="Team Rating"
          icon={Star}
          color="gold"
          delay={0.2}
        />
        <StatCard
          title="Prestige"
          value={team.prestige.toLocaleString()}
          subtitle="All Time"
          icon={Crown}
          color="wine"
          delay={0.25}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ratings Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-electric" />
                  <span className="section-title">Team Ratings</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Offensive Rating</span>
                    <span className="text-sm font-bold text-electric">{team.offensiveRating}</span>
                  </div>
                  <ProgressBar value={team.offensiveRating} max={100} color="electric" size="md" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Defensive Rating</span>
                    <span className="text-sm font-bold text-success">{team.defensiveRating}</span>
                  </div>
                  <ProgressBar value={team.defensiveRating} max={100} color="success" size="md" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Special Teams</span>
                    <span className="text-sm font-bold text-gold">{team.specialTeamsRating}</span>
                  </div>
                  <ProgressBar value={team.specialTeamsRating} max={100} color="gold" size="md" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-light">Overall</span>
                    <span className="text-sm font-bold text-white">{team.overallRating}</span>
                  </div>
                  <ProgressBar value={team.overallRating} max={100} color="wine" size="md" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="section-title">Recent Form</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-navy-border">
                  {recentForm.map((game, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-6 py-3 hover:bg-navy-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={game.result === "W" ? "success" : "danger"}
                          className="w-8 h-8 flex items-center justify-center p-0 text-sm font-bold"
                        >
                          {game.result}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {game.result === "W" ? "Beat" : "Lost to"} {game.opponent}
                          </p>
                          <p className="text-xs text-text-muted">{game.date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white tabular-nums">{game.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  <span className="section-title">Achievements</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        achievement.unlocked
                          ? "bg-gold/5 border-gold/20"
                          : "bg-navy-secondary/30 border-navy-border opacity-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          achievement.unlocked
                            ? "bg-gold/20"
                            : "bg-navy-secondary"
                        }`}
                      >
                        <Trophy
                          className={`w-5 h-5 ${
                            achievement.unlocked ? "text-gold" : "text-text-muted"
                          }`}
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${achievement.unlocked ? "text-white" : "text-text-muted"}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-text-muted">{achievement.desc}</p>
                      </div>
                      {achievement.unlocked && (
                        <Check className="w-4 h-4 text-success ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* NFL Sync */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-success" />
                    <h3 className="text-lg font-bold text-white">NFL Sync</h3>
                  </div>
                  <button onClick={() => setNflSyncEnabled(!nflSyncEnabled)}>
                    {nflSyncEnabled ? (
                      <ToggleRight className="w-10 h-6 text-success" />
                    ) : (
                      <ToggleLeft className="w-10 h-6 text-text-muted" />
                    )}
                  </button>
                </div>

                {nflSyncEnabled && team.nflSync.nflTeam ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-navy-secondary rounded-lg border border-navy-border">
                      <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{team.nflSync.nflTeam}</p>
                        <p className="text-xs text-text-muted">Synced Team</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Prestige Bonus</span>
                        <span className="text-success font-bold">+250/week</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Credit Bonus</span>
                        <span className="text-gold font-bold">+100 MVP</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Morale Boost</span>
                        <span className="text-electric font-bold">+5%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    Enable NFL Sync to connect with a real NFL team and earn bonus rewards.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="section-title mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/game-plan">
                    <Button variant="secondary" className="w-full justify-between gap-2 mb-2">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Edit Game Plan
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/roster">
                    <Button variant="secondary" className="w-full justify-between gap-2 mb-2">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        View Roster
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/challenge-hub">
                    <Button variant="secondary" className="w-full justify-between gap-2 mb-2">
                      <span className="flex items-center gap-2">
                        <Swords className="w-4 h-4" />
                        Enter Challenge Hub
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/depth-chart">
                    <Button variant="secondary" className="w-full justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Manage Depth Chart
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="section-title mb-4">Team Identity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Primary</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: team.primaryColor }}
                      />
                      <span className="text-sm text-text-light">{team.primaryColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Secondary</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: team.secondaryColor }}
                      />
                      <span className="text-sm text-text-light">{team.secondaryColor}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-navy-border">
                    <div
                      className="h-16 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}