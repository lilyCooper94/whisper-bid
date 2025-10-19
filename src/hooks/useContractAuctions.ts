import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useState, useEffect } from 'react';

// Image mapping for property images
const imageMapping: Record<string, string> = {
  '/property-1.jpg': '/images/property-1.jpg',
  '/property-2.jpg': '/images/property-2.jpg', 
  '/property-3.jpg': '/images/property-3.jpg',
  'property-1.jpg': '/images/property-1.jpg',
  'property-2.jpg': '/images/property-2.jpg',
  'property-3.jpg': '/images/property-3.jpg',
};

// Function to get correct image path
const getImagePath = (imageUrl: string): string => {
  if (imageMapping[imageUrl]) {
    return imageMapping[imageUrl];
  }
  // Fallback to default property image
  return '/images/property-1.jpg';
};

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
        
        // Extract data from contract response (simplified contract returns 14 elements)
        const [
          title,
          description,
          imageUrl,
          location,
          bedrooms,
          bathrooms,
          squareFeet,
          reservePrice,
          bidCount,
          isActive,
          isEnded,
          seller,
          startTime,
          endTime
        ] = auctionInfo as any[];

        const auction: AuctionData = {
          id: i,
          title: title || `Auction ${i}`,
          description: description || `Description for auction ${i}`,
          imageUrl: getImagePath(imageUrl || `/property-${(i % 3) + 1}.jpg`),
          location: location || `Location ${i}`,
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          squareFeet: Number(squareFeet) || 0,
          reservePrice: reservePrice?.toString() || "0",
          highestBid: "0", // No highest bid in simplified contract
          bidCount: Number(bidCount) || 0,
          isActive: Boolean(isActive),
          isEnded: Boolean(isEnded),
          seller: seller || "0x0000000000000000000000000000000000000000",
          highestBidder: "0x0000000000000000000000000000000000000000", // No highest bidder in simplified contract
          startTime: Number(startTime) || 0,
          endTime: Number(endTime) || 0,
        };

        console.log(`📊 Processed auction ${i}:`, auction);
        console.log(`🖼️ Image URL for auction ${i}:`, auction.imageUrl);
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
