# 💔 Wrecked Love
**Tagline:** *Where love goes liquid*  

The first on-chain **Love Insurance + Gossip Prediction Market**.  
Couples lock funds as proof of loyalty, the community bets on their relationship, and everyone either survives… or gets wrecked.  

---

## 🚀 Overview
**Wrecked Love** is a playful yet powerful consumer dApp that merges:  
- **Insurance Pools** → Couples deposit 50–50 funds into a pool with a fixed tenure.  
- **Prediction Markets** → Community bets (Yes/No) on gossip posts tied to couples.  
- **Settlement Layer** → Pools mature; bets resolve based on outcomes.  

It’s DeFi meets Gen-Z culture. Gossip, memes, and heartbreaks turned into crypto-native primitives.  

---

## 🔑 Features
- 👫 **Couple Insurance Pools** – Equal deposits, survive & earn yield, or split & one gets wrecked.  
- 📱 **Prediction Markets** – Bet on gossip tied to couples.  
- ⏳ **24-Hour Betting Window** – Bets open for only 1 day after creation.  
- 📦 **No Heavy Backend** – On-chain logic + Filecoin/IPFS storage.  
- 🪙 **Protocol Revenue** – Small fees on pools & bets.  
- 🖼 **NFT Badges (Future)** – Couples & bettors earn meme badges as proof of survival/degeneracy.  

---

## 🏗 Tech Stack
- **Frontend** → [Next.js](https://nextjs.org/) + TailwindCSS  
- **Wallet/Auth** → [Privy](https://www.privy.io/) (embedded wallets, social logins)  
- **Smart Contracts** → Solidity on [Flow EVM](https://flow.com/)  
- **Storage** → Filecoin/IPFS for gossip posts/media  
- **MiniApp Ready** → Deployed as World Mini App for hackathon demo  

---

## 📜 Smart Contracts
Main contract: `WreckedLove.sol`  
- Pool creation & funding  
- Admin-created bets (official + gossip)  
- Yes/No staking with ETH  
- 24-hour cutoff for bets  

**Deployed on Flow EVM (Testnet):**  
👉 `0x4ab500E761aF74F1de333a16338942Fd93eb94a3`  

---

## 📂 Project Structure
```text
/contracts
  └── WreckedLove.sol        # Core Solidity contract

/nextjs-app
  /app
    ├── page.tsx             # Landing page
    ├── pool/[id].tsx        # Pool detail
    ├── bet/[id].tsx         # Bet detail
  /components                # UI components
  /hooks/useWreckedLove.ts   # Contract interaction hook
  /lib/contract.ts           # ethers.js contract instance

/abi
  └── WreckedLove.json       # Compiled ABI
