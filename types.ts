
export interface RefinedPromptResult {
  refinedPrompt: string;
  whyThisWorks: string;
  suggestedVariables: string[];
}

export interface PromptHistoryItem {
  id: string;
  originalInput: string;
  result: RefinedPromptResult;
  timestamp: number;
}
