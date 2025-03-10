import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNFTVerification } from "../hooks/useNFTVerification";
import CryptoJS from "crypto-js";

export function WalletConnect({ onClose }) {
  const { connected, connecting, publicKey, wallet, wallets } = useWallet();
  const { verifyNFTOwnership, isVerifying, hasNFT } = useNFTVerification();
  const [connectionError, setConnectionError] = useState(null);
  const [connectionTimeout, setConnectionTimeout] = useState(null);

  // Check if Phantom wallet exists
  const isPhantomInstalled = wallets.some(
    (wallet) => wallet.adapter.name === "Phantom" || wallet.name === "Phantom"
  );

  useEffect(() => {
    if (connected && publicKey) {
      // Clear any connection errors or timeouts
      setConnectionError(null);
      clearTimeout(connectionTimeout);

      verifyNFTOwnership()
        .then((verified) => {
          if (verified) {
            const hash = CryptoJS.SHA256(
              `${publicKey.toString()}_nft_verified_catsiege`
            ).toString();
            localStorage.setItem("cs_nft_v", hash);
          }
        })
        .catch((error) => {
          console.error("NFT verification error:", error);
          setConnectionError(
            "Failed to verify NFT ownership. Please try again later."
          );
        });
    }
  }, [connected, publicKey, verifyNFTOwnership]);

  useEffect(() => {
    // Set a timeout if connecting takes too long
    if (connecting) {
      const timeout = setTimeout(() => {
        setConnectionError(
          "Connection timed out. Please try again or use a different wallet."
        );
      }, 15000); // 15 second timeout

      setConnectionTimeout(timeout);

      return () => clearTimeout(timeout);
    }
  }, [connecting]);

  // Handle different wallet connection states
  const getStatusMessage = () => {
    if (connectionError) {
      return connectionError;
    }
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
    if (!isPhantomInstalled) {
      return "Phantom wallet not detected";
    }
    return null;
  };

  const handleInstallPhantom = () => {
    window.open("https://phantom.app/download", "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!isPhantomInstalled ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-center text-[#FFF5E4]/80 mb-2">
            To connect your wallet, you need to install Phantom first
          </div>
          <button
            onClick={handleInstallPhantom}
            className="w-full bg-gradient-to-r from-[#7963FA] to-[#5E4FCB] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Install Phantom Wallet
          </button>
          <button
            onClick={() => {
              if (onClose) onClose();
            }}
            className="text-[#FFF5E4]/60 hover:text-[#FFF5E4] text-sm"
          >
            I'll do this later
          </button>
        </div>
      ) : (
        <>
          <WalletMultiButton className="!bg-[#FFF5E4] !text-black hover:!bg-[#FFF5E4]/90 py-2 px-4 rounded-lg font-medium w-full" />
          <div
            className={`text-sm ${
              connectionError ? "text-red-400" : "text-[#FFF5E4]/70"
            }`}
          >
            {getStatusMessage()}
          </div>
          {connectionError && (
            <button
              onClick={() => {
                setConnectionError(null);
                // Force refresh the wallet connection
                if (wallet) {
                  try {
                    wallet.adapter.disconnect();
                    setTimeout(() => {
                      wallet.adapter.connect();
                    }, 1000);
                  } catch (e) {
                    console.error("Error reconnecting:", e);
                  }
                }
              }}
              className="text-[#FFF5E4]/80 hover:text-[#FFF5E4] text-sm underline"
            >
              Try again
            </button>
          )}
        </>
      )}
    </div>
  );
}
