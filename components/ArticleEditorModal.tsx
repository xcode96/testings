import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './IconComponents';
import type { SubArticle } from '../types';
import CheatSheetRenderer from './CheatSheetRenderer';

interface ArticleEditorModalProps {
  onClose: () => void;
  onSave: (articleData: SubArticle) => void;
  article: SubArticle | null;
}

const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({ onClose, onSave, article }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isEditing = article !== null;

  useEffect(() => {
    setTitle(article?.title || '');
    setContent(article?.content || '');
    titleInputRef.current?.focus();
  }, [article]);

  useEffect(() => {
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
    if (title.trim() && content.trim()) {
      onSave({ title, content });
    }
  };

  const canSubmit = title.trim() !== '' && content.trim() !== '';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{isEditing ? 'Edit Article' : 'Add New Article'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close editor"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto flex-grow flex flex-col min-h-0">
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
            <div className="mb-4">
              <label htmlFor="article-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                ref={titleInputRef}
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                required
              />
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                {/* Editor Pane */}
                <div className="flex flex-col">
                    <label htmlFor="article-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Content (Markdown-like syntax supported)
                    </label>
                    <textarea
                    id="article-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-mono text-sm flex-grow"
                    required
                    />
                </div>
                {/* Preview Pane */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Live Preview
                    </label>
                    <div className="w-full flex-grow p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
                        <CheatSheetRenderer content={content} />
                    </div>
                </div>
            </div>
          </form>
        </div>
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4 flex-shrink-0">
            <button
                type="button"
                onClick={onClose}
                className="text-sm font-bold text-slate-800 dark:text-slate-300 hover:underline px-4 py-2"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                Save Article
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ArticleEditorModal;