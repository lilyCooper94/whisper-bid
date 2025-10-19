import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying WhisperBidBasic contract...");

  const WhisperBidBasic = await ethers.getContractFactory("WhisperBidBasic");
  const whisperBid = await WhisperBidBasic.deploy();

  await whisperBid.waitForDeployment();

  const contractAddress = await whisperBid.getAddress();
  console.log("WhisperBidBasic deployed to:", contractAddress);

  // Update the contract address in the frontend config
  const contractConfigPath = path.join(__dirname, '../src/config/contracts.ts');
  let contractConfig = fs.readFileSync(contractConfigPath, 'utf8');
  contractConfig = contractConfig.replace(
    'export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";',
    `export const CONTRACT_ADDRESS = "${contractAddress}";`
  );
  fs.writeFileSync(contractConfigPath, contractConfig);
  
  console.log("Contract address updated in frontend config");
  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
