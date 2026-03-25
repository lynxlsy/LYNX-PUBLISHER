// Lynx Publisher - Refactored Renderer
// Smart error handling and guided UI flow

// ========== STATE ==========
const appState = {
  auth: {
    status: 'unknown',
    user: null,
    error: null,
    lastCheck: null,
    requestId: 0
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

let allRepos = [];
let lastRepoLoad = 0;
const REPO_CACHE_TIME = 30000; // 30 segundos

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Lynx Publisher - Initializing...');
  
  checkLoginStatusWithTimeout();
  setupNavigation();
  setupEventListeners();
  showNoProjectWarnings();
  addResetButton();
  
  // Update button states on load
  updatePublishButton();
  
  // Initialize Guided Publish
  if (document.getElementById('publish-guided')) {
    initGuidedPublish();
    updateProgressIndicator();
    updateProjectHealth();
    setupAdvancedMode();
  }
  
  // Initialize Tutorial
  if (document.getElementById('tutorialContent')) {
    setupTutorial();
  }
  
  console.log('✅ Initialization complete');
  
  // Log button states
  const createBtn = document.getElementById('createNewRepoBtn');
  const publishBtn = document.getElementById('publishBtn');
  console.log('Create button found:', !!createBtn);
  console.log('Create button disabled:', createBtn?.disabled);
  console.log('Publish button found:', !!publishBtn);
  console.log('Publish button disabled:', publishBtn?.disabled);
});

// ========== LOGIN ==========
async function checkLoginStatusWithTimeout() {
  setAuthState(AUTH_STATUS.CHECKING);
  
  const requestId = ++appState.auth.requestId;
  
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ timeout: true }), AUTH_CHECK_TIMEOUT);
  });
  
  const checkPromise = window.electronAPI.checkLoginStatus();
  
  try {
    const result = await Promise.race([checkPromise, timeoutPromise]);
    
    if (appState.auth.requestId !== requestId) {
      return;
    }
    
    if (result.timeout) {
      setAuthState(AUTH_STATUS.ERROR, null, 'Timeout ao verificar login');
      addSimpleLog('Falha ao verificar login. Você pode continuar usando o app.', 'warning');
      return;
    }
    
    if (result.loggedIn) {
      setAuthState(AUTH_STATUS.LOGGED_IN, result.username);
    } else {
      setAuthState(AUTH_STATUS.LOGGED_OUT);
    }
  } catch (error) {
    if (appState.auth.requestId !== requestId) {
      return;
    }
    setAuthState(AUTH_STATUS.ERROR, null, error.message);
    addSimpleLog('Erro ao verificar login. Você pode continuar usando o app.', 'warning');
  }
}

function setAuthState(status, user = null, error = null) {
  appState.auth.status = status;
  appState.auth.user = user;
  appState.auth.error = error;
  appState.auth.lastCheck = Date.now();
  
  updateLoginUI();
}

function updateLoginUI() {
  const { status, user, error } = appState.auth;
  const indicator = document.getElementById('statusIndicator');
  const text = document.getElementById('statusText');
  const btn = document.getElementById('loginBtn');
  
  btn.disabled = false;
  
  switch (status) {
    case AUTH_STATUS.CHECKING:
      indicator.className = 'status-indicator checking';
      text.innerHTML = '<span class="spinner"></span> Verificando...';
      btn.disabled = true;
      break;
      
    case AUTH_STATUS.LOGGED_IN:
      indicator.className = 'status-indicator logged-in';
      text.textContent = user || 'Logado';
      btn.textContent = 'Logout';
      break;
      
    case AUTH_STATUS.LOGGED_OUT:
      indicator.className = 'status-indicator logged-out';
      text.textContent = 'Não logado';
      btn.textContent = 'Login GitHub';
      break;
      
    case AUTH_STATUS.ERROR:
      indicator.className = 'status-indicator error';
      text.textContent = 'Erro no login';
      btn.textContent = 'Tentar novamente';
      showAuthErrorCard(error);
      break;
      
    case AUTH_STATUS.UNKNOWN:
    default:
      indicator.className = 'status-indicator';
      text.textContent = 'Desconhecido';
      btn.textContent = 'Verificar Login';
      break;
  }
  
  // Refresh guided stepper
  refreshGuidedStepper();
}

function updateLoginStatus(loggedIn, username = null) {
  if (loggedIn) {
    setAuthState(AUTH_STATUS.LOGGED_IN, username);
  } else {
    setAuthState(AUTH_STATUS.LOGGED_OUT);
  }
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  if (appState.auth.status === AUTH_STATUS.LOGGED_IN) {
    if (confirm('Deseja fazer logout?')) {
      setAuthState(AUTH_STATUS.LOGGED_OUT);
      addSimpleLog('Logout realizado', 'info');
    }
    return;
  }
  
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Aguarde...';
  
  addSimpleLog('Abrindo autenticação GitHub...', 'info');
  const result = await window.electronAPI.githubLogin();
  
  addSimpleLog(result.message, result.success ? 'info' : 'error');
  
  setTimeout(async () => {
    await checkLoginStatusWithTimeout();
    
    if (appState.auth.status === AUTH_STATUS.LOGGED_IN) {
      addSimpleLog(`✓ Logado como: ${appState.auth.user}`, 'success');
    }
  }, 2000);
});

// ========== VALIDATION ==========
function validateAction(requirements) {
  const { requiresProject, requiresGitHub } = requirements;
  const actions = [];
  
  if (requiresProject && !appState.project) {
    actions.push({
      label: 'Selecionar Projeto',
      action: () => {
        document.querySelector('[data-section="publish"]').click();
        document.getElementById('selectFolderBtn').focus();
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
        document.getElementById('loginBtn').click();
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
  addSimpleLog('Continuando sem autenticação GitHub', 'info');
}

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
  
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.disabled = false;
  loginBtn.textContent = 'Login GitHub';
  
  const publishBtn = document.getElementById('publishBtn');
  publishBtn.disabled = false;
  publishBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Publicar Projeto</span>';
  
  addSimpleLog('✓ Estado da aplicação resetado', 'success');
  addSimpleLog('Interface desbloqueada. Você pode continuar trabalhando.', 'info');
}

window.hideValidationError = hideValidationError;
window.hideAuthErrorCard = hideAuthErrorCard;
window.retryLogin = retryLogin;
window.continueWithoutAuth = continueWithoutAuth;

// ========== NAVIGATION ==========
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
      
      // Load section-specific data
      if (sectionName === 'git' && appState.project) {
        loadGitInfo();
      } else if (sectionName === 'gitignore' && appState.project) {
        loadGitignore();
      } else if (sectionName === 'branches' && appState.project) {
        refreshBranches();
      }
    });
  });
}

// ========== PROJECT SELECTION ==========
function setupEventListeners() {
  // Project selection
  document.getElementById('selectFolderBtn').addEventListener('click', () => selectProject('folder'));
  document.getElementById('selectZipBtn').addEventListener('click', () => selectProject('zip'));
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      console.log(`📑 Switching to tab: ${tab}`);
      
      // Update tabs
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update content
      document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        console.log('Hiding tab:', c.id);
      });
      
      const tabContent = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
      if (tabContent) {
        tabContent.classList.add('active');
        console.log(`✅ Tab content activated: ${tabContent.id}`);
        console.log('Display style:', window.getComputedStyle(tabContent).display);
        console.log('Classes:', tabContent.className);
      } else {
        console.error(`❌ Tab content not found: tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
      }
      
      // Update tab indicator
      const tabIndicator = document.getElementById('currentTabName');
      if (tabIndicator) {
        if (tab === 'existing') {
          tabIndicator.textContent = 'Conectar a Repositório Existente';
          tabIndicator.style.color = 'var(--primary)';
        } else {
          tabIndicator.textContent = 'Criar Novo Repositório';
          tabIndicator.style.color = 'var(--success)';
        }
      }
      
      // Load repos when switching to existing tab
      if (tab === 'existing') {
        console.log('🔄 Loading repositories...');
        loadRepositories();
        addSimpleLog('📋 Carregando lista de repositórios...', 'info');
      } else {
        addSimpleLog('📝 Modo: Criar novo repositório', 'info');
      }
      
      // Update button states
      updatePublishButton();
    });
  });
  
  // Repo search
  document.getElementById('repoSearch').addEventListener('input', (e) => {
    filterRepos(e.target.value);
  });
  
  // Connect repo button
  document.getElementById('connectRepoBtn').addEventListener('click', connectExistingRepo);
  
  // Create new repo button
  const createNewRepoBtn = document.getElementById('createNewRepoBtn');
  if (createNewRepoBtn) {
    createNewRepoBtn.addEventListener('click', createNewRepo);
  } else {
    console.error('createNewRepoBtn not found in DOM');
  }
  
  // Publish button
  document.getElementById('publishBtn').addEventListener('click', publishProject);
  
  // Quick actions
  document.getElementById('commitBtn').addEventListener('click', () => goToSection('git'));
  document.getElementById('pushBtn').addEventListener('click', quickPush);
  document.getElementById('pullBtn').addEventListener('click', quickPull);
  document.getElementById('openGithubBtn').addEventListener('click', openGithub);
  
  // Git operations
  setupGitEventListeners();
  
  // Gitignore
  document.getElementById('saveGitignoreBtn').addEventListener('click', saveGitignore);
  document.getElementById('addCommonBtn').addEventListener('click', addCommonPatterns);
  
  // Branches
  document.getElementById('createBranchBtn').addEventListener('click', createBranch);
  document.getElementById('refreshBranchesBtn').addEventListener('click', refreshBranches);
}

async function selectProject(type) {
  addSimpleLog('Selecionando projeto...', 'info');
  
  const result = await window.electronAPI.selectProject();
  
  if (result.success) {
    appState.project = result;
    displayProjectInfo(result);
    updatePublishButton();
    hideNoProjectWarnings();
    addSimpleLog('✓ Projeto carregado', 'success');
  } else {
    addSimpleLog(result.message, 'error');
  }
}

function displayProjectInfo(project) {
  const details = document.getElementById('projectDetails');
  const projectName = project.path.split(/[/\\]/).pop();
  
  document.getElementById('detailName').textContent = projectName;
  document.getElementById('detailPath').textContent = project.path;
  
  // Update status indicators
  updateStatusItem('statusGit', project.hasGit);
  updateStatusItem('statusRemote', project.hasRemote);
  updateStatusItem('statusBranch', project.hasBranchMain);
  
  // Update header indicator
  document.getElementById('projectName').textContent = `📁 ${projectName}`;
  document.getElementById('projectPath').textContent = project.path;
  
  details.style.display = 'block';
  
  // Show quick actions if repo is connected
  if (project.hasRemote && project.remoteInfo && project.remoteInfo.exists) {
    document.getElementById('quickActions').style.display = 'grid';
  }
  
  // Refresh guided stepper
  refreshGuidedStepper();
  
  // Update sync status
  updateSyncStatus();
}

async function refreshProjectInfo() {
  if (!appState.project || !appState.project.path) {
    return;
  }
  
  try {
    const branchResult = await window.electronAPI.getCurrentBranch(appState.project.path);
    
    if (branchResult.success && branchResult.branch) {
      appState.project.currentBranch = branchResult.branch;
      appState.project.isMainBranch = (branchResult.branch === 'main' || branchResult.branch === 'master');
      appState.project.hasBranchMain = appState.project.isMainBranch;
      
      updateStatusItem('statusBranch', appState.project.isMainBranch);
      displayProjectInfo(appState.project);
    }
  } catch (error) {
    console.error('Error refreshing project info:', error);
  }
}

function updateStatusItem(id, active) {
  const item = document.getElementById(id);
  if (active) {
    item.classList.add('active');
    item.querySelector('.status-icon').textContent = '✓';
  } else {
    item.classList.remove('active');
    item.querySelector('.status-icon').textContent = '○';
  }
}

function updatePublishButton() {
  const btn = document.getElementById('publishBtn');
  const hint = document.getElementById('publishHint');
  const createBtn = document.getElementById('createNewRepoBtn');
  const repoNameHint = document.getElementById('repoNameHint');
  
  console.log('🔄 updatePublishButton called');
  console.log('Project:', appState.project ? 'YES' : 'NO');
  console.log('Auth:', appState.auth.status);
  
  if (!appState.project) {
    btn.disabled = true;
    hint.textContent = 'Selecione um projeto primeiro';
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.title = 'Selecione um projeto primeiro na etapa 1';
    }
    if (repoNameHint) {
      repoNameHint.innerHTML = '⚠️ <strong>Primeiro selecione um projeto</strong> na etapa 1 acima (📁 Selecionar Pasta)';
      repoNameHint.style.color = 'var(--warning)';
    }
    return;
  }
  
  if (appState.project.hasRemote) {
    btn.disabled = true;
    hint.textContent = 'Projeto já conectado a um repositório';
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.title = 'Este projeto já está conectado a um repositório';
    }
    if (repoNameHint) {
      repoNameHint.innerHTML = '✅ <strong>Projeto já conectado!</strong> Use as ações rápidas na etapa 3';
      repoNameHint.style.color = 'var(--success)';
    }
    return;
  }
  
  const repoName = document.getElementById('repoName').value.trim();
  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  
  console.log('Repo name:', repoName);
  console.log('Active tab:', activeTab);
  
  if (activeTab === 'new') {
    if (!repoName) {
      btn.disabled = true;
      hint.textContent = 'Digite um nome para o repositório';
      if (createBtn) {
        createBtn.disabled = true;
        createBtn.title = 'Digite um nome para o repositório no campo acima';
      }
      if (repoNameHint) {
        repoNameHint.textContent = 'Use apenas letras, números, hífens (-) e underscores (_)';
        repoNameHint.style.color = 'var(--text-tertiary)';
      }
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(repoName)) {
      btn.disabled = true;
      hint.textContent = 'Nome inválido (use apenas letras, números, - e _)';
      if (createBtn) {
        createBtn.disabled = true;
        createBtn.title = 'Nome inválido - use apenas letras, números, hífens e underscores';
      }
      if (repoNameHint) {
        repoNameHint.textContent = '❌ Nome inválido! Use apenas letras, números, hífens (-) e underscores (_)';
        repoNameHint.style.color = 'var(--error)';
      }
      return;
    }
    
    btn.disabled = false;
    hint.textContent = 'Pronto para criar!';
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.title = `Criar repositório "${repoName}" no GitHub`;
      console.log('✅ Create button ENABLED');
    }
    if (repoNameHint) {
      repoNameHint.textContent = `✅ Nome válido! Clique no botão abaixo para criar "${repoName}"`;
      repoNameHint.style.color = 'var(--success)';
    }
    return;
  }
  
  if (activeTab === 'existing' && !appState.selectedRepo) {
    btn.disabled = true;
    hint.textContent = 'Selecione um repositório da lista';
    return;
  }
  
  btn.disabled = false;
  hint.textContent = 'Pronto para publicar!';
}

// Watch for repo name changes
document.getElementById('repoName').addEventListener('input', () => {
  updatePublishButton();
  
  // Real-time validation feedback
  const repoName = document.getElementById('repoName').value.trim();
  const input = document.getElementById('repoName');
  
  if (repoName && !/^[a-zA-Z0-9_-]+$/.test(repoName)) {
    input.style.borderColor = 'var(--error)';
    input.title = 'Apenas letras, números, hífens e underscores são permitidos';
  } else {
    input.style.borderColor = '';
    input.title = '';
  }
});

// ========== REPOSITORY MANAGEMENT ==========
async function loadRepositories() {
  console.log('🔄 loadRepositories() called');
  console.log('Auth status:', appState.auth.status);
  console.log('Cached repos:', allRepos.length);
  
  // Check cache
  const now = Date.now();
  if (allRepos.length > 0 && (now - lastRepoLoad) < REPO_CACHE_TIME) {
    console.log('✅ Using cached repos');
    displayRepos(allRepos);
    return;
  }
  
  if (appState.auth.status !== AUTH_STATUS.LOGGED_IN) {
    console.log('⚠️ Not logged in, showing login prompt');
    const list = document.getElementById('repoList');
    list.innerHTML = `
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">🔒</div>
        <div style="color: var(--text-secondary); margin-bottom: 15px;">
          Você precisa fazer login no GitHub para ver seus repositórios
        </div>
        <button onclick="document.getElementById('loginBtn').click()" class="primary">
          Fazer Login
        </button>
      </div>
    `;
    return;
  }
  
  const list = document.getElementById('repoList');
  list.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-secondary);"><div class="spinner" style="margin: 0 auto 15px;"></div>Carregando repositórios...</div>';
  
  addSimpleLog('Carregando repositórios...', 'info');
  console.log('📡 Fetching repos from GitHub...');
  
  try {
    // Add timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao carregar repositórios')), 15000)
    );
    
    const result = await Promise.race([
      window.electronAPI.listRepos(),
      timeoutPromise
    ]);
    
    if (result.success) {
      allRepos = result.repos;
      lastRepoLoad = Date.now();
      displayRepos(allRepos);
      addSimpleLog(`✓ ${allRepos.length} repositórios encontrados`, 'success');
    } else {
      throw new Error(result.message || 'Erro ao carregar repositórios');
    }
  } catch (error) {
    list.innerHTML = `
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
        <div style="color: var(--error); margin-bottom: 15px;">
          ${error.message || 'Erro ao carregar repositórios'}
        </div>
        <div style="color: var(--text-tertiary); font-size: 0.875rem; margin-bottom: 15px;">
          Verifique sua conexão com a internet e se está logado no GitHub
        </div>
        <button onclick="window.forceReloadRepos()" class="secondary">
          Tentar Novamente
        </button>
      </div>
    `;
    addSimpleLog('✗ ' + error.message, 'error');
  }
}

window.loadRepositories = loadRepositories;

function forceReloadRepos() {
  lastRepoLoad = 0;
  allRepos = [];
  loadRepositories();
}

window.forceReloadRepos = forceReloadRepos;

function displayRepos(repos) {
  console.log('📋 displayRepos() called with', repos.length, 'repos');
  
  const list = document.getElementById('repoList');
  
  if (!list) {
    console.error('❌ ERRO: Elemento repoList não encontrado!');
    addSimpleLog('❌ ERRO: Elemento repoList não encontrado!', 'error');
    return;
  }
  
  console.log('✅ repoList element found');
  
  list.innerHTML = '';
  list.style.display = 'block';
  list.style.visibility = 'visible';
  
  if (repos.length === 0) {
    console.log('📭 No repos to display');
    list.innerHTML = `
      <div style="padding: 40px 20px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
        <div style="color: var(--text-secondary); font-size: 1.1rem;">
          Nenhum repositório encontrado
        </div>
      </div>
    `;
    return;
  }
  
  console.log('✅ Rendering', repos.length, 'repositories');
  
  // Add prominent header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 15px 20px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 2px solid var(--primary-active);
    position: sticky;
    top: 0;
    z-index: 10;
  `;
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.5rem;">📦</span>
      <span>${repos.length} Repositórios Disponíveis</span>
    </div>
    <div style="font-size: 0.875rem; opacity: 0.9; margin-top: 5px;">
      👆 Clique em um repositório abaixo para selecionar
    </div>
  `;
  list.appendChild(header);
  
  // Add repos
  repos.forEach((repo, index) => {
    const item = document.createElement('div');
    item.className = 'repo-item';
    item.style.cssText = `
      display: block !important;
      visibility: visible !important;
      padding: 15px 20px !important;
      border-bottom: 1px solid var(--border-default) !important;
      cursor: pointer !important;
      background: var(--bg-subtle) !important;
      transition: all 0.2s ease !important;
    `;
    
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          min-width: 30px;
          height: 30px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        ">${index + 1}</div>
        <div style="flex: 1;">
          <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 3px;">
            ${repo.name}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary); font-family: monospace;">
            ${repo.url}
          </div>
        </div>
        <button class="delete-repo-btn" data-repo-name="${repo.name}" style="
          background: var(--error);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 5px;
        " title="Excluir repositório ${repo.name}">
          🗑️ Excluir
        </button>
      </div>
    `;
    
    item.dataset.url = repo.url;
    item.title = `Clique para selecionar: ${repo.name}`;
    
    // Add delete button event listener
    const deleteBtn = item.querySelector('.delete-repo-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent selecting the repo when clicking delete
        deleteRepository(repo.name);
      });
      
      deleteBtn.addEventListener('mouseenter', () => {
        deleteBtn.style.background = '#dc2626';
        deleteBtn.style.transform = 'scale(1.05)';
      });
      
      deleteBtn.addEventListener('mouseleave', () => {
        deleteBtn.style.background = 'var(--error)';
        deleteBtn.style.transform = 'scale(1)';
      });
    }
    
    item.addEventListener('click', () => {
      console.log('🎯 Repository clicked:', repo.name);
      
      document.querySelectorAll('.repo-item').forEach(i => {
        i.style.background = 'var(--bg-subtle)';
        i.style.borderLeft = 'none';
      });
      
      item.style.background = 'var(--info-bg)';
      item.style.borderLeft = '4px solid var(--primary)';
      
      appState.selectedRepo = repo;
      console.log('✅ Selected repo set in appState:', appState.selectedRepo);
      
      const connectBtn = document.getElementById('connectRepoBtn');
      if (connectBtn) {
        connectBtn.disabled = false;
        console.log('✅ Connect button enabled');
      } else {
        console.error('❌ Connect button not found!');
      }
      
      const hint = document.getElementById('connectHint');
      if (hint) {
        hint.innerHTML = `✅ <strong>Selecionado:</strong> ${repo.name} - Clique no botão abaixo para conectar`;
        hint.style.color = 'var(--success)';
      }
      
      updatePublishButton();
      addSimpleLog(`✓ Repositório selecionado: ${repo.name}`, 'success');
    });
    
    item.addEventListener('mouseenter', () => {
      if (!item.style.borderLeft.includes('4px')) {
        item.style.background = 'var(--bg-hover)';
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (!item.style.borderLeft.includes('4px')) {
        item.style.background = 'var(--bg-subtle)';
      }
    });
    
    list.appendChild(item);
  });
  
  addSimpleLog(`✓ ${repos.length} repositórios exibidos na lista`, 'success');
}

function filterRepos(query) {
  const filtered = allRepos.filter(repo => 
    repo.name.toLowerCase().includes(query.toLowerCase())
  );
  displayRepos(filtered);
}

function showScopeInstructions(command) {
  const instructions = document.createElement('div');
  instructions.id = 'scopeInstructions';
  instructions.className = 'validation-error';
  instructions.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 2000;
    background: var(--bg-elevated);
    border: 2px solid var(--primary);
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  `;
  
  instructions.innerHTML = `
    <div class="validation-error-header" style="background: var(--primary); color: white;">
      <span class="validation-error-icon">🔐</span>
      <h4 style="color: white; margin: 0;">Como Autorizar a Permissão "delete_repo"</h4>
      <button class="close-btn" onclick="document.getElementById('scopeInstructions').remove()" style="color: white;">×</button>
    </div>
    <div class="validation-error-body" style="padding: 30px;">
      <h3 style="margin-top: 0; color: var(--primary);">📋 Passo a Passo:</h3>
      
      <div style="background: var(--bg-subtle); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">1. Abra o Terminal (CMD ou PowerShell)</p>
        <p style="margin: 0 0 10px 0;">2. Cole e execute este comando:</p>
        <div style="background: var(--bg-base); padding: 15px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; color: var(--success); margin-bottom: 10px; position: relative;">
          <code>${command}</code>
          <button onclick="navigator.clipboard.writeText('${command}'); this.textContent='✓ Copiado!'; setTimeout(() => this.textContent='📋 Copiar', 2000)" 
                  style="position: absolute; top: 10px; right: 10px; padding: 5px 10px; font-size: 0.75rem;">
            📋 Copiar
          </button>
        </div>
        <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">
          Pressione Enter para executar
        </p>
      </div>
      
      <div style="background: var(--info-bg); padding: 20px; border-radius: 8px; border-left: 4px solid var(--info); margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: var(--info);">3. O que vai acontecer:</p>
        <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
          <li>O navegador vai abrir automaticamente</li>
          <li>Você verá uma página do GitHub pedindo autorização</li>
          <li>Clique em "Authorize github" (Autorizar)</li>
          <li>Pronto! A permissão será concedida</li>
        </ul>
      </div>
      
      <div style="background: var(--success-bg); padding: 20px; border-radius: 8px; border-left: 4px solid var(--success); margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: var(--success);">4. Depois de autorizar:</p>
        <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
          <li>Volte para o Lynx Publisher</li>
          <li>Tente excluir o repositório novamente</li>
          <li>Agora deve funcionar! ✅</li>
        </ul>
      </div>
      
      <div style="background: var(--warning-bg); padding: 15px; border-radius: 8px; border-left: 4px solid var(--warning);">
        <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">
          <strong style="color: var(--warning);">⚠️ Nota:</strong> Você só precisa fazer isso uma vez. Depois, poderá excluir repositórios sem problemas.
        </p>
      </div>
      
      <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
        <button onclick="navigator.clipboard.writeText('${command}'); alert('Comando copiado! Cole no terminal.')" class="primary">
          📋 Copiar Comando
        </button>
        <button onclick="document.getElementById('scopeInstructions').remove()" class="secondary">
          Fechar
        </button>
      </div>
    </div>
  `;
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1999;
  `;
  backdrop.onclick = () => {
    instructions.remove();
    backdrop.remove();
  };
  
  document.body.appendChild(backdrop);
  document.body.appendChild(instructions);
  
  setTimeout(() => {
    instructions.classList.add('show');
  }, 10);
}

async function deleteRepository(repoName) {
  console.log('🗑️ deleteRepository called for:', repoName);
  
  // Check if logged in first
  if (appState.auth.status !== AUTH_STATUS.LOGGED_IN) {
    showValidationError({
      valid: false,
      message: 'Login necessário',
      detail: 'Você precisa estar logado no GitHub para excluir repositórios.',
      actions: [{
        label: 'Fazer Login',
        action: () => {
          hideValidationError();
          document.getElementById('loginBtn').click();
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
    return;
  }
  
  // Show confirmation dialog
  const confirmed = confirm(
    `⚠️ ATENÇÃO: Você está prestes a EXCLUIR PERMANENTEMENTE o repositório "${repoName}"!\n\n` +
    `Esta ação:\n` +
    `• Excluirá o repositório do GitHub\n` +
    `• Apagará TODOS os commits e histórico\n` +
    `• NÃO pode ser desfeita\n\n` +
    `Tem certeza que deseja continuar?`
  );
  
  if (!confirmed) {
    console.log('❌ Deletion cancelled by user');
    addSimpleLog('Exclusão cancelada', 'info');
    return;
  }
  
  // Second confirmation for safety
  const doubleConfirm = confirm(
    `🚨 ÚLTIMA CONFIRMAÇÃO!\n\n` +
    `Digite o nome do repositório para confirmar: "${repoName}"\n\n` +
    `Você realmente deseja excluir "${repoName}" PERMANENTEMENTE?`
  );
  
  if (!doubleConfirm) {
    console.log('❌ Deletion cancelled by user (second confirmation)');
    addSimpleLog('Exclusão cancelada', 'info');
    return;
  }
  
  console.log('✅ User confirmed deletion');
  addSimpleLog(`Excluindo repositório "${repoName}"...`, 'warning');
  
  try {
    const result = await window.electronAPI.deleteRepo(repoName);
    
    if (result.success) {
      console.log('✅ Repository deleted successfully');
      addSimpleLog(`✓ Repositório "${repoName}" excluído com sucesso`, 'success');
      
      // Remove from cache
      allRepos = allRepos.filter(repo => repo.name !== repoName);
      lastRepoLoad = Date.now();
      
      // Refresh display
      displayRepos(allRepos);
      
      // Clear selection if deleted repo was selected
      if (appState.selectedRepo && appState.selectedRepo.name === repoName) {
        appState.selectedRepo = null;
        const connectBtn = document.getElementById('connectRepoBtn');
        if (connectBtn) {
          connectBtn.disabled = true;
        }
        updatePublishButton();
      }
      
      // Show success message
      showValidationError({
        valid: false,
        message: '✅ Repositório excluído',
        detail: `O repositório "${repoName}" foi excluído permanentemente do GitHub.`,
        actions: [{
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
    } else if (result.needsScope) {
      // Special handling for missing delete_repo scope
      console.log('⚠️ Missing delete_repo scope');
      addSimpleLog('✗ Permissão "delete_repo" necessária', 'error');
      
      showValidationError({
        valid: false,
        message: '🔐 Permissão Necessária',
        detail: `Para excluir repositórios, você precisa autorizar a permissão "delete_repo".\n\nClique no botão abaixo para abrir o terminal e executar o comando automaticamente.`,
        actions: [{
          label: '🚀 Abrir Terminal e Autorizar',
          action: async () => {
            hideValidationError();
            addSimpleLog('Abrindo terminal para autorização...', 'info');
            
            const authResult = await window.electronAPI.requestDeleteScope();
            
            if (authResult.success) {
              addSimpleLog('✓ Terminal aberto! Complete a autorização no navegador.', 'success');
              
              showValidationError({
                valid: false,
                message: '✅ Terminal Aberto',
                detail: 'O terminal foi aberto e o comando está sendo executado.\n\n1. O navegador vai abrir automaticamente\n2. Clique em "Authorize github"\n3. Volte aqui e tente excluir novamente',
                actions: [{
                  label: 'Tentar Excluir Novamente',
                  action: () => {
                    hideValidationError();
                    deleteRepository(repoName);
                  }
                }, {
                  label: 'Cancelar',
                  action: () => hideValidationError()
                }]
              });
            } else {
              addSimpleLog('✗ ' + authResult.message, 'error');
            }
          }
        }, {
          label: 'Cancelar',
          action: () => hideValidationError()
        }]
      });
    } else {
      throw new Error(result.message || 'Erro ao excluir repositório');
    }
  } catch (error) {
    console.error('❌ Error deleting repository:', error);
    addSimpleLog(`✗ Erro ao excluir: ${error.message}`, 'error');
    
    const errorDetail = result?.error || error.message || 'Erro desconhecido';
    
    showValidationError({
      valid: false,
      message: 'Erro ao excluir repositório',
      detail: `${result?.message || error.message}\n\nDetalhes técnicos: ${errorDetail}`,
      actions: [{
        label: 'Ver Detalhes no Console',
        action: () => {
          console.log('=== DETALHES DO ERRO ===');
          console.log('Repo name:', repoName);
          console.log('Error:', error);
          console.log('Result:', result);
          alert('Detalhes do erro foram impressos no console (F12)');
        }
      }, {
        label: 'Tentar Novamente',
        action: () => {
          hideValidationError();
          deleteRepository(repoName);
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
  }
}

async function connectExistingRepo() {
  console.log('🔗 connectExistingRepo() called');
  console.log('Project:', appState.project);
  console.log('Selected repo:', appState.selectedRepo);
  console.log('Auth status:', appState.auth.status);
  
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    console.log('❌ Validation failed:', validation);
    showValidationError(validation);
    return;
  }
  
  if (!appState.selectedRepo) {
    console.log('❌ No repo selected');
    showValidationError({
      valid: false,
      message: 'Selecione um repositório da lista',
      actions: []
    });
    return;
  }
  
  console.log('✅ Validation passed, connecting...');
  addSimpleLog('Conectando ao repositório...', 'info');
  
  const result = await window.electronAPI.connectExistingRepo({
    projectPath: appState.project.path,
    repoUrl: appState.selectedRepo.url
  });
  
  if (result.success) {
    addSimpleLog('✓ Repositório conectado', 'success');
    appState.project.hasRemote = true;
    appState.project.remoteInfo = { exists: true, fullName: appState.selectedRepo.name };
    updateStatusItem('statusRemote', true);
    document.getElementById('quickActions').style.display = 'grid';
    updatePublishButton();
  } else {
    showError(result);
  }
}

async function publishProject() {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  
  if (activeTab === 'new') {
    await createNewRepo();
  } else {
    await connectExistingRepo();
  }
}

async function createNewRepo() {
  console.log('🚀 createNewRepo called');
  console.log('Project:', appState.project);
  console.log('Auth status:', appState.auth.status);
  
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    console.log('❌ Validation failed:', validation);
    showValidationError(validation);
    return;
  }
  
  const repoName = document.getElementById('repoName').value.trim();
  const isPrivate = document.getElementById('isPrivate').checked;
  
  if (!repoName) {
    showValidationError({
      valid: false,
      message: 'Nome do repositório é obrigatório',
      detail: 'Digite um nome para o repositório no campo acima.',
      actions: [{
        label: 'OK',
        action: () => {
          hideValidationError();
          document.getElementById('repoName').focus();
        }
      }]
    });
    return;
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(repoName)) {
    showValidationError({
      valid: false,
      message: 'Nome inválido',
      detail: 'O nome do repositório só pode conter letras, números, hífens (-) e underscores (_).',
      actions: [{
        label: 'OK',
        action: () => {
          hideValidationError();
          document.getElementById('repoName').focus();
        }
      }]
    });
    return;
  }
  
  const btn = document.getElementById('createNewRepoBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 3px;"></span> Criando...';
  }
  
  addSimpleLog(`Criando repositório "${repoName}"...`, 'info');
  
  try {
    const result = await window.electronAPI.createRepo({
      projectPath: appState.project.path,
      repoName,
      isPrivate
    });
    
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🚀 Criar e Publicar Repositório';
    }
    
    if (result.success) {
      addSimpleLog('✓ Repositório criado e publicado!', 'success');
      appState.project.hasRemote = true;
      appState.project.remoteInfo = { exists: true, fullName: repoName };
      updateStatusItem('statusRemote', true);
      document.getElementById('quickActions').style.display = 'grid';
      updatePublishButton();
      
      document.getElementById('repoName').value = '';
      document.getElementById('isPrivate').checked = false;
      
      showValidationError({
        valid: false,
        message: '✅ Repositório criado com sucesso!',
        detail: `O repositório "${repoName}" foi criado no GitHub e conectado ao seu projeto.`,
        actions: [{
          label: 'Ver no GitHub',
          action: () => {
            window.electronAPI.openExternal(`https://github.com/${appState.auth.user}/${repoName}`);
            hideValidationError();
          }
        }, {
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
    } else {
      addSimpleLog('✗ ' + result.message, 'error');
      showValidationError({
        valid: false,
        message: 'Erro ao criar repositório',
        detail: result.message || 'Ocorreu um erro desconhecido.',
        actions: [{
          label: 'Tentar Novamente',
          action: () => {
            hideValidationError();
            createNewRepo();
          }
        }, {
          label: 'Cancelar',
          action: () => hideValidationError()
        }]
      });
    }
  } catch (error) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🚀 Criar e Publicar Repositório';
    }
    addSimpleLog('✗ Erro: ' + error.message, 'error');
    showValidationError({
      valid: false,
      message: 'Erro ao criar repositório',
      detail: error.message || 'Ocorreu um erro desconhecido.',
      actions: [{
        label: 'OK',
        action: () => hideValidationError()
      }]
    });
  }
}

// ========== QUICK ACTIONS ==========
async function quickPush() {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addSimpleLog('Enviando alterações...', 'info');
  
  const result = await window.electronAPI.gitPush({
    projectPath: appState.project.path,
    force: false
  });
  
  if (result.success) {
    addSimpleLog('✓ Push realizado', 'success');
  } else {
    showError(result);
  }
}

async function quickPull() {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addSimpleLog('Sincronizando...', 'info');
  
  const result = await window.electronAPI.gitPull(appState.project.path);
  
  if (result.success) {
    addSimpleLog('✓ Pull realizado', 'success');
  } else {
    showError(result);
  }
}

function openGithub() {
  if (!appState.project || !appState.project.remoteInfo) return;
  
  const url = appState.project.remoteInfo.url.replace('.git', '').replace('git@github.com:', 'https://github.com/');
  require('electron').shell.openExternal(url);
  addSimpleLog('Abrindo GitHub no navegador...', 'info');
}

function goToSection(section) {
  document.querySelector(`[data-section="${section}"]`).click();
}

// ========== ERROR HANDLING ==========
function showError(result, panelId = 'errorPanel') {
  const panel = document.getElementById(panelId);
  
  if (!result.error) {
    // Simple error without parsed structure
    addSimpleLog(result.message || 'Erro desconhecido', 'error');
    return;
  }
  
  const error = result.error;
  
  // Update error panel
  document.getElementById(panelId === 'errorPanel' ? 'errorSummary' : 'gitErrorSummary').textContent = error.summary;
  document.getElementById(panelId === 'errorPanel' ? 'errorCause' : 'gitErrorCause').textContent = error.humanCause;
  document.getElementById(panelId === 'errorPanel' ? 'errorImpact' : 'gitErrorImpact').textContent = error.impact;
  document.getElementById(panelId === 'errorPanel' ? 'errorTechnical' : 'gitErrorTechnical').textContent = error.technicalDetails;
  
  // Create action buttons
  const actionsContainer = document.getElementById(panelId === 'errorPanel' ? 'errorActions' : 'gitErrorActions');
  actionsContainer.innerHTML = '';
  
  error.suggestedActions.forEach(action => {
    const btn = document.createElement('button');
    btn.textContent = action.label;
    
    if (action.primary) {
      btn.className = 'primary';
    } else if (action.danger) {
      btn.className = 'danger';
    } else {
      btn.className = 'secondary';
    }
    
    btn.addEventListener('click', () => handleErrorAction(action.action, panelId));
    actionsContainer.appendChild(btn);
  });
  
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Add to log
  addSimpleLog(`✗ ${error.summary}`, 'error');
}

async function handleErrorAction(action, panelId) {
  const panel = document.getElementById(panelId);
  
  // Handle UI actions
  if (action === 'showDetails') {
    const details = panel.querySelector('.error-details');
    details.open = true;
    return;
  }
  
  if (action === 'reauth') {
    document.getElementById('loginBtn').click();
    panel.style.display = 'none';
    return;
  }
  
  if (action === 'goToPublish') {
    goToSection('publish');
    panel.style.display = 'none';
    return;
  }
  
  if (action === 'goToCommit') {
    goToSection('git');
    panel.style.display = 'none';
    return;
  }
  
  if (action === 'gitAdd') {
    goToSection('git');
    panel.style.display = 'none';
    return;
  }
  
  if (action === 'gitStatus') {
    goToSection('git');
    document.getElementById('gitStatusBtn').click();
    panel.style.display = 'none';
    return;
  }
  
  if (action === 'listBranches') {
    goToSection('branches');
    panel.style.display = 'none';
    return;
  }
  
  if (action === 'retry') {
    panel.style.display = 'none';
    addSimpleLog('Tente a operação novamente', 'info');
    return;
  }
  
  // Handle auto-fix actions
  if (!appState.project) {
    addSimpleLog('Nenhum projeto selecionado', 'error');
    return;
  }
  
  addSimpleLog(`Executando: ${action}...`, 'info');
  panel.style.display = 'none';
  
  const result = await window.electronAPI.executeAutoFix({
    action,
    projectPath: appState.project.path,
    params: {}
  });
  
  if (result.success) {
    addSimpleLog(`✓ ${result.message}`, 'success');
    
    if (result.steps) {
      result.steps.forEach(step => {
        addSimpleLog(`  → ${step.step}`, 'info');
      });
    }
  } else {
    addSimpleLog(`✗ ${result.message}`, 'error');
    
    if (result.needsManualResolve) {
      addSimpleLog('Resolução manual necessária', 'warning');
    }
  }
}

// ========== LOGGING ==========
function addSimpleLog(message, type = 'info') {
  const log = document.getElementById('simpleLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'log-icon';
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : '→';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  entry.appendChild(icon);
  entry.appendChild(text);
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  
  // Limit to 30 entries
  while (log.children.length > 30) {
    log.removeChild(log.firstChild);
  }
}

function addGitLog(message, type = 'info') {
  const log = document.getElementById('gitSimpleLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'log-icon';
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : '→';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  entry.appendChild(icon);
  entry.appendChild(text);
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  
  while (log.children.length > 30) {
    log.removeChild(log.firstChild);
  }
}

function clearSimpleLog() {
  document.getElementById('simpleLog').innerHTML = '';
}

function clearGitLog() {
  document.getElementById('gitSimpleLog').innerHTML = '';
}

function clearIgnoreLog() {
  document.getElementById('ignoreSimpleLog').innerHTML = '';
}

function clearBranchLog() {
  document.getElementById('branchSimpleLog').innerHTML = '';
}

// ========== WARNINGS ==========
function showNoProjectWarnings() {
  const warnings = ['gitNoProject', 'gitignoreNoProject', 'branchesNoProject', 'noProjectWarning'];
  warnings.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });
  
  const gitInfo = document.getElementById('gitProjectInfo');
  if (gitInfo) gitInfo.style.display = 'none';
}

function hideNoProjectWarnings() {
  const warnings = ['gitNoProject', 'gitignoreNoProject', 'branchesNoProject', 'noProjectWarning'];
  warnings.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// ========== GIT OPERATIONS (continued in next part) ==========

// ========== GIT OPERATIONS ==========
async function loadGitInfo() {
  if (!appState.project) {
    document.getElementById('gitProjectInfo').style.display = 'none';
    return;
  }
  
  const infoCard = document.getElementById('gitProjectInfo');
  infoCard.style.display = 'block';
  
  // Project info
  const projectName = appState.project.path.split(/[/\\]/).pop();
  document.getElementById('gitInfoProjectName').textContent = projectName;
  document.getElementById('gitInfoProjectPath').textContent = appState.project.path;
  
  // Repo info
  if (appState.project.hasRemote && appState.project.remoteInfo) {
    document.getElementById('gitInfoRepoName').textContent = appState.project.remoteInfo.fullName || 'Conectado';
    document.getElementById('gitInfoRepoUrl').textContent = appState.project.remoteInfo.url || '-';
  } else {
    document.getElementById('gitInfoRepoName').textContent = 'Não conectado';
    document.getElementById('gitInfoRepoUrl').textContent = 'Configure na aba Publicar';
  }
  
  // Get last commit
  try {
    const commitResult = await window.electronAPI.getLastCommit(appState.project.path);
    if (commitResult.success && commitResult.commit) {
      const commit = commitResult.commit;
      document.getElementById('gitInfoLastCommit').textContent = 
        `${commit.message} (${commit.author}, ${commit.date})`;
    } else {
      document.getElementById('gitInfoLastCommit').textContent = 'Nenhum commit ainda';
    }
  } catch (error) {
    document.getElementById('gitInfoLastCommit').textContent = 'Erro ao carregar';
  }
  
  // Get current branch
  try {
    const branchResult = await window.electronAPI.getCurrentBranch(appState.project.path);
    if (branchResult.success) {
      document.getElementById('gitInfoBranch').textContent = branchResult.branch || 'main';
    } else {
      document.getElementById('gitInfoBranch').textContent = '-';
    }
  } catch (error) {
    document.getElementById('gitInfoBranch').textContent = 'Erro ao carregar';
  }
  
  // Get sync status
  if (appState.project.hasRemote) {
    try {
      const syncResult = await window.electronAPI.getSyncStatus(appState.project.path);
      const syncEl = document.getElementById('gitInfoSync');
      
      if (syncResult.success) {
        syncEl.className = 'git-info-value-small';
        
        if (syncResult.ahead > 0 && syncResult.behind > 0) {
          syncEl.textContent = `Divergente (↑${syncResult.ahead} ↓${syncResult.behind})`;
          syncEl.classList.add('diverged');
        } else if (syncResult.ahead > 0) {
          syncEl.textContent = `${syncResult.ahead} commit(s) à frente`;
          syncEl.classList.add('ahead');
        } else if (syncResult.behind > 0) {
          syncEl.textContent = `${syncResult.behind} commit(s) atrás`;
          syncEl.classList.add('behind');
        } else {
          syncEl.textContent = 'Sincronizado ✓';
          syncEl.classList.add('synced');
        }
      } else {
        syncEl.textContent = 'Não disponível';
      }
    } catch (error) {
      document.getElementById('gitInfoSync').textContent = 'Erro ao verificar';
    }
  } else {
    document.getElementById('gitInfoSync').textContent = 'Sem repositório remoto';
  }
}

function setupGitEventListeners() {
  // Add type toggle
  document.querySelectorAll('input[name="addType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const specificInput = document.getElementById('specificFileInput');
      specificInput.style.display = e.target.value === 'specific' ? 'block' : 'none';
    });
  });
  
  // Commit type change
  document.getElementById('commitType').addEventListener('change', (e) => {
    const messageInput = document.getElementById('commitMessage');
    if (e.target.value === 'custom') {
      messageInput.placeholder = 'mensagem completa do commit';
    } else {
      messageInput.placeholder = 'descrição das alterações';
    }
  });
  
  // Git operations
  document.getElementById('gitInitBtn').addEventListener('click', gitInit);
  document.getElementById('gitStatusBtn').addEventListener('click', gitStatus);
  document.getElementById('gitAddBtn').addEventListener('click', gitAdd);
  document.getElementById('gitCommitBtn').addEventListener('click', gitCommit);
  document.getElementById('gitPushBtn').addEventListener('click', gitPush);
  document.getElementById('gitPullBtn').addEventListener('click', gitPull);
  
  // Git info refresh
  document.getElementById('refreshGitInfoBtn')?.addEventListener('click', loadGitInfo);
}

async function gitInit() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addGitLog('Inicializando Git...', 'info');
  const result = await window.electronAPI.gitInit(appState.project.path);
  
  if (result.success) {
    addGitLog('✓ Git inicializado', 'success');
    appState.project.hasGit = true;
    updateStatusItem('statusGit', true);
  } else {
    addGitLog(result.message, 'error');
    showError(result, 'gitErrorPanel');
  }
}

async function gitStatus() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addGitLog('Obtendo status...', 'info');
  const result = await window.electronAPI.gitStatus(appState.project.path);
  
  if (result.success) {
    const output = document.getElementById('gitStatusOutput');
    output.style.display = 'block';
    output.textContent = result.output;
    addGitLog('✓ Status obtido', 'success');
  } else {
    addGitLog(result.message, 'error');
    showError(result, 'gitErrorPanel');
  }
}

async function gitAdd() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const addType = document.querySelector('input[name="addType"]:checked').value;
  let files = '.';
  
  if (addType === 'specific') {
    files = document.getElementById('specificFile').value.trim();
    if (!files) {
      addGitLog('Digite o caminho do arquivo', 'error');
      return;
    }
  }
  
  addGitLog(`Adicionando: ${files}...`, 'info');
  const result = await window.electronAPI.gitAdd({
    projectPath: appState.project.path,
    files
  });
  
  if (result.success) {
    addGitLog('✓ Arquivos adicionados', 'success');
  } else {
    addGitLog(result.message, 'error');
    showError(result, 'gitErrorPanel');
  }
}

async function gitCommit() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const commitType = document.getElementById('commitType').value;
  const messageText = document.getElementById('commitMessage').value.trim();
  
  if (!messageText) {
    addGitLog('Digite uma mensagem de commit', 'error');
    return;
  }
  
  let fullMessage;
  if (commitType === 'custom') {
    fullMessage = messageText;
  } else {
    fullMessage = `${commitType}: ${messageText}`;
  }
  
  addGitLog(`Criando commit...`, 'info');
  const result = await window.electronAPI.gitCommit({
    projectPath: appState.project.path,
    message: fullMessage
  });
  
  if (result.success) {
    addGitLog('✓ Commit criado', 'success');
    document.getElementById('commitMessage').value = '';
    loadGitInfo();
  } else {
    addGitLog(result.message, 'error');
    showError(result, 'gitErrorPanel');
  }
}

async function gitPush() {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const force = document.getElementById('forcePush').checked;
  
  if (force && !confirm('⚠️ Force push pode sobrescrever alterações remotas. Continuar?')) {
    addGitLog('Force push cancelado', 'info');
    return;
  }
  
  addGitLog(force ? 'Enviando (force)...' : 'Enviando...', 'info');
  const result = await window.electronAPI.gitPush({
    projectPath: appState.project.path,
    force
  });
  
  if (result.success) {
    addGitLog('✓ Push realizado', 'success');
    loadGitInfo();
  } else {
    showError(result, 'gitErrorPanel');
  }
}

async function gitPull() {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addGitLog('Sincronizando...', 'info');
  const result = await window.electronAPI.gitPull(appState.project.path);
  
  if (result.success) {
    addGitLog('✓ Pull realizado', 'success');
    loadGitInfo();
  } else {
    showError(result, 'gitErrorPanel');
  }
}

// ========== GITIGNORE ==========
async function loadGitignore() {
  if (!appState.project) return;
  
  const result = await window.electronAPI.getGitignore(appState.project.path);
  if (result.success) {
    document.getElementById('gitignoreContent').value = result.content;
  }
}

async function saveGitignore() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const content = document.getElementById('gitignoreContent').value;
  
  addLog('ignoreSimpleLog', 'Salvando .gitignore...', 'info');
  const result = await window.electronAPI.saveGitignore({
    projectPath: appState.project.path,
    content
  });
  
  if (result.success) {
    addLog('ignoreSimpleLog', '✓ .gitignore salvo', 'success');
  } else {
    addLog('ignoreSimpleLog', result.message, 'error');
  }
}

async function addCommonPatterns() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addLog('ignoreSimpleLog', 'Adicionando padrões...', 'info');
  const result = await window.electronAPI.addCommonPatterns(appState.project.path);
  
  if (result.success) {
    document.getElementById('gitignoreContent').value = result.content;
    addLog('ignoreSimpleLog', '✓ Padrões adicionados', 'success');
  } else {
    addLog('ignoreSimpleLog', result.message, 'error');
  }
}

function addLog(logId, message, type) {
  const log = document.getElementById(logId);
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'log-icon';
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : '→';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  entry.appendChild(icon);
  entry.appendChild(text);
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  
  while (log.children.length > 30) {
    log.removeChild(log.firstChild);
  }
}

// ========== BRANCHES ==========
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
    addLog('branchSimpleLog', result.message, 'error');
  }
}

function displayBranches(branches, currentBranch) {
  const list = document.getElementById('branchList');
  list.innerHTML = '';
  
  branches.forEach(branch => {
    const item = document.createElement('li');
    item.className = 'branch-item';
    if (branch === currentBranch) {
      item.classList.add('current');
    }
    
    const name = document.createElement('span');
    name.textContent = branch + (branch === currentBranch ? ' (atual)' : '');
    
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
    
    item.appendChild(name);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

async function createBranch() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const branchName = document.getElementById('newBranchName').value.trim();
  if (!branchName) {
    addLog('branchSimpleLog', 'Digite um nome para a branch', 'error');
    return;
  }
  
  addLog('branchSimpleLog', `Criando branch ${branchName}...`, 'info');
  const result = await window.electronAPI.createBranch({
    projectPath: appState.project.path,
    branchName
  });
  
  if (result.success) {
    addLog('branchSimpleLog', '✓ Branch criada', 'success');
    document.getElementById('newBranchName').value = '';
    refreshBranches();
  } else {
    addLog('branchSimpleLog', result.message, 'error');
  }
}

async function switchToBranch(branchName) {
  addLog('branchSimpleLog', `Trocando para ${branchName}...`, 'info');
  const result = await window.electronAPI.switchBranch({
    projectPath: appState.project.path,
    branchName
  });
  
  if (result.success) {
    addLog('branchSimpleLog', '✓ Branch trocada', 'success');
    refreshBranches();
  } else {
    addLog('branchSimpleLog', result.message, 'error');
  }
}

async function pushBranch(branchName) {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addLog('branchSimpleLog', `Enviando ${branchName}...`, 'info');
  const result = await window.electronAPI.pushBranch({
    projectPath: appState.project.path,
    branchName
  });
  
  if (result.success) {
    addLog('branchSimpleLog', '✓ Branch enviada', 'success');
  } else {
    addLog('branchSimpleLog', result.message, 'error');
  }
}


// ========== GUIDED PUBLISH MANAGER ==========
const guidedPublishState = {
  currentStep: 1,
  steps: {
    1: { id: 'login', status: 'pending', data: null },
    2: { id: 'project', status: 'pending', data: null },
    3: { id: 'git', status: 'pending', data: null },
    4: { id: 'repo', status: 'pending', data: null },
    5: { id: 'commit', status: 'pending', data: null },
    6: { id: 'publish', status: 'pending', data: null },
    7: { id: 'advanced', status: 'collapsed', data: null }
  },
  advancedMode: false
};

let guidedStepper = null;

function initGuidedPublish() {
  const stepDefinitions = [
    {
      id: 'login',
      title: '1. Login GitHub',
      description: 'Conecte-se ao GitHub (opcional mas recomendado)',
      renderContent: renderLoginStep,
      validate: validateLoginStep,
      primaryAction: 'Continuar'
    },
    {
      id: 'project',
      title: '2. Selecionar Projeto',
      description: 'Escolha a pasta ou ZIP do seu projeto',
      renderContent: renderProjectStep,
      validate: validateProjectStep,
      primaryAction: 'Avançar'
    },
    {
      id: 'git',
      title: '3. Verificar Git',
      description: 'Inicializar e configurar Git no projeto',
      renderContent: renderGitStep,
      validate: validateGitStep,
      primaryAction: 'Avançar'
    },
    {
      id: 'repo',
      title: '4. Repositório GitHub',
      description: 'Conectar ou criar repositório no GitHub',
      renderContent: renderRepoStep,
      validate: validateRepoStep,
      primaryAction: 'Avançar'
    },
    {
      id: 'commit',
      title: '5. Preparar Commit',
      description: 'Selecionar arquivos e criar commit',
      renderContent: renderCommitStep,
      validate: validateCommitStep,
      primaryAction: 'Avançar'
    },
    {
      id: 'publish',
      title: '6. Publicar',
      description: 'Enviar alterações para o GitHub',
      renderContent: renderPublishStep,
      validate: validatePublishStep,
      primaryAction: 'Concluir'
    }
  ];
  
  guidedStepper = new GuidedStepper('guidedStepperContainer');
  guidedStepper.init(stepDefinitions);
  
  guidedStepper.onStepChange = (step) => {
    addUnifiedLog(`Step ${step.index + 1}: ${step.title}`, 'step');
    updateGuidedState(step);
    updateProgressIndicator();
    updateProjectHealth();
    
    // Auto-load repositories when Step 4 is activated
    if (step.index === 3 && step.expanded) { // Step 4 (index 3)
      setTimeout(() => {
        if (appState.auth.status === AUTH_STATUS.LOGGED_IN && 
            !appState.project?.hasRemote) {
          loadGuidedRepositories();
        }
      }, 300); // Small delay to ensure DOM is ready
    }
  };
}

// Render functions para cada step
function renderLoginStep(data) {
  if (appState.auth.status === AUTH_STATUS.LOGGED_IN) {
    return `
      <div class="step-success-card">
        <div class="step-success-icon">✅</div>
        <div>
          <div class="step-info-title">Logado com sucesso</div>
          <div class="step-info-text">Conectado como @${appState.auth.user}</div>
        </div>
      </div>
      <div class="step-info-card">
        <div class="step-info-icon">ℹ️</div>
        <div class="step-info-content">
          <div class="step-info-text">
            Para fazer logout, use o botão no cabeçalho da página.
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="step-info-card">
      <div class="step-info-icon">ℹ️</div>
      <div class="step-info-content">
        <div class="step-info-title">Login opcional</div>
        <div class="step-info-text">
          Você pode continuar sem login, mas algumas funcionalidades 
          (criar repositório, push, pull) requerem autenticação no GitHub.
        </div>
      </div>
    </div>
    <button onclick="document.getElementById('loginBtn').click()" class="primary">
      Fazer Login no GitHub
    </button>
  `;
}

function renderProjectStep(data) {
  if (appState.project) {
    const projectName = appState.project.path.split(/[/\\]/).pop();
    return `
      <div class="step-success-card">
        <div class="step-success-icon">✅</div>
        <div>
          <div class="step-info-title">Projeto selecionado</div>
          <div class="step-info-text">${projectName}</div>
        </div>
      </div>
      <div class="step-data-grid">
        <div class="step-data-item">
          <div class="step-data-label">Nome</div>
          <div class="step-data-value">${projectName}</div>
        </div>
        <div class="step-data-item">
          <div class="step-data-label">Caminho</div>
          <div class="step-data-value">${appState.project.path}</div>
        </div>
      </div>
      <button onclick="document.getElementById('selectFolderBtn').click()" class="secondary">
        Trocar Projeto
      </button>
    `;
  }
  
  return `
    <div class="step-warning-card">
      <div class="step-warning-icon">⚠️</div>
      <div>
        <div class="step-info-title">Nenhum projeto selecionado</div>
        <div class="step-info-text">
          Selecione uma pasta ou arquivo ZIP contendo seu projeto.
        </div>
      </div>
    </div>
    <div class="button-group">
      <button onclick="document.getElementById('selectFolderBtn').click()" class="primary">
        📁 Selecionar Pasta
      </button>
      <button onclick="document.getElementById('selectZipBtn').click()" class="secondary">
        📦 Selecionar ZIP
      </button>
    </div>
  `;
}

function renderGitStep(data) {
  if (appState.project && appState.project.hasGit) {
    // Get detailed git info
    const branchStatus = appState.project.isMainBranch ? '✅ main' : 
                        appState.project.currentBranch ? `⚠️ ${appState.project.currentBranch}` : 
                        '⚠️ desconhecida';
    
    const remoteStatus = appState.project.hasRemote ? 
                        `✅ ${appState.project.remoteUrl || 'Configurado'}` : 
                        '❌ Não configurado';
    
    return `
      <div class="step-success-card">
        <div class="step-success-icon">✅</div>
        <div>
          <div class="step-info-title">Git inicializado</div>
          <div class="step-info-text">Repositório Git está configurado</div>
        </div>
      </div>
      
      <div class="step-data-grid">
        <div class="step-data-item">
          <div class="step-data-label">Status</div>
          <div class="step-data-value">✅ Git OK</div>
        </div>
        <div class="step-data-item">
          <div class="step-data-label">Branch</div>
          <div class="step-data-value">${branchStatus}</div>
        </div>
        <div class="step-data-item">
          <div class="step-data-label">Remote</div>
          <div class="step-data-value">${remoteStatus}</div>
        </div>
      </div>
      
      ${!appState.project.isMainBranch && appState.project.currentBranch ? `
        <div class="step-warning-card" style="margin-top: var(--space-4);">
          <div class="step-warning-icon">⚠️</div>
          <div>
            <div class="step-info-title">Branch não é "main"</div>
            <div class="step-info-text">
              Você está na branch "${appState.project.currentBranch}". 
              É recomendado usar a branch "main" para publicação.
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="button-group" style="margin-top: var(--space-4);">
        <button onclick="showGitStatus()" class="secondary">
          📊 Ver Status Detalhado
        </button>
        ${!appState.project.isMainBranch ? `
          <button onclick="switchToMainBranch()" class="secondary">
            🌿 Trocar para Main
          </button>
        ` : ''}
      </div>
    `;
  }
  
  return `
    <div class="step-warning-card">
      <div class="step-warning-icon">⚠️</div>
      <div>
        <div class="step-info-title">Git não inicializado</div>
        <div class="step-info-text">
          O projeto precisa ter um repositório Git inicializado.
        </div>
      </div>
    </div>
    <button onclick="initializeGit()" class="primary">
      🔧 Inicializar Git
    </button>
  `;
}

function renderRepoStep(data) {
  if (appState.project && appState.project.hasRemote) {
    const repoName = appState.project.remoteInfo?.fullName || appState.project.remoteUrl || 'Conectado';
    return `
      <div class="step-success-card">
        <div class="step-success-icon">✅</div>
        <div>
          <div class="step-info-title">Repositório conectado</div>
          <div class="step-info-text">${repoName}</div>
        </div>
      </div>
      <div class="button-group">
        <button onclick="openGithubRepo()" class="secondary">
          🌐 Abrir no GitHub
        </button>
        <button onclick="disconnectAndChangeRepo()" class="secondary">
          🔄 Trocar Repositório
        </button>
      </div>
    `;
  }
  
  // Check if user is logged in
  const isLoggedIn = appState.auth.status === AUTH_STATUS.LOGGED_IN;
  
  if (!isLoggedIn) {
    return `
      <div class="step-warning-card">
        <div class="step-warning-icon">⚠️</div>
        <div>
          <div class="step-info-title">Login necessário</div>
          <div class="step-info-text">
            Para conectar ou criar um repositório no GitHub, você precisa fazer login primeiro.
          </div>
        </div>
      </div>
      <div class="button-group">
        <button onclick="document.getElementById('loginBtn').click()" class="primary">
          🔑 Fazer Login no GitHub
        </button>
      </div>
    `;
  }
  
  // Render full repo UI
  return `
    <div class="tab-selector">
      <button class="tab-btn active" data-tab="guided-existing" onclick="switchGuidedRepoTab('existing')">
        Conectar Existente
      </button>
      <button class="tab-btn" data-tab="guided-new" onclick="switchGuidedRepoTab('new')">
        Criar Novo
      </button>
    </div>
    
    <div style="margin-bottom: 15px; padding: 10px; background: var(--info-bg); border-radius: 6px; border-left: 3px solid var(--info);">
      <div style="font-size: 0.875rem; color: var(--text-primary);">
        📝 <strong>Modo atual:</strong> <span id="guidedTabIndicator">Conectar a Repositório Existente</span>
      </div>
    </div>

    <!-- Tab: Conectar Existente -->
    <div class="tab-content active" id="guidedTabExisting">
      <div class="info-box" style="margin-bottom: 15px;">
        💡 <strong>Dica:</strong> Os repositórios aparecem abaixo. Clique em um para selecionar (fica azul).
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input type="text" id="guidedRepoSearch" placeholder="🔍 Buscar repositório..." class="search-input" style="flex: 1; margin: 0;">
        <button onclick="loadGuidedRepositories()" class="secondary" title="Recarregar lista">🔄 Carregar</button>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: var(--text-primary);">
          📦 Seus Repositórios GitHub:
        </label>
        <div class="repo-list-container" style="
          height: 300px !important;
          border: 2px solid var(--border-default) !important;
          border-radius: 8px !important;
          background: var(--bg-elevated) !important;
          overflow-y: auto !important;
        ">
          <div id="guidedRepoList" class="repo-list" style="
            display: block !important;
            width: 100% !important;
            min-height: 100% !important;
          ">
            <div style="padding: 40px 20px; text-align: center; color: var(--text-secondary);">
              <div style="font-size: 3rem; margin-bottom: 15px;">📦</div>
              <div style="font-size: 1.1rem; margin-bottom: 10px;">Clique em "Carregar" para ver seus repositórios</div>
            </div>
          </div>
        </div>
      </div>
      
      <button id="guidedConnectRepoBtn" class="primary large" disabled style="width: 100%;">
        🔗 Conectar Repositório Selecionado
      </button>
      <p class="btn-hint" style="text-align: center; margin-top: 10px;">
        ⬆️ Selecione um repositório da lista acima primeiro
      </p>
    </div>

    <!-- Tab: Criar Novo -->
    <div class="tab-content" id="guidedTabNew" style="display: none;">
      <div class="info-box" style="margin-bottom: 15px;">
        💡 <strong>Criar novo repositório:</strong> Digite um nome e clique em "Criar e Conectar" abaixo.
      </div>
      
      <div class="form-group">
        <label>Nome do repositório</label>
        <input type="text" id="guidedRepoName" placeholder="meu-projeto" style="font-size: 1rem;">
        <p class="btn-hint" style="text-align: left; margin-top: 5px; color: var(--text-tertiary);">
          Use apenas letras, números, hífens (-) e underscores (_)
        </p>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="guidedIsPrivate">
          <span>Repositório privado</span>
        </label>
      </div>
      
      <button id="guidedCreateNewRepoBtn" class="primary large" style="width: 100%; margin-top: 20px;" onclick="createGuidedRepo()">
        🚀 Criar e Conectar Repositório
      </button>
      <p class="btn-hint" style="text-align: center; margin-top: 10px;">
        Isso vai criar um novo repositório no GitHub e conectar ao seu projeto
      </p>
    </div>
  `;
}

function renderCommitStep(data) {
  return `
    <div class="step-info-card">
      <div class="step-info-icon">💾</div>
      <div class="step-info-content">
        <div class="step-info-title">Fazer Commit</div>
        <div class="step-info-text">
          Um commit salva suas alterações no histórico do Git. 
          Se você já fez todas as alterações que queria, faça o commit aqui.
        </div>
      </div>
    </div>
    
    <div style="margin: var(--space-4) 0;">
      <label style="display: block; font-weight: 600; margin-bottom: var(--space-2); color: var(--text-primary);">
        Mensagem do commit
      </label>
      <input 
        type="text" 
        id="guidedCommitMessage" 
        placeholder="Ex: Adiciona nova funcionalidade"
        style="width: 100%; padding: var(--space-3); border: 2px solid var(--border-default); border-radius: var(--radius-md); font-size: 1rem;"
      />
      <div style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: var(--space-2);">
        💡 Se não há alterações, pode pular direto para o Push
      </div>
    </div>
    
    <div class="button-group">
      <button onclick="makeGuidedCommit()" class="primary" id="guidedCommitBtn">
        💾 Fazer Commit
      </button>
      <button onclick="showGuidedGitStatus()" class="secondary">
        📊 Ver Alterações
      </button>
      <button onclick="if(guidedStepper) guidedStepper.goToNextStep(4)" class="secondary">
        ⏭️ Pular para Push
      </button>
    </div>
  `;
}

function renderPublishStep(data) {
  return `
    <div class="step-info-card">
      <div class="step-info-icon">⬆️</div>
      <div class="step-info-content">
        <div class="step-info-title">Enviar para o GitHub (Push)</div>
        <div class="step-info-text">
          O Push envia seus commits locais para o repositório no GitHub. 
          Clique no botão abaixo quando quiser enviar suas alterações.
        </div>
      </div>
    </div>
    
    <div style="padding: var(--space-4); background: var(--bg-subtle); border-radius: var(--radius-md); margin: var(--space-4) 0;">
      <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
        <strong>O que o Push faz:</strong><br>
        • Envia seus commits para o GitHub<br>
        • Sincroniza seu código local com o remoto<br>
        • Permite que outros vejam suas alterações
      </div>
    </div>
    
    <div class="button-group">
      <button onclick="makeGuidedPush()" class="primary" id="guidedPushBtn">
        ⬆️ Fazer Push
      </button>
      <button onclick="makeGuidedPull()" class="secondary">
        ⬇️ Fazer Pull (Baixar)
      </button>
    </div>
  `;
}

// Validations
async function validateLoginStep(data) {
  return { valid: true };
}

async function validateProjectStep(data) {
  if (!appState.project) {
    return {
      valid: false,
      message: 'Você precisa selecionar um projeto antes de continuar.'
    };
  }
  return { valid: true };
}

async function validateGitStep(data) {
  if (!appState.project || !appState.project.hasGit) {
    return {
      valid: false,
      message: 'Git precisa estar inicializado no projeto.'
    };
  }
  return { valid: true };
}

async function validateRepoStep(data) {
  if (!appState.project || !appState.project.hasRemote) {
    return {
      valid: false,
      message: 'Você precisa conectar ou criar um repositório no GitHub.'
    };
  }
  return { valid: true };
}

async function validateCommitStep(data) {
  return { valid: true };
}

async function validatePublishStep(data) {
  return { valid: true };
}

// Unified Log
function addUnifiedLog(message, type = 'info', stepNumber = null) {
  const logBody = document.getElementById('unifiedLogBody');
  if (!logBody) return;
  
  const entry = document.createElement('div');
  entry.className = `unified-log-entry ${type}-log`;
  
  const icon = type === 'step' ? '▶️' : 
               type === 'success' ? '✅' : 
               type === 'error' ? '❌' : 
               type === 'warning' ? '⚠️' : 'ℹ️';
  
  const time = new Date().toLocaleTimeString('pt-BR');
  
  entry.innerHTML = `
    <div class="unified-log-icon">${icon}</div>
    <div class="unified-log-content">
      ${stepNumber ? `<div class="unified-log-step">Step ${stepNumber}</div>` : ''}
      <div class="unified-log-message">${message}</div>
      <div class="unified-log-time">${time}</div>
    </div>
  `;
  
  logBody.appendChild(entry);
  logBody.scrollTop = logBody.scrollHeight;
  
  while (logBody.children.length > 50) {
    logBody.removeChild(logBody.firstChild);
  }
}

function clearUnifiedLog() {
  const logBody = document.getElementById('unifiedLogBody');
  if (logBody) {
    logBody.innerHTML = '';
  }
}

function updateGuidedState(step) {
  guidedPublishState.currentStep = step.index + 1;
  guidedPublishState.steps[step.index + 1].status = step.status;
  guidedPublishState.steps[step.index + 1].data = step.data;
}

function refreshGuidedStepper() {
  if (!guidedStepper) return;
  
  // Update step 1 (login)
  if (appState.auth.status === AUTH_STATUS.LOGGED_IN) {
    guidedStepper.updateStepStatus(0, 'completed', { username: appState.auth.user });
  }
  
  // Update step 2 (project)
  if (appState.project) {
    guidedStepper.updateStepStatus(1, 'completed', appState.project);
  }
  
  // Update step 3 (git)
  if (appState.project && appState.project.hasGit) {
    guidedStepper.updateStepStatus(2, 'completed', { hasGit: true });
  }
  
  // Update step 4 (repo)
  if (appState.project && appState.project.hasRemote) {
    guidedStepper.updateStepStatus(3, 'completed', { hasRemote: true });
  }
  
  // Refresh current step content
  const currentStep = guidedStepper.getCurrentStep();
  if (currentStep && currentStep.renderContent) {
    guidedStepper.updateStepContent(currentStep.index, currentStep.renderContent(currentStep.data));
  }
  
  // Update indicators
  updateProgressIndicator();
  updateProjectHealth();
}

function switchToPublishSection(tab) {
  switchToSection('publish');
  setTimeout(() => {
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (tabBtn) {
      tabBtn.click();
    }
  }, 100);
}

function switchToSection(sectionId) {
  const sidebarItem = document.querySelector(`.sidebar-item[data-section="${sectionId}"]`);
  if (sidebarItem) {
    sidebarItem.click();
  }
}

window.clearUnifiedLog = clearUnifiedLog;
window.initGuidedPublish = initGuidedPublish;
window.switchToPublishSection = switchToPublishSection;
window.switchToSection = switchToSection;


// ========== PROGRESS & HEALTH INDICATORS ==========

function updateProgressIndicator() {
  if (!guidedStepper) return;
  
  const steps = guidedStepper.getAllSteps();
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const currentStepIndex = guidedStepper.currentStepIndex;
  const totalSteps = steps.length;
  const percentage = Math.round((completedSteps / totalSteps) * 100);
  
  document.getElementById('currentStep').textContent = currentStepIndex + 1;
  document.getElementById('totalSteps').textContent = totalSteps;
  document.getElementById('progressBarFill').style.width = `${percentage}%`;
  document.getElementById('progressPercentage').textContent = `${percentage}%`;
  
  // Update connector line gradient
  const stepperEl = document.querySelector('.guided-stepper');
  if (stepperEl) {
    stepperEl.style.setProperty('--progress-line', `${percentage}%`);
  }
}

function updateProjectHealth() {
  const healthEl = document.getElementById('projectHealth');
  if (!healthEl) return;
  
  let status = 'needs-setup';
  let icon = '⚙️';
  let text = 'Needs Setup';
  
  if (!appState.project) {
    status = 'needs-setup';
    icon = '⚙️';
    text = 'Needs Setup';
  } else if (appState.project.hasRemote && appState.project.hasGit) {
    status = 'ready';
    icon = '✅';
    text = 'Ready to Publish';
  } else if (appState.project.hasGit) {
    status = 'in-progress';
    icon = '⏳';
    text = 'In Progress';
  } else {
    status = 'needs-setup';
    icon = '⚙️';
    text = 'Needs Setup';
  }
  
  healthEl.className = `project-health ${status}`;
  healthEl.querySelector('.health-icon').textContent = icon;
  healthEl.querySelector('.health-text').textContent = text;
}

function refreshAllIndicators() {
  updateProgressIndicator();
  updateProjectHealth();
  refreshGuidedStepper();
}


// ========== ADVANCED MODE ==========

function setupAdvancedMode() {
  const toggle = document.getElementById('advancedModeToggle');
  if (!toggle) return;
  
  toggle.addEventListener('change', (e) => {
    const isAdvanced = e.target.checked;
    guidedPublishState.advancedMode = isAdvanced;
    
    if (isAdvanced) {
      addUnifiedLog('Modo avançado ativado', 'info');
      // Show old sections in sidebar
      showAdvancedSections();
    } else {
      addUnifiedLog('Modo avançado desativado', 'info');
      // Hide old sections
      hideAdvancedSections();
    }
  });
}

function showAdvancedSections() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  // Add advanced sections if not present
  if (!document.querySelector('[data-section="publish"]')) {
    const publishItem = document.createElement('div');
    publishItem.className = 'sidebar-item advanced-item';
    publishItem.dataset.section = 'publish';
    publishItem.textContent = '📤 Publicar (Clássico)';
    sidebar.insertBefore(publishItem, sidebar.children[1]);
  }
  
  if (!document.querySelector('[data-section="git"]')) {
    const gitItem = document.createElement('div');
    gitItem.className = 'sidebar-item advanced-item';
    gitItem.dataset.section = 'git';
    gitItem.textContent = '📝 Git (Avançado)';
    sidebar.insertBefore(gitItem, sidebar.children[2]);
  }
  
  // Re-attach navigation
  setupNavigation();
}

function hideAdvancedSections() {
  const advancedItems = document.querySelectorAll('.sidebar-item.advanced-item');
  advancedItems.forEach(item => item.remove());
}


// ========== GUIDED REPO FUNCTIONS ==========

function switchGuidedRepoTab(tab) {
  const existingTab = document.getElementById('guidedTabExisting');
  const newTab = document.getElementById('guidedTabNew');
  const existingBtn = document.querySelector('[data-tab="guided-existing"]');
  const newBtn = document.querySelector('[data-tab="guided-new"]');
  const indicator = document.getElementById('guidedTabIndicator');
  
  if (tab === 'existing') {
    existingTab.style.display = 'block';
    newTab.style.display = 'none';
    existingBtn.classList.add('active');
    newBtn.classList.remove('active');
    indicator.textContent = 'Conectar a Repositório Existente';
  } else {
    existingTab.style.display = 'none';
    newTab.style.display = 'block';
    existingBtn.classList.remove('active');
    newBtn.classList.add('active');
    indicator.textContent = 'Criar Novo Repositório';
  }
}

async function loadGuidedRepositories() {
  console.log('🔄 loadGuidedRepositories() called');
  
  if (appState.auth.status !== AUTH_STATUS.LOGGED_IN) {
    const list = document.getElementById('guidedRepoList');
    list.innerHTML = `
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">🔒</div>
        <div style="color: var(--text-secondary); margin-bottom: 15px;">
          Você precisa fazer login no GitHub para ver seus repositórios
        </div>
        <button onclick="document.getElementById('loginBtn').click()" class="primary">
          Fazer Login
        </button>
      </div>
    `;
    return;
  }
  
  const list = document.getElementById('guidedRepoList');
  list.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-secondary);"><div class="spinner" style="margin: 0 auto 15px;"></div>Carregando repositórios...</div>';
  
  addUnifiedLog('Carregando repositórios...', 'info');
  
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao carregar repositórios')), 15000)
    );
    
    const result = await Promise.race([
      window.electronAPI.listRepos(),
      timeoutPromise
    ]);
    
    if (result.success) {
      displayGuidedRepos(result.repos);
      addUnifiedLog(`✓ ${result.repos.length} repositórios encontrados`, 'success');
    } else {
      throw new Error(result.message || 'Erro ao carregar repositórios');
    }
  } catch (error) {
    list.innerHTML = `
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
        <div style="color: var(--error); margin-bottom: 15px; font-weight: 600;">
          ${error.message || 'Erro ao carregar repositórios'}
        </div>
        <div style="color: var(--text-tertiary); font-size: 0.875rem; margin-bottom: 15px;">
          <strong>Possíveis causas:</strong><br>
          • Sem conexão com a internet<br>
          • Token do GitHub expirado<br>
          • Problema com o GitHub CLI
        </div>
        <div style="color: var(--text-tertiary); font-size: 0.875rem; margin-bottom: 15px;">
          <strong>Como resolver:</strong><br>
          1. Verifique sua conexão<br>
          2. Tente fazer logout e login novamente<br>
          3. Clique em "Tentar Novamente"
        </div>
        <button onclick="loadGuidedRepositories()" class="primary">
          🔄 Tentar Novamente
        </button>
      </div>
    `;
    addUnifiedLog('✗ ' + error.message, 'error');
  }
}

function displayGuidedRepos(repos) {
  console.log('📋 displayGuidedRepos() called with', repos.length, 'repos');
  
  const list = document.getElementById('guidedRepoList');
  
  if (!list) {
    console.error('❌ ERRO: Elemento guidedRepoList não encontrado!');
    return;
  }
  
  if (repos.length === 0) {
    list.innerHTML = `
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
        <div style="color: var(--text-secondary); margin-bottom: 15px;">
          Você ainda não tem repositórios no GitHub
        </div>
        <button onclick="switchGuidedRepoTab('new')" class="primary">
          Criar Primeiro Repositório
        </button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = repos.map(repo => `
    <div class="repo-item" data-repo="${repo.name}">
      <div class="repo-icon">${repo.private ? '🔒' : '📦'}</div>
      <div class="repo-info" onclick="selectGuidedRepo('${repo.name}', '${repo.url}')">
        <div class="repo-name">${repo.name}</div>
        <div class="repo-url">${repo.url}</div>
      </div>
      <button class="repo-delete-btn" onclick="deleteGuidedRepository('${repo.name}')" title="Excluir repositório">
        🗑️
      </button>
    </div>
  `).join('');
  
  // Setup search
  const searchInput = document.getElementById('guidedRepoSearch');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const query = e.target.value.toLowerCase();
      const items = list.querySelectorAll('.repo-item');
      items.forEach(item => {
        const name = item.dataset.repo.toLowerCase();
        item.style.display = name.includes(query) ? 'flex' : 'none';
      });
    };
  }
}

function selectGuidedRepo(name, url) {
  // Remove previous selection
  const items = document.querySelectorAll('#guidedRepoList .repo-item');
  items.forEach(item => item.classList.remove('selected'));
  
  // Select clicked item
  const item = document.querySelector(`#guidedRepoList .repo-item[data-repo="${name}"]`);
  if (item) {
    item.classList.add('selected');
  }
  
  // Store selection
  appState.selectedRepo = { name, url };
  
  // Enable connect button
  const connectBtn = document.getElementById('guidedConnectRepoBtn');
  if (connectBtn) {
    connectBtn.disabled = false;
    connectBtn.onclick = () => connectGuidedRepo(name, url);
  }
  
  addUnifiedLog(`Repositório selecionado: ${name}`, 'info');
}

async function connectGuidedRepo(name, url) {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const connectBtn = document.getElementById('guidedConnectRepoBtn');
  if (connectBtn) {
    connectBtn.disabled = true;
    connectBtn.textContent = 'Conectando...';
  }
  
  addUnifiedLog(`Conectando ao repositório ${name}...`, 'info');
  
  try {
    const result = await window.electronAPI.connectExistingRepo({
      projectPath: appState.project.path,
      repoUrl: url
    });
    
    if (result.success) {
      addUnifiedLog(`✓ Repositório conectado: ${name}`, 'success');
      
      // Update project state
      appState.project.hasRemote = true;
      appState.project.remoteInfo = { exists: true, fullName: name };
      appState.project.remoteUrl = url;
      
      // Update guided stepper
      if (guidedStepper) {
        guidedStepper.updateStepStatus(3, 'completed', { repoName: name, repoUrl: url });
        refreshGuidedStepper();
      }
      
      // Show success message
      const list = document.getElementById('guidedRepoList');
      if (list) {
        list.innerHTML = `
          <div style="padding: 30px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
            <div style="color: var(--success); margin-bottom: 15px; font-weight: 600;">
              Repositório conectado com sucesso!
            </div>
            <div style="color: var(--text-secondary); margin-bottom: 15px;">
              ${name}
            </div>
          </div>
        `;
      }
      
      // Re-enable button
      if (connectBtn) {
        connectBtn.disabled = false;
        connectBtn.textContent = '🔗 Conectar Repositório Selecionado';
      }
    } else {
      throw new Error(result.message || 'Erro ao conectar repositório');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    
    if (connectBtn) {
      connectBtn.disabled = false;
      connectBtn.textContent = '🔗 Conectar Repositório Selecionado';
    }
    
    showValidationError({
      valid: false,
      message: error.message,
      action: 'Conectar Repositório',
      cause: 'Falha na conexão com o repositório',
      impact: 'O repositório não foi conectado ao projeto',
      solutions: [
        'Verifique se o repositório existe no GitHub',
        'Verifique suas permissões no repositório',
        'Tente fazer logout e login novamente',
        'Clique em "Tentar Novamente"'
      ]
    });
  }
}

async function disconnectAndChangeRepo() {
  try {
    if (appState.project?.path) {
      await window.electronAPI.disconnectRepo(appState.project.path);
    }
  } catch (e) {
    // Ignore error if remote doesn't exist
  }

  // Reset state
  appState.project.hasRemote = false;
  appState.project.remoteInfo = null;
  appState.project.remoteUrl = null;

  // Reset step status
  if (guidedStepper) {
    guidedStepper.updateStepStatus(3, 'active', null);
    refreshGuidedStepper();
  }

  addUnifiedLog('Repositório desconectado. Selecione um novo repositório.', 'info');
}

async function createGuidedRepo() {
  const validation = validateAction({ requiresProject: true, requiresGitHub: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const repoNameInput = document.getElementById('guidedRepoName');
  const isPrivateInput = document.getElementById('guidedIsPrivate');
  const createBtn = document.getElementById('guidedCreateNewRepoBtn');
  
  const repoName = repoNameInput.value.trim();
  
  if (!repoName) {
    showValidationError({
      valid: false,
      message: 'Digite um nome para o repositório',
      action: 'Criar Repositório'
    });
    return;
  }
  
  // Validate repo name
  if (!/^[a-zA-Z0-9_-]+$/.test(repoName)) {
    showValidationError({
      valid: false,
      message: 'Nome inválido. Use apenas letras, números, hífens (-) e underscores (_)',
      action: 'Criar Repositório'
    });
    return;
  }
  
  if (createBtn) {
    createBtn.disabled = true;
    createBtn.textContent = 'Criando...';
  }
  
  addUnifiedLog(`Criando repositório ${repoName}...`, 'info');
  
  try {
    const result = await window.electronAPI.createRepo({
      projectPath: appState.project.path,
      repoName: repoName,
      isPrivate: isPrivateInput.checked
    });
    
    if (result.success) {
      addUnifiedLog(`✓ Repositório criado e conectado: ${repoName}`, 'success');
      
      // Update project state
      appState.project.hasRemote = true;
      appState.project.remoteInfo = { exists: true, fullName: repoName };
      appState.project.remoteUrl = `https://github.com/${appState.auth.user}/${repoName}`;
      
      // Update guided stepper
      if (guidedStepper) {
        guidedStepper.updateStepStatus(3, 'completed', { repoName: repoName });
        refreshGuidedStepper();
      }
      
      // Show success in the tab
      const tabNew = document.getElementById('guidedTabNew');
      if (tabNew) {
        tabNew.innerHTML = `
          <div style="padding: 30px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
            <div style="color: var(--success); margin-bottom: 15px; font-weight: 600;">
              Repositório criado com sucesso!
            </div>
            <div style="color: var(--text-secondary); margin-bottom: 15px;">
              ${repoName}
            </div>
            <button onclick="openGithubRepo()" class="primary">
              🌐 Abrir no GitHub
            </button>
          </div>
        `;
      }
      
      // Re-enable button
      if (createBtn) {
        createBtn.disabled = false;
        createBtn.textContent = '🚀 Criar e Conectar Repositório';
      }
    } else {
      throw new Error(result.message || 'Erro ao criar repositório');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.textContent = '🚀 Criar e Conectar Repositório';
    }
    
    showValidationError({
      valid: false,
      message: error.message,
      action: 'Criar Repositório',
      cause: 'Falha ao criar o repositório no GitHub',
      impact: 'O repositório não foi criado',
      solutions: [
        'Verifique se já existe um repositório com esse nome',
        'Verifique sua conexão com a internet',
        'Tente fazer logout e login novamente',
        'Clique em "Tentar Novamente"'
      ]
    });
  }
}

window.switchGuidedRepoTab = switchGuidedRepoTab;
window.loadGuidedRepositories = loadGuidedRepositories;
window.selectGuidedRepo = selectGuidedRepo;
window.connectGuidedRepo = connectGuidedRepo;
window.createGuidedRepo = createGuidedRepo;


async function deleteGuidedRepository(repoName) {
  console.log('🗑️ deleteGuidedRepository called for:', repoName);
  
  // Check if logged in first
  if (appState.auth.status !== AUTH_STATUS.LOGGED_IN) {
    showValidationError({
      valid: false,
      message: 'Login necessário',
      detail: 'Você precisa estar logado no GitHub para excluir repositórios.',
      actions: [{
        label: 'Fazer Login',
        action: () => {
          hideValidationError();
          document.getElementById('loginBtn').click();
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
    return;
  }
  
  // Show confirmation dialog
  const confirmed = confirm(
    `⚠️ ATENÇÃO: Você está prestes a EXCLUIR PERMANENTEMENTE o repositório "${repoName}"!\n\n` +
    `Esta ação:\n` +
    `• Excluirá o repositório do GitHub\n` +
    `• Apagará TODOS os commits e histórico\n` +
    `• NÃO pode ser desfeita\n\n` +
    `Tem certeza que deseja continuar?`
  );
  
  if (!confirmed) {
    console.log('❌ Deletion cancelled by user');
    addUnifiedLog('Exclusão cancelada', 'info');
    return;
  }
  
  // Second confirmation for safety
  const doubleConfirm = confirm(
    `🚨 ÚLTIMA CONFIRMAÇÃO!\n\n` +
    `Digite o nome do repositório para confirmar: "${repoName}"\n\n` +
    `Você realmente deseja excluir "${repoName}" PERMANENTEMENTE?`
  );
  
  if (!doubleConfirm) {
    console.log('❌ Deletion cancelled by user (second confirmation)');
    addUnifiedLog('Exclusão cancelada', 'info');
    return;
  }
  
  console.log('✅ User confirmed deletion');
  addUnifiedLog(`Excluindo repositório "${repoName}"...`, 'warning');
  
  try {
    const result = await window.electronAPI.deleteRepo(repoName);
    
    if (result.success) {
      console.log('✅ Repository deleted successfully');
      addUnifiedLog(`✓ Repositório "${repoName}" excluído com sucesso`, 'success');
      
      // Reload the repository list
      await loadGuidedRepositories();
      
      // Clear selection if deleted repo was selected
      if (appState.selectedRepo && appState.selectedRepo.name === repoName) {
        appState.selectedRepo = null;
        const connectBtn = document.getElementById('guidedConnectRepoBtn');
        if (connectBtn) {
          connectBtn.disabled = true;
        }
      }
      
      // Show success message
      showValidationError({
        valid: false,
        message: '✅ Repositório excluído',
        detail: `O repositório "${repoName}" foi excluído permanentemente do GitHub.`,
        actions: [{
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
    } else if (result.needsScope) {
      // Special handling for missing delete_repo scope
      console.log('⚠️ Missing delete_repo scope');
      addUnifiedLog('✗ Permissão "delete_repo" necessária', 'error');
      
      showValidationError({
        valid: false,
        message: '🔐 Permissão Necessária',
        detail: `Para excluir repositórios, você precisa autorizar a permissão "delete_repo".\n\nClique no botão abaixo para abrir o terminal e executar o comando automaticamente.`,
        actions: [{
          label: '🚀 Abrir Terminal e Autorizar',
          action: async () => {
            hideValidationError();
            addUnifiedLog('Abrindo terminal para autorização...', 'info');
            
            const authResult = await window.electronAPI.requestDeleteScope();
            
            if (authResult.success) {
              addUnifiedLog('✓ Terminal aberto! Complete a autorização no navegador.', 'success');
              
              showValidationError({
                valid: false,
                message: '✅ Terminal Aberto',
                detail: 'O terminal foi aberto e o comando está sendo executado.\n\n1. O navegador vai abrir automaticamente\n2. Clique em "Authorize github"\n3. Volte aqui e tente excluir novamente',
                actions: [{
                  label: 'Tentar Excluir Novamente',
                  action: () => {
                    hideValidationError();
                    deleteGuidedRepository(repoName);
                  }
                }, {
                  label: 'Cancelar',
                  action: () => hideValidationError()
                }]
              });
            } else {
              addUnifiedLog('✗ Erro ao abrir terminal', 'error');
              showValidationError({
                valid: false,
                message: '❌ Erro ao Abrir Terminal',
                detail: authResult.message || 'Não foi possível abrir o terminal.',
                actions: [{
                  label: 'OK',
                  action: () => hideValidationError()
                }]
              });
            }
          }
        }, {
          label: 'Cancelar',
          action: () => hideValidationError()
        }]
      });
    } else {
      throw new Error(result.message || 'Erro ao excluir repositório');
    }
  } catch (error) {
    console.error('❌ Error deleting repository:', error);
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    
    showValidationError({
      valid: false,
      message: '❌ Erro ao Excluir',
      detail: error.message || 'Não foi possível excluir o repositório.',
      cause: 'Falha na comunicação com o GitHub',
      impact: 'O repositório não foi excluído',
      solutions: [
        'Verifique sua conexão com a internet',
        'Verifique se você tem permissão para excluir o repositório',
        'Tente fazer logout e login novamente',
        'Clique em "Tentar Novamente"'
      ],
      actions: [{
        label: 'Tentar Novamente',
        action: () => {
          hideValidationError();
          deleteGuidedRepository(repoName);
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
  }
}

window.deleteGuidedRepository = deleteGuidedRepository;


// ========== GIT STEP FUNCTIONS ==========

async function showGitStatus() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addUnifiedLog('Verificando status do Git...', 'info');
  
  try {
    const result = await window.electronAPI.gitStatus(appState.project.path);
    
    if (result.success) {
      const output = result.output || 'Nenhuma alteração';
      
      // Parse git status output
      const lines = output.split('\n');
      const hasChanges = output.includes('Changes') || output.includes('modified:') || 
                        output.includes('new file:') || output.includes('deleted:');
      
      showValidationError({
        valid: false,
        message: '📊 Status do Git',
        detail: `<pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5;">${output}</pre>`,
        actions: [{
          label: hasChanges ? '💾 Fazer Commit' : 'OK',
          action: () => {
            hideValidationError();
            if (hasChanges) {
              // Switch to commit step
              if (guidedStepper) {
                guidedStepper.toggleStep(4); // Step 5 (commit)
              }
            }
          }
        }, {
          label: 'Fechar',
          action: () => hideValidationError()
        }]
      });
      
      addUnifiedLog('✓ Status verificado', 'success');
    } else {
      throw new Error(result.message || 'Erro ao verificar status');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    showValidationError({
      valid: false,
      message: '❌ Erro ao Verificar Status',
      detail: error.message,
      actions: [{
        label: 'OK',
        action: () => hideValidationError()
      }]
    });
  }
}

async function switchToMainBranch() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const confirmed = confirm(
    'Deseja trocar para a branch "main"?\n\n' +
    'Isso vai:\n' +
    '• Salvar suas alterações atuais (se houver)\n' +
    '• Trocar para a branch main\n' +
    '• Criar a branch main se não existir'
  );
  
  if (!confirmed) {
    return;
  }
  
  addUnifiedLog('Trocando para branch main...', 'info');
  
  try {
    // Check if main branch exists
    const listResult = await window.electronAPI.listBranches(appState.project.path);
    
    if (listResult.success) {
      const branches = listResult.branches || [];
      const hasMain = branches.includes('main');
      
      if (hasMain) {
        // Switch to existing main branch
        const switchResult = await window.electronAPI.switchBranch({
          projectPath: appState.project.path,
          branchName: 'main'
        });
        
        if (switchResult.success) {
          addUnifiedLog('✓ Trocado para branch main', 'success');
          await refreshProjectInfo();
          refreshGuidedStepper();
        } else {
          throw new Error(switchResult.message || 'Erro ao trocar de branch');
        }
      } else {
        // Create main branch
        const createResult = await window.electronAPI.createBranch({
          projectPath: appState.project.path,
          branchName: 'main'
        });
        
        if (createResult.success) {
          addUnifiedLog('✓ Branch main criada e ativada', 'success');
          await refreshProjectInfo();
          refreshGuidedStepper();
        } else {
          throw new Error(createResult.message || 'Erro ao criar branch main');
        }
      }
    } else {
      throw new Error(listResult.message || 'Erro ao listar branches');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    showValidationError({
      valid: false,
      message: '❌ Erro ao Trocar Branch',
      detail: error.message,
      cause: 'Falha ao trocar para a branch main',
      solutions: [
        'Verifique se há alterações não commitadas',
        'Tente fazer commit das alterações primeiro',
        'Use a seção "Git (Avançado)" para mais opções'
      ],
      actions: [{
        label: 'OK',
        action: () => hideValidationError()
      }]
    });
  }
}

async function initializeGit() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addUnifiedLog('Inicializando Git...', 'info');
  
  try {
    const result = await window.electronAPI.gitInit(appState.project.path);
    
    if (result.success) {
      addUnifiedLog('✓ Git inicializado com sucesso', 'success');
      
      // Refresh project info
      await refreshProjectInfo();
      
      // Update guided stepper
      if (guidedStepper) {
        guidedStepper.updateStepStatus(2, 'completed', { hasGit: true });
        refreshGuidedStepper();
      }
      
      showValidationError({
        valid: false,
        message: '✅ Git Inicializado',
        detail: 'O repositório Git foi inicializado com sucesso no seu projeto.',
        actions: [{
          label: 'Avançar',
          action: () => {
            hideValidationError();
            if (guidedStepper) {
              guidedStepper.goToNextStep(2); // Go to step 4
            }
          }
        }, {
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
    } else {
      throw new Error(result.message || 'Erro ao inicializar Git');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    showValidationError({
      valid: false,
      message: '❌ Erro ao Inicializar Git',
      detail: error.message,
      cause: 'Falha ao inicializar o repositório Git',
      solutions: [
        'Verifique se o Git está instalado no sistema',
        'Verifique as permissões da pasta do projeto',
        'Tente executar manualmente: git init'
      ],
      actions: [{
        label: 'Tentar Novamente',
        action: () => {
          hideValidationError();
          initializeGit();
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
  }
}

window.showGitStatus = showGitStatus;
window.switchToMainBranch = switchToMainBranch;
window.initializeGit = initializeGit;

// ========== GUIDED COMMIT FUNCTIONS ==========

async function showGuidedGitStatus() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addUnifiedLog('Verificando alterações...', 'info');
  
  try {
    const result = await window.electronAPI.gitStatus(appState.project.path);
    
    if (result.success) {
      const output = result.output || 'Nenhuma alteração';
      
      showValidationError({
        valid: false,
        message: '📊 Suas Alterações',
        detail: `<pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5; max-height: 400px;">${output}</pre>`,
        actions: [{
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
      
      addUnifiedLog('✓ Alterações verificadas', 'success');
    } else {
      throw new Error(result.message || 'Erro ao verificar alterações');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    showValidationError({
      valid: false,
      message: '❌ Erro ao Verificar Alterações',
      detail: error.message,
      actions: [{
        label: 'OK',
        action: () => hideValidationError()
      }]
    });
  }
}

async function makeGuidedCommit() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const messageInput = document.getElementById('guidedCommitMessage');
  const commitBtn = document.getElementById('guidedCommitBtn');
  const message = messageInput?.value.trim();
  
  if (!message) {
    showValidationError({
      valid: false,
      message: 'Digite uma mensagem para o commit',
      detail: 'A mensagem do commit é obrigatória para descrever suas alterações.',
      actions: [{
        label: 'OK',
        action: () => {
          hideValidationError();
          messageInput?.focus();
        }
      }]
    });
    return;
  }
  
  if (commitBtn) {
    commitBtn.disabled = true;
    commitBtn.textContent = 'Fazendo commit...';
  }
  
  addUnifiedLog('Adicionando arquivos...', 'info');
  
  try {
    // Step 0: Configure Git user if logged in to GitHub
    if (appState.auth.status === AUTH_STATUS.LOGGED_IN && appState.auth.user) {
      await window.electronAPI.configureGitUser({
        projectPath: appState.project.path,
        username: appState.auth.user,
        email: `${appState.auth.user}@users.noreply.github.com`
      });
    }
    
    // Step 1: Add all files (git add .)
    const addResult = await window.electronAPI.gitAdd({
      projectPath: appState.project.path,
      files: '.'
    });
    
    if (!addResult.success) {
      throw new Error(addResult.message || 'Erro ao adicionar arquivos');
    }
    
    addUnifiedLog('✓ Arquivos adicionados', 'success');
    addUnifiedLog('Criando commit...', 'info');
    
    // Step 2: Commit
    const commitResult = await window.electronAPI.gitCommit({
      projectPath: appState.project.path,
      message: message
    });
    
    if (commitResult.success) {
      addUnifiedLog(`✓ Commit criado: "${message}"`, 'success');
      
      // Clear input
      if (messageInput) {
        messageInput.value = '';
      }
      
      // Update guided stepper
      if (guidedStepper) {
        guidedStepper.updateStepStatus(4, 'completed', { commitMessage: message });
        refreshGuidedStepper();
      }
      
      // Show success
      showValidationError({
        valid: false,
        message: '✅ Commit Criado com Sucesso',
        detail: `Suas alterações foram salvas no histórico do Git com a mensagem: "${message}"`,
        actions: [{
          label: 'Avançar para Push',
          action: () => {
            hideValidationError();
            if (guidedStepper) {
              guidedStepper.goToNextStep(4);
            }
          }
        }, {
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
      
      // Re-enable button
      if (commitBtn) {
        commitBtn.disabled = false;
        commitBtn.textContent = '💾 Fazer Commit';
      }
      
      // Update sync status
      updateSyncStatus();
    } else {
      throw new Error(commitResult.message || 'Erro ao criar commit');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    
    if (commitBtn) {
      commitBtn.disabled = false;
      commitBtn.textContent = '💾 Fazer Commit';
    }
    
    showValidationError({
      valid: false,
      message: '❌ Erro ao Fazer Commit',
      detail: error.message,
      cause: 'Falha ao criar o commit',
      solutions: [
        'Verifique se há alterações para commitar',
        'Tente ver as alterações primeiro (botão "Ver Alterações")',
        'Verifique se o Git está configurado corretamente',
        'Clique em "Tentar Novamente"'
      ],
      actions: [{
        label: 'Tentar Novamente',
        action: () => {
          hideValidationError();
          makeGuidedCommit();
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
  }
}

window.showGuidedGitStatus = showGuidedGitStatus;
window.makeGuidedCommit = makeGuidedCommit;

async function diagnoseGitCommit() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addUnifiedLog('🔍 Executando diagnóstico...', 'info');
  
  let diagnosticInfo = '📋 DIAGNÓSTICO DO GIT\n\n';
  
  try {
    // 1. Check Git status
    const statusResult = await window.electronAPI.gitStatus(appState.project.path);
    diagnosticInfo += '1️⃣ Git Status:\n';
    if (statusResult.success) {
      diagnosticInfo += statusResult.output + '\n\n';
    } else {
      diagnosticInfo += '❌ Erro: ' + statusResult.message + '\n\n';
    }
    
    // 2. Check staged files
    diagnosticInfo += '2️⃣ Arquivos no Stage (git diff --cached --name-only):\n';
    const stagedResult = await window.electronAPI.gitStatus(appState.project.path);
    diagnosticInfo += '(Verificar via git status acima)\n\n';
    
    // 3. Check Git user config
    diagnosticInfo += '3️⃣ Configuração do Usuário Git:\n';
    diagnosticInfo += 'Projeto: ' + appState.project.path + '\n';
    diagnosticInfo += 'Usuário GitHub: ' + (appState.auth.user || 'Não logado') + '\n\n';
    
    // 4. Check if there are changes
    diagnosticInfo += '4️⃣ Verificação de Alterações:\n';
    if (statusResult.success) {
      const hasChanges = statusResult.output.includes('Changes') || 
                        statusResult.output.includes('modified:') || 
                        statusResult.output.includes('new file:') ||
                        statusResult.output.includes('deleted:');
      
      if (hasChanges) {
        diagnosticInfo += '✅ Há alterações para commitar\n\n';
      } else {
        diagnosticInfo += '⚠️ PROBLEMA: Não há alterações para commitar!\n';
        diagnosticInfo += 'Isso pode ser porque:\n';
        diagnosticInfo += '- Todos os arquivos já foram commitados\n';
        diagnosticInfo += '- Os arquivos não foram adicionados ao stage (git add)\n';
        diagnosticInfo += '- Não há arquivos modificados\n\n';
      }
    }
    
    // 5. Recommendations
    diagnosticInfo += '5️⃣ Recomendações:\n';
    diagnosticInfo += '• Se não há alterações: Modifique algum arquivo primeiro\n';
    diagnosticInfo += '• Se há alterações mas commit falha: Verifique configuração do Git\n';
    diagnosticInfo += '• Tente executar manualmente no terminal:\n';
    diagnosticInfo += '  cd "' + appState.project.path + '"\n';
    diagnosticInfo += '  git config user.name "Teste"\n';
    diagnosticInfo += '  git config user.email "teste@teste.com"\n';
    diagnosticInfo += '  git add .\n';
    diagnosticInfo += '  git commit -m "teste"\n';
    
    showValidationError({
      valid: false,
      message: '🔍 Diagnóstico do Git',
      detail: `<pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5; max-height: 500px; white-space: pre-wrap;">${diagnosticInfo}</pre>`,
      actions: [{
        label: 'OK',
        action: () => hideValidationError()
      }]
    });
    
    addUnifiedLog('✓ Diagnóstico completo', 'success');
  } catch (error) {
    addUnifiedLog(`✗ Erro no diagnóstico: ${error.message}`, 'error');
  }
}

window.diagnoseGitCommit = diagnoseGitCommit;

// ========== COMMIT STATUS CHECK ==========

async function checkCommitStatus() {
  const container = document.getElementById('commitStepContent');
  if (!container) return;
  
  if (!appState.project) {
    container.innerHTML = `
      <div class="step-warning-card">
        <div class="step-warning-icon">⚠️</div>
        <div>
          <div class="step-info-title">Projeto não selecionado</div>
          <div class="step-info-text">Selecione um projeto primeiro.</div>
        </div>
      </div>
    `;
    return;
  }
  
  try {
    const statusResult = await window.electronAPI.gitStatus(appState.project.path);
    
    if (!statusResult.success) {
      container.innerHTML = renderCommitError('Erro ao verificar status do Git');
      return;
    }
    
    const status = statusResult.output || '';
    const hasChanges = status.includes('Changes') || 
                      status.includes('modified:') || 
                      status.includes('new file:') ||
                      status.includes('deleted:') ||
                      status.includes('Untracked files');
    
    const isClean = status.includes('nothing to commit, working tree clean');
    const isAhead = status.includes('Your branch is ahead');
    
    if (isClean && !isAhead) {
      // Tudo commitado e sincronizado
      container.innerHTML = renderCommitComplete();
    } else if (isClean && isAhead) {
      // Commitado mas não fez push
      container.innerHTML = renderNeedsPush();
    } else if (hasChanges) {
      // Há alterações para commitar
      container.innerHTML = renderCommitForm();
    } else {
      // Estado desconhecido
      container.innerHTML = renderCommitForm();
    }
  } catch (error) {
    container.innerHTML = renderCommitError(error.message);
  }
}

function renderCommitForm() {
  return `
    <div class="step-info-card">
      <div class="step-info-icon">💾</div>
      <div class="step-info-content">
        <div class="step-info-title">Há alterações para commitar</div>
        <div class="step-info-text">
          Você modificou arquivos no projeto. Faça um commit para salvar essas alterações no histórico do Git.
        </div>
      </div>
    </div>
    
    <div style="margin: var(--space-4) 0;">
      <label style="display: block; font-weight: 600; margin-bottom: var(--space-2); color: var(--text-primary);">
        Mensagem do commit
      </label>
      <input 
        type="text" 
        id="guidedCommitMessage" 
        placeholder="Ex: Adiciona nova funcionalidade"
        style="width: 100%; padding: var(--space-3); border: 2px solid var(--border-default); border-radius: var(--radius-md); font-size: 1rem;"
      />
      <div style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: var(--space-2);">
        💡 Dica: Descreva brevemente o que você mudou
      </div>
    </div>
    
    <div class="button-group">
      <button onclick="makeGuidedCommit()" class="primary" id="guidedCommitBtn">
        💾 Fazer Commit
      </button>
      <button onclick="showGuidedGitStatus()" class="secondary">
        📊 Ver Alterações
      </button>
    </div>
  `;
}

function renderCommitComplete() {
  return `
    <div class="step-success-card">
      <div class="step-success-icon">✅</div>
      <div>
        <div class="step-info-title">Tudo commitado e sincronizado</div>
        <div class="step-info-text">
          Não há alterações pendentes. Todos os arquivos estão salvos e sincronizados com o GitHub.
        </div>
      </div>
    </div>
    
    <div style="padding: var(--space-4); background: var(--bg-subtle); border-radius: var(--radius-md); margin-top: var(--space-4);">
      <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: var(--space-3);">
        📝 Para fazer um novo commit:
      </div>
      <ol style="margin: 0; padding-left: var(--space-5); color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">
        <li>Modifique algum arquivo do projeto</li>
        <li>Volte aqui e faça o commit</li>
      </ol>
    </div>
    
    <div class="button-group" style="margin-top: var(--space-4);">
      <button onclick="checkCommitStatus()" class="secondary">
        🔄 Verificar Novamente
      </button>
      <button onclick="showGuidedGitStatus()" class="secondary">
        📊 Ver Status
      </button>
    </div>
  `;
}

function renderNeedsPush() {
  return `
    <div class="step-warning-card">
      <div class="step-warning-icon">⚠️</div>
      <div>
        <div class="step-info-title">Commit feito, mas não enviado</div>
        <div class="step-info-text">
          Você já fez o commit, mas ainda não enviou (push) para o GitHub. 
          Suas alterações estão salvas localmente, mas não estão no repositório remoto.
        </div>
      </div>
    </div>
    
    <div style="padding: var(--space-4); background: var(--info-bg); border-radius: var(--radius-md); margin-top: var(--space-4); border-left: 3px solid var(--info);">
      <div style="font-weight: 600; margin-bottom: var(--space-2); color: var(--info);">
        💡 O que fazer agora?
      </div>
      <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
        Avance para o próximo step (Push) para enviar suas alterações para o GitHub.
      </div>
    </div>
    
    <div class="button-group" style="margin-top: var(--space-4);">
      <button onclick="if(guidedStepper) guidedStepper.goToNextStep(4)" class="primary">
        ➡️ Avançar para Push
      </button>
      <button onclick="checkCommitStatus()" class="secondary">
        🔄 Verificar Novamente
      </button>
    </div>
  `;
}

function renderCommitError(errorMsg) {
  return `
    <div class="step-warning-card">
      <div class="step-warning-icon">❌</div>
      <div>
        <div class="step-info-title">Erro ao verificar status</div>
        <div class="step-info-text">${errorMsg}</div>
      </div>
    </div>
    
    <div class="button-group" style="margin-top: var(--space-4);">
      <button onclick="checkCommitStatus()" class="primary">
        🔄 Tentar Novamente
      </button>
    </div>
  `;
}

window.checkCommitStatus = checkCommitStatus;

// ========== GUIDED PUSH/PULL ==========

async function makeGuidedPush() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  const pushBtn = document.getElementById('guidedPushBtn');
  if (pushBtn) {
    pushBtn.disabled = true;
    pushBtn.textContent = 'Enviando...';
  }
  
  addUnifiedLog('Enviando para o GitHub...', 'info');
  
  try {
    const result = await window.electronAPI.gitPush({
      projectPath: appState.project.path,
      force: false
    });
    
    if (result.success) {
      addUnifiedLog('✓ Push realizado com sucesso!', 'success');
      
      // Mark step as completed
      if (guidedStepper) {
        guidedStepper.updateStepStatus(5, 'completed', {});
        refreshGuidedStepper();
      }
      
      showValidationError({
        valid: false,
        message: '✅ Push Realizado com Sucesso',
        detail: 'Suas alterações foram enviadas para o GitHub e agora estão disponíveis no repositório remoto.',
        actions: [{
          label: 'Ver no GitHub',
          action: () => {
            hideValidationError();
            openGithubRepo();
          }
        }, {
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
      
      // Update sync status
      updateSyncStatus();
    } else {
      throw new Error(result.message || 'Erro ao fazer push');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    
    showValidationError({
      valid: false,
      message: '❌ Erro ao Fazer Push',
      detail: error.message,
      cause: 'Falha ao enviar para o GitHub',
      solutions: [
        'Verifique sua conexão com a internet',
        'Verifique se você tem permissão no repositório',
        'Tente fazer pull primeiro se houver conflitos',
        'Clique em "Tentar Novamente"'
      ],
      actions: [{
        label: 'Tentar Novamente',
        action: () => {
          hideValidationError();
          makeGuidedPush();
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
  } finally {
    if (pushBtn) {
      pushBtn.disabled = false;
      pushBtn.textContent = '⬆️ Fazer Push';
    }
  }
}

async function makeGuidedPull() {
  const validation = validateAction({ requiresProject: true });
  if (!validation.valid) {
    showValidationError(validation);
    return;
  }
  
  addUnifiedLog('Baixando do GitHub...', 'info');
  
  try {
    const result = await window.electronAPI.gitPull(appState.project.path);
    
    if (result.success) {
      addUnifiedLog('✓ Pull realizado com sucesso!', 'success');
      
      showValidationError({
        valid: false,
        message: '✅ Pull Realizado com Sucesso',
        detail: 'As alterações do GitHub foram baixadas para seu projeto local.',
        actions: [{
          label: 'OK',
          action: () => hideValidationError()
        }]
      });
    } else {
      throw new Error(result.message || 'Erro ao fazer pull');
    }
  } catch (error) {
    addUnifiedLog(`✗ Erro: ${error.message}`, 'error');
    
    showValidationError({
      valid: false,
      message: '❌ Erro ao Fazer Pull',
      detail: error.message,
      cause: 'Falha ao baixar do GitHub',
      solutions: [
        'Verifique sua conexão com a internet',
        'Verifique se há conflitos locais',
        'Tente fazer commit das alterações locais primeiro',
        'Clique em "Tentar Novamente"'
      ],
      actions: [{
        label: 'Tentar Novamente',
        action: () => {
          hideValidationError();
          makeGuidedPull();
        }
      }, {
        label: 'Cancelar',
        action: () => hideValidationError()
      }]
    });
  }
}

window.makeGuidedPush = makeGuidedPush;
window.makeGuidedPull = makeGuidedPull;

// ========== SYNC STATUS INDICATOR ==========

async function updateSyncStatus() {
  const syncEl = document.getElementById('syncStatus');
  if (!syncEl) return;
  
  // Only show if project has remote
  if (!appState.project || !appState.project.hasRemote) {
    syncEl.style.display = 'none';
    return;
  }
  
  syncEl.style.display = 'flex';
  
  try {
    const statusResult = await window.electronAPI.gitStatus(appState.project.path);
    
    if (!statusResult.success) {
      syncEl.className = 'sync-status error';
      syncEl.innerHTML = '<span class="sync-icon">❌</span><span class="sync-text">Erro</span>';
      return;
    }
    
    const status = statusResult.output || '';
    const hasUncommitted = status.includes('Changes') || 
                          status.includes('modified:') || 
                          status.includes('new file:') ||
                          status.includes('deleted:') ||
                          status.includes('Untracked files');
    
    const isAhead = status.includes('Your branch is ahead');
    const isBehind = status.includes('Your branch is behind');
    
    if (hasUncommitted) {
      // Has uncommitted changes
      syncEl.className = 'sync-status pending';
      syncEl.innerHTML = '<span class="sync-icon">📝</span><span class="sync-text">Alterações não commitadas</span>';
      syncEl.onclick = () => showSyncDetails('uncommitted');
    } else if (isAhead) {
      // Has commits not pushed
      const match = status.match(/ahead.*?(\d+)/);
      const count = match ? match[1] : '?';
      syncEl.className = 'sync-status pending';
      syncEl.innerHTML = `<span class="sync-icon">⬆️</span><span class="sync-text">${count} commit(s) não enviado(s)</span>`;
      syncEl.onclick = () => showSyncDetails('ahead');
    } else if (isBehind) {
      // Remote has new commits
      const match = status.match(/behind.*?(\d+)/);
      const count = match ? match[1] : '?';
      syncEl.className = 'sync-status pending';
      syncEl.innerHTML = `<span class="sync-icon">⬇️</span><span class="sync-text">${count} commit(s) no remoto</span>`;
      syncEl.onclick = () => showSyncDetails('behind');
    } else {
      // All synced
      syncEl.className = 'sync-status synced';
      syncEl.innerHTML = '<span class="sync-icon">✅</span><span class="sync-text">Sincronizado</span>';
      syncEl.onclick = () => showSyncDetails('synced');
    }
  } catch (error) {
    syncEl.className = 'sync-status error';
    syncEl.innerHTML = '<span class="sync-icon">❌</span><span class="sync-text">Erro</span>';
  }
}

async function showSyncDetails(type) {
  if (!appState.project) return;
  
  let title = '';
  let content = '';
  let actions = [];
  
  try {
    const statusResult = await window.electronAPI.gitStatus(appState.project.path);
    const status = statusResult.output || 'Erro ao obter status';
    
    if (type === 'uncommitted') {
      title = '📝 Alterações Não Commitadas';
      content = `
        <div style="margin-bottom: var(--space-4);">
          <p style="color: var(--text-secondary); margin-bottom: var(--space-3);">
            Você tem alterações que ainda não foram salvas em um commit:
          </p>
          <pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5; max-height: 300px;">${status}</pre>
        </div>
      `;
      actions = [{
        label: 'Ir para Commit',
        action: () => {
          hideValidationError();
          if (guidedStepper) {
            guidedStepper.goToStep(4); // Step 5 (commit)
          }
        }
      }, {
        label: 'Fechar',
        action: () => hideValidationError()
      }];
    } else if (type === 'ahead') {
      title = '⬆️ Commits Não Enviados';
      content = `
        <div style="margin-bottom: var(--space-4);">
          <p style="color: var(--text-secondary); margin-bottom: var(--space-3);">
            Você tem commits locais que ainda não foram enviados para o GitHub:
          </p>
          <pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5; max-height: 300px;">${status}</pre>
        </div>
      `;
      actions = [{
        label: 'Fazer Push',
        action: () => {
          hideValidationError();
          if (guidedStepper) {
            guidedStepper.goToStep(5); // Step 6 (push)
          }
        }
      }, {
        label: 'Fechar',
        action: () => hideValidationError()
      }];
    } else if (type === 'behind') {
      title = '⬇️ Atualizações Disponíveis';
      content = `
        <div style="margin-bottom: var(--space-4);">
          <p style="color: var(--text-secondary); margin-bottom: var(--space-3);">
            O repositório remoto tem commits novos que você ainda não baixou:
          </p>
          <pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5; max-height: 300px;">${status}</pre>
        </div>
      `;
      actions = [{
        label: 'Fazer Pull',
        action: () => {
          hideValidationError();
          makeGuidedPull();
        }
      }, {
        label: 'Fechar',
        action: () => hideValidationError()
      }];
    } else {
      title = '✅ Tudo Sincronizado';
      content = `
        <div style="margin-bottom: var(--space-4);">
          <p style="color: var(--success); margin-bottom: var(--space-3);">
            Seu projeto está completamente sincronizado com o GitHub!
          </p>
          <pre style="background: var(--bg-base); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.5; max-height: 300px;">${status}</pre>
        </div>
      `;
      actions = [{
        label: 'OK',
        action: () => hideValidationError()
      }];
    }
    
    showValidationError({
      valid: false,
      message: title,
      detail: content,
      actions: actions
    });
  } catch (error) {
    showValidationError({
      valid: false,
      message: '❌ Erro ao Verificar Status',
      detail: error.message,
      actions: [{
        label: 'OK',
        action: () => hideValidationError()
      }]
    });
  }
}

// Update sync status periodically
setInterval(() => {
  if (appState.project && appState.project.hasRemote) {
    updateSyncStatus();
  }
}, 30000); // Every 30 seconds

// Update sync status when project changes
window.addEventListener('project-changed', () => {
  updateSyncStatus();
});

window.updateSyncStatus = updateSyncStatus;
window.showSyncDetails = showSyncDetails;

// ========== TUTORIAL SETUP ==========

function setupTutorial() {
  const tutorialNavBtns = document.querySelectorAll('.tutorial-nav-btn');
  const tutorialContentEl = document.getElementById('tutorialContent');
  
  if (!tutorialContentEl) return;
  
  // Load first tutorial by default
  loadRegularTutorial('first-time', tutorialContentEl);
  
  tutorialNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      tutorialNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Load tutorial content
      const tutorialId = btn.dataset.tutorial;
      loadRegularTutorial(tutorialId, tutorialContentEl);
    });
  });
}

function loadRegularTutorial(tutorialId, container) {
  if (!window.tutorialContent || !window.tutorialContent[tutorialId]) {
    container.innerHTML = `
      <div style="padding: var(--space-6); text-align: center;">
        <div style="font-size: 3rem; margin-bottom: var(--space-4);">📚</div>
        <div style="color: var(--text-secondary);">Tutorial não encontrado</div>
      </div>
    `;
    return;
  }
  
  const tutorial = window.tutorialContent[tutorialId];
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <h2 style="font-size: 1.875rem; font-weight: 600; margin-bottom: var(--space-6); color: var(--text-primary);">
        ${tutorial.title}
      </h2>
      <div class="tutorial-body">
        ${tutorial.content}
      </div>
    </div>
  `;
}

window.setupTutorial = setupTutorial;
