import React from 'react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorite, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isFavorite
          ? 'text-pink-600 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/30 dark:hover:bg-pink-900/50'
          : 'text-slate-400 hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M19 14c1.49-1.28 3.6-2.34 3.6-4.44 0-2.32-2.12-4.16-4.5-4.16-1.68 0-3.26 1.05-3.83 2.55h-0.54c-0.57-1.5-2.15-2.55-3.83-2.55-2.38 0-4.5 1.84-4.5 4.16 0 2.1 2.11 3.16 3.6 4.44 1.76 1.51 3.98 2.66 4.5 5.56 0.52-2.9 2.74-4.05 4.5-5.56z" />
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" style={{ display: isFavorite ? 'none' : 'block' }} />
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" stroke="none" style={{ display: isFavorite ? 'block' : 'none' }} />
      </svg>
    </button>
  );
};

export default FavoriteButton;
