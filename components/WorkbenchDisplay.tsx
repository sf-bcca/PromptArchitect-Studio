import React, { useState } from 'react';
import { RefinedPromptResult } from '../types';
import CostarSection from './CostarSection';
import PromptCard from './PromptCard';

interface WorkbenchDisplayProps {
  result: RefinedPromptResult;
  onFork?: (item: any) => void;
}

const WorkbenchDisplay: React.FC<WorkbenchDisplayProps> = ({ result, onFork }) => {
  const [activeTab, setActiveTab] = useState<'workbench' | 'preview'>('workbench');

  if (!result.costar) {
    return <PromptCard result={result} historyId={result.id} onFork={onFork} />;
  }

  const { context, objective, style, tone, audience, response } = result.costar;

  const handleForkClick = () => {
    if (onFork) {
        // Construct a partial history item for forking
        onFork({
            id: result.id,
            originalInput: (document.getElementById('prompt-input') as HTMLTextAreaElement)?.value || "", // Fallback
            result: result
        });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => setActiveTab('workbench')}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'workbench'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                >
                    Workbench
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                >
                    Final Prompt
                </button>
            </div>

            <button
                onClick={handleForkClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Fork
            </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <PromptCard result={result} historyId={result.id} onFork={onFork} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CostarSection title="Context" content={context} color="blue" />
          <CostarSection title="Objective" content={objective} color="purple" />
          <CostarSection title="Style" content={style} color="pink" />
          <CostarSection title="Tone" content={tone} color="yellow" />
          <CostarSection title="Audience" content={audience} color="green" />
          <CostarSection title="Response" content={response} color="indigo" />
        </div>
      )}
    </div>
  );
};

export default WorkbenchDisplay;
