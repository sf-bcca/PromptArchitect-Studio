import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import PromptCard from "./components/PromptCard";
import { engineerPrompt } from "./services/geminiService";
import { supabase } from "./services/supabaseClient";
import { PromptHistoryItem, RefinedPromptResult } from "./types";

/**
 * The main application component for PromptArchitect-Studio.
 * Handles user input, interacts with the backend engineering service, and manages history state.
 */
const App: React.FC = () => {
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
  // State for storing the list of historical prompts
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Available models configuration
  const models = [
    { id: "llama3.2", name: "Ollama (Llama 3.2 3B)", provider: "ollama" },
    { id: "llama3.1", name: "Ollama (Llama 3.1 8B)", provider: "ollama" },
    { id: "mistral", name: "Ollama (Mistral 7B)", provider: "ollama" },
    { id: "gemma2", name: "Ollama (Gemma 2)", provider: "ollama" },
    { id: "gemma-3-12b-it", name: "Google Gemma 3 12B (Cloud)", provider: "gemini" },
    { id: "gemini-2.0-flash-lite-preview-02-05", name: "Gemini 2.0 Flash-Lite (Cloud)", provider: "gemini" },
    { id: "gemini-1.5-flash", name: "Google Gemini 1.5 Flash (Cloud)", provider: "gemini" },
  ];

  /**
   * Effect hook to load prompt history from Supabase on component mount.
   */
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("prompt_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && !error) {
        const mappedHistory: PromptHistoryItem[] = data.map((item) => ({
          id: item.id,
          originalInput: item.original_input,
          result: item.result,
          timestamp: new Date(item.created_at).getTime(),
        }));
        setHistory(mappedHistory);
      } else if (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
  }, []);

  /**
   * Effect hook to sync the current result to the history list locally.
   * Note: The Edge Function persists the data to the DB; this updates the UI immediately.
   */
  useEffect(() => {
    if (currentResult && (currentResult as any).id) {
      const newItem: PromptHistoryItem = {
        id: (currentResult as any).id,
        originalInput: userInput,
        result: currentResult,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        // Avoid duplicates if we already have this ID in history
        if (prev.find((h) => h.id === newItem.id)) return prev;
        return [newItem, ...prev].slice(0, 10);
      });
    }
  }, [currentResult]);

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
      const result = await engineerPrompt(userInput, selectedModel, provider);
      setCurrentResult(result);
      // No need to manually add to history here, the useEffect on currentResult will handle UI
      // and the Edge Function already saved it to the database.
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the local history state and resets the form.
   * Note: This currently only clears the local view, not the database.
   */
  const handleClearHistory = () => {
    setHistory([]);
    setCurrentResult(null);
    setUserInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl mb-4">
            Engineer Perfect Prompts
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Input your basic idea, and we'll apply professional engineering
            techniques to generate a structured, high-performing framework for
            any LLM.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-12 transition-all hover:shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label
                  htmlFor="prompt-input"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  What are you trying to achieve?
                </label>
                <div className="flex items-center">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isLoading}
                    className="block w-48 pl-3 pr-8 py-1.5 text-xs border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 shadow-sm"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                id="prompt-input"
                rows={4}
                className="block w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 p-4 transition-all resize-none border"
                placeholder="e.g., 'Help me write a prompt for an email to my boss asking for a raise' or 'Create a prompt for a fitness coach AI'..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {currentResult?.provider ? (
                  <>
                    Uses <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {currentResult.provider === "ollama" ? "Ollama" : "Gemini"}
                    </span> ({currentResult.model})
                  </>
                ) : (
                  "Uses Gemini 3 Flash Reasoning Engine"
                )}
              </p>
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className={`flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all shadow-md ${
                  isLoading || !userInput.trim()
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Engineering...
                  </>
                ) : (
                  <>
                    Transform Prompt
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 mb-8 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400 dark:text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Result */}
        {currentResult && <PromptCard result={currentResult} />}

        {/* Empty State / Initial Instructions */}
        {!currentResult && !isLoading && !error && (
          <div className="grid md:grid-cols-3 gap-6 opacity-60">
            {[
              {
                title: "Persona Role",
                desc: "We assign specialized experts to your tasks.",
                icon: "👤",
              },
              {
                title: "Constraint Driven",
                desc: "Strict boundaries ensure focus and quality.",
                icon: "🎯",
              },
              {
                title: "Output Controlled",
                desc: "Structured formats for easy integration.",
                icon: "📋",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Recent Architecture
              </h3>
              <button
                onClick={handleClearHistory}
                className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer group"
                  onClick={() => {
                    setCurrentResult(item.result);
                    setUserInput(item.originalInput);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
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
          </div>
        )}
      </main>

      {/* Persistent Footer CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">
            Developed by Expert Prompt Engineers
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Guide
            </a>
            <a
              href="#"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
