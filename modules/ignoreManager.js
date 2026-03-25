const fs = require('fs');
const path = require('path');
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

async function getGitignore(projectPath) {
  const gitignorePath = path.join(projectPath, '.gitignore');
  
  try {
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      return { success: true, content };
    } else {
      return { success: true, content: '' };
    }
  } catch (error) {
    return { success: false, message: 'Erro ao ler .gitignore: ' + error.message };
  }
}

async function saveGitignore(projectPath, content) {
  const gitignorePath = path.join(projectPath, '.gitignore');
  
  try {
    fs.writeFileSync(gitignorePath, content, 'utf8');
    
    if (fs.existsSync(path.join(projectPath, '.git'))) {
      await runCommand('git add .gitignore', projectPath);
      await runCommand('git commit -m "update gitignore"', projectPath);
    }
    
    return { success: true, message: '✓ .gitignore salvo com sucesso' };
  } catch (error) {
    return { success: false, message: 'Erro ao salvar .gitignore: ' + error.message };
  }
}

async function addCommonPatterns(projectPath) {
  const commonPatterns = `
# Dependencies
node_modules/
vendor/

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
out/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
*.tmp
`;

  const currentResult = await getGitignore(projectPath);
  let content = currentResult.content || '';
  
  const lines = content.split('\n');
  const newPatterns = commonPatterns.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !lines.includes(trimmed);
  });
  
  if (newPatterns.length > 0) {
    content += '\n' + newPatterns.join('\n');
  }
  
  const saveResult = await saveGitignore(projectPath, content);
  
  if (saveResult.success) {
    return { success: true, content, message: '✓ Padrões comuns adicionados' };
  }
  
  return saveResult;
}

module.exports = {
  getGitignore,
  saveGitignore,
  addCommonPatterns
};
