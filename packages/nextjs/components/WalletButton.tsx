"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletButton({ label = "Connect Wallet" }: { label?: string }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        const className =
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-kreon bg-[#FCFDA3] text-[#C408FF]";

        if (!connected) {
          return (
            <button className={className} onClick={openConnectModal} type="button">
              {label}
            </button>
          );
        }
        if (chain?.unsupported) {
          return (
            <button className={className} onClick={openChainModal} type="button">
              Wrong network
            </button>
          );
        }
        return (
          <button className={className} onClick={openAccountModal} type="button">
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
