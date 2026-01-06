import React from 'react';
import ModelSelector, { Model } from './ModelSelector';
import { RefinedPromptResult } from '../types';
import { Session } from '@supabase/supabase-js';

interface PromptFormProps {
  userInput: string;
  setUserInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  models: Model[];
  currentResult: RefinedPromptResult | null;
  session: Session | null;
  setShowAuth: (show: boolean) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({
  userInput,
  setUserInput,
  handleSubmit,
  isLoading,
  selectedModel,
  setSelectedModel,
  models,
  currentResult,
  session,
  setShowAuth
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-12 transition-all hover:shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-end mb-2">
            <label
              htmlFor="prompt-input"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              What are you trying to achieve?
            </label>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              models={models}
              disabled={isLoading}
            />
          </div>
          <textarea
            id="prompt-input"
            rows={4}
            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 p-4 transition-all resize-none border"
            placeholder="e.g., 'Help me write a prompt for an email to my boss asking for a raise' or 'Create a prompt for a fitness coach AI'..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {currentResult?.provider ? (
                <>
                  Uses <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {currentResult.provider === "ollama" ? "Ollama" : "Gemini"}
                  </span> ({currentResult.model})
                </>
              ) : (
                "Uses Gemini 3 Flash Reasoning Engine"
              )}
            </p>
            {!session && (
              <button 
                type="button"
                onClick={() => setShowAuth(true)}
                className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium text-left mt-0.5"
              >
                Login to save history
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className={`flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all shadow-md ${
              isLoading || !userInput.trim()
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Engineering...
              </>
            ) : (
              <>
                Transform Prompt
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptForm;
