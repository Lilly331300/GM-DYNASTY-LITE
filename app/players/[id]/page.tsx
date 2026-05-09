"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Star,
  TrendingUp,
  AlertTriangle,
  User,
  Ruler,
  Weight,
  Calendar,
  GraduationCap,
  Activity,
  Zap,
  Brain,
  Heart,
  Target,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { getPlayerById, getTeamById } from "@/lib/mockData";
import { getRatingColor, getPositionColor } from "@/lib/utils";

export default function PlayerProfilePage() {
  const params = useParams();
  const player = getPlayerById(params.id as string);
  const team = getTeamById("team_001");

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Player Not Found</h2>
          <Link href="/roster">
            <Button variant="secondary" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roster
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const physicalTraits = [
    { label: "Speed", value: player.speed, icon: Zap },
    { label: "Strength", value: player.strength, icon: Shield },
    { label: "Agility", value: player.agility, icon: Activity },
    { label: "Explosiveness", value: player.explosiveness, icon: TrendingUp },
  ];

  const footballTraits = [
    { label: "Passing", value: player.passing, show: !!player.passing },
    { label: "Running", value: player.running, show: !!player.running },
    { label: "Receiving", value: player.receiving, show: !!player.receiving },
    { label: "Blocking", value: player.blocking, show: !!player.blocking },
    { label: "Rush Defense", value: player.rushDefense, show: !!player.rushDefense },
    { label: "Coverage", value: player.coverage, show: !!player.coverage },
    { label: "Tackling", value: player.tackling, show: !!player.tackling },
    { label: "Run Defense", value: player.runDefense, show: !!player.runDefense },
    { label: "Kicking", value: player.kicking, show: !!player.kicking },
    { label: "Punting", value: player.punting, show: !!player.punting },
  ].filter((t) => t.show);

  const hiddenTraitsHint = [
    { label: "Consistency", value: player.consistency },
    { label: "Intelligence", value: player.intelligence },
    { label: "Durability", value: player.durability },
    { label: "Work Ethic", value: player.workEthic },
    { label: "Desire", value: player.desire },
    { label: "Intangibles", value: player.intangibles },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/roster">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Roster
        </Button>
      </Link>

      {/* Player Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, ${team?.primaryColor || "#7A1E2C"}, ${team?.secondaryColor || "#F5C542"})`,
            }}
          />
          
          <CardContent className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Player Avatar */}
              {/* IMAGE PLACEHOLDER: Replace with /public/assets/players/{player.id}.png */}
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-navy-secondary to-navy-border flex items-center justify-center flex-shrink-0">
                <span className="text-3xl lg:text-4xl font-bold text-text-light">
                  {player.firstName[0]}{player.lastName[0]}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {player.firstName} {player.lastName}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`text-sm ${getPositionColor(player.position)} text-white border-0`}
                  >
                    {player.position}
                  </Badge>
                  {player.isStarter && (
                    <Badge variant="success" className="text-xs">
                      Starter
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    #{player.number}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Age {player.age}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    {player.height}
                  </span>
                  <span className="flex items-center gap-1">
                    <Weight className="w-4 h-4" />
                    {player.weight} lbs
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {player.college}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {player.experience} Years
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {player.specialSkill && (
                    <Badge variant="gold" className="text-sm">
                      <Star className="w-3 h-3 mr-1" />
                      {player.specialSkill}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-xs ${
                    player.status === "Healthy" ? "text-success bg-success/10 border-success/20" :
                    player.status === "Questionable" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
                    player.status === "Injured" ? "text-danger bg-danger/10 border-danger/20" :
                    "text-text-muted bg-text-muted/10 border-text-muted/20"
                  }`}>
                    {player.status}
                  </Badge>
                </div>
              </div>
              
              {/* Overall Rating */}
              <div className="flex flex-col items-center bg-navy-secondary/80 rounded-xl p-4 border border-navy-border">
                <span className="text-xs text-text-muted uppercase tracking-wider mb-1">Overall</span>
                <span className={`text-4xl font-bold tabular-nums ${getRatingColor(player.overallRating)}`}>
                  {player.overallRating}
                </span>
                <ProgressBar value={player.overallRating} max={100} color="gold" size="sm" className="w-24 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Physical Traits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-electric" />
                <span className="section-title">Physical Traits</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {physicalTraits.map((trait) => (
                <div key={trait.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <trait.icon className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-light">{trait.label}</span>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${getRatingColor(trait.value)}`}>
                      {trait.value}
                    </span>
                  </div>
                  <ProgressBar value={trait.value} max={100} color="electric" size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Middle Column - Football Traits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-success" />
                <span className="section-title">Football Skills</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {footballTraits.map((trait) => (
                <div key={trait.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-light">{trait.label}</span>
                    <span className={`text-sm font-bold tabular-nums ${getRatingColor(trait.value || 0)}`}>
                      {trait.value}
                    </span>
                  </div>
                  <ProgressBar value={trait.value || 0} max={100} color="success" size="sm" />
                </div>
              ))}
              {footballTraits.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No specific skills for this position
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Hidden Traits & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Hidden Traits - Scouting Uncertainty */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gold" />
                <span className="section-title">Scouting Report</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-muted mb-4">
                Hidden traits are partially visible through scouting. Higher intelligence scouts reveal more.
              </p>
              <div className="space-y-3">
                {hiddenTraitsHint.map((trait) => (
                  <div key={trait.label} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-light">{trait.label}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-navy-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold/30 to-gold/60 rounded-full"
                            style={{ width: `${(trait.value / 100) * 60 + 20}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-8 text-right">???</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full ${
                            i <= Math.round(trait.value / 20)
                              ? "bg-gold/40"
                              : "bg-navy-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Stats Placeholder */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-wine" />
                <span className="section-title">Career Stats</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-navy-secondary rounded-lg p-3 text-center border border-navy-border">
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-text-muted">Games Played</p>
                </div>
                <div className="bg-navy-secondary rounded-lg p-3 text-center border border-navy-border">
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-text-muted">Seasons</p>
                </div>
              </div>
              <p className="text-xs text-text-muted text-center mt-4">
                Season stats will appear after your first game
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}