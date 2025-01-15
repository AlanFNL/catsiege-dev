import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';

export function useNFTVerification() {
  const { publicKey } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  const COLLECTION_ADDRESS = new PublicKey("BP4ui7x9ZGCTqFVyuED2XAM1WXZkK2JvZvBMoa7SyqAD");
  const CONNECTION = new Connection(clusterApiUrl('mainnet-beta'));

  const verifyNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      console.log("No wallet connected");
      return false;
    }

    setIsVerifying(true);
    console.log("Verifying NFTs for wallet:", publicKey.toString());

    try {
      const nfts = await getParsedNftAccountsByOwner({
        publicAddress: publicKey.toString(),
        connection: CONNECTION,
      });

      console.log("Found NFTs:", JSON.stringify(nfts, null, 2));

      // Check if any NFT belongs to our collection by checking collection.key
      const hasCollectionNFT = nfts.some(nft => {
        console.log("Checking NFT:", nft.mint);
        console.log("Collection data:", nft.collection);
        
        return nft.collection && 
               nft.collection.key === COLLECTION_ADDRESS.toString();
      });

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