"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  label?: string;
  labelClassName?: string;
}

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className,
  label,
  labelClassName,
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return (
    <div className="flex flex-col">
      <span className={cn("text-2xl font-bold tabular-nums text-white", className)}>
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </span>
      {label && (
        <span className={cn("text-xs uppercase tracking-wider text-text-muted font-medium mt-1", labelClassName)}>
          {label}
        </span>
      )}
    </div>
  );
}