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
  branchLog: document.getElementById('branchLog'),
  // Indicadores de projeto
  projectIndicator: document.getElementById('projectIndicator'),
  projectName: document.getElementById('projectName'),
  projectPath: document.getElementById('projectPath'),
  repoInfo: document.getElementById('repoInfo')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  setupEventListeners();
  setupNavigation();
  showNoProjectWarnings(); // Mostrar avisos iniciais
});

// Verificar status de login
async function checkLoginStatus() {
  const result = await window.electronAPI.checkLoginStatus();
  updateLoginStatus(result.loggedIn, result.username);
}

function updateLoginStatus(loggedIn, username = null) {
  if (loggedIn) {
    elements.statusIndicator.className = 'status-indicator logged-in';
    elements.statusText.textContent = username ? `🟢 ${username}` : '🟢 Logado';
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
    const statusResult = await window.electronAPI.checkLoginStatus();
    updateLoginStatus(statusResult.loggedIn, statusResult.username);
    elements.loginBtn.disabled = false;
    elements.loginBtn.textContent = 'Login GitHub';
    loginInProgress = false;
    
    if (statusResult.loggedIn) {
      addLog(elements.publishLog, `✓ Logado como: ${statusResult.username}`, 'success');
    }
  }, 2000);
});

// Selecionar projeto
elements.selectProjectBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.selectProject();
  
  if (result.success) {
    currentProject = result;
    displayProjectInfo(result);
    updateProjectIndicator(result);
    updateAllSectionHeaders(result);
    
    addLog(elements.publishLog, 'Projeto carregado com sucesso', 'success');
    
    const currentRepoCard = document.getElementById('currentRepoCard');
    const remoteCard = document.getElementById('remoteDetectedCard');
    const publishCard = document.getElementById('publishCard');
    
    // Sempre mostrar o card de publicação
    publishCard.style.display = 'block';
    
    if (result.remoteInfo && result.remoteInfo.exists) {
      // Tem repositório conectado e válido
      currentRepoCard.style.display = 'block';
      remoteCard.style.display = 'block';
      
      updateCurrentRepoCard(result.remoteInfo);
      
      addLog(elements.publishLog, `📡 Repositório remoto detectado: ${result.remoteInfo.fullName}`, 'info');
      
      if (result.remoteInfo.isCompatible) {
        addLog(elements.publishLog, '✓ Projeto compatível com repositório remoto', 'success');
      } else {
        addLog(elements.publishLog, '⚠️ Pode haver divergências com o remoto. Use "Sincronizar" para atualizar', 'info');
      }
    } else {
      // Não tem repositório ou está inválido
      remoteCard.style.display = 'none';
      
      if (result.remoteInfo && !result.remoteInfo.exists) {
        // Remote configurado mas inválido
        currentRepoCard.style.display = 'block';
        updateCurrentRepoCard(result.remoteInfo);
        addLog(elements.publishLog, '⚠️ Remote configurado mas repositório não encontrado no GitHub', 'error');
      } else {
        // Sem remote
        currentRepoCard.style.display = 'none';
        
        if (!result.hasGit) {
          addLog(elements.publishLog, 'ℹ️ Git não inicializado. Você pode criar um novo repositório', 'info');
        } else if (!result.hasRemote) {
          addLog(elements.publishLog, 'ℹ️ Nenhum remote configurado. Você pode conectar a um repositório', 'info');
        }
      }
    }
  } else {
    addLog(elements.publishLog, result.message, 'error');
  }
});

function updateCurrentRepoCard(remoteInfo) {
  const infoDiv = document.getElementById('currentRepoInfo');
  
  let html = '';
  
  if (remoteInfo.fullName) {
    html += `<p style="font-size: 16px; font-weight: 500; color: #4a9eff; margin-bottom: 10px;">
      ${remoteInfo.fullName}
    </p>`;
  }
  
  html += `<p style="font-size: 12px; color: #888; margin-bottom: 10px;">
    ${remoteInfo.url}
  </p>`;
  
  if (remoteInfo.exists) {
    html += `<p style="color: #4caf50; font-size: 13px;">✓ Repositório ativo no GitHub</p>`;
    if (remoteInfo.isCompatible) {
      html += `<p style="color: #4caf50; font-size: 13px;">✓ Sincronizado</p>`;
    } else {
      html += `<p style="color: #ff9800; font-size: 13px;">⚠️ Pode ter divergências</p>`;
    }
  } else {
    html += `<p style="color: #f44336; font-size: 13px;">✗ Repositório não encontrado no GitHub</p>`;
  }
  
  infoDiv.innerHTML = html;
}

// Ações rápidas - Sincronizar com remoto
document.getElementById('syncWithRemoteBtn').addEventListener('click', async () => {
  if (!currentProject) return;
  
  addLog(elements.publishLog, 'Sincronizando com repositório remoto...', 'info');
  const result = await window.electronAPI.gitPull(currentProject.path);
  
  addLog(elements.publishLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    addLog(elements.publishLog, '✓ Projeto atualizado com alterações do GitHub', 'success');
  }
});

// Ações rápidas - Push para remoto
document.getElementById('pushToRemoteBtn').addEventListener('click', async () => {
  if (!currentProject) return;
  
  addLog(elements.publishLog, 'Enviando alterações para GitHub...', 'info');
  const result = await window.electronAPI.gitPush({
    projectPath: currentProject.path,
    force: false
  });
  
  addLog(elements.publishLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    addLog(elements.publishLog, '✓ Alterações enviadas para o GitHub', 'success');
  }
});

// Trocar repositório
document.getElementById('changeRepoBtn').addEventListener('click', () => {
  if (!currentProject) return;
  
  // Rolar para o card de publicação
  document.getElementById('publishCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Destacar o card de publicação temporariamente
  const publishCard = document.getElementById('publishCard');
  publishCard.style.boxShadow = '0 0 20px rgba(74, 158, 255, 0.5)';
  setTimeout(() => {
    publishCard.style.boxShadow = '';
  }, 2000);
  
  addLog(elements.publishLog, '👇 Use o formulário abaixo para conectar a outro repositório', 'info');
});

// Desconectar repositório
document.getElementById('disconnectRepoBtn').addEventListener('click', async () => {
  if (!currentProject) return;
  
  if (!confirm('Deseja desconectar o repositório remoto? Você poderá conectar outro depois.')) {
    return;
  }
  
  addLog(elements.publishLog, 'Desconectando repositório...', 'info');
  const result = await window.electronAPI.disconnectRepo(currentProject.path);
  
  addLog(elements.publishLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    // Atualizar estado do projeto
    currentProject.hasRemote = false;
    currentProject.remoteInfo = null;
    
    // Atualizar interface
    document.getElementById('currentRepoCard').style.display = 'none';
    document.getElementById('remoteDetectedCard').style.display = 'none';
    
    updateProjectIndicator(currentProject);
    displayProjectInfo(currentProject);
    
    addLog(elements.publishLog, 'Agora você pode conectar a outro repositório usando o formulário abaixo', 'info');
  }
});

function displayProjectInfo(project) {
  elements.projectInfo.style.display = 'block';
  
  let html = `
    <p><strong>Caminho:</strong> ${project.path}</p>
    <p><strong>Git inicializado:</strong> ${project.hasGit ? '✓ Sim' : '✗ Não'}</p>
    <p><strong>Remote configurado:</strong> ${project.hasRemote ? '✓ Sim' : '✗ Não'}</p>
    <p><strong>Branch main:</strong> ${project.hasBranchMain ? '✓ Sim' : '✗ Não'}</p>
  `;
  
  // Mostrar informações do repositório remoto
  if (project.remoteInfo) {
    html += `<hr style="margin: 15px 0; border: none; border-top: 1px solid #444;">`;
    html += `<p style="color: #4a9eff; font-weight: 500;">📡 Repositório Remoto Detectado</p>`;
    
    if (project.remoteInfo.fullName) {
      html += `<p><strong>Repositório:</strong> ${project.remoteInfo.fullName}</p>`;
    }
    
    html += `<p><strong>URL:</strong> <span style="font-size: 11px; color: #888;">${project.remoteInfo.url}</span></p>`;
    
    if (project.remoteInfo.exists) {
      html += `<p style="color: #4caf50;">✓ Repositório existe no GitHub</p>`;
      
      if (project.remoteInfo.isCompatible) {
        html += `<p style="color: #4caf50;">✓ Compatível com o projeto local</p>`;
      } else {
        html += `<p style="color: #ff9800;">⚠️ Pode haver divergências com o remoto</p>`;
      }
    } else {
      html += `<p style="color: #f44336;">✗ Repositório não encontrado no GitHub</p>`;
      html += `<p style="color: #888; font-size: 12px;">O remote pode estar configurado incorretamente</p>`;
    }
  }
  
  elements.projectInfo.innerHTML = html;
}

function updateProjectIndicator(project) {
  const path = require('path');
  const projectName = project.path.split(/[/\\]/).pop();
  
  elements.projectIndicator.classList.add('active');
  elements.projectName.textContent = `📁 ${projectName}`;
  elements.projectPath.textContent = project.path;
  
  let repoStatus = [];
  if (project.hasGit) repoStatus.push('Git ✓');
  if (project.hasRemote) repoStatus.push('Remote ✓');
  if (project.hasBranchMain) repoStatus.push('Main ✓');
  
  // Mostrar nome do repositório se disponível
  if (project.remoteInfo && project.remoteInfo.fullName) {
    elements.repoInfo.textContent = `📡 ${project.remoteInfo.fullName}`;
    elements.repoInfo.style.color = project.remoteInfo.exists ? '#4caf50' : '#ff9800';
  } else if (repoStatus.length > 0) {
    elements.repoInfo.textContent = repoStatus.join(' • ');
    elements.repoInfo.style.color = '#4caf50';
  } else {
    elements.repoInfo.textContent = 'Git não inicializado';
    elements.repoInfo.style.color = '#888';
  }
}

function updateAllSectionHeaders(project) {
  const projectName = project.path.split(/[/\\]/).pop();
  const projectText = `📁 Projeto atual: ${projectName}`;
  
  // Atualizar cada seção
  const sections = ['publish', 'git', 'gitignore', 'branches'];
  sections.forEach(section => {
    const infoElement = document.getElementById(`${section}ProjectInfo`);
    if (infoElement) {
      infoElement.textContent = projectText;
    }
    
    // Esconder avisos de "sem projeto"
    const warningElement = document.getElementById(`${section}NoProject`);
    if (warningElement) {
      warningElement.style.display = 'none';
    }
  });
}

function showNoProjectWarnings() {
  const sections = ['git', 'gitignore', 'branches'];
  sections.forEach(section => {
    const warningElement = document.getElementById(`${section}NoProject`);
    if (warningElement) {
      warningElement.style.display = 'block';
    }
  });
}

function addLog(logElement, message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  // Adicionar ícone baseado no tipo
  let icon = '';
  switch(type) {
    case 'success': icon = '✓'; break;
    case 'error': icon = '✗'; break;
    case 'info': icon = '→'; break;
  }
  
  entry.textContent = `${icon} [${new Date().toLocaleTimeString()}] ${message}`;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
  
  // Limitar a 50 entradas
  while (logElement.children.length > 50) {
    logElement.removeChild(logElement.firstChild);
  }
  
  // Garantir que a área de log está visível
  if (logElement.children.length === 1) {
    logElement.parentElement.style.display = 'block';
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
    
    // Obter username do GitHub
    const statusResult = await window.electronAPI.checkLoginStatus();
    const username = statusResult.username || 'usuario';
    
    // Atualizar informações do projeto
    currentProject.hasRemote = true;
    currentProject.repoName = repoName;
    currentProject.remoteInfo = {
      url: `https://github.com/${username}/${repoName}.git`,
      repoName: repoName,
      owner: username,
      fullName: `${username}/${repoName}`,
      exists: true,
      isCompatible: true
    };
    
    // Atualizar interface
    updateProjectIndicator(currentProject);
    updateRepoConnected(repoName);
    
    // Mostrar card de repositório atual
    document.getElementById('currentRepoCard').style.display = 'block';
    document.getElementById('remoteDetectedCard').style.display = 'block';
    updateCurrentRepoCard(currentProject.remoteInfo);
    
    addLog(elements.publishLog, `✓ Repositório criado: ${username}/${repoName}`, 'success');
  } else {
    addLog(elements.publishLog, result.message, 'error');
  }
}

function updateRepoConnected(repoName) {
  elements.repoInfo.textContent = `📡 ${repoName}`;
  elements.repoInfo.style.color = '#4caf50';
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
  addLog(elements.publishLog, 'Verificando arquivos locais...', 'info');
  
  const result = await window.electronAPI.connectExistingRepo({
    projectPath: currentProject.path,
    repoUrl: selectedRepo.url
  });

  if (result.success) {
    addLog(elements.publishLog, result.message, 'success');
    
    // Atualizar informações do projeto
    currentProject.hasRemote = true;
    currentProject.repoName = selectedRepo.name;
    currentProject.remoteInfo = {
      url: selectedRepo.url,
      repoName: selectedRepo.name,
      owner: selectedRepo.url.match(/github\.com[/:]([\w-]+)/)?.[1],
      fullName: selectedRepo.name,
      exists: true,
      isCompatible: true
    };
    
    // Atualizar interface
    updateProjectIndicator(currentProject);
    updateRepoConnected(selectedRepo.name);
    
    // Mostrar card de repositório atual
    document.getElementById('currentRepoCard').style.display = 'block';
    document.getElementById('remoteDetectedCard').style.display = 'block';
    updateCurrentRepoCard(currentProject.remoteInfo);
    
    addLog(elements.publishLog, `✓ Conectado ao repositório: ${selectedRepo.name}`, 'success');
    addLog(elements.publishLog, 'Você pode usar as Ações Rápidas para sincronizar', 'info');
  } else {
    addLog(elements.publishLog, result.message, 'error');
    
    // Dar dicas baseado no erro
    if (result.message.includes('divergências')) {
      addLog(elements.publishLog, 'Dica: Vá para aba Git e use "git pull" para sincronizar', 'info');
    }
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

  addLog(elements.branchLog, result.message, result.success ? 'success' : 'error');
  
  if (!result.success) {
    // Sugerir ações baseadas no erro
    if (result.needsCommit) {
      addLog(elements.branchLog, '💡 Dica: Vá para aba Git e faça commit das alterações', 'info');
      addLog(elements.branchLog, '💡 Ou use "Stash" para guardar temporariamente', 'info');
      showBranchProblem('needsCommit', branchName);
    } else if (result.hasConflicts) {
      addLog(elements.branchLog, '💡 Dica: Resolva os conflitos no seu editor de código', 'info');
      addLog(elements.branchLog, '💡 Ou use "git reset --hard" no terminal para descartar tudo', 'info');
      showBranchProblem('hasConflicts', branchName);
    }
  } else {
    hideBranchProblem();
    refreshBranches();
  }
}

async function pushBranch(branchName) {
  addLog(elements.branchLog, `Enviando branch ${branchName} para GitHub...`, 'info');
  
  const result = await window.electronAPI.pushBranch({
    projectPath: currentProject.path,
    branchName
  });

  addLog(elements.branchLog, result.message, result.success ? 'success' : 'error');
  
  if (!result.success) {
    // Sugerir ações baseadas no erro
    if (result.needsPull) {
      addLog(elements.branchLog, '💡 Dica: Vá para aba Git e clique em "Pull" para sincronizar', 'info');
      addLog(elements.branchLog, '💡 Depois tente fazer push novamente', 'info');
      showBranchProblem('needsPull', branchName);
    } else if (result.serverError) {
      addLog(elements.branchLog, '💡 Dica: Aguarde alguns segundos e tente novamente', 'info');
      addLog(elements.branchLog, '💡 Se persistir, verifique sua conexão com a internet', 'info');
      showBranchProblem('serverError', branchName);
    }
  } else {
    hideBranchProblem();
  }
}

function showBranchProblem(type, branchName) {
  const card = document.getElementById('branchProblemsCard');
  const info = document.getElementById('branchProblemInfo');
  const actions = document.getElementById('branchProblemActions');
  
  card.style.display = 'block';
  actions.innerHTML = '';
  
  switch(type) {
    case 'needsCommit':
      info.textContent = 'Você tem alterações não commitadas. Escolha uma ação:';
      
      const commitBtn = document.createElement('button');
      commitBtn.textContent = 'Ir para Aba Git (Commit)';
      commitBtn.onclick = () => {
        document.querySelector('[data-section="git"]').click();
        hideBranchProblem();
      };
      
      const stashBtn = document.createElement('button');
      stashBtn.textContent = 'Guardar Alterações (Stash)';
      stashBtn.className = 'secondary';
      stashBtn.onclick = async () => {
        const result = await window.electronAPI.gitStash(currentProject.path);
        addLog(elements.branchLog, result.message, result.success ? 'success' : 'error');
        if (result.success) {
          hideBranchProblem();
          switchToBranch(branchName);
        }
      };
      
      actions.appendChild(commitBtn);
      actions.appendChild(stashBtn);
      break;
      
    case 'hasConflicts':
      info.textContent = 'Há conflitos não resolvidos. Resolva manualmente ou descarte:';
      
      const openEditorBtn = document.createElement('button');
      openEditorBtn.textContent = 'Abrir no Editor';
      openEditorBtn.onclick = () => {
        addLog(elements.branchLog, 'Abra o projeto no seu editor de código favorito', 'info');
        hideBranchProblem();
      };
      
      actions.appendChild(openEditorBtn);
      break;
      
    case 'needsPull':
      info.textContent = 'A branch local está atrás do remoto. Sincronize primeiro:';
      
      const pullBtn = document.createElement('button');
      pullBtn.textContent = 'Sincronizar (Pull)';
      pullBtn.onclick = async () => {
        addLog(elements.branchLog, 'Sincronizando com GitHub...', 'info');
        const result = await window.electronAPI.gitPull(currentProject.path);
        addLog(elements.branchLog, result.message, result.success ? 'success' : 'error');
        if (result.success) {
          hideBranchProblem();
          addLog(elements.branchLog, 'Agora você pode fazer push novamente', 'info');
        }
      };
      
      actions.appendChild(pullBtn);
      break;
      
    case 'serverError':
      info.textContent = 'Erro no servidor GitHub. Tente novamente:';
      
      const retryBtn = document.createElement('button');
      retryBtn.textContent = 'Tentar Novamente';
      retryBtn.onclick = () => {
        hideBranchProblem();
        pushBranch(branchName);
      };
      
      actions.appendChild(retryBtn);
      break;
  }
  
  // Rolar até o card
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideBranchProblem() {
  document.getElementById('branchProblemsCard').style.display = 'none';
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

// ========== GIT OPERATIONS ==========

const gitLog = document.getElementById('gitLog');

// Adicionar mensagem inicial
if (gitLog) {
  gitLog.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Aguardando operações Git...</div>';
}

// Mostrar/ocultar input de arquivo específico
document.querySelectorAll('input[name="addType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const specificInput = document.getElementById('specificFileInput');
    specificInput.style.display = e.target.value === 'specific' ? 'block' : 'none';
  });
});

// Atualizar placeholder da mensagem de commit baseado no tipo
document.getElementById('commitType').addEventListener('change', (e) => {
  const messageInput = document.getElementById('commitMessage');
  if (e.target.value === 'custom') {
    messageInput.placeholder = 'mensagem completa do commit';
  } else {
    messageInput.placeholder = 'descrição das alterações';
  }
});

// Git init
document.getElementById('gitInitBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  addLog(gitLog, 'Inicializando repositório Git...', 'info');
  const result = await window.electronAPI.gitInit(currentProject.path);
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    currentProject.hasGit = true;
    displayProjectInfo(currentProject);
    updateProjectIndicator(currentProject);
    addLog(gitLog, 'Repositório Git pronto para uso!', 'success');
    addLog(gitLog, 'Próximo passo: Adicionar arquivos com "git add"', 'info');
  }
});

// Git status
document.getElementById('gitStatusBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  addLog(gitLog, 'Obtendo status...', 'info');
  const result = await window.electronAPI.gitStatus(currentProject.path);
  
  if (result.success) {
    const output = document.getElementById('gitStatusOutput');
    output.style.display = 'block';
    output.textContent = result.output;
    addLog(gitLog, '✓ Status obtido', 'success');
  } else {
    addLog(gitLog, result.message, 'error');
  }
});

// Git add
document.getElementById('gitAddBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const addType = document.querySelector('input[name="addType"]:checked').value;
  let files = '.';
  
  if (addType === 'specific') {
    files = document.getElementById('specificFile').value.trim();
    if (!files) {
      addLog(gitLog, 'Digite o caminho do arquivo', 'error');
      return;
    }
  }

  addLog(gitLog, `Adicionando arquivos: ${files}...`, 'info');
  const result = await window.electronAPI.gitAdd({
    projectPath: currentProject.path,
    files
  });
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    addLog(gitLog, 'Próximo passo: Fazer commit com uma mensagem', 'info');
  }
});

// Git commit
document.getElementById('gitCommitBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const commitType = document.getElementById('commitType').value;
  const messageText = document.getElementById('commitMessage').value.trim();
  
  if (!messageText) {
    addLog(gitLog, 'Digite uma mensagem de commit', 'error');
    return;
  }

  let fullMessage;
  if (commitType === 'custom') {
    fullMessage = messageText;
  } else {
    fullMessage = `${commitType}: ${messageText}`;
  }

  addLog(gitLog, `Fazendo commit: "${fullMessage}"`, 'info');
  const result = await window.electronAPI.gitCommit({
    projectPath: currentProject.path,
    message: fullMessage
  });
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    document.getElementById('commitMessage').value = '';
    addLog(gitLog, 'Commit criado! Use "Push" para enviar ao GitHub', 'info');
  }
});

// Git push
document.getElementById('gitPushBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const force = document.getElementById('forcePush').checked;
  
  if (force && !confirm('⚠️ Force push pode sobrescrever alterações remotas. Continuar?')) {
    addLog(gitLog, 'Force push cancelado', 'info');
    return;
  }

  addLog(gitLog, force ? 'Enviando para GitHub (force)...' : 'Enviando para GitHub...', 'info');
  const result = await window.electronAPI.gitPush({
    projectPath: currentProject.path,
    force
  });
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    addLog(gitLog, 'Código sincronizado com GitHub!', 'success');
  }
});

// Git pull
document.getElementById('gitPullBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  addLog(gitLog, 'Baixando alterações do GitHub...', 'info');
  const result = await window.electronAPI.gitPull(currentProject.path);
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
  
  if (result.success) {
    addLog(gitLog, 'Projeto atualizado com alterações remotas!', 'success');
  }
});

// Git log
document.getElementById('gitLogBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  const limit = parseInt(document.getElementById('logLimit').value) || 10;

  addLog(gitLog, 'Obtendo histórico...', 'info');
  const result = await window.electronAPI.gitLog({
    projectPath: currentProject.path,
    limit
  });
  
  if (result.success) {
    const output = document.getElementById('gitLogOutput');
    output.style.display = 'block';
    output.textContent = result.output;
    addLog(gitLog, '✓ Histórico obtido', 'success');
  } else {
    addLog(gitLog, result.message, 'error');
  }
});

// Git reset
document.getElementById('gitResetBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  if (!confirm('Deseja desfazer o último commit? (arquivos serão mantidos)')) {
    return;
  }

  addLog(gitLog, 'Desfazendo último commit...', 'info');
  const result = await window.electronAPI.gitReset(currentProject.path);
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
});

// Git stash
document.getElementById('gitStashBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  addLog(gitLog, 'Guardando alterações...', 'info');
  const result = await window.electronAPI.gitStash(currentProject.path);
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
});

// Git stash pop
document.getElementById('gitStashPopBtn').addEventListener('click', async () => {
  if (!currentProject) {
    addLog(gitLog, 'Selecione um projeto primeiro', 'error');
    return;
  }

  addLog(gitLog, 'Recuperando alterações...', 'info');
  const result = await window.electronAPI.gitStashPop(currentProject.path);
  
  addLog(gitLog, result.message, result.success ? 'success' : 'error');
});
