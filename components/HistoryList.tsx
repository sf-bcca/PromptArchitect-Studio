import React, { forwardRef } from 'react';
import { PromptHistoryItem, RefinedPromptResult } from '../types';

interface HistoryListProps {
  history: PromptHistoryItem[];
  onSelectHistoryItem: (result: RefinedPromptResult, originalInput: string) => void;
  onClearHistory: () => void;
}

const HistoryList = forwardRef<HTMLDivElement, HistoryListProps>(({ 
  history, 
  onSelectHistoryItem, 
  onClearHistory 
}, ref) => {
  return (
    <div className="mt-20 scroll-mt-20" ref={ref}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Recent Architecture
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Clear History
        </button>
      </div>
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer group"
              onClick={() => onSelectHistoryItem(item.result, item.originalInput)}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <svg
                    className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs md:max-w-md">
                    {item.originalInput}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Your prompt history will appear here once you start engineering.
          </p>
        </div>
      )}
    </div>
  );
});

HistoryList.displayName = 'HistoryList';

export default HistoryList;
