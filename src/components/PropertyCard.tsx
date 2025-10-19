import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Bed, Bath, Square, Lock, DollarSign, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContract } from "@/hooks/useContract";
import { useAccount } from "wagmi";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  currentBid?: string;
  bidCount: number;
  timeLeft: string;
  isActive?: boolean;
  isEnded?: boolean;
  seller?: string;
}

export const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
  currentBid,
  bidCount,
  timeLeft,
  isActive = true,
  isEnded = false,
  seller,
}: PropertyCardProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const { toast } = useToast();
  const { placeBid, loading } = useContract();
  const { isConnected } = useAccount();

  const handleBidSubmit = async () => {
    if (!bidAmount || !isConnected) return;

    // Check auction status before bidding
    if (!isActive) {
      toast({
        title: "Auction Not Active",
        description: "This auction is not currently active",
        variant: "destructive",
      });
      return;
    }

    if (isEnded) {
      toast({
        title: "Auction Ended",
        description: "This auction has already ended",
        variant: "destructive",
      });
      return;
    }

    try {
      const bidAmountNum = parseFloat(bidAmount);
      if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
        toast({
          title: "Invalid Bid Amount",
          description: "Please enter a valid bid amount",
          variant: "destructive",
        });
        return;
      }

      // Pass bid amount directly in millions USD for FHE encryption
      console.log('🚀 Submitting FHE encrypted bid...');
      await placeBid(parseInt(id), bidAmountNum);

      toast({
        title: "FHE Encrypted Bid Submitted",
        description: `Your bid of $${bidAmount}M has been encrypted using FHE and submitted privately`,
      });

      setBidAmount("");
      setShowBidForm(false);
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Bid Failed",
        description: "Failed to place FHE encrypted bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.error('🖼️ Image load error:', image, e);
            // Fallback to default image
            e.currentTarget.src = '/images/property-1.jpg';
          }}
          onLoad={() => {
            console.log('🖼️ Image loaded successfully:', image);
          }}
        />
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
          <Lock className="w-3 h-3 mr-1" />
          FHE Protected
        </Badge>
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {timeLeft} left
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {beds}
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {baths}
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              {sqft}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Starting Price</p>
              <p className="text-xl font-bold text-primary">{price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{bidCount} encrypted bids</p>
              {currentBid && (
                <p className="text-sm font-medium text-accent">
                  Current: {isEncrypted ? "••••••" : currentBid}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEncrypted(!isEncrypted)}
                    className="ml-1 h-auto p-0"
                  >
                    {isEncrypted ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </p>
              )}
            </div>
          </div>

          {!showBidForm ? (
            <Button
              onClick={() => setShowBidForm(true)}
              className="w-full bg-gradient-primary text-primary-foreground shadow-card hover:shadow-glow transition-all duration-300"
              disabled={!isConnected}
            >
              <Lock className="w-4 h-4 mr-2" />
              {isConnected ? "Place Encrypted Bid" : "Connect Wallet to Bid"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Enter bid amount (millions USD)"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-10 pr-16"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    M
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleBidSubmit}
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  disabled={!bidAmount || loading}
                >
                  {loading ? "Encrypting..." : "Submit Encrypted Bid"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBidForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                🔒 Your bid will be encrypted using FHE and remain private until auction ends
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};