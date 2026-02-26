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

### 2. Seleção de Projeto
- Selecionar pasta ou arquivo ZIP
- Extração automática de ZIP
- Detecção automática de:
  - Repositório Git existente
  - Remote configurado
  - Branch main

### 3. Publicação
- **Criar novo repositório**: Inicializa Git, faz commit e cria repo no GitHub
- **Usar repositório existente**: Lista seus repos e conecta ao projeto

### 4. Gerenciamento de .gitignore
- Visualizar e editar .gitignore
- Adicionar padrões comuns automaticamente
- Commit automático após alterações

### 5. Gerenciamento de Branches
- Listar branches existentes
- Criar novas branches
- Trocar entre branches
- Enviar branches para GitHub

### 6. Merge para Main
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
│   ├── branchManager.js # Gerenciamento de branches
│   └── ignoreManager.js # Gerenciamento de .gitignore
└── package.json
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
