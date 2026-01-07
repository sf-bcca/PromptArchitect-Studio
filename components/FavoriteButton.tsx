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
        fill={isFavorite ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
