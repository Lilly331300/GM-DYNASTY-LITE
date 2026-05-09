import React from "react";
import Link from "next/link";
import { Crown, ArrowLeft } from "lucide-react";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric to-cyan-glow flex items-center justify-center mx-auto mb-6">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">About GM Dynasty Lite</h1>
        <p className="text-text-muted mb-8">
          The premier football franchise simulation platform. Build your team, set your strategy, and compete for glory.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-electric hover:text-cyan-glow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}