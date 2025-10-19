import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initZama = async () => {
      if (isLoading || isInitialized) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check if ethereum provider is available
        if (!(window as any).ethereum) {
          throw new Error('Ethereum provider not found');
        }

        await initSDK();

        const config = {
          ...SepoliaConfig,
          network: (window as any).ethereum
        };

        const zamaInstance = await createInstance(config);

        if (mounted) {
          setInstance(zamaInstance);
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize Zama instance:', err);
        if (mounted) {
          setError('Failed to initialize encryption service. Please ensure you have a wallet connected.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initZama();

    return () => {
      mounted = false;
    };
  }, []);

  return { instance, isLoading, error, isInitialized };
}
