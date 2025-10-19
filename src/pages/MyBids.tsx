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
  bidIndex: number; // Add bid index for decryption
}

export default function MyBids() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const { decryptBidData } = useContract();
  const { toast } = useToast();
  const [myBids, setMyBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [decryptedBids, setDecryptedBids] = useState<Record<number, string>>({});

  // Load real bid data from contract
  useEffect(() => {
    if (!address) {
      setMyBids([]); // Clear bids when no address
      return;
    }
    
    const loadMyBids = async () => {
      setLoading(true);
      setMyBids([]); // Clear previous bids first
      try {
        console.log('🔍 Loading user bids from contract...');
        console.log('👤 User address:', address);
        
        // Get all auctions first
        const { CONTRACT_ADDRESS, CONTRACT_ABI } = await import('@/config/contracts');
        const { ethers } = await import('ethers');
        
        if (!window.ethereum) {
          throw new Error('Ethereum provider not found');
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // Get total auction count
        const auctionCount = await contract.getAuctionCount();
        console.log('📊 Total auctions:', Number(auctionCount));
        
        const userBids: MyBid[] = [];
        
        // Check each auction for user's bids
        for (let auctionId = 0; auctionId < Number(auctionCount); auctionId++) {
          try {
            // Get auction info
            const auctionInfo = await contract.getAuctionInfo(auctionId);
            const auctionTitle = auctionInfo[0]; // title
            
            // Get all bids for this auction
            const bids = await contract.getAuctionBids(auctionId);
            console.log(`🔍 Auction ${auctionId} has ${bids.length} bids`);
            
            // Find user's bids in this auction
            for (let bidIndex = 0; bidIndex < bids.length; bidIndex++) {
              const bid = bids[bidIndex];
              if (bid.bidder.toLowerCase() === address.toLowerCase()) {
                console.log(`✅ Found user bid in auction ${auctionId}, bid ${bidIndex}`);
                
                userBids.push({
                  auctionId: auctionId,
                  auctionTitle: auctionTitle,
                  bidAmount: "••••••", // Encrypted, will be decrypted on demand
                  timestamp: Number(bid.timestamp),
                  isRevealed: false,
                  isWinning: false, // Will be determined later
                  bidIndex: bidIndex // Store the bid index for decryption
                });
              }
            }
          } catch (error) {
            console.log(`⚠️ Error loading auction ${auctionId}:`, error);
          }
        }
        
        console.log(`📋 Found ${userBids.length} user bids`);
        console.log('🔍 User bids details:', userBids);
        setMyBids(userBids);
        
      } catch (error) {
        console.error('❌ Error loading user bids:', error);
        toast({
          title: "Error",
          description: "Failed to load your bids from the contract",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMyBids();
  }, [address, toast]);

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
      console.log('📊 Decrypting bid for auction:', auctionId, 'bid index:', bidIndex);
      
      // Generate keypair synchronously (like aidwell-connect)
      console.log('🔑 Generating FHE keypair...');
      let keypair;
      try {
        keypair = instance.generateKeypair();
        console.log('✅ FHE keypair generated:', keypair);
      } catch (keyError) {
        console.log('⚠️ Keypair generation failed:', keyError);
        throw new Error('Failed to generate FHE keypair');
      }
      
      // Get the encrypted bid data from contract
      const { CONTRACT_ADDRESS, CONTRACT_ABI } = await import('@/config/contracts');
      const { ethers } = await import('ethers');
      
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Get the specific bid
      const bids = await contract.getAuctionBids(auctionId);
      const bid = bids[bidIndex];
      
      if (!bid) {
        throw new Error('Bid not found');
      }
      
      console.log('🔍 Bid data:', bid);
      
      // Prepare handle for decryption
      const handleContractPairs = [
        { handle: bid.amount, contractAddress: CONTRACT_ADDRESS }
      ];
      
      console.log('🔍 Handle contract pairs:', handleContractPairs);
      console.log('🔍 Bid amount handle:', bid.amount);
      console.log('🔍 Contract address:', CONTRACT_ADDRESS);
      
      // Check if handle is valid
      if (!bid.amount || bid.amount === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw new Error('Invalid bid handle - bid may not be encrypted');
      }
      
      // Create EIP712 signature (like aidwell-connect)
      console.log('🔐 Creating EIP712 signature...');
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      console.log('🔐 Signing EIP712 data...');
      const { ethers } = await import('ethers');
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      console.log('✅ EIP712 signature created:', signature);

      // Decrypt using FHE instance with full parameters (like aidwell-connect)
      console.log('🔓 Attempting FHE decryption with EIP712...');
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );
      console.log('🔍 Decryption result:', result);
      
      const decryptedAmount = result[bid.amount];
      console.log('🔍 Decrypted amount:', decryptedAmount);
      
      if (decryptedAmount) {
        // Convert from integer back to millions USD
        const amountInMillions = Number(decryptedAmount) / 100;
        
        setDecryptedBids(prev => ({
          ...prev,
          [`${auctionId}-${bidIndex}`]: `$${amountInMillions.toFixed(2)}M`
        }));
        
        toast({
          title: "Bid Decrypted",
          description: `Your bid amount: $${amountInMillions.toFixed(2)}M`,
        });
      } else {
        throw new Error('Failed to decrypt bid amount');
      }
      
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
                    {decryptedBids[`${bid.auctionId}-${bid.bidIndex}`] ? (
                      <span className="font-mono text-lg">
                        {decryptedBids[`${bid.auctionId}-${bid.bidIndex}`]}
                      </span>
                    ) : (
                      <span className="font-mono text-lg">••••••</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => decryptBid(bid.auctionId, bid.bidIndex)}
                      className="h-auto p-1"
                    >
                      {decryptedBids[`${bid.auctionId}-${bid.bidIndex}`] ? (
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
