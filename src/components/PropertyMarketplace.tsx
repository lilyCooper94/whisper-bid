import { PropertyCard } from "./PropertyCard";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const mockProperties = [
  {
    id: "1",
    image: property1,
    title: "Modern Luxury Villa",
    location: "Beverly Hills, CA",
    price: "$2,850,000",
    beds: 4,
    baths: 3,
    sqft: "3,200 sq ft",
    currentBid: "$2,920,000",
    bidCount: 12,
    timeLeft: "2h 45m",
  },
  {
    id: "2",
    image: property2,
    title: "Urban Penthouse",
    location: "Manhattan, NY",
    price: "$1,750,000",
    beds: 3,
    baths: 2,
    sqft: "2,100 sq ft",
    currentBid: "$1,850,000",
    bidCount: 8,
    timeLeft: "6h 12m",
  },
  {
    id: "3",
    image: property3,
    title: "Suburban Family Home",
    location: "Austin, TX",
    price: "$650,000",
    beds: 4,
    baths: 3,
    sqft: "2,800 sq ft",
    currentBid: "$685,000",
    bidCount: 15,
    timeLeft: "1d 3h",
  },
];

export const PropertyMarketplace = () => {
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
        {mockProperties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
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