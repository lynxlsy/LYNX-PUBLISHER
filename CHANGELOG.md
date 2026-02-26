# Changelog - Lynx Publisher

## Versão 1.1.0 - Melhorias de UX

### ✨ Novas Funcionalidades

#### Indicador de Projeto no Header
- Mostra o projeto selecionado no topo da aplicação
- Exibe nome do projeto, caminho e status do Git
- Visível em todas as abas
- Atualiza automaticamente quando conecta a um repositório

#### Headers Informativos em Cada Seção
- Cada aba agora tem um header com:
  - Título da seção
  - Descrição do que faz
  - Projeto atual selecionado
- Avisos visuais quando nenhum projeto está selecionado

#### Logs Melhorados
- **Ícones visuais**: ✓ (sucesso), ✗ (erro), → (info)
- **Cores destacadas**: Verde, vermelho e azul com fundo
- **Bordas coloridas**: Identificação rápida do tipo de mensagem
- **Área de log mais visível**: Fundo escuro com borda
- **Mensagem inicial**: "Aguardando operações Git..."
- **Feedback detalhado**: Mensagens explicando próximos passos

#### Feedback Contextual
- Após `git init`: Sugere fazer `git add`
- Após `git add`: Sugere fazer commit
- Após `git commit`: Sugere fazer push
- Confirmações visuais em cada operação

### 🐛 Correções

#### Área de Logs
- **Corrigido**: Logs não apareciam na aba Git
- **Corrigido**: Estrutura HTML dos logs estava invertida
- **Corrigido**: Botão "Limpar" não funcionava corretamente

#### Indicadores de Projeto
- **Corrigido**: Projeto selecionado não era mostrado em outras abas
- **Corrigido**: Status do repositório não atualizava após conexão
- **Corrigido**: Falta de feedback visual sobre qual projeto está ativo

### 🎨 Melhorias Visuais

#### Logs
```
Antes: [1:20:30] Iniciando login no GitHub...
Agora:  → [1:20:30] Iniciando login no GitHub...
        ✓ [1:20:31] Login realizado com sucesso
```

#### Header do Projeto
```
📁 meu-projeto
C:\Users\...\meu-projeto
Git ✓ • Remote ✓ • Main ✓
```

#### Avisos de Projeto
```
⚠️ Selecione um projeto na aba "Publicar" primeiro
```

### 📝 Estrutura de Logs

Cada seção agora tem:
- Container com fundo escuro
- Header com título e botão "Limpar"
- Área de logs com scroll
- Altura mínima de 150px
- Altura máxima de 300px

### 🔄 Fluxo Melhorado

#### Antes
1. Selecionar projeto
2. Ir para aba Git
3. Clicar em git init
4. ❌ Nenhum feedback visível

#### Agora
1. Selecionar projeto
2. ✓ Indicador mostra projeto no header
3. Ir para aba Git
4. ✓ Header mostra qual projeto está ativo
5. Clicar em git init
6. ✓ Log mostra: "→ Inicializando repositório Git..."
7. ✓ Log mostra: "✓ Repositório Git inicializado"
8. ✓ Log mostra: "✓ Repositório Git pronto para uso!"
9. ✓ Log mostra: "→ Próximo passo: Adicionar arquivos com git add"
10. ✓ Indicador atualiza: "Git ✓"

### 🎯 Próximos Passos Sugeridos

O sistema agora guia o usuário:
- Após git init → Sugere git add
- Após git add → Sugere git commit
- Após git commit → Sugere git push
- Após criar repo → Mostra "Conectado: nome-repo ✓"

### 📦 Arquivos Modificados

- `index.html` - Estrutura de logs e headers
- `renderer.js` - Lógica de feedback e indicadores
- `CHANGELOG.md` - Este arquivo

### 🚀 Como Atualizar

```bash
# Feche o aplicativo completamente
# Execute novamente
npm start
```

### 💡 Dicas de Uso

1. **Sempre verifique o header** - Mostra qual projeto está ativo
2. **Leia os logs** - Eles guiam você nos próximos passos
3. **Use o botão "Limpar"** - Para limpar logs antigos
4. **Observe as cores**:
   - 🟢 Verde = Sucesso
   - 🔴 Vermelho = Erro
   - 🔵 Azul = Informação

---

## Versão 1.0.0 - Lançamento Inicial

### Funcionalidades
- Login GitHub via CLI
- Seleção de projeto (ZIP ou pasta)
- Publicação no GitHub
- Gerenciamento de .gitignore
- Gerenciamento de branches
- Operações Git completas
- Merge para main
