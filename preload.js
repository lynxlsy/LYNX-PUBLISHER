const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  githubLogin: () => ipcRenderer.invoke('github-login'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  requestDeleteScope: () => ipcRenderer.invoke('request-delete-scope'),
  
  selectProject: () => ipcRenderer.invoke('select-project'),
  createRepo: (data) => ipcRenderer.invoke('create-repo', data),
  listRepos: () => ipcRenderer.invoke('list-repos'),
  connectExistingRepo: (data) => ipcRenderer.invoke('connect-existing-repo', data),
  deleteRepo: (repoName) => ipcRenderer.invoke('delete-repo', repoName),
  
  getGitignore: (projectPath) => ipcRenderer.invoke('get-gitignore', projectPath),
  saveGitignore: (data) => ipcRenderer.invoke('save-gitignore', data),
  addCommonPatterns: (projectPath) => ipcRenderer.invoke('add-common-patterns', projectPath),
  
  listBranches: (projectPath) => ipcRenderer.invoke('list-branches', projectPath),
  getCurrentBranch: (projectPath) => ipcRenderer.invoke('get-current-branch', projectPath),
  createBranch: (data) => ipcRenderer.invoke('create-branch', data),
  switchBranch: (data) => ipcRenderer.invoke('switch-branch', data),
  pushBranch: (data) => ipcRenderer.invoke('push-branch', data),
  
  getLastCommit: (projectPath) => ipcRenderer.invoke('get-last-commit', projectPath),
  getSyncStatus: (projectPath) => ipcRenderer.invoke('get-sync-status', projectPath),
  
  mergeToMain: (projectPath) => ipcRenderer.invoke('merge-to-main', projectPath),
  disconnectRepo: (projectPath) => ipcRenderer.invoke('disconnect-repo', projectPath),
  
  gitInit: (projectPath) => ipcRenderer.invoke('git-init', projectPath),
  gitStatus: (projectPath) => ipcRenderer.invoke('git-status', projectPath),
  gitAdd: (data) => ipcRenderer.invoke('git-add', data),
  gitCommit: (data) => ipcRenderer.invoke('git-commit', data),
  gitPush: (data) => ipcRenderer.invoke('git-push', data),
  gitPull: (projectPath) => ipcRenderer.invoke('git-pull', projectPath),
  gitLog: (data) => ipcRenderer.invoke('git-log', data),
  gitReset: (projectPath) => ipcRenderer.invoke('git-reset', projectPath),
  gitStash: (projectPath) => ipcRenderer.invoke('git-stash', projectPath),
  gitStashPop: (projectPath) => ipcRenderer.invoke('git-stash-pop', projectPath),
  configureGitUser: (data) => ipcRenderer.invoke('configure-git-user', data),
  
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
