"use client";

import React, { useMemo, useState } from "react";
import { ConnectButton, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Address, Chain } from "viem";
import { parseEther } from "viem";
import {
  WagmiProvider,
  createConfig,
  createStorage,
  http,
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import WreckedLoveABI from "~~/contracts/WreckedLove.json";
import { CONTRACT_ADDRESS } from "~~/hooks/contract";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 15557);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://evm-testnet.flowchain.io";

const chain: Chain = {
  id: CHAIN_ID,
  name: "Flow EVM Testnet",
  nativeCurrency: { name: "tFLOW", symbol: "tFLOW", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] }, public: { http: [RPC_URL] } },
  blockExplorers: { default: { name: "FlowScan", url: "https://evm-testnet.flowscan.io" } },
  testnet: true,
};

export function PartnerBFundSection({
  poolId,
  amountEth,
  tncAccepted,
}: {
  poolId: string;
  amountEth: string;
  tncAccepted: boolean;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const configB = React.useMemo(() => {
    const storage =
      typeof window !== "undefined"
        ? createStorage({ key: "wagmi.partnerB", storage: window.localStorage })
        : undefined;
    const connectorsB =
      typeof window !== "undefined"
        ? connectorsForWallets([{ groupName: "Partner B", wallets: [walletConnectWallet] }], {
            appName: "WreckedLove",
            projectId: scaffoldConfig.walletConnectProjectId,
          })
        : [];
    return createConfig({
      chains: [chain],
      transports: { [chain.id]: http(RPC_URL) },
      connectors: connectorsB,
      storage,
      ssr: true,
    });
  }, []);

  return (
    <WagmiProvider config={configB} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={React.useMemo(() => darkTheme(), [])}>
          <InnerFund poolId={poolId} amountEth={amountEth} tncAccepted={tncAccepted} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function InnerFund({ poolId, amountEth, tncAccepted }: { poolId: string; amountEth: string; tncAccepted: boolean }) {
  const { address } = useAccount();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [submitting, setSubmitting] = useState(false);

  const canFund = useMemo(
    () => Boolean(tncAccepted && address && poolId && amountEth),
    [tncAccepted, address, poolId, amountEth],
  );

  const fund = async () => {
    if (!canFund || submitting) return;
    setSubmitting(true);
    const totalWei = parseEther(amountEth);
    const halfWei = totalWei / 2n;
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS as Address,
        abi: WreckedLoveABI,
        functionName: "fundPool",
        args: [BigInt(poolId)],
        value: halfWei,
      });
    } catch (err: any) {
      const message = err?.shortMessage || err?.message || "Transaction rejected";
      notification.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3">
      <ConnectButton
        label="Connect Partner B"
        chainStatus="icon"
        showBalance={false}
        accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
      />
      <button
        onClick={fund}
        disabled={!canFund || submitting || isPending || isWaiting}
        className={`w-full px-8 py-4 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg ${
          canFund
            ? "bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400 text-black"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isPending || isWaiting || submitting ? "Funding..." : "Fund Pool (Partner B)"}
      </button>
      {isWaiting && <p className="text-sm text-black">Partner B transaction pending...</p>}
      {isSuccess && <p className="text-sm text-black">Partner B funded successfully.</p>}
    </div>
  );
}
