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
  return { loggedIn };
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
  
  // 2. Adicionar arquivos
  const addResult = await runCommand('git add .', projectPath);
  if (!addResult.success) {
    return { success: false, message: 'Erro ao adicionar arquivos: ' + addResult.error };
  }
  
  // 3. Commit
  const commitResult = await runCommand('git commit -m "backup"', projectPath);
  if (!commitResult.success && !commitResult.error.includes('nothing to commit')) {
    return { success: false, message: 'Erro ao fazer commit: ' + commitResult.error };
  }
  
  // 4. Criar repositório no GitHub
  const createCmd = `gh repo create ${repoName} ${visibility} --source=. --remote=origin --push`;
  const createResult = await runCommand(createCmd, projectPath);
  
  // Tratamento de erros
  if (!createResult.success) {
    // Remote já existe
    if (createResult.error.includes('remote origin already exists')) {
      await runCommand('git remote remove origin', projectPath);
      return await createNewRepo(projectPath, repoName, isPrivate);
    }
    
    // Branch main não existe
    if (createResult.error.includes('src refspec main')) {
      await runCommand('git branch -M main', projectPath);
      return await createNewRepo(projectPath, repoName, isPrivate);
    }
    
    // Nada para commitar
    if (createResult.error.includes('nothing to commit')) {
      return { success: false, message: 'Nenhuma alteração detectada no projeto' };
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
  
  // 4. Adicionar e commitar arquivos
  await runCommand('git add .', projectPath);
  const commitResult = await runCommand('git commit -m "backup"', projectPath);
  
  // 5. Criar branch main se necessário
  await runCommand('git branch -M main', projectPath);
  
  // 6. Push
  const pushResult = await runCommand('git push -u origin main', projectPath);
  
  if (!pushResult.success && !pushResult.error.includes('up-to-date')) {
    return { success: false, message: 'Erro ao enviar para GitHub: ' + pushResult.error };
  }
  
  return { success: true, message: '✓ Conectado e sincronizado com sucesso!' };
}

module.exports = {
  githubLogin,
  checkLoginStatus,
  hasRemote,
  hasBranchMain,
  createNewRepo,
  listRepos,
  connectExistingRepo
};
