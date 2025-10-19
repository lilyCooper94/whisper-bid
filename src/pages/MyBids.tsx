import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useContract } from '@/hooks/useContract';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, EyeOff, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MyBid {
  auctionId: number;
  auctionTitle: string;
  bidAmount: string;
  timestamp: number;
  isRevealed: boolean;
  isWinning: boolean;
}

export default function MyBids() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const { decryptBidData } = useContract();
  const { toast } = useToast();
  const [myBids, setMyBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [decryptedBids, setDecryptedBids] = useState<Record<number, string>>({});

  // Mock data for demonstration
  useEffect(() => {
    if (!address) return;
    
    setLoading(true);
    // Simulate fetching user's bids
    const mockBids: MyBid[] = [
      {
        auctionId: 0,
        auctionTitle: "Modern Luxury Villa",
        bidAmount: "2920000", // This would be encrypted in real implementation
        timestamp: Date.now() - 3600000, // 1 hour ago
        isRevealed: true,
        isWinning: true
      },
      {
        auctionId: 1,
        auctionTitle: "Urban Penthouse", 
        bidAmount: "1800000",
        timestamp: Date.now() - 7200000, // 2 hours ago
        isRevealed: true,
        isWinning: false
      }
    ];
    
    setMyBids(mockBids);
    setLoading(false);
  }, [address]);

  const decryptBid = async (auctionId: number, bidIndex: number) => {
    if (!instance || !address) {
      toast({
        title: "Error",
        description: "Wallet not connected or encryption service not available",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔍 Starting FHE bid decryption...');
      
      // Use the real FHE decryption function
      const decryptedData = await decryptBidData(auctionId, bidIndex);
      
      const decryptedAmount = decryptedData.amount;
      setDecryptedBids(prev => ({
        ...prev,
        [auctionId]: decryptedAmount
      }));
      
      toast({
        title: "Bid Decrypted",
        description: `Your bid amount: $${(parseInt(decryptedAmount) / 1000000000000000000000000).toFixed(2)}M`,
      });
    } catch (error) {
      console.error('Error decrypting bid:', error);
      toast({
        title: "Decryption Failed",
        description: "Failed to decrypt bid amount. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your bids...</p>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">My Bids</h2>
          <p className="text-muted-foreground">Please connect your wallet to view your bids</p>
        </div>
      </div>
    );
  }

  if (myBids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">My Bids</h2>
          <p className="text-muted-foreground">You haven't placed any bids yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">My Bids</h2>
        <p className="text-muted-foreground">
          View and manage your encrypted bids across all auctions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myBids.map((bid) => (
          <Card key={bid.auctionId} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{bid.auctionTitle}</h3>
                <Badge variant={bid.isWinning ? "default" : "secondary"}>
                  {bid.isWinning ? "Winning" : "Outbid"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Bid:</span>
                  <div className="flex items-center space-x-2">
                    {decryptedBids[bid.auctionId] ? (
                      <span className="font-mono text-lg">
                        ${parseFloat(decryptedBids[bid.auctionId]).toFixed(2)}M
                      </span>
                    ) : (
                      <span className="font-mono text-lg">••••••</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => decryptBid(bid.auctionId, bid.bidAmount)}
                      className="h-auto p-1"
                    >
                      {decryptedBids[bid.auctionId] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Placed:</span>
                  <span>{formatTime(bid.timestamp)}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Status:</span>
                  <span className={bid.isWinning ? "text-green-600" : "text-orange-600"}>
                    {bid.isWinning ? "Currently Winning" : "Outbid"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Encrypted with FHE</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-card rounded-lg border shadow-card">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse-glow" />
            <span className="text-sm font-medium text-foreground">
              All your bids are protected by FHE encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
