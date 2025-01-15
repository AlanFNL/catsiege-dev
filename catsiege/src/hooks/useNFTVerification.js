import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';

export function useNFTVerification() {
  const { publicKey } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  // Connect to mainnet
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  // Collection address
  const COLLECTION_ADDRESS = "BP4ui7x9ZGCTqFVyuED2XAM1WXZkK2JvZvBMoa7SyqAD";

  const verifyNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      console.log("No wallet connected");
      return false;
    }

    setIsVerifying(true);
    console.log("Verifying NFTs for wallet:", publicKey.toString());

    try {
      // Fetch all NFTs owned by the wallet
      const nftAccounts = await getParsedNftAccountsByOwner({
        publicAddress: publicKey.toString(),
        connection: connection,
      });

      console.log("Found NFTs:", nftAccounts);

      // Check each NFT to see if it belongs to our collection
      for (const nft of nftAccounts) {
        console.log("Checking NFT:", {
          mint: nft.mint,
          data: nft.data,
          updateAuthority: nft.updateAuthority,
          collection: nft.collection
        });

        // Check multiple possible locations for collection information
        const isInCollection = 
          nft.collection?.address === COLLECTION_ADDRESS ||
          nft.collection?.key === COLLECTION_ADDRESS ||
          nft.data?.collection?.key === COLLECTION_ADDRESS ||
          nft.data?.collection?.address === COLLECTION_ADDRESS;

        if (isInCollection) {
          console.log("Found matching NFT:", nft.mint);
          setHasNFT(true);
          return true;
        }
      }

      console.log("No matching NFTs found");
      setHasNFT(false);
      return false;

    } catch (error) {
      console.error("Error verifying NFT ownership:", error);
      setHasNFT(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [publicKey]);

  return {
    isVerifying,
    hasNFT,
    verifyNFTOwnership
  };
} 