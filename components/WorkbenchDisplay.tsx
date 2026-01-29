import React, { useState } from 'react';
import { RefinedPromptResult, PromptHistoryItem } from '../types';
import CostarSection from './CostarSection';
import PromptCard from './PromptCard';
import VersionHistory from './VersionHistory';
import Launchpad from './Launchpad';
import { useHaptics } from '../hooks/useHaptics';

interface WorkbenchDisplayProps {
  result: RefinedPromptResult;
  onFork?: (item: any) => void;
  history?: PromptHistoryItem[];
  onSelectVersion?: (result: RefinedPromptResult, originalInput: string) => void;
}

const WorkbenchDisplay: React.FC<WorkbenchDisplayProps> = ({ result, onFork, history = [], onSelectVersion }) => {
  const [activeTab, setActiveTab] = useState<'workbench' | 'preview'>('workbench');
  const [mobileCostarTab, setMobileCostarTab] = useState<string>('context');
  const haptics = useHaptics();

  if (!result.costar) {
    return <PromptCard result={result} historyId={result.id} onFork={onFork} />;
  }

  const { context, objective, style, tone, audience, response } = result.costar;

  const costarItems = [
    { id: 'context', title: 'Context', content: context, color: 'blue' as const },
    { id: 'objective', title: 'Objective', content: objective, color: 'purple' as const },
    { id: 'style', title: 'Style', content: style, color: 'pink' as const },
    { id: 'tone', title: 'Tone', content: tone, color: 'yellow' as const },
    { id: 'audience', title: 'Audience', content: audience, color: 'green' as const },
    { id: 'response', title: 'Response', content: response, color: 'indigo' as const },
  ];

  const handleTabChange = (tab: 'workbench' | 'preview') => {
    haptics.lightImpact();
    setActiveTab(tab);
  };

  const handleForkClick = () => {
    haptics.mediumImpact();
    if (onFork) {
        const histItem = history.find(h => h.id === result.id);
        onFork({
            id: result.id,
            originalInput: histItem?.originalInput || (document.getElementById('prompt-input') as HTMLTextAreaElement)?.value || "",
            result: result
        });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Version History Navigation */}
      {result.id && onSelectVersion && (
          <VersionHistory 
            currentItem={{ ...result, id: result.id, originalInput: "" }} 
            history={history} 
            onSelectVersion={(r, i) => {
                haptics.lightImpact();
                onSelectVersion(r, i);
            }} 
          />
      )}

      {/* Header / Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative z-20">
        <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Architecture Workbench</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">Granular CO-STAR Breakdown</p>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap sm:flex-nowrap">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-1 sm:flex-none flex">
                <button
                    onClick={() => handleTabChange('workbench')}
                    className={`flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-md text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
                    activeTab === 'workbench'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                >
                    Workbench
                </button>
                <button
                    onClick={() => handleTabChange('preview')}
                    className={`flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-md text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
                    activeTab === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                >
                    Preview
                </button>
            </div>

            <Launchpad prompt={result.refinedPrompt} />

            <button
                onClick={handleForkClick}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95 min-h-[44px] min-w-[44px]"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="hidden xs:inline">Fork</span>
            </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <PromptCard result={result} historyId={result.id} onFork={onFork} />
      ) : (
        <>
            {/* Mobile CO-STAR Tabbed View */}
            <div className="block md:hidden">
                <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4 px-1">
                    {costarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                haptics.lightImpact();
                                setMobileCostarTab(item.id);
                            }}
                            className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                mobileCostarTab === item.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                            }`}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
                <div className="animate-in fade-in duration-300">
                    {costarItems.find(i => i.id === mobileCostarTab) && (
                        <CostarSection 
                            title={costarItems.find(i => i.id === mobileCostarTab)!.title} 
                            content={costarItems.find(i => i.id === mobileCostarTab)!.content} 
                            color={costarItems.find(i => i.id === mobileCostarTab)!.color} 
                        />
                    )}
                </div>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-2 gap-4">
                {costarItems.map(item => (
                    <CostarSection key={item.id} title={item.title} content={item.content} color={item.color} />
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default WorkbenchDisplay;