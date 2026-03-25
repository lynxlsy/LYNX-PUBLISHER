const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runCommand(command, cwd) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.stderr || error.message };
  }
}

async function gitInit(projectPath) {
  const result = await runCommand('git init', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao inicializar Git: ' + result.error };
  }
  
  return { success: true, message: '✓ Repositório Git inicializado' };
}

async function gitStatus(projectPath) {
  const result = await runCommand('git status', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao obter status: ' + result.error };
  }
  
  return { success: true, output: result.output };
}

async function gitAdd(projectPath, files = '.') {
  const result = await runCommand(`git add ${files}`, projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao adicionar arquivos: ' + result.error };
  }
  
  return { success: true, message: `✓ Arquivos adicionados: ${files}` };
}

async function gitCommit(projectPath, message) {
  // First, check if there are changes to commit
  const statusResult = await runCommand('git status --porcelain', projectPath);
  
  if (statusResult.success && !statusResult.output.trim()) {
    return { success: false, message: 'Nenhuma alteração para commitar. Todos os arquivos já foram commitados.' };
  }
  
  // Check if git user is configured
  const userCheck = await runCommand('git config user.name', projectPath);
  const emailCheck = await runCommand('git config user.email', projectPath);
  
  // If not configured, set default values
  if (!userCheck.success || !userCheck.output) {
    const setNameResult = await runCommand('git config user.name "Lynx Publisher User"', projectPath);
    if (!setNameResult.success) {
      return { success: false, message: 'Erro ao configurar nome do usuário Git: ' + setNameResult.error };
    }
  }
  
  if (!emailCheck.success || !emailCheck.output) {
    const setEmailResult = await runCommand('git config user.email "user@lynxpublisher.local"', projectPath);
    if (!setEmailResult.success) {
      return { success: false, message: 'Erro ao configurar email do usuário Git: ' + setEmailResult.error };
    }
  }
  
  // Escape double quotes in message
  const escapedMessage = message.replace(/"/g, '\\"');
  const result = await runCommand(`git commit -m "${escapedMessage}"`, projectPath);
  
  if (!result.success) {
    if (result.error.includes('nothing to commit')) {
      return { success: false, message: 'Nenhuma alteração para commitar' };
    }
    // Return full error details for debugging
    const errorDetails = result.error || result.output || 'Erro desconhecido';
    return { 
      success: false, 
      message: 'Erro ao fazer commit: ' + errorDetails,
      fullError: errorDetails
    };
  }
  
  return { success: true, message: '✓ Commit realizado com sucesso' };
}

async function configureGitUser(projectPath, username, email) {
  const nameResult = await runCommand(`git config user.name "${username}"`, projectPath);
  const emailResult = await runCommand(`git config user.email "${email}"`, projectPath);
  
  if (!nameResult.success || !emailResult.success) {
    return { success: false, message: 'Erro ao configurar usuário Git' };
  }
  
  return { success: true, message: '✓ Usuário Git configurado' };
}

async function gitPush(projectPath, force = false) {
  const forceFlag = force ? '--force' : '';
  const result = await runCommand(`git push origin HEAD ${forceFlag}`, projectPath);
  
  if (!result.success && !result.error.includes('up-to-date')) {
    return { success: false, message: 'Erro ao fazer push: ' + result.error };
  }
  
  return { success: true, message: '✓ Push realizado com sucesso' };
}

async function gitPull(projectPath) {
  const result = await runCommand('git pull origin HEAD', projectPath);
  
  if (!result.success) {
    if (result.error.includes('CONFLICT')) {
      return { success: false, message: 'Conflito detectado. Resolva manualmente.' };
    }
    return { success: false, message: 'Erro ao fazer pull: ' + result.error };
  }
  
  return { success: true, message: '✓ Pull realizado com sucesso' };
}

async function gitLog(projectPath, limit = 10) {
  const result = await runCommand(`git log --oneline -${limit}`, projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao obter histórico: ' + result.error };
  }
  
  return { success: true, output: result.output };
}

async function gitReset(projectPath) {
  const result = await runCommand('git reset --soft HEAD~1', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao fazer reset: ' + result.error };
  }
  
  return { success: true, message: '✓ Último commit desfeito (arquivos mantidos)' };
}

async function gitStash(projectPath) {
  const result = await runCommand('git stash', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao fazer stash: ' + result.error };
  }
  
  if (result.output.includes('No local changes')) {
    return { success: false, message: 'Nenhuma alteração para guardar' };
  }
  
  return { success: true, message: '✓ Alterações guardadas no stash' };
}

async function gitStashPop(projectPath) {
  const result = await runCommand('git stash pop', projectPath);
  
  if (!result.success) {
    if (result.error.includes('CONFLICT')) {
      return { success: false, message: 'Conflito ao recuperar stash. Resolva manualmente.' };
    }
    return { success: false, message: 'Erro ao recuperar stash: ' + result.error };
  }
  
  return { success: true, message: '✓ Alterações recuperadas do stash' };
}

async function getLastCommit(projectPath) {
  const result = await runCommand('git log -1 --pretty=format:"%h - %s (%an, %ar)"', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao obter último commit' };
  }
  
  if (!result.output) {
    return { success: true, commit: null };
  }
  
  const parts = result.output.match(/^(\w+) - (.+) \((.+), (.+)\)$/);
  if (parts) {
    return {
      success: true,
      commit: {
        hash: parts[1],
        message: parts[2],
        author: parts[3],
        date: parts[4]
      }
    };
  }
  
  return { success: true, commit: { message: result.output, author: '-', date: '-' } };
}

async function getSyncStatus(projectPath) {
  const fetchResult = await runCommand('git fetch', projectPath);
  
  if (!fetchResult.success) {
    return { success: false, message: 'Erro ao buscar informações do remoto' };
  }
  
  const statusResult = await runCommand('git rev-list --left-right --count HEAD...@{u}', projectPath);
  
  if (!statusResult.success) {
    return { success: false, message: 'Erro ao verificar sincronização' };
  }
  
  const [ahead, behind] = statusResult.output.split('\t').map(n => parseInt(n) || 0);
  
  return {
    success: true,
    ahead,
    behind,
    synced: ahead === 0 && behind === 0
  };
}

module.exports = {
  gitInit,
  gitStatus,
  gitAdd,
  gitCommit,
  gitPush,
  gitPull,
  gitLog,
  gitReset,
  gitStash,
  gitStashPop,
  getLastCommit,
  getSyncStatus,
  configureGitUser
};
