# Como Usar o Lynx Publisher

## Passo a Passo

### 1. Primeira Execução

```bash
npm start
```

### 2. Login no GitHub

1. Clique no botão **"Login GitHub"** no canto superior direito
2. Uma janela do terminal será aberta
3. Siga as instruções para autenticar
4. O indicador mudará para 🟢 quando logado

### 3. Selecionar Projeto

1. Clique em **"Selecionar ZIP ou Pasta"**
2. Escolha:
   - Uma pasta do seu projeto
   - Um arquivo ZIP (será extraído automaticamente)
3. O sistema mostrará informações sobre o projeto:
   - Se já tem Git inicializado
   - Se tem remote configurado
   - Se tem branch main

### 4. Publicar no GitHub

#### Opção A: Criar Novo Repositório

1. Selecione **"Criar novo repositório"**
2. Digite o nome do repositório
3. Marque **"Repositório privado"** se desejar
4. Clique em **"Criar e Publicar"**

O sistema irá:
- Inicializar Git (se necessário)
- Adicionar todos os arquivos
- Fazer commit inicial
- Criar repositório no GitHub
- Enviar código

#### Opção B: Usar Repositório Existente

1. Selecione **"Usar repositório existente"**
2. Clique em **"Carregar Meus Repositórios"**
3. Selecione um repositório da lista
4. Clique em **"Conectar Repositório"**

### 5. Gerenciar .gitignore

1. Vá para a aba **".gitignore"**
2. Edite o conteúdo diretamente
3. Ou clique em **"Adicionar Padrões Comuns"** para adicionar:
   - node_modules/
   - .env
   - dist/
   - build/
   - *.log
   - E outros padrões úteis
4. Clique em **"Salvar .gitignore"**

### 6. Trabalhar com Branches

1. Vá para a aba **"Branches"**
2. Veja todas as branches existentes
3. Para criar nova branch:
   - Digite o nome (ex: `feature/nova-funcionalidade`)
   - Clique em **"Criar Branch"**
4. Para trocar de branch:
   - Clique em **"Trocar"** na branch desejada
5. Para enviar branch para GitHub:
   - Clique em **"Push"** na branch

### 7. Enviar Alterações para Main

1. Faça suas alterações no projeto
2. Vá para a aba **"Branches"**
3. Clique em **"Enviar Alterações para Main"**

O sistema irá:
- Verificar branch atual
- Trocar para main (se necessário)
- Fazer merge da sua branch
- Enviar para GitHub
- Avisar se houver conflitos

## Fluxo de Trabalho Recomendado

### Para Novo Projeto

```
1. Criar pasta do projeto
2. Abrir Lynx Publisher
3. Login GitHub
4. Selecionar pasta
5. Criar novo repositório
6. Configurar .gitignore
7. Começar a trabalhar!
```

### Para Projeto Existente

```
1. Abrir Lynx Publisher
2. Login GitHub
3. Selecionar pasta do projeto
4. Conectar a repositório existente
5. Gerenciar branches conforme necessário
```

### Workflow com Branches

```
1. Criar branch para nova feature
2. Trabalhar na feature
3. Fazer commits normalmente (fora do Lynx)
4. Quando pronto, usar "Enviar Alterações para Main"
5. Criar nova branch para próxima feature
```

## Dicas

- **Logs**: Todos os logs aparecem na parte inferior de cada seção
- **Cores**: 
  - 🟢 Verde = Sucesso
  - 🔴 Vermelho = Erro
  - 🔵 Azul = Informação
- **Commits**: O Lynx faz commits automáticos em algumas operações
- **Conflitos**: Se houver conflito no merge, resolva manualmente no seu editor

## Comandos Git Equivalentes

O Lynx Publisher executa estes comandos por você:

```bash
# Login
gh auth login

# Criar repositório
git init
git add .
git commit -m "backup"
gh repo create nome --public --source=. --remote=origin --push

# Branches
git branch                    # Listar
git checkout -b nome          # Criar
git checkout nome             # Trocar
git push -u origin nome       # Enviar

# Merge
git checkout main
git merge nome-da-branch
git push origin main
```

## Solução de Problemas

### "Erro ao criar repositório"
- Verifique se está logado no GitHub
- Verifique se o nome do repositório já existe

### "Conflito detectado"
- Abra o projeto no seu editor
- Resolva os conflitos manualmente
- Faça commit das resoluções

### "Nenhuma alteração detectada"
- Certifique-se de ter arquivos no projeto
- Verifique se os arquivos não estão no .gitignore
