"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Shield, Radio, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getTeamById } from "@/lib/mockData";

export function UpcomingMatch() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 30 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const homeTeam = getTeamById("team_001");
  const awayTeam = getTeamById("team_002");
  
  if (!homeTeam || !awayTeam) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden">
        {/* Stadium Background Placeholder */}
        {/* IMAGE PLACEHOLDER: Replace with /public/assets/stadiums/dashboard-stadium.png */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-card via-navy-secondary to-navy-primary opacity-50" />
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&fit=crop")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <CardHeader className="relative border-navy-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-text-light">Next Game</span>
            </div>
            <Badge variant="warning" className="text-xs animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Starting Soon
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative p-6">
          {/* Teams */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${homeTeam.primaryColor}, ${homeTeam.secondaryColor})`,
                }}
              >
                {homeTeam.abbreviation}
              </div>
              <p className="text-sm font-bold text-white text-center">{homeTeam.name}</p>
              <p className="text-xs text-text-muted">OVR {homeTeam.overallRating}</p>
            </div>
            
            <div className="text-center px-4">
              <p className="text-3xl font-bold text-white mb-1">VS</p>
              <div className="flex items-center gap-1 text-xs text-gold">
                <Radio className="w-3 h-3" />
                <span>Live Sim</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${awayTeam.primaryColor}, ${awayTeam.secondaryColor})`,
                }}
              >
                {awayTeam.abbreviation}
              </div>
              <p className="text-sm font-bold text-white text-center">{awayTeam.name}</p>
              <p className="text-xs text-text-muted">OVR {awayTeam.overallRating}</p>
            </div>
          </div>
          
          {/* Countdown */}
          <div className="bg-navy-primary/80 backdrop-blur-sm rounded-xl p-4 border border-navy-border mb-4">
            <p className="text-xs text-text-muted text-center mb-2 uppercase tracking-wider">Match Starts In</p>
            <div className="flex items-center justify-center gap-4">
              {[
                { value: timeLeft.hours, label: "HRS" },
                { value: timeLeft.minutes, label: "MIN" },
                { value: timeLeft.seconds, label: "SEC" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-navy-secondary rounded-lg flex items-center justify-center border border-navy-border mb-1">
                    <span className="text-xl font-bold text-white tabular-nums">
                      {item.value.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/game-plan" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full gap-2">
                <Shield className="w-4 h-4" />
                Game Plan
              </Button>
            </Link>
            <Link href="/live-game" className="flex-1">
              <Button variant="primary" size="sm" className="w-full gap-2">
                <Radio className="w-4 h-4" />
                Watch Live
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}