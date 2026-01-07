import React from 'react';
import PromptCard from './PromptCard';
import { RefinedPromptResult } from '../types';

interface ResultDisplayProps {
  result: RefinedPromptResult | null;
  error: string | null;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, error, isLoading }) => {
  if (error) {
    return (
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
    );
  }

  if (result) {
    return <PromptCard result={result} historyId={result.id} />;
  }

  if (!isLoading) {
    return (
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
    );
  }

  return null;
};

export default ResultDisplay;
