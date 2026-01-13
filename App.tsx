import React, { useState, useEffect } from "react";
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

/**
 * The main application component for PromptArchitect-Studio.
 * Handles user input, interacts with the backend engineering service, and manages history state.
 */
const App: React.FC = () => {
  const { session, showAuth, setShowAuth } = useSession();
  const { history, fetchHistory, addToHistory, clearHistory, hasMore, isLoadingMore, renameHistoryItem, deleteHistoryItem } = usePromptHistory(session);
  const { notify } = useNotifications();
  const { settings } = useUserSettings();

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
  const [selectedModel, setSelectedModel] = useState("llama3.2");

  // Sync selected model with settings once loaded
  useEffect(() => {
    if (settings?.default_model) {
      setSelectedModel(settings.default_model);
    }
  }, [settings]);
  // State for tracking the loading status of the API request
  const [isLoading, setIsLoading] = useState(false);
  // State for tracking the most recently refined prompt result
  const [currentResult, setCurrentResult] =
    useState<RefinedPromptResult | null>(null);
  // State for storing error messages
  const [error, setError] = useState<string | null>(null);
  // State for tracking parent ID during forking
  const [parentId, setParentId] = useState<string | null>(null);

  /**
   * Effect hook to load prompt history from Supabase when session changes.
   */
  useEffect(() => {
    fetchHistory();
  }, [session, fetchHistory]);

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
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);

    // Find the full model object to get the provider
    const selectedModelObj = MODELS.find((m) => m.id === selectedModel);
    const provider = selectedModelObj ? selectedModelObj.provider : "ollama";

    try {
      // The Edge Function handles persistence if the user is authenticated.
      // We pass the session access token implicitly or explicitly via the invoke call.
      const result = await engineerPrompt(userInput, selectedModel, provider, parentId);
      setCurrentResult(result);

      // Reset parentId after successful creation
      setParentId(null);

      // Auto-generate title in background if persisted
      // ...
    } catch (err) {
      // ...
    } finally {
      setIsLoading(false);
    }
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
            onLoadMore={() => fetchHistory(history.length)}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onRename={renameHistoryItem}
            onDelete={deleteHistoryItem}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-12">
            {/* ... */}

            <PromptForm
              userInput={userInput}
              setUserInput={setUserInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              models={MODELS}
              currentResult={currentResult}
              session={session}
              setShowAuth={setShowAuth}
              parentId={parentId}
              onCancelFork={() => setParentId(null)}
            />

            <ResultDisplay 
              result={currentResult} 
              error={error} 
              isLoading={isLoading}
              onFork={handleFork}
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
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
      </div>
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
  );
};

export default App;
