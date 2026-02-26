# Correção: Erro "src refspec main does not match any"

## 🐛 Problema

Ao conectar a um repositório existente, aparecia o erro:
```
✗ Erro ao enviar para GitHub: error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/...'
```

## 🔍 Causa

O erro acontecia porque:
1. O projeto local não tinha nenhuma branch criada
2. Ou a branch atual não se chamava "main"
3. O sistema tentava fazer push de uma branch que não existia

## ✅ Solução Implementada

### 1. Verificação de Branch

Agora o sistema verifica se existe branch local:
```javascript
const branchResult = await runCommand('git branch', projectPath);
const hasBranch = branchResult.output.length > 0;
```

### 2. Criação Automática de Branch

Se não existir branch:
```javascript
if (!hasBranch) {
  // Criar branch main
  await runCommand('git checkout -b main', projectPath);
} else {
  // Renomear branch atual para main
  await runCommand('git branch -M main', projectPath);
}
```

### 3. Verificação de Arquivos

Antes de commitar, verifica se há arquivos:
```javascript
const statusResult = await runCommand('git status --porcelain', projectPath);
const hasChanges = statusResult.output.length > 0;
```

### 4. Pull com Históricos Não Relacionados

Tenta sincronizar com o remoto primeiro:
```javascript
await runCommand('git pull origin main --allow-unrelated-histories', projectPath);
```

### 5. Tratamento de Divergências

Se houver conflito:
```javascript
if (pushResult.error.includes('non-fast-forward')) {
  return { 
    success: false, 
    message: 'Há divergências com o remoto. Use "git pull" na aba Git para sincronizar primeiro.' 
  };
}
```

---

## 🔄 Fluxo Corrigido

### Conectar a Repositório Existente

```
1. Inicializar Git (se necessário)
   → git init

2. Remover remote antigo (se existir)
   → git remote remove origin

3. Adicionar novo remote
   → git remote add origin URL

4. Verificar se há arquivos para commitar
   → git status --porcelain

5. Se houver arquivos:
   → git add .
   → git commit -m "initial commit"

6. Verificar se existe branch
   → git branch

7. Se não existir:
   → git checkout -b main
   Senão:
   → git branch -M main

8. Tentar pull primeiro
   → git pull origin main --allow-unrelated-histories

9. Push
   → git push -u origin main

10. Se houver divergências:
    → Mostrar mensagem clara
    → Sugerir usar git pull na aba Git
```

### Criar Novo Repositório

```
1. Inicializar Git (se necessário)
   → git init

2. Verificar se há arquivos
   → git status --porcelain

3. Se não houver:
   → Erro: "Adicione arquivos primeiro"

4. Adicionar arquivos
   → git add .

5. Commit
   → git commit -m "initial commit"

6. Verificar/criar branch main
   → git branch
   → git checkout -b main (se não existir)
   → git branch -M main (se existir)

7. Criar repositório no GitHub
   → gh repo create nome --public/--private --source=. --remote=origin --push

8. Tratamento de erros específicos:
   - Remote já existe → Remove e tenta novamente
   - Repositório já existe → Mensagem clara
```

---

## 📝 Mensagens Melhoradas

### Antes
```
✗ Erro ao enviar para GitHub: error: src refspec main does not match any
```

### Agora

**Sem arquivos:**
```
✗ Nenhuma alteração detectada no projeto. Adicione arquivos primeiro.
```

**Divergências:**
```
✗ Há divergências com o remoto. Use "git pull" na aba Git para sincronizar primeiro.
→ Dica: Vá para aba Git e use "git pull" para sincronizar
```

**Repositório já existe:**
```
✗ Repositório já existe no GitHub. Use "Conectar a repositório existente" ou escolha outro nome.
```

**Sucesso:**
```
✓ Conectado e sincronizado com sucesso!
✓ Conectado ao repositório: usuario/projeto
→ Você pode usar as Ações Rápidas para sincronizar
```

---

## 🎯 Casos de Uso

### Caso 1: Projeto Novo (Sem Git)

```
Situação: Pasta com arquivos, sem Git

Fluxo:
1. Selecionar projeto
2. Criar novo repositório
3. Sistema:
   → Inicializa Git
   → Cria branch main
   → Faz commit
   → Cria repo no GitHub
   → Push

Resultado: ✓ Sucesso
```

### Caso 2: Projeto com Git (Sem Branch)

```
Situação: Pasta com .git mas sem commits

Fluxo:
1. Selecionar projeto
2. Conectar a repositório existente
3. Sistema:
   → Detecta que não tem branch
   → Cria branch main
   → Faz commit dos arquivos
   → Conecta ao remoto
   → Push

Resultado: ✓ Sucesso
```

### Caso 3: Projeto com Branch Diferente

```
Situação: Projeto com branch "master" ou "develop"

Fluxo:
1. Selecionar projeto
2. Conectar a repositório existente
3. Sistema:
   → Detecta branch existente
   → Renomeia para main
   → Conecta ao remoto
   → Push

Resultado: ✓ Sucesso
```

### Caso 4: Repositório Remoto Tem Commits

```
Situação: Repositório no GitHub já tem código

Fluxo:
1. Selecionar projeto
2. Conectar a repositório existente
3. Sistema:
   → Tenta pull primeiro
   → Mescla históricos
   → Push

Se houver conflitos:
   → Mensagem clara
   → Sugere usar git pull manual
```

---

## 🛠️ Como Testar

### Teste 1: Projeto Novo
```
1. Criar pasta nova com arquivos
2. Abrir Lynx Publisher
3. Selecionar pasta
4. Criar novo repositório
5. Verificar: ✓ Sucesso
```

### Teste 2: Conectar a Existente
```
1. Criar pasta nova com arquivos
2. Abrir Lynx Publisher
3. Selecionar pasta
4. Conectar a repositório existente
5. Escolher repositório da lista
6. Verificar: ✓ Sucesso
```

### Teste 3: Repositório com Código
```
1. Clonar repositório existente
2. Fazer alterações
3. Abrir Lynx Publisher
4. Sistema detecta repositório
5. Usar Ações Rápidas
6. Verificar: ✓ Sincronizado
```

---

## 💡 Dicas

### Se Ainda Houver Erro

1. **Verifique se há arquivos no projeto**
   - Pasta vazia não pode ser commitada
   - Adicione pelo menos um arquivo

2. **Use a aba Git para diagnóstico**
   - Clique em "Ver Status"
   - Veja o que está acontecendo

3. **Tente pull manual primeiro**
   - Vá para aba Git
   - Clique em "Pull"
   - Depois tente conectar novamente

4. **Verifique o repositório no GitHub**
   - Acesse github.com
   - Veja se o repositório existe
   - Veja se tem código lá

### Prevenção

✓ **Sempre tenha arquivos no projeto antes de conectar**
✓ **Use "Ver Status" na aba Git para verificar**
✓ **Leia as mensagens de erro - elas são claras agora**
✓ **Use pull antes de push quando houver divergências**

---

## 🚀 Resumo

**Antes:**
- Erro confuso
- Não criava branch automaticamente
- Não verificava arquivos
- Não tratava divergências

**Agora:**
- Cria branch main automaticamente
- Verifica arquivos antes de commitar
- Tenta pull antes de push
- Mensagens claras e acionáveis
- Sugere próximos passos

O sistema agora é muito mais robusto e amigável! 🎉
