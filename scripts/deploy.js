import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying WhisperBidBasic contract with FHE...");

  // Step 1: Deploy the contract
  console.log("\n📦 Deploying WhisperBidBasic contract...");
  const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
  const whisperBid = await WhisperBidBasic.deploy();

  await whisperBid.waitForDeployment();
  const contractAddress = await whisperBid.getAddress();
  console.log("✅ WhisperBidBasic deployed to:", contractAddress);

  // Step 2: Update the contract address in the frontend config
  console.log("\n🔧 Updating frontend configuration...");
  const contractConfigPath = path.join(__dirname, '../src/config/contracts.ts');
  let contractConfig = fs.readFileSync(contractConfigPath, 'utf8');
  
  // Replace any existing contract address
  contractConfig = contractConfig.replace(
    /export const CONTRACT_ADDRESS = "0x[a-fA-F0-9]{40}";/,
    `export const CONTRACT_ADDRESS = "${contractAddress}";`
  );
  
  // If no existing address found, add it
  if (!contractConfig.includes(`export const CONTRACT_ADDRESS = "${contractAddress}";`)) {
    contractConfig = contractConfig.replace(
      'export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";',
      `export const CONTRACT_ADDRESS = "${contractAddress}";`
    );
  }
  
  fs.writeFileSync(contractConfigPath, contractConfig);
  console.log("✅ Contract address updated in frontend config");

  // Step 3: Generate ABI for WhisperBidBasic
  console.log("\n🔧 Generating ABI for WhisperBidBasic...");
  const abiPath = path.join(__dirname, '../artifacts/contracts/WhisperBidBasic.sol/WhisperBidBasic.json');
  
  if (fs.existsSync(abiPath)) {
    const abiData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const newAbiPath = path.join(__dirname, '../src/config/contracts-abi.json');
    fs.writeFileSync(newAbiPath, JSON.stringify(abiData.abi, null, 2));
    console.log("✅ ABI updated for WhisperBidBasic");
  } else {
    console.log("⚠️ ABI file not found, you may need to compile the contract first");
  }

  console.log("\n🎉 FHE Contract deployment complete!");
  console.log(`📋 Contract address: ${contractAddress}`);
  console.log("🔒 This contract includes FHE encryption for sensitive data");
  console.log("🌐 Frontend configuration has been updated");
  console.log("📝 Users can now create auctions through the frontend interface");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
