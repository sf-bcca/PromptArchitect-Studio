import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { RefinedPromptResult } from '../types';
import FavoriteButton from './FavoriteButton';

interface FavoritesSectionProps {
  onSelectFavorite: (result: RefinedPromptResult, originalInput: string) => void;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectFavorite }) => {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-pink-500 mr-2">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Favorites ({favorites.length})
        </h3>
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
           {/* Mobile-friendly horizontal scroll / Desktop grid */}
           <div className="flex overflow-x-auto pb-4 gap-4 snap-x sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 sm:overflow-visible sm:pb-0">
            {favorites.map((fav) => (
                fav.prompt_history && (
                <div
                    key={fav.id}
                    className="flex-none w-72 sm:w-auto snap-start bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative group"
                >
                    <div className="absolute top-2 right-2 z-10">
                        <FavoriteButton
                            isFavorite={true}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFavorite(fav.prompt_history_id);
                            }}
                        />
                    </div>

                    <div
                        className="cursor-pointer"
                        onClick={() => fav.prompt_history && onSelectFavorite(fav.prompt_history.result, fav.prompt_history.originalInput)}
                    >
                        <div className="mb-2">
                             <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                {fav.prompt_history.result.model || 'Unknown Model'}
                             </span>
                             <span className="ml-2 text-xs text-slate-500">
                                {new Date(fav.created_at).toLocaleDateString()}
                             </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-2">
                            {fav.prompt_history.originalInput}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                            {fav.prompt_history.result.refinedPrompt}
                        </p>
                    </div>
                </div>
                )
            ))}
          </div>
      </div>
    </div>
  );
};

export default FavoritesSection;
