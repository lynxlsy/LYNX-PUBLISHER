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

// Git init
async function gitInit(projectPath) {
  const result = await runCommand('git init', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao inicializar Git: ' + result.error };
  }
  
  return { success: true, message: '✓ Repositório Git inicializado' };
}

// Git status
async function gitStatus(projectPath) {
  const result = await runCommand('git status', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao obter status: ' + result.error };
  }
  
  return { success: true, output: result.output };
}

// Git add
async function gitAdd(projectPath, files = '.') {
  const result = await runCommand(`git add ${files}`, projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao adicionar arquivos: ' + result.error };
  }
  
  return { success: true, message: `✓ Arquivos adicionados: ${files}` };
}

// Git commit
async function gitCommit(projectPath, message) {
  const result = await runCommand(`git commit -m "${message}"`, projectPath);
  
  if (!result.success) {
    if (result.error.includes('nothing to commit')) {
      return { success: false, message: 'Nenhuma alteração para commitar' };
    }
    return { success: false, message: 'Erro ao fazer commit: ' + result.error };
  }
  
  return { success: true, message: '✓ Commit realizado com sucesso' };
}

// Git push
async function gitPush(projectPath, force = false) {
  const forceFlag = force ? '--force' : '';
  const result = await runCommand(`git push origin HEAD ${forceFlag}`, projectPath);
  
  if (!result.success && !result.error.includes('up-to-date')) {
    return { success: false, message: 'Erro ao fazer push: ' + result.error };
  }
  
  return { success: true, message: '✓ Push realizado com sucesso' };
}

// Git pull
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

// Git log
async function gitLog(projectPath, limit = 10) {
  const result = await runCommand(`git log --oneline -${limit}`, projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao obter histórico: ' + result.error };
  }
  
  return { success: true, output: result.output };
}

// Git reset
async function gitReset(projectPath) {
  const result = await runCommand('git reset --soft HEAD~1', projectPath);
  
  if (!result.success) {
    return { success: false, message: 'Erro ao fazer reset: ' + result.error };
  }
  
  return { success: true, message: '✓ Último commit desfeito (arquivos mantidos)' };
}

// Git stash
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

// Git stash pop
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
  gitStashPop
};
