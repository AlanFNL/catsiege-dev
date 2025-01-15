import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useNFTStatus() {
  const [nftStatus, setNftStatus] = useState({
    nftVerified: false,
    walletAddress: null,
    isLoading: true
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchNFTStatus = async () => {
      try {
        // You can either use the user data directly
        if (user) {
          setNftStatus({
            nftVerified: user.quests?.nftVerified || false,
            walletAddress: user.walletAddress || null,
            isLoading: false
          });
        }
        
        // Or fetch it separately if needed
        const response = await api.get('https://catsiege-dev.onrender.com/api/user/nft-status');
        setNftStatus({
          nftVerified: response.data.nftVerified,
          walletAddress: response.data.walletAddress,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching NFT status:', error);
        setNftStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchNFTStatus();
  }, [user]);

  return nftStatus;
} 