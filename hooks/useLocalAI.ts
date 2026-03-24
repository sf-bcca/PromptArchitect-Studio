import { useState, useEffect } from 'react';
import { Model } from '../types';

const LOCAL_GEMMA_ENDPOINT = 'http://localhost:8080/v1/models';

/**
 * Hook to detect if a local Gemma 3 (LiteRT-LM) server is running.
 * This allows the app to offer local inference as a high-reliability fallback.
 */
export function useLocalAI() {
  const [isLocalAvailable, setIsLocalAvailable] = useState(false);
  const [localModels, setLocalModels] = useState<Model[]>([]);

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
        
        if (response.ok) {
          setIsLocalAvailable(true);
          
          // Map local models to our Model interface
          const gemmaModel: Model = {
            id: 'gemma-3-local',
            name: 'Gemma 3 (Local)',
            provider: 'gemma-local'
          };
          
          setLocalModels([gemmaModel]);
        } else {
          setIsLocalAvailable(false);
          setLocalModels([]);
        }
      } catch (err) {
        // Silently fail if local server is not running
        setIsLocalAvailable(false);
        setLocalModels([]);
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

  return { isLocalAvailable, localModels };
}
