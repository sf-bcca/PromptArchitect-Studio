
/**
 * Utility service to handle launching engineered prompts to external LLM providers.
 */

export interface LLMProvider {
  id: string;
  name: string;
  url: string;
  mobileUrl?: string;
  color: string;
}

export const EXTERNAL_PROVIDERS: LLMProvider[] = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    url: 'https://gemini.google.com',
    mobileUrl: 'googlegemini://',
    color: 'from-blue-500 to-purple-600'
  },
  { 
    id: 'chatgpt', 
    name: 'OpenAI ChatGPT', 
    url: 'https://chatgpt.com',
    mobileUrl: 'chatgpt://',
    color: 'from-emerald-500 to-teal-700'
  },
  { 
    id: 'claude', 
    name: 'Anthropic Claude', 
    url: 'https://claude.ai',
    color: 'from-orange-500 to-amber-700'
  },
  {
    id: 'aistudio',
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/app/prompts/new',
    color: 'from-indigo-500 to-blue-700'
  }
];

/**
 * Copies prompt to clipboard.
 * 
 * @param prompt The prompt text to copy
 * @param notify Callback to show notification
 * @returns Promise that resolves when copy is complete
 */
export const copyPrompt = async (
  prompt: string,
  notify: (message: string, type?: 'success' | 'error' | 'info') => void
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(prompt);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    notify('Failed to copy prompt to clipboard.', 'error');
    return false;
  }
};

/**
 * Legacy wrapper or helper if needed. 
 * Note: Direct window.open after await is often blocked on desktop.
 */
export const launchToProvider = async (
  prompt: string, 
  provider: LLMProvider,
  notify: (message: string, type?: 'success' | 'info') => void
) => {
  const success = await copyPrompt(prompt, notify as any);
  if (success) {
    notify(`Prompt copied! Opening ${provider.name}...`, 'success');
    setTimeout(() => {
      window.open(provider.url, '_blank', 'noopener,noreferrer');
    }, 100);
  }
};
