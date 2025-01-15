import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';

export function useNFTVerification() {
  const { publicKey } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  const COLLECTION_ADDRESS = "BP4ui7x9ZGCTqFVyuED2XAM1WXZkK2JvZvBMoa7SyqAD";
  const HELIUS_API_KEY = "d22c0466-4718-400f-938f-86ca3c0e0cf5"; // Replace with your API key

  const verifyNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      console.log("No wallet connected");
      return false;
    }

    setIsVerifying(true);
    console.log("Verifying NFTs for wallet:", publicKey.toString());

    try {
      // Get all assets owned by the wallet using Helius API
      const response = await axios.post(
        `https://api.helius.xyz/v0/addresses/${publicKey.toString()}/nfts?api-key=${HELIUS_API_KEY}`,
        {
          ownerAddress: publicKey.toString(),
          displayOptions: {
            showCollectionMetadata: true,
          },
        }
      );

      console.log("Found NFTs:", response.data);

      // Check if any NFT belongs to our collection
      const hasCollectionNFT = response.data.some(nft => 
        nft.collection?.address === COLLECTION_ADDRESS
      );

      console.log("Has CatSiege Zero NFT:", hasCollectionNFT);
      setHasNFT(hasCollectionNFT);
      return hasCollectionNFT;

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