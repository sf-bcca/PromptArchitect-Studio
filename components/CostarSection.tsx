import React, { useState } from 'react';

interface CostarSectionProps {
  title: string;
  content: string;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo';
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-700 dark:text-pink-300' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300' },
};

const CostarSection: React.FC<CostarSectionProps> = ({ title, content, color = 'indigo' }) => {
  const [copied, setCopied] = useState(false);
  const colors = colorMap[color] || colorMap.indigo;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
          {title}
        </h4>
        <button
          onClick={handleCopy}
          className={`text-xs p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 transition-colors ${colors.text}`}
          title="Copy section"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
};

export default CostarSection;
