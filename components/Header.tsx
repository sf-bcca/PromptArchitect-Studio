
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            PromptArchitect <span className="text-indigo-600 dark:text-indigo-400">Studio</span>
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Frameworks</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Resources</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Documentation</span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
