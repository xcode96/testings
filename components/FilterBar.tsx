import React from 'react';
import { 
    WindowsIcon, PhishingIcon, PostExploitationIcon, OsintTagIcon, BruteForceIcon, 
    AutomationIcon, AwsIcon, DebuggerIcon, StaticAnalysisIcon, SocialMediaIcon, 
    CliIcon, GuiIcon, PythonIcon, C2Icon, IncidentResponseIcon 
} from './IconComponents';

interface FilterBarProps {
  tags: string[];
  activeTags: string[];
  onSelectTag: (tagName: string) => void;
}

const getTagIcon = (tagName: string): React.ReactElement | null => {
    const props = { className: "w-5 h-5" };
    switch (tagName.toLowerCase()) {
        case 'windows': return <WindowsIcon {...props} />;
        case 'phishing': return <PhishingIcon {...props} />;
        case 'post-exploitation': return <PostExploitationIcon {...props} />;
        case 'osint': return <OsintTagIcon {...props} />;
        case 'brute-force': return <BruteForceIcon {...props} />;
        case 'automation': return <AutomationIcon {...props} />;
        case 'aws': return <AwsIcon {...props} />;
        case 'debugger': return <DebuggerIcon {...props} />;
        case 'static analysis': return <StaticAnalysisIcon {...props} />;
        case 'social media': return <SocialMediaIcon {...props} />;
        case 'cli': return <CliIcon {...props} />;
        case 'gui': return <GuiIcon {...props} />;
        case 'python': return <PythonIcon {...props} />;
        case 'c2': return <C2Icon {...props} />;
        case 'incident response': return <IncidentResponseIcon {...props} />;
        default: return null;
    }
};


export const FilterBar: React.FC<FilterBarProps> = ({ 
  tags,
  activeTags,
  onSelectTag
}) => {
  return (
    <div className="mt-8">
      {tags.length > 0 && (
        <div className="sticky top-16 z-10 bg-sky-50/90 dark:bg-slate-900/90 backdrop-blur-lg -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-700/60">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 self-center pr-2 uppercase tracking-wider">Filter by Tag:</h3>
                    {tags.map((tag) => {
                        const isActive = activeTags.includes(tag);
                        const icon = getTagIcon(tag);
                        return (
                        <button
                            key={tag}
                            onClick={() => onSelectTag(tag)}
                            className={`flex items-center capitalize px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
                            isActive 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/40' 
                                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/60 dark:hover:bg-slate-700/60'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {icon}
                            <span className="ml-2">{tag}</span>
                        </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};