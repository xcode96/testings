import React from 'react';
import { SearchIcon, SunIcon, MoonIcon, MenuIcon, LoginIcon } from './IconComponents';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    onToggleSidebar: () => void;
    isAdminLoggedIn: boolean;
    onAdminLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    searchQuery, 
    onSearchChange, 
    theme, 
    onThemeToggle, 
    onToggleSidebar,
    isAdminLoggedIn,
    onAdminLoginClick
}) => {
  return (
    <header className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:p-8 flex items-center justify-between h-16 gap-4">
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Toggle navigation"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex-grow flex justify-end items-center gap-4">
                <div className="relative flex-grow max-w-xl">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search tools by name or description..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        aria-label="Search tools"
                    />
                </div>
                <button
                    onClick={onThemeToggle}
                    className="flex-shrink-0 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
                {!isAdminLoggedIn && (
                    <button
                        onClick={onAdminLoginClick}
                        className="flex-shrink-0 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        aria-label="Admin Login"
                        title="Admin Login (Ctrl+Alt+A)"
                    >
                        <LoginIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    </header>
  );
};