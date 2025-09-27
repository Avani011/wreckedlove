"use client";

import WreckedLoveABI from "../contracts/WreckedLove.json";
import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x4ab500E761aF74F1de333a16338942Fd93eb94a3";

export const getContract = async () => {
  if (!window.ethereum) throw new Error("No wallet detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, WreckedLoveABI, signer);
};
