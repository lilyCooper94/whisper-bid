import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🏠 Initializing auctions with sample data...");
  
  const contractAddress = "0xCfA6EF621363f19fD7A5E9362C05013D00A69616";
  const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
  const whisperBid = WhisperBidBasic.attach(contractAddress);

  const auctions = [
    {
      title: "Modern Luxury Villa",
      description: "Stunning modern villa with panoramic views in Beverly Hills",
      imageUrl: "/property-1.jpg",
      location: "Beverly Hills, CA",
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 3200,
      reservePrice: "0x0000000000000000000000000000000000000000000000000000000000000001", // Placeholder bytes32
      duration: 7 * 24 * 60 * 60
    },
    {
      title: "Urban Penthouse", 
      description: "Luxury penthouse in the heart of Manhattan",
      imageUrl: "/property-2.jpg",
      location: "Manhattan, NY",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 2100,
      reservePrice: "0x0000000000000000000000000000000000000000000000000000000000000002", // Placeholder bytes32
      duration: 10 * 24 * 60 * 60
    },
    {
      title: "Suburban Family Home",
      description: "Perfect family home in quiet Austin neighborhood",
      imageUrl: "/property-3.jpg",
      location: "Austin, TX",
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2800,
      reservePrice: "0x0000000000000000000000000000000000000000000000000000000000000003", // Placeholder bytes32
      duration: 14 * 24 * 60 * 60
    }
  ];

  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    console.log(`Creating auction ${i + 1}: ${auction.title}`);
    
    try {
      const tx = await whisperBid.createAuction(
        auction.title,
        auction.description,
        auction.imageUrl,
        auction.location,
        auction.bedrooms,
        auction.bathrooms,
        auction.squareFeet,
        auction.reservePrice,
        auction.duration,
        "0x"
      );
      
      await tx.wait();
      console.log(`✅ Auction ${i + 1} created successfully`);
    } catch (error) {
      console.error(`❌ Error creating auction ${i + 1}:`, error.message);
    }
  }

  console.log("\n🎉 All auctions initialized!");
  console.log(`📋 Contract address: ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
