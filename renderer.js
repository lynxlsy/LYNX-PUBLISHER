// Estado global
let currentProject = null;
let selectedRepo = null;

// Elementos DOM
const elements = {
  statusIndicator: document.getElementById('statusIndicator'),
  statusText: document.getElementById('statusText'),
  loginBtn: document.getElementById('loginBtn'),
  selectProjectBtn: document.getElementById('selectProjectBtn'),
  projectInfo: document.getElementById('projectInfo'),
  publishCard: document.getElementById('publishCard'),
  publishLog: document.getElementById('publishLog'),
  gitignoreLog: document.getElementById('gitignoreLog'),
  branchLog: document.getElementById('branchLog')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  setupEventListeners();
  setupNavigation();
});

// Verificar status de login
async function checkLoginStatus() {
  const result = await window.electronAPI.checkLoginStatus();
  updateLoginStatus(result.loggedIn);
}

function updateLoginStatus(loggedIn) {
  if (loggedIn) {
    elements.statusIndicator.className = 'status-indicator logged-in';
    elements.statusText.textContent = '🟢 Logado';
  } else {
    elements.statusIndicator.className = 'status-indicator logged-out';
    elements.statusText.textContent = '🔴 Não logado';
  }
}

// Login GitHub
let loginInProgress = false;
elements.loginBtn.addEventListener('click', async () => {
  // Prevenir múltiplos cliques
  if (loginInProgress) return;
  
  loginInProgress = true;
  elements.loginBtn.disabled = true;
  elements.loginBtn.textContent = 'Aguarde...';
  
  addLog(elements.publishLog, 'Abrindo terminal para login no GitHub...', 'info');
  const result = await window.electronAPI.githubLogin();
  
  addLog(elements.publishLog, result.message, result.success ? 'info' : 'error');
  
  // Verificar status após login
  setTimeout(async () => {
    await checkLoginStatus();
    elements.loginBtn.disabled = false;
    elements.loginBtn.textContent = 'Login GitHub';
    loginInProgress = false;
  }, 2000);
});

// Selecionar projeto
elements.selectProjectBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.selectProject();
  
  if (result.success) {
    currentProject = result;
    displayProjectInfo(result);
    elements.publishCard.style.display = 'block';
    addLog(elements.publishLog, 'Projeto carregado com sucesso', 'success');
  } else {
    addLog(elements.publishLog, result.message, 'error');
  }
});

function displayProjectInfo(project) {
  elements.projectInfo.style.display = 'block';
  elements.projectInfo.innerHTML = `
    <p><strong>Caminho:</strong> ${project.path}</p>
    <p><strong>Git inicializado:</strong> ${project.hasGit ? '✓ Sim' : '✗ Não'}</p>
    <p><strong>Remote configurado:</strong> ${project.hasRemote ? '✓ Sim' : '✗ Não'}</p>
    <p><strong>Branch main:</strong> ${project.hasBranchMain ? '✓ Sim' : '✗ Não'}</p>
  `;
}

function addLog(logElement, message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
  
  // Limitar a 50 entradas
  while (logElement.children.length > 50) {
    logElement.removeChild(logElement.firstChild);
  }
}

function clearLog(logElement) {
  logElement.innerHTML = '';
}

// Navegação entre seções
function setupNavigation() {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const sectionName = item.dataset.section;
      
      // Atualizar sidebar
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Atualizar seções
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sectionName).classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Publicação
  document.querySelectorAll('input[name="repoType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'new') {
        document.getElementById('newRepoForm').style.display = 'block';
        document.getElementById('existingRepoForm').style.display = 'none';
      } else {
        document.getElementById('newRepoForm').style.display = 'none';
        document.getElementById('existingRepoForm').style.display = 'block';
      }
    });
  });

  document.getElementById('createRepoBtn').addEventListener('click', createNewRepo);
  document.getElementById('loadReposBtn').addEventListener('click', loadRepos);
  document.getElementById('connectRepoBtn').addEventListener('click', connectExistingRepo);

  // Gitignore
  document.getElementById('saveGitignoreBtn').addEventListener('click', saveGitignore);
  document.getElementById('addCommonBtn').addEventListener('click', addCommonPatterns);

  // Branches
  document.getElementById('createBranchBtn').addEventListener('click', createBranch);
  document.getElementById('refreshBranchesBtn').addEventListener('click', refreshBranches);
  document.getElementById('mergeToMainBtn').addEventListener('click', mergeToMain);
}

// Criar novo repositório
async function createNewRepo() {
  if (!currentProject) {
    addLog(elements.publishLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const repoName = document.getElementById('repoName').value.trim();
  if (!repoName) {
    addLog(elements.publishLog, 'Digite um nome para o repositório', 'error');
    return;
  }

  const isPrivate = document.getElementById('isPrivate').checked;
  
  addLog(elements.publishLog, 'Criando repositório...', 'info');
  
  const result = await window.electronAPI.createRepo({
    projectPath: currentProject.path,
    repoName,
    isPrivate
  });

  if (result.success) {
    addLog(elements.publishLog, result.message, 'success');
  } else {
    addLog(elements.publishLog, result.message, 'error');
  }
}

// Carregar repositórios
async function loadRepos() {
  addLog(elements.publishLog, 'Carregando repositórios...', 'info');
  
  const result = await window.electronAPI.listRepos();
  
  if (result.success) {
    displayRepoList(result.repos);
    addLog(elements.publishLog, `${result.repos.length} repositórios encontrados`, 'success');
  } else {
    addLog(elements.publishLog, result.message, 'error');
  }
}

function displayRepoList(repos) {
  const repoList = document.getElementById('repoList');
  repoList.innerHTML = '';
  
  repos.forEach(repo => {
    const item = document.createElement('div');
    item.className = 'repo-item';
    item.textContent = repo.name;
    item.dataset.url = repo.url;
    
    item.addEventListener('click', () => {
      document.querySelectorAll('.repo-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selectedRepo = repo;
      document.getElementById('connectRepoBtn').style.display = 'block';
    });
    
    repoList.appendChild(item);
  });
}

// Conectar a repositório existente
async function connectExistingRepo() {
  if (!currentProject || !selectedRepo) {
    addLog(elements.publishLog, 'Selecione um projeto e um repositório', 'error');
    return;
  }

  addLog(elements.publishLog, 'Conectando ao repositório...', 'info');
  
  const result = await window.electronAPI.connectExistingRepo({
    projectPath: currentProject.path,
    repoUrl: selectedRepo.url
  });

  if (result.success) {
    addLog(elements.publishLog, result.message, 'success');
  } else {
    addLog(elements.publishLog, result.message, 'error');
  }
}

// ========== GITIGNORE ==========

// Carregar gitignore quando mudar para a aba
document.querySelector('[data-section="gitignore"]').addEventListener('click', async () => {
  if (currentProject) {
    const result = await window.electronAPI.getGitignore(currentProject.path);
    if (result.success) {
      document.getElementById('gitignoreContent').value = result.content;
    }
  }
});

async function saveGitignore() {
  if (!currentProject) {
    addLog(elements.gitignoreLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const content = document.getElementById('gitignoreContent').value;
  
  addLog(elements.gitignoreLog, 'Salvando .gitignore...', 'info');
  
  const result = await window.electronAPI.saveGitignore({
    projectPath: currentProject.path,
    content
  });

  if (result.success) {
    addLog(elements.gitignoreLog, result.message, 'success');
  } else {
    addLog(elements.gitignoreLog, result.message, 'error');
  }
}

async function addCommonPatterns() {
  if (!currentProject) {
    addLog(elements.gitignoreLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  addLog(elements.gitignoreLog, 'Adicionando padrões comuns...', 'info');
  
  const result = await window.electronAPI.addCommonPatterns(currentProject.path);

  if (result.success) {
    document.getElementById('gitignoreContent').value = result.content;
    addLog(elements.gitignoreLog, result.message, 'success');
  } else {
    addLog(elements.gitignoreLog, result.message, 'error');
  }
}

// ========== BRANCHES ==========

// Carregar branches quando mudar para a aba
document.querySelector('[data-section="branches"]').addEventListener('click', () => {
  if (currentProject) {
    refreshBranches();
  }
});

async function refreshBranches() {
  if (!currentProject) {
    addLog(elements.branchLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const result = await window.electronAPI.listBranches(currentProject.path);
  
  if (result.success) {
    displayBranches(result.branches, result.current);
  } else {
    addLog(elements.branchLog, result.message, 'error');
  }
}

function displayBranches(branches, currentBranch) {
  const branchList = document.getElementById('branchList');
  branchList.innerHTML = '';
  
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
    branchList.appendChild(item);
  });
}

async function createBranch() {
  if (!currentProject) {
    addLog(elements.branchLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const branchName = document.getElementById('newBranchName').value.trim();
  if (!branchName) {
    addLog(elements.branchLog, 'Digite um nome para a branch', 'error');
    return;
  }

  addLog(elements.branchLog, `Criando branch ${branchName}...`, 'info');
  
  const result = await window.electronAPI.createBranch({
    projectPath: currentProject.path,
    branchName
  });

  if (result.success) {
    addLog(elements.branchLog, result.message, 'success');
    document.getElementById('newBranchName').value = '';
    refreshBranches();
  } else {
    addLog(elements.branchLog, result.message, 'error');
  }
}

async function switchToBranch(branchName) {
  addLog(elements.branchLog, `Trocando para branch ${branchName}...`, 'info');
  
  const result = await window.electronAPI.switchBranch({
    projectPath: currentProject.path,
    branchName
  });

  if (result.success) {
    addLog(elements.branchLog, result.message, 'success');
    refreshBranches();
  } else {
    addLog(elements.branchLog, result.message, 'error');
  }
}

async function pushBranch(branchName) {
  addLog(elements.branchLog, `Enviando branch ${branchName} para GitHub...`, 'info');
  
  const result = await window.electronAPI.pushBranch({
    projectPath: currentProject.path,
    branchName
  });

  if (result.success) {
    addLog(elements.branchLog, result.message, 'success');
  } else {
    addLog(elements.branchLog, result.message, 'error');
  }
}

async function mergeToMain() {
  if (!currentProject) {
    addLog(elements.branchLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  if (!confirm('Deseja mesclar a branch atual com a main e enviar para o GitHub?')) {
    return;
  }

  addLog(elements.branchLog, 'Iniciando merge para main...', 'info');
  
  const result = await window.electronAPI.mergeToMain(currentProject.path);

  if (result.success) {
    addLog(elements.branchLog, result.message, 'success');
    refreshBranches();
  } else {
    addLog(elements.branchLog, result.message, 'error');
  }
}
