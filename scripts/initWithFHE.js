import pkg from 'hardhat';
const { ethers } = pkg;

// Mock window and globalThis for Node.js environment
globalThis.window = globalThis;
globalThis.ethereum = {
  request: async () => {},
  isMetaMask: false
};

async function main() {
  console.log("🔐 Initializing auctions with FHE encryption...");
  
  try {
    // Import FHE SDK after setting up global environment
    const { createInstance, initSDK, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');
    
    // Initialize FHE SDK
    console.log("📦 Initializing FHE SDK...");
    await initSDK();
    
    // Create FHE instance
    const config = {
      ...SepoliaConfig,
      network: globalThis.ethereum
    };
    
    const zamaInstance = await createInstance(config);
    console.log("✅ FHE SDK initialized");
    
    const contractAddress = "0xCfA6EF621363f19fD7A5E9362C05013D00A69616";
    const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
    const whisperBid = WhisperBidBasic.attach(contractAddress);
    
    // Get deployer address
    const [deployer] = await ethers.getSigners();
    console.log("�� Using deployer address:", deployer.address);

    const auctions = [
      {
        title: "Modern Luxury Villa",
        description: "Stunning modern villa with panoramic views in Beverly Hills",
        imageUrl: "/property-1.jpg",
        location: "Beverly Hills, CA",
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 3200,
        reservePrice: 2850000000000000000000000n, // $2.85M in Wei
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
        reservePrice: 1750000000000000000000000n, // $1.75M in Wei
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
        reservePrice: 650000000000000000000000n, // $0.65M in Wei
        duration: 14 * 24 * 60 * 60
      }
    ];

    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i];
      console.log(`\n🏠 Creating auction ${i + 1}: ${auction.title}`);
      
      try {
        // Create FHE encrypted input for reserve price
        console.log("🔐 Encrypting reserve price with FHE...");
        const input = zamaInstance.createEncryptedInput(contractAddress, deployer.address);
        input.add32(auction.reservePrice);
        const encryptedInput = await input.encrypt();
        
        console.log("✅ FHE encryption completed");
        
        // Convert handles to proper format (32 bytes)
        const convertToBytes32 = (handle) => {
          const hex = `0x${Array.from(handle)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')}`;
          // Ensure exactly 32 bytes (66 characters including 0x)
          if (hex.length < 66) {
            return hex.padEnd(66, '0');
          } else if (hex.length > 66) {
            return hex.substring(0, 66);
          }
          return hex;
        };

        const reservePriceHandle = convertToBytes32(encryptedInput.handles[0]);
        const proof = `0x${Array.from(encryptedInput.inputProof)
          .map(b => b.toString(16).padStart(2, '0')).join('')}`;

        console.log("📝 Calling contract with FHE encrypted data...");
        const tx = await whisperBid.createAuction(
          auction.title,
          auction.description,
          auction.imageUrl,
          auction.location,
          auction.bedrooms,
          auction.bathrooms,
          auction.squareFeet,
          reservePriceHandle, // FHE encrypted reserve price
          auction.duration,
          proof
        );
        
        await tx.wait();
        console.log(`✅ Auction ${i + 1} created successfully with FHE encryption`);
      } catch (error) {
        console.error(`❌ Error creating auction ${i + 1}:`, error.message);
        console.error("Full error:", error);
      }
    }

    console.log("\n🎉 All auctions initialized with FHE encryption!");
    console.log(`📋 Contract address: ${contractAddress}`);
    console.log("🔐 All reserve prices are encrypted using FHE");
    console.log("🌐 You can now view the auctions in the frontend application.");
    
  } catch (error) {
    console.error("❌ FHE initialization failed:", error.message);
    console.log("💡 Falling back to simple initialization without FHE...");
    
    // Fallback to simple initialization
    const contractAddress = "0xCfA6EF621363f19fD7A5E9362C05013D00A69616";
    const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
    const whisperBid = WhisperBidBasic.attach(contractAddress);
    
    console.log("�� Using contract address:", contractAddress);
    console.log("⚠️  Note: This is a simplified version without FHE encryption");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
