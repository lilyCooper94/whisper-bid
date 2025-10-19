import { useAccount, useWalletClient } from 'wagmi';
import { useMemo } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

export function useEthersSigner() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signerPromise = useMemo(() => {
    if (!walletClient || !address) return undefined;
    
    // Convert walletClient to ethers signer
    const provider = new BrowserProvider(walletClient.transport);
    return provider.getSigner();
  }, [walletClient, address]);

  return signerPromise;
}
