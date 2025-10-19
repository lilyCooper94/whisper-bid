import { useAccount, useWalletClient } from 'wagmi';
import { useMemo } from 'react';
import { WalletClient } from 'viem';

export function useEthersSigner() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signerPromise = useMemo(() => {
    if (!walletClient || !address) return undefined;
    
    return Promise.resolve(walletClient as WalletClient);
  }, [walletClient, address]);

  return signerPromise;
}
