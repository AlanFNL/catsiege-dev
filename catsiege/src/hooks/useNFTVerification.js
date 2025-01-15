import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

export function useNFTVerification() {
  const { publicKey } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  // QuickNode endpoint - replace with your endpoint
  const QUICKNODE_RPC = "https://long-proportionate-yard.solana-mainnet.quiknode.pro/97ae51ca292b54962c8d31d524d3b615d00088ec/";
  
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
      // Query QuickNode for NFTs
      const response = await fetch(QUICKNODE_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: publicKey.toString(),
            page: 1,
            limit: 1000,
            displayOptions: {
              showCollectionMetadata: true
            }
          }
        })
      });

      const data = await response.json();
      console.log("QuickNode response:", data);

      if (data.error) {
        throw new Error(`QuickNode error: ${data.error.message}`);
      }

      const nfts = data.result.items;
      console.log("Found NFTs:", nfts);

      // Check for NFTs from our collection
      const hasCollectionNFT = nfts.some(nft => {
        console.log("Checking NFT:", {
          mint: nft.id,
          collection: nft.grouping,
        });

        return nft.grouping?.some(group => 
          group.group_key === "collection" && 
          group.group_value === COLLECTION_ADDRESS
        );
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