import React, { useEffect, useRef } from 'react';
import { PromptHistoryItem, RefinedPromptResult } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from './FavoriteButton';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptHistoryItem[];
  onSelectHistoryItem: (result: RefinedPromptResult, originalInput: string) => void;
  onClearHistory: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onLoadMore,
  hasMore,
  isLoadingMore
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [filter, setFilter] = React.useState<'all' | 'favorites'>('all');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Close when clicking outside on mobile (overlay mode)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Only close if screen is narrow (mobile behavior)
        if (window.innerWidth < 1024) {
            onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

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

  const groupHistoryByDate = (items: PromptHistoryItem[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: PromptHistoryItem[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    items.forEach(item => {
      const date = new Date(item.timestamp);
      
      if (date.toDateString() === today.toDateString()) {
        groups['Today'].push(item);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(item);
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groups['Previous 7 Days'].push(item);
      } else {
        groups['Older'].push(item);
      }
    });

    return groups;
  };

  const groupedHistory = groupHistoryByDate(filteredHistory);

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-full lg:border-none lg:bg-transparent lg:w-72 lg:flex ${!isOpen && 'lg:hidden'}`} // On desktop, we control visibility via layout, but if we want it collapsible, we can toggle 'hidden' or width. Let's make it a collapsible sidebar.
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">History</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
           <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                filter === 'favorites'
                  ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm shadow-pink-500/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              Favorites
            </button>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {Object.entries(groupedHistory).map(([label, items]) => (
                items.length > 0 && (
                    <div key={label} className="mt-4">
                        <h3 className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</h3>
                        <div className="space-y-0.5">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 hover:shadow-sm dark:hover:shadow-indigo-500/5 cursor-pointer transition-all relative border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                                    onClick={() => {
                                        onSelectHistoryItem(item.result, item.originalInput);
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                         <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 flex items-center justify-center shrink-0 transition-colors">
                                            <svg
                                                className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20.25c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                                            </svg>
                                         </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 truncate font-medium transition-colors">
                                                {item.originalInput}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons - visible on hover or if favorite */}
                                    <div className={`flex items-center gap-1 ${!isFavorite(item.id) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
                                         <FavoriteButton 
                                            isFavorite={isFavorite(item.id)} 
                                            onClick={(e) => toggleFavorite(e, item.id)}
                                            className="!p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}

            {filteredHistory.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-sm">
                    No history found.
                </div>
            )}
            
            {/* Infinite Scroll Sentinel */}
            {filter === 'all' && (
                <div ref={observerTarget} className="h-4 w-full flex items-center justify-center mt-2">
                    {isLoadingMore && (
                        <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
                    )}
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
             <button
                onClick={onClearHistory}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Clear History
             </button>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
