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
  const contractAddress = "0x20C0846A440fcbdF4C5094b50213E8Bbc65A1A96";
  const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
  const contract = WhisperBidBasic.attach(contractAddress);

  // Sample auction data matching frontend design with complete asset information
  const auctions = [
    {
      title: "Modern Luxury Villa",
      description: "Stunning modern villa with panoramic views in Beverly Hills",
      imageUrl: "/property-1.jpg",
      location: "Beverly Hills, CA",
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 3200,
      reservePrice: "2850000000000000000000000", // $2.85M in Wei (2.85 * 10^24)
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
      reservePrice: "1750000000000000000000000", // $1.75M in Wei (1.75 * 10^24)
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
      reservePrice: "650000000000000000000000", // $0.65M in Wei (0.65 * 10^24)
      duration: 14 * 24 * 60 * 60 // 14 days
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
