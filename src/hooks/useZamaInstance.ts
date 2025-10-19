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
      setInstance(null); // Clear previous instance
      setIsInitialized(false);

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
          try {
            await initializeWithSDK();
          } catch (err) {
            console.error('❌ Failed to initialize after CDN load:', err);
            setError(`FHE initialization failed after CDN load: ${err.message}`);
          } finally {
            setIsLoading(false);
          }
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
      setInstance(null);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithSDK = async () => {
    try {
      console.log('🚀 Initializing FHE SDK...');
      
      // Add timeout for initSDK
      const initPromise = initSDK();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('FHE SDK initialization timeout')), 10000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      console.log('✅ FHE SDK initialized');

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('🔧 Creating FHE instance with config:', config);
      
      // Add timeout for createInstance
      const createPromise = createInstance(config);
      const createTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('FHE instance creation timeout')), 15000)
      );
      
      const zamaInstance = await Promise.race([createPromise, createTimeoutPromise]);
      console.log('✅ FHE instance created:', zamaInstance);
      
      // Only set instance if we successfully created it
      if (zamaInstance) {
        setInstance(zamaInstance);
        setIsInitialized(true);
        setError(null); // Clear any previous errors
        console.log('🎉 FHE initialization complete!');
      } else {
        throw new Error('FHE instance creation returned null');
      }

    } catch (err) {
      console.error('❌ Failed to create FHE instance:', err);
      setError(`FHE initialization failed: ${err.message}`);
      setInstance(null);
      setIsInitialized(false);
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
