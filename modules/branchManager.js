const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Executar comando
async function runCommand(command, cwd) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.stderr || error.message };
  }
}

// Listar branches
async function listBranches(projectPath) {
  const result = await runCommand('git branch', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao listar branches: ' + result.error };
  }
  
  const branches = result.output
    .split('\n')
    .map(b => b.trim().replace('* ', ''))
    .filter(b => b.length > 0);
  
  const currentResult = await getCurrentBranch(projectPath);
  
  return {
    success: true,
    branches,
    current: currentResult.branch
  };
}

// Obter branch atual
async function getCurrentBranch(projectPath) {
  const result = await runCommand('git branch --show-current', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao obter branch atual' };
  }
  
  return { success: true, branch: result.output };
}

// Criar nova branch
async function createBranch(projectPath, branchName) {
  const result = await runCommand(`git checkout -b ${branchName}`, projectPath);
  
  if (!result.success) {
    if (result.error.includes('already exists')) {
      return { success: false, message: 'Branch já existe' };
    }
    return { success: false, message: 'Erro ao criar branch: ' + result.error };
  }
  
  return { success: true, message: `✓ Branch ${branchName} criada e ativada` };
}

// Trocar de branch
async function switchBranch(projectPath, branchName) {
  // Verificar se há alterações não commitadas
  const statusResult = await runCommand('git status --porcelain', projectPath);
  if (statusResult.output.length > 0) {
    return { 
      success: false, 
      message: 'Você tem alterações não commitadas. Faça commit ou use stash antes de trocar de branch.',
      needsCommit: true
    };
  }
  
  const result = await runCommand(`git checkout ${branchName}`, projectPath);
  
  if (!result.success) {
    if (result.error.includes('resolve your current index')) {
      return { 
        success: false, 
        message: 'Há conflitos não resolvidos. Resolva os conflitos ou use "git reset --hard" para descartar alterações.',
        hasConflicts: true
      };
    }
    return { success: false, message: 'Erro ao trocar de branch: ' + result.error };
  }
  
  return { success: true, message: `✓ Trocado para branch ${branchName}` };
}

// Enviar branch para GitHub
async function pushBranch(projectPath, branchName) {
  const result = await runCommand(`git push -u origin ${branchName}`, projectPath);
  
  if (!result.success && !result.error.includes('up-to-date')) {
    // Branch está atrás do remoto
    if (result.error.includes('non-fast-forward') || result.error.includes('behind')) {
      return { 
        success: false, 
        message: 'A branch local está atrás do remoto. Faça pull primeiro para sincronizar.',
        needsPull: true
      };
    }
    
    // Erro no servidor
    if (result.error.includes('remote rejected') || result.error.includes('remote unpack failed')) {
      return { 
        success: false, 
        message: 'Erro no servidor GitHub. Tente novamente em alguns segundos.',
        serverError: true
      };
    }
    
    return { success: false, message: 'Erro ao enviar branch: ' + result.error };
  }
  
  return { success: true, message: `✓ Branch ${branchName} enviada para GitHub` };
}

// Merge para main
async function mergeToMain(projectPath) {
  // 1. Obter branch atual
  const currentResult = await getCurrentBranch(projectPath);
  if (!currentResult.success) {
    return { success: false, message: 'Erro ao obter branch atual' };
  }
  
  const currentBranch = currentResult.branch;
  
  // 2. Se já estiver na main, apenas push
  if (currentBranch === 'main' || currentBranch === 'master') {
    const pushResult = await runCommand('git push origin main', projectPath);
    if (!pushResult.success) {
      return { success: false, message: 'Erro ao enviar para GitHub: ' + pushResult.error };
    }
    return { success: true, message: '✓ Alterações enviadas para main' };
  }
  
  // 3. Trocar para main
  const checkoutResult = await runCommand('git checkout main', projectPath);
  if (!checkoutResult.success) {
    return { success: false, message: 'Erro ao trocar para main: ' + checkoutResult.error };
  }
  
  // 4. Merge
  const mergeResult = await runCommand(`git merge ${currentBranch}`, projectPath);
  if (!mergeResult.success) {
    if (mergeResult.error.includes('CONFLICT')) {
      return { success: false, message: 'Conflito detectado. Resolva manualmente no projeto.' };
    }
    return { success: false, message: 'Erro ao fazer merge: ' + mergeResult.error };
  }
  
  // 5. Push
  const pushResult = await runCommand('git push origin main', projectPath);
  if (!pushResult.success) {
    return { success: false, message: 'Erro ao enviar para GitHub: ' + pushResult.error };
  }
  
  return { success: true, message: `✓ Branch ${currentBranch} mesclada com main e enviada para GitHub` };
}

module.exports = {
  listBranches,
  getCurrentBranch,
  createBranch,
  switchBranch,
  pushBranch,
  mergeToMain
};
