import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './IconComponents';

interface CodeBlockProps {
  code: string;
  language?: string;
}

interface TokenRule {
  type: string;
  regex: RegExp;
  className: string;
}

const getTokenRules = (language: string): TokenRule[] => {
  const commonRules = {
    comment: { type: 'comment', regex: /(#.*)/g, className: 'text-slate-500 italic' },
    string: { type: 'string', regex: /(".*?"|'.*?')/g, className: 'text-emerald-400' },
  };

  switch (language) {
    case 'python':
      return [
        commonRules.comment,
        commonRules.string,
        { type: 'keyword', regex: /\b(import|from|def|class|if|else|elif|for|while|return|True|False|None|and|or|not|in|is|try|except|finally|with|as|assert|async|await)\b/g, className: 'text-red-400 font-semibold' },
        { type: 'function', regex: /(\w+)\s*(?=\()/g, className: 'text-blue-400' },
        { type: 'decorator', regex: /(@\w+)/g, className: 'text-yellow-400' },
        { type: 'number', regex: /\b(\d+)\b/g, className: 'text-purple-400' },
      ];
    case 'json':
      return [
        { type: 'key', regex: /(".*?")(?=\s*:)/g, className: 'text-cyan-400' },
        commonRules.string,
        { type: 'number', regex: /\b-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, className: 'text-purple-400' },
        { type: 'boolean', regex: /\b(true|false)\b/g, className: 'text-red-400' },
        { type: 'null', regex: /\b(null)\b/g, className: 'text-slate-500' },
      ];
    case 'bash':
    default:
      return [
        commonRules.comment,
        { type: 'placeholder', regex: /(<[^>]+>)/g, className: 'text-yellow-400' },
        commonRules.string,
        { type: 'variable', regex: /(\$\w+|\$\{\w+\})/g, className: 'text-yellow-400' },
        { type: 'flag', regex: /( --?[a-zA-Z0-9\-_]+)/g, className: 'text-cyan-400' },
        { type: 'keyword', regex: /\b(nmap|sudo|locate|grep|ftp|ssh|telnet|smb|cat|ls|cd|root@kali:~#|echo|for|if|then|else|fi|do|done|while)\b/g, className: 'text-red-400 font-bold' },
        { type: 'number', regex: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\b\d+)\b/g, className: 'text-purple-400' },
        { type: 'operator', regex: /([|&>])+/g, className: 'text-red-400' },
      ];
  }
};

const highlightLine = (line: string, rules: TokenRule[]): (string | React.ReactElement)[] => {
  let parts: (string | React.ReactElement)[] = [line];
  
  rules.forEach(rule => {
    let newParts: (string | React.ReactElement)[] = [];
    parts.forEach((part, partIndex) => {
      if (typeof part === 'string') {
        const matches = part.match(rule.regex);
        const splitByToken = part.split(rule.regex);
        
        splitByToken.forEach((text, i) => {
          if (text) newParts.push(text);
          if (matches && matches[i]) {
            newParts.push(<span key={`${partIndex}-${rule.type}-${i}`} className={rule.className}>{matches[i]}</span>);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return parts;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash' }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const rules = getTokenRules(language);
  const highlightedLines = code.split('\n').map(line => highlightLine(line, rules));

  const handleCopy = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }
  };

  return (
    <div className="group bg-slate-900 rounded-lg shadow-lg overflow-hidden border border-slate-700/50">
      <div className="flex justify-between items-center px-4 py-1.5 bg-slate-800/60 border-b border-slate-700/50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white transition-all"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? (
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      <pre className="text-sm overflow-x-auto font-mono text-slate-300">
        <code className="inline-block min-w-full">
          {highlightedLines.map((lineContent, index) => (
            <div key={index} className="flex hover:bg-slate-800/50 transition-colors">
              <span className="text-slate-600 w-10 flex-shrink-0 select-none text-right pr-4 border-r border-slate-700/50">
                {index + 1}
              </span>
              <span className="pl-4 block whitespace-pre">
                {lineContent.length === 0 ? '\u00A0' : lineContent}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};
