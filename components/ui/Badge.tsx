import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-navy-secondary text-text-light border-navy-border",
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
    danger: "bg-danger/20 text-danger border-danger/30",
    info: "bg-electric/20 text-electric border-electric/30",
    gold: "bg-gold/20 text-gold border-gold/30",
    outline: "bg-transparent text-text-light border border-navy-border",
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium border",
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}