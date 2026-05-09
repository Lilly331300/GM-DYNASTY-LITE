import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function formatRecord(wins: number, losses: number, ties: number = 0): string {
  if (ties > 0) return `${wins}-${losses}-${ties}`;
  return `${wins}-${losses}`;
}

export function calculateWinPercentage(wins: number, losses: number, ties: number = 0): number {
  const total = wins + losses + ties;
  if (total === 0) return 0;
  return (wins + ties * 0.5) / total;
}

export function getPositionColor(position: string): string {
  const colors: Record<string, string> = {
    QB: "bg-blue-500",
    RB: "bg-green-500",
    FB: "bg-green-600",
    WR: "bg-yellow-500",
    TE: "bg-orange-500",
    LT: "bg-red-500",
    LG: "bg-red-500",
    C: "bg-red-500",
    RG: "bg-red-500",
    RT: "bg-red-500",
    LE: "bg-purple-500",
    DT: "bg-purple-500",
    RE: "bg-purple-500",
    LOLB: "bg-indigo-500",
    MLB: "bg-indigo-500",
    ROLB: "bg-indigo-500",
    CB: "bg-pink-500",
    FS: "bg-pink-500",
    SS: "bg-pink-500",
    K: "bg-cyan-500",
    P: "bg-cyan-500",
    KR: "bg-amber-500",
    PR: "bg-amber-500",
  };
  return colors[position] || "bg-gray-500";
}

export function getRatingColor(rating: number): string {
  if (rating >= 90) return "text-gold";
  if (rating >= 80) return "text-success";
  if (rating >= 70) return "text-electric";
  if (rating >= 60) return "text-yellow-400";
  return "text-text-muted";
}

export function getRatingBg(rating: number): string {
  if (rating >= 90) return "bg-gold/20 text-gold border-gold/30";
  if (rating >= 80) return "bg-success/20 text-success border-success/30";
  if (rating >= 70) return "bg-electric/20 text-electric border-electric/30";
  if (rating >= 60) return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30";
  return "bg-text-muted/20 text-text-muted border-text-muted/30";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}