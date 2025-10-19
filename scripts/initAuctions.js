import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Initializing auctions with sample data...");

  // Get the deployed contract
  const contractAddress = "0xE6f6b1C0Faea0c972Fe6Eb61289878027905382c";
  const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
  const contract = WhisperBidBasic.attach(contractAddress);

  // Sample auction data
  const auctions = [
    {
      title: "Modern Luxury Villa",
      description: "Stunning modern villa with panoramic views in Beverly Hills",
      imageUrl: "https://example.com/property1.jpg",
      reservePrice: ethers.parseEther("2.85"), // $2.85M
      duration: 3 * 24 * 60 * 60 // 3 days
    },
    {
      title: "Urban Penthouse", 
      description: "Luxury penthouse in the heart of Manhattan",
      imageUrl: "https://example.com/property2.jpg",
      reservePrice: ethers.parseEther("1.75"), // $1.75M
      duration: 5 * 24 * 60 * 60 // 5 days
    },
    {
      title: "Suburban Family Home",
      description: "Perfect family home in quiet Austin neighborhood",
      imageUrl: "https://example.com/property3.jpg", 
      reservePrice: ethers.parseEther("0.65"), // $0.65M
      duration: 7 * 24 * 60 * 60 // 7 days
    }
  ];

  // Create auctions
  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    console.log(`Creating auction ${i + 1}: ${auction.title}`);
    
    try {
      const tx = await contract.createAuction(
        auction.title,
        auction.description,
        auction.imageUrl,
        auction.reservePrice,
        auction.duration
      );
      
      await tx.wait();
      console.log(`✅ Auction ${i + 1} created successfully`);
    } catch (error) {
      console.error(`❌ Error creating auction ${i + 1}:`, error);
    }
  }

  console.log("🎉 All auctions initialized successfully!");
  console.log(`Contract address: ${contractAddress}`);
  console.log("You can now view the auctions in the frontend application.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
