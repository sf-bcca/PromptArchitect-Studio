import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FavoriteItem } from '../types';
import { getFavorites, addFavorite as addFavoriteService, removeFavorite as removeFavoriteService } from '../services/favorites';
import { useSession } from './SessionProvider';
import { useNotifications } from './NotificationContext';

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (promptHistoryId: string) => Promise<void>;
  removeFavorite: (promptHistoryId: string) => Promise<void>;
  isFavorite: (promptHistoryId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Provider component that manages the user's favorite prompts.
 * Handles optimistic updates, persistence to Supabase, and notification triggers.
 */
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, setShowAuth } = useSession();
  const { notify } = useNotifications();
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
    if (!session?.user?.id) {
      notify("Please login to favorite prompts", "info");
      setShowAuth(true);
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

      await addFavoriteService(session.user.id, promptHistoryId);
      notify("Added to favorites", "success");
      
      await refreshFavorites();
    } catch (error) {
      console.error("[Favorites] Failed to add favorite:", error);
      notify("Failed to add favorite", "error");
      refreshFavorites();
    }
  };

  const removeFavorite = async (promptHistoryId: string) => {
    if (!session?.user?.id) return;
    try {
      setFavorites(prev => prev.filter(f => f.prompt_history_id !== promptHistoryId));
      await removeFavoriteService(session.user.id, promptHistoryId);
      notify("Removed from favorites", "info");
    } catch (error) {
      console.error("Failed to remove favorite", error);
      notify("Failed to remove favorite", "error");
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

/**
 * Custom hook to access the FavoritesContext.
 * @throws {Error} If used outside of a FavoritesProvider.
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
