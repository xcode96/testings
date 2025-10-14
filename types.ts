export interface SubArticle {
  title: string;
  content: string;
}

export interface Tool {
  name: string;
  description: string;
  category: string;
  color: string;
  tags?: string[];
  articles?: SubArticle[];
}

export interface GeneratedToolDetails {
  command: string;
  exploit: string;
}

export interface CategoryInfo {
  name:string;
  color: string;
}

export type ToolFormData = Omit<Tool, 'articles'>;

export interface GitHubSettings {
  owner: string;
  repo: string;
  pat: string;
  path: string;
}