import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying WhisperBidSimple contract...");

  const WhisperBidSimple = await ethers.getContractFactory("WhisperBidSimple");
  const whisperBid = await WhisperBidSimple.deploy();

  await whisperBid.waitForDeployment();
  const contractAddress = await whisperBid.getAddress();
  console.log("✅ WhisperBidSimple deployed to:", contractAddress);

  // Update the contract address in the frontend config
  const contractConfigPath = path.join(__dirname, '../src/config/contracts.ts');
  let contractConfig = fs.readFileSync(contractConfigPath, 'utf8');
  
  // Replace any existing contract address
  contractConfig = contractConfig.replace(
    /export const CONTRACT_ADDRESS = "0x[a-fA-F0-9]{40}";/,
    `export const CONTRACT_ADDRESS = "${contractAddress}";`
  );
  
  fs.writeFileSync(contractConfigPath, contractConfig);
  console.log("✅ Contract address updated in frontend config");

  // Initialize auctions
  console.log("\n🏠 Initializing auctions...");
  
  const auctions = [
    {
      title: "Modern Luxury Villa",
      description: "Stunning modern villa with panoramic views in Beverly Hills",
      imageUrl: "/property-1.jpg",
      location: "Beverly Hills, CA",
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 3200,
      reservePrice: ethers.parseEther("2.85"), // $2.85M
      duration: 7 * 24 * 60 * 60 // 7 days
    },
    {
      title: "Urban Penthouse", 
      description: "Luxury penthouse in the heart of Manhattan",
      imageUrl: "/property-2.jpg",
      location: "Manhattan, NY",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 2100,
      reservePrice: ethers.parseEther("1.75"), // $1.75M
      duration: 10 * 24 * 60 * 60 // 10 days
    },
    {
      title: "Suburban Family Home",
      description: "Perfect family home in quiet Austin neighborhood",
      imageUrl: "/property-3.jpg",
      location: "Austin, TX",
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2800,
      reservePrice: ethers.parseEther("0.65"), // $0.65M
      duration: 14 * 24 * 60 * 60 // 14 days
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
        auction.duration
      );
      
      await tx.wait();
      console.log(`✅ Auction ${i + 1} created successfully`);
    } catch (error) {
      console.error(`❌ Error creating auction ${i + 1}:`, error.message);
    }
  }

  console.log("\n🎉 Deployment and initialization complete!");
  console.log(`📋 Contract address: ${contractAddress}`);
  console.log("🏠 All three auctions initialized with extended durations:");
  console.log("   - Modern Luxury Villa: 7 days");
  console.log("   - Urban Penthouse: 10 days");
  console.log("   - Suburban Family Home: 14 days");
  console.log("🌐 You can now view the auctions in the frontend application.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
