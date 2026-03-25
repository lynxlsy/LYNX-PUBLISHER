# Lynx Publisher

Interface desktop para publicar e gerenciar projetos no GitHub sem precisar usar o terminal.

Feito com Electron + Node.js + GitHub CLI.

---

## O que faz

- Login no GitHub direto pelo app
- Seleciona pasta ou ZIP do projeto
- Cria repositório novo ou conecta a um existente
- Commit, push, pull sem abrir terminal
- Gerencia branches
- Edita .gitignore visualmente
- Detecta automaticamente se o projeto já tem Git/remote configurado

---

## Pré-requisitos

- [Node.js v16+](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- [GitHub CLI](https://cli.github.com/)

---

## Instalação

**Opção 1 — automática (Windows)**
```
install.bat
```

**Opção 2 — manual**
```bash
npm install
npm start
```

Veja o arquivo `INSTALACAO.txt` para mais detalhes.

---

## Estrutura

```
lynx-publisher/
├── main.js              # Processo principal Electron
├── preload.js           # Bridge main ↔ renderer
├── renderer.js          # Lógica da interface
├── index.html           # Interface
├── modules/
│   ├── gitManager.js    # Git e GitHub
│   ├── gitOperations.js # Operações Git
│   ├── branchManager.js # Branches
│   └── ignoreManager.js # .gitignore
├── install.bat          # Instalação automática
├── start.bat            # Iniciar o app
└── INSTALACAO.txt       # Guia de instalação
```

---

## Licença

MIT
