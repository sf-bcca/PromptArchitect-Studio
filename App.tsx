import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Auth from "./components/Auth";
import PromptForm from "./components/PromptForm";
import ResultDisplay from "./components/ResultDisplay";
import HistorySidebar from "./components/HistorySidebar";
import FavoritesSection from "./components/FavoritesSection";
import { engineerPrompt, generateTitle } from "./services/geminiService";
import { RefinedPromptResult, PromptHistoryItem, ErrorCode, isAppError, AppError } from "./types";
import { useSession } from "./context/SessionProvider";
import { usePromptHistory } from "./hooks/usePromptHistory";
import { useNotifications } from "./context/NotificationContext";

/**
 * The main application component for PromptArchitect-Studio.
 * Handles user input, interacts with the backend engineering service, and manages history state.
 */
const App: React.FC = () => {
  const { session, showAuth, setShowAuth } = useSession();
  const { history, fetchHistory, addToHistory, clearHistory, hasMore, isLoadingMore, renameHistoryItem, deleteHistoryItem } = usePromptHistory(session);
  const { notify } = useNotifications();

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  // State for tracking the loading status of the API request
  const [isLoading, setIsLoading] = useState(false);
  // State for tracking the most recently refined prompt result
  const [currentResult, setCurrentResult] =
    useState<RefinedPromptResult | null>(null);
  // State for storing error messages
  const [error, setError] = useState<string | null>(null);
  // State for tracking parent ID during forking
  const [parentId, setParentId] = useState<string | null>(null);

  // Available models configuration
  // ... (no changes to models)

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
    const selectedModelObj = models.find((m) => m.id === selectedModel);
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
              models={models}
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
    </div>
  );
};

export default App;
