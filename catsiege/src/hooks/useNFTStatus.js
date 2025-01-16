import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useNFTStatus() {
  const [nftStatus, setNFTStatus] = useState({
    nftVerified: false,
    walletAddress: null,
    isLoading: true,
    error: null
  });

  const checkNFTStatus = async () => {
    try {
      const token = localStorage.getItem('tokenCat');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('https://catsiege-dev.onrender.com/api/user/nft-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch NFT status');
      }

      const data = await response.json();
   
      
      setNFTStatus({
        nftVerified: data.nftVerified,
        walletAddress: data.walletAddress,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error checking NFT status:', error);
      setNFTStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    checkNFTStatus();
  }, []);

  return {
    ...nftStatus,
    refreshStatus: checkNFTStatus
  };
} 