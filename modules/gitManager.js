const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs');

// Executar comando com tratamento de erro
async function runCommand(command, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.stderr || error.message };
  }
}

// Login no GitHub
async function githubLogin() {
  return new Promise((resolve) => {
    // Abrir terminal interativo para login
    const loginProcess = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', 'gh auth login && echo. && echo Login concluido! Feche esta janela. && timeout /t 5'], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    loginProcess.unref();
    
    loginProcess.on('error', (error) => {
      resolve({ success: false, message: '✗ Erro ao abrir terminal: ' + error.message });
    });
    
    // Retornar imediatamente com instrução
    resolve({ 
      success: true, 
      message: '📋 Terminal aberto! Complete o login e clique novamente para verificar o status.' 
    });
  });
}

// Verificar status de login
async function checkLoginStatus() {
  const result = await runCommand('gh auth status');
  const loggedIn = result.success || result.output.includes('Logged in');
  
  let username = null;
  if (loggedIn) {
    // Extrair username do output
    const match = result.output.match(/Logged in to github\.com as ([^\s]+)/);
    if (match) {
      username = match[1];
    } else {
      // Tentar obter via gh api
      const userResult = await runCommand('gh api user --jq .login');
      if (userResult.success) {
        username = userResult.output.trim();
      }
    }
  }
  
  return { loggedIn, username };
}

// Verificar se tem remote configurado
async function hasRemote(projectPath) {
  const result = await runCommand('git remote -v', projectPath);
  return result.success && result.output.length > 0;
}

// Verificar se tem branch main
async function hasBranchMain(projectPath) {
  const result = await runCommand('git branch', projectPath);
  return result.output.includes('main') || result.output.includes('master');
}

// Obter informações do remote
async function getRemoteInfo(projectPath) {
  const result = await runCommand('git remote get-url origin', projectPath);
  
  if (!result.success) {
    return null;
  }
  
  const url = result.output.trim();
  
  // Extrair nome do repositório da URL
  // Exemplos: 
  // https://github.com/user/repo.git
  // git@github.com:user/repo.git
  let repoName = null;
  let owner = null;
  
  const httpsMatch = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)(\.git)?$/);
  if (httpsMatch) {
    owner = httpsMatch[1];
    repoName = httpsMatch[2].replace('.git', '');
  }
  
  // Verificar se o repositório existe no GitHub
  let exists = false;
  let isCompatible = false;
  
  if (repoName && owner) {
    const checkResult = await runCommand(`gh repo view ${owner}/${repoName} --json name,owner`);
    exists = checkResult.success;
    
    if (exists) {
      // Verificar se há commits no remoto
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

// Criar novo repositório
async function createNewRepo(projectPath, repoName, isPrivate) {
  const visibility = isPrivate ? '--private' : '--public';
  
  // 1. Inicializar git se necessário
  if (!fs.existsSync(path.join(projectPath, '.git'))) {
    const initResult = await runCommand('git init', projectPath);
    if (!initResult.success) {
      return { success: false, message: 'Erro ao inicializar git: ' + initResult.error };
    }
  }
  
  // 2. Verificar se há arquivos para commitar
  const statusResult = await runCommand('git status --porcelain', projectPath);
  const hasChanges = statusResult.output.length > 0;
  
  if (!hasChanges) {
    return { success: false, message: 'Nenhuma alteração detectada no projeto. Adicione arquivos primeiro.' };
  }
  
  // 3. Adicionar arquivos
  const addResult = await runCommand('git add .', projectPath);
  if (!addResult.success) {
    return { success: false, message: 'Erro ao adicionar arquivos: ' + addResult.error };
  }
  
  // 4. Commit
  const commitResult = await runCommand('git commit -m "initial commit"', projectPath);
  if (!commitResult.success && !commitResult.error.includes('nothing to commit')) {
    return { success: false, message: 'Erro ao fazer commit: ' + commitResult.error };
  }
  
  // 5. Verificar/criar branch main
  const branchResult = await runCommand('git branch', projectPath);
  const hasBranch = branchResult.output.length > 0;
  
  if (!hasBranch) {
    // Criar branch main se não existir
    await runCommand('git checkout -b main', projectPath);
  } else {
    // Renomear branch atual para main
    await runCommand('git branch -M main', projectPath);
  }
  
  // 6. Criar repositório no GitHub
  const createCmd = `gh repo create ${repoName} ${visibility} --source=. --remote=origin --push`;
  const createResult = await runCommand(createCmd, projectPath);
  
  // Tratamento de erros
  if (!createResult.success) {
    // Remote já existe
    if (createResult.error.includes('remote origin already exists')) {
      await runCommand('git remote remove origin', projectPath);
      return await createNewRepo(projectPath, repoName, isPrivate);
    }
    
    // Repositório já existe
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

// Listar repositórios
async function listRepos() {
  const result = await runCommand('gh repo list --limit 100 --json name,url');
  
  if (!result.success) {
    return { success: false, message: 'Erro ao listar repositórios: ' + result.error };
  }
  
  try {
    const repos = JSON.parse(result.output);
    return { success: true, repos };
  } catch (error) {
    return { success: false, message: 'Erro ao processar lista de repositórios' };
  }
}

// Conectar a repositório existente
async function connectExistingRepo(projectPath, repoUrl) {
  // 1. Inicializar git se necessário
  if (!fs.existsSync(path.join(projectPath, '.git'))) {
    const initResult = await runCommand('git init', projectPath);
    if (!initResult.success) {
      return { success: false, message: 'Erro ao inicializar git: ' + initResult.error };
    }
  }
  
  // 2. Remover remote se já existir
  await runCommand('git remote remove origin', projectPath);
  
  // 3. Adicionar remote
  const remoteResult = await runCommand(`git remote add origin ${repoUrl}`, projectPath);
  if (!remoteResult.success) {
    return { success: false, message: 'Erro ao adicionar remote: ' + remoteResult.error };
  }
  
  // 4. Verificar se há arquivos para commitar
  const statusResult = await runCommand('git status --porcelain', projectPath);
  const hasChanges = statusResult.output.length > 0;
  
  if (hasChanges) {
    // Adicionar e commitar arquivos
    await runCommand('git add .', projectPath);
    const commitResult = await runCommand('git commit -m "initial commit"', projectPath);
    
    if (!commitResult.success && !commitResult.error.includes('nothing to commit')) {
      return { success: false, message: 'Erro ao fazer commit: ' + commitResult.error };
    }
  }
  
  // 5. Verificar se branch main existe localmente
  const branchResult = await runCommand('git branch', projectPath);
  const hasBranch = branchResult.output.length > 0;
  
  if (!hasBranch) {
    // Criar branch main se não existir
    await runCommand('git checkout -b main', projectPath);
  } else {
    // Renomear branch atual para main se necessário
    await runCommand('git branch -M main', projectPath);
  }
  
  // 6. Tentar fazer pull primeiro para sincronizar
  const pullResult = await runCommand('git pull origin main --allow-unrelated-histories', projectPath);
  
  // 7. Push
  const pushResult = await runCommand('git push -u origin main', projectPath);
  
  if (!pushResult.success && !pushResult.error.includes('up-to-date')) {
    // Se falhar, pode ser porque o remoto está vazio ou há conflitos
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

// Desconectar repositório
async function disconnectRepo(projectPath) {
  const result = await runCommand('git remote remove origin', projectPath);
  
  if (!result.success && !result.error.includes('No such remote')) {
    return { success: false, message: 'Erro ao desconectar repositório: ' + result.error };
  }
  
  return { success: true, message: '✓ Repositório desconectado' };
}

module.exports = {
  githubLogin,
  checkLoginStatus,
  hasRemote,
  hasBranchMain,
  getRemoteInfo,
  createNewRepo,
  listRepos,
  connectExistingRepo,
  disconnectRepo
};
