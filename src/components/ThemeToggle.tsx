import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-primary)] cursor-pointer transition-colors shrink-0"
    >
      <span
        className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
          !isDark
            ? 'bg-[var(--accent)] text-[var(--accent-text)]'
            : 'text-[var(--text-secondary)]'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span
        className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
          isDark
            ? 'bg-[var(--accent)] text-[var(--accent-text)]'
            : 'text-[var(--text-secondary)]'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </span>
    </button>
  );
};
