
import React, { useState } from 'react';
import { RefinedPromptResult } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from './FavoriteButton';
import Launchpad from './Launchpad';
import { useHaptics } from '../hooks/useHaptics';

interface PromptCardProps {
  /** The result object containing the refined prompt and analysis */
  result: RefinedPromptResult;
  /** The ID of the prompt history item, required for favoriting. */
  historyId?: string;
  /** Optional callback for forking the prompt. */
  onFork?: (item: any) => void;
}

/**
 * A component that displays the engineered prompt, the reasoning behind it, and suggested variables.
 * Allows the user to copy the prompt to the clipboard.
 *
 * @param {PromptCardProps} props - The component props.
 */
const PromptCard: React.FC<PromptCardProps> = ({ result, historyId, onFork }) => {
  const [copied, setCopied] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const haptics = useHaptics();

  // Use explicit historyId if provided, otherwise fallback to result.id
  const targetId = historyId || result.id;
  const favorited = targetId ? isFavorite(targetId) : false;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.lightImpact();
    if (!targetId) return;
    if (favorited) {
      removeFavorite(targetId);
    } else {
      addFavorite(targetId);
    }
  };

  const handleForkClick = () => {
    haptics.mediumImpact();
    if (onFork) {
        onFork({
            id: targetId,
            originalInput: (document.getElementById('prompt-input') as HTMLTextAreaElement)?.value || "",
            result: result
        });
    }
  };

  /**
   * Copies the refined prompt text to the system clipboard and shows a success state briefly.
   */
  const copyToClipboard = () => {
    haptics.lightImpact();
    navigator.clipboard.writeText(result.refinedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Refined Prompt Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative">
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col xs:flex-row justify-between items-center gap-4 rounded-t-xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <svg className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Refined Prompt
          </h2>
          <div className="flex items-center justify-end gap-2 w-full xs:w-auto flex-wrap sm:flex-nowrap">
            {targetId && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleForkClick}
                        className="h-[44px] px-4 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all flex items-center justify-center border border-amber-100 dark:border-amber-900/50"
                        title="Create variation"
                    >
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Fork
                    </button>
                    <div className="h-[44px] w-[44px] flex items-center justify-center">
                        <FavoriteButton isFavorite={favorited} onClick={toggleFavorite} />
                    </div>
                </div>
            )}
            
            <Launchpad prompt={result.refinedPrompt} />

            <button
                onClick={copyToClipboard}
                className="h-[44px] px-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 whitespace-nowrap min-w-[110px]"
            >
                {copied ? (
                <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                </>
                ) : (
                <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Prompt
                </>
                )}
            </button>
          </div>
        </div>
        <div className="p-6">
          <pre className="mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            {result.refinedPrompt}
          </pre>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Why it works */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Why This Works
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {result.whyThisWorks}
          </p>
        </div>

        {/* Suggested Variables */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Suggested Variables
          </h3>
          <ul className="space-y-2">
            {result.suggestedVariables.map((v, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                <span className="text-indigo-500 dark:text-indigo-400 mr-2 font-bold">•</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
