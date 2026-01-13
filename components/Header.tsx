import React from 'react';
import { supabase } from '../services/supabaseClient';
import { useSession } from '../context/SessionProvider';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSettings?: () => void;
}

/**
 * The application header component.
 * Displays the branding, navigation links, and auth controls.
 */
const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenSettings }) => {
  const { session, setShowAuth } = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {session && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}
          
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              PromptArchitect <span className="text-indigo-600 dark:text-indigo-400">Studio</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-8">
          {session && session.user ? (
            <div className="flex items-center gap-1 sm:gap-4">
              <span className="hidden lg:block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {session.user.email?.split('@')[0]}
              </span>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-2 min-h-[44px]"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:transform active:scale-95 min-h-[44px]"
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
