import React, { useState } from 'react';
import type { CategoryInfo } from '../types';
import {
  AllCategoriesIcon, NetworkIcon, WebAppIcon, PasswordIcon, WirelessIcon, ExploitIcon, ForensicsIcon,
  ReverseEngIcon, CryptoIcon, OsintIcon, MalwareIcon, SocialEngIcon, CloudIcon, SearchIcon
} from './IconComponents';

interface SidebarProps {
  isOpen: boolean;
  categories: CategoryInfo[];
  activeCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

// Helper function to map category names to icon components
const getCategoryIcon = (categoryName: string): React.ReactElement => {
    switch (categoryName) {
        case 'Network Scanning & Analysis': return <NetworkIcon className="w-6 h-6" />;
        case 'Web Application Security': return <WebAppIcon className="w-6 h-6" />;
        case 'Password Attacks': return <PasswordIcon className="w-6 h-6" />;
        case 'Wireless Hacking': return <WirelessIcon className="w-6 h-6" />;
        case 'Exploitation Frameworks': return <ExploitIcon className="w-6 h-6" />;
        case 'Forensics': return <ForensicsIcon className="w-6 h-6" />;
        case 'Reverse Engineering': return <ReverseEngIcon className="w-6 h-6" />;
        case 'Cryptography Tools': return <CryptoIcon className="w-6 h-6" />;
        case 'OSINT': return <OsintIcon className="w-6 h-6" />;
        case 'Malware Analysis': return <MalwareIcon className="w-6 h-6" />;
        case 'Social Engineering': return <SocialEngIcon className="w-6 h-6" />;
        case 'Cloud Security': return <CloudIcon className="w-6 h-6" />;
        default: return <div className="w-6 h-6" />; // Fallback
    }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, categories, activeCategory, onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // The main container with glassmorphism effect and smooth width transition
    <aside
      className={`flex flex-col flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-[73px]'
      }`}
    >
      {/* A spacer div to push content below the sticky header */}
      <div className="h-16 flex-shrink-0 border-b border-slate-200 dark:border-slate-800" />

      {/* Search Bar */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'p-2' : 'p-0 h-0 opacity-0'}`}>
        {isOpen && (
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                aria-label="Search categories"
                />
            </div>
        )}
      </div>

      {/* Navigation section */}
      <nav className="flex-grow px-2 py-2 overflow-y-auto">
        <ul className="space-y-2">
          {/* "All Categories" button */}
          <li>
             <button
                onClick={() => onSelectCategory('All')}
                className={`w-full flex items-center gap-4 p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeCategory === 'All'
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/60'
                    // Inactive state with hover effects
                    : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
                } ${
                  // Center the icon when collapsed
                  !isOpen && 'justify-center'
                }`}
                // Use title attribute for tooltip on hover when collapsed
                title="All Categories"
              >
                <AllCategoriesIcon className="w-6 h-6" />
                {/* Text span with smooth opacity transition */}
                <span className={`transition-opacity duration-200 text-left ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  All Categories
                </span>
              </button>
          </li>
          {/* Map through the filtered categories */}
          {filteredCategories.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeCategory === cat.name
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/60'
                    : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
                } ${!isOpen && 'justify-center'}`}
                title={cat.name} // Tooltip for collapsed state
              >
                {getCategoryIcon(cat.name)}
                <span className={`transition-opacity duration-200 text-left ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {cat.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};