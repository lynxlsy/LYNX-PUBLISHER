# Guia de Operações Git - Lynx Publisher

## Fluxo Básico de Trabalho

### 1. Inicializar Repositório
```
Aba: Git → git init
```
Cria um repositório Git no projeto (apenas primeira vez).

### 2. Ver Status
```
Aba: Git → Ver Status
```
Mostra quais arquivos foram modificados, adicionados ou deletados.

### 3. Adicionar Arquivos
```
Aba: Git → Adicionar Arquivos
```
Opções:
- **Todos os arquivos**: Adiciona tudo (git add .)
- **Arquivo específico**: Adiciona apenas um arquivo

### 4. Fazer Commit
```
Aba: Git → Commit
```
Tipos de commit disponíveis:
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alteração em documentação
- **style**: Formatação de código
- **refactor**: Refatoração sem mudar funcionalidade
- **test**: Adição ou correção de testes
- **chore**: Tarefas de manutenção
- **custom**: Mensagem personalizada

### 5. Enviar para GitHub
```
Aba: Git → Push
```
Envia seus commits para o GitHub.

---

## Workflows Comuns

### Workflow 1: Primeira Publicação

```
1. Selecionar projeto (Aba: Publicar)
2. git init (se necessário)
3. Adicionar todos os arquivos
4. Commit: "feat: initial commit"
5. Criar repositório no GitHub (Aba: Publicar)
```

### Workflow 2: Alterações Diárias

```
1. Fazer alterações no código
2. Ver Status (verificar o que mudou)
3. Adicionar todos os arquivos
4. Commit com mensagem descritiva
5. Push
```

### Workflow 3: Trabalhar com Branches

```
1. Criar nova branch (Aba: Branches)
2. Fazer alterações
3. git add .
4. git commit
5. Push da branch
6. Quando pronto: Merge para main
```

### Workflow 4: Sincronizar com Remoto

```
1. Pull (baixar alterações)
2. Resolver conflitos se houver
3. Fazer suas alterações
4. git add .
5. git commit
6. Push
```

---

## Tipos de Commit (Conventional Commits)

### feat: Nova Funcionalidade
```
feat: adicionar sistema de login
feat: implementar carrinho de compras
feat: criar página de perfil
```

### fix: Correção de Bug
```
fix: corrigir erro no formulário
fix: resolver problema de autenticação
fix: ajustar layout mobile
```

### docs: Documentação
```
docs: atualizar README
docs: adicionar comentários no código
docs: criar guia de instalação
```

### style: Formatação
```
style: formatar código com prettier
style: ajustar indentação
style: remover espaços em branco
```

### refactor: Refatoração
```
refactor: simplificar função de validação
refactor: reorganizar estrutura de pastas
refactor: melhorar performance do algoritmo
```

### test: Testes
```
test: adicionar testes unitários
test: corrigir teste quebrado
test: aumentar cobertura de testes
```

### chore: Manutenção
```
chore: atualizar dependências
chore: configurar eslint
chore: adicionar .gitignore
```

---

## Operações Avançadas

### Reset (Desfazer Commit)
```
Aba: Git → Reset
```
Desfaz o último commit, mas mantém as alterações nos arquivos.

**Quando usar:**
- Cometeu erro na mensagem do commit
- Esqueceu de adicionar um arquivo
- Quer refazer o commit

**Atenção:** Só funciona se ainda não fez push!

### Stash (Guardar Alterações)
```
Aba: Git → Stash
```
Guarda suas alterações temporariamente sem fazer commit.

**Quando usar:**
- Precisa trocar de branch mas tem alterações não commitadas
- Quer testar algo sem perder o trabalho atual
- Precisa fazer pull mas tem alterações locais

### Stash Pop (Recuperar Alterações)
```
Aba: Git → Stash Pop
```
Recupera as alterações guardadas no stash.

### Force Push ⚠️
```
Aba: Git → Push → Marcar "Force push"
```
Força o envio, sobrescrevendo o histórico remoto.

**Quando usar:**
- Fez rebase local
- Corrigiu histórico de commits
- Tem certeza absoluta do que está fazendo

**CUIDADO:** Pode apagar trabalho de outras pessoas!

---

## Histórico de Commits

```
Aba: Git → Ver Histórico
```
Mostra os últimos commits com:
- Hash do commit
- Mensagem
- Autor
- Data

---

## Exemplos Práticos

### Exemplo 1: Adicionar Nova Feature

```
1. Criar branch: feature/login
2. Fazer alterações no código
3. git add .
4. Commit: "feat: implementar sistema de login"
5. Push da branch
6. Merge para main quando pronto
```

### Exemplo 2: Corrigir Bug Urgente

```
1. Criar branch: fix/bug-critico
2. Corrigir o bug
3. git add .
4. Commit: "fix: corrigir erro de segurança"
5. Push
6. Merge para main imediatamente
```

### Exemplo 3: Atualizar Documentação

```
1. Editar README.md
2. git add README.md
3. Commit: "docs: atualizar instruções de instalação"
4. Push
```

### Exemplo 4: Refatorar Código

```
1. Criar branch: refactor/cleanup
2. Refatorar código
3. git add .
4. Commit: "refactor: simplificar lógica de validação"
5. Testar tudo
6. Push e merge
```

---

## Dicas e Boas Práticas

### Commits

✓ **Faça commits pequenos e frequentes**
- Melhor: 10 commits pequenos
- Pior: 1 commit gigante

✓ **Use mensagens descritivas**
- Bom: "feat: adicionar validação de email"
- Ruim: "update"

✓ **Commit código que funciona**
- Sempre teste antes de commitar
- Não commite código quebrado

### Branches

✓ **Use branches para features**
- main: código estável
- feature/nome: novas funcionalidades
- fix/nome: correções

✓ **Mantenha branches atualizadas**
- Faça merge da main regularmente
- Evite branches muito antigas

### Push/Pull

✓ **Pull antes de Push**
- Sempre baixe alterações antes de enviar
- Evita conflitos

✓ **Não use force push em branches compartilhadas**
- Apenas em branches pessoais
- Pode apagar trabalho de outros

### Geral

✓ **Configure .gitignore**
- Não commite node_modules/
- Não commite .env
- Não commite arquivos temporários

✓ **Revise antes de commitar**
- Use "Ver Status" para verificar
- Certifique-se do que está commitando

✓ **Faça backup**
- Push regularmente
- Não deixe trabalho só local

---

## Atalhos Rápidos

### Commit Rápido (tudo de uma vez)
```
1. git add . (Adicionar todos)
2. git commit (com mensagem)
3. git push
```

### Desfazer Alterações Locais
```
1. git stash (guardar)
2. Fazer outra coisa
3. git stash pop (recuperar)
```

### Ver o que mudou
```
1. Ver Status
2. Ver Histórico
```

---

## Solução de Problemas

### "Nenhuma alteração para commitar"
- Você não modificou nenhum arquivo
- Ou esqueceu de fazer git add

### "Conflito detectado"
- Alguém alterou o mesmo arquivo
- Resolva manualmente no editor
- Depois: git add → git commit → git push

### "Push rejeitado"
- Faça git pull primeiro
- Resolva conflitos se houver
- Tente push novamente

### "Não consigo trocar de branch"
- Você tem alterações não commitadas
- Faça commit ou stash primeiro
