import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeZama = async () => {
    if (isLoading || isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Starting FHE SDK initialization...');

      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found');
      }

      console.log('✅ Ethereum provider found');

      // Check if TFHE global object exists
      if (typeof (window as any).TFHE === 'undefined') {
        console.log('⚠️ TFHE global object not found, attempting to load from CDN...');
        
        // Try to load from CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@zama-fhe/relayer-sdk@latest/dist/bundle.js';
        script.onload = async () => {
          console.log('📦 FHE SDK loaded from CDN');
          await initializeWithSDK();
        };
        script.onerror = () => {
          console.error('❌ Failed to load FHE SDK from CDN');
          setError('Failed to load FHE encryption service from CDN');
          setIsLoading(false);
        };
        document.head.appendChild(script);
        return;
      }

      await initializeWithSDK();

    } catch (err) {
      console.error('❌ Failed to initialize Zama instance:', err);
      setError(`Failed to initialize encryption service: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithSDK = async () => {
    try {
      console.log('🚀 Initializing FHE SDK...');
      await initSDK();
      console.log('✅ FHE SDK initialized');

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('🔧 Creating FHE instance with config:', config);
      const zamaInstance = await createInstance(config);
      console.log('✅ FHE instance created:', zamaInstance);
      
      setInstance(zamaInstance);
      setIsInitialized(true);
      console.log('🎉 FHE initialization complete!');

    } catch (err) {
      console.error('❌ Failed to create FHE instance:', err);
      throw err;
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
