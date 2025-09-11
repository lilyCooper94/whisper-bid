import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet } from 'wagmi/chains';

// Use environment variable or fallback to a default project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id';

export const config = getDefaultConfig({
  appName: 'Whisper Bid',
  projectId: projectId,
  chains: [sepolia, mainnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
