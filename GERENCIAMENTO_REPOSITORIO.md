# Gerenciamento de Repositório - Lynx Publisher

## 📡 Card de Repositório Atual

Quando você seleciona um projeto que já tem um repositório conectado, aparece um card azul mostrando:

```
📡 Repositório Atual

usuario/meu-projeto
https://github.com/usuario/meu-projeto.git
✓ Repositório ativo no GitHub
✓ Sincronizado

[Trocar Repositório]  [Desconectar]
```

---

## 🔄 Trocar de Repositório

### Quando usar:
- Quer conectar o projeto a outro repositório
- Mudou de conta no GitHub
- Quer usar um fork diferente

### Como fazer:

1. **Clique em "Trocar Repositório"**
   - O card atual desaparece
   - Aparece o formulário de publicação

2. **Escolha uma opção:**
   
   **Opção A: Criar novo repositório**
   ```
   ( ) Criar novo repositório
   Nome: novo-projeto
   [✓] Repositório privado
   [Criar e Publicar]
   ```
   
   **Opção B: Usar repositório existente**
   ```
   ( ) Usar repositório existente
   [Carregar Meus Repositórios]
   → Lista de repositórios aparece
   → Selecione um
   [Conectar Repositório]
   ```

3. **Resultado:**
   ```
   → Conectando ao repositório...
   ✓ Conectado e sincronizado com sucesso!
   ✓ Conectado ao repositório: usuario/outro-projeto
   
   [Card de Repositório Atual atualiza]
   ```

---

## 🔌 Desconectar Repositório

### Quando usar:
- Quer remover a conexão com o GitHub
- Vai configurar manualmente depois
- Quer começar do zero

### Como fazer:

1. **Clique em "Desconectar"**
   - Aparece confirmação:
   ```
   Deseja desconectar o repositório remoto?
   Você poderá conectar outro depois.
   [Cancelar] [OK]
   ```

2. **Confirme**
   ```
   → Desconectando repositório...
   ✓ Repositório desconectado
   → Agora você pode conectar a outro repositório
   ```

3. **Resultado:**
   - Card de repositório desaparece
   - Formulário de publicação aparece
   - Você pode conectar a outro repositório

---

## 📊 Status do Repositório

### ✓ Repositório OK
```
📡 Repositório Atual
usuario/projeto
✓ Repositório ativo no GitHub
✓ Sincronizado
```
**Significado:** Tudo certo, pode trabalhar normalmente

### ⚠️ Repositório com Divergências
```
📡 Repositório Atual
usuario/projeto
✓ Repositório ativo no GitHub
⚠️ Pode ter divergências
```
**Significado:** Local e remoto estão diferentes
**Ação:** Use "Sincronizar com Remoto" nas Ações Rápidas

### ✗ Repositório Não Encontrado
```
📡 Repositório Atual
usuario/projeto
✗ Repositório não encontrado no GitHub
```
**Significado:** O repositório foi deletado ou a URL está errada
**Ação:** Desconecte e conecte a outro repositório

---

## 🎯 Fluxos Completos

### Fluxo 1: Trocar para Repositório Existente

```
1. Selecionar projeto
   → 📡 Repositório Atual: usuario/projeto-antigo

2. Clicar em "Trocar Repositório"
   → Formulário aparece

3. Selecionar "Usar repositório existente"
   → Clicar em "Carregar Meus Repositórios"

4. Selecionar "usuario/projeto-novo"
   → Clicar em "Conectar Repositório"

5. Resultado:
   → ✓ Conectado ao repositório: usuario/projeto-novo
   → 📡 Repositório Atual: usuario/projeto-novo
```

### Fluxo 2: Trocar para Novo Repositório

```
1. Selecionar projeto
   → 📡 Repositório Atual: usuario/projeto-antigo

2. Clicar em "Trocar Repositório"
   → Formulário aparece

3. Selecionar "Criar novo repositório"
   → Nome: projeto-novo
   → [✓] Repositório privado

4. Clicar em "Criar e Publicar"

5. Resultado:
   → ✓ Repositório criado: usuario/projeto-novo
   → 📡 Repositório Atual: usuario/projeto-novo
```

### Fluxo 3: Desconectar e Reconectar

```
1. Selecionar projeto
   → 📡 Repositório Atual: usuario/projeto

2. Clicar em "Desconectar"
   → Confirmar

3. Resultado:
   → ✓ Repositório desconectado
   → Formulário de publicação aparece

4. Conectar a outro repositório
   → Seguir Fluxo 1 ou 2
```

---

## 💡 Dicas

### Quando Trocar de Repositório?

✓ **Sim, troque quando:**
- Mudou de conta no GitHub
- Quer usar um fork diferente
- Repositório antigo foi deletado
- Quer reorganizar seus projetos

✗ **Não troque se:**
- Só quer fazer push/pull (use Ações Rápidas)
- Quer criar uma branch (use aba Branches)
- Quer fazer merge (use aba Branches)

### Cuidados ao Trocar

⚠️ **Antes de trocar:**
1. Faça commit de todas as alterações
2. Faça push para não perder nada
3. Anote o nome do repositório antigo (se precisar voltar)

⚠️ **Depois de trocar:**
1. Verifique se conectou ao repositório certo
2. Faça pull para sincronizar
3. Teste fazendo um push

### Desconectar vs Trocar

**Desconectar:**
- Remove completamente a conexão
- Você escolhe o que fazer depois
- Mais controle

**Trocar:**
- Desconecta e conecta em uma ação
- Mais rápido
- Menos passos

---

## 🔍 Verificações Automáticas

Ao selecionar um projeto, o sistema verifica:

1. **Tem Git?**
   - Sim → Continua verificações
   - Não → Mostra opção de criar repositório

2. **Tem Remote?**
   - Sim → Verifica qual repositório
   - Não → Mostra opção de conectar

3. **Repositório existe no GitHub?**
   - Sim → Mostra card de Repositório Atual
   - Não → Mostra aviso e opção de trocar

4. **Está sincronizado?**
   - Sim → Mostra "✓ Sincronizado"
   - Não → Mostra "⚠️ Pode ter divergências"

---

## 📝 Exemplos Práticos

### Exemplo 1: Projeto com Repositório OK

```
Você abre: C:\projetos\meu-app

Sistema detecta:
→ Projeto carregado com sucesso
📡 Repositório remoto detectado: joao/meu-app
✓ Repositório existe no GitHub
✓ Projeto compatível com repositório remoto

Interface mostra:
┌─────────────────────────────────┐
│ 📡 Repositório Atual            │
│                                 │
│ joao/meu-app                    │
│ https://github.com/...          │
│ ✓ Repositório ativo no GitHub  │
│ ✓ Sincronizado                  │
│                                 │
│ [Trocar] [Desconectar]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🎯 Ações Rápidas                │
│ [Sincronizar] [Push]            │
└─────────────────────────────────┘
```

### Exemplo 2: Trocar para Outro Repositório

```
Situação: Você quer mudar de joao/app-antigo para joao/app-novo

Passos:
1. [Trocar Repositório]
2. ( ) Usar repositório existente
3. [Carregar Meus Repositórios]
4. Selecionar: joao/app-novo
5. [Conectar Repositório]

Resultado:
✓ Conectado ao repositório: joao/app-novo

Novo card:
┌─────────────────────────────────┐
│ 📡 Repositório Atual            │
│ joao/app-novo                   │
│ ✓ Repositório ativo no GitHub  │
└─────────────────────────────────┘
```

### Exemplo 3: Repositório Deletado

```
Você abre um projeto cujo repositório foi deletado:

Sistema detecta:
→ Projeto carregado com sucesso
⚠️ Remote configurado mas repositório não encontrado no GitHub

Interface mostra:
┌─────────────────────────────────┐
│ 📡 Repositório Atual            │
│                                 │
│ joao/projeto-deletado           │
│ https://github.com/...          │
│ ✗ Repositório não encontrado    │
│                                 │
│ [Trocar] [Desconectar]          │
└─────────────────────────────────┘

Ação recomendada:
1. [Desconectar] ou [Trocar]
2. Conectar a outro repositório
```

---

## 🚀 Resumo

- **Card de Repositório Atual**: Mostra qual repo está conectado
- **Trocar Repositório**: Conecta a outro repo facilmente
- **Desconectar**: Remove conexão completamente
- **Verificações Automáticas**: Sistema detecta problemas
- **Ações Rápidas**: Pull/Push direto quando tudo OK

Agora você tem controle total sobre qual repositório seu projeto está conectado! 🎉
