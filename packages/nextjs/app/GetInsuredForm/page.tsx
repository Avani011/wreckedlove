"use client";

import { useEffect, useState } from "react";
import { PartnerBFundSection } from "./PartnerBFundSection";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/* eslint-disable @next/next/no-img-element */
import { type Abi, type Address, type Hex, isAddress, parseEther, parseEventLogs } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import WreckedLoveABI from "~~/contracts/WreckedLove.json";
import { CONTRACT_ADDRESS } from "~~/hooks/contract";

type Friend = { name: string; contact: string; social: string; type: string };
// note: pool type no longer used in this component

export default function GetInsuredForm() {
  const [step, setStep] = useState(1);

  // Step 1: Personal Details
  const [partnerAName, setPartnerAName] = useState("");
  const [partnerBName, setPartnerBName] = useState("");
  const [partnerBWallet, setPartnerBWallet] = useState("");
  const [relationMonths, setRelationMonths] = useState<number | "">("");
  const [partnerASocials, setPartnerASocials] = useState([
    { type: "twitter", value: "" },
    { type: "instagram", value: "" },
  ]);
  const [partnerBSocials, setPartnerBSocials] = useState([
    { type: "twitter", value: "" },
    { type: "instagram", value: "" },
  ]);

  // Step 2: Friends
  const [friends, setFriends] = useState<Friend[]>([
    { name: "", contact: "", social: "", type: "twitter" },
    { name: "", contact: "", social: "", type: "instagram" },
    { name: "", contact: "", social: "", type: "twitter" },
  ]);

  // Step 3: Insurance
  const [amountEth, setAmountEth] = useState("");
  const [tenure, setTenure] = useState(6);

  // Loader popup
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createTxHash, setCreateTxHash] = useState<Hex | undefined>(undefined);
  const [newPoolId, setNewPoolId] = useState<bigint | null>(null);
  const [isPartnerBModalOpen, setPartnerBModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Progress bar calculation
  const progress = ((step - 1) / 2) * 100;

  // Wagmi hooks for wallet connection
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const {
    isLoading: isWaitingCreate,
    isSuccess: created,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: createTxHash,
  });

  // Social link handlers
  const handleSocialChange = (partner: "A" | "B", idx: number, value: string) => {
    if (partner === "A") {
      setPartnerASocials(socials => socials.map((s, i) => (i === idx ? { ...s, value } : s)));
    } else {
      setPartnerBSocials(socials => socials.map((s, i) => (i === idx ? { ...s, value } : s)));
    }
  };

  const addSocial = (partner: "A" | "B") => {
    if (partner === "A") {
      setPartnerASocials(socials => [...socials, { type: "", value: "" }]);
    } else {
      setPartnerBSocials(socials => [...socials, { type: "", value: "" }]);
    }
  };

  // Friend social type handler
  const handleFriendChange = (idx: number, field: keyof Friend, value: string) => {
    setFriends(friends => friends.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  // Partner B handled via modal after create

  // Create Pool (Partner A)
  const handleCreatePool = async () => {
    if (!isConnected) return alert("Connect wallet first!");
    if (!partnerAName || !partnerBName || !amountEth || !tenure) return alert("Fill all fields!");
    if (!isAddress(partnerBWallet as Address)) return alert("Enter a valid Partner B address.");
    try {
      if (submitting) return;
      setSubmitting(true);
      setPendingMsg("Confirm transaction in wallet...");
      const totalAmountWei = parseEther(amountEth);
      if (totalAmountWei % 2n !== 0n) {
        setSubmitting(false);
        setPendingMsg(null);
        return alert("Please enter an amount with an even wei value so both halves are equal.");
      }
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as Address,
        abi: WreckedLoveABI,
        functionName: "createPool",
        args: [partnerBWallet as Address, tenure, totalAmountWei],
        value: totalAmountWei / 2n,
      });
      setCreateTxHash(hash as Hex);
      setPendingMsg("Transaction sent. Waiting for confirmation...");
    } catch (err) {
      alert("Transaction failed: " + (err as Error).message);
      setPendingMsg(null);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!created || !receipt) return;
    try {
      const events = parseEventLogs({
        abi: WreckedLoveABI as unknown as Abi,
        logs: receipt.logs,
        eventName: "PoolCreated",
      });
      const poolId = (events?.[0]?.args as any)?.poolId as bigint | undefined;
      if (poolId != null) {
        setNewPoolId(poolId);
        setPendingMsg(null);
        // Copy share link for Partner B
        const link = typeof window !== "undefined" ? `${window.location.origin}/pool/${poolId}` : `/pool/${poolId}`;
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(link).catch(() => {});
        }
        setStep(3); // stay on step 3
        setPartnerBModalOpen(true); // open Partner B modal
      }
    } catch {
      // fallback: still clear pending
      setPendingMsg(null);
    }
  }, [created, receipt]);

  return (
    <>
      <div className="min-h-screen w-screen flex bg-gradient-to-br from-pink-300 via-yellow-100 to-blue-300 text-kreon">
        {/* Left: Form */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full p-4 md:p-8 bg-white/80 backdrop-blur-xl transition-all duration-300 flex flex-col h-full justify-center">
            {/* Progress Bar */}
            <div className="w-[50%] mb-6">
              <div className="flex items-center mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="ml-4 text-sm text-kreon font-bold text-pink-700">{step}/3</span>
              </div>
              <div className="flex justify-between text-xs text-gray-700 px-1">
                <span>Personal</span>
                <span>Friends</span>
                <span>Insurance</span>
              </div>
            </div>
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl md:text-2xl text-purple-700 font-kreon font-semibold mb-2 text-kreon">
                  Personal Details
                </h2>
                <div className="flex flex-col gap-3">
                  <input
                    className="p-2 md:p-3 border rounded-xl focus:ring-2 focus:ring-pink-400 border-pink-300 bg-white text-base md:text-lg placeholder-black text-gray-900 text-kreon"
                    placeholder="Partner A Name"
                    value={partnerAName}
                    onChange={e => setPartnerAName(e.target.value)}
                  />
                  <input
                    className="p-2 md:p-3 border rounded-xl focus:ring-2 focus:ring-purple-400 border-purple-300 bg-white text-base md:text-lg placeholder-black text-gray-900 text-kreon"
                    placeholder="Partner B Name"
                    value={partnerBName}
                    onChange={e => setPartnerBName(e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    max={2}
                    className="p-2 md:p-3 border rounded-xl focus:ring-2 focus:ring-yellow-400 border-yellow-300 bg-white text-base md:text-lg placeholder-black text-gray-900 text-kreon"
                    placeholder="Relation period (months, < 3)"
                    value={relationMonths as number | ""}
                    onChange={e =>
                      setRelationMonths(e.target.value === "" ? "" : Math.max(0, Math.min(2, Number(e.target.value))))
                    }
                  />
                  <div>
                    <label className="block text-gray-800 font-semibold mb-1 text-kreon">Partner A Social Links</label>
                    <div className="flex flex-col gap-2">
                      {partnerASocials.map((social, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select
                            className="p-2 border rounded-lg text-gray-900 bg-white text-kreon"
                            value={social.type}
                            onChange={e =>
                              setPartnerASocials(socials =>
                                socials.map((s, i) => (i === idx ? { ...s, type: e.target.value } : s)),
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                          </select>
                          <input
                            className="flex-1 p-2 border rounded-lg placeholder-black text-gray-900 bg-white text-kreon"
                            placeholder={`@username or link`}
                            value={social.value}
                            onChange={e => handleSocialChange("A", idx, e.target.value)}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mt-2 px-4 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-kreon"
                        onClick={() => addSocial("A")}
                      >
                        + Add Social
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-1 text-kreon">Partner B Social Links</label>
                    <div className="flex flex-col gap-2">
                      {partnerBSocials.map((social, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select
                            className="p-2 border rounded-lg text-gray-900 bg-white text-kreon"
                            value={social.type}
                            onChange={e =>
                              setPartnerBSocials(socials =>
                                socials.map((s, i) => (i === idx ? { ...s, type: e.target.value } : s)),
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                          </select>
                          <input
                            className="flex-1 p-2 border rounded-lg placeholder-black text-gray-900 bg-white text-kreon"
                            placeholder={`@username or link`}
                            value={social.value}
                            onChange={e => handleSocialChange("B", idx, e.target.value)}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mt-2 px-4 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-kreon"
                        onClick={() => addSocial("B")}
                      >
                        + Add Social
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-6 py-2 rounded-xl font-bold bg-pink-500 text-white hover:bg-pink-600 transition text-kreon"
                    onClick={() => setStep(2)}
                    disabled={!partnerAName || !partnerBName || relationMonths === "" || Number(relationMonths) >= 3}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {/* Step 2: Friends */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl md:text-2xl text-purple-700 font-semibold mb-2 text-kreon">
                  Friends (Optional)
                </h2>
                <div className="flex flex-col gap-3">
                  {friends.map((friend, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-2 rounded-xl bg-white border border-gray-200">
                      <input
                        className="p-2 border rounded-lg placeholder-black text-gray-900 bg-white text-kreon"
                        placeholder={`Friend ${idx + 1} Name`}
                        value={friend.name}
                        onChange={e => handleFriendChange(idx, "name", e.target.value)}
                      />
                      <input
                        className="p-2 border rounded-lg placeholder-black text-gray-900 bg-white text-kreon"
                        placeholder="Contact Details"
                        value={friend.contact}
                        onChange={e => handleFriendChange(idx, "contact", e.target.value)}
                      />
                      <div className="flex gap-2">
                        <select
                          className="p-2 border rounded-lg text-gray-900 bg-white text-kreon"
                          value={friend.type}
                          onChange={e => handleFriendChange(idx, "type", e.target.value)}
                        >
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                        </select>
                        <input
                          className="flex-1 p-2 border rounded-lg placeholder-black text-gray-900 bg-white text-kreon"
                          placeholder="Social Link"
                          value={friend.social}
                          onChange={e => handleFriendChange(idx, "social", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="px-6 py-2 rounded-xl font-bold bg-gray-300 text-gray-700 hover:bg-gray-400 transition text-kreon"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 rounded-xl font-bold bg-pink-500 text-white hover:bg-pink-600 transition text-kreon"
                    onClick={() => setStep(3)}
                  >
                    Next
                  </button>
                  <button
                    className="px-6 py-2 rounded-xl font-bold bg-yellow-400 text-black hover:bg-yellow-500 transition text-kreon"
                    onClick={() => setStep(3)}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
            {/* Step 3: Insurance Details */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl md:text-2xl text-purple-700 font-semibold mb-2 text-kreon">Insurance Details</h2>
                <div className="flex flex-col gap-3">
                  <input
                    className="p-2 md:p-3 border rounded-xl focus:ring-2 focus:ring-green-400 border-green-300 bg-white text-base md:text-lg placeholder-black text-gray-900 text-kreon"
                    placeholder="Total Amount (ETH)"
                    value={amountEth}
                    onChange={e => setAmountEth(e.target.value)}
                  />
                  <select
                    className="p-2 md:p-3 border rounded-xl focus:ring-2 focus:ring-green-400 border-green-300 bg-white text-base md:text-lg text-gray-900 text-kreon"
                    value={tenure}
                    onChange={e => setTenure(Number(e.target.value))}
                  >
                    <option value={6}>6 months</option>
                    <option value={9}>9 months</option>
                    <option value={12}>12 months</option>
                  </select>
                </div>
                <div className="mt-2">
                  <label className="block text-gray-800 font-semibold mb-1 text-kreon">Partner B Wallet (0x...)</label>
                  <input
                    className="w-full p-2 md:p-3 border rounded-xl focus:ring-2 focus:ring-purple-400 border-purple-300 bg-white text-base md:text-lg placeholder-black text-gray-900 text-kreon"
                    placeholder="0x..."
                    value={partnerBWallet}
                    onChange={e => setPartnerBWallet(e.target.value)}
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="mb-2 font-semibold text-gray-800 text-kreon">Partner A</span>
                    <ConnectButton
                      label="Connect Partner A"
                      chainStatus="icon"
                      showBalance={false}
                      accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
                    />
                    <button
                      className="mt-2 px-6 py-2 rounded-xl font-bold bg-pink-500 text-white hover:bg-pink-600 transition text-kreon"
                      onClick={handleCreatePool}
                      disabled={
                        submitting ||
                        isWaitingCreate ||
                        !isConnected ||
                        !amountEth ||
                        !isAddress(partnerBWallet as Address)
                      }
                    >
                      {submitting || isWaitingCreate ? "Creating..." : "Create Pool"}
                    </button>
                    {newPoolId != null && (
                      <div className="mt-3 text-sm text-center">
                        <div className="font-semibold">Share with Partner B</div>
                        <div className="break-all text-black">
                          {typeof window !== "undefined"
                            ? `${window.location.origin}/pool/${newPoolId}`
                            : `/pool/${newPoolId}`}
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPartnerBModalOpen(true)}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
                          >
                            Open Partner B Panel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (newPoolId == null) return;
                              const link =
                                typeof window !== "undefined"
                                  ? `${window.location.origin}/pool/${newPoolId}`
                                  : `/pool/${newPoolId}`;
                              if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                                navigator.clipboard
                                  .writeText(link)
                                  .then(() => setCopied(true))
                                  .catch(() => {});
                                setTimeout(() => setCopied(false), 1200);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
                          >
                            {copied ? "Copied!" : "Copy Link"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Partner B inline panel removed; use modal instead */}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="px-6 py-2 rounded-xl font-bold bg-gray-300 text-gray-700 hover:bg-gray-400 transition text-kreon"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
            {/* Loader Popup */}
            {pendingMsg && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-11/12 sm:w-[28rem] text-center flex flex-col items-center text-kreon">
                  <span className="animate-spin h-10 w-10 mb-4 border-4 border-pink-400 border-t-transparent rounded-full inline-block" />
                  <p className="text-lg font-medium text-black">{pendingMsg}</p>
                </div>
              </div>
            )}
            {/* Partner B Modal */}
            {isPartnerBModalOpen && newPoolId != null && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white text-black rounded-2xl p-6 w-11/12 sm:w-[32rem] shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Partner B Funding</h3>
                    <button
                      onClick={() => setPartnerBModalOpen(false)}
                      className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                  <p className="mb-3 text-sm">
                    Ask Partner B to connect their wallet and fund the remaining half to activate the pool.
                  </p>
                  <div>
                    <PartnerBFundSection poolId={newPoolId.toString()} amountEth={amountEth} tncAccepted={true} />
                  </div>
                </div>
              </div>
            )}
            {/* Success Popup */}\n {/* Success popup removed */}\n{" "}
          </div>
        </div>
        {/* Right: Images and Decoration */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl h-screen">
          <div className="flex flex-col items-center gap-8">
            <img src="/love-couple.svg" alt="Couple" className="w-2/3 max-w-xs rounded-2xl mb-6" />
            <img src="/insurance-heart.svg" alt="Insurance" className="w-1/2 max-w-xs rounded-2xl" />
            <div className="flex gap-4 mt-8">
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-3xl"
                title="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 text-3xl"
                title="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
