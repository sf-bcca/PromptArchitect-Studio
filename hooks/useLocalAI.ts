import { useState, useEffect } from 'react';
import { Model } from '../types';

const LOCAL_GEMMA_ENDPOINT = 'http://localhost:8080/v1/models';

/**
 * Hook to detect if a local Gemma 3 (LiteRT-LM) server is running.
 * This allows the app to offer local inference as a high-reliability fallback.
 */
export function useLocalAI() {
  const [isLocalAvailable, setIsLocalAvailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const detectLocalAI = async () => {
      try {
        // Ping the local model list endpoint
        const response = await fetch(LOCAL_GEMMA_ENDPOINT, { 
          method: 'GET',
          // Small timeout to avoid hanging if nothing is there, combined with unmount signal
          signal: AbortSignal.any([AbortSignal.timeout(1000), controller.signal]) 
        });
        
        setIsLocalAvailable(response.ok);
      } catch (err) {
        // Silently fail if local server is not running
        setIsLocalAvailable(false);
      }
    };

    detectLocalAI();
    
    // Poll every 10 seconds to detect if server starts/stops
    const interval = setInterval(detectLocalAI, 10000);
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, []);

  return { isLocalAvailable };
}
