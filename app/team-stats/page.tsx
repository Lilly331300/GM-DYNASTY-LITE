"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Trophy } from "lucide-react";

export default function TeamStatsPage() {
  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Franchise Analytics
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase text-white md:text-5xl">
                Team Stats
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                Detailed team statistics will appear here as completed games are recorded.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
              <Trophy className="h-8 w-8" />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-navy-border bg-navy-secondary/50 p-6 text-center">
            <p className="font-black uppercase text-white">
              Team analytics coming soon
            </p>
            <p className="mt-2 text-sm text-text-muted">
              This page is ready for future team stat comparisons and rankings.
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="secondary" className="mt-6">
              Back to Dashboard
            </Button>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}