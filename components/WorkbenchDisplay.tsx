import React, { useState } from 'react';
import { RefinedPromptResult } from '../types';
import CostarSection from './CostarSection';
import PromptCard from './PromptCard';

interface WorkbenchDisplayProps {
  result: RefinedPromptResult;
}

const WorkbenchDisplay: React.FC<WorkbenchDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'workbench' | 'preview'>('workbench');

  if (!result.costar) {
    return <PromptCard result={result} historyId={result.id} />;
  }

  const { context, objective, style, tone, audience, response } = result.costar;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'workbench'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Workbench
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Final Prompt
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <PromptCard result={result} historyId={result.id} />
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
