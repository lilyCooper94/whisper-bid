import { useState, useEffect } from 'react';

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

      console.log('🔧 Initializing Zama FHE SDK...');
      
      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found - please install a wallet');
      }

      // Wait for CDN script to load
      let attempts = 0;
      while (attempts < 10) {
        if ((window as any).ZamaFHE) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!(window as any).ZamaFHE) {
        throw new Error('FHE SDK not loaded from CDN. Please refresh the page.');
      }

      console.log('📡 Initializing SDK...');
      const { createInstance, initSDK, SepoliaConfig } = (window as any).ZamaFHE;
      await initSDK();

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('🏗️ Creating Zama instance...');
      const zamaInstance = await createInstance(config);
      setInstance(zamaInstance);
      setIsInitialized(true);
      console.log('✅ Zama FHE instance initialized successfully');

    } catch (err: any) {
      console.error('❌ Failed to initialize Zama instance:', err);
      const errorMessage = err.message?.includes('threads') 
        ? 'FHE requires CORS headers for Web Workers. Please refresh the page or try again.'
        : `Failed to initialize encryption service: ${err.message}`;
      setError(errorMessage);
      
      // Auto-retry for CORS/threads errors
      if (err.message?.includes('threads') && retryCount < 3) {
        console.log(`🔄 Retrying FHE initialization (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setError(null);
          initializeZama();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
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
