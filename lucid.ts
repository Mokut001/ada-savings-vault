import { Lucid, Blockfrost, Network } from "lucid-cardano";

export const initLucid = async (walletName: string) => {
  const lucid = await Lucid.new(
    new Blockfrost(
      process.env.NEXT_PUBLIC_BLOCKFROST_URL!,
      process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY!
    ),
    "Preprod" as Network
  );
  
  if (typeof window !== "undefined" && window.cardano && window.cardano[walletName.toLowerCase()]) {
    const api = await window.cardano[walletName.toLowerCase()].enable();
    lucid.selectWallet(api);
    return lucid;
  }
  throw new Error("Wallet not found");
};