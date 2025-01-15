import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Metaplex } from '@metaplex-foundation/js';
import { useCallback, useState } from 'react';
import { authService } from '../services/api';

const COLLECTION_ADDRESS = 'BP4ui7x9ZGCTqFVyuED2XAM1WXZkK2JvZvBMoa7SyqAD';

export function useNFTVerification() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [isVerifying, setIsVerifying] = useState(false);
    const [hasNFT, setHasNFT] = useState(false);

    const verifyNFTOwnership = useCallback(async () => {
        if (!publicKey) return false;
        
        setIsVerifying(true);
        try {
            const metaplex = new Metaplex(connection);
            const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
            
            const hasCollectionNFT = nfts.some(nft => 
                nft.collection?.address.toString() === COLLECTION_ADDRESS
            );

            setHasNFT(hasCollectionNFT);

            if (hasCollectionNFT) {
                // Claim NFT holder quest if NFT is found
                await authService.claimQuest('NFT_HOLDER');
            }

            return hasCollectionNFT;
        } catch (error) {
            console.error('Error verifying NFT ownership:', error);
            return false;
        } finally {
            setIsVerifying(false);
        }
    }, [connection, publicKey]);

    return {
        verifyNFTOwnership,
        isVerifying,
        hasNFT
    };
} 