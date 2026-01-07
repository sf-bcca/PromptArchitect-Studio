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
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[
          {
            title: "Persona Role",
            desc: "Expert personas assigned instantly.",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
          {
            title: "Constraint Driven",
            desc: "Strict boundaries for focused output.",
            color: "text-rose-500",
            bg: "bg-rose-50 dark:bg-rose-900/20",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ),
          },
          {
            title: "Output Controlled",
            desc: "Ready-to-use structured formats.",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="group relative bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
              <div className={feature.color}>{feature.icon}</div>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              {feature.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
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
