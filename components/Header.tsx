import React from 'react';
import { supabase } from '../services/supabaseClient';
import { useSession } from '../context/SessionProvider';

interface HeaderProps {
  onScrollToHistory: () => void;
}

/**
 * The application header component.
 * Displays the branding, navigation links, and auth controls.
 */
const Header: React.FC<HeaderProps> = ({ onScrollToHistory }) => {
  const { session, setShowAuth } = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            PromptArchitect <span className="text-indigo-600 dark:text-indigo-400">Studio</span>
          </h1>
        </div>
        
        <nav className="flex items-center space-x-4 md:space-x-8">
          <button 
            onClick={onScrollToHistory}
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            History
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          {session && session.user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-xs font-medium text-slate-400 dark:text-slate-500">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm active:transform active:scale-95"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
