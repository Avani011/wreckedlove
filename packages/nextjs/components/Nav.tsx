"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface NavProps {
  logoText?: string;
  logoHref?: string;
  tabs?: Array<{
    label: string;
    href: string;
    isActive?: boolean;
  }>;
}

const Nav: React.FC<NavProps> = ({
  logoText = "WreckedLove",
  logoHref = "/",
  tabs = [
    { label: "Home", href: "/" },
    { label: "Get Insured", href: "/GetInsuredForm" },
    { label: "Predict the Love", href: "/PredictLove" },
    { label: "Contact", href: "/contact" },
  ],
}) => {
  return (
    <nav className="px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link
            href={logoHref}
            className="text-white text-2xl font-bold hover:text-purple-300 transition-colors duration-200 font-kreon"
          >
            {logoText}
          </Link>
        </div>

        {/* Tabs Section */}
        <div className="flex items-center gap-6">
          {tabs.map((tab, index) => {
            return (
              <Link
                key={index}
                href={tab.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-kreon bg-[#FCFDA3] text-[#C408FF]"
              >
                {tab.label}
              </Link>
            );
          })}
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
