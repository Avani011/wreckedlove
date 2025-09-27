import { Kranky, Kreon } from "next/font/google";
import Providers from "./providers";
import "@rainbow-me/rainbowkit/styles.css";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const kreon = Kreon({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kreon",
});

const kranky = Kranky({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-kranky",
});

export const metadata = getMetadata({
  title: "WreckedLove - Decentralized Application",
  description:
    "A modern decentralized application built with Scaffold-ETH 2, featuring Web3 technologies and beautiful UI components.",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning className={`${kreon.variable} ${kranky.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${kreon.className} ${kranky.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
