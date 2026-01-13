import React from 'react';
import { PromptHistoryItem, RefinedPromptResult } from '../types';

interface VersionHistoryProps {
  currentItem: PromptHistoryItem | (RefinedPromptResult & { id: string, originalInput: string });
  history: PromptHistoryItem[];
  onSelectVersion: (result: RefinedPromptResult, originalInput: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ currentItem, history, onSelectVersion }) => {
  // Find Parent
  const parentId = (currentItem as PromptHistoryItem).parentId;
  const parent = parentId ? history.find(h => h.id === parentId) : null;

  // Find Children
  const children = history.filter(h => h.parentId === currentItem.id);

  // Find Siblings
  const siblings = parentId 
    ? history.filter(h => h.parentId === parentId && h.id !== currentItem.id)
    : [];

  if (!parent && children.length === 0 && siblings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lineage & Variations
      </h3>

      <div className="space-y-4">
        {parent && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Derived From</p>
            <button
              onClick={() => onSelectVersion(parent.result, parent.originalInput)}
              className="w-full text-left p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                {parent.result.customTitle || parent.originalInput.substring(0, 40) + "..."}
              </span>
            </button>
          </div>
        )}

        {children.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Derived Variations ({children.length})</p>
            <div className="grid grid-cols-1 gap-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => onSelectVersion(child.result, child.originalInput)}
                  className="w-full text-left p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                    {child.result.customTitle || child.originalInput.substring(0, 40) + "..."}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {siblings.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Other Variations ({siblings.length})</p>
            <div className="flex flex-wrap gap-2">
              {siblings.map(sibling => (
                <button
                  key={sibling.id}
                  onClick={() => onSelectVersion(sibling.result, sibling.originalInput)}
                  className="px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[10px] text-slate-600 dark:text-slate-400"
                >
                  {sibling.result.customTitle || "Variation " + sibling.id.substring(0, 4)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;
