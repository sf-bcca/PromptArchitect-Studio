import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FavoriteItem } from '../types';
import { getFavorites, addFavorite as addFavoriteService, removeFavorite as removeFavoriteService } from '../services/favorites';
import { useSession } from './SessionProvider';

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (promptHistoryId: string) => Promise<void>;
  removeFavorite: (promptHistoryId: string) => Promise<void>;
  isFavorite: (promptHistoryId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSession();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const refreshFavorites = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const data = await getFavorites(session.user.id);
        setFavorites(data);
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      }
    } else {
      setFavorites([]);
    }
  }, [session]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const addFavorite = async (promptHistoryId: string) => {
    console.log('[Favorites] addFavorite called with:', { promptHistoryId, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      console.warn('[Favorites] No session/user ID, aborting addFavorite');
      return;
    }
    
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempFavorite: FavoriteItem = {
        id: tempId,
        user_id: session.user.id,
        prompt_history_id: promptHistoryId,
        created_at: new Date().toISOString(),
      };
      
      setFavorites(prev => [tempFavorite, ...prev]);

      console.log('[Favorites] Calling addFavoriteService...');
      const result = await addFavoriteService(session.user.id, promptHistoryId);
      console.log('[Favorites] addFavoriteService returned:', result);
      
      await refreshFavorites();
      console.log('[Favorites] Refresh complete');
    } catch (error) {
      console.error("[Favorites] Failed to add favorite:", error);
      // Revert optimistic update on failure
      refreshFavorites();
    }
  };

  const removeFavorite = async (promptHistoryId: string) => {
    if (!session?.user?.id) return;
    try {
      // Optimistic update
      setFavorites(prev => prev.filter(f => f.prompt_history_id !== promptHistoryId));
      await removeFavoriteService(session.user.id, promptHistoryId);
      // No need to refresh if we successfully removed it from local state, but strictly to be safe:
      // await refreshFavorites();
    } catch (error) {
      console.error("Failed to remove favorite", error);
      // Revert if failed
      refreshFavorites();
    }
  };

  const isFavorite = (promptHistoryId: string) => {
    return favorites.some(f => f.prompt_history_id === promptHistoryId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
