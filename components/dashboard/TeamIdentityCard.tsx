"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, MapPin, Edit3, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockUser, mockTeams } from "@/lib/mockData";
import { getTeamById } from "@/lib/mockData";

export function TeamIdentityCard() {
  const team = getTeamById("team_001");
  if (!team) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`
          }}
        />
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Team Helmet Placeholder */}
              {/* IMAGE PLACEHOLDER: Replace with /public/assets/helmets/default-helmet.png */}
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
                }}
              >
                {team.abbreviation}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                  <button className="p-1 rounded hover:bg-navy-secondary transition-colors">
                    <Edit3 className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{team.city}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {team.conference} {team.division}
                  </Badge>
                  {team.nflSync.enabled && (
                    <Badge variant="success" className="text-xs">
                      NFL Synced
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-secondary border border-navy-border">
                <Shield className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs text-text-muted">Overall</p>
                  <p className="text-2xl font-bold text-white tabular-nums">{team.overallRating}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ratings Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase">Offense</span>
                <span className="text-sm font-bold text-white">{team.offensiveRating}</span>
              </div>
              <ProgressBar 
                value={team.offensiveRating} 
                max={100} 
                color="electric" 
                size="sm" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase">Defense</span>
                <span className="text-sm font-bold text-white">{team.defensiveRating}</span>
              </div>
              <ProgressBar 
                value={team.defensiveRating} 
                max={100} 
                color="success" 
                size="sm" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase">Special Teams</span>
                <span className="text-sm font-bold text-white">{team.specialTeamsRating}</span>
              </div>
              <ProgressBar 
                value={team.specialTeamsRating} 
                max={100} 
                color="gold" 
                size="sm" 
              />
            </div>
          </div>
          
          {/* Record & Prestige */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-navy-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-secondary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Record</p>
                <p className="text-lg font-bold text-white">
                  {team.record.wins}-{team.record.losses}
                  {team.record.ties > 0 ? `-${team.record.ties}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Prestige</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {team.prestige.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}