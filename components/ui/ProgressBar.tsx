"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "gold" | "success" | "electric" | "wine" | "danger";
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "gold",
  size = "md",
  showValue = false,
  className,
  label,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    gold: "bg-gold",
    success: "bg-success",
    electric: "bg-electric",
    wine: "bg-wine",
    danger: "bg-danger",
  };
  
  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };
  
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-text-muted">{label}</span>}
          {showValue && (
            <span className="text-sm font-bold tabular-nums text-text-light">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-navy-secondary rounded-full overflow-hidden", sizes[size])}>
        <motion.div
          className={cn("h-full rounded-full", colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}