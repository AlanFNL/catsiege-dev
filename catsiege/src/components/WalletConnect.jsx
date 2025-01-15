import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNFTVerification } from "../hooks/useNFTVerification";
import { sha256 } from "crypto-js";

export function WalletConnect() {
  const { connected, connecting, publicKey } = useWallet();
  const { verifyNFTOwnership, isVerifying, hasNFT } = useNFTVerification();

  React.useEffect(() => {
    if (connected && publicKey) {
      verifyNFTOwnership()
        .then((verified) => {
          if (verified) {
            const hash = sha256(
              `${publicKey.toString()}_nft_verified_catsiege`
            ).toString();
            localStorage.setItem("cs_nft_v", hash);
          }
        })
        .catch((error) => {
          console.error("NFT verification error:", error);
        });
    }
  }, [connected, publicKey, verifyNFTOwnership]);

  const getStatusMessage = () => {
    if (connecting) {
      return "Connecting to wallet...";
    }
    if (connected && isVerifying) {
      return "Verifying NFT ownership...";
    }
    if (connected && hasNFT) {
      return "NFT verified! ✨";
    }
    if (connected) {
      return "No eligible NFTs found";
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletMultiButton className="!bg-[#FFF5E4] !text-black hover:!bg-[#FFF5E4]/90 py-2 px-4 rounded-lg font-medium" />
      <div className="text-sm text-[#FFF5E4]/70">{getStatusMessage()}</div>
    </div>
  );
}
