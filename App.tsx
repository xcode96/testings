import React, { useState, useMemo, useEffect } from 'react';
import { categoryInfo } from './data/tools';
import { Header } from './components/Header';
import { ToolCard } from './components/ToolCard';
import ToolDetailModal from './components/ToolDetailModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminBar from './components/AdminBar';
import ArticleEditorModal from './components/ArticleEditorModal';
import LoadingScreen from './components/LoadingScreen';
import { Sidebar } from './components/Sidebar';
import type { Tool, GeneratedToolDetails, ToolFormData, SubArticle } from './types';

interface ArticleEditorState {
  mode: 'add' | 'edit';
  toolName: string;
  articleIndex?: number;
  articleData?: SubArticle;
}

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiCache, setAiCache] = useState<Map<string, GeneratedToolDetails>>(new Map());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [articleEditorState, setArticleEditorState] = useState<ArticleEditorState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    fetch('/data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Tool[]) => {
        setTools(data);
      })
      .catch(error => {
        console.error("Could not fetch tool data:", error);
        setLoadingError("Could not load toolkit data. Please check the network connection or the data source and refresh the page.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const updateAiCache = (toolName: string, details: GeneratedToolDetails) => {
    setAiCache(prevCache => new Map(prevCache).set(toolName, details));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        if (!isAdminLoggedIn) {
          setShowAdminLogin(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminLoggedIn]);

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'password') {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setEditingTool(null);
  };

  const handleAddNewTool = (formData: ToolFormData) => {
    const newTool: Tool = {
        ...formData,
        articles: [],
    };
    setTools(prevTools => [newTool, ...prevTools]);
  };

  const handleUpdateTool = (originalName: string, formData: ToolFormData) => {
    setTools(prevTools => prevTools.map(t => {
        if (t.name === originalName) {
            return {
                ...t,
                ...formData,
            };
        }
        return t;
    }));
  };

  const handleStartEdit = (tool: Tool) => {
      setSelectedTool(null);
      setEditingTool(tool);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingTool(null);
  };

  const handleOpenArticleEditor = (mode: 'add' | 'edit', tool: Tool, articleIndex?: number) => {
    setArticleEditorState({
        mode,
        toolName: tool.name,
        articleIndex,
        articleData: articleIndex !== undefined ? tool.articles?.[articleIndex] : undefined,
    });
  };

  const handleCloseArticleEditor = () => {
      setArticleEditorState(null);
  };

  const handleDeleteArticle = (toolName: string, articleIndex: number) => {
      if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
          setTools(prevTools => prevTools.map(tool => {
              if (tool.name === toolName) {
                  const updatedArticles = [...(tool.articles || [])];
                  updatedArticles.splice(articleIndex, 1);
                  const updatedTool = { ...tool, articles: updatedArticles };
                  if (editingTool?.name === toolName) {
                    setEditingTool(updatedTool);
                  }
                  if (selectedTool?.name === toolName) {
                    setSelectedTool(updatedTool);
                  }
                  return updatedTool;
              }
              return tool;
          }));
      }
  };

  const handleSaveArticle = (savedArticle: SubArticle) => {
      if (!articleEditorState) return;
      
      const { mode, toolName, articleIndex } = articleEditorState;

      setTools(prevTools => prevTools.map(tool => {
          if (tool.name === toolName) {
              const updatedArticles = [...(tool.articles || [])];
              if (mode === 'edit' && articleIndex !== undefined) {
                  updatedArticles[articleIndex] = savedArticle;
              } else {
                  updatedArticles.push(savedArticle);
              }
              const updatedTool = { ...tool, articles: updatedArticles };
              if (editingTool?.name === toolName) {
                setEditingTool(updatedTool);
              }
              if (selectedTool?.name === toolName) {
                setSelectedTool(updatedTool);
              }
              return updatedTool;
          }
          return tool;
      }));
      
      handleCloseArticleEditor();
  };
  
  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (editingTool) setEditingTool(null);
    if(selectedTool) setSelectedTool(null);
  };

  const handleImportData = (importedTools: Tool[]) => {
    if (window.confirm('Are you sure you want to replace all current tool data with the imported file? This action cannot be undone.')) {
      try {
        if (!Array.isArray(importedTools) || !importedTools.every(item => typeof item === 'object' && item !== null && 'name' in item && 'description' in item)) {
          throw new Error("The imported data is not in the correct format.");
        }
        setTools(importedTools);
        alert('Data imported successfully!');
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  const filteredTools = useMemo(() => {
    let currentTools = tools;

    if (activeCategory !== 'All') {
      currentTools = currentTools.filter(tool => tool.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        currentTools = currentTools.filter(tool =>
            tool.name.toLowerCase().includes(lowercasedQuery) ||
            tool.description.toLowerCase().includes(lowercasedQuery)
        );
    }

    return currentTools;
  }, [activeCategory, searchQuery, tools]);
  
  const handleSelectTool = (tool: Tool) => {
    if (editingTool) setEditingTool(null);
    setSelectedTool(tool);
  }

  const handleCloseModal = () => {
    setSelectedTool(null);
  }
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (loadingError) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-lg text-center" role="alert">
                <strong className="font-bold text-lg">Loading Failed</strong>
                <p className="block sm:inline mt-2">{loadingError}</p>
            </div>
        </div>
    )
  }

  return (
    <div className="h-screen bg-transparent font-sans flex transition-colors duration-300">
      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} onLogin={handleLogin} />}
      {articleEditorState && (
        <ArticleEditorModal 
            onClose={handleCloseArticleEditor}
            onSave={handleSaveArticle}
            article={articleEditorState.articleData || null}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen}
        categories={categoryInfo}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {isAdminLoggedIn && (
            <AdminBar 
              onLogout={handleLogout}
              onAddNewTool={handleAddNewTool}
              onUpdateTool={handleUpdateTool}
              editingTool={editingTool}
              onCancelEdit={handleCancelEdit}
              onOpenArticleEditor={handleOpenArticleEditor}
              onDeleteArticle={handleDeleteArticle}
              tools={tools}
              onImportData={handleImportData}
            />
          )}
        <Header 
          searchQuery={searchQuery}
          onSearchChange={(q) => {
              setSearchQuery(q);
              if(selectedTool) setSelectedTool(null);
              if(editingTool) setEditingTool(null);
          }}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminLoginClick={() => setShowAdminLogin(true)}
        />
        
        <main className="flex-grow overflow-y-auto">
          {selectedTool ? (
            <ToolDetailModal 
                tool={selectedTool} 
                onClose={handleCloseModal}
                cache={aiCache}
                onCacheUpdate={updateAiCache}
                isAdmin={isAdminLoggedIn}
                onEditArticle={handleOpenArticleEditor}
            />
          ) : (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredTools.map((tool) => (
                    <ToolCard
                        key={tool.name}
                        tool={tool}
                        onClick={() => handleSelectTool(tool)}
                        isAdmin={isAdminLoggedIn}
                        onEdit={() => handleStartEdit(tool)}
                    />
                    ))}
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;