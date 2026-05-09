"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "gold" | "success" | "electric" | "wine";
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "default",
  className,
  delay = 0,
}: StatCardProps) {
  const colorStyles = {
    default: "bg-navy-card border-navy-border",
    gold: "bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
    electric: "bg-gradient-to-br from-electric/10 to-electric/5 border-electric/20",
    wine: "bg-gradient-to-br from-wine/10 to-wine/5 border-wine/20",
  };

  const trendColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-text-muted",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-xl border p-5",
        colorStyles[color],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            color === "gold" && "bg-gold/10",
            color === "success" && "bg-success/10",
            color === "electric" && "bg-electric/10",
            color === "wine" && "bg-wine/10",
            color === "default" && "bg-navy-secondary"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              color === "gold" && "text-gold",
              color === "success" && "text-success",
              color === "electric" && "text-electric",
              color === "wine" && "text-wine",
              color === "default" && "text-text-muted"
            )} />
          </div>
        )}
      </div>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span className={cn("text-xs font-medium", trendColors[trend])}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-text-muted">{subtitle}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}