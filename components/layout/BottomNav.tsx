"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Radio,
  Wallet,
  Settings,
} from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/challenge-hub", label: "Play", icon: Trophy },
  { href: "/games-in-progress", label: "Live", icon: Radio },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "More", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-primary/95 backdrop-blur-md border-t border-navy-border z-40">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                isActive ? "text-gold" : "text-text-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}