import React from 'react';
import type { Tool } from '../types';
import { PencilIcon } from './IconComponents';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick, isAdmin = false, onEdit = () => {} }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent ToolCard's onClick from firing
    onEdit();
  };

  return (
    <div className="relative group h-full">
      <button
        onClick={onClick}
        className="flex flex-col w-full h-full text-left rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-200/80 dark:border-slate-700/80"
        aria-label={`View details for ${tool.name}`}
      >
        {/* Colorful Header */}
        <div className="p-4" style={{ backgroundColor: tool.color }}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">{tool.category}</p>
            <h3 className="mt-1 text-base font-bold text-white tracking-tight leading-snug">{tool.name}</h3>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col flex-grow bg-white dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300 flex-grow line-clamp-3">{tool.description}</p>
            
            {tool.tags && tool.tags.length > 0 && (
                <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
                {tool.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-full">
                    {tag}
                    </span>
                ))}
                </div>
            )}
        </div>
      </button>
      
      {isAdmin && (
         <button 
            onClick={handleEditClick}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow"
            aria-label={`Edit ${tool.name}`}
         >
            <PencilIcon className="w-4 h-4" />
         </button>
      )}
    </div>
  );
};