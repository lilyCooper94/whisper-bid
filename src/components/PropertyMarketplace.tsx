import { PropertyCard } from "./PropertyCard";
import { useAuctions } from "@/hooks/useAuctions";

export const PropertyMarketplace = () => {
  const { auctions, loading } = useAuctions();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Private Property Auctions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bid on premium real estate with complete privacy. Your bids are encrypted using 
            Fully Homomorphic Encryption, ensuring they remain confidential until auction ends.
          </p>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Private Property Auctions
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Bid on premium real estate with complete privacy. Your bids are encrypted using 
          Fully Homomorphic Encryption, ensuring they remain confidential until auction ends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => {
          const timeLeft = Math.max(0, auction.endTime - Math.floor(Date.now() / 1000));
          const hours = Math.floor(timeLeft / 3600);
          const minutes = Math.floor((timeLeft % 3600) / 60);
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          
          let timeLeftStr = "";
          if (days > 0) {
            timeLeftStr = `${days}d ${remainingHours}h`;
          } else if (hours > 0) {
            timeLeftStr = `${hours}h ${minutes}m`;
          } else {
            timeLeftStr = `${minutes}m`;
          }

          const location = auction.id === 0 ? "Beverly Hills, CA" : 
                          auction.id === 1 ? "Manhattan, NY" : "Austin, TX";
          const beds = auction.id === 0 ? 4 : auction.id === 1 ? 3 : 4;
          const baths = auction.id === 0 ? 3 : auction.id === 1 ? 2 : 3;
          const sqft = auction.id === 0 ? "3,200 sq ft" : 
                      auction.id === 1 ? "2,100 sq ft" : "2,800 sq ft";

          return (
            <PropertyCard
              key={auction.id}
              id={auction.id.toString()}
              image={auction.imageUrl}
              title={auction.title}
              location={location}
              price={`$${(parseInt(auction.reservePrice) / 1000000000000000000000000).toFixed(2)}M`}
              beds={beds}
              baths={baths}
              sqft={sqft}
              currentBid={`$${(parseInt(auction.highestBid) / 1000000000000000000000000).toFixed(2)}M`}
              bidCount={auction.bidCount}
              timeLeft={timeLeftStr}
            />
          );
        })}
      </div>

      <div className="text-center mt-12">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-card rounded-lg border shadow-card">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse-glow" />
            <span className="text-sm font-medium text-foreground">
              All bids are protected by FHE encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};