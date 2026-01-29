import React, { useState, useRef, useEffect } from 'react';
import { EXTERNAL_PROVIDERS, copyPrompt, LLMProvider } from '../services/launchService';
import { useNotifications } from '../context/NotificationContext';
import { useHaptics } from '../hooks/useHaptics';

interface LaunchpadProps {
  prompt: string;
}

const Launchpad: React.FC<LaunchpadProps> = ({ prompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notify } = useNotifications();
  const haptics = useHaptics();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLaunchClick = async (provider: LLMProvider, e: React.MouseEvent) => {
    // We don't preventDefault here because we want the <a> tag to open the link
    haptics.mediumImpact();
    const success = await copyPrompt(prompt, notify);
    if (success) {
      notify(`Prompt copied! Opening ${provider.name}...`, 'success');
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    haptics.lightImpact();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`flex h-[44px] px-4 rounded-full text-xs font-bold transition-all items-center justify-center border active:scale-95 ${
          isOpen 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/20 shadow-lg' 
          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
        }`}
        title="Launch in external LLM"
      >
        <svg className={`w-3.5 h-3.5 mr-1.5 transition-colors ${isOpen ? 'text-white' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Launch
      </button>

      {isOpen && (
        <>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-800 rotate-45 mt-[5px] z-[71]" />
          
          <div className="absolute right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200 origin-top">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Execute Prompt</p>
            </div>
            <div className="p-1.5">
              {EXTERNAL_PROVIDERS.map((provider) => (
                <a
                  key={provider.id}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleLaunchClick(provider, e)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left decoration-none no-underline"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                     {provider.id === 'gemini' && (
                       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
                       </svg>
                     )}
                     {provider.id === 'chatgpt' && (
                       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z" />
                       </svg>
                     )}
                     {provider.id === 'claude' && (
                       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
                       </svg>
                     )}
                     {provider.id === 'aistudio' && (
                       <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M5,21Q3.725,21 3.1875,19.8625Q2.65,18.725 3.45,17.75L9,11L9,5L8,5Q7.575,5 7.2875,4.7125Q7,4.425 7,4Q7,3.575 7.2875,3.2875Q7.575,3 8,3L16,3Q16.425,3 16.7125,3.2875Q17,3.575 17,4Q17,4.425 16.7125,4.7125Q16.425,5 16,5L15,5L15,11L20.55,17.75Q21.35,18.725 20.8125,19.8625Q20.275,21 19,21L5,21ZM7,18L17,18L13.6,14L10.4,14L7,18Z" />
                       </svg>
                     )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{provider.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Launch & paste prompt</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 text-center">
              <p className="text-[9px] text-slate-400 italic">Universal links support native apps</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Launchpad;
