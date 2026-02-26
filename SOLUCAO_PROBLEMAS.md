# Solução de Problemas - Lynx Publisher

## Problema: Múltiplos logs "Iniciando login no GitHub..."

### Causa
Você estava clicando múltiplas vezes no botão antes da correção ser aplicada.

### Solução
1. **Feche completamente o aplicativo** (Ctrl+Q ou feche todas as janelas)
2. Execute novamente: `npm start`
3. Agora o botão ficará desabilitado durante o processo
4. Use o botão "Limpar" nos logs para remover entradas antigas

---

## Problema: Botão de login não responde

### Causa
O comando `gh auth login` precisa de interação do usuário.

### Solução
1. Clique em "Login GitHub"
2. Uma janela de terminal CMD será aberta
3. Siga as instruções no terminal:
   - Escolha "Login with a web browser"
   - Copie o código mostrado
   - Pressione Enter
   - Cole o código no navegador
   - Autorize o acesso
4. Feche a janela do terminal
5. O status será atualizado automaticamente

---

## Problema: Status não atualiza após login

### Solução
1. Clique novamente no botão "Login GitHub"
2. Ou recarregue o aplicativo (Ctrl+R)
3. O status será verificado automaticamente

---

## Problema: "gh: command not found"

### Causa
GitHub CLI não está instalado ou não está no PATH.

### Solução
1. Instale o GitHub CLI: https://cli.github.com/
2. No Windows, baixe o instalador MSI
3. Após instalar, reinicie o terminal
4. Verifique: `gh --version`
5. Reinicie o Lynx Publisher

---

## Problema: "git: command not found"

### Causa
Git não está instalado.

### Solução
1. Instale o Git: https://git-scm.com/downloads
2. Durante instalação, marque "Add to PATH"
3. Reinicie o computador
4. Verifique: `git --version`

---

## Problema: Erro ao criar repositório

### Possíveis causas e soluções

#### "Repository already exists"
- O nome já está em uso na sua conta GitHub
- Escolha outro nome ou delete o repositório existente no GitHub

#### "Not logged in"
- Faça login primeiro usando o botão "Login GitHub"
- Verifique se o indicador está 🟢

#### "Permission denied"
- Verifique suas permissões no GitHub
- Tente fazer logout e login novamente: `gh auth logout` e depois login

---

## Problema: Erro ao fazer push

### "failed to push some refs"

**Solução 1: Pull primeiro**
```bash
cd seu-projeto
git pull origin main --rebase
git push origin main
```

**Solução 2: Force push (cuidado!)**
```bash
git push origin main --force
```

---

## Problema: Conflitos no merge

### Sintoma
Mensagem: "Conflito detectado. Resolva manualmente no projeto."

### Solução
1. Abra o projeto no seu editor de código
2. Procure por arquivos com marcadores de conflito:
   ```
   <<<<<<< HEAD
   código da main
   =======
   código da sua branch
   >>>>>>> sua-branch
   ```
3. Edite os arquivos, escolhendo qual código manter
4. Remova os marcadores `<<<<<<<`, `=======`, `>>>>>>>`
5. No terminal do projeto:
   ```bash
   git add .
   git commit -m "resolve conflicts"
   git push origin main
   ```

---

## Problema: .gitignore não funciona

### Causa
Arquivos já foram commitados antes de adicionar ao .gitignore.

### Solução
```bash
cd seu-projeto
git rm -r --cached .
git add .
git commit -m "update gitignore"
git push
```

---

## Problema: Branch não aparece no GitHub

### Solução
1. Vá para aba "Branches"
2. Clique em "Push" na branch desejada
3. Ou no terminal:
   ```bash
   git push -u origin nome-da-branch
   ```

---

## Problema: Aplicativo não abre

### Solução 1: Reinstalar dependências
```bash
rm -rf node_modules
npm install
npm start
```

### Solução 2: Verificar Node.js
```bash
node --version
```
Deve ser v16 ou superior. Se não, atualize o Node.js.

---

## Problema: Logs muito longos

### Solução
- Clique no botão "Limpar" em cada seção de logs
- Ou recarregue o aplicativo (Ctrl+R)

---

## Dicas Gerais

1. **Sempre verifique o status de login** antes de fazer operações
2. **Leia os logs** - eles mostram exatamente o que está acontecendo
3. **Use o terminal** - Se algo não funcionar no Lynx, você pode fazer manualmente
4. **Faça backup** - Antes de operações importantes, faça backup do projeto
5. **Teste em projeto vazio** - Se tiver dúvidas, teste primeiro em um projeto de teste

---

## Ainda com problemas?

1. Verifique os logs no aplicativo
2. Tente executar os comandos manualmente no terminal
3. Verifique se Git e GitHub CLI estão instalados corretamente
4. Reinicie o aplicativo
5. Em último caso, use Git e GitHub CLI diretamente no terminal

---

## Comandos úteis para debug

```bash
# Verificar instalações
node --version
git --version
gh --version

# Verificar login GitHub
gh auth status

# Ver status do Git
git status
git remote -v
git branch

# Ver logs do Git
git log --oneline -10
```
