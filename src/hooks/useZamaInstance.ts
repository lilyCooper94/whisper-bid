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

      // Wait for CDN script to load and debug global objects
      console.log('🔍 Checking for FHE SDK global objects...');
      console.log('🔍 window.TFHE:', !!(window as any).TFHE);
      console.log('🔍 window.ZamaFHE:', !!(window as any).ZamaFHE);
      console.log('🔍 window.Zama:', !!(window as any).Zama);
      console.log('🔍 window.FHE:', !!(window as any).FHE);
      console.log('🔍 window.RelayerSDK:', !!(window as any).RelayerSDK);
      console.log('🔍 Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('zama') || key.toLowerCase().includes('fhe')));
      
      let attempts = 0;
      while (attempts < 10) {
        // Check multiple possible global object names, including TFHE
        if ((window as any).TFHE || (window as any).ZamaFHE || (window as any).Zama || (window as any).FHE || (window as any).RelayerSDK) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Try to find the correct global object - TFHE is the correct one!
      const fheSDK = (window as any).TFHE || (window as any).ZamaFHE || (window as any).Zama || (window as any).FHE || (window as any).RelayerSDK;
      if (!fheSDK) {
        console.error('❌ No FHE SDK global object found. Available objects:', Object.keys(window).filter(key => key.toLowerCase().includes('zama') || key.toLowerCase().includes('fhe')));
        throw new Error('FHE SDK not loaded from CDN. Please refresh the page.');
      }

      console.log('✅ Found FHE SDK global object:', fheSDK);
      console.log('🔍 TFHE object structure:', Object.keys(fheSDK));
      console.log('🔍 TFHE.default:', fheSDK.default);
      console.log('🔍 TFHE.default structure:', fheSDK.default ? Object.keys(fheSDK.default) : 'No default');

      console.log('📡 Initializing SDK...');
      
      // TFHE object has a default export that contains the actual functions
      const tfheDefault = fheSDK.default || fheSDK;
      console.log('🔍 Using TFHE default:', Object.keys(tfheDefault));
      
      // Try to find the correct functions
      const createInstance = tfheDefault.createInstance || tfheDefault.createInstance;
      const initSDK = tfheDefault.initSDK || tfheDefault.initSDK;
      const SepoliaConfig = tfheDefault.SepoliaConfig || tfheDefault.SepoliaConfig;
      
      console.log('🔍 Found functions:', {
        createInstance: !!createInstance,
        initSDK: !!initSDK,
        SepoliaConfig: !!SepoliaConfig
      });
      
      if (!initSDK) {
        throw new Error('initSDK function not found in TFHE object');
      }
      
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
