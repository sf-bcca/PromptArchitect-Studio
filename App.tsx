import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Auth from "./components/Auth";
import PromptForm from "./components/PromptForm";
import ResultDisplay from "./components/ResultDisplay";
import HistorySidebar from "./components/HistorySidebar";
import FavoritesSection from "./components/FavoritesSection";
import SettingsPanel from "./components/SettingsPanel";
import { engineerPrompt, generateTitle } from "./services/geminiService";
import { RefinedPromptResult, PromptHistoryItem, ErrorCode, isAppError, AppError, MODELS } from "./types";
import { useSession } from "./context/SessionProvider";
import { usePromptHistory } from "./hooks/usePromptHistory";
import { useNotifications } from "./context/NotificationContext";
import { useUserSettings } from "./context/UserSettingsContext";
import { useHaptics } from "./hooks/useHaptics";
import { useLocalAI } from "./hooks/useLocalAI";

/**
 * The main application component for PromptArchitect-Studio.
 * Handles user input, interacts with the backend engineering service, and manages history state.
 */
const App: React.FC = () => {
  const { session, showAuth, setShowAuth } = useSession();
  const { history, fetchHistory, addToHistory, clearHistory, hasMore, isLoadingMore, renameHistoryItem, deleteHistoryItem } = usePromptHistory(session);
  const { notify } = useNotifications();
  const { settings } = useUserSettings();
  const haptics = useHaptics();
  const { isLocalAvailable } = useLocalAI();
  
  // Use globally defined MODELS, which now includes Gemma 3 (Local)
  const availableModels = MODELS;

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Close sidebar by default on mobile on initial load
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // State for storing the raw user input text
  const [userInput, setUserInput] = useState("");
  // State for selected LLM model
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-flash-lite-preview");

  // Sync selected model with settings once loaded, ensuring legacy models are migrated
  useEffect(() => {
    if (settings?.default_model) {
      const isValid = availableModels.some(m => m.id === settings.default_model);
      if (isValid) {
        setSelectedModel(settings.default_model);
      } else if (isLocalAvailable === false) {
        // Fallback to default if legacy value found or if detection finished and still not valid
        setSelectedModel("gemini-3.1-flash-lite-preview");
      }
    }
  }, [settings, availableModels, isLocalAvailable]);
  // State for tracking the loading status of the API request
  const [isLoading, setIsLoading] = useState(false);
  // State for tracking the most recently refined prompt result
  const [currentResult, setCurrentResult] =
    useState<RefinedPromptResult | null>(null);
  // State for storing error messages
  const [error, setError] = useState<string | null>(null);
  // State for tracking parent ID during forking
  const [parentId, setParentId] = useState<string | null>(null);
  // State for search query in history
  const [searchQuery, setSearchQuery] = useState("");
  // Debounced search query for API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Handle debouncing search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Effect hook to load prompt history from Supabase when session or search changes.
   */
  useEffect(() => {
    fetchHistory(0, debouncedSearchQuery);
  }, [session, fetchHistory, debouncedSearchQuery]);

  /**
   * Effect hook to sync the current result to the history list locally.
   */
  useEffect(() => {
    if (currentResult && currentResult.id) {
      const newItem: PromptHistoryItem = {
        id: currentResult.id,
        originalInput: userInput,
        result: currentResult,
        timestamp: Date.now(),
        parentId: parentId || undefined
      };
      addToHistory(newItem);
    }
  }, [currentResult, userInput, addToHistory]);

  /**
   * Handles the form submission to engineer the prompt.
   *
   * @param {React.FormEvent | null} e - The form submission event, or null if triggered programmatically.
   * @param {string} [overrideModel] - Optional model ID to use instead of the selected one.
   */
  const handleSubmit = async (e: React.FormEvent | null, overrideModel?: string) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);

    const targetModel = overrideModel || selectedModel;

    // Find the full model object to get the provider
    const selectedModelObj = availableModels.find((m) => m.id === targetModel);
    const provider = selectedModelObj ? selectedModelObj.provider : "gemini";

    try {
      // The Edge Function handles persistence if the user is authenticated.
      // We pass the session access token implicitly or explicitly via the invoke call.
      const result = await engineerPrompt(userInput, targetModel, provider, parentId);
      setCurrentResult(result);

      // Reset parentId after successful creation
      setParentId(null);

      // Auto-generate title in background if persisted
      if (result.id) {
        generateTitle(userInput, targetModel).then((title) => {
          if (title && renameHistoryItem) {
            renameHistoryItem(result.id!, title); // Non-null assertion safe due to if check
          }
        });
      }
    } catch (err) {
      const appErr = isAppError(err) ? err : new AppError(ErrorCode.UNKNOWN_ERROR, (err as Error).message);
      
      setError(appErr.message);
      
      // Use toast for critical system errors
      if (appErr.code === ErrorCode.LLM_SERVICE_UNAVAILABLE || appErr.code === ErrorCode.NETWORK_ERROR) {
          notify(appErr.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Specifically handles switching to local Gemma when a cloud service fails.
   */
  const handleRetryWithLocal = () => {
    haptics.heavyImpact();
    setError(null);
    setSelectedModel("gemma-3-local");
    handleSubmit(null, "gemma-3-local");
  };

  /**
   * Clears the local history state and resets the form.
   */
  const handleClearHistory = async () => {
    await clearHistory();
    setCurrentResult(null);
    setUserInput("");
    setParentId(null);
  };

  const handleNewPrompt = () => {
    haptics.lightImpact();
    setUserInput("");
    setCurrentResult(null);
    setParentId(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectHistoryItem = (result: RefinedPromptResult, originalInput: string) => {
    setCurrentResult(result);
    setUserInput(originalInput);
    setParentId(null); // Deselecting forking if any
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFork = (item: PromptHistoryItem) => {
    setUserInput(item.originalInput);
    setParentId(item.id);
    setCurrentResult(null); // Clear result to focus on editing
    window.scrollTo({ top: 0, behavior: "smooth" });
    notify("Forking prompt - apply changes and click transform", "info");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 overflow-hidden">
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setShowSettings(true)}
        onNewPrompt={handleNewPrompt}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {session && (
          <HistorySidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onLoadMore={() => fetchHistory(history.length, debouncedSearchQuery)}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onRename={renameHistoryItem}
            onDelete={deleteHistoryItem}
            searchQuery={searchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
              if (!query) setDebouncedSearchQuery("");
            }}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-12">
            <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 sm:text-5xl mb-4 sm:mb-6 pb-2 px-2 leading-tight">
                Engineer Perfect Prompts
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
                Input your basic idea, and we'll apply professional engineering
                techniques to generate a structured, high-performing framework for
                any LLM.
              </p>
            </div>

            <PromptForm
              userInput={userInput}
              setUserInput={setUserInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              models={availableModels}
              isLocalAvailable={isLocalAvailable}
              currentResult={currentResult}
              session={session}
              setShowAuth={setShowAuth}
              parentId={parentId}
              onCancelFork={() => setParentId(null)}
              onClear={() => setUserInput("")}
            />

            <ResultDisplay 
              result={currentResult} 
              error={error} 
              isLoading={isLoading}
              onFork={handleFork}
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              isLocalAvailable={isLocalAvailable}
              onRetryWithLocal={handleRetryWithLocal}
            />
            {/* ... */}

            {session && (
              <FavoritesSection onSelectFavorite={handleSelectHistoryItem} />
            )}
            
            {/* Footer embedded in scrollable area */}
            <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 pb-4">
              <div className="flex justify-center items-center text-xs text-slate-500">
                <p>Developed by Shedrick Flowers</p>
              </div>
            </div>
          </div>
        </main>

        {/* Auth Modal Overlay */}
        {showAuth && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowAuth(false)}
                className="absolute -top-12 right-0 text-white hover:text-indigo-400 transition-colors"
                aria-label="Close"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Auth />
            </div>
          </div>
        )}

        {/* Settings Modal Overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
