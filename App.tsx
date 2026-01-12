import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Auth from "./components/Auth";
import PromptForm from "./components/PromptForm";
import ResultDisplay from "./components/ResultDisplay";
import HistorySidebar from "./components/HistorySidebar";
import FavoritesSection from "./components/FavoritesSection";
import { engineerPrompt } from "./services/geminiService";
import { RefinedPromptResult, PromptHistoryItem } from "./types";
import { useSession } from "./context/SessionProvider";
import { usePromptHistory } from "./hooks/usePromptHistory";

/**
 * The main application component for PromptArchitect-Studio.
 * Handles user input, interacts with the backend engineering service, and manages history state.
 */
const App: React.FC = () => {
  const { session, showAuth, setShowAuth } = useSession();
  const { history, fetchHistory, addToHistory, clearHistory, hasMore, isLoadingMore } = usePromptHistory(session);

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
  // State for storing the most recently refined prompt result
  const [currentResult, setCurrentResult] =
    useState<RefinedPromptResult | null>(null);
  // State for storing error messages
  const [error, setError] = useState<string | null>(null);

  // Available models configuration
  const models = [
    { id: "llama3.2", name: "Ollama (Llama 3.2 3B)", provider: "ollama" },
    { id: "gemma2:2b", name: "Ollama (Gemma 2 2B)", provider: "ollama" },
    { id: "gemma3:4b", name: "Ollama (Gemma 3 4B)", provider: "ollama" },
    { id: "gemini-2.5-flash-lite", name: "Gemini Flash-Lite 2.5 (Cloud)", provider: "gemini" },
    { id: "gemini-3.0-flash", name: "Google Gemini 3.0 Flash (Latest)", provider: "gemini" },
    { id: "gemini-3-pro-preview", name: "Google Gemini 3.0 Pro (Preview)", provider: "gemini" },
  ];

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
      const result = await engineerPrompt(userInput, selectedModel, provider);
      setCurrentResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
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
  };

  const handleSelectHistoryItem = (result: RefinedPromptResult, originalInput: string) => {
    setCurrentResult(result);
    setUserInput(originalInput);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-12">
            <div className="text-center mb-12 mt-8">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 sm:text-5xl mb-6 pb-2">
                Engineer Perfect Prompts
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Input your basic idea, and we'll apply professional engineering
                techniques to generate a structured, high-performing framework for
                any LLM.
              </p>
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
            />

            <ResultDisplay 
              result={currentResult} 
              error={error} 
              isLoading={isLoading} 
            />

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
