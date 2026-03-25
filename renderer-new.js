const appState = {
  auth: {
    status: 'unknown',
    user: null,
    error: null,
    lastCheck: null
  },
  project: null,
  selectedRepo: null
};

const AUTH_STATUS = {
  UNKNOWN: 'unknown',
  CHECKING: 'checking',
  LOGGED_IN: 'logged_in',
  LOGGED_OUT: 'logged_out',
  ERROR: 'error'
};

const AUTH_CHECK_TIMEOUT = 10000;

const elements = {
  statusIndicator: document.getElementById('statusIndicator'),
  statusText: document.getElementById('statusText'),
  loginBtn: document.getElementById('loginBtn'),
  projectIndicator: document.getElementById('projectIndicator'),
  projectName: document.getElementById('projectName'),
  projectPath: document.getElementById('projectPath'),
  
  // Publish section
  selectFolderBtn: document.getElementById('selectFolderBtn'),
  selectZipBtn: document.getElementById('selectZipBtn'),
  projectDetails: document.getElementById('projectDetails'),
  detailName: document.getElementById('detailName'),
  detailPath: document.getElementById('detailPath'),
  statusGit: document.getElementById('statusGit'),
  statusRemote: document.getElementById('statusRemote'),
  statusBranch: document.getElementById('statusBranch'),
  
  repoSearch: document.getElementById('repoSearch'),
  repoList: document.getElementById('repoList'),
  connectRepoBtn: document.getElementById('connectRepoBtn'),
  repoName: document.getElementById('repoName'),
  isPrivate: document.getElementById('isPrivate'),
  
  publishBtn: document.getElementById('publishBtn'),
  publishHint: document.getElementById('publishHint'),
  quickActions: document.getElementById('quickActions'),
  
  errorPanel: document.getElementById('errorPanel'),
  errorSummary: document.getElementById('errorSummary'),
  errorCause: document.getElementById('errorCause'),
  errorImpact: document.getElementById('errorImpact'),
  errorActions: document.getElementById('errorActions'),
  errorTechnical: document.getElementById('errorTechnical'),
  
  simpleLog: document.getElementById('simpleLog'),
  
  // Git section
  gitNoProject: document.getElementById('gitNoProject'),
  gitInitBtn: document.getElementById('gitInitBtn'),
  gitStatusBtn: document.getElementById('gitStatusBtn'),
  gitStatusOutput: document.getElementById('gitStatusOutput'),
  gitAddBtn: document.getElementById('gitAddBtn'),
  specificFile: document.getElementById('specificFile'),
  commitType: document.getElementById('commitType'),
  commitMessage: document.getElementById('commitMessage'),
  gitCommitBtn: document.getElementById('gitCommitBtn'),
  gitPushBtn: document.getElementById('gitPushBtn'),
  gitPullBtn: document.getElementById('gitPullBtn'),
  forcePush: document.getElementById('forcePush'),
  
  gitErrorPanel: document.getElementById('gitErrorPanel'),
  gitSimpleLog: document.getElementById('gitSimpleLog'),
  
  // Gitignore section
  gitignoreNoProject: document.getElementById('gitignoreNoProject'),
  gitignoreContent: document.getElementById('gitignoreContent'),
  saveGitignoreBtn: document.getElementById('saveGitignoreBtn'),
  addCommonBtn: document.getElementById('addCommonBtn'),
  ignoreSimpleLog: document.getElementById('ignoreSimpleLog'),
  
  // Branches section
  branchesNoProject: document.getElementById('branchesNoProject'),
  newBranchName: document.getElementById('newBranchName'),
  createBranchBtn: document.getElementById('createBranchBtn'),
  refreshBranchesBtn: document.getElementById('refreshBranchesBtn'),
  branchList: document.getElementById('branchList'),
  branchSimpleLog: document.getElementById('branchSimpleLog')
};

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  setupNavigation();
  setupTabs();
  showNoProjectWarnings();
  addResetButton();
});

async function initializeApp() {
  await checkLoginStatusWithTimeout();
}

async function checkLoginStatusWithTimeout() {
  setAuthState(AUTH_STATUS.CHECKING);
  
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ timeout: true }), AUTH_CHECK_TIMEOUT);
  });
  
  const checkPromise = window.electronAPI.checkLoginStatus();
  
  try {
    const result = await Promise.race([checkPromise, timeoutPromise]);
    
    if (result.timeout) {
      setAuthState(AUTH_STATUS.ERROR, null, 'Timeout ao verificar login');
      addLog(elements.simpleLog, 'Falha ao verificar login. Você pode continuar usando o app.', 'warning');
      return;
    }
    
    if (result.loggedIn) {
      setAuthState(AUTH_STATUS.LOGGED_IN, result.username);
    } else {
      setAuthState(AUTH_STATUS.LOGGED_OUT);
    }
  } catch (error) {
    setAuthState(AUTH_STATUS.ERROR, null, error.message);
    addLog(elements.simpleLog, 'Erro ao verificar login. Você pode continuar usando o app.', 'warning');
  }
}

function setAuthState(status, user = null, error = null) {
  appState.auth = {
    status,
    user,
    error,
    lastCheck: Date.now()
  };
  
  updateLoginUI();
}

function updateLoginUI() {
  const { status, user, error } = appState.auth;
  
  elements.loginBtn.disabled = false;
  
  switch (status) {
    case AUTH_STATUS.CHECKING:
      elements.statusIndicator.className = 'status-indicator checking';
      elements.statusText.innerHTML = '<span class="spinner"></span> Verificando...';
      elements.loginBtn.disabled = true;
      break;
      
    case AUTH_STATUS.LOGGED_IN:
      elements.statusIndicator.className = 'status-indicator logged-in';
      elements.statusText.textContent = user || 'Logado';
      elements.loginBtn.textContent = 'Logout';
      break;
      
    case AUTH_STATUS.LOGGED_OUT:
      elements.statusIndicator.className = 'status-indicator logged-out';
      elements.statusText.textContent = 'Não logado';
      elements.loginBtn.textContent = 'Login GitHub';
      break;
      
    case AUTH_STATUS.ERROR:
      elements.statusIndicator.className = 'status-indicator error';
      elements.statusText.textContent = 'Erro no login';
      elements.loginBtn.textContent = 'Tentar novamente';
      showAuthErrorCard(error);
      break;
      
    case AUTH_STATUS.UNKNOWN:
    default:
      elements.statusIndicator.className = 'status-indicator';
      elements.statusText.textContent = 'Desconhecido';
      elements.loginBtn.textContent = 'Verificar Login';
      break;
  }
}

elements.loginBtn.addEventListener('click', async () => {
  if (appState.auth.status === AUTH_STATUS.LOGGED_IN) {
    if (confirm('Deseja fazer logout?')) {
      setAuthState(AUTH_STATUS.LOGGED_OUT);
      addLog(elements.simpleLog, 'Logout realizado', 'info');
    }
    return;
  }
  
  elements.loginBtn.disabled = true;
  elements.loginBtn.textContent = 'Aguarde...';
  
  addLog(elements.simpleLog, 'Abrindo autenticação GitHub...', 'info');
  const result = await window.electronAPI.githubLogin();
  
  addLog(elements.simpleLog, result.message, result.success ? 'info' : 'error');
  
  setTimeout(async () => {
    await checkLoginStatusWithTimeout();
    
    if (appState.auth.status === AUTH_STATUS.LOGGED_IN) {
      addLog(elements.simpleLog, `✓ Logado como: ${appState.auth.user}`, 'success');
    }
  }, 2000);
});

elements.selectFolderBtn.addEventListener('click', selectProject);
elements.selectZipBtn.addEventListener('click', selectProject);

async function selectProject() {
  const result = await window.electronAPI.selectProject();
  
  if (result.success) {
    appState.project = result;
    displayProjectInfo(result);
    updateProjectIndicator(result);
    hideNoProjectWarnings();
    enablePublishFlow();
    
    addLog(elements.simpleLog, '✓ Projeto carregado com sucesso', 'success');
    
    const projectName = result.path.split(/[/\\]/).pop();
    elements.repoName.value = projectName.toLowerCase().replace(/\s+/g, '-');
  } else {
    addLog(elements.simpleLog, result.message, 'error');
  }
}

function displayProjectInfo(project) {
  const projectName = project.path.split(/[/\\]/).pop();
  
  elements.projectDetails.style.display = 'block';
  elements.detailName.textContent = projectName;
  elements.detailPath.textContent = project.path;
  
  // Update status indicators
  updateStatusItem(elements.statusGit, project.hasGit);
  updateStatusItem(elements.statusRemote, project.hasRemote);
  updateStatusItem(elements.statusBranch, project.hasBranchMain);
}

function updateStatusItem(element, isActive) {
  if (isActive) {
    element.classList.add('active');
    element.querySelector('.status-icon').textContent = '✓';
  } else {
    element.classList.remove('active');
    element.querySelector('.status-icon').textContent = '○';
  }
}

function updateProjectIndicator(project) {
  const projectName = project.path.split(/[/\\]/).pop();
  
  elements.projectIndicator.classList.add('active');
  elements.projectName.textContent = `📁 ${projectName}`;
  elements.projectPath.textContent = project.path;
}

function enablePublishFlow() {
  elements.publishBtn.disabled = false;
  elements.publishHint.textContent = 'Pronto para publicar';
}

// ========================================
// TABS
// ========================================

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    });
  });
}

document.querySelector('[data-tab="existing"]').addEventListener('click', async () => {
  if (elements.repoList.children.length === 0) {
    addLog(elements.simpleLog, 'Carregando repositórios...', 'info');
    const result = await window.electronAPI.listRepos();
    
    if (result.success) {
      displayRepoList(result.repos);
      addLog(elements.simpleLog, `${result.repos.length} repositórios encontrados`, 'success');
    } else {
      addLog(elements.simpleLog, result.message, 'error');
    }
  }
});

function displayRepoList(repos) {
  elements.repoList.innerHTML = '';
  
  if (repos.length === 0) {
    elements.repoList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">Nenhum repositório encontrado</div></div>';
    return;
  }
  
  repos.forEach(repo => {
    const item = document.createElement('div');
    item.className = 'repo-item';
    item.textContent = repo.name;
    item.dataset.url = repo.url;
    
    item.addEventListener('click', () => {
      document.querySelectorAll('.repo-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      appState.selectedRepo = repo;
      elements.connectRepoBtn.disabled = false;
    });
    
    elements.repoList.appendChild(item);
  });
}

elements.repoSearch?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('.repo-item').forEach(item => {
    const repoName = item.textContent.toLowerCase();
    item.style.display = repoName.includes(searchTerm) ? 'block' : 'none';
  });
});

// Connect to existing repo
elements.connectRepoBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  if (!appState.selectedRepo) {
    showValidationError({ 
      valid: false, 
      message: 'Selecione um repositório da lista',
      actions: []
    });
    return;
  }

  addLog(elements.simpleLog, 'Conectando ao repositório...', 'info');
  
  const result = await window.electronAPI.connectExistingRepo({
    projectPath: appState.project.path,
    repoUrl: appState.selectedRepo.url
  });

  if (result.success) {
    addLog(elements.simpleLog, '✓ Repositório conectado com sucesso', 'success');
    appState.project.hasRemote = true;
    displayProjectInfo(appState.project);
    showQuickActions();
  } else {
    addLog(elements.simpleLog, result.message, 'error');
    showError('CONNECT_FAILED', result.message);
  }
});

elements.publishBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const repoName = elements.repoName.value.trim();
  if (!repoName) {
    showValidationError({
      valid: false,
      message: 'Digite um nome para o repositório',
      actions: []
    });
    return;
  }

  const isPrivate = elements.isPrivate.checked;
  
  elements.publishBtn.disabled = true;
  elements.publishBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Publicando...</span>';
  
  addLog(elements.simpleLog, 'Criando repositório no GitHub...', 'info');
  
  const result = await window.electronAPI.createRepo({
    projectPath: appState.project.path,
    repoName,
    isPrivate
  });

  elements.publishBtn.disabled = false;
  elements.publishBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Publicar Projeto</span>';

  if (result.success) {
    addLog(elements.simpleLog, '✓ Repositório criado e publicado!', 'success');
    appState.project.hasRemote = true;
    displayProjectInfo(appState.project);
    showQuickActions();
  } else {
    addLog(elements.simpleLog, result.message, 'error');
    showError('PUBLISH_FAILED', result.message, result);
  }
});

function showQuickActions() {
  elements.quickActions.style.display = 'grid';
}

document.getElementById('commitBtn')?.addEventListener('click', () => {
  document.querySelector('[data-section="git"]').click();
});

document.getElementById('pushBtn')?.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addLog(elements.simpleLog, 'Enviando para GitHub...', 'info');
  const result = await window.electronAPI.gitPush({ projectPath: appState.project.path, force: false });
  addLog(elements.simpleLog, result.message, result.success ? 'success' : 'error');
});

document.getElementById('pullBtn')?.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addLog(elements.simpleLog, 'Baixando do GitHub...', 'info');
  const result = await window.electronAPI.gitPull(appState.project.path);
  addLog(elements.simpleLog, result.message, result.success ? 'success' : 'error');
});

document.getElementById('openGithubBtn')?.addEventListener('click', () => {
  if (appState.project?.remoteInfo?.fullName) {
    const url = `https://github.com/${appState.project.remoteInfo.fullName}`;
    require('electron').shell.openExternal(url);
  }
});

elements.gitInitBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  addLog(elements.gitSimpleLog, 'Inicializando Git...', 'info');
  const result = await window.electronAPI.gitInit(appState.project.path);
  
  addLog(elements.gitSimpleLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    appState.project.hasGit = true;
    displayProjectInfo(appState.project);
  }
});

elements.gitStatusBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  addLog(elements.gitSimpleLog, 'Obtendo status...', 'info');
  const result = await window.electronAPI.gitStatus(appState.project.path);
  
  if (result.success) {
    elements.gitStatusOutput.style.display = 'block';
    elements.gitStatusOutput.textContent = result.output;
    addLog(elements.gitSimpleLog, '✓ Status obtido', 'success');
  } else {
    addLog(elements.gitSimpleLog, result.message, 'error');
  }
});

// Toggle specific file input
document.querySelectorAll('input[name="addType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    document.getElementById('specificFileInput').style.display = 
      e.target.value === 'specific' ? 'block' : 'none';
  });
});

elements.gitAddBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const addType = document.querySelector('input[name="addType"]:checked').value;
  let files = '.';
  
  if (addType === 'specific') {
    files = elements.specificFile.value.trim();
    if (!files) {
      showGitError('NO_FILE', 'Digite o caminho do arquivo');
      return;
    }
  }

  addLog(elements.gitSimpleLog, `Adicionando arquivos: ${files}...`, 'info');
  const result = await window.electronAPI.gitAdd({
    projectPath: appState.project.path,
    files
  });
  
  addLog(elements.gitSimpleLog, result.message, result.success ? 'success' : 'error');
});

elements.commitType.addEventListener('change', (e) => {
  elements.commitMessage.placeholder = 
    e.target.value === 'custom' ? 'mensagem completa do commit' : 'descrição das alterações';
});

elements.gitCommitBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const commitType = elements.commitType.value;
  const messageText = elements.commitMessage.value.trim();
  
  if (!messageText) {
    showGitError('NO_MESSAGE', 'Digite uma mensagem de commit');
    return;
  }

  const fullMessage = commitType === 'custom' ? messageText : `${commitType}: ${messageText}`;

  addLog(elements.gitSimpleLog, `Fazendo commit: "${fullMessage}"`, 'info');
  const result = await window.electronAPI.gitCommit({
    projectPath: appState.project.path,
    message: fullMessage
  });
  
  addLog(elements.gitSimpleLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    elements.commitMessage.value = '';
  }
});

elements.gitPushBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const force = elements.forcePush.checked;
  
  if (force && !confirm('⚠️ Force push pode sobrescrever alterações remotas. Continuar?')) {
    return;
  }

  addLog(elements.gitSimpleLog, force ? 'Enviando (force)...' : 'Enviando...', 'info');
  const result = await window.electronAPI.gitPush({
    projectPath: appState.project.path,
    force
  });
  
  addLog(elements.gitSimpleLog, result.message, result.success ? 'success' : 'error');
});

elements.gitPullBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  addLog(elements.gitSimpleLog, 'Baixando alterações...', 'info');
  const result = await window.electronAPI.gitPull(appState.project.path);
  
  addLog(elements.gitSimpleLog, result.message, result.success ? 'success' : 'error');
});

document.querySelector('[data-section="gitignore"]').addEventListener('click', async () => {
  if (appState.project && !elements.gitignoreContent.value) {
    const result = await window.electronAPI.getGitignore(appState.project.path);
    if (result.success) {
      elements.gitignoreContent.value = result.content;
    }
  }
});

elements.saveGitignoreBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const content = elements.gitignoreContent.value;
  
  addLog(elements.ignoreSimpleLog, 'Salvando .gitignore...', 'info');
  const result = await window.electronAPI.saveGitignore({
    projectPath: appState.project.path,
    content
  });

  addLog(elements.ignoreSimpleLog, result.message, result.success ? 'success' : 'error');
});

elements.addCommonBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  addLog(elements.ignoreSimpleLog, 'Adicionando padrões comuns...', 'info');
  const result = await window.electronAPI.addCommonPatterns(appState.project.path);

  if (result.success) {
    elements.gitignoreContent.value = result.content;
    addLog(elements.ignoreSimpleLog, result.message, 'success');
  } else {
    addLog(elements.ignoreSimpleLog, result.message, 'error');
  }
});

document.querySelector('[data-section="branches"]').addEventListener('click', () => {
  if (appState.project) {
    refreshBranches();
  }
});

elements.refreshBranchesBtn.addEventListener('click', refreshBranches);

async function refreshBranches() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const result = await window.electronAPI.listBranches(appState.project.path);
  
  if (result.success) {
    displayBranches(result.branches, result.current);
  } else {
    addLog(elements.branchSimpleLog, result.message, 'error');
  }
}

function displayBranches(branches, currentBranch) {
  elements.branchList.innerHTML = '';
  
  if (branches.length === 0) {
    elements.branchList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🌿</div><div class="empty-state-text">Nenhuma branch encontrada</div></div>';
    return;
  }
  
  branches.forEach(branch => {
    const item = document.createElement('li');
    item.className = 'branch-item';
    if (branch === currentBranch) {
      item.classList.add('current');
    }
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'branch-name';
    nameSpan.textContent = branch + (branch === currentBranch ? ' (atual)' : '');
    
    const actions = document.createElement('div');
    actions.className = 'branch-actions';
    
    if (branch !== currentBranch) {
      const switchBtn = document.createElement('button');
      switchBtn.textContent = 'Trocar';
      switchBtn.className = 'secondary';
      switchBtn.addEventListener('click', () => switchToBranch(branch));
      actions.appendChild(switchBtn);
    }
    
    const pushBtn = document.createElement('button');
    pushBtn.textContent = 'Push';
    pushBtn.addEventListener('click', () => pushBranch(branch));
    actions.appendChild(pushBtn);
    
    item.appendChild(nameSpan);
    item.appendChild(actions);
    elements.branchList.appendChild(item);
  });
}

elements.createBranchBtn.addEventListener('click', async () => {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }

  const branchName = elements.newBranchName.value.trim();
  if (!branchName) {
    addLog(elements.branchSimpleLog, 'Digite um nome para a branch', 'error');
    return;
  }

  addLog(elements.branchSimpleLog, `Criando branch ${branchName}...`, 'info');
  const result = await window.electronAPI.createBranch({
    projectPath: appState.project.path,
    branchName
  });

  if (result.success) {
    addLog(elements.branchSimpleLog, result.message, 'success');
    elements.newBranchName.value = '';
    refreshBranches();
  } else {
    addLog(elements.branchSimpleLog, result.message, 'error');
  }
});

async function switchToBranch(branchName) {
  addLog(elements.branchSimpleLog, `Trocando para ${branchName}...`, 'info');
  const result = await window.electronAPI.switchBranch({
    projectPath: appState.project.path,
    branchName
  });

  addLog(elements.branchSimpleLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    refreshBranches();
  }
}

async function pushBranch(branchName) {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addLog(elements.branchSimpleLog, `Enviando ${branchName}...`, 'info');
  const result = await window.electronAPI.pushBranch({
    projectPath: appState.project.path,
    branchName
  });

  addLog(elements.branchSimpleLog, result.message, result.success ? 'success' : 'error');
}

function setupNavigation() {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const sectionName = item.dataset.section;
      
      // Update sidebar
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Update sections
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sectionName).classList.add('active');
    });
  });
}

function setupEventListeners() {

function showNoProjectWarnings() {
  elements.gitNoProject.style.display = 'block';
  elements.gitignoreNoProject.style.display = 'block';
  elements.branchesNoProject.style.display = 'block';
}

function hideNoProjectWarnings() {
  elements.gitNoProject.style.display = 'none';
  elements.gitignoreNoProject.style.display = 'none';
  elements.branchesNoProject.style.display = 'none';
}

function addLog(logElement, message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const icons = {
    success: '✓',
    error: '✗',
    info: '→',
    warning: '⚠'
  };
  
  entry.innerHTML = `
    <span class="log-icon">${icons[type]}</span>
    <div class="log-content">
      <div class="log-time">${new Date().toLocaleTimeString()}</div>
      <div class="log-message">${message}</div>
    </div>
  `;
  
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
  
  // Limit to 50 entries
  while (logElement.children.length > 50) {
    logElement.removeChild(logElement.firstChild);
  }
}

function clearSimpleLog() {
  elements.simpleLog.innerHTML = '';
}

function clearGitLog() {
  elements.gitSimpleLog.innerHTML = '';
}

function clearIgnoreLog() {
  elements.ignoreSimpleLog.innerHTML = '';
}

function clearBranchLog() {
  elements.branchSimpleLog.innerHTML = '';
}

function showError(code, message, details = {}) {
  elements.errorPanel.style.display = 'block';
  elements.errorSummary.textContent = message;
  elements.errorCause.textContent = details.cause || 'Erro ao processar operação';
  elements.errorImpact.textContent = details.impact || 'A operação não pôde ser concluída';
  elements.errorTechnical.textContent = details.technical || message;
  
  // Scroll to error
  elements.errorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showGitError(code, message, details = {}) {
  elements.gitErrorPanel.style.display = 'block';
  document.getElementById('gitErrorSummary').textContent = message;
  document.getElementById('gitErrorCause').textContent = details.cause || 'Erro ao processar operação';
  document.getElementById('gitErrorImpact').textContent = details.impact || 'A operação não pôde ser concluída';
  document.getElementById('gitErrorTechnical').textContent = details.technical || message;
  
  elements.gitErrorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.clearSimpleLog = clearSimpleLog;
window.clearGitLog = clearGitLog;
window.clearIgnoreLog = clearIgnoreLog;
window.clearBranchLog = clearBranchLog;

let currentTutorialStepper = null;

function setupTutorial() {
  const tutorialNavBtns = document.querySelectorAll('.tutorial-nav-btn');
  const tutorialContentEl = document.getElementById('tutorialContent');
  
  if (!tutorialNavBtns.length || !tutorialContentEl) {
    console.log('Tutorial elements not found');
    return;
  }
  
  tutorialNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tutorialId = btn.dataset.tutorial;
      
      // Update active button
      tutorialNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Check if this tutorial has stepper version
      if (window.tutorialSteps && window.tutorialSteps[tutorialId]) {
        // Use stepper for guided tutorials
        loadStepperTutorial(tutorialId, tutorialContentEl);
      } else if (window.tutorialContent && window.tutorialContent[tutorialId]) {
        // Use regular content for reference tutorials
        loadRegularTutorial(tutorialId, tutorialContentEl);
      } else {
        tutorialContentEl.innerHTML = `
          <div style="text-align: center; padding: var(--space-8); color: var(--text-tertiary);">
            <p>Conteúdo do tutorial não encontrado.</p>
            <p style="font-size: 0.875rem; margin-top: var(--space-2);">ID: ${tutorialId}</p>
          </div>
        `;
        console.error('Tutorial content not found for:', tutorialId);
      }
    });
  });
  
  // Load first tutorial by default after a small delay
  setTimeout(() => {
    if (tutorialNavBtns.length > 0) {
      tutorialNavBtns[0].click();
    }
  }, 100);
}

function loadStepperTutorial(tutorialId, container) {
  container.innerHTML = '<div id="stepperContainer"></div>';
  
  if (currentTutorialStepper) {
    currentTutorialStepper = null;
  }
  
  setTimeout(() => {
    currentTutorialStepper = new TutorialStepper('stepperContainer', tutorialId);
  }, 50);
}

function loadRegularTutorial(tutorialId, container) {
  const tutorial = window.tutorialContent[tutorialId];
  container.innerHTML = `
    <h2 style="font-size: 1.875rem; font-weight: 600; margin-bottom: var(--space-6); color: var(--text-primary);">
      ${tutorial.title}
    </h2>
    ${tutorial.content}
  `;
  
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelector('[data-section="tutorial"]')?.addEventListener('click', () => {
  if (!window.tutorialInitialized) {
    setupTutorial();
    window.tutorialInitialized = true;
  }
});


function validateAction(requirements) {
  const { requiresProject, requiresGitHub } = requirements;
  const actions = [];
  
  if (requiresProject && !appState.project) {
    actions.push({
      label: 'Selecionar Projeto',
      action: () => {
        document.querySelector('[data-section="publish"]').click();
        elements.selectFolderBtn.focus();
      }
    });
    
    return {
      valid: false,
      message: 'Nenhum projeto selecionado',
      detail: 'Você precisa selecionar um projeto antes de executar esta ação.',
      actions
    };
  }
  
  if (requiresGitHub && appState.auth.status !== AUTH_STATUS.LOGGED_IN) {
    actions.push({
      label: 'Fazer Login',
      action: () => {
        elements.loginBtn.click();
      }
    });
    
    actions.push({
      label: 'Continuar sem GitHub',
      action: () => {
        hideValidationError();
      }
    });
    
    return {
      valid: false,
      message: 'Login no GitHub necessário',
      detail: 'Esta operação requer autenticação no GitHub. Você pode fazer login ou continuar usando apenas operações locais.',
      actions
    };
  }
  
  return { valid: true };
}

function showValidationError(validation) {
  const errorCard = document.createElement('div');
  errorCard.id = 'validationError';
  errorCard.className = 'validation-error';
  errorCard.innerHTML = `
    <div class="validation-error-header">
      <span class="validation-error-icon">⚠️</span>
      <h4>${validation.message}</h4>
      <button class="close-btn" onclick="hideValidationError()">×</button>
    </div>
    <div class="validation-error-body">
      <p>${validation.detail || validation.message}</p>
      ${validation.actions && validation.actions.length > 0 ? `
        <div class="validation-error-actions">
          ${validation.actions.map((action, i) => `
            <button class="validation-action-btn" data-action-index="${i}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  const existing = document.getElementById('validationError');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(errorCard);
  
  validation.actions?.forEach((action, i) => {
    const btn = errorCard.querySelector(`[data-action-index="${i}"]`);
    if (btn) {
      btn.addEventListener('click', () => {
        action.action();
        hideValidationError();
      });
    }
  });
  
  setTimeout(() => {
    errorCard.classList.add('show');
  }, 10);
}

function hideValidationError() {
  const errorCard = document.getElementById('validationError');
  if (errorCard) {
    errorCard.classList.remove('show');
    setTimeout(() => errorCard.remove(), 300);
  }
}

window.hideValidationError = hideValidationError;

function showAuthErrorCard(error) {
  const errorCard = document.createElement('div');
  errorCard.id = 'authErrorCard';
  errorCard.className = 'auth-error-card';
  errorCard.innerHTML = `
    <div class="auth-error-header">
      <span class="auth-error-icon">🔒</span>
      <h4>Não foi possível verificar login</h4>
      <button class="close-btn" onclick="hideAuthErrorCard()">×</button>
    </div>
    <div class="auth-error-body">
      <p>O sistema não conseguiu verificar seu status de login no GitHub.</p>
      <p class="auth-error-detail">${error || 'Erro desconhecido'}</p>
      <div class="auth-error-actions">
        <button class="auth-action-btn primary" onclick="retryLogin()">
          Tentar Novamente
        </button>
        <button class="auth-action-btn secondary" onclick="continueWithoutAuth()">
          Continuar sem Login
        </button>
      </div>
      <p class="auth-error-note">
        Você pode continuar usando operações locais do Git sem estar logado no GitHub.
      </p>
    </div>
  `;
  
  const existing = document.getElementById('authErrorCard');
  if (existing) {
    existing.remove();
  }
  
  const header = document.querySelector('.header');
  if (header) {
    header.after(errorCard);
  }
  
  setTimeout(() => {
    errorCard.classList.add('show');
  }, 10);
}

function hideAuthErrorCard() {
  const errorCard = document.getElementById('authErrorCard');
  if (errorCard) {
    errorCard.classList.remove('show');
    setTimeout(() => errorCard.remove(), 300);
  }
}

async function retryLogin() {
  hideAuthErrorCard();
  await checkLoginStatusWithTimeout();
}

function continueWithoutAuth() {
  hideAuthErrorCard();
  setAuthState(AUTH_STATUS.LOGGED_OUT);
  addLog(elements.simpleLog, 'Continuando sem autenticação GitHub', 'info');
}

window.hideAuthErrorCard = hideAuthErrorCard;
window.retryLogin = retryLogin;
window.continueWithoutAuth = continueWithoutAuth;

function addResetButton() {
  const resetBtn = document.createElement('button');
  resetBtn.id = 'resetStateBtn';
  resetBtn.className = 'reset-state-btn';
  resetBtn.innerHTML = '🔄 Resetar Estado';
  resetBtn.title = 'Resetar estado da aplicação (não deleta dados do projeto)';
  
  resetBtn.addEventListener('click', () => {
    if (confirm('Resetar o estado da aplicação? Isso não afetará seus dados do projeto.')) {
      resetAppState();
    }
  });
  
  const loginStatus = document.querySelector('.login-status');
  if (loginStatus) {
    loginStatus.appendChild(resetBtn);
  }
}

function resetAppState() {
  setAuthState(AUTH_STATUS.LOGGED_OUT);
  
  hideValidationError();
  hideAuthErrorCard();
  
  elements.loginBtn.disabled = false;
  elements.loginBtn.textContent = 'Login GitHub';
  
  elements.publishBtn.disabled = false;
  elements.publishBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Publicar Projeto</span>';
  
  addLog(elements.simpleLog, '✓ Estado da aplicação resetado', 'success');
  addLog(elements.simpleLog, 'Interface desbloqueada. Você pode continuar trabalhando.', 'info');
}
