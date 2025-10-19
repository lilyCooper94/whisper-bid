import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Use environment variable or fallback to a default project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'e08e99d213c331aa0fd00f625de06e66';

export const config = getDefaultConfig({
  appName: 'Whisper Bid',
  projectId: projectId,
  chains: [sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
