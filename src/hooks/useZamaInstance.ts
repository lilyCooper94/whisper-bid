import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const initializeZama = async () => {
    if (isLoading || isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔧 Initializing Zama FHE SDK (v2.0 - Static Import)...');

      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found');
      }

      console.log('📡 Calling initSDK...');
      await initSDK();

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('🏗️ Creating Zama instance...');
      const zamaInstance = await createInstance(config);
      setInstance(zamaInstance);
      setIsInitialized(true);
      console.log('✅ Zama FHE instance initialized successfully (v2.0)');

    } catch (err) {
      console.error('❌ Failed to initialize Zama instance:', err);
      setError('Failed to initialize encryption service. Please ensure you have a wallet connected.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeZama();
  }, []);

  return {
    instance,
    isLoading,
    error,
    isInitialized,
    initializeZama
  };
}
