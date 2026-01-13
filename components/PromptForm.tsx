import React from 'react';
import ModelSelector, { Model } from './ModelSelector';
import { RefinedPromptResult } from '../types';
import { Session } from '@supabase/supabase-js';

import { useHaptics } from '../hooks/useHaptics';

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
  parentId?: string | null;
  onCancelFork?: () => void;
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
  setShowAuth,
  parentId,
  onCancelFork
}) => {
  const haptics = useHaptics();

  const handleLocalSubmit = (e: React.FormEvent) => {
    haptics.heavyImpact();
    handleSubmit(e);
  };

  return (
    <div className="relative group z-10 mb-12">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur-sm ${
          parentId ? "from-amber-500 via-orange-500 to-yellow-500" : "from-indigo-500 via-purple-500 to-pink-500"
      }`}></div>
      
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-2xl">
        <form onSubmit={handleLocalSubmit} className="bg-white dark:bg-slate-950 rounded-xl p-4 sm:p-6 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${parentId ? "bg-amber-500" : "bg-indigo-500"}`}></span>
              {parentId ? "Forking Variation" : "Your Input"}
            </span>
            <div className="flex items-center gap-3">
                {parentId && (
                    <button
                        type="button"
                        onClick={() => { haptics.lightImpact(); onCancelFork?.(); }}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline min-h-[44px] px-2"
                    >
                        Cancel Fork
                    </button>
                )}
                <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={(id) => { haptics.lightImpact(); setSelectedModel(id); }}
                    models={models}
                    disabled={isLoading}
                />
            </div>
          </div>

          <textarea
            id="prompt-input"
            aria-label="Your Input"
            rows={4}
            className="block w-full rounded-xl border-none p-3 text-slate-900 dark:text-slate-100 bg-transparent resize-none focus:ring-0 focus:outline-none text-lg placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-relaxed min-h-[120px]"
            placeholder="Describe your task here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleLocalSubmit(e);
              }
            }}
          />

          <div className="mt-6 flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex flex-col">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-tight">
                {currentResult?.provider ? (
                   <>Used: {currentResult.provider} ({currentResult.model})</>
                ) : (
                  "Ready to engineer"
                )}
              </p>
              {!session && (
                <button 
                  type="button"
                  onClick={() => { haptics.lightImpact(); setShowAuth(true); }}
                  className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold text-left mt-1 min-h-[32px]"
                >
                  Login to save history
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/25 min-h-[44px] ${
                isLoading || !userInput.trim()
                  ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Transform</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="absolute -bottom-6 right-0 text-[10px] text-slate-400 dark:text-slate-600 hidden sm:block">
        Pro tip: ⌘ + Enter to submit
      </div>
    </div>
  );
};

export default PromptForm;
