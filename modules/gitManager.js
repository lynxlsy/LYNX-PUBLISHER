const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs');

async function runCommand(command, cwd = process.cwd(), timeout = 30000) {
  try {
    const { stdout, stderr } = await execAsync(command, { 
      cwd,
      timeout,
      maxBuffer: 1024 * 1024 * 10 // 10MB
    });
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    if (error.killed && error.signal === 'SIGTERM') {
      return { success: false, output: '', error: 'Comando excedeu o tempo limite' };
    }
    return { success: false, output: error.stdout || '', error: error.stderr || error.message };
  }
}

async function githubLogin() {
  return new Promise((resolve) => {
    const loginProcess = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', 'gh auth login && echo. && echo Login concluido! Feche esta janela. && timeout /t 5'], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    loginProcess.unref();
    
    loginProcess.on('error', (error) => {
      resolve({ success: false, message: '✗ Erro ao abrir terminal: ' + error.message });
    });
    
    resolve({ 
      success: true, 
      message: '📋 Terminal aberto! Complete o login e clique novamente para verificar o status.' 
    });
  });
}

async function requestDeleteScope() {
  return new Promise((resolve) => {
    const scopeProcess = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', 'gh auth refresh -h github.com -s delete_repo && echo. && echo Autorizacao concluida! Feche esta janela. && timeout /t 5'], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    scopeProcess.unref();
    
    scopeProcess.on('error', (error) => {
      resolve({ success: false, message: '✗ Erro ao abrir terminal: ' + error.message });
    });
    
    resolve({ 
      success: true, 
      message: '📋 Terminal aberto! Complete a autorização no navegador e tente excluir novamente.' 
    });
  });
}

async function checkLoginStatus() {
  const result = await runCommand('gh auth status');
  const loggedIn = result.success || result.output.includes('Logged in');
  
  let username = null;
  if (loggedIn) {
    const match = result.output.match(/Logged in to github\.com as ([^\s]+)/);
    if (match) {
      username = match[1];
    } else {
      const userResult = await runCommand('gh api user --jq .login');
      if (userResult.success) {
        username = userResult.output.trim();
      }
    }
  }
  
  return { loggedIn, username };
}

async function hasRemote(projectPath) {
  const result = await runCommand('git remote -v', projectPath);
  return result.success && result.output.length > 0;
}

async function hasBranchMain(projectPath) {
  const result = await runCommand('git branch', projectPath);
  return result.output.includes('main') || result.output.includes('master');
}

async function getRemoteInfo(projectPath) {
  const result = await runCommand('git remote get-url origin', projectPath);
  
  if (!result.success) {
    return null;
  }
  
  const url = result.output.trim();
  
  let repoName = null;
  let owner = null;
  
  const httpsMatch = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)(\.git)?$/);
  if (httpsMatch) {
    owner = httpsMatch[1];
    repoName = httpsMatch[2].replace('.git', '');
  }
  
  let exists = false;
  let isCompatible = false;
  
  if (repoName && owner) {
    const checkResult = await runCommand(`gh repo view ${owner}/${repoName} --json name,owner`);
    exists = checkResult.success;
    
    if (exists) {
      const logResult = await runCommand('git log origin/main --oneline -1', projectPath);
      isCompatible = logResult.success;
    }
  }
  
  return {
    url,
    repoName,
    owner,
    fullName: owner && repoName ? `${owner}/${repoName}` : null,
    exists,
    isCompatible
  };
}

async function createNewRepo(projectPath, repoName, isPrivate) {
  const visibility = isPrivate ? '--private' : '--public';
  
  if (!fs.existsSync(path.join(projectPath, '.git'))) {
    const initResult = await runCommand('git init', projectPath);
    if (!initResult.success) {
      return { success: false, message: 'Erro ao inicializar git: ' + initResult.error };
    }
  }
  
  const files = fs.readdirSync(projectPath);
  const hasFiles = files.some(file => file !== '.git' && !file.startsWith('.'));
  
  if (!hasFiles) {
    return { 
      success: false, 
      message: 'A pasta está vazia. Adicione arquivos ao projeto antes de criar o repositório.',
      isEmpty: true
    };
  }
  
  const statusResult = await runCommand('git status --porcelain', projectPath);
  const hasChanges = statusResult.output.length > 0;
  
  if (!hasChanges) {
    return { 
      success: false, 
      message: 'Todos os arquivos estão sendo ignorados pelo .gitignore. Verifique seu .gitignore ou adicione mais arquivos.',
      allIgnored: true
    };
  }
  
  const addResult = await runCommand('git add .', projectPath);
  if (!addResult.success) {
    return { success: false, message: 'Erro ao adicionar arquivos: ' + addResult.error };
  }
  
  const commitResult = await runCommand('git commit -m "initial commit"', projectPath);
  if (!commitResult.success && !commitResult.error.includes('nothing to commit')) {
    return { success: false, message: 'Erro ao fazer commit: ' + commitResult.error };
  }
  
  const branchResult = await runCommand('git branch', projectPath);
  const hasBranch = branchResult.output.length > 0;
  
  if (!hasBranch) {
    await runCommand('git checkout -b main', projectPath);
  } else {
    await runCommand('git branch -M main', projectPath);
  }
  
  const createCmd = `gh repo create ${repoName} ${visibility} --source=. --remote=origin --push`;
  const createResult = await runCommand(createCmd, projectPath);
  
  if (!createResult.success) {
    if (createResult.error.includes('remote origin already exists')) {
      await runCommand('git remote remove origin', projectPath);
      return await createNewRepo(projectPath, repoName, isPrivate);
    }
    
    if (createResult.error.includes('already exists')) {
      return { 
        success: false, 
        message: 'Repositório já existe no GitHub. Use "Conectar a repositório existente" ou escolha outro nome.' 
      };
    }
    
    return { success: false, message: 'Erro ao criar repositório: ' + createResult.error };
  }
  
  return { success: true, message: '✓ Repositório criado e publicado com sucesso!' };
}

async function listRepos() {
  try {
    const result = await runCommand('gh repo list --limit 100 --json name,url');
    
    if (!result.success) {
      if (result.error.includes('not logged') || result.error.includes('authentication')) {
        return { success: false, message: 'GitHub CLI não está autenticado. Faça login novamente.' };
      }
      return { success: false, message: 'Erro ao listar repositórios: ' + result.error };
    }
    
    if (!result.output || result.output.trim() === '') {
      return { success: true, repos: [] };
    }
    
    const repos = JSON.parse(result.output);
    return { success: true, repos };
  } catch (error) {
    return { success: false, message: 'Erro ao processar lista de repositórios: ' + error.message };
  }
}

async function connectExistingRepo(projectPath, repoUrl) {
  if (!fs.existsSync(path.join(projectPath, '.git'))) {
    const initResult = await runCommand('git init', projectPath);
    if (!initResult.success) {
      return { success: false, message: 'Erro ao inicializar git: ' + initResult.error };
    }
  }
  
  await runCommand('git remote remove origin', projectPath);
  
  const remoteResult = await runCommand(`git remote add origin ${repoUrl}`, projectPath);
  if (!remoteResult.success) {
    return { success: false, message: 'Erro ao adicionar remote: ' + remoteResult.error };
  }
  
  const statusResult = await runCommand('git status --porcelain', projectPath);
  const hasChanges = statusResult.output.length > 0;
  
  if (hasChanges) {
    await runCommand('git add .', projectPath);
    const commitResult = await runCommand('git commit -m "initial commit"', projectPath);
    
    if (!commitResult.success && !commitResult.error.includes('nothing to commit')) {
      return { success: false, message: 'Erro ao fazer commit: ' + commitResult.error };
    }
  }
  
  const branchResult = await runCommand('git branch', projectPath);
  const hasBranch = branchResult.output.length > 0;
  
  if (!hasBranch) {
    await runCommand('git checkout -b main', projectPath);
  } else {
    await runCommand('git branch -M main', projectPath);
  }
  
  const pullResult = await runCommand('git pull origin main --allow-unrelated-histories', projectPath);
  
  const pushResult = await runCommand('git push -u origin main', projectPath);
  
  if (!pushResult.success && !pushResult.error.includes('up-to-date')) {
    if (pushResult.error.includes('non-fast-forward')) {
      return { 
        success: false, 
        message: 'Há divergências com o remoto. Use "git pull" na aba Git para sincronizar primeiro.' 
      };
    }
    return { success: false, message: 'Erro ao enviar para GitHub: ' + pushResult.error };
  }
  
  return { success: true, message: '✓ Conectado e sincronizado com sucesso!' };
}

async function disconnectRepo(projectPath) {
  const result = await runCommand('git remote remove origin', projectPath);
  
  if (!result.success && !result.error.includes('No such remote')) {
    return { success: false, message: 'Erro ao desconectar repositório: ' + result.error };
  }
  
  return { success: true, message: '✓ Repositório desconectado' };
}

async function deleteRepo(repoName) {
  try {
    console.log(`[deleteRepo] Starting deletion for: ${repoName}`);
    
    // Get current user to construct full repo name
    const userResult = await runCommand('gh api user --jq .login');
    console.log('[deleteRepo] User result:', userResult);
    
    if (!userResult.success) {
      console.error('[deleteRepo] Failed to get user:', userResult.error);
      return { 
        success: false, 
        message: 'Erro ao obter usuário do GitHub. Verifique se está logado com "gh auth login"',
        error: userResult.error 
      };
    }
    
    const username = userResult.output.trim();
    console.log('[deleteRepo] Username:', username);
    
    if (!username) {
      return { 
        success: false, 
        message: 'Não foi possível obter o nome de usuário. Faça login novamente com "gh auth login"' 
      };
    }
    
    const fullRepoName = `${username}/${repoName}`;
    console.log(`[deleteRepo] Full repo name: ${fullRepoName}`);
    
    // Check if repo exists first
    const checkResult = await runCommand(`gh repo view ${fullRepoName} --json name`);
    console.log('[deleteRepo] Check result:', checkResult);
    
    if (!checkResult.success) {
      console.error('[deleteRepo] Repo not found or no access:', checkResult.error);
      return { 
        success: false, 
        message: `Repositório "${repoName}" não encontrado ou você não tem acesso a ele`,
        error: checkResult.error
      };
    }
    
    // Delete repository using GitHub CLI with --confirm flag
    console.log(`[deleteRepo] Executing delete command for: ${fullRepoName}`);
    const deleteResult = await runCommand(`gh repo delete ${fullRepoName} --yes`, process.cwd(), 60000);
    console.log('[deleteRepo] Delete result:', deleteResult);
    
    if (!deleteResult.success) {
      console.error('[deleteRepo] Delete failed:', deleteResult.error);
      
      // Parse common errors
      if (deleteResult.error.includes('delete_repo') || deleteResult.error.includes('scope')) {
        return { 
          success: false, 
          message: 'Permissão "delete_repo" necessária',
          needsScope: true,
          scopeCommand: 'gh auth refresh -h github.com -s delete_repo',
          error: deleteResult.error
        };
      }
      
      if (deleteResult.error.includes('not found')) {
        return { 
          success: false, 
          message: 'Repositório não encontrado no GitHub',
          error: deleteResult.error
        };
      }
      
      if (deleteResult.error.includes('403') || deleteResult.error.includes('permission')) {
        return { 
          success: false, 
          message: 'Você não tem permissão para excluir este repositório. Apenas o dono pode excluir.',
          error: deleteResult.error
        };
      }
      
      if (deleteResult.error.includes('API rate limit')) {
        return { 
          success: false, 
          message: 'Limite de requisições da API do GitHub excedido. Aguarde alguns minutos e tente novamente.',
          error: deleteResult.error
        };
      }
      
      return { 
        success: false, 
        message: 'Erro ao excluir repositório: ' + (deleteResult.error || 'Erro desconhecido'),
        error: deleteResult.error
      };
    }
    
    console.log(`[deleteRepo] Successfully deleted: ${fullRepoName}`);
    return { 
      success: true, 
      message: `✓ Repositório ${repoName} excluído com sucesso` 
    };
  } catch (error) {
    console.error('[deleteRepo] Exception:', error);
    return { 
      success: false, 
      message: 'Erro inesperado ao excluir repositório: ' + error.message,
      error: error.message
    };
  }
}

module.exports = {
  githubLogin,
  checkLoginStatus,
  requestDeleteScope,
  hasRemote,
  hasBranchMain,
  getRemoteInfo,
  createNewRepo,
  listRepos,
  connectExistingRepo,
  disconnectRepo,
  deleteRepo
};
