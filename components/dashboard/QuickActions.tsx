"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Swords,
  Bot,
  ClipboardList,
  Users,
  Radio,
  Trophy,
  Search,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

const actions = [
  { href: "/create-challenge", label: "Create Challenge", icon: Swords, color: "from-wine to-wine-deep", description: "Challenge a rival" },
  { href: "/challenge-hub", label: "Play AI", icon: Bot, color: "from-electric to-cyan-glow", description: "Test vs computer" },
  { href: "/game-plan", label: "Edit Game Plan", icon: ClipboardList, color: "from-success to-emerald-600", description: "Adjust strategy" },
  { href: "/roster", label: "View Roster", icon: Users, color: "from-gold to-amber-500", description: "Manage players" },
  { href: "/games-in-progress", label: "Watch Live", icon: Radio, color: "from-danger to-red-600", description: "Spectate games" },
  { href: "/challenge-hub", label: "Browse Games", icon: Trophy, color: "from-purple-500 to-purple-700", description: "Find matches" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card>
        <CardContent className="p-6">
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map((action, i) => (
              <motion.div
                key={action.href + action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              >
                <Link href={action.href}>
                  <div className="group relative bg-navy-secondary rounded-xl p-4 border border-navy-border hover:border-gold/30 transition-all duration-200 hover:shadow-lg hover:shadow-gold/5 cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-white mb-0.5">{action.label}</p>
                    <p className="text-xs text-text-muted">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}