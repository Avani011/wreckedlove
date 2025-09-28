"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Nav from "../../../../components/Nav";
import type { Abi, Address } from "viem";
import { formatEther } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import WreckedLoveABI from "~~/contracts/WreckedLove.json";
import { CONTRACT_ADDRESS } from "~~/hooks/contract";

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

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-gradient-to-br from-pink-300 via-yellow-100 to-blue-300">
      <Nav />
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-black text-center">
          Pool #{poolId.toString()} — Bets
        </h1>
        {isLoading && <div className="text-center text-black py-10">Loading bets...</div>}
        {!isLoading && bets.length === 0 && (
          <div className="text-center text-black py-10">No bets yet for this pool.</div>
        )}
        <div className="flex flex-col gap-4">
          {bets.map(b => (
            <div key={b.id.toString()} className="rounded-2xl border-2 bg-white shadow p-5 text-black">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">Bet #{b.id.toString()}</div>
                <div className="text-xs">Created by: {b.creator}</div>
              </div>
              <div className="mt-2 text-sm">{b.metadata || "No description"}</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">Yes:</span> {formatEther(b.totalYes)} ETH
                </div>
                <div>
                  <span className="font-semibold">No:</span> {formatEther(b.totalNo)} ETH
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-600">Type: {b.isGossip ? "Gossip" : "Standard"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
