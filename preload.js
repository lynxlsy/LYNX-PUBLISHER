const { contextBridge, ipcRenderer } = require('electron');

// Expor API segura para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // GitHub
  githubLogin: () => ipcRenderer.invoke('github-login'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  
  // Projeto
  selectProject: () => ipcRenderer.invoke('select-project'),
  createRepo: (data) => ipcRenderer.invoke('create-repo', data),
  listRepos: () => ipcRenderer.invoke('list-repos'),
  connectExistingRepo: (data) => ipcRenderer.invoke('connect-existing-repo', data),
  
  // Gitignore
  getGitignore: (projectPath) => ipcRenderer.invoke('get-gitignore', projectPath),
  saveGitignore: (data) => ipcRenderer.invoke('save-gitignore', data),
  addCommonPatterns: (projectPath) => ipcRenderer.invoke('add-common-patterns', projectPath),
  
  // Branches
  listBranches: (projectPath) => ipcRenderer.invoke('list-branches', projectPath),
  getCurrentBranch: (projectPath) => ipcRenderer.invoke('get-current-branch', projectPath),
  createBranch: (data) => ipcRenderer.invoke('create-branch', data),
  switchBranch: (data) => ipcRenderer.invoke('switch-branch', data),
  pushBranch: (data) => ipcRenderer.invoke('push-branch', data),
  
  // Merge
  mergeToMain: (projectPath) => ipcRenderer.invoke('merge-to-main', projectPath)
});
