# Lynx Publisher

Interface visual para gerenciar publicação de projetos no GitHub usando Git e GitHub CLI.

## Pré-requisitos

Antes de executar o Lynx Publisher, certifique-se de ter instalado:

1. **Node.js** (v16 ou superior)
2. **Git** - [Download](https://git-scm.com/downloads)
3. **GitHub CLI (gh)** - [Download](https://cli.github.com/)

### Verificar instalação:

```bash
node --version
git --version
gh --version
```

## Instalação

```bash
npm install
```

## Executar

```bash
npm start
```

**IMPORTANTE**: Se você já tinha o aplicativo aberto, feche completamente e execute novamente para ver as últimas atualizações.

Para recarregar durante desenvolvimento: `Ctrl+R` na janela do aplicativo

## Funcionalidades

### 1. Login GitHub
- Botão para autenticar via GitHub CLI
- Indicador visual de status de login (🟢/🔴)
- **NOVO:** Mostra nome do usuário logado

### 2. Seleção de Projeto
- Selecionar pasta ou arquivo ZIP
- Extração automática de ZIP
- Detecção automática de:
  - Repositório Git existente
  - Remote configurado
  - Branch main
- **NOVO:** Detecção de repositório remoto no GitHub
- **NOVO:** Verificação de compatibilidade com remoto
- **NOVO:** Card de ações rápidas (Pull/Push)

### 3. Publicação
- **Criar novo repositório**: Inicializa Git, faz commit e cria repo no GitHub
- **Usar repositório existente**: Lista seus repos e conecta ao projeto

### 4. Operações Git (NOVO!)
- **git init**: Inicializar repositório
- **git status**: Ver status dos arquivos
- **git add**: Adicionar arquivos (todos ou específicos)
- **git commit**: Commits com tipos convencionais (feat, fix, docs, etc.)
- **git push/pull**: Enviar e baixar alterações
- **git log**: Ver histórico de commits
- **git reset**: Desfazer último commit
- **git stash**: Guardar/recuperar alterações temporárias
- **Force push**: Para casos avançados

### 5. Gerenciamento de .gitignore
- Visualizar e editar .gitignore
- Adicionar padrões comuns automaticamente
- Commit automático após alterações

### 6. Gerenciamento de Branches
- Listar branches existentes
- Criar novas branches
- Trocar entre branches
- Enviar branches para GitHub

### 7. Merge para Main
- Mescla branch atual com main
- Envia automaticamente para GitHub
- Detecta conflitos

## Estrutura do Projeto

```
lynx-publisher/
├── main.js              # Processo principal do Electron
├── preload.js           # Bridge seguro entre main e renderer
├── renderer.js          # Lógica da interface
├── index.html           # Interface visual
├── modules/
│   ├── gitManager.js    # Gerenciamento Git e GitHub
│   ├── gitOperations.js # Operações Git (add, commit, push, etc.)
│   ├── branchManager.js # Gerenciamento de branches
│   └── ignoreManager.js # Gerenciamento de .gitignore
├── package.json
├── README.md
├── COMO_USAR.md
├── GUIA_GIT.md          # Guia completo de operações Git
└── SOLUCAO_PROBLEMAS.md
```

## Tratamento de Erros

O sistema detecta e corrige automaticamente:

- `remote origin already exists` → Remove e recria
- `src refspec main does not match any` → Cria branch main
- `nothing to commit` → Mensagem amigável

## Uso Recomendado

Você pode colocar o Lynx Publisher dentro da pasta do seu projeto ou usá-lo para gerenciar qualquer projeto:

1. Execute o Lynx Publisher
2. Faça login no GitHub
3. Selecione a pasta do seu projeto
4. Gerencie branches, .gitignore e publique no GitHub

## Notas

- Projeto pessoal focado em simplicidade
- Não requer API direta do GitHub
- Interface escura e minimalista
- Logs traduzidos e simplificados
