import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useState, useEffect } from 'react';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';

export interface AuctionData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
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

export function useAuctions() {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Get auction count
  const { data: auctionCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'auctionCounter',
  });

  // Fetch all auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      if (!auctionCount) return;
      
      setLoading(true);
      const auctionData: AuctionData[] = [];
      
      for (let i = 0; i < Number(auctionCount); i++) {
        try {
          // For now, we'll use mock data that matches the contract structure
          // In a real implementation, you would call the contract's getAuctionInfo function
          const mockAuction: AuctionData = {
            id: i,
            title: i === 0 ? "Modern Luxury Villa" : i === 1 ? "Urban Penthouse" : "Suburban Family Home",
            description: i === 0 ? "Stunning modern villa with panoramic views" : 
                        i === 1 ? "Luxury penthouse in the heart of Manhattan" : 
                        "Perfect family home in quiet neighborhood",
            imageUrl: i === 0 ? property1 : i === 1 ? property2 : property3,
            reservePrice: i === 0 ? "2850000000000000000000000" : i === 1 ? "1750000000000000000000000" : "650000000000000000000000", // Wei values
            highestBid: i === 0 ? "2920000000000000000000000" : i === 1 ? "1850000000000000000000000" : "685000000000000000000000", // Wei values
            bidCount: i === 0 ? 12 : i === 1 ? 8 : 15,
            isActive: true,
            isEnded: false,
            seller: "0x0000000000000000000000000000000000000000",
            highestBidder: "0x0000000000000000000000000000000000000000",
            startTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            endTime: Math.floor(Date.now() / 1000) + (i === 0 ? 7 * 24 * 60 * 60 : i === 1 ? 10 * 24 * 60 * 60 : 14 * 24 * 60 * 60), // 7d, 10d, 14d
          };
          auctionData.push(mockAuction);
        } catch (error) {
          console.error(`Error fetching auction ${i}:`, error);
        }
      }
      
      setAuctions(auctionData);
      setLoading(false);
    };

    fetchAuctions();
  }, [auctionCount]);

  return { auctions, loading };
}
