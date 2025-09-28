"use client";

import React, { ReactNode, useState } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import type { Chain } from "viem";
import { WagmiProvider, createConfig, http } from "wagmi";
import { wagmiConnectors } from "~~/services/web3/wagmiConnectors";

// Make sure your .env file has:
// NEXT_PUBLIC_CHAIN_ID=15557
// NEXT_PUBLIC_RPC_URL=https://evm-testnet.flowchain.io

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 15557);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://evm-testnet.flowchain.io";

const flowEvmTestnet: Chain = {
  id: CHAIN_ID,
  name: "Flow EVM Testnet",
  nativeCurrency: { name: "tFLOW", symbol: "tFLOW", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "FlowScan", url: "https://evm-testnet.flowscan.io" },
  },
  testnet: true,
};

const wagmiConfig = createConfig({
  chains: [flowEvmTestnet],
  transports: {
    [flowEvmTestnet.id]: http(RPC_URL),
  },
  connectors: wagmiConnectors(),
  ssr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={React.useMemo(() => darkTheme(), [])}>
          {children}
          <Toaster position="top-center" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
