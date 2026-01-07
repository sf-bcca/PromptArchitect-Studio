import React, { forwardRef } from 'react';
import { PromptHistoryItem, RefinedPromptResult } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from './FavoriteButton';

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
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [filter, setFilter] = React.useState<'all' | 'favorites'>('all');

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => isFavorite(item.id));

  const toggleFavorite = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (isFavorite(itemId)) {
      removeFavorite(itemId);
    } else {
      addFavorite(itemId);
    }
  };

  return (
    <div className="mt-20 scroll-mt-20" ref={ref}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Recent Architecture
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                filter === 'favorites'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              Favorites
            </button>
          </div>

          <button
            onClick={onClearHistory}
            className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Clear
          </button>
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
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
              <div className="flex items-center gap-3">
                <FavoriteButton 
                  isFavorite={isFavorite(item.id)} 
                  onClick={(e) => toggleFavorite(e, item.id)} 
                />
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
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {filter === 'favorites' 
              ? "You haven't added any favorites yet." 
              : "Your prompt history will appear here once you start engineering."}
          </p>
        </div>
      )}
    </div>
  );
});

HistoryList.displayName = 'HistoryList';

export default HistoryList;
