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
    const detectLocalAI = async () => {
      try {
        // Ping the local model list endpoint
        const response = await fetch(LOCAL_GEMMA_ENDPOINT, { 
          method: 'GET',
          // Small timeout to avoid hanging if nothing is there
          signal: AbortSignal.timeout(1000) 
        });
        
        if (response.ok) {
          const data = await response.json();
          // Assume if we get a valid response, the local server is up
          setIsLocalAvailable(true);
          
          // Map local models to our Model interface
          // We'll specifically look for gemma models if available, or just add a generic one
          const gemmaModel: Model = {
            id: 'gemma-3-local',
            name: 'Gemma 3 (Local)',
            provider: 'gemma-local'
          };
          
          setLocalModels([gemmaModel]);
        } else {
          setIsLocalAvailable(false);
        }
      } catch (err) {
        // Silently fail if local server is not running
        setIsLocalAvailable(false);
      }
    };

    detectLocalAI();
  }, []);

  return { isLocalAvailable, localModels };
}
