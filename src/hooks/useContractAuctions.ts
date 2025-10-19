import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useState, useEffect } from 'react';

export interface AuctionData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  reservePrice: string;
  highestBid: string;
  bidCount: number;
  isActive: boolean;
  isEnded: boolean;
  seller: string;
  highestBidder: string;
  startTime: number;
  endTime: number;
}

// Hook to read a single auction from contract
function useAuctionData(auctionId: number) {
  const { data: auctionInfo, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getAuctionInfo',
    args: [auctionId],
  });

  console.log(`🔍 Auction ${auctionId} data:`, {
    auctionInfo,
    isLoading,
    error,
    contractAddress: CONTRACT_ADDRESS
  });

  return { auctionInfo, isLoading, error };
}

export function useContractAuctions() {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Get auction count from contract
  const { data: auctionCount, isLoading: countLoading, error: countError } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'auctionCounter',
  });

  console.log('🔍 Contract Debug Info:', {
    contractAddress: CONTRACT_ADDRESS,
    auctionCount,
    countLoading,
    countError
  });

  // Read individual auction data
  const auction0 = useAuctionData(0);
  const auction1 = useAuctionData(1);
  const auction2 = useAuctionData(2);

  useEffect(() => {
    console.log('🚀 Processing auction data...');
    console.log('📊 Auction count:', auctionCount);
    console.log('⏳ Count loading:', countLoading);
    
    if (!auctionCount || countLoading) {
      console.log('⏸️ Waiting for auction count...');
      return;
    }

    const auctionData: AuctionData[] = [];
    const auctionResults = [auction0, auction1, auction2];

    console.log(`📋 Processing ${Number(auctionCount)} auctions...`);

    for (let i = 0; i < Number(auctionCount) && i < auctionResults.length; i++) {
      const { auctionInfo, isLoading, error } = auctionResults[i];
      
      console.log(`🔍 Processing auction ${i}:`, {
        auctionInfo,
        isLoading,
        error
      });

      if (isLoading) {
        console.log(`⏳ Auction ${i} still loading...`);
        continue;
      }

      if (error) {
        console.error(`❌ Error reading auction ${i}:`, error);
        continue;
      }

      if (auctionInfo) {
        console.log(`✅ Successfully read auction ${i} from contract:`, auctionInfo);
        
        // Extract data from contract response
        const [
          title,
          description,
          imageUrl,
          location,
          bedrooms,
          bathrooms,
          squareFeet,
          reservePrice,
          highestBid,
          bidCount,
          isActive,
          isEnded,
          seller,
          highestBidder,
          startTime,
          endTime
        ] = auctionInfo as any[];

        const auction: AuctionData = {
          id: i,
          title: title || `Auction ${i}`,
          description: description || `Description for auction ${i}`,
          imageUrl: imageUrl || `/property-${(i % 3) + 1}.jpg`,
          location: location || `Location ${i}`,
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          squareFeet: Number(squareFeet) || 0,
          reservePrice: reservePrice?.toString() || "0",
          highestBid: highestBid?.toString() || "0",
          bidCount: Number(bidCount) || 0,
          isActive: Boolean(isActive),
          isEnded: Boolean(isEnded),
          seller: seller || "0x0000000000000000000000000000000000000000",
          highestBidder: highestBidder || "0x0000000000000000000000000000000000000000",
          startTime: Number(startTime) || 0,
          endTime: Number(endTime) || 0,
        };

        console.log(`📊 Processed auction ${i}:`, auction);
        auctionData.push(auction);
      } else {
        console.log(`⚠️ No data for auction ${i}`);
      }
    }

    console.log(`📊 Final processed auction data:`, auctionData);
    setAuctions(auctionData);
    setLoading(false);
  }, [auctionCount, countLoading, auction0.auctionInfo, auction1.auctionInfo, auction2.auctionInfo]);

  return { auctions, loading: loading || countLoading };
}
