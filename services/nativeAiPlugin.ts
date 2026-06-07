import { registerPlugin } from '@capacitor/core';

export interface NativeAIPlugin {
  /**
   * Checks if the Gemma 4 model file is available on disk, or if it is currently downloading.
   */
  isModelAvailable(): Promise<{
    available: boolean;
    isDownloading: boolean;
    downloadProgress: number;
    error: string | null;
    filePath: string;
  }>;

  /**
   * Triggers the background HTTP download of the Gemma model.
   */
  downloadModel(): Promise<{
    status: string;
    progress?: number;
  }>;

  /**
   * Generates text using on-device Gemma model via MediaPipe LLM Inference.
   */
  generateResponse(options: { prompt: string }): Promise<{ result: string }>;

  /**
   * Register a listener for model download progress updates.
   */
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (progressData: { progress: number; status: string; error?: string }) => void
  ): Promise<any>;
}

// Register the plugin under the name 'NativeAI'
export const NativeAI = registerPlugin<NativeAIPlugin>('NativeAI');
