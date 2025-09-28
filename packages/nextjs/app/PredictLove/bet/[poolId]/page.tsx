"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Nav from "../../../../components/Nav";
import type { Abi, Address } from "viem";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import WreckedLoveABI from "~~/contracts/WreckedLove.json";
import { CONTRACT_ADDRESS } from "~~/hooks/contract";
import { notification } from "~~/utils/scaffold-eth";

type Bet = {
  id: bigint;
  poolId: bigint;
  creator: Address;
  metadata: string;
  isGossip: boolean;
  totalYes: bigint;
  totalNo: bigint;
  createdAt: bigint;
};

export default function PoolBetsPage() {
  const params = useParams<{ poolId: string }>();
  const poolId = useMemo(
    () => BigInt(Array.isArray(params.poolId) ? params.poolId[0] : params.poolId || "0"),
    [params.poolId],
  );

  const { data: betCount } = useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: WreckedLoveABI,
    functionName: "betCount",
  });

  const betIndexes = useMemo(() => {
    const n = Number(betCount || 0n);
    return Array.from({ length: n }, (_, i) => BigInt(i + 1));
  }, [betCount]);

  const { data: betsData, isLoading } = useReadContracts({
    contracts: betIndexes.map(i => ({
      address: CONTRACT_ADDRESS as Address,
      abi: WreckedLoveABI as unknown as Abi,
      functionName: "bets",
      args: [i],
    })),
    allowFailure: true,
  });

  const bets: Bet[] = useMemo(() => {
    if (!betsData) return [];
    return betsData
      .map(r => (r && !("error" in r) ? (r.result as any) : undefined))
      .filter(Boolean)
      .map((b: any) => ({
        id: b[0] as bigint,
        poolId: b[1] as bigint,
        creator: b[2] as Address,
        metadata: b[3] as string,
        isGossip: Boolean(b[4]),
        totalYes: b[5] as bigint,
        totalNo: b[6] as bigint,
        createdAt: b[7] as bigint,
      }))
      .filter(b => b.poolId === poolId);
  }, [betsData, poolId]);

  // Create bet UI state
  const [question, setQuestion] = useState("");
  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: creating } = useWaitForTransactionReceipt({ hash: txHash });
  useAccount();

  const createGossipBet = async () => {
    if (!question.trim()) return;
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS as Address,
        abi: WreckedLoveABI,
        functionName: "createBet",
        args: [poolId, question.trim(), true],
      });
      setQuestion("");
      notification.success("Gossip bet created");
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Create bet failed";
      notification.error(msg);
    }
  };

  // Per-bet amount input + vote
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const vote = async (betId: bigint, prediction: boolean) => {
    const key = betId.toString();
    const amt = amounts[key] || "0";
    const value = parseEther(amt || "0");
    if (value <= 0n) return;
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS as Address,
        abi: WreckedLoveABI,
        functionName: "placeBet",
        args: [betId, prediction],
        value,
      });
      setAmounts(a => ({ ...a, [key]: "" }));
      notification.success(`Voted ${prediction ? "Yes" : "No"}`);
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Vote failed";
      notification.error(msg);
    }
  };

  // Optional mock to display something when no bets
  const mock: Bet[] = [
    {
      id: 0n,
      poolId,
      creator: "0x0000000000000000000000000000000000000000" as Address,
      metadata: "Will they celebrate an anniversary this month?",
      isGossip: true,
      totalYes: 0n,
      totalNo: 0n,
      createdAt: 0n,
    },
  ];

  const list = bets.length > 0 ? bets : mock;

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-gradient-to-br from-pink-300 via-yellow-100 to-blue-300">
      <Nav />
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl">
        <div className="mb-4">
          <Link href="/PredictLove" className="text-sm px-3 py-1 rounded-md bg-gray-200 text-black hover:bg-gray-300">
            ← Back to All Pools
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-black text-center">
          Pool #{poolId.toString()} — Bets
        </h1>
        {isLoading && <div className="text-center text-black py-10">Loading bets...</div>}
        <div className="mb-6 bg-white rounded-xl border p-4 text-black">
          <div className="font-semibold mb-2">Create Gossip Bet</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-black"
              placeholder="Enter a prediction question..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-lg bg-pink-200 hover:bg-pink-300 text-black font-semibold"
              onClick={createGossipBet}
              disabled={!question.trim() || creating}
            >
              {creating ? "Creating..." : "Create Gossip Bet"}
            </button>
          </div>
        </div>

        {bets.length === 0 && !isLoading && (
          <div className="text-center text-black py-4">No bets yet for this pool. Shown below are demo cards.</div>
        )}

        <div className="flex flex-col gap-4">
          {list.map(b => (
            <div key={b.id.toString()} className="rounded-2xl border-2 bg-white shadow p-5 text-black">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">Bet #{b.id.toString()}</div>
                <div className="text-xs">Created by: {b.creator}</div>
              </div>
              <div className="mt-2 text-base font-semibold">{b.metadata || "No description"}</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">Yes:</span> {formatEther(b.totalYes)} ETH
                </div>
                <div>
                  <span className="font-semibold">No:</span> {formatEther(b.totalNo)} ETH
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-600">Type: {b.isGossip ? "Gossip" : "Standard"}</div>
              <div className="mt-4 flex flex-col md:flex-row gap-2 md:items-center">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-black"
                  placeholder="Amount in ETH"
                  value={amounts[b.id.toString()] || ""}
                  onChange={e => setAmounts(a => ({ ...a, [b.id.toString()]: e.target.value }))}
                  disabled={bets.length === 0}
                />
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-green-200 hover:bg-green-300 text-black font-semibold"
                    onClick={() => vote(b.id, true)}
                    disabled={!amounts[b.id.toString()] || bets.length === 0}
                  >
                    Vote Yes
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-200 hover:bg-red-300 text-black font-semibold"
                    onClick={() => vote(b.id, false)}
                    disabled={!amounts[b.id.toString()] || bets.length === 0}
                  >
                    Vote No
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
