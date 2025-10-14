import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './IconComponents';
import type { GitHubSettings } from '../types';

interface GitHubSettingsModalProps {
  onClose: () => void;
  onSave: (settings: GitHubSettings) => void;
}

const GITHUB_SETTINGS_KEY = 'github_settings';

const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({ onClose, onSave }) => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [pat, setPat] = useState('');
  const [path, setPath] = useState('data.json');
  const ownerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem(GITHUB_SETTINGS_KEY);
    if (savedSettings) {
      try {
        const { owner, repo, pat, path } = JSON.parse(savedSettings);
        setOwner(owner || '');
        setRepo(repo || '');
        setPat(pat || '');
        setPath(path || 'data.json');
      } catch (e) {
        console.error("Failed to parse GitHub settings from localStorage", e);
      }
    }
    ownerInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = { owner, repo, pat, path };
    localStorage.setItem(GITHUB_SETTINGS_KEY, JSON.stringify(settings));
    onSave(settings);
    onClose();
  };
  
  const canSubmit = owner.trim() && repo.trim() && pat.trim() && path.trim();

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
       >
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">GitHub Publish Settings</h2>
          <button 
            onClick={onClose} 
            aria-label="Close settings"
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
           >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repository Owner</label>
            <input
              ref={ownerInputRef}
              id="owner" type="text" value={owner} onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g., your-github-username"
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <div>
            <label htmlFor="repo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repository Name</label>
            <input
              id="repo" type="text" value={repo} onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g., cyber-toolkit-data"
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <div>
            <label htmlFor="path" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">File Path in Repo</label>
            <input
              id="path" type="text" value={path} onChange={(e) => setPath(e.target.value)}
              placeholder="e.g., data.json"
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <div>
            <label htmlFor="pat" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personal Access Token (PAT)</label>
            <input
              id="pat" type="password" value={pat} onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" required
            />
            <p className="text-xs text-slate-500 mt-1">
              Requires a Classic token with 'repo' scope. Stored in browser local storage.
            </p>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default GitHubSettingsModal;