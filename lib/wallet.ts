// ============================================
// GM DYNASTY LITE - WALLET LOGIC
// ============================================

import { Wallet, Transaction } from "./types";
import { generateId } from "./utils";

const PLATFORM_FEE_PERCENT = 0.05;

export function calculateWinnings(stake: number): number {
  const totalPool = stake * 2;
  const platformFee = totalPool * PLATFORM_FEE_PERCENT;
  return totalPool - platformFee;
}

export function calculatePlatformFee(stake: number): number {
  return stake * 2 * PLATFORM_FEE_PERCENT;
}

export function createTransaction(
  userId: string,
  type: Transaction["type"],
  amount: number,
  description: string,
  matchId?: string,
  challengeId?: string
): Transaction {
  return {
    id: `tx_${generateId()}`,
    userId,
    type,
    amount,
    status: "completed",
    description,
    matchId,
    challengeId,
    createdAt: new Date().toISOString(),
  };
}

export function processMatchPayout(
  wallet: Wallet,
  winnerId: string,
  loserId: string,
  stake: number,
  matchId: string,
  challengeId: string
): { winnerWallet: Wallet; loserWallet: Wallet } {
  const winnings = calculateWinnings(stake);
  const fee = calculatePlatformFee(stake);
  
  const winnerTransaction = createTransaction(
    winnerId,
    "match_win",
    winnings,
    `Won match and earned ${winnings} MVP Crowns`,
    matchId,
    challengeId
  );
  
  const loserTransaction = createTransaction(
    loserId,
    "match_loss",
    -stake,
    `Lost match stake of ${stake} MVP Crowns`,
    matchId,
    challengeId
  );
  
  const winnerWallet: Wallet = {
    ...wallet,
    balance: wallet.balance + winnings,
    totalEarned: wallet.totalEarned + winnings,
    transactions: [winnerTransaction, ...wallet.transactions],
  };
  
  // For loser, we'd need their wallet - this is simplified
  const loserWallet: Wallet = {
    ...wallet,
    transactions: [loserTransaction, ...wallet.transactions],
  };
  
  return { winnerWallet, loserWallet };
}

export function processDeposit(wallet: Wallet, amount: number): Wallet {
  const transaction = createTransaction(
    wallet.userId,
    "deposit",
    amount,
    `Deposited ${amount} MVP Crowns`
  );
  
  return {
    ...wallet,
    balance: wallet.balance + amount,
    totalDeposited: wallet.totalDeposited + amount,
    transactions: [transaction, ...wallet.transactions],
  };
}

export function processWithdrawal(wallet: Wallet, amount: number): { success: boolean; wallet?: Wallet; error?: string } {
  if (wallet.balance < amount) {
    return { success: false, error: "Insufficient balance" };
  }
  
  const transaction = createTransaction(
    wallet.userId,
    "withdrawal",
    -amount,
    `Withdrew ${amount} MVP Crowns`
  );
  
  return {
    success: true,
    wallet: {
      ...wallet,
      balance: wallet.balance - amount,
      totalWithdrawn: wallet.totalWithdrawn + amount,
      transactions: [transaction, ...wallet.transactions],
    },
  };
}