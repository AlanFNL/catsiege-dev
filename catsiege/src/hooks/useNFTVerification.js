import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

export function useNFTVerification() {
  const { publicKey } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  const QUICKNODE_RPC = "https://long-proportionate-yard.solana-mainnet.quiknode.pro/97ae51ca292b54962c8d31d524d3b615d00088ec/";
  const COLLECTION_ADDRESS = "BP4ui7x9ZGCTqFVyuED2XAM1WXZkK2JvZvBMoa7SyqAD";

  const updateUserQuest = async () => {
    try {
      const token = localStorage.getItem('tokenCat');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating quest status with:', {
        verified: true,
        walletAddress: publicKey.toString()
      });

      const response = await fetch('https://catsiege-dev.onrender.com/api/user/quests/nft-holder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verified: true,
          walletAddress: publicKey.toString()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server response error:', data);
        throw new Error(data.message || 'Failed to update quest status');
      }

      console.log('Quest status updated successfully:', data);
      
      // Force refresh user data
      await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return data;
    } catch (error) {
      console.error('Error updating quest status:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const verifyNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      console.log("No wallet connected");
      return false;
    }

    setIsVerifying(true);
    console.log("Verifying NFTs for wallet:", publicKey.toString());

    try {
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
      const hasCollectionNFT = nfts.some(nft => {
        return nft.grouping?.some(group => 
          group.group_key === "collection" && 
          group.group_value === COLLECTION_ADDRESS
        );
      });

      console.log("Has CatSiege Zero NFT:", hasCollectionNFT);
      setHasNFT(hasCollectionNFT);

      if (hasCollectionNFT) {
        await updateUserQuest();
      }

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