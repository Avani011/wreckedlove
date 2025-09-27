"use client";

import { useState } from "react";
import { getContract } from "./contract";
import { ethers } from "ethers";

export function useWreckedLove() {
  const [loading, setLoading] = useState(false);

  const createPool = async (partnerB: string, tenure: number, totalAmountEth: string) => {
    const contract = await getContract();
    const half = ethers.parseEther(totalAmountEth) / 2n;
    setLoading(true);
    const tx = await contract.createPool(partnerB, tenure, ethers.parseEther(totalAmountEth), { value: half });
    await tx.wait();
    setLoading(false);
  };

  return { createPool, loading };
}
