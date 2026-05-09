"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TeamHelmetProps {
  teamName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showPlaceholder?: boolean;
}

export function TeamHelmet({
  teamName = "Team",
  primaryColor = "#7A1E2C",
  secondaryColor = "#F5C542",
  size = "md",
  className,
  showPlaceholder = true,
}: TeamHelmetProps) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  };
  
  const { width, height } = sizes[size];
  
  // Generate a placeholder helmet SVG with team colors
  const helmetSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="55" rx="40" ry="35" fill="url(#helmetGrad)" stroke="${secondaryColor}" stroke-width="2"/>
      <rect x="15" y="45" width="70" height="8" rx="4" fill="${secondaryColor}" opacity="0.8"/>
      <ellipse cx="50" cy="30" rx="25" ry="12" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="1.5"/>
      <text x="50" y="60" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${teamName.substring(0, 3).toUpperCase()}</text>
    </svg>
  `;
  
  const svgDataUrl = `data:image/svg+xml;base64,${typeof window !== 'undefined' ? btoa(helmetSvg) : ''}`;
  
  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center overflow-hidden",
        className
      )}
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}22)`,
        border: `2px solid ${primaryColor}44`,
      }}
    >
      {showPlaceholder ? (
        <div
          className="flex items-center justify-center font-bold text-white"
          style={{
            width,
            height,
            fontSize: width * 0.35,
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          {teamName.substring(0, 2).toUpperCase()}
        </div>
      ) : (
        <Image
          src={svgDataUrl}
          alt={`${teamName} helmet`}
          width={width}
          height={height}
          className="object-contain"
        />
      )}
    </div>
  );
}