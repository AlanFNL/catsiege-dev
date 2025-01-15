import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';

export function useNFTVerification() {
  const { publicKey } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  const COLLECTION_ADDRESS = new PublicKey("BP4ui7x9ZGCTqFVyuED2XAM1WXZkK2JvZvBMoa7SyqAD");
  const CONNECTION = new Connection("https://api.devnet.solana.com");

  const verifyNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      console.log("No wallet connected");
      return false;
    }

    setIsVerifying(true);
    console.log("Verifying NFTs for wallet:", publicKey.toString());

    try {
      // Get all NFTs for the connected wallet
      const nfts = await getParsedNftAccountsByOwner({
        publicAddress: publicKey.toString(),
        connection: CONNECTION,
      });

      console.log("Found NFTs:", nfts);

      // Check if any NFT belongs to our collection
      const hasCollectionNFT = nfts.some(nft => 
        nft.updateAuthority === COLLECTION_ADDRESS.toString() ||
        nft.data.creators?.some(creator => 
          creator.address === COLLECTION_ADDRESS.toString()
        )
      );

      console.log("Has collection NFT:", hasCollectionNFT);
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