import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Whisper Bid',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [sepolia, mainnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
