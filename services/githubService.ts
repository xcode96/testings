import type { GitHubSettings, Tool } from '../types';

export const publishToGitHub = async (
    settings: GitHubSettings,
    tools: Tool[],
    commitMessage: string
): Promise<{ success: boolean; error: string | null }> => {
    const { owner, repo, pat, path } = settings;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1. Prepare content
    const content = JSON.stringify(tools, null, 2);
    // Correctly handle UTF-8 characters before Base64 encoding
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // 2. Get current file SHA to perform an update
    let currentSha: string | undefined;
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${pat}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        if (response.ok) {
            const fileData = await response.json();
            currentSha = fileData.sha;
        } else if (response.status !== 404) {
            throw new Error(`Failed to fetch file details: ${response.statusText}`);
        }
        // If status is 404, currentSha remains undefined, which is correct for creating a new file.
    } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) {
             return { success: false, error: `Could not check for existing file on GitHub. ${error.message}` };
        }
    }

    // 3. Create or update the file via PUT request
    try {
        const body = JSON.stringify({
            message: commitMessage,
            content: encodedContent,
            sha: currentSha, // GitHub API correctly handles this being undefined for new files
        });

        const putResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${pat}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body,
        });

        if (!putResponse.ok) {
            const errorData = await putResponse.json();
            throw new Error(`GitHub API Error: ${errorData.message || putResponse.statusText}`);
        }
        
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during publish." };
    }
};