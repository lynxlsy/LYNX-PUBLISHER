const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const gitManager = require('./modules/gitManager');
const branchManager = require('./modules/branchManager');
const ignoreManager = require('./modules/ignoreManager');
const gitOperations = require('./modules/gitOperations');
const AdmZip = require('adm-zip');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#1a1a1a',
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ========== HANDLERS ==========

// Login GitHub
ipcMain.handle('github-login', async () => {
  return await gitManager.githubLogin();
});

// Verificar status de login
ipcMain.handle('check-login-status', async () => {
  return await gitManager.checkLoginStatus();
});

// Selecionar projeto (ZIP ou pasta)
ipcMain.handle('select-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'openDirectory'],
    filters: [
      { name: 'Todos', extensions: ['*'] },
      { name: 'ZIP', extensions: ['zip'] }
    ]
  });

  if (result.canceled) {
    return { success: false, message: 'Seleção cancelada' };
  }

  const selectedPath = result.filePaths[0];
  const stats = fs.statSync(selectedPath);

  // Se for ZIP, extrair
  if (stats.isFile() && selectedPath.endsWith('.zip')) {
    try {
      const tempDir = path.join(os.tmpdir(), 'lynx-publisher-' + Date.now());
      fs.mkdirSync(tempDir, { recursive: true });
      
      const zip = new AdmZip(selectedPath);
      zip.extractAllTo(tempDir, true);
      
      return await analyzeProject(tempDir);
    } catch (error) {
      return { success: false, message: 'Erro ao extrair ZIP: ' + error.message };
    }
  }

  // Se for pasta
  if (stats.isDirectory()) {
    return await analyzeProject(selectedPath);
  }

  return { success: false, message: 'Selecione uma pasta ou arquivo ZIP' };
});

// Analisar projeto
async function analyzeProject(projectPath) {
  const hasGit = fs.existsSync(path.join(projectPath, '.git'));
  const hasRemote = hasGit ? await gitManager.hasRemote(projectPath) : false;
  const hasBranchMain = hasGit ? await gitManager.hasBranchMain(projectPath) : false;
  
  let remoteInfo = null;
  if (hasRemote) {
    remoteInfo = await gitManager.getRemoteInfo(projectPath);
  }

  return {
    success: true,
    path: projectPath,
    hasGit,
    hasRemote,
    hasBranchMain,
    remoteInfo
  };
}

// Criar novo repositório
ipcMain.handle('create-repo', async (event, { projectPath, repoName, isPrivate }) => {
  return await gitManager.createNewRepo(projectPath, repoName, isPrivate);
});

// Listar repositórios existentes
ipcMain.handle('list-repos', async () => {
  return await gitManager.listRepos();
});

// Conectar a repositório existente
ipcMain.handle('connect-existing-repo', async (event, { projectPath, repoUrl }) => {
  return await gitManager.connectExistingRepo(projectPath, repoUrl);
});

// ========== GITIGNORE ==========

ipcMain.handle('get-gitignore', async (event, projectPath) => {
  return await ignoreManager.getGitignore(projectPath);
});

ipcMain.handle('save-gitignore', async (event, { projectPath, content }) => {
  return await ignoreManager.saveGitignore(projectPath, content);
});

ipcMain.handle('add-common-patterns', async (event, projectPath) => {
  return await ignoreManager.addCommonPatterns(projectPath);
});

// ========== BRANCHES ==========

ipcMain.handle('list-branches', async (event, projectPath) => {
  return await branchManager.listBranches(projectPath);
});

ipcMain.handle('get-current-branch', async (event, projectPath) => {
  return await branchManager.getCurrentBranch(projectPath);
});

ipcMain.handle('create-branch', async (event, { projectPath, branchName }) => {
  return await branchManager.createBranch(projectPath, branchName);
});

ipcMain.handle('switch-branch', async (event, { projectPath, branchName }) => {
  return await branchManager.switchBranch(projectPath, branchName);
});

ipcMain.handle('push-branch', async (event, { projectPath, branchName }) => {
  return await branchManager.pushBranch(projectPath, branchName);
});

// ========== MERGE ==========

ipcMain.handle('merge-to-main', async (event, projectPath) => {
  return await branchManager.mergeToMain(projectPath);
});

// ========== REPOSITORY MANAGEMENT ==========

ipcMain.handle('disconnect-repo', async (event, projectPath) => {
  return await gitManager.disconnectRepo(projectPath);
});

// ========== GIT OPERATIONS ==========

ipcMain.handle('git-init', async (event, projectPath) => {
  return await gitOperations.gitInit(projectPath);
});

ipcMain.handle('git-status', async (event, projectPath) => {
  return await gitOperations.gitStatus(projectPath);
});

ipcMain.handle('git-add', async (event, { projectPath, files }) => {
  return await gitOperations.gitAdd(projectPath, files);
});

ipcMain.handle('git-commit', async (event, { projectPath, message }) => {
  return await gitOperations.gitCommit(projectPath, message);
});

ipcMain.handle('git-push', async (event, { projectPath, force }) => {
  return await gitOperations.gitPush(projectPath, force);
});

ipcMain.handle('git-pull', async (event, projectPath) => {
  return await gitOperations.gitPull(projectPath);
});

ipcMain.handle('git-log', async (event, { projectPath, limit }) => {
  return await gitOperations.gitLog(projectPath, limit);
});

ipcMain.handle('git-reset', async (event, projectPath) => {
  return await gitOperations.gitReset(projectPath);
});

ipcMain.handle('git-stash', async (event, projectPath) => {
  return await gitOperations.gitStash(projectPath);
});

ipcMain.handle('git-stash-pop', async (event, projectPath) => {
  return await gitOperations.gitStashPop(projectPath);
});
