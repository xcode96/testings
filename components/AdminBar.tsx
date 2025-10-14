import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon, UploadIcon, DownloadIcon, SettingsIcon, GitHubIcon } from './IconComponents';
import { categoryInfo } from '../data/tools';
import type { Tool, ToolFormData, GitHubSettings } from '../types';
import GitHubSettingsModal from './GitHubSettingsModal';
import { publishToGitHub } from '../services/githubService';

interface AdminBarProps {
  onLogout: () => void;
  onAddNewTool: (formData: ToolFormData) => void;
  onUpdateTool: (originalName: string, formData: ToolFormData) => void;
  editingTool: Tool | null;
  onCancelEdit: () => void;
  onOpenArticleEditor: (mode: 'add' | 'edit', tool: Tool, articleIndex?: number) => void;
  onDeleteArticle: (toolName: string, articleIndex: number) => void;
  tools: Tool[];
  onImportData: (tools: Tool[]) => void;
}

const GITHUB_SETTINGS_KEY = 'github_settings';

const AdminBar: React.FC<AdminBarProps> = ({ 
    onLogout, 
    onAddNewTool, 
    onUpdateTool, 
    editingTool, 
    onCancelEdit,
    onOpenArticleEditor,
    onDeleteArticle,
    tools,
    onImportData
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [toolCategory, setToolCategory] = useState(categoryInfo[0]?.name || '');
  const [toolColor, setToolColor] = useState('#64748b');
  const [toolTags, setToolTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isFormOpen = isAdding || editingTool !== null;
  const isEditMode = editingTool !== null;

  const resetForm = () => {
    setToolName('');
    setToolDescription('');
    setToolCategory(categoryInfo[0]?.name || '');
    setToolColor('#64748b');
    setToolTags('');
  };
  
  useEffect(() => {
    if (editingTool) {
      setToolName(editingTool.name);
      setToolDescription(editingTool.description);
      setToolCategory(editingTool.category);
      setToolColor(editingTool.color);
      setToolTags((editingTool.tags || []).join(', '));
      setIsAdding(false);
    } else {
      if (!isAdding) {
          resetForm();
      }
    }
  }, [editingTool, isAdding]);


  const handleToggleAddForm = () => {
    if (editingTool) {
        onCancelEdit();
    }
    const newIsAdding = !isAdding;
    setIsAdding(newIsAdding);
    if (!newIsAdding) {
        resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = toolTags.split(',').map(tag => tag.trim()).filter(Boolean);
    const formData: ToolFormData = {
        name: toolName,
        description: toolDescription,
        category: toolCategory,
        color: toolColor,
        tags: tagsArray,
    };

    if (isEditMode) {
        onUpdateTool(editingTool.name, formData);
    } else {
        onAddNewTool(formData);
        setIsAdding(false);
        resetForm();
    }
  };
  
  const handleExportData = () => {
    try {
      const jsonString = JSON.stringify(tools, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cyber-toolkit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("An error occurred while exporting the data.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read.");
        }
        const importedTools = JSON.parse(text);

        if (Array.isArray(importedTools) && importedTools.every(t => t.name && t.description && t.category && t.color)) {
          onImportData(importedTools);
        } else {
          throw new Error("Invalid file format. The file does not appear to be a valid tool backup.");
        }
      } catch (error) {
        alert(`Error importing data: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
    };
    reader.readAsText(file);
    if (event.target) {
        event.target.value = '';
    }
  };

  const handlePublish = async () => {
    const savedSettings = localStorage.getItem(GITHUB_SETTINGS_KEY);
    if (!savedSettings) {
      setShowGitHubSettings(true);
      return;
    }

    const settings: GitHubSettings = JSON.parse(savedSettings);
    if (!settings.owner || !settings.repo || !settings.pat || !settings.path) {
        alert("GitHub settings are incomplete. Please configure them first.");
        setShowGitHubSettings(true);
        return;
    }

    setIsPublishing(true);
    const commitMessage = `feat: Update tool data via toolkit UI on ${new Date().toISOString()}`;
    
    const result = await publishToGitHub(settings, tools, commitMessage);

    if (result.success) {
      alert("Successfully published data to GitHub!");
    } else {
      alert(`Failed to publish to GitHub: ${result.error}`);
    }
    setIsPublishing(false);
  };


  const canSubmit = toolName.trim() !== '' && toolDescription.trim() !== '';

  return (
    <>
      {showGitHubSettings && (
        <GitHubSettingsModal
          onClose={() => setShowGitHubSettings(false)}
          onSave={() => alert("Settings saved! You can now publish.")}
        />
      )}
      <div className="bg-yellow-400 dark:bg-slate-800 dark:border-b dark:border-yellow-500 text-yellow-900 dark:text-yellow-400 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          <span className="font-bold text-sm uppercase tracking-wider">{isEditMode ? `Editing: ${editingTool.name}`: 'Admin Mode'}</span>
          <div className="flex items-center gap-2">
              <button 
                  onClick={handleImportClick}
                  className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg transition-colors bg-slate-800 text-white hover:bg-slate-700 dark:bg-yellow-500 dark:text-slate-900 dark:hover:bg-yellow-400"
                  title="Import Data"
              >
                  <UploadIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Import</span>
              </button>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
              />
              <button 
                  onClick={handleExportData}
                  className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg transition-colors bg-slate-800 text-white hover:bg-slate-700 dark:bg-yellow-500 dark:text-slate-900 dark:hover:bg-yellow-400"
                  title="Export Data"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Export</span>
              </button>

              <div className="w-px h-6 bg-yellow-500/50 dark:bg-yellow-500/20 mx-1" />
              
              <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg transition-colors bg-slate-800 text-white hover:bg-slate-700 dark:bg-yellow-500 dark:text-slate-900 dark:hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-wait"
                  title="Publish Data to GitHub"
              >
                  <GitHubIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{isPublishing ? 'Publishing...' : 'Publish'}</span>
              </button>
              <button 
                  onClick={() => setShowGitHubSettings(true)}
                  className="flex items-center gap-1 text-sm font-bold px-2 py-2 rounded-lg transition-colors bg-slate-800/50 text-white hover:bg-slate-700 dark:bg-yellow-500/50 dark:text-slate-900 dark:hover:bg-yellow-400"
                  title="GitHub Settings"
              >
                  <SettingsIcon className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-yellow-500/50 dark:bg-yellow-500/20 mx-1" />
              
              <button 
                  onClick={handleToggleAddForm}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-300 ${isFormOpen && !isEditMode ? 'bg-yellow-600/80 hover:bg-yellow-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-yellow-500 dark:text-slate-900 dark:hover:bg-yellow-400'}`}
                  disabled={isEditMode}
              >
                  {isAdding ? <XMarkIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                  <span className="hidden sm:inline">{isAdding ? 'Cancel' : 'Add Tool'}</span>
              </button>
              <button 
                  onClick={onLogout}
                  className="text-sm font-bold text-slate-800 dark:text-slate-300 hover:underline px-2"
              >
                  Logout
              </button>
          </div>
        </div>

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? 'max-h-[60rem]' : 'max-h-0'}`}>
          <div className="bg-yellow-300/70 dark:bg-slate-800/50 p-4 border-t border-yellow-500/50">
              <form onSubmit={handleSubmit} className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                  <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-400">{isEditMode ? 'Edit Tool Details' : 'Add a New Tool'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tool-name" className="block text-sm font-bold text-yellow-900 dark:text-yellow-400 mb-1">Tool Name</label>
                    <input 
                      id="tool-name"
                      type="text"
                      value={toolName}
                      onChange={(e) => setToolName(e.target.value)}
                      placeholder="e.g., Nmap"
                      className="w-full px-3 py-2 rounded-md border border-yellow-500/80 dark:border-slate-600 bg-yellow-100/50 dark:bg-slate-700 text-slate-800 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                          <label htmlFor="tool-category" className="block text-sm font-bold text-yellow-900 dark:text-yellow-400 mb-1">Category</label>
                          <select
                              id="tool-category"
                              value={toolCategory}
                              onChange={(e) => setToolCategory(e.target.value)}
                              className="w-full h-10 px-3 py-2 rounded-md border border-yellow-500/80 dark:border-slate-600 bg-yellow-100/50 dark:bg-slate-700 text-slate-800 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                          >
                              {categoryInfo.map(cat => (
                                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label htmlFor="tool-color" className="block text-sm font-bold text-yellow-900 dark:text-yellow-400 mb-1">Color</label>
                          <input
                              id="tool-color"
                              type="color"
                              value={toolColor}
                              onChange={(e) => setToolColor(e.target.value)}
                              className="w-full h-10 p-1 rounded-md border border-yellow-500/80 dark:border-slate-600 bg-yellow-100/50 dark:bg-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                          />
                      </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="tool-description" className="block text-sm font-bold text-yellow-900 dark:text-yellow-400 mb-1">Description</label>
                  <textarea
                    id="tool-description"
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    placeholder="A short description of what the tool does."
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-yellow-500/80 dark:border-slate-600 bg-yellow-100/50 dark:bg-slate-700 text-slate-800 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tool-tags" className="block text-sm font-bold text-yellow-900 dark:text-yellow-400 mb-1">Tags (comma-separated)</label>
                  <input
                    id="tool-tags"
                    type="text"
                    value={toolTags}
                    onChange={(e) => setToolTags(e.target.value)}
                    placeholder="e.g., port scanning, service detection"
                    className="w-full px-3 py-2 rounded-md border border-yellow-500/80 dark:border-slate-600 bg-yellow-100/50 dark:bg-slate-700 text-slate-800 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>

                <div className="flex justify-end items-center gap-4">
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="text-sm font-bold text-slate-800 dark:text-slate-300 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                      type="submit"
                      disabled={!canSubmit}
                      className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                      {isEditMode ? 'Update Tool' : 'Save Tool'}
                  </button>
                </div>
              </form>

              {isEditMode && editingTool && (
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-4 border-t border-yellow-500/50">
                      <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-bold text-yellow-900 dark:text-yellow-400">Tool Guides / Articles</h4>
                          <button 
                              onClick={() => onOpenArticleEditor('add', editingTool)}
                              className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-slate-900 transition-colors"
                          >
                              <PlusIcon className="w-4 h-4" />
                              <span>Add New Article</span>
                          </button>
                      </div>
                      
                      <div className="bg-yellow-100/50 dark:bg-slate-900/50 rounded-lg p-3 space-y-2">
                          {(!editingTool.articles || editingTool.articles.length === 0) ? (
                              <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">No articles have been added for this tool yet.</p>
                          ) : (
                              editingTool.articles.map((article, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{article.title}</span>
                                      <div className="flex items-center gap-2">
                                          <button 
                                              onClick={() => onOpenArticleEditor('edit', editingTool, index)}
                                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                              aria-label={`Edit ${article.title}`}
                                          >
                                              <PencilIcon className="w-4 h-4" />
                                          </button>
                                          <button 
                                              onClick={() => onDeleteArticle(editingTool.name, index)}
                                              className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                              aria-label={`Delete ${article.title}`}
                                          >
                                              <TrashIcon className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBar;