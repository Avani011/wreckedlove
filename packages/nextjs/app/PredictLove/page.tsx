"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import type { Abi, Address } from "viem";
import { formatEther } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import WreckedLoveABI from "~~/contracts/WreckedLove.json";
import { CONTRACT_ADDRESS } from "~~/hooks/contract";

type Pool = {
  id: bigint;
  partnerA: Address;
  partnerB: Address;
  totalAmount: bigint;
  amountA: bigint;
  amountB: bigint;
  tenureMonths: bigint;
  status: number;
};

const bgClasses = ["bg-pink-100 border-pink-300", "bg-yellow-100 border-yellow-300", "bg-blue-100 border-blue-300"];

const PredictLove = () => {
  const { data: poolCount } = useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: WreckedLoveABI,
    functionName: "poolCount",
  });

  const poolIndexes = useMemo(() => {
    const n = Number(poolCount || 0n);
    return Array.from({ length: n }, (_, i) => BigInt(i + 1));
  }, [poolCount]);

  const { data: poolsData, isLoading } = useReadContracts({
    contracts: poolIndexes.map(i => ({
      address: CONTRACT_ADDRESS as Address,
      abi: WreckedLoveABI as unknown as Abi,
      functionName: "pools",
      args: [i],
    })),
    allowFailure: true,
  });

  const pools: Pool[] = useMemo(() => {
    if (!poolsData) return [];
    return poolsData
      .map(r => (r && !("error" in r) ? (r.result as any) : undefined))
      .filter(Boolean)
      .map((p: any) => ({
        id: p[0] as bigint,
        partnerA: p[1] as Address,
        partnerB: p[2] as Address,
        totalAmount: p[3] as bigint,
        amountA: p[4] as bigint,
        amountB: p[5] as bigint,
        tenureMonths: p[6] as bigint,
        status: Number(p[7] ?? 0),
      }));
  }, [poolsData]);

  return (
    <div className="min-h-screen w-screen gap-6 flex flex-col items-center bg-gradient-to-br from-pink-300 via-yellow-100 to-blue-300">
      <div className="w-full mt-2">
        <Nav />
      </div>
      <div className="w-full max-w-7xl h-full max-h-7xl p-6 md:p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 md:mb-10 text-black text-center">All Pools</h1>
        {isLoading && <div className="text-center text-black py-10">Loading pools...</div>}
        {!isLoading && pools.length === 0 && <div className="text-center text-black py-10">No pools found.</div>}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool, idx) => {
            const total = Number(formatEther(pool.totalAmount));
            const contributed = Number(formatEther(pool.amountA + pool.amountB));
            const fundedPct = total > 0 ? Math.min(100, Math.round((contributed / total) * 100)) : 0;
            const classes = bgClasses[idx % bgClasses.length];
            return (
              <Link
                key={pool.id.toString()}
                href={`/PredictLove/bet/${pool.id.toString()}`}
                className={`block rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition cursor-pointer border-2 ${classes}`}
              >
                <div className="text-xl font-bold mb-2 text-black">Pool #{pool.id.toString()}</div>
                <div className="text-sm text-black">
                  <div className="truncate">
                    <span className="font-semibold">Partner A:</span> {pool.partnerA}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold">Partner B:</span> {pool.partnerB}
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">Total:</span> {total} ETH
                  </div>
                  <div className="">
                    <span className="font-semibold">Funded:</span> {fundedPct}%
                  </div>
                  <div className="">
                    <span className="font-semibold">Tenure:</span> {pool.tenureMonths.toString()} months
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PredictLove;
