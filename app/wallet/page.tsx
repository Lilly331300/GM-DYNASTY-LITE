"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  Crown,
  History,
  Plus,
  Shield,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type ComingSoonAction = "deposit" | "withdraw" | "add-crown" | null;

const transactions = [
  {
    id: "txn_001",
    label: "AI Match Reward",
    type: "Credit",
    amount: "+25 MVP",
    date: "Today",
  },
  {
    id: "txn_002",
    label: "Challenge Entry",
    type: "Debit",
    amount: "-50 MVP",
    date: "Yesterday",
  },
  {
    id: "txn_003",
    label: "Platform Reward",
    type: "Credit",
    amount: "+95 MVP",
    date: "2 days ago",
  },
];

function ComingSoonModal({
  action,
  onClose,
}: {
  action: ComingSoonAction;
  onClose: () => void;
}) {
  if (!action) return null;

  const title =
    action === "deposit"
      ? "Deposit Coming Soon"
      : action === "withdraw"
        ? "Withdrawal Coming Soon"
        : "Add Crown Coming Soon";

  const body =
    action === "deposit"
      ? "Deposit functionality is not active yet. Soon, users will be able to fund their wallet directly from this page."
      : action === "withdraw"
        ? "Withdrawal functionality is not active yet. Soon, users will be able to cash out rewards securely."
        : "The Add Crown option is not active yet. Crown purchase and funding tools will be added later.";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-navy-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge variant="gold">
              <Zap className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>

            <h2 className="mt-3 text-2xl font-black uppercase text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">{body}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-navy-border bg-navy-secondary p-2 text-text-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Button variant="gold" className="w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
}

function WalletActionButton({
  icon: Icon,
  label,
  subtitle,
  onClick,
  variant = "secondary",
}: {
  icon: React.ElementType;
  label: string;
  subtitle: string;
  onClick: () => void;
  variant?: "gold" | "secondary" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 rounded-3xl border border-navy-border bg-navy-card p-5 text-left shadow-xl transition hover:border-gold/40 hover:bg-navy-secondary/60"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
            variant === "gold"
              ? "border-gold/20 bg-gold/10 text-gold"
              : variant === "primary"
                ? "border-electric/20 bg-electric/10 text-electric"
                : "border-navy-border bg-navy-secondary text-white"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="break-words text-base font-black uppercase text-white">
            {label}
          </p>
          <p className="mt-1 break-words text-sm leading-5 text-text-muted">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function WalletPage() {
  const [comingSoonAction, setComingSoonAction] =
    useState<ComingSoonAction>(null);
  const [copied, setCopied] = useState(false);

  const walletAddress = "0xA91F...73C2";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <ComingSoonModal
          action={comingSoonAction}
          onClose={() => setComingSoonAction(null)}
        />

        <section className="overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Wallet className="mr-1 h-3 w-3" />
                  Wallet
                </Badge>

                <Badge variant="info">
                  <Shield className="mr-1 h-3 w-3" />
                  Demo Mode
                </Badge>

                <Badge variant="gold">
                  <Crown className="mr-1 h-3 w-3" />
                  MVP Balance
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Franchise Wallet
              </h1>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-text-muted md:text-base">
                Manage crowns, match rewards, challenge stakes, and future
                wallet funding tools.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[420px]">
              <Button
                variant="gold"
                className="w-full gap-2"
                onClick={() => setComingSoonAction("add-crown")}
              >
                <Plus className="h-4 w-4" />
                Add Crown
              </Button>

              <Link href="/game-history">
                <Button variant="secondary" className="w-full gap-2">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 rounded-3xl border border-gold/30 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_38%),#101F33] p-6 shadow-xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                  Available Balance
                </p>

                <div className="mt-3 flex items-end gap-3">
                  <p className="text-6xl font-black text-white">1,250</p>
                  <p className="pb-2 text-xl font-black text-gold">MVP</p>
                </div>

                <p className="mt-2 text-sm text-text-muted">
                  Demo wallet balance for challenge entries and rewards.
                </p>
              </div>

              <div className="rounded-3xl border border-gold/20 bg-gold/10 p-5 text-center">
                <Crown className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-2 text-xs font-black uppercase text-gold">
                  Crown Power
                </p>
                <p className="mt-1 text-3xl font-black text-white">95</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-navy-border bg-navy-card/70 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Wallet Address
                </p>
                <p className="mt-1 break-words text-sm font-black text-white">
                  {walletAddress}
                </p>
              </div>

              <Button variant="secondary" className="gap-2" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Wallet className="mb-3 h-7 w-7 text-gold" />
            <h2 className="text-2xl font-black uppercase text-white">
              Wallet Status
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Deposits and withdrawals are currently locked while the wallet
              system is being prepared.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4 text-center">
                <p className="text-xs font-black uppercase text-text-muted">
                  Locked
                </p>
                <p className="mt-1 text-2xl font-black text-white">0</p>
              </div>

              <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4 text-center">
                <p className="text-xs font-black uppercase text-text-muted">
                  Pending
                </p>
                <p className="mt-1 text-2xl font-black text-white">0</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <WalletActionButton
            icon={ArrowDownToLine}
            label="Deposit"
            subtitle="Fund your wallet. This feature is coming soon."
            variant="gold"
            onClick={() => setComingSoonAction("deposit")}
          />

          <WalletActionButton
            icon={ArrowUpFromLine}
            label="Withdraw"
            subtitle="Withdraw rewards. This feature is coming soon."
            variant="primary"
            onClick={() => setComingSoonAction("withdraw")}
          />

          <WalletActionButton
            icon={Crown}
            label="Add Crown"
            subtitle="Buy or top up crowns. This feature is coming soon."
            onClick={() => setComingSoonAction("add-crown")}
          />
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Transactions
              </p>
              <h2 className="mt-1 text-2xl font-black uppercase text-white">
                Recent Wallet Activity
              </h2>
            </div>

            <History className="h-7 w-7 text-gold" />
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-navy-border bg-navy-secondary/60 p-4"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-black uppercase text-white">
                    {transaction.label}
                  </p>
                  <p className="text-xs text-text-muted">
                    {transaction.type} · {transaction.date}
                  </p>
                </div>

                <p
                  className={`text-lg font-black ${
                    transaction.amount.startsWith("+")
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}