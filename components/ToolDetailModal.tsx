import React, { useEffect, useState } from 'react';
import type { Tool, GeneratedToolDetails, SubArticle } from '../types';
import { generateToolDetails } from '../services/geminiService';
import { CodeBlock } from './CodeBlock';
import { ArrowLeftIcon, PencilIcon, PlusIcon } from './IconComponents';
import CheatSheetRenderer from './CheatSheetRenderer';

interface ToolDetailModalProps {
  tool: Tool;
  onClose: () => void;
  cache: Map<string, GeneratedToolDetails>;
  onCacheUpdate: (toolName: string, details: GeneratedToolDetails) => void;
  isAdmin?: boolean;
  onEditArticle?: (mode: 'add' | 'edit', tool: Tool, articleIndex?: number) => void;
}

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ 
    tool, 
    onClose, 
    cache, 
    onCacheUpdate,
    isAdmin = false,
    onEditArticle = (mode, tool, articleIndex) => {}
}) => {
  const [details, setDetails] = useState<GeneratedToolDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<SubArticle | null>(null);

  const hasArticles = tool.articles && tool.articles.length > 0;
  
  // A subtle geometric pattern to overlay on the header
  const headerPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;


  useEffect(() => {
    setActiveArticle(null);
    setDetails(null);
    setError(null);
    setIsLoading(false);

    const fetchDetails = async () => {
      if (hasArticles) return;

      if (cache.has(tool.name)) {
        setDetails(cache.get(tool.name)!);
        return;
      }
      
      setIsLoading(true);
      const result = await generateToolDetails(tool);
      
      if (result.data) {
        setDetails(result.data);
        onCacheUpdate(tool.name, result.data);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
      setIsLoading(false);
    };

    fetchDetails();
  }, [tool, cache, onCacheUpdate, hasArticles]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const renderContent = () => {
    if (hasArticles) {
      if (activeArticle) {
        const articleIndex = tool.articles?.findIndex(a => a.title === activeArticle.title && a.content === activeArticle.content);
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Guides
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => onEditArticle('edit', tool, articleIndex)}
                        className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit this Guide</span>
                    </button>
                )}
            </div>
            <CheatSheetRenderer content={activeArticle.content} />
          </div>
        );
      }
      return (
        <div>
           <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Available Guides</h3>
                {isAdmin && (
                    <button 
                        onClick={() => onEditArticle('add', tool, undefined)}
                        className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add New Guide</span>
                    </button>
                )}
           </div>
          <div className="space-y-3">
            {tool.articles?.map((article, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-700/70 rounded-lg border border-slate-200 dark:border-slate-700 group">
                    <button
                        onClick={() => setActiveArticle(article)}
                        className="w-full text-left"
                    >
                        <span className="font-semibold text-slate-900 dark:text-slate-50">{article.title}</span>
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => onEditArticle('edit', tool, index)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                            aria-label={`Edit ${article.title}`}
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-4"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        </div>
      );
    }

    if (details) {
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Common Command Example</h3>
            <CodeBlock code={details.command} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Penetration Testing Use Case</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>{details.exploit}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full flex-grow flex flex-col">
      <header className="text-white relative" style={{ backgroundColor: tool.color, backgroundImage: headerPattern }}>
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={onClose} className="flex items-center gap-2 text-white/80 hover:text-white font-semibold mb-6 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Toolkit
            </button>
            <div className="relative z-10">
                <h2 id="tool-detail-title" className="text-4xl font-black">
                {tool.name}
                {activeArticle && <span className="text-white/80 font-bold text-3xl"> / {activeArticle.title}</span>}
                </h2>
                <p className="text-white/90 mt-2 text-lg">{tool.description}</p>
                {tool.tags && !activeArticle && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {tool.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-sm font-semibold text-white bg-white/20 rounded-full">
                        {tag}
                    </span>
                    ))}
                </div>
                )}
            </div>
         </div>
      </header>
      
      <main className="bg-slate-50 dark:bg-slate-800/50 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ToolDetailModal;